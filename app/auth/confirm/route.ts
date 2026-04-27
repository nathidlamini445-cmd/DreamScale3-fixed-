import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'

/**
 * Cross-device magic-link verification endpoint.
 *
 * The magic-link email button points here with `?token_hash=...&type=email&next=...`.
 * Unlike the PKCE `/auth/callback` flow, the token-hash flow does NOT require a
 * `code_verifier` cookie on the verifying device, so the email link can be opened
 * on any device (phone, tablet, different browser) and still complete sign-in.
 *
 * On success: sets the session cookies on this device and redirects to `next`
 * (the value originally passed as `emailRedirectTo` in `signInWithOtp`), which is
 * `/auth/resolve` — that page then routes the user to onboarding or the welcome
 * greeting → dashboard.
 *
 * On failure: redirects to /login with a friendly error message.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const nextRaw = requestUrl.searchParams.get('next')

  // Sanitize `next` to prevent open-redirect: only allow same-origin paths.
  const next = (() => {
    if (!nextRaw) return '/auth/resolve'
    try {
      const candidate = new URL(nextRaw, requestUrl.origin)
      if (candidate.origin !== requestUrl.origin) return '/auth/resolve'
      return candidate.pathname + candidate.search + candidate.hash
    } catch {
      return '/auth/resolve'
    }
  })()

  if (!token_hash || !type) {
    console.warn('🔐 [CONFIRM] Missing token_hash or type in magic-link URL')
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Invalid or incomplete sign-in link.')}`, request.url)
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore when called from a context that can't set cookies.
          }
        },
      },
    }
  )

  console.log('🔐 [CONFIRM] Verifying magic-link token (token_hash flow, cross-device safe)')
  const { error } = await supabase.auth.verifyOtp({ type, token_hash })

  if (error) {
    console.error('❌ [CONFIRM] verifyOtp failed:', error.message)
    const friendly =
      error.message?.toLowerCase().includes('expired')
        ? 'This sign-in link has expired. Please request a new one.'
        : error.message?.toLowerCase().includes('invalid')
          ? 'This sign-in link is invalid or has already been used.'
          : `Sign-in failed: ${error.message}`
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(friendly)}`, request.url)
    )
  }

  console.log('✅ [CONFIRM] Magic-link verified, redirecting to:', next)
  return NextResponse.redirect(new URL(next, request.url), { status: 307 })
}
