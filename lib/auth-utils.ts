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
import { oauthClientOrigin } from '@/lib/oauth-redirect-origin'

export async function signInWithGoogle(): Promise<void> {
  const supabase = createClient()

  console.log('🔄 [AUTH] Initiating Google OAuth - redirecting to /auth/callback')
  // CRITICAL: Redirect to /auth/callback first (not /auth/resolve)
  // The callback route will exchange the OAuth code for a session, then redirect to /auth/resolve
  const redirectUrl = `${oauthClientOrigin()}/auth/callback`
  // Supabase Dashboard → Authentication → URL Configuration → Redirect URLs must include
  // this exact origin + `/auth/callback`. For localhost, add BOTH http://localhost:3000/auth/callback
  // and http://127.0.0.1:3000/auth/callback, then use only one hostname in the browser bar.
  
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
  
  if (!data?.url) {
    console.error('❌ [AUTH] OAuth response missing authorize URL — check Supabase Auth → Providers → Google')
    throw new Error(
      'Google sign-in failed to start (no OAuth URL). Check Supabase Dashboard → Authentication → Providers → Google is enabled.'
    )
  }
}

