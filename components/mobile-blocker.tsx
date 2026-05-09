'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Monitor, Smartphone } from 'lucide-react'
import Image from 'next/image'

const MOBILE_BREAKPOINT = 768

// Routes that are allowed on mobile
const MOBILE_ALLOWED_ROUTES = [
  '/login',
  '/landing',
  '/onboarding',
  '/auth/callback',
  '/auth/resolve',
]

export function MobileBlocker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)

  // Check if current route is allowed on mobile
  const isAllowedRoute = MOBILE_ALLOWED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      setIsBlocked(mobile && !isAllowedRoute)
    }

    // Initial check
    checkMobile()

    // Listen for resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isAllowedRoute])

  // Update blocked state when route changes
  useEffect(() => {
    if (isMobile !== null) {
      setIsBlocked(isMobile && !isAllowedRoute)
    }
  }, [pathname, isMobile, isAllowedRoute])

  // Don't render blocker until we know if it's mobile
  if (isMobile === null) {
    return <>{children}</>
  }

  // Show blocker on mobile for non-allowed routes
  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
              <Image 
                src="/Logo.png" 
                alt="DreamScale Logo" 
                width={64} 
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Icon Animation */}
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <Smartphone className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 border-2 border-red-400 rounded-full flex items-center justify-center">
                  <div className="w-12 h-0.5 bg-red-400 rotate-45 absolute"></div>
                </div>
              </div>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <Monitor className="w-12 h-12 text-blue-500 dark:text-blue-400" />
          </div>

          {/* Main Message */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Desktop Experience Required
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              DreamScale is optimized for desktop and laptop computers to give you the best experience with all our powerful AI tools.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              How to continue:
            </h2>
            <ol className="text-left space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Open your laptop or desktop computer</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Visit <strong className="text-blue-600 dark:text-blue-400">dreamscale.app</strong> in your browser</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Sign in with the same account to continue where you left off</span>
              </li>
            </ol>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            We're working on a mobile experience. Stay tuned!
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
