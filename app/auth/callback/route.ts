import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { oauthServerRedirectOrigin } from '@/lib/oauth-redirect-origin'

export const dynamic = 'force-dynamic'

/**
 * OAuth / magic-link redirect target.
 *
 * IMPORTANT (Next.js App Router): Session cookies MUST be attached to the
 * `NextResponse` you return. Using `cookies().set()` alone often does NOT
 * propagate auth cookies correctly on redirects — PKCE verifier + JWT chunks
 * never reach the browser, so `/auth/resolve` thinks you're logged out.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const origin = oauthServerRedirectOrigin(request)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [CALLBACK] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return NextResponse.redirect(new URL('/login?error=missing_supabase_env', origin))
  }

  if (error) {
    console.error('❌ [CALLBACK] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, origin)
    )
  }

  if (code) {
    const redirectOnSuccess = NextResponse.redirect(new URL('/auth/resolve', origin), {
      status: 307,
    })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            redirectOnSuccess.cookies.set(name, value, options)
          )
        },
      },
    })

    console.log('🔄 [CALLBACK] Exchanging OAuth code for session (PKCE)')
    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('❌ [CALLBACK] exchangeCodeForSession failed:', exchangeError.message)
      const fail = NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, origin)
      )
      return fail
    }

    console.log('✅ [CALLBACK] Session exchanged:', {
      hasSession: !!sessionData?.session,
      userId: sessionData?.session?.user?.id,
    })

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { error: upsertError } = await supabase.from('user_profiles').upsert(
          {
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name || user.user_metadata?.name || null,
            onboarding_completed: false,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )
        if (upsertError) {
          console.warn('⚠️ [CALLBACK] Profile upsert (non-blocking):', upsertError.message)
        }
      }
    } catch (e) {
      console.warn('⚠️ [CALLBACK] Profile bootstrap (ignored):', e)
    }

    return redirectOnSuccess
  }

  console.log('🔄 [CALLBACK] No code — sending client to resolver')
  return NextResponse.redirect(new URL('/auth/resolve', origin), { status: 307 })
}
