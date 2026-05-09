'use client'



import { useState, useEffect, Suspense, useMemo, useRef } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { useSessionSafe } from '@/lib/session-context'

import { Loader2, Eye, EyeOff } from 'lucide-react'

import Image from 'next/image'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

import { createClient } from '@/lib/supabase/client'



/** Supabase accepts short passwords server-side depending on project settings — keep a sensible client minimum */

const PASSWORD_MIN = 6



function augmentCaptchaAlertMessage(message: string, turnstileConfigured: boolean): string {

  if (!message.toLowerCase().includes('captcha')) return message

  if (!turnstileConfigured) {

    return `${message}\n\nSupabase CAPTCHA is on but the app needs NEXT_PUBLIC_TURNSTILE_SITE_KEY (Turnstile), matching Dashboard → Authentication → Bot Protection.\nAlternatively turn CAPTCHA off for local development.`

  }

  return `${message}\n\nComplete the verification again if it expired, then retry.`

}



function LoginPageContent() {

  const router = useRouter()

  const searchParams = useSearchParams()

  const sessionContext = useSessionSafe()

  const [isLoading, setIsLoading] = useState(false)

  const [isSigningIn, setIsSigningIn] = useState(false)

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  const [isEmailMode, setIsEmailMode] = useState(false)

  const [isEmailAuthPending, setIsEmailAuthPending] = useState(false)

  const [previousEmails, setPreviousEmails] = useState<string[]>([])

  const [loadingEmail, setLoadingEmail] = useState<string | null>(null)

  const [forgotExpanded, setForgotExpanded] = useState(false)

  const [forgotEmail, setForgotEmail] = useState('')

  const [isResetSending, setIsResetSending] = useState(false)

  const [resetSentMessage, setResetSentMessage] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false)

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const turnstileRef = useRef<TurnstileInstance | null>(null)

  const [turnstileSiteKey, setTurnstileSiteKey] = useState('')

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {

    let cancelled = false

    void fetch('/api/auth/turnstile-site-key')

      .then((res) => res.json())

      .then((data: { siteKey?: string }) => {

        const key = (data.siteKey ?? '').trim()

        if (!cancelled && key) {

          setTurnstileSiteKey(key)

        }

      })

      .catch(() => {})

    return () => {

      cancelled = true

    }

  }, [])



  const captchaConfigured = turnstileSiteKey.length > 0



  const resetTurnstile = () => {

    setCaptchaToken(null)

    turnstileRef.current?.reset()

  }



  const assertCaptchaCompleted = (): boolean => {

    if (!captchaConfigured) return true

    if (captchaToken) return true

    alert('Complete the verification below (security check), then try again.')

    return false

  }



  useEffect(() => {

    const loadPreviousEmails = async () => {

      if (typeof window !== 'undefined') {

        const emails: string[] = []



        try {

          const {

            data: { session },

            error: sessionError,

          } = await supabase.auth.getSession()



          if (session?.user?.email && !sessionError) {

            const e = session.user.email.toLowerCase().trim()

            emails.push(e)

            console.log('✅ [LOGIN] Found existing session for:', e)



            const { data: profile } = await supabase

              .from('user_profiles')

              .select('email')

              .eq('id', session.user.id)

              .single()



            if (profile?.email && !emails.includes(profile.email.toLowerCase().trim())) {

              emails.push(profile.email.toLowerCase().trim())

            }

          } else {

            try {

              const lastEmail = localStorage.getItem('dreamscale_current_email')

              if (lastEmail) emails.push(lastEmail.toLowerCase().trim())

            } catch {

              // ignore

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



  useEffect(() => {

    if (searchParams.get('onboarding_complete') !== 'true') return

    let cancelled = false

    const client = createClient()

    ;(async () => {

      const {

        data: { session },

      } = await client.auth.getSession()

      if (cancelled || !session?.user) return

      router.replace('/auth/resolve')

    })()

    return () => {

      cancelled = true

    }

  }, [router, searchParams])



  useEffect(() => {

    if (searchParams.get('error') !== 'session_check_failed' || typeof window === 'undefined') return

    const u = new URL(window.location.href)

    u.searchParams.delete('error')

    const path = u.pathname + (u.search ? u.search : '')

    window.history.replaceState(null, '', path)

  }, [searchParams])



  const handleGoogleOAuth = async () => {

    setIsSigningIn(true)

    try {

      const { signInWithGoogle } = await import('@/lib/auth-utils')

      await signInWithGoogle()

    } catch (error) {

      console.error('❌ [LOGIN] OAuth error:', error)

      const errorMessage =

        error instanceof Error ? error.message : 'An error occurred. Please try again.'

      alert(`Error: ${errorMessage}`)

      setIsSigningIn(false)

    }

  }



  const validateEmailPassword = (normalizedEmail: string, pwd: string): string | null => {

    if (!normalizedEmail || !normalizedEmail.includes('@')) {

      return 'Please enter a valid email address.'

    }

    if (!pwd || pwd.length < PASSWORD_MIN) {

      return `Enter a password of at least ${PASSWORD_MIN} characters.`

    }

    return null

  }



  const handleEmailSignIn = async () => {

    const normalizedEmail = email.toLowerCase().trim()

    const err = validateEmailPassword(normalizedEmail, password)

    if (err) {

      alert(err)

      return

    }



    if (!assertCaptchaCompleted()) {

      return

    }



    setIsEmailAuthPending(true)

    try {

      if (sessionContext) sessionContext.updateEmail(normalizedEmail)



      const opts = captchaConfigured && captchaToken ? { captchaToken } : undefined



      const { data, error } = await supabase.auth.signInWithPassword({

        email: normalizedEmail,

        password,

        ...(opts ? { options: opts } : {}),

      })



      if (error) {

        console.error('Email/password sign-in error:', error.message)

        alert(

          augmentCaptchaAlertMessage(

            `Could not sign in: ${error.message}\n\nIf you are new here, use \"Create account\" instead.`,

            captchaConfigured,

          )

        )

        resetTurnstile()



        setIsEmailAuthPending(false)

        return

      }



      if (data.session) {

        router.replace('/auth/resolve')

        return

      }



      alert('Sign-in did not return a session. Ask your admin to disable email confirmation for password sign-ups in Supabase, or confirm your email.')

      setIsEmailAuthPending(false)

    } catch (e) {

      console.error(e)

      alert('Something went wrong. Try again or use Google.')

      resetTurnstile()

      setIsEmailAuthPending(false)

    }

  }



  const handleEmailSignUp = async () => {

    const normalizedEmail = email.toLowerCase().trim()

    const err = validateEmailPassword(normalizedEmail, password)

    if (err) {

      alert(err)

      return

    }



    if (!assertCaptchaCompleted()) {

      return

    }



    setIsEmailAuthPending(true)

    try {

      if (sessionContext) sessionContext.updateEmail(normalizedEmail)



      const { data, error } = await supabase.auth.signUp({

        email: normalizedEmail,

        password,

        options: {

          emailRedirectTo: `${window.location.origin}/auth/resolve`,

          ...(captchaConfigured && captchaToken ? { captchaToken } : {}),

        },

      })



      if (error) {

        console.error('Sign up error:', error.message)

        if (

          error.message.toLowerCase().includes('already') ||

          error.message.toLowerCase().includes('registered')

        ) {

          alert('This email is already registered. Use "Sign in" instead.')

        } else {          alert(augmentCaptchaAlertMessage(`Could not create account: ${error.message}`, captchaConfigured))
        }

        resetTurnstile()

        setIsEmailAuthPending(false)

        return

      }



      if (data.session) {

        router.replace('/auth/resolve')

        return

      }



      alert(

        'Account created but there is no session yet. In the Supabase dashboard, turn off email confirmation for the Email provider so users can sign in with password immediately (no verification link required).'

      )

      setIsEmailAuthPending(false)

    } catch (e) {

      console.error(e)

      alert('Something went wrong. Try again or use Google.')

      resetTurnstile()

      setIsEmailAuthPending(false)

    }

  }



  const handleSendPasswordReset = async () => {

    const normalized = forgotEmail.trim().toLowerCase()

    if (!normalized || !normalized.includes('@')) {

      alert('Enter the email associated with your account.')

      return

    }



    if (!assertCaptchaCompleted()) {

      return

    }



    setIsResetSending(true)

    setResetSentMessage(null)



    try {

      const origin = typeof window !== 'undefined' ? window.location.origin : ''

      const { error } = await supabase.auth.resetPasswordForEmail(normalized, {

        redirectTo: `${origin}/auth/update-password`,

        ...(captchaConfigured && captchaToken ? { captchaToken } : {}),

      })

      if (error) {

        alert(augmentCaptchaAlertMessage(`Could not send reset email: ${error.message}`, captchaConfigured))
        resetTurnstile()

      } else {

        setResetSentMessage('If that address has an account, you will receive a password reset email shortly.')

        setForgotExpanded(false)

      }

    } catch (e) {

      console.error(e)

      alert('Something went wrong. Try again in a moment.')

    } finally {

      setIsResetSending(false)

    }

  }



  /** Continue as: if cookies already have this session → resolver; otherwise open email/password form prefilled */

  const handlePreviousEmailClick = async (emailToUse: string) => {

    if (!emailToUse || !emailToUse.includes('@')) {

      alert('Please enter a valid email address')

      return

    }



    const normalizedEmail = emailToUse.toLowerCase().trim()

    setLoadingEmail(normalizedEmail)



    try {

      const {

        data: { session },

        error: sessionError,

      } = await supabase.auth.getSession()



      if (session?.user?.email?.toLowerCase() === normalizedEmail && !sessionError) {

        if (sessionContext) sessionContext.updateEmail(normalizedEmail)

        setLoadingEmail(null)

        router.replace('/auth/resolve')

        return

      }



      setEmail(normalizedEmail)

      setPassword('')

      setIsEmailMode(true)

      setLoadingEmail(null)

    } catch (error) {

      console.error('Error in Continue as:', error)

      setEmail(normalizedEmail)

      setIsEmailMode(true)

      setLoadingEmail(null)

    }

  }



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



  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-md">

        <div className="flex justify-center mb-8">

          <div className="relative w-24 h-24">

            <Image src="/Logo.png" alt="DreamScale Logo" fill className="object-contain" priority />

          </div>

        </div>



        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">

          <div className="text-center space-y-2">

            <h1 className="text-3xl font-bold text-gray-900">Welcome to DreamScale</h1>

            <p className="text-gray-600 text-base">Your AI-powered business platform</p>

          </div>



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

                  type="button"

                  onClick={() => handlePreviousEmailClick(prevEmail)}

                  disabled={loadingEmail === prevEmail}

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

                        {loadingEmail === prevEmail

                          ? 'Loading...'

                          : 'Sign in instantly or enter password below'}

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

                  type="button"

                  onClick={() => {

                    setIsEmailMode(true)

                    setEmail('')

                    setPassword('')

                  }}

                  className="text-sm text-[#005DFF] hover:text-[#0048CC] font-medium transition-colors"

                >

                  Use a different account

                </button>

              </div>

            </div>

          )}



          {!isEmailMode && (

            <>

              {previousEmails.length > 0 && (

                <div className="relative flex items-center">

                  <div className="flex-1 border-t border-gray-300"></div>

                  <span className="px-4 text-sm text-gray-500 bg-white">OR</span>

                  <div className="flex-1 border-t border-gray-300"></div>

                </div>

              )}



              <div className="space-y-2">

                <Button

                  onClick={() => handleGoogleOAuth()}

                  disabled={isSigningIn}

                  className="w-full bg-[#005DFF] hover:bg-[#0048CC] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-12 font-medium shadow-sm"

                >

                  {isSigningIn ? (

                    <>

                      <Loader2 className="w-4 h-4 animate-spin" />

                      <span className="text-sm">Signing in...</span>

                    </>

                  ) : (

                    <>

                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">

                        <span className="text-[#005DFF] font-bold text-sm">G</span>

                      </div>

                      <span className="text-sm font-medium">Continue with Google</span>

                    </>

                  )}

                </Button>

                <p className="text-xs text-center text-gray-500">

                  New or returning uses the same Google sign-in. No inbox links when you choose Google.

                </p>

                <button

                  type="button"

                  onClick={() => {

                    setIsEmailMode(true)

                    setPassword('')

                  }}

                  className="w-full text-sm text-[#005DFF] hover:text-[#0048CC] font-medium transition-colors py-2"

                >

                  Continue with email & password instead

                </button>

              </div>

            </>

          )}



          {isEmailMode && (

            <div className="space-y-4">

              <div className="space-y-2">

                <Input

                  type="email"

                  placeholder="Email"

                  value={email}

                  onChange={(e) => setEmail(e.target.value)}

                  className="w-full h-12 text-base"

                  disabled={isEmailAuthPending}

                  autoComplete="email"

                  autoFocus

                />

                <div className="relative">

                  <Input

                    type={showPassword ? 'text' : 'password'}

                    placeholder="Password"

                    value={password}

                    onChange={(e) => setPassword(e.target.value)}

                    onKeyDown={(e) => {

                      if (e.key === 'Enter') void handleEmailSignIn()

                    }}

                    className="w-full h-12 pr-12 text-base"

                    disabled={isEmailAuthPending}

                    autoComplete="current-password"

                  />

                  <button

                    type="button"

                    className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#005DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005DFF] disabled:opacity-35"

                    aria-label={showPassword ? 'Hide password' : 'Show password'}

                    disabled={isEmailAuthPending}

                    tabIndex={0}

                    onClick={() => setShowPassword((v) => !v)}

                  >

                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}

                  </button>

                </div>

              </div>

              {captchaConfigured ? (
                <div className="flex justify-center [&_iframe]:max-w-full">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={turnstileSiteKey}
                    onSuccess={(t) => setCaptchaToken(t)}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => {
                      setCaptchaToken(null)
                    }}
                  />
                </div>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isEmailAuthPending || isResetSending}
                  className="text-sm text-[#005DFF] hover:text-[#0048CC] font-medium disabled:opacity-50"
                  onClick={() => {
                    setForgotExpanded((v) => !v)
                    setForgotEmail((prev) => (prev.trim() ? prev : email.trim()))
                    setResetSentMessage(null)
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {resetSentMessage ? (
                <p className="text-sm text-center text-green-700 bg-green-50 border border-green-200 rounded-lg py-3 px-2">
                  {resetSentMessage}
                </p>
              ) : null}

              {forgotExpanded ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <p className="text-xs text-gray-600">
                    Password reset sends a one-time email with a secure link — only for recovering access.
                  </p>
                  <Input
                    type="email"
                    placeholder="Email for reset"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={isResetSending}
                    autoComplete="email"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isResetSending}
                    onClick={() => void handleSendPasswordReset()}
                  >
                    {isResetSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send reset email'
                    )}
                  </Button>
                </div>
              ) : null}

              <div className="space-y-2">

                <Button

                  type="button"

                  onClick={() => void handleEmailSignIn()}

                  disabled={isEmailAuthPending}

                  className="w-full bg-[#005DFF] hover:bg-[#0048CC] text-white h-12 font-medium shadow-sm"

                >

                  {isEmailAuthPending ? (

                    <>

                      <Loader2 className="w-5 h-5 animate-spin mr-2" />

                      Working...

                    </>

                  ) : (

                    'Sign in'

                  )}

                </Button>

                <Button

                  type="button"

                  variant="outline"

                  onClick={() => void handleEmailSignUp()}

                  disabled={isEmailAuthPending}

                  className="w-full h-12 font-medium"

                >

                  Create account

                </Button>

                <Button

                  type="button"

                  variant="ghost"

                  onClick={() => {

                    setIsEmailMode(false)

                    setPassword('')

                  }}

                  className="w-full h-11 text-[#005DFF]"

                >

                  Back to Google sign-in

                </Button>

              </div>

              <p className="text-[11px] text-center text-gray-500 leading-snug">

                Password sign-in does not send email links. For instant access after signup, disable

                email confirmation for the Email provider in your Supabase project settings.

              </p>

            </div>

          )}



          <p className="text-xs text-center text-gray-500">

            By continuing, you acknowledge DreamScale&apos;s Privacy Policy

          </p>

        </div>

      </div>

    </div>

  )

}



export default function LoginPage() {

  return (

    <Suspense

      fallback={

        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005DFF]"></div>

        </div>

      }

    >

      <LoginPageContent />

    </Suspense>

  )

}

