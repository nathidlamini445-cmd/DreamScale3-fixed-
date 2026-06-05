'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, User } from 'lucide-react'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { LoginButton } from '@/components/login-button-onboarding'

const PROFILE_TIMEOUT_MS = 5000

function withTimeout<T>(promise: Promise<T>, ms: number, onTimeout: () => T): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(onTimeout()), ms)
    promise
      .then((v) => {
        clearTimeout(t)
        resolve(v)
      })
      .catch(() => {
        clearTimeout(t)
        resolve(onTimeout())
      })
  })
}

export default function LandingPage() {
  const { user, isLoaded } = useUser()
  const [sessionProbeDone, setSessionProbeDone] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [showButton, setShowButton] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Non-blocking: page shows "Open DreamScale" immediately; session/profile use hard timeouts
  // so strict browsers / slow networks never spin forever.
  useEffect(() => {
    if (!isLoaded) return

    let cancelled = false
    const supabase = createClient()

    const checkAuthAndOnboarding = async () => {
      setError(null)

      if (!user?.id) {
        setIsAuthenticated(false)
        setOnboardingCompleted(false)
        setSessionProbeDone(true)
        return
      }

      const userId = user.id
      const userEmailFromSession = user.primaryEmailAddress?.emailAddress ?? null

      setIsAuthenticated(true)
      setUserEmail(userEmailFromSession)
      setUserName(user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || null)
      setUserAvatar(user.imageUrl || null)

      const profileResult = await withTimeout(
        supabase.from('user_profiles').select('*').eq('id', userId).single(),
        PROFILE_TIMEOUT_MS,
        () => ({ data: null, error: { message: 'timeout' } } as const)
      )

      if (cancelled) return

      const profileError = profileResult.error as { code?: string; message?: string } | null
      const profile = profileResult.data as Record<string, unknown> | null

      if (profileError?.message === 'timeout') {
        console.warn('⚠️ [LANDING] Profile fetch timed out')
        setError('Profile check was slow. Use Open DreamScale to sign in, or try again.')
        setOnboardingCompleted(false)
        setSessionProbeDone(true)
        return
      }

      if (profileError?.code === 'PGRST116' || !profile) {
        setOnboardingCompleted(false)
        setSessionProbeDone(true)
        return
      }

      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError)
        setError('Could not load your profile. You can still sign in below.')
        setOnboardingCompleted(false)
        setSessionProbeDone(true)
        return
      }

      const completed = profile.onboarding_completed === true
      setOnboardingCompleted(completed)
      const profileName = (profile.user_name || profile.full_name) as string | undefined
      if (profileName) {
        setUserName(profileName)
      }
      setSessionProbeDone(true)
    }

    void checkAuthAndOnboarding()

    return () => {
      cancelled = true
    }
  }, [isLoaded, user])

  const handleGoToApp = () => {
    // Full navigation: more reliable than client router across browsers after onboarding
    window.location.href = '/auth/resolve'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
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

        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
              Welcome to DreamScale
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your AI-powered business platform for building, scaling, and growing your business
            </p>
          </div>

          {!sessionProbeDone && (
            <p className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
              Checking for an existing session…
            </p>
          )}

          {error && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
          )}

          <div className="flex flex-col items-center justify-center space-y-4">
            <div
              className={`flex flex-col items-center space-y-3 transition-opacity duration-500 ${
                showButton ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Button
                asChild
                className="group bg-[#005DFF] hover:bg-[#0048CC] text-white px-10 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 no-underline text-white"
                  prefetch={true}
                >
                  <span>Open DreamScale</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Sign in or create an account — same secure entry every time.
              </p>
            </div>

            {isAuthenticated && onboardingCompleted ? (
              <div
                className={`flex flex-col items-center space-y-4 pt-4 border-t border-gray-200/80 dark:border-gray-700/80 transition-opacity duration-500 ${
                  showButton ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
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
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
                    )}
                    {userEmail && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">{userEmail}</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleGoToApp}
                  variant="outline"
                  className="group px-8 py-5 text-base font-semibold rounded-lg"
                  size="lg"
                >
                  <span>Continue to app</span>
                  <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : (
              <div
                className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${
                  showButton ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">Or continue with Google</p>
                <LoginButton />
              </div>
            )}
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Tools</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leverage AI to automate and optimize your business processes
              </p>
            </div>
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get insights and track your progress with intelligent dashboards
              </p>
            </div>
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Seamless Integration</h3>
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
