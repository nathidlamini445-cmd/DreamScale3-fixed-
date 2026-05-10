'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

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
  const { user, onboardingCompleted, loading, authResolved } = useAuth()

  useEffect(() => {
    if (!authResolved || loading) return

    if (pathname === '/onboarding') {
      if (user?.id && onboardingCompleted) {
        router.replace('/auth/resolve')
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
  }, [authResolved, loading, pathname, user?.id, onboardingCompleted, router])

  const showRedirectSpinner =
    authResolved &&
    !loading &&
    !!user?.id &&
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
