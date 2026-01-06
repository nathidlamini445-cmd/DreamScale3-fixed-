'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSessionSafe } from '@/lib/session-context'
import { IntegratedOnboarding } from './integrated-onboarding'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const sessionContext = useSessionSafe()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showWhiteScreen, setShowWhiteScreen] = useState(false)
  
  // Don't show onboarding guard on login page
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check onboarding status from both session context and localStorage
  useEffect(() => {
    if (!mounted) return
    
    // Skip onboarding check on login page
    if (pathname === '/login') {
      setIsChecking(false)
      setShowOnboarding(false)
      return
    }

    setIsChecking(true)

    // First, check session context
    const sessionCompleted = sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted
    const sessionEmail = sessionContext?.sessionData?.email

    // Also check localStorage directly as a fallback (in case session hasn't loaded yet)
    let localStorageCompleted = false
    try {
      if (typeof window !== 'undefined') {
        // First, check the current email from localStorage
        const currentEmail = localStorage.getItem('dreamscale_current_email')
        const emailToCheck = sessionEmail || currentEmail
        
        // Check email-keyed storage first (most reliable)
        if (emailToCheck) {
          const normalizedEmail = emailToCheck.toLowerCase().trim()
          const emailKeyedStorage = localStorage.getItem(`dreamscale_session_${normalizedEmail}`)
          if (emailKeyedStorage) {
            try {
              const parsed = JSON.parse(emailKeyedStorage)
              localStorageCompleted = parsed?.entrepreneurProfile?.onboardingCompleted === true
              console.log('📧 Checked email-keyed storage for:', normalizedEmail, 'Result:', localStorageCompleted)
            } catch (parseError) {
              console.error('Error parsing email-keyed storage:', parseError)
            }
          }
        }
        
        // Check legacy session storage as fallback
        if (!localStorageCompleted) {
          const stored = localStorage.getItem('dreamscale_session')
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              localStorageCompleted = parsed?.entrepreneurProfile?.onboardingCompleted === true
              console.log('📦 Checked legacy session storage, Result:', localStorageCompleted)
            } catch (parseError) {
              console.error('Error parsing legacy session:', parseError)
            }
          }
        }
        
        // Also check the standalone onboarding flag
        if (!localStorageCompleted) {
          localStorageCompleted = localStorage.getItem('onboardingCompleted') === 'true'
          console.log('🏁 Checked standalone onboarding flag, Result:', localStorageCompleted)
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
      willShowOnboarding: !isCompleted,
      hasEmail: !!sessionEmail
    })

    setShowOnboarding(!isCompleted)
    setIsChecking(false)
  }, [mounted, pathname, sessionContext, sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted, sessionContext?.sessionData?.email])

  const handleOnboardingComplete = () => {
    // Close onboarding and show white screen for 8 seconds
    setShowOnboarding(false)
    setShowWhiteScreen(true)
    
    // After 8 seconds, hide white screen and show the app
    setTimeout(() => {
      setShowWhiteScreen(false)
    }, 8000) // 8 seconds
  }

  // Skip onboarding guard on login page - check early
  if (isLoginPage) {
    return <>{children}</>
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

  // Show white screen with welcoming message for 8 seconds after submitting answers
  if (showWhiteScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center px-4 max-w-xl">
          {/* Logo - Minimalistic but larger */}
          <div className="flex justify-center mb-12">
            <div className="relative w-24 h-24 opacity-60">
              <Image
                src="/Logo.png"
                alt="DreamScale Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Welcome Message - Notion-style minimalistic but bigger */}
          <div className="space-y-4 mb-12">
            <h1 className="text-5xl font-normal tracking-normal text-[#37352f] dark:text-[#e9e9e7] leading-tight">
              Welcome to DreamScale
            </h1>
            <p className="text-xl text-[#787774] dark:text-[#9b9a97] font-normal leading-relaxed">
              Let's make your dreams come true
            </p>
          </div>

          {/* Loading Indicator - Subtle and minimal but larger */}
          <div className="flex justify-center">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-2 border-[#e9e9e9] dark:border-[#37352f] rounded-full"></div>
              <div className="absolute inset-0 border-2 border-transparent border-t-[#37352f] dark:border-t-[#e9e9e7] rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User has completed onboarding - show the app
  return <>{children}</>
}

