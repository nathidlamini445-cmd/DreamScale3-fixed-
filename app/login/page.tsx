'use client'



import { useState, useEffect, Suspense, useMemo, useRef } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { useSessionSafe } from '@/lib/session-context'

import { Loader2, Eye, EyeOff, Frown, X, AlertCircle, Info } from 'lucide-react'

import Image from 'next/image'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

import { createClient } from '@/lib/supabase/client'

import { oauthClientOrigin } from '@/lib/oauth-redirect-origin'

import { cn } from '@/lib/utils'

/** Supabase accepts short passwords server-side depending on project settings — keep a sensible client minimum */

const PASSWORD_MIN = 6



function augmentCaptchaAlertMessage(message: string, turnstileConfigured: boolean): string {

  if (!message.toLowerCase().includes('captcha')) return message

  if (!turnstileConfigured) {

    return `${message}\n\nSupabase CAPTCHA is on but the app needs NEXT_PUBLIC_TURNSTILE_SITE_KEY (Turnstile), matching Dashboard → Authentication → Bot Protection.\nAlternatively turn CAPTCHA off for local development.`

  }

  return `${message}\n\nComplete the verification again if it expired, then retry.`

}

type AuthBanner = {
  variant: 'error' | 'warning' | 'info'
  title: string
  detail?: string
}

function isLikelyWrongPassword(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('invalid login') ||
    m.includes('invalid credentials') ||
    m.includes('invalid email') ||
    m.includes('email or password')
  )
}

