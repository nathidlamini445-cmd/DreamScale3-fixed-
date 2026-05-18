'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useSessionSafe } from '@/lib/session-context'

interface OnboardingGuardProps {
  children: React.ReactNode
}

/** Routes that never get an onboarding redirect (entry, auth, marketing). */
function entryOrAuthPath(pathname: string | null): boolean {
  if (!pathname) return true
  if (pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/landing' || pathname === '/onboarding') {
    return true
  }
  if (pathname.startsWith('/auth/')) return true
  if (pathname === '/feedback' || pathname.startsWith('/feedback/')) return true
  return false
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const sessionContext = useSessionSafe()
  const loading = !isLoaded
  const authResolved = isLoaded
  const sessionLoading = sessionContext?.isLoadingSession === true
  const onboardingCompleted =
    sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted === true

  useEffect(() => {
    if (!authResolved || loading) return
    /** Wait for Supabase session row before deciding onboarding (prevents refresh flicker). */
    if (user?.id && sessionLoading) return

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
    if (!entryOrAuthPath(pathname) && pathname !== '/onboarding') {
      router.replace('/onboarding')
    }
  }, [authResolved, loading, pathname, user?.id, onboardingCompleted, sessionLoading, router])

  const showRedirectSpinner =
    authResolved &&
    !loading &&
    !!user?.id &&
    !sessionLoading &&
    onboardingCompleted !== true &&
    !entryOrAuthPath(pathname) &&
    pathname !== '/onboarding'

  if (showRedirectSpinner) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-[#005DFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
