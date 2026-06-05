'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CHAT_MESSAGES_PER_CYCLE, MONTHLY_FEATURE_LIMIT } from '@/lib/usage-quota/types'

const CANCEL_REASONS = [
  { id: 'too_expensive', label: 'Too expensive' },
  { id: 'not_using', label: "I'm not using it enough" },
  { id: 'missing_features', label: 'Missing features I need' },
  { id: 'technical_issues', label: 'Technical issues or bugs' },
  { id: 'found_alternative', label: 'Switching to another tool' },
  { id: 'temporary_break', label: 'Just taking a break' },
  { id: 'other', label: 'Other' },
] as const

export type CancellationFeedback = {
  reason: string
  improve?: string
  additional?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (feedback: CancellationFeedback) => Promise<void>
  cancelling: boolean
  error: string | null
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onConfirm,
  cancelling,
  error,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [reason, setReason] = useState('')
  const [improve, setImprove] = useState('')
  const [additional, setAdditional] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) {
      setReason('')
      setImprove('')
      setAdditional('')
      setValidationError(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !cancelling) onOpenChange(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, cancelling, onOpenChange])

  if (!open || !mounted) return null

  const handleConfirm = async () => {
    if (!reason) {
      setValidationError('Please tell us why you’re canceling — it helps us improve.')
      return
    }
    setValidationError(null)
    await onConfirm({
      reason,
      improve: improve.trim() || undefined,
      additional: additional.trim() || undefined,
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-pro-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        aria-label="Close"
        disabled={cancelling}
        onClick={() => onOpenChange(false)}
      />

      <div className="relative z-[201] w-full max-w-lg max-h-[min(90vh,640px)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <h2
          id="cancel-pro-title"
          className="text-lg font-semibold text-gray-900 dark:text-white"
        >
          Before you cancel Pro
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          This cancels DreamScale Pro and stops your monthly PayFast billing in one step.
          You&apos;ll return to the Free plan ({CHAT_MESSAGES_PER_CYCLE} Bizora messages per
          cycle, then a wait period, and {MONTHLY_FEATURE_LIMIT} AI runs per module per month).
          Help us improve — why are you leaving?
        </p>

        <fieldset className="mt-5 space-y-2">
          <legend className="text-sm font-medium text-gray-900 dark:text-white">
            Why are you canceling? <span className="text-red-500">*</span>
          </legend>
          {CANCEL_REASONS.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors hover:border-gray-300 has-[:checked]:border-[#005DFF]/40 has-[:checked]:bg-[#005DFF]/5 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-gray-600 dark:has-[:checked]:bg-[#005DFF]/10"
            >
              <input
                type="radio"
                name="cancel-reason"
                value={item.id}
                checked={reason === item.id}
                onChange={() => setReason(item.id)}
                className="mt-0.5"
                disabled={cancelling}
              />
              <span className="text-gray-800 dark:text-gray-200">{item.label}</span>
            </label>
          ))}
        </fieldset>

        <div className="mt-4 space-y-4">
          <div>
            <Label
              htmlFor="cancel-improve"
              className="text-sm font-medium text-gray-900 dark:text-white"
            >
              What could we improve?
            </Label>
            <textarea
              id="cancel-improve"
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              disabled={cancelling}
              rows={3}
              placeholder="Features, pricing, experience — anything that would have kept you on Pro"
              className="mt-1.5 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#005DFF] focus:outline-none focus:ring-2 focus:ring-[#005DFF]/20 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
            />
          </div>
          <div>
            <Label
              htmlFor="cancel-additional"
              className="text-sm font-medium text-gray-900 dark:text-white"
            >
              Anything else we should know? <span className="font-normal text-gray-500">(optional)</span>
            </Label>
            <textarea
              id="cancel-additional"
              value={additional}
              onChange={(e) => setAdditional(e.target.value)}
              disabled={cancelling}
              rows={2}
              placeholder="Optional extra context"
              className="mt-1.5 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#005DFF] focus:outline-none focus:ring-2 focus:ring-[#005DFF]/20 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
            />
          </div>
        </div>

        {(validationError || error) && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            {validationError ?? error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={cancelling}
            onClick={() => onOpenChange(false)}
            className="bg-white dark:bg-gray-900"
          >
            Keep Pro
          </Button>
          <Button
            type="button"
            disabled={cancelling}
            onClick={() => void handleConfirm()}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {cancelling ? 'Cancelling…' : 'Cancel subscription'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
