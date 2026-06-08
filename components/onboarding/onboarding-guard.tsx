'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useSessionSafe } from '@/lib/session-context'
import { isAuthEntryPath } from '@/lib/public-routes'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const sessionContext = useSessionSafe()
  const loading = !isLoaded
  const authResolved = isLoaded
  const sessionLoading = sessionContext?.isLoadingSession === true
  const hasHydratedUserSession = sessionContext?.hasHydratedUserSession === true
  const updateEntrepreneurProfile = sessionContext?.updateEntrepreneurProfile
  const onboardingCompleted =
    sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted === true
  const [profileCheckDone, setProfileCheckDone] = useState(false)
  const [profileOnboardingComplete, setProfileOnboardingComplete] = useState(false)

  useEffect(() => {
    setProfileCheckDone(false)
    setProfileOnboardingComplete(false)
  }, [user?.id])

  useEffect(() => {
    if (!authResolved || loading || !user?.id || sessionLoading || !hasHydratedUserSession) {
      return
    }
    if (onboardingCompleted) {
      setProfileCheckDone(true)
      setProfileOnboardingComplete(true)
      return
    }
    if (profileCheckDone) return

    let cancelled = false
    void fetch('/api/me/onboarding-status', { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) return false
        const body = (await res.json()) as { onboardingCompleted?: boolean }
        return body.onboardingCompleted === true
      })
      .then((complete) => {
        if (cancelled) return
        setProfileCheckDone(true)
        setProfileOnboardingComplete(complete)
        if (complete && updateEntrepreneurProfile) {
          void updateEntrepreneurProfile({ onboardingCompleted: true })
        }
      })
      .catch(() => {
        if (cancelled) return
        setProfileCheckDone(true)
        setProfileOnboardingComplete(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    authResolved,
    loading,
    user?.id,
    sessionLoading,
    hasHydratedUserSession,
    onboardingCompleted,
    profileCheckDone,
    updateEntrepreneurProfile,
  ])

  const effectivelyOnboarded = onboardingCompleted || profileOnboardingComplete

  useEffect(() => {
    if (!authResolved || loading) return
    /** Wait for Supabase session row before deciding onboarding (prevents refresh flicker). */
    if (user?.id && sessionLoading) return
    /** Also wait until signed-in hydration has completed at least once. */
    if (user?.id && !hasHydratedUserSession) return
    /** If session says incomplete, wait for user_profiles verification. */
    if (user?.id && !onboardingCompleted && !profileCheckDone) return

    if (pathname === '/onboarding') {
      if (user?.id && effectivelyOnboarded) {
        router.replace('/dashboard')
      }
      return
    }

    if (!user?.id) return
    if (user.id && effectivelyOnboarded) return

    // Signed in but onboarding not finished: keep them on the onboarding route only —
    // do not mount the dashboard (or heavy pages) underneath the wizard anymore.
    if (!isAuthEntryPath(pathname) && pathname !== '/onboarding') {
      router.replace('/onboarding')
    }
  }, [
    authResolved,
    loading,
    pathname,
    user?.id,
    onboardingCompleted,
    effectivelyOnboarded,
    sessionLoading,
    hasHydratedUserSession,
    profileCheckDone,
    router,
  ])

  const showRedirectSpinner =
    authResolved &&
    !loading &&
    !!user?.id &&
    (
      sessionLoading ||
      !hasHydratedUserSession ||
      (!onboardingCompleted && !profileCheckDone) ||
      (!effectivelyOnboarded &&
        !isAuthEntryPath(pathname) &&
        pathname !== '/onboarding')
    )

  if (showRedirectSpinner) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-[#005DFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
