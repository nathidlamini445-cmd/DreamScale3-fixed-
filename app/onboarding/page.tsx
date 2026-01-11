'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IntegratedOnboarding } from '@/components/onboarding/integrated-onboarding'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionSafe } from '@/lib/session-context'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, onboardingCompleted, loading } = useAuth()
  const sessionContext = useSessionSafe()

  // REMOVED: All redirect logic removed - /auth/resolve is the ONLY place that makes routing decisions
  // This page will only render if user needs onboarding (routed here by /auth/resolve)

  // Allow onboarding for:
  // 1. Authenticated users who haven't completed onboarding
  // 2. Unauthenticated users with email in session context (email sign-up flow)

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
