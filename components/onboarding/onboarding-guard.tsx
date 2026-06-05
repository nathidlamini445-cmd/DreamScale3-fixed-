'use client'

import { useEffect } from 'react'
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
  const onboardingCompleted =
    sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted === true

  useEffect(() => {
    if (!authResolved || loading) return
    /** Wait for Supabase session row before deciding onboarding (prevents refresh flicker). */
    if (user?.id && sessionLoading) return
    /** Also wait until signed-in hydration has completed at least once. */
    if (user?.id && !hasHydratedUserSession) return

    if (pathname === '/onboarding') {
      if (user?.id && onboardingCompleted) {
        router.replace('/dashboard')
      }
      return
    }

    if (!user?.id) return
    if (user.id && onboardingCompleted) return

    // Signed in but onboarding not finished: keep them on the onboarding route only —
    // do not mount the dashboard (or heavy pages) underneath the wizard anymore.
    if (!isAuthEntryPath(pathname) && pathname !== '/onboarding') {
      router.replace('/onboarding')
    }
  }, [authResolved, loading, pathname, user?.id, onboardingCompleted, sessionLoading, hasHydratedUserSession, router])

  const showRedirectSpinner =
    authResolved &&
    !loading &&
    !!user?.id &&
    (
      sessionLoading ||
      !hasHydratedUserSession ||
      (onboardingCompleted !== true &&
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
