'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IntegratedOnboarding } from '@/components/onboarding/integrated-onboarding'
import { useAuth } from '@/contexts/AuthContext'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, onboardingCompleted, loading } = useAuth()

  // Check if onboarding is already completed and redirect if so
  useEffect(() => {
    // Wait for auth to load
    if (loading) return

    // If user is not authenticated, they'll be redirected by RouteGuard/AuthContext
    if (!user) return

    // If onboarding is already completed, redirect to dashboard
    if (onboardingCompleted === true) {
      console.log('✅ [ONBOARDING PAGE] Onboarding already completed - redirecting to dashboard')
      router.replace('/')
      return
    }
  }, [user, onboardingCompleted, loading, router])

  // RouteGuard handles all auth and onboarding checks
  // If user reaches here, they're authenticated but not onboarded
  // Onboarding completion will trigger a page reload to refresh auth state

  return (
    <IntegratedOnboarding
      isOpen={true}
      onClose={() => {
        // onClose is called after onboarding completion
        // The component itself handles the redirect with page reload
        console.log('✅ [ONBOARDING] Onboarding completed')
      }}
    />
  )
}
