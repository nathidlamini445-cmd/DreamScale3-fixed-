'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { Check, Sparkles, X } from 'lucide-react'
import {
  FREE_PLAN_LIMITS_SUMMARY,
  PRO_FEATURE_BY_MODULE,
} from '@/lib/billing/plan-features'

const WELCOME_KEY = 'dreamscale_pro_welcome_seen'

export function markProWelcomeSeen(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(WELCOME_KEY, '1')
  } catch {
    // ignore
  }
}

export function shouldShowProWelcome(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(WELCOME_KEY) !== '1'
  } catch {
    return false
  }
}

type WelcomeProModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WelcomeProModal({ open, onOpenChange }: WelcomeProModalProps) {
  const handleClose = (next: boolean) => {
    if (!next) markProWelcomeSeen()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border-[#e8e6dc] bg-[#faf9f6] dark:border-gray-700 dark:bg-gray-900 p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0 text-left">
          <DialogTitle className="text-xl text-[#1a1a18] dark:text-white flex flex-wrap items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#005DFF]" aria-hidden />
            <span>Welcome to DreamScale Pro</span>
            <ProPlanBadge active />
          </DialogTitle>
          <DialogDescription className="text-[#5c5a52] dark:text-gray-400">
            Your payment went through. Here is everything that unlocks compared to the Free
            plan.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 min-h-0">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Free (before)
              </p>
              <ul className="space-y-2">
                {FREE_PLAN_LIMITS_SUMMARY.map((line) => (
                  <li
                    key={line}
                    className="text-xs text-gray-600 dark:text-gray-400 flex gap-2"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[#005DFF]/25 bg-[#005DFF]/5 dark:bg-[#005DFF]/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#005DFF] mb-2">
                Pro (now)
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                Same apps — no monthly AI caps, no Bizora cooldown.
              </p>
              <ul className="space-y-1.5">
                <li className="text-xs flex gap-2 text-gray-800 dark:text-gray-200">
                  <Check className="w-3.5 h-3.5 text-[#005DFF] shrink-0 mt-0.5" aria-hidden />
                  Unlimited Bizora chat & uploads
                </li>
                <li className="text-xs flex gap-2 text-gray-800 dark:text-gray-200">
                  <Check className="w-3.5 h-3.5 text-[#005DFF] shrink-0 mt-0.5" aria-hidden />
                  Unlimited AI in every module below
                </li>
                <li className="text-xs flex gap-2 text-gray-800 dark:text-gray-200">
                  <Check className="w-3.5 h-3.5 text-[#005DFF] shrink-0 mt-0.5" aria-hidden />
                  Google & Notion (Settings → Integrations)
                </li>
              </ul>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Pro by feature
            </p>
            <div className="space-y-2">
              {PRO_FEATURE_BY_MODULE.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-lg border border-gray-200/80 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-3"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {mod.name}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-gray-50 dark:bg-gray-900/50 px-2.5 py-2">
                      <p className="font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                        Free
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{mod.free}</p>
                    </div>
                    <div className="rounded-md bg-[#005DFF]/5 dark:bg-[#005DFF]/10 px-2.5 py-2 border border-[#005DFF]/10">
                      <p className="font-medium text-[#005DFF] mb-0.5">Pro</p>
                      <p className="text-gray-800 dark:text-gray-200 flex gap-1.5">
                        <Check
                          className="w-3.5 h-3.5 text-[#005DFF] shrink-0 mt-0.5"
                          aria-hidden
                        />
                        <span>{mod.pro}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-[#faf9f6] dark:bg-gray-900 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage your plan or integrations anytime: settings gear →{' '}
            <strong>Your plan</strong> or <strong>Integrations</strong>.
          </p>
          <DialogFooter className="sm:justify-end p-0">
            <Button
              type="button"
              className="bg-[#005DFF] hover:bg-[#0047cc] rounded-full"
              onClick={() => handleClose(false)}
            >
              Start using Pro
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
