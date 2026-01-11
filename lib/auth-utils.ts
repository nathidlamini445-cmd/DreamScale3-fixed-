/**
 * SINGLE AUTHORITY: Google OAuth Function
 * 
 * This is the ONLY function that initiates Google OAuth.
 * Both Signup and Login buttons MUST use this function.
 * 
 * All OAuth flows redirect to /auth/callback, which then
 * redirects to /auth/resolve (the SINGLE place that makes routing decisions).
 */

import { createClient } from '@/lib/supabase/client'

export async function signInWithGoogle(): Promise<void> {
  const supabase = createClient()

  console.log('🔄 [AUTH] Initiating Google OAuth - redirecting to /auth/callback')
  // CRITICAL: Redirect to /auth/callback first (not /auth/resolve)
  // The callback route will exchange the OAuth code for a session, then redirect to /auth/resolve
  const redirectUrl = `${window.location.origin}/auth/callback`
  
  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    }
  })
  
  if (error) {
    console.error('❌ [AUTH] Google OAuth error:', error)
    throw error
  }
  
  // CRITICAL FIX: If Supabase returns a URL, manually redirect to it
  // @supabase/ssr stores PKCE code_verifier in cookies automatically
  if (data?.url && typeof window !== 'undefined') {
    console.log('🔄 [AUTH] Redirecting to Google OAuth:', data.url)
    console.log('🔄 [AUTH] Redirect URL configured:', redirectUrl)
    
    // Validate URL before redirecting
    try {
      new URL(data.url) // Validate URL format
      window.location.href = data.url
      return
    } catch (urlError) {
      console.error('❌ [AUTH] Invalid OAuth URL:', data.url, urlError)
      throw new Error(`Invalid OAuth URL: ${data.url}`)
    }
  }
  
  // If no URL returned, this is unexpected
  if (!data?.url) {
    console.warn('⚠️ [AUTH] OAuth succeeded but no URL returned - Supabase should have redirected automatically')
  }
  
  // If no URL returned, Supabase should have handled redirect automatically
  // After OAuth, Google redirects to /auth/callback
  // Callback then redirects to /auth/resolve
  // Resolver makes the routing decision
}
