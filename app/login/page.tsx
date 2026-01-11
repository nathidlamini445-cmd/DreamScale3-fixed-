'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSessionSafe } from '@/lib/session-context'
import { Loader2, Mail, X, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionContext = useSessionSafe()
  const [isLoading, setIsLoading] = useState(false) // CRITICAL: Start as false - login page is public, render immediately
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [email, setEmail] = useState('')
  const [isEmailMode, setIsEmailMode] = useState(false)
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [previousEmails, setPreviousEmails] = useState<string[]>([])
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null)
  const supabase = createClient()

  // REMOVED: All redirect logic removed - /auth/resolve is the ONLY place that makes routing decisions

  // Get previously used emails - Check for existing sessions first (for "Continue as" feature)
  useEffect(() => {
    const loadPreviousEmails = async () => {
      if (typeof window !== 'undefined') {
        const emails: string[] = []
        
        try {
          // CRITICAL: Check if user has an existing session (from cookies)
          // This enables "Continue as [email]" feature
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (session?.user?.email && !sessionError) {
            // User has an active session - this is the "Continue as" email
            const email = session.user.email.toLowerCase().trim()
            emails.push(email)
            console.log('✅ [LOGIN] Found existing session for:', email)
            
            // Also check their profile in Supabase
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('email')
              .eq('id', session.user.id)
              .single()
            
            if (profile?.email && !emails.includes(profile.email.toLowerCase().trim())) {
              emails.push(profile.email.toLowerCase().trim())
            }
          } else {
            // No active session - check localStorage for previously used emails
            // (for users who signed up but aren't currently authenticated)
            try {
              const lastEmail = localStorage.getItem('dreamscale_current_email')
              if (lastEmail) {
                emails.push(lastEmail.toLowerCase().trim())
              }
            } catch (e) {
              // Ignore localStorage errors
            }
          }
          
          setPreviousEmails(emails.slice(0, 5))
        } catch (error) {
          console.error('Error loading previous emails:', error)
          setPreviousEmails([])
        }
      }
    }
    
    loadPreviousEmails()
  }, [])


  // RouteGuard handles redirects for authenticated users
  // Login page is public, so no checks needed here

  // SINGLE OAuth function - used by BOTH Signup and Login buttons
  const handleGoogleOAuth = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/login/page.tsx:74',message:'handleGoogleOAuth called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    setIsSigningIn(true)
    
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/login/page.tsx:78',message:'Starting dynamic import',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const { signInWithGoogle } = await import('@/lib/auth-utils')
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/login/page.tsx:80',message:'Dynamic import successful',data:{hasSignInWithGoogle:!!signInWithGoogle},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/login/page.tsx:82',message:'Calling signInWithGoogle',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      await signInWithGoogle()
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/login/page.tsx:84',message:'signInWithGoogle completed successfully',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // If successful, user will be redirected to Google OAuth page
      // No need to set isSigningIn to false - redirect will happen
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/login/page.tsx:87',message:'Error caught in handleGoogleOAuth',data:{errorMessage:error instanceof Error?error.message:String(error),errorName:error instanceof Error?error.name:'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error('❌ [LOGIN] OAuth error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.'
      alert(`Error: ${errorMessage}`)
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

      // CRITICAL: Check Supabase to see if user actually exists in database
      // Don't rely on localStorage - it might have data from incomplete signups
      let userExistsInSupabase = false
      let onboardingCompleted = false
      
      if (supabase) {
        try {
          // Check if user is authenticated with this email
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user?.email?.toLowerCase() === normalizedEmail) {
            // User is authenticated - check their profile
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single()
            
            if (profile) {
              userExistsInSupabase = true
              onboardingCompleted = profile.onboarding_completed === true
              console.log('✅ [LOGIN] User exists in Supabase (authenticated) - onboarding completed:', onboardingCompleted)
            }
          } else {
            // User not authenticated - try to check if email exists in user_profiles
            // Note: This might fail due to RLS policies, but we'll try
            // If it fails, we'll treat as new user (safer for signup flow)
            try {
              const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('onboarding_completed')
                .eq('email', normalizedEmail)
                .single()
              
              if (profile && !profileError) {
                userExistsInSupabase = true
                onboardingCompleted = profile.onboarding_completed === true
                console.log('✅ [LOGIN] Email found in Supabase profiles - onboarding completed:', onboardingCompleted)
              } else if (profileError?.code === 'PGRST116') {
                // No profile found - this is a NEW USER
                console.log('🆕 [LOGIN] Email not found in Supabase - NEW USER (signup flow)')
                userExistsInSupabase = false
              }
            } catch (queryError: any) {
              // RLS might block this query - that's OK, treat as new user
              console.log('ℹ️ [LOGIN] Could not verify email in Supabase (may be RLS) - treating as NEW USER (signup flow)')
              userExistsInSupabase = false
            }
          }
        } catch (error: any) {
          // Any error means we can't verify - treat as new user (safer for signup)
          console.log('ℹ️ [LOGIN] Error checking Supabase - treating as NEW USER (signup flow):', error?.message)
          userExistsInSupabase = false
        }
      }

      // REMOVED: Redirect logic removed - magic link will redirect to /auth/resolve
      // Auth resolver will handle routing to onboarding or home

      // Existing user with completed onboarding - send magic link and show success message
      // This is the LOGIN flow (not signup)
      if (!supabase) {
        alert('Supabase is not configured. Please check your environment variables.')
        setIsSendingMagicLink(false)
        return
      }

      console.log('✅ [LOGIN] Existing user with completed onboarding - sending magic link (LOGIN FLOW)')
      
      // Use magic link (passwordless email) for email-based authentication
      // This avoids PKCE flow issues and provides a better UX for email-only auth
      // CRITICAL: For sign up, allow user creation. For login, don't create.
      // We check if user exists, but if they don't, we still allow signup via magic link
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/resolve`,
          shouldCreateUser: !userExistsInSupabase, // Allow creation for new users (signup), don't create for existing (login)
        }
      })

      if (error) {
        console.error('Email sign in error:', error)
        
        // Check if it's a database error - this might be a trigger issue
        // For existing users, we can still allow them to proceed
        if (error.message?.includes('Database error') || error.message?.includes('saving new user')) {
          console.warn('⚠️ [LOGIN] Database error during magic link - user might already exist')
          // Check if user exists in Supabase auth
          try {
            const { data: { user } } = await supabase.auth.getUser()
            // REMOVED: Redirect logic - magic link will redirect to /auth/resolve
          } catch (e) {
            // Ignore
          }
        }
        
        // Show error but don't block - user can try Google OAuth or try again
        alert(`Failed to send magic link: ${error.message}\n\nYou can try:\n1. Sign up with Google (recommended)\n2. Try again in a moment`)
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

  // CRITICAL: "Continue as [email]" handler - auto-authenticates and routes to onboarding/home
  const handlePreviousEmailClick = async (emailToUse: string) => {
    if (!emailToUse || !emailToUse.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    setLoadingEmail(emailToUse)
    setIsSendingMagicLink(true)
    
    try {
      // Normalize email
      const normalizedEmail = emailToUse.toLowerCase().trim()
      
      console.log('🔄 [CONTINUE AS] Checking session for:', normalizedEmail)
      
      // CRITICAL: Check if user has an active session (from cookies)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (session?.user?.email?.toLowerCase() === normalizedEmail && !sessionError) {
        // User has an active session! Auto-authenticate and route them
        console.log('✅ [CONTINUE AS] Active session found - auto-authenticating')
        
        // Update session context
        if (sessionContext) {
          sessionContext.updateEmail(normalizedEmail)
        }
        
        // Check onboarding status
        let onboardingCompleted = false
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single()
          
          onboardingCompleted = profile?.onboarding_completed === true
          console.log('🔍 [CONTINUE AS] Onboarding status:', onboardingCompleted)
        } catch (error) {
          console.error('Error checking onboarding status:', error)
        }
        
        // Route based on onboarding status
        setLoadingEmail(null)
        setIsSendingMagicLink(false)
        
        // Redirect to auth/resolve which will handle routing
        // It will route to /onboarding if not completed, / if completed
        console.log('🔄 [CONTINUE AS] Redirecting to /auth/resolve')
        router.push('/auth/resolve')
        return
      }
      
      // No active session - send magic link to authenticate
      console.log('📧 [CONTINUE AS] No active session - sending magic link')
      
      // Update session context
      if (sessionContext) {
        sessionContext.updateEmail(normalizedEmail)
      }
      
      // Send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/resolve`,
          shouldCreateUser: true, // Allow signup if new user
        }
      })
      
      if (error) {
        console.error('Error sending magic link:', error)
        alert(`Failed to send sign-in link: ${error.message}`)
        setLoadingEmail(null)
        setIsSendingMagicLink(false)
        return
      }
      
      // Magic link sent successfully
      setMagicLinkSent(true)
      setEmail(normalizedEmail)
      setLoadingEmail(null)
      setIsSendingMagicLink(false)
      
    } catch (error) {
      console.error('Error in Continue as:', error)
      alert('An error occurred. Please try again.')
      setLoadingEmail(null)
      setIsSendingMagicLink(false)
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo - Centered above card */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <Image
              src="/Logo.png"
              alt="DreamScale Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Login Form Card - White with rounded corners */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to DreamScale
            </h1>
            <p className="text-gray-600 text-base">
              Your AI-powered business platform
            </p>
          </div>

          {/* "Continue as [email]" - Show FIRST if available (Google-style) */}
          {previousEmails.length > 0 && !isEmailMode && (
            <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Continue as
                </p>
              </div>
              {previousEmails.map((prevEmail) => (
                <button
                  key={prevEmail}
                  onClick={() => handlePreviousEmailClick(prevEmail)}
                  disabled={loadingEmail === prevEmail || isSendingMagicLink}
                  className="w-full px-4 py-3.5 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-[#005DFF] dark:hover:border-[#005DFF] transition-all duration-200 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#005DFF] to-[#0048CC] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {prevEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {prevEmail}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {loadingEmail === prevEmail ? 'Signing in...' : 'Click to continue'}
                      </span>
                    </div>
                  </div>
                  {loadingEmail === prevEmail ? (
                    <Loader2 className="w-5 h-5 text-[#005DFF] animate-spin" />
                  ) : (
                    <div className="w-5 h-5 text-gray-400 group-hover:text-[#005DFF] transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
              <div className="text-center pt-2">
                <button
                  onClick={() => setIsEmailMode(true)}
                  className="text-sm text-[#005DFF] hover:text-[#0048CC] font-medium transition-colors"
                >
                  Use a different account
                </button>
              </div>
            </div>
          )}

          {/* Google Sign Up and Login Buttons - Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Sign Up Button - Blue with white G icon - Shows email input OR Google OAuth */}
            <Button 
              onClick={() => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/login/page.tsx:412',message:'Sign Up button clicked (login page)',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                // CRITICAL: For sign up, show email input first (user can choose Google OAuth later)
                // This allows users to sign up with email OR Google
                setIsEmailMode(true)
                setEmail('') // Clear email field
              }}
              className="w-full bg-[#005DFF] hover:bg-[#0048CC] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-12 font-medium shadow-sm"
              disabled={isSigningIn}
            >
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#005DFF] font-bold text-sm">G</span>
              </div>
              <span className="text-sm font-medium">Sign Up</span>
            </Button>

            {/* Login Button - White with border and black G icon */}
            <Button 
              onClick={() => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/498d4eaf-7f87-46a2-947c-4c9bd111de9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/login/page.tsx:433',message:'Login button clicked (login page)',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                handleGoogleOAuth()
              }}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-12 font-medium shadow-sm"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Signing in...</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <span className="text-sm font-medium">Login</span>
                </>
              )}
            </Button>
          </div>

          {/* OR Divider - Only show if there are previous emails */}
          {previousEmails.length > 0 && !isEmailMode && (
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500 bg-white">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          )}

          {/* Email Input - Show when in email mode OR no previous emails OR sign up was clicked */}
          {isEmailMode || previousEmails.length === 0 ? (
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email to sign up"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && email) {
                      handleEmailContinue(email)
                    }
                  }}
                  className="w-full h-12 text-base"
                  disabled={isSendingMagicLink}
                  autoFocus={isEmailMode}
                />
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => handleEmailContinue(email)}
                  disabled={!email || isSendingMagicLink}
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white h-12 font-medium shadow-sm"
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
                {/* Option to use Google OAuth instead */}
                <Button
                  onClick={() => handleGoogleOAuth()}
                  disabled={isSigningIn}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 h-12 font-medium shadow-sm flex items-center justify-center gap-2"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Signing up...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">G</span>
                      </div>
                      <span className="text-sm">Or sign up with Google</span>
                    </>
                  )}
                </Button>
              </div>
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
          <p className="text-xs text-center text-gray-500">
            By continuing, you acknowledge DreamScale's Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
