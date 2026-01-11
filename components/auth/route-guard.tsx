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
  const [hasTimedOut, setHasTimedOut] = useState(false)

  // Memoize public routes check
  // Note: '/' (home) is NOT public - it requires authentication
  const isPublicRoute = ['/login', '/landing', '/auth/callback', '/auth/resolve'].includes(pathname)

  useEffect(() => {
    // CRITICAL: For public routes, never show loading - render immediately
    if (isPublicRoute) {
      setIsLoading(false)
      setHasTimedOut(false)
      return
    }

    // Timeout after 2 seconds - don't block forever
    const timeout = setTimeout(() => {
      console.warn('⚠️ [RouteGuard] Auth check timed out - allowing content to render')
      setHasTimedOut(true)
      setIsLoading(false)
    }, 2000)

    // Only show loading while auth is resolving (for protected routes only)
    if (loading || !authResolved) {
      setIsLoading(true)
    } else {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 100)
      clearTimeout(timeout)
      return () => clearTimeout(timer)
    }

    return () => clearTimeout(timeout)
  }, [loading, authResolved, isPublicRoute])

  // CRITICAL: Never block public routes - render immediately
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Show loading state only for protected routes (and not timed out)
  if (isLoading && !hasTimedOut) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-opacity duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#005DFF] border-t-transparent"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  // If timed out, render children anyway (don't block forever)
  if (hasTimedOut) {
    return <>{children}</>
  }

  return <>{children}</>
}
