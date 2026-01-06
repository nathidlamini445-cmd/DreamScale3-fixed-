'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSessionSafe } from '@/lib/session-context'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const sessionContext = useSessionSafe()
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // User is authenticated, check onboarding status
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single()
          
          if (profile) {
            if (profile.onboarding_completed) {
              router.push('/')
            } else {
              router.push('/')
            }
          } else {
            // Profile doesn't exist yet (should be created by trigger), redirect to onboarding
            router.push('/')
          }
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check onboarding status after sign in
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          if (profile.onboarding_completed) {
            router.push('/')
          } else {
            router.push('/')
          }
        } else {
          // Profile not created yet, redirect to onboarding
          router.push('/')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      })
      
      if (error) {
        console.error('Google sign in error:', error)
        alert('Failed to sign in with Google. Please try again.')
        setIsSigningIn(false)
      }
      // Don't set isSigningIn to false here - the redirect will happen
    } catch (error) {
      console.error('Sign in error:', error)
      alert('An error occurred. Please try again.')
      setIsSigningIn(false)
    }
  }

  if (!sessionContext) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005DFF]"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005DFF]"></div>
      </div>
    )
  }


  // Show login form
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
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

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to DreamScale
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in with your Google account to get started
            </p>
          </div>

          <Button 
            onClick={handleGoogleSignIn}
            className="w-full bg-[#005DFF] hover:bg-[#0048CC] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

