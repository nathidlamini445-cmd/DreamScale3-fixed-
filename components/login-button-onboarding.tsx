'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

/** Google sign-in for onboarding welcome — mirrors /login primary CTA. */
export function LoginButton() {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(null)

  const handleGoogleOAuth = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setOauthError(null)
    setIsSigningIn(true)

    try {
      const { signInWithGoogle } = await import('@/lib/auth-utils')
      await signInWithGoogle()
    } catch (error) {
      console.error('OAuth error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred. Please try again.'
      setOauthError(errorMessage)
      setIsSigningIn(false)
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end sm:min-w-[220px]" style={{ zIndex: 1000 }}>
      {oauthError ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-left text-sm text-rose-900"
        >
          <p className="font-medium">Couldn’t start Google sign-in</p>
          <p className="mt-1 text-rose-800/90">{oauthError}</p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleGoogleOAuth}
        disabled={isSigningIn}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#005DFF] px-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0048CC] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
        aria-label="Continue with Google"
      >
        {isSigningIn ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#005DFF]">
              G
            </span>
            <span>Continue with Google</span>
          </>
        )}
      </button>
      <Link
        href="/login"
        className="text-center text-xs font-medium text-[#005DFF] hover:text-[#0048CC] sm:text-right"
      >
        More sign-in options
      </Link>
    </div>
  )
}
