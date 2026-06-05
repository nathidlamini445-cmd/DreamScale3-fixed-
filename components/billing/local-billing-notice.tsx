'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Props = {
  isPro: boolean
  signedIn: boolean
}

function isLocalHost(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0'
}

/**
 * PayFast cannot POST to localhost notify/return URLs — live checkout returns 403.
 */
export function LocalBillingNotice({ isPro, signedIn }: Props) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setShow(
      process.env.NODE_ENV === 'development' && isLocalHost() && !isPro
    )
  }, [isPro])

  if (!show) return null

  const activateLocalPro = async () => {
    setActivating(true)
    setError(null)
    try {
      const res = await fetch('/api/billing/sync-pro-local', {
        method: 'POST',
        credentials: 'include',
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(body.error ?? 'Could not activate Pro locally.')
        return
      }
      setDone(true)
      router.refresh()
    } catch {
      setError('Network error — is the dev server running?')
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100">
      <p className="font-medium">PayFast won&apos;t complete checkout on localhost</p>
      <p className="mt-2 text-amber-900/90 dark:text-amber-100/85">
        Subscribe sends you to PayFast with <code className="text-xs">notify_url</code> and{' '}
        <code className="text-xs">return_url</code> pointing at{' '}
        <code className="text-xs">http://localhost:3000</code>. PayFast blocks that with a{' '}
        <strong>403 Forbidden</strong> page (CloudFront) — not a DreamScale bug.
      </p>
      <p className="mt-2 text-amber-900/90 dark:text-amber-100/85">
        For a real card test, deploy to a public HTTPS URL or use ngrok and set{' '}
        <code className="text-xs">PAYFAST_RETURN_BASE_URL</code> in <code className="text-xs">.env.local</code>.
      </p>
      {signedIn ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-amber-400 bg-white hover:bg-amber-100 dark:border-amber-600 dark:bg-transparent"
            disabled={activating || done}
            onClick={() => void activateLocalPro()}
          >
            {done ? 'Pro activated — refresh billing' : activating ? 'Activating…' : 'Activate Pro locally (dev only)'}
          </Button>
          {error && <span className="text-xs text-red-700 dark:text-red-300">{error}</span>}
        </div>
      ) : (
        <p className="mt-2 text-xs">Sign in first to use local Pro activation.</p>
      )}
    </div>
  )
}
