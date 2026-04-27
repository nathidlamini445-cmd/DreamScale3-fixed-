"use client"

/**
 * Magic-link / sign-in success greeting.
 *
 * Reached from /auth/resolve once we've confirmed an onboarded user has a valid
 * session. Shows a friendly "You're in!" message for ~3 seconds, then sends the
 * user to the dashboard at "/". A hard navigation (window.location) is used to
 * guarantee a fresh dashboard render with the new session cookies in place.
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

const REDIRECT_DELAY_MS = 3000
const DASHBOARD_PATH = "/"

export default function AuthWelcomePage() {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(REDIRECT_DELAY_MS / 1000))

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = DASHBOARD_PATH
      } else {
        router.replace(DASHBOARD_PATH)
      }
    }, REDIRECT_DELAY_MS)

    const countdownTimer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      window.clearTimeout(redirectTimer)
      window.clearInterval(countdownTimer)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#39d2c0]/10 ring-4 ring-[#39d2c0]/20">
          <CheckCircle2 className="h-12 w-12 text-[#39d2c0]" strokeWidth={2.25} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            You&apos;re in! Welcome to DreamScale
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Taking you to your dashboard...
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#39d2c0]" />
          <p className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
            Redirecting in {secondsLeft}s
          </p>
        </div>
      </div>
    </div>
  )
}
