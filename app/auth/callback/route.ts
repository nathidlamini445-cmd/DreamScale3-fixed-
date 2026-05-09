import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('❌ [CALLBACK] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  // Handle OAuth code exchange with PKCE
  if (code) {
    const cookieStore = await cookies()

    // Create Supabase client using @supabase/ssr (handles PKCE cookies automatically)
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
              // Ignore if called from middleware
            }
          },
        },
      }
    )
    
    console.log('🔄 [CALLBACK] Exchanging OAuth code for session (PKCE flow with @supabase/ssr)')
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('❌ [CALLBACK] Error exchanging code for session:', exchangeError)
      console.error('❌ [CALLBACK] Error details:', {
        message: exchangeError.message,
        status: exchangeError.status,
        code: exchangeError.code
      })
      
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
      )
    }

    // Successfully exchanged code for session
    console.log('✅ [CALLBACK] Successfully exchanged OAuth code for session (PKCE)')
    if (sessionData?.session) {
      console.log('✅ [CALLBACK] Session created:', {
        userId: sessionData.session.user.id,
        email: sessionData.session.user.email
      })
    }
    
    // CRITICAL: Ensure profile exists (non-blocking)
    // Missing profile is NORMAL for signup - auth resolver will handle it
    // DO NOT make routing decisions here - redirect to /auth/resolve
    try {
      // Small delay to allow database trigger to run (if it exists)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Try to fetch profile (non-blocking check)
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, id, email, full_name')
          .eq('id', user.id)
          .single()
        
        // If profile doesn't exist, try to create it (non-blocking)
        // CRITICAL: Missing profile is NOT an error - it's expected for signup
        if (profileError?.code === 'PGRST116' || !profile) {
          console.log('🆕 [CALLBACK] Profile does not exist - FIRST-TIME USER (signup case)')
          console.log('🆕 [CALLBACK] Attempting to create profile (non-blocking)')
          
          const { error: createError } = await supabase
            .from('user_profiles')
            .upsert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              onboarding_completed: false // CRITICAL: Always false for new users
            }, {
              onConflict: 'id'
            })
          
          if (createError) {
            // If duplicate key, trigger likely created it - that's fine
            if (createError.code === '23505' || createError.message?.includes('duplicate')) {
              console.log('ℹ️ [CALLBACK] Profile already exists (likely created by trigger)')
            } else {
              // Log error but don't block - auth resolver will handle it
              console.warn('⚠️ [CALLBACK] Error creating profile (auth resolver will handle):', createError.message)
            }
          } else {
            console.log('✅ [CALLBACK] Profile created successfully')
          }
        } else {
          // Profile exists - log for debugging
          console.log('✅ [CALLBACK] Profile exists, onboarding_completed:', profile.onboarding_completed)
        }
      }
    } catch (error) {
      // Don't block on profile creation errors - auth resolver will handle it
      console.warn('⚠️ [CALLBACK] Error checking/creating profile (auth resolver will handle):', error)
    }
    
    // CRITICAL: Redirect to auth resolver - the SINGLE place for routing decisions
    console.log('🔄 [CALLBACK] Redirecting to /auth/resolve - single auth resolver')
    return NextResponse.redirect(new URL('/auth/resolve', request.url), { status: 307 })
  }

  // If no code, this might be a magic link (hash fragments are client-side only)
  // Redirect to auth resolver which will handle client-side magic link processing
  // The Supabase SDK with detectSessionInUrl: true will automatically process hash fragments
  console.log('🔄 [CALLBACK] No OAuth code - redirecting to auth resolver (may be magic link)')
  return NextResponse.redirect(new URL('/auth/resolve', request.url), { status: 307 })
}