function parseLongMessage(message: string): { title: string; detail?: string } {
  const parts = message.trim().split(/\n\n+/)
  if (parts.length >= 2) {
    return { title: parts[0].trim(), detail: parts.slice(1).join('\n\n').trim() }
  }
  const single = parts[0] ?? message
  if (single.length > 160) {
    const cut = single.slice(0, 157).trimEnd()
    return { title: 'Something needs your attention', detail: single }
  }
  return { title: single }
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

  const [forgotExpanded, setForgotExpanded] = useState(false)

  const [forgotEmail, setForgotEmail] = useState('')

  const [isResetSending, setIsResetSending] = useState(false)

  const [resetSentMessage, setResetSentMessage] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false)

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const turnstileRef = useRef<TurnstileInstance | null>(null)

  const [turnstileSiteKey, setTurnstileSiteKey] = useState('')

  const supabase = useMemo(() => createClient(), [])

  const [authBanner, setAuthBanner] = useState<AuthBanner | null>(null)

  // Signed-in users should not stay on the login screen (consistent with / gate).
  useEffect(() => {
    if (searchParams.get('onboarding_complete') === 'true') return

    let cancelled = false
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!cancelled && session?.user) {
        router.replace('/auth/resolve')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router, supabase, searchParams])

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

    setAuthBanner({
      variant: 'warning',
      title: 'Quick security check',
      detail: 'Complete the verification below, then try again.',
    })

    return false

  }



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

    if (typeof window === 'undefined') return

    const err = searchParams.get('error')

    if (!err) return

    const decoded = decodeURIComponent(err)

    const clearErrorParam = () => {

      const u = new URL(window.location.href)

      u.searchParams.delete('error')

      const path = u.pathname + (u.search ? u.search : '')

      window.history.replaceState(null, '', path)

    }

    if (err === 'session_check_failed' || decoded.includes('session_unavailable')) {

      setAuthBanner({
        variant: 'warning',
        title: 'We couldn’t finish signing you in',
        detail:
          'Your session took too long or cookies may be blocked. Try a refresh.\n\nGoogle tip: In Supabase → Authentication → URL Configuration, add both http://localhost:3000/auth/callback and http://127.0.0.1:3000/auth/callback, then stick to one address in the browser (don’t mix localhost and 127.0.0.1).',
      })

      clearErrorParam()

      return

    }

    if (err === 'missing_supabase_env' || decoded.includes('missing_supabase_env')) {

      setAuthBanner({
        variant: 'info',
        title: 'Supabase isn’t configured',
        detail:
          'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see .env.example), then restart the dev server.',
      })

    } else {

      setAuthBanner({
        variant: 'warning',
        title: 'Sign-in didn’t complete',
        detail: `${decoded}\n\nIf “Continue with Google” keeps sending you back, check redirect URLs in Supabase and use either localhost or 127.0.0.1 consistently.`,
      })

    }

    clearErrorParam()

  }, [searchParams])



  const handleGoogleOAuth = async () => {

    setAuthBanner(null)

    setIsSigningIn(true)

    try {

      const { signInWithGoogle } = await import('@/lib/auth-utils')

      await signInWithGoogle()

    } catch (error) {

      console.error('❌ [LOGIN] OAuth error:', error)

      const errorMessage =

        error instanceof Error ? error.message : 'An error occurred. Please try again.'

      setAuthBanner({
        variant: 'error',
        title: 'Google sign-in hit a snag',
        detail: errorMessage,
      })

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

      setAuthBanner({ variant: 'error', title: 'Almost there', detail: err })

      return

    }



    if (!assertCaptchaCompleted()) {

      return

    }



    setAuthBanner(null)

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

        resetTurnstile()

        setIsEmailAuthPending(false)

        if (isLikelyWrongPassword(error.message)) {

          setAuthBanner({

            variant: 'error',

            title: 'Wrong password?',

            detail:

              'That email and password didn’t match anything we have. Try again — maybe a typo or caps lock? If you’re new here, use Create account instead.',

          })

          return

        }

        const augmented = augmentCaptchaAlertMessage(

          `Could not sign in: ${error.message}\n\nIf you are new here, use "Create account" instead.`,

          captchaConfigured,

        )

        const parsed = parseLongMessage(augmented)

        setAuthBanner({ variant: 'error', title: parsed.title, detail: parsed.detail })

        return

      }



      if (data.session) {

        window.location.href = '/auth/resolve'

        return

      }



      setAuthBanner({

        variant: 'info',

        title: 'No session after sign-in',

        detail:

          'Ask your admin to disable email confirmation for password sign-ups in Supabase, or confirm your email first.',

      })

      setIsEmailAuthPending(false)

    } catch (e) {

      console.error(e)

      setAuthBanner({

        variant: 'error',

        title: 'Something went wrong',

        detail: 'Try again in a moment, or use Continue with Google.',

      })

      resetTurnstile()

      setIsEmailAuthPending(false)

    }

  }



  const handleEmailSignUp = async () => {

    const normalizedEmail = email.toLowerCase().trim()

    const err = validateEmailPassword(normalizedEmail, password)

    if (err) {

      setAuthBanner({ variant: 'error', title: 'Almost there', detail: err })

      return

    }



    if (!assertCaptchaCompleted()) {

      return

    }



    setAuthBanner(null)

    setIsEmailAuthPending(true)

    try {

      if (sessionContext) sessionContext.updateEmail(normalizedEmail)



      const { data, error } = await supabase.auth.signUp({

        email: normalizedEmail,

        password,

        options: {

          emailRedirectTo: `${oauthClientOrigin()}/auth/resolve`,

          ...(captchaConfigured && captchaToken ? { captchaToken } : {}),

        },

      })



      if (error) {

        console.error('Sign up error:', error.message)

        const lower = error.message.toLowerCase()

        if (
          lower.includes('already') ||
          lower.includes('registered') ||
          lower.includes('exists') ||
          lower.includes('duplicate') ||
          lower.includes('this user') ||
          lower.includes('email address is already')
        ) {

          setAuthBanner({

            variant: 'warning',

            title: 'You’re already on the list',

            detail: 'That email is registered. Use Sign in instead (or Google up top).',

          })

        } else {

          const augmented = augmentCaptchaAlertMessage(

            `Could not create account: ${error.message}`,

            captchaConfigured,

          )

          const parsed = parseLongMessage(augmented)

          setAuthBanner({ variant: 'error', title: parsed.title, detail: parsed.detail })

        }

        resetTurnstile()

        setIsEmailAuthPending(false)

        return

      }



      if (data.session) {

        router.replace('/auth/resolve')

        return

      }



      setAuthBanner({

        variant: 'info',

        title: 'Check your inbox — almost there',

        detail:

          'Account created, but there’s no session yet. In Supabase, turn off email confirmation for the Email provider so password sign-in works right away.',

      })

      setIsEmailAuthPending(false)

    } catch (e) {

      console.error(e)

      setAuthBanner({

        variant: 'error',

        title: 'Something went wrong',

        detail: 'Try again in a moment, or use Google sign-in.',

      })

      resetTurnstile()

      setIsEmailAuthPending(false)

    }

  }



  const handleSendPasswordReset = async () => {

    const normalized = forgotEmail.trim().toLowerCase()

    if (!normalized || !normalized.includes('@')) {

      setAuthBanner({

        variant: 'warning',

        title: 'We need your email',

        detail: 'Enter the address tied to your DreamScale account.',

      })

      return

    }



    if (!assertCaptchaCompleted()) {

      return

    }



    setIsResetSending(true)

    setResetSentMessage(null)



    try {

      const { error } = await supabase.auth.resetPasswordForEmail(normalized, {

        redirectTo: `${oauthClientOrigin()}/auth/update-password`,

        ...(captchaConfigured && captchaToken ? { captchaToken } : {}),

      })

      if (error) {

        const augmented = augmentCaptchaAlertMessage(

          `Could not send reset email: ${error.message}`,

          captchaConfigured,

        )

        const parsed = parseLongMessage(augmented)

        setAuthBanner({ variant: 'error', title: parsed.title, detail: parsed.detail })

        resetTurnstile()

      } else {

        setResetSentMessage('If that address has an account, you will receive a password reset email shortly.')

        setForgotExpanded(false)

      }

    } catch (e) {

      console.error(e)

      setAuthBanner({

        variant: 'error',

        title: 'Couldn’t send that email',

        detail: 'Try again in a moment.',

      })

    } finally {

      setIsResetSending(false)

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

          {authBanner ? (
            <div
              role="alert"
              className={cn(
                'relative overflow-hidden rounded-xl border p-4 pr-11 shadow-sm',
                authBanner.variant === 'error' &&
                  'border-rose-200/90 bg-gradient-to-br from-rose-50 via-white to-[#fff1f2]',
                authBanner.variant === 'warning' &&
                  'border-amber-200/90 bg-gradient-to-br from-amber-50/95 to-white',
                authBanner.variant === 'info' &&
                  'border-[#005DFF]/25 bg-gradient-to-br from-[#eff6ff] to-white',
              )}
            >
              <button
                type="button"
                onClick={() => setAuthBanner(null)}
                className="absolute right-2.5 top-2.5 rounded-md p-1 text-gray-500 transition-colors hover:bg-black/[0.06] hover:text-gray-800"
                aria-label="Dismiss message"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                    authBanner.variant === 'error' && 'bg-rose-100 text-rose-600',
                    authBanner.variant === 'warning' && 'bg-amber-100 text-amber-700',
                    authBanner.variant === 'info' && 'bg-[#005DFF]/12 text-[#005DFF]',
                  )}
                >
                  {authBanner.variant === 'error' ? (
                    <Frown className="h-6 w-6" strokeWidth={2} aria-hidden />
                  ) : authBanner.variant === 'warning' ? (
                    <AlertCircle className="h-5 w-5" aria-hidden />
                  ) : (
                    <Info className="h-5 w-5" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className={cn(
                      'font-semibold leading-snug',
                      authBanner.variant === 'error' && 'text-rose-950',
                      authBanner.variant === 'warning' && 'text-amber-950',
                      authBanner.variant === 'info' && 'text-[#0a1f44]',
                    )}
                  >
                    {authBanner.title}
                  </p>
                  {authBanner.detail ? (
                    <p
                      className={cn(
                        'mt-1.5 text-sm leading-relaxed whitespace-pre-line',
                        authBanner.variant === 'error' && 'text-rose-900/85',
                        authBanner.variant === 'warning' && 'text-amber-950/85',
                        authBanner.variant === 'info' && 'text-[#1e3a5f]/90',
                      )}
                    >
                      {authBanner.detail}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {!isEmailMode && (

            <>

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

                    setAuthBanner(null)

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

                    setAuthBanner(null)

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

