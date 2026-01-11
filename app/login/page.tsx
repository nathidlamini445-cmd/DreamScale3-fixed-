'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSessionSafe } from '@/lib/session-context'
import { Loader2, Mail, X, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function LoginPage() {
  const router = useRouter()
  const sessionContext = useSessionSafe()
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [email, setEmail] = useState('')
  const [isEmailMode, setIsEmailMode] = useState(false)
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [previousEmails, setPreviousEmails] = useState<string[]>([])
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null)
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null)

  // Check Supabase connection status
  useEffect(() => {
    if (supabase) {
      setSupabaseConnected(true)
      console.log('✅ Supabase is connected')
    } else {
      setSupabaseConnected(false)
      console.warn('⚠️ Supabase is NOT connected - check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
    }
  }, [])

  // Get previously used emails from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const emails: string[] = []
      
      // Get current email
      const currentEmail = localStorage.getItem('dreamscale_current_email')
      if (currentEmail) {
        emails.push(currentEmail)
      }

      // Get all email-keyed storage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('dreamscale_session_')) {
          const emailFromKey = key.replace('dreamscale_session_', '')
          if (emailFromKey && !emails.includes(emailFromKey)) {
            emails.push(emailFromKey)
          }
        }
      }

      // Also check for emails in session data
      try {
        const legacySession = localStorage.getItem('dreamscale_session')
        if (legacySession) {
          const parsed = JSON.parse(legacySession)
          if (parsed.email && !emails.includes(parsed.email)) {
            emails.push(parsed.email)
          }
        }
      } catch (e) {
        // Ignore
      }

      setPreviousEmails(emails.slice(0, 5)) // Limit to 5 most recent
    }
  }, [])

  // Check Supabase connection status
  useEffect(() => {
    if (supabase) {
      setSupabaseConnected(true)
      console.log('✅ Supabase is connected')
    } else {
      setSupabaseConnected(false)
      console.warn('⚠️ Supabase is NOT connected - check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
    }
  }, [])

  // RouteGuard handles redirects for authenticated users
  // Login page is public, so no checks needed here

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      alert('Supabase is not configured.')
      return
    }

    setIsSigningIn(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/resolve`,
        }
      })
      
      if (error) {
        console.error('Google sign in error:', error)
        alert(`Failed to sign in: ${error.message}`)
        setIsSigningIn(false)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('An error occurred. Please try again.')
      setIsSigningIn(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!supabase) {
      alert('Supabase is not configured.')
      return
    }

    setIsSigningIn(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/resolve`,
        }
      })
      
      if (error) {
        console.error('Google sign up error:', error)
        alert(`Failed to sign up: ${error.message}`)
        setIsSigningIn(false)
      }
    } catch (error) {
      console.error('Sign up error:', error)
      alert('An error occurred. Please try again.')
      setIsSigningIn(false)
    }
  }

  const handleEmailContinue = async (emailToUse: string) => {
    if (!emailToUse || !emailToUse.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    setIsSendingMagicLink(true)
    
    try {
      // Normalize email
      const normalizedEmail = emailToUse.toLowerCase().trim()
      
      // Set current email in session context (this will load their data)
      // This ensures their data persists when they use the same email
      if (sessionContext) {
        sessionContext.updateEmail(normalizedEmail)
      }

      if (!supabase) {
        alert('Supabase is not configured. Please check your environment variables.')
        setIsSendingMagicLink(false)
        return
      }

      // Use magic link (passwordless email) for email-based authentication
      // This avoids PKCE flow issues and provides a better UX for email-only auth
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/resolve`,
          shouldCreateUser: true, // Create user if doesn't exist
        }
      })

      if (error) {
        console.error('Email sign in error:', error)
        alert(`Failed to send magic link: ${error.message}`)
        setIsSendingMagicLink(false)
      } else {
        // Magic link sent successfully - show success message
        setMagicLinkSent(true)
        setEmail(normalizedEmail)
        setIsSendingMagicLink(false)
      }
    } catch (error) {
      console.error('Email sign in error:', error)
      alert('An error occurred. Please try again.')
      setIsSendingMagicLink(false)
    }
  }

  const handlePreviousEmailClick = async (emailToUse: string) => {
    if (!emailToUse || !emailToUse.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    setLoadingEmail(emailToUse)
    setIsSendingMagicLink(true)
    
    // Add overall timeout - if this takes more than 5 seconds, redirect anyway
    const overallTimeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout - redirecting anyway')
      setLoadingEmail(null)
      setIsSendingMagicLink(false)
      console.log('🔄 [LOGIN PAGE] Redirecting to / - loading timeout')
      router.push('/')
    }, 5000)
    
    try {
      // Normalize email
      const normalizedEmail = emailToUse.toLowerCase().trim()
      
      console.log('📧 Loading data for email:', normalizedEmail)
      
      // Check if user has completed onboarding (check Supabase)
      let onboardingCompleted = false
      if (supabase) {
        try {
          const { data: session } = await supabase.auth.getSession()
          if (session?.user?.id) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single()
            onboardingCompleted = profile?.onboarding_completed === true
          }
        } catch (error) {
          console.error('Error checking Supabase onboarding status:', error)
        }
      }
      
      console.log('🔍 Onboarding check for email selection:', {
        email: normalizedEmail,
        hasCompletedOnboarding: onboardingCompleted
      })
      
      // Update session context with this email - this will load their data from localStorage/Supabase
      // This loads their history, days, tasks, calendar events, etc.
      if (sessionContext) {
        sessionContext.updateEmail(normalizedEmail)
        
        // Wait for data to load (history, days, tasks, etc.)
        // Reduced wait time - don't wait too long
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Check if user is authenticated with this email in Supabase (with timeout)
      if (supabase) {
        try {
          // Add timeout to Supabase session check
          const sessionPromise = supabase.auth.getSession()
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 2000)
          )
          
          const { data: { session }, error } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any
          
          if (error) {
            console.error('Error checking session:', error)
          }
          
          if (session?.user?.email?.toLowerCase() === normalizedEmail) {
            console.log('✅ User authenticated with this email - redirecting to auth resolver')
            clearTimeout(overallTimeout)
            setLoadingEmail(null)
            setIsSendingMagicLink(false)
            // User is authenticated - let auth resolver handle routing
            router.replace('/auth/resolve')
            return
          } else {
            console.log('ℹ️ User not authenticated, using localStorage data')
          }
        } catch (supabaseError) {
          console.error('Error checking Supabase session (may have timed out):', supabaseError)
          // Continue with localStorage data - don't block
        }
      } else {
        console.warn('⚠️ Supabase not configured - using localStorage only')
      }

      // User is not authenticated, but we've loaded their localStorage data
      // Stay on login page - user can authenticate or continue with email
      console.log('✅ Data loaded from localStorage')
      clearTimeout(overallTimeout)
      setLoadingEmail(null)
      setIsSendingMagicLink(false)
      // Don't redirect - let user choose to authenticate or continue
    } catch (error) {
      console.error('Error loading user data:', error)
      clearTimeout(overallTimeout)
      setLoadingEmail(null)
      setIsSendingMagicLink(false)
      // On error, just stop loading - user stays on login page
      console.log('❌ Error loading user data - staying on login page')
    }
  }

  // Don't wait forever - always show login page after max 2 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Login page timeout - showing login form anyway')
        setIsLoading(false)
      }
    }, 2000)
    
    return () => clearTimeout(timeoutId)
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005DFF]"></div>
      </div>
    )
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a sign-in link to <strong>{email}</strong>. Click the link in the email to continue.
            </p>
            <Button
              onClick={() => {
                setMagicLinkSent(false)
                setEmail('')
              }}
              variant="outline"
              className="w-full"
            >
              Use a different email
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 relative">
      {/* Back Button - Top Left */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="outline"
          onClick={() => {
            console.log('🔄 [LOGIN PAGE] Back button clicked - redirecting to /')
            router.push('/')
          }}
          className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-16 h-16">
            <Image
              src="/Logo.png"
              alt="DreamScale Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to DreamScale
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your AI-powered business platform
            </p>
          </div>

          {/* Sign Up and Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Sign Up Button */}
            <Button 
              onClick={handleGoogleSignUp}
              className="w-full bg-[#005DFF] hover:bg-[#0048CC] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-12"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Signing up...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Sign Up</span>
                </>
              )}
            </Button>

            {/* Login Button */}
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-12"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Login</span>
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
            </div>
          </div>

          {/* Previously Used Emails */}
          {previousEmails.length > 0 && !isEmailMode && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Continue with a previous email:
              </p>
              {previousEmails.map((prevEmail) => (
                <button
                  key={prevEmail}
                  onClick={() => handlePreviousEmailClick(prevEmail)}
                  disabled={loadingEmail === prevEmail || isSendingMagicLink}
                  className="w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-gray-900 dark:text-white font-medium">{prevEmail}</span>
                  {loadingEmail === prevEmail ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Email Input */}
          {isEmailMode || previousEmails.length === 0 ? (
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && email) {
                      handleEmailContinue(email)
                    }
                  }}
                  className="w-full h-12 text-base"
                  disabled={isSendingMagicLink}
                />
              </div>
              <Button
                onClick={() => handleEmailContinue(email)}
                disabled={!email || isSendingMagicLink}
                className="w-full bg-[#005DFF] hover:bg-[#0048CC] text-white h-12"
              >
                {isSendingMagicLink ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Continue with email'
                )}
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsEmailMode(true)}
              className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
            >
              Use a different email
            </button>
          )}

          {/* Privacy Notice */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By continuing, you acknowledge DreamScale's Privacy Policy
          </p>

          {/* Supabase Connection Status */}
          {supabaseConnected !== null && (
            <div className={`mt-4 p-3 rounded-lg text-xs text-center ${
              supabaseConnected 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
            }`}>
              {supabaseConnected ? (
                <span>✅ Supabase Connected - Your data will be synced</span>
              ) : (
                <span>⚠️ Supabase Not Connected - Using local storage only</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
