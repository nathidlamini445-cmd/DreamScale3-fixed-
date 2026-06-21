'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { formatSubscriptionEndDate } from '@/lib/subscription'
import {
  CancelSubscriptionDialog,
  type CancellationFeedback,
} from '@/components/settings/cancel-subscription-dialog'

type Props = {
  id?: string
  className?: string
}

export function CancelProSection({ id = 'cancel-pro', className }: Props) {
  const { isPro, subscription_status, subscription_ends_at } =
    useSubscriptionStatus()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  if (!isPro) return null

  const periodEndLabel = formatSubscriptionEndDate(subscription_ends_at)
  const isPendingCancel = subscription_status === 'cancel_at_period_end'

  const handleCancel = async (feedback: CancellationFeedback) => {
    setCancelling(true)
    setCancelError(null)
    try {
      const res = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      })
      const data = await res.json()
      if (!res.ok) {
        setCancelError(data.error ?? 'Could not cancel plan')
        return
      }
      setCancelOpen(false)
      window.location.reload()
    } catch {
      setCancelError('Network error. Try again.')
    } finally {
      setCancelling(false)
    }
  }

  if (isPendingCancel) {
    return (
      <div
        id={id}
        className={
          className ??
          'rounded-xl border border-blue-200/80 bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-800 p-4 space-y-2'
        }
      >
        <p className="text-sm font-medium text-blue-950 dark:text-blue-100">
          Pro ends soon
        </p>
        <p className="text-xs text-blue-900/90 dark:text-blue-200/90">
          {periodEndLabel
            ? `Your subscription is cancelled. You keep DreamScale Pro until ${periodEndLabel}, then you move to Free. You will not be charged again.`
            : 'Your subscription is cancelled. You keep Pro until the end of your paid period, then you move to Free.'}
        </p>
      </div>
    )
  }

  if (subscription_status !== 'active') return null

  return (
    <>
      <div
        id={id}
        className={
          className ??
          'rounded-xl border border-amber-200/80 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-800 p-4 space-y-3'
        }
      >
        <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
          Cancel Pro
        </p>
        <p className="text-xs text-amber-900/90 dark:text-amber-200/90">
          Cancel anytime. Billing stops immediately, but you keep Pro until the
          end of your current paid period.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300"
            onClick={() => {
              setCancelError(null)
              setCancelOpen(true)
            }}
          >
            Cancel subscription
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="inline-flex items-center gap-1 text-xs"
            onClick={() =>
              window.open('https://www.payfast.co.za', '_blank', 'noopener,noreferrer')
            }
          >
            PayFast help
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
        {cancelError && !cancelOpen && (
          <p className="text-xs text-red-600 dark:text-red-400">{cancelError}</p>
        )}
      </div>

      <CancelSubscriptionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
        cancelling={cancelling}
        error={cancelError}
      />
    </>
  )
}
