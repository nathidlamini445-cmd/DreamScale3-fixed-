'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { shouldShowProWelcome } from '@/components/billing/welcome-pro-modal'

export function BillingSuccessClient() {
  const { isLoaded } = useUser()
  const [isPro, setIsPro] = useState(false)
  const [polls, setPolls] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isLocalhost, setIsLocalhost] = useState(false)

  useEffect(() => {
    setIsLocalhost(
      window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    )
  }, [])

  const refreshSubscription = useCallback(async () => {
    try {
      const res = await fetch('/api/me/subscription-status', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setIsPro(data.isPro === true)
    } catch {
      // ignore
    }
  }, [])

  const syncProLocal = async () => {
    setSyncing(true)
    setSyncError(null)
    try {
      const res = await fetch('/api/billing/sync-pro-local', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setSyncError(data.error ?? 'Could not activate Pro')
        return
      }
      setIsPro(true)
    } catch {
      setSyncError('Network error — is the dev server running?')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (!isLoaded) return
    void refreshSubscription()
  }, [isLoaded, refreshSubscription])

  useEffect(() => {
    if (isPro || !isLoaded) return
    const interval = setInterval(() => {
      setPolls((n) => n + 1)
      void refreshSubscription()
    }, 3000)
    return () => clearInterval(interval)
  }, [isPro, isLoaded, refreshSubscription])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {isPro ? 'Payment received — welcome to Pro' : 'Thank you for subscribing'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {isPro
            ? 'DreamScale Pro is active. On your dashboard, tap the bell next to the settings gear (red dot) to see everything included in Pro.'
            : polls > 0
              ? 'Still confirming with PayFast… this usually takes under a minute.'
              : 'PayFast is processing your payment. Pro access activates once we receive confirmation.'}
        </p>

        {isLocalhost && !isPro && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-left text-xs text-amber-950 space-y-2">
            <p>
              <strong>Local dev:</strong> PayFast cannot send webhooks to localhost. If you
              already paid, click below to sync Pro on this machine.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={syncing}
              onClick={() => void syncProLocal()}
            >
              {syncing ? 'Activating…' : 'Activate Pro on localhost (dev)'}
            </Button>
            {syncError && <p className="text-red-700">{syncError}</p>}
          </div>
        )}

        <Button asChild className="bg-[#005DFF] hover:bg-[#0047cc]">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
        {isPro && shouldShowProWelcome() && (
          <p className="text-xs text-gray-500">
            Look for the <strong>red dot</strong> on the bell icon beside settings.
          </p>
        )}
      </div>
    </div>
  )
}
