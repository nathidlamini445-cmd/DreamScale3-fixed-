'use client'

import { IntegratedOnboarding } from '@/components/onboarding/integrated-onboarding'

export default function OnboardingPage() {
  // /auth/resolve routes here when onboarding is incomplete; wizard handles completion + navigation.
  return (
    <IntegratedOnboarding
      isOpen={true}
      onClose={() => {
        console.log('✅ [ONBOARDING] Onboarding completed')
      }}
    />
  )
}
