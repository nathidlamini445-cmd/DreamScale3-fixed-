import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/'

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  // Handle OAuth code exchange
  // Note: Magic links use hash fragments which are only available client-side
  // Magic links will be handled by Supabase SDK client-side with detectSessionInUrl: true
  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing')
      return NextResponse.redirect(new URL('/login?error=configuration', request.url))
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
    
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
      )
    }

    // Successfully exchanged code for session
    console.log('✅ Successfully exchanged OAuth code for session')
    
    // CRITICAL: Ensure profile exists, then let RouteGuard handle routing
    // This is the SINGLE routing decision point for both login and signup
    // DO NOT make routing decisions here - let RouteGuard handle it after auth resolves
    try {
      // Wait for any database triggers
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // CRITICAL: Always fetch profile fresh (no cache) to get latest onboarding status
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, id, email, full_name')
          .eq('id', user.id)
          .single()
        
        // If profile doesn't exist, create it
        if (profileError?.code === 'PGRST116' || !profile) {
          console.log('🆕 [CALLBACK] Profile does not exist - creating profile')
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              onboarding_completed: false
            })
          
          if (createError) {
            console.error('Error creating profile:', createError)
          } else {
            console.log('✅ [CALLBACK] Created new user profile')
          }
        } else {
          // Profile exists - log onboarding status for debugging
          console.log('✅ [CALLBACK] Profile exists, onboarding_completed:', profile.onboarding_completed)
        }
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error)
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
