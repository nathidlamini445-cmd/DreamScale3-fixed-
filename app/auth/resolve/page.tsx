'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function AuthResolvePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace('/login')
      return
    }

    const resolve = async () => {
      try {
        const res = await fetch('/api/me/onboarding-status', { credentials: 'same-origin' })
        if (res.status === 401) {
          router.replace('/login')
          return
        }
        if (!res.ok) {
          router.replace('/onboarding')
          return
        }
        const body = (await res.json()) as { onboardingCompleted?: boolean }
        if (body.onboardingCompleted === true) {
          router.replace('/dashboard')
        } else {
          router.replace('/onboarding')
        }
      } catch {
        router.replace('/onboarding')
      }
    }

    void resolve()
  }, [isLoaded, user, router])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 border-2 border-[#005DFF] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-600">Setting up your workspace...</p>
    </div>
  )
}
