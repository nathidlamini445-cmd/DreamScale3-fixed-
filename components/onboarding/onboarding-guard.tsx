'use client'

import { useEffect, useState } from 'react'
import { useSessionSafe } from '@/lib/session-context'
import { IntegratedOnboarding } from './integrated-onboarding'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const sessionContext = useSessionSafe()
  const [mounted, setMounted] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check onboarding status from both session context and localStorage
  useEffect(() => {
    if (!mounted) return

    setIsChecking(true)

    // First, check session context
    const sessionCompleted = sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted

    // Also check localStorage directly as a fallback (in case session hasn't loaded yet)
    let localStorageCompleted = false
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('dreamscale_session')
        if (stored) {
          const parsed = JSON.parse(stored)
          localStorageCompleted = parsed?.entrepreneurProfile?.onboardingCompleted === true
        }
      }
    } catch (error) {
      console.error('Error checking localStorage for onboarding status:', error)
    }

    // Only show onboarding if BOTH checks confirm it's NOT completed
    // If either source says it's completed, skip onboarding
    const isCompleted = sessionCompleted === true || localStorageCompleted === true
    
    console.log('🔍 Onboarding check:', {
      sessionCompleted,
      localStorageCompleted,
      isCompleted,
      willShowOnboarding: !isCompleted
    })

    setShowOnboarding(!isCompleted)
    setIsChecking(false)
  }, [mounted, sessionContext, sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted])

  const handleOnboardingComplete = () => {
    // Immediately hide onboarding and let the useEffect handle the state update
    setShowOnboarding(false)
    
    // Double-check after a short delay
    setTimeout(() => {
      const sessionCompleted = sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted
      let localStorageCompleted = false
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('dreamscale_session')
          if (stored) {
            const parsed = JSON.parse(stored)
            localStorageCompleted = parsed?.entrepreneurProfile?.onboardingCompleted === true
          }
        }
      } catch (error) {
        console.error('Error checking localStorage:', error)
      }

      if (sessionCompleted || localStorageCompleted) {
        setShowOnboarding(false)
      }
    }, 200)
  }

  // Show loading while checking
  if (!mounted || isChecking) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show onboarding ONLY if not completed
  if (showOnboarding) {
    return (
      <IntegratedOnboarding 
        isOpen={true} 
        onClose={handleOnboardingComplete}
      />
    )
  }

  // User has completed onboarding - show the app
  return <>{children}</>
}

