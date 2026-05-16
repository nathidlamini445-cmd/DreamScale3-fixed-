'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Client-side resolver: after OAuth, cookie-backed session is visible to the browser
 * immediately, while Server Components occasionally never "see" the new cookies on the
 * first navigation (production: infinite spinner on /auth/resolve).
 *
 * Routing rules match the previous server implementation:
 * - no session → /login?error=session_check_failed
 * - onboarding_completed → /dashboard
 * - else → /onboarding
 */
const FIRST_SESSION_MS = 14_000
const RETRY_SESSION_MS = 12_000
const PROFILE_MS = 14_000

export default function AuthResolvePage() {
  const [label, setLabel] = useState('Verifying session…')

  useEffect(() => {
    let cancelled = false

    async function resolveAuth() {
      try {
        const supabase = createClient()

        const getSessionOrTimeout = (ms: number) =>
          Promise.race([
            supabase.auth.getSession(),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
          ])

        setLabel('Verifying session…')
        let raw = await getSessionOrTimeout(FIRST_SESSION_MS)

        if (cancelled) return

        // Second chance: cookies right after /auth/callback can lag one frame on some browsers
        if (raw === null) {
          setLabel('Still signing you in…')
          await new Promise((r) => setTimeout(r, 450))
          raw = await getSessionOrTimeout(RETRY_SESSION_MS)
        }

        if (cancelled) return

        if (raw === null) {
          window.location.replace('/login?error=session_check_failed')
          return
        }

        const session = raw.data?.session
        if (!session?.user?.id) {
          window.location.replace('/login?error=session_check_failed')
          return
        }

        const userId = session.user.id
        setLabel('Loading your workspace…')

        const profileResult = await Promise.race([
          supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('id', userId)
            .maybeSingle(),
          new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), PROFILE_MS)),
        ])

        if (cancelled) return

        if (profileResult === 'timeout') {
          console.warn('[auth/resolve] profile query timed out — continuing to onboarding')
          window.location.replace('/onboarding')
          return
        }

        const onboardingDone = profileResult.data?.onboarding_completed === true

        if (onboardingDone) {
          window.location.replace('/dashboard')
        } else {
          window.location.replace('/onboarding')
        }
      } catch (e) {
        console.error('[auth/resolve]', e)
        if (!cancelled) {
          window.location.replace('/login?error=session_check_failed')
        }
      }
    }

    void resolveAuth()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center gap-3 px-4">
      <div
        className="h-10 w-10 border-2 border-[#005DFF] border-t-transparent rounded-full animate-spin"
        aria-hidden
      />
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">{label}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-xs">
        If this takes too long, refresh the page or sign in again.
      </p>
    </div>
  )
}
