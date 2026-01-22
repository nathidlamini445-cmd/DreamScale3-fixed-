'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSessionSafe } from '@/lib/session-context'
import { useAuth } from '@/contexts/AuthContext'
import { IntegratedOnboarding } from './integrated-onboarding'
import { createClient } from '@/lib/supabase/client'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  // CRITICAL: All hooks must be called FIRST, before ANY other code
  // React requires hooks to be called in the same order on every render
  // If any hook throws or returns conditionally, it breaks the Rules of Hooks
  
  // CRITICAL: Call all hooks first, in the same order every render
  // This is required by React's Rules of Hooks - hooks must ALWAYS be called
  const sessionContext = useSessionSafe()
  const { user, profile, onboardingCompleted: supabaseOnboardingCompleted, loading: authLoading } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showWhiteScreen, setShowWhiteScreen] = useState(false)
  const [authLoadingTimeout, setAuthLoadingTimeout] = useState(false)
  const supabase = createClient()
  
  // Define constants after hooks
  const isLoginPage = pathname === '/login'
  const isFeedbackPage = pathname === '/feedback' || pathname?.startsWith('/feedback/')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Add timeout for auth loading - if it takes too long, proceed anyway
  useEffect(() => {
    if (authLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Auth loading timed out after 2 seconds - proceeding with onboarding check')
        setAuthLoadingTimeout(true)
      }, 2000) // Reduced to 2 seconds
      return () => clearTimeout(timeout)
    } else {
      setAuthLoadingTimeout(false)
    }
  }, [authLoading])

  // CRITICAL: Global loading timeout - force stop ALL loading after 2 seconds maximum
  useEffect(() => {
    const globalLoadingTimeout = setTimeout(() => {
      console.warn('⚠️ GLOBAL LOADING TIMEOUT: Force stopping all loading states after 2 seconds')
      setIsChecking(false)
      setAuthLoadingTimeout(true) // Force auth timeout
      // CRITICAL: Default to NOT showing onboarding if we can't determine status
      // This prevents false redirects for users who have completed onboarding
      // Only show onboarding if we're certain they haven't completed it
      setShowOnboarding(false)
    }, 2000) // 2 second absolute maximum - reduced to prevent blank screen

    return () => clearTimeout(globalLoadingTimeout)
  }, [mounted])

  // REMOVED: Onboarding check removed - /onboarding route handles onboarding display
  // OnboardingGuard only shows onboarding overlay if explicitly needed
  useEffect(() => {
    setIsChecking(false)
    setShowOnboarding(false)
    return
    // REMOVED: All redirect logic - removed to prevent loops
    /*
    if (!mounted) return
    
    // CRITICAL: Skip onboarding check on login page - allow immediate access
    if (pathname === '/login') {
      console.log('✅ Login page detected - skipping onboarding check')
      setIsChecking(false)
      setShowOnboarding(false)
      return
    }

    // CRITICAL: Check onboarding status from AuthContext first (source of truth)
    // Only skip onboarding if AuthContext confirms it's completed
    // Don't skip just because there's a session email - user might want to complete onboarding
    if (user?.email && supabaseOnboardingCompleted === true) {
      console.log('✅ Authenticated user with completed onboarding detected:', user.email, '- skipping onboarding')
      setIsChecking(false)
      setShowOnboarding(false)
      return
    }
    
    // CRITICAL: If user is authenticated but onboarding is NOT completed (false, null, or undefined)
    // This includes new users (profile doesn't exist yet) and existing users who haven't completed onboarding
    // Show onboarding for ALL authenticated users who haven't completed it
    // CRITICAL: New users have profile = null, so supabaseOnboardingCompleted will be false (from profile?.onboarding_completed ?? false)
    if (user?.email && supabaseOnboardingCompleted !== true) {
      console.log('🆕 Authenticated user but onboarding not completed - showing onboarding:', {
        userEmail: user.email,
        supabaseOnboardingCompleted,
        profileExists: !!profile,
        isNewUser: !profile
      })
      setIsChecking(false)
      setShowOnboarding(true)
      return
    }

    // Wait for auth to finish loading, but with timeout fallback
    if (authLoading && !authLoadingTimeout) {
      return
    }

    setIsChecking(true)

    const checkOnboardingStatus = async () => {
      // CRITICAL: Add a timeout to prevent infinite loading - reduced to 3 seconds
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Onboarding check timed out after 3 seconds - defaulting to NOT show onboarding (safer for existing users)')
        setIsChecking(false)
        // CRITICAL: Default to NOT showing onboarding on timeout
        // This prevents false redirects for users who have completed onboarding
        setShowOnboarding(false)
      }, 3000) // 3 second timeout

      try {
        // PRIORITY 1: Check localStorage for quick check (fastest)
        let localStorageCompleted = false
        try {
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dreamscale_onboarding_completed')
            localStorageCompleted = stored === 'true'
            if (localStorageCompleted) {
              console.log('✅ Found onboarding completed in localStorage')
            }
          }
        } catch (e) {
          // Ignore localStorage errors
        }

        // PRIORITY 2: Check Supabase profile (source of truth)
        let supabaseCompleted = false
        
        if (user?.id && supabase) {
          try {
            // Check the profile from AuthContext first (already loaded)
            supabaseCompleted = supabaseOnboardingCompleted === true
            
            // Also query directly for double-check (with timeout)
            if (!supabaseCompleted) {
              const profilePromise = supabase
                .from('user_profiles')
                .select('onboarding_completed')
                .eq('id', user.id)
                .single()
              
              // Add timeout to Supabase query
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Query timeout')), 2000)
              )
              
              try {
                const { data: profile, error } = await Promise.race([
                  profilePromise,
                  timeoutPromise
                ]) as any
                
                if (!error && profile) {
                  supabaseCompleted = profile.onboarding_completed === true
                  console.log('✅ Checked Supabase directly - onboarding completed:', supabaseCompleted)
                }
              } catch (timeoutError) {
                console.warn('⚠️ Supabase query timed out, using AuthContext value')
                // Use AuthContext value if query times out
                supabaseCompleted = supabaseOnboardingCompleted === true
              }
            } else {
              console.log('✅ Checked Supabase via AuthContext - onboarding completed:', supabaseCompleted)
            }
          } catch (error) {
            console.error('Error checking Supabase:', error)
          }
        }
      
        // PRIORITY 3: Check session context
        const sessionCompleted = sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted

        // Determine final onboarding status - if ANY source says completed, trust it
        const hasCompletedOnboarding = localStorageCompleted || supabaseCompleted || sessionCompleted === true

        clearTimeout(timeoutId)
        setIsChecking(false)
        // CRITICAL: Only show onboarding if we're CERTAIN they haven't completed it
        // Default to NOT showing if we can't determine (safer for existing users)
        setShowOnboarding(!hasCompletedOnboarding)
        
        console.log('🔍 Onboarding status check:', {
          localStorageCompleted,
          supabaseCompleted,
          sessionCompleted,
          hasCompletedOnboarding,
          showOnboarding: !hasCompletedOnboarding
        })
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        clearTimeout(timeoutId)
        setIsChecking(false)
        // CRITICAL: Default to NOT showing onboarding on error (safer for existing users)
        setShowOnboarding(false)
      }
    }

    checkOnboardingStatus()

    // CRITICAL: Global timeout - ALWAYS stop checking after 2 seconds maximum
    // This prevents infinite loading no matter what
    const globalTimeout = setTimeout(() => {
      console.warn('⚠️ GLOBAL TIMEOUT: Force stopping onboarding check after 2 seconds')
      setIsChecking(false)
      // CRITICAL: If user is authenticated but we can't determine status, show onboarding
      // This allows users to complete onboarding even if status check fails
      if (user?.email) {
        console.log('⚠️ Timeout but user is authenticated - showing onboarding to allow completion')
        setShowOnboarding(true)
      } else {
        setShowOnboarding(false)
      }
    }, 2000) // Reduced to 2 seconds to prevent blank screen

    return () => {
      clearTimeout(globalTimeout)
    }
    */
  }, [])

  // CRITICAL: Force stop loading after 1 second to prevent blank screen
  // This must be called BEFORE any conditional returns
  useEffect(() => {
    const forceStopTimeout = setTimeout(() => {
      if (isChecking || (authLoading && !authLoadingTimeout)) {
        console.warn('⚠️ Force stopping loading after 1 second to prevent blank screen')
        setIsChecking(false)
        setAuthLoadingTimeout(true)
        // CRITICAL: If user is authenticated but we can't determine status, show onboarding
        // This allows users to complete onboarding even if status check fails
        if (user?.email && supabaseOnboardingCompleted !== true) {
          console.log('⚠️ Force stop but user is authenticated with incomplete onboarding - showing onboarding')
          setShowOnboarding(true)
        } else {
          setShowOnboarding(false)
        }
      }
    }, 1000) // Reduced to 1 second to prevent blank screen
    return () => clearTimeout(forceStopTimeout)
  }, [isChecking, authLoading, authLoadingTimeout, user, supabaseOnboardingCompleted])

  // CRITICAL: After timeout, check if user is authenticated but onboarding incomplete
  // If so, show onboarding instead of app
  // This must be in useEffect to prevent infinite re-renders
  // CRITICAL: Must be BEFORE any conditional returns to comply with Rules of Hooks
  useEffect(() => {
    if (mounted && !isChecking && authLoadingTimeout) {
      if (user?.email && supabaseOnboardingCompleted !== true) {
        console.log('⚠️ Loading timed out but user needs onboarding - showing onboarding')
        setShowOnboarding(true)
      }
    }
  }, [mounted, isChecking, authLoadingTimeout, user?.email, supabaseOnboardingCompleted])

  const handleOnboardingComplete = () => {
    // Close onboarding and show white screen for 8 seconds
    setShowOnboarding(false)
    setShowWhiteScreen(true)
    
    // After 8 seconds, hide white screen and show the app
    setTimeout(() => {
      setShowWhiteScreen(false)
    }, 8000) // 8 seconds
  }

  // CRITICAL: Check for login page or feedback page AFTER all hooks are called
  // This must be done after hooks to comply with React's rules of hooks
  // Return early to bypass all onboarding logic
  if (isLoginPage || isFeedbackPage) {
    console.log('✅ Login or feedback page detected - bypassing ALL onboarding checks')
    return <>{children}</>
  }
  
  // Early return for timeout case (but don't set state in render)
  if (mounted && !isChecking && authLoadingTimeout) {
    if (!user?.email || supabaseOnboardingCompleted === true) {
      console.log('⚠️ Loading timed out - showing app to prevent blank screen')
      return <>{children}</>
    }
    // If user needs onboarding, the useEffect above will set showOnboarding
    // Continue to render logic below
  }

  // CRITICAL: If user is NOT authenticated, don't show onboarding - AuthContext will redirect to /login
  // OnboardingGuard should ONLY show onboarding for AUTHENTICATED users who haven't completed it
  // Unauthenticated users should be redirected to /login by AuthContext
  if (!user) {
    console.log('🚫 OnboardingGuard: User not authenticated - AuthContext will redirect to /login')
    // Don't show onboarding for unauthenticated users - let AuthContext handle redirect
    return <>{children}</>
  }

  // CRITICAL: Check onboarding status - AuthContext is the source of truth
  // Only bypass onboarding if AuthContext confirms it's completed
  const sessionCompleted = sessionContext?.sessionData?.entrepreneurProfile?.onboardingCompleted
  
  // Use AuthContext onboarding status as primary source of truth
  const onboardingCompleted = supabaseOnboardingCompleted === true || sessionCompleted === true
  
  // Only bypass onboarding if user has completed it (from AuthContext)
  // Don't bypass just because there's a session - user might want to complete onboarding
  if (user?.email && onboardingCompleted) {
    console.log('✅ Authenticated user with completed onboarding - bypassing onboarding:', user.email)
    return <>{children}</>
  }
  
  // If authenticated but onboarding not completed, show onboarding
  if (user?.email && !onboardingCompleted) {
    console.log('🆕 Authenticated user but onboarding not completed - showing onboarding:', user.email)
    // Continue to show onboarding below
  }
  
  // Show loading while checking (including auth loading, but with timeout)
  // CRITICAL: Always show content after timeout, even if still checking
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  // CRITICAL: After mounted, if we've timed out, always show the app
  // This prevents infinite blank screen - prioritize showing content over loading
  if (authLoadingTimeout && mounted) {
    console.log('⚠️ Auth loading timed out - showing app to prevent blank screen')
    return <>{children}</>
  }
  
  // After mounted, only show loading spinner if actively checking AND not timed out
  // This prevents infinite blank screen
  if ((isChecking || (authLoading && !authLoadingTimeout)) && mounted) {
    // Show loading for max 1 second, then proceed
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // CRITICAL: Show onboarding ONLY for authenticated users who haven't completed it
  // Unauthenticated users should have been redirected to /login by AuthContext
  // CRITICAL: Show onboarding if:
  // 1. User is authenticated AND onboarding is not completed (false, null, or undefined)
  // 2. OR showOnboarding flag is set
  // This ensures new users (profile is null) always see onboarding
  if (user && (onboardingCompleted !== true || showOnboarding)) {
    console.log('🆕 Showing old onboarding - authenticated user, not completed:', {
      showOnboarding,
      userEmail: user?.email,
      onboardingCompleted,
      supabaseOnboardingCompleted,
      isNewUser: supabaseOnboardingCompleted === undefined || supabaseOnboardingCompleted === null
    })
    return (
      <IntegratedOnboarding 
        isOpen={true} 
        onClose={handleOnboardingComplete}
      />
    )
  }
  
  // If we get here and user is not authenticated, something went wrong
  // But AuthContext should have redirected them already
  if (!user) {
    console.warn('⚠️ OnboardingGuard: User not authenticated but reached onboarding check - AuthContext should redirect')
    return <>{children}</>
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

