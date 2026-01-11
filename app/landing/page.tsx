'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Loader2, ArrowRight, User } from 'lucide-react'
import Image from 'next/image'
import { LoginButton } from '@/components/login-button-onboarding'

export default function LandingPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [showButton, setShowButton] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check authentication status and onboarding on page load
  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      setIsCheckingAuth(true)
      setError(null)
      
      try {
        if (!supabase) {
          console.warn('⚠️ Supabase not configured')
          setIsCheckingAuth(false)
          setShowButton(true)
          return
        }

        // Step 1: Check if user has an active Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Error checking session:', sessionError)
          setError('Failed to check authentication status')
          setIsAuthenticated(false)
          setOnboardingCompleted(false)
          setIsCheckingAuth(false)
          setTimeout(() => setShowButton(true), 100)
          return
        }

        if (!session?.user) {
          // No session - user is not authenticated
          console.log('ℹ️ No active session - user not authenticated')
          setIsAuthenticated(false)
          setOnboardingCompleted(false)
          setIsCheckingAuth(false)
          setTimeout(() => setShowButton(true), 100)
          return
        }

        // Step 2: Session exists - fetch profile from user_profiles table
        const userId = session.user.id
        const userEmailFromSession = session.user.email
        
        if (!userId) {
          console.error('❌ No user ID in session')
          setIsAuthenticated(false)
          setOnboardingCompleted(false)
          setIsCheckingAuth(false)
          setTimeout(() => setShowButton(true), 100)
          return
        }

        setIsAuthenticated(true)
        setUserEmail(userEmailFromSession || null)
        setUserName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || null)
        setUserAvatar(session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null)

        // Step 3: Fetch full profile from user_profiles table and check onboarding_completed status
        try {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // Profile doesn't exist - new user
              console.log('🆕 User profile does not exist - new user')
              setOnboardingCompleted(false)
            } else {
              // Database error
              console.error('❌ Error fetching user profile:', profileError)
              setError('Failed to load user profile')
              setOnboardingCompleted(false)
            }
          } else if (profile) {
            // Profile exists - check onboarding status
            const completed = profile.onboarding_completed === true
            setOnboardingCompleted(completed)
            
            // Update user name from profile if available (prioritize user_name, then full_name)
            const profileName = profile.user_name || profile.full_name
            if (profileName && !userName) {
              setUserName(profileName)
            }
            
            console.log('✅ Profile found in Supabase:', {
              userId: profile.id,
              email: profile.email,
              onboardingCompleted: completed,
              businessName: profile.business_name
            })
          }
        } catch (profileError) {
          console.error('❌ Error checking onboarding status:', profileError)
          setError('Failed to check onboarding status')
          setOnboardingCompleted(false)
        }

      } catch (error) {
        console.error('❌ Error checking auth status:', error)
        setError('An error occurred while checking authentication')
        setIsAuthenticated(false)
        setOnboardingCompleted(false)
      } finally {
        setIsCheckingAuth(false)
        // Trigger fade-in animation after a brief delay
        setTimeout(() => {
          setShowButton(true)
        }, 100)
      }
    }

    checkAuthAndOnboarding()
  }, [])

  const handleGoToDashboard = () => {
    // Navigate to dashboard at /home
    // DISABLED: Commented out to prevent redirect loops
    // router.push('/home')
    console.log('🚫 DISABLED: router.push("/home") in landing page - redirect disabled')
  }

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <div className="relative w-32 h-32">
            <Image
              src="/Logo.png"
              alt="DreamScale Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
              Welcome to DreamScale
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your AI-powered business platform for building, scaling, and growing your business
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
          )}

          {/* Authentication Button */}
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Show "Go to Dashboard" button if: authenticated AND onboarding_completed is true */}
            {isAuthenticated && onboardingCompleted ? (
              <div 
                className={`flex flex-col items-center space-y-4 transition-opacity duration-500 ${
                  showButton ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* User Info */}
                <div className="flex items-center gap-3 mb-2">
                  {userAvatar ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                      <Image
                        src={userAvatar}
                        alt={userName || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center border-2 border-blue-500">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="text-left">
                    {userName && (
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {userName}
                      </p>
                    )}
                    {userEmail && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Go to Dashboard Button */}
                <Button
                  onClick={handleGoToDashboard}
                  className="group bg-[#005DFF] hover:bg-[#0048CC] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                  size="lg"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : (
              /* Show "Sign In" / "Sign Up" buttons if: not authenticated OR onboarding not completed */
              <div 
                className={`transition-opacity duration-500 ${
                  showButton ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <LoginButton />
              </div>
            )}
          </div>

          {/* Features Preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Tools
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leverage AI to automate and optimize your business processes
              </p>
            </div>
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Smart Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get insights and track your progress with intelligent dashboards
              </p>
            </div>
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Seamless Integration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect with your favorite tools and services effortlessly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

