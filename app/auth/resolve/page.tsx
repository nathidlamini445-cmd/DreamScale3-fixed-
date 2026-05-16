'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

/**
 * Client-side resolver after OAuth / callback. Uses polling so we don't depend on
 * a single getSession() race when cookie chunks are still settling.
 *
 * Hardening (production):
 * - getSession errors/rejections don't leave Promise.race hanging
 * - profile query errors/timeouts → /onboarding (never spin forever)
 * - hard wall-clock fallback → login if nothing navigated
 * - Strict Mode: useRef guard so the first aborted run can't block the second
 */
const SESSION_POLL_MAX_MS = 26_000
const SESSION_POLL_INTERVAL_MS = 350
const PROFILE_MS = 12_000
const HARD_FALLBACK_MS = 32_000

export default function AuthResolvePage() {
  const [label, setLabel] = useState('Verifying session…')
  const cancelledRef = useRef(false)
  const navigatedRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    navigatedRef.current = false

    function navigate(href: string) {
      if (cancelledRef.current || navigatedRef.current) return
      navigatedRef.current = true
      window.location.replace(href)
    }

    const hardTimer = window.setTimeout(() => {
      if (cancelledRef.current || navigatedRef.current) return
      console.warn('[auth/resolve] hard fallback — forcing login (session never resolved in time)')
      navigate('/login?error=session_check_failed')
    }, HARD_FALLBACK_MS)

    async function waitForBrowserSession(
      supabase: ReturnType<typeof createClient>
    ): Promise<Session | null> {
      const deadline = Date.now() + SESSION_POLL_MAX_MS
      let lastErr: unknown
      while (Date.now() < deadline) {
        if (cancelledRef.current) return null
        try {
          const { data, error } = await supabase.auth.getSession()
          if (error) lastErr = error
          const session = data?.session
          if (session?.user?.id) return session
        } catch (e) {
          lastErr = e
        }
        setLabel('Still signing you in…')
        await new Promise((r) => setTimeout(r, SESSION_POLL_INTERVAL_MS))
      }
      if (lastErr) console.warn('[auth/resolve] session poll stopped without session', lastErr)
      return null
    }

    async function resolveAuth() {
      try {
        const supabase = createClient()

        setLabel('Verifying session…')
        const session = await waitForBrowserSession(supabase)

        if (cancelledRef.current) return

        if (!session?.user?.id) {
          navigate('/login?error=session_check_failed')
          return
        }

        const userId = session.user.id
        setLabel('Loading your workspace…')

        let onboardingDone = false
        try {
          const raced = await Promise.race([
            supabase
              .from('user_profiles')
              .select('onboarding_completed')
              .eq('id', userId)
              .maybeSingle(),
            new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), PROFILE_MS)),
          ])

          if (cancelledRef.current) return

          if (raced === 'timeout') {
            console.warn('[auth/resolve] profile query timed out — continuing to onboarding')
            onboardingDone = false
          } else if (raced.error) {
            console.warn('[auth/resolve] profile query error — continuing to onboarding', raced.error)
            onboardingDone = false
          } else {
            onboardingDone = raced.data?.onboarding_completed === true
          }
        } catch (e) {
          console.warn('[auth/resolve] profile fetch threw — continuing to onboarding', e)
          onboardingDone = false
        }

        if (cancelledRef.current) return

        navigate(onboardingDone ? '/dashboard' : '/onboarding')
      } catch (e) {
        console.error('[auth/resolve]', e)
        if (!cancelledRef.current) {
          navigate('/login?error=session_check_failed')
        }
      } finally {
        window.clearTimeout(hardTimer)
      }
    }

    void resolveAuth()

    return () => {
      cancelledRef.current = true
      window.clearTimeout(hardTimer)
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
