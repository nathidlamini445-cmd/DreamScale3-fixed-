'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * RouteGuard - PASSIVE component that only shows loading states
 * 
 * CRITICAL: This component NO LONGER makes routing decisions or redirects.
 * All auth-based routing is handled by /auth/resolve route.
 * 
 * This component only:
 * - Shows loading state while auth is resolving
 * - Allows access to public routes
 * - Renders children when ready
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { loading, authResolved } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  // Memoize public routes check
  const isPublicRoute = ['/login', '/landing', '/', '/auth/callback', '/auth/resolve'].includes(pathname)

  useEffect(() => {
    // Only show loading while auth is resolving
    if (loading || !authResolved) {
      setIsLoading(true)
    } else {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading, authResolved])

  // Show loading state only for protected routes
  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-opacity duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#005DFF] border-t-transparent"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
