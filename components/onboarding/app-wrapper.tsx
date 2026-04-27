'use client'

import { OnboardingGuard } from './onboarding-guard'

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return <OnboardingGuard>{children}</OnboardingGuard>
}

