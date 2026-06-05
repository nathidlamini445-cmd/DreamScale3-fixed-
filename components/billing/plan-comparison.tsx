'use client'

import Link from 'next/link'
import { Check, X, Zap } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { PayFastSubscribeForm } from '@/components/billing/PayFastSubscribeForm'
import type { PayfastSubscribeFormConfig } from '@/lib/payfast/subscribe-form'
import {
  PLAN_FEATURE_ROWS,
  FREE_PLAN_HIGHLIGHTS,
  PRO_PLAN_HIGHLIGHTS,
} from '@/lib/billing/plan-features'
import {
  formatUsdFree,
  formatUsdFromZarMonthly,
  formatZarChargeNote,
} from '@/lib/billing/display-pricing'

type PlanComparisonProps = {
  isPro: boolean
  config: PayfastSubscribeFormConfig | null
  userId: string | null
  userEmail?: string
  amountLabel?: string
  compact?: boolean
}

function FeatureIcon({ included }: { included: boolean }) {
  return included ? (
    <Check className="w-4 h-4 text-green-600 shrink-0" aria-hidden />
  ) : (
    <X className="w-4 h-4 text-gray-300 shrink-0" aria-hidden />
  )
}

export function PlanComparison({
  isPro,
  config,
  userId,
  userEmail,
  amountLabel,
  compact = false,
}: PlanComparisonProps) {
  const price =
    amountLabel ??
    (config ? formatUsdFromZarMonthly(config.recurringAmount) : '$0.00/mo')
  const zarNote = config ? formatZarChargeNote(config.recurringAmount) : null

  return (
    <div
      className={cn(
        'grid gap-6 w-full',
        compact ? 'md:grid-cols-2' : 'lg:grid-cols-2 max-w-5xl mx-auto'
      )}
    >
      {/* Free */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 flex flex-col shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Free</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {formatUsdFree()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Get started with limits
          </p>
        </div>
        <ul className="space-y-2 mb-6 flex-1">
          {FREE_PLAN_HIGHLIGHTS.map((line) => (
            <li
              key={line}
              className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
            >
              <Check className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
              {line}
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
          {PLAN_FEATURE_ROWS.map((row) => (
            <div key={row.label} className="flex items-start gap-2 text-xs">
              <FeatureIcon included={row.freeIncluded} />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{row.label}</p>
                <p className="text-gray-500 dark:text-gray-400">{row.free}</p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-6" disabled>
          {isPro ? 'Included with account' : 'Current plan'}
        </Button>
      </div>

      {/* Pro */}
      <div className="rounded-2xl border-2 border-[#005DFF]/30 bg-gradient-to-b from-[#005DFF]/5 to-white dark:from-[#005DFF]/10 dark:to-gray-900 p-6 flex flex-col shadow-md relative">
        <div className="absolute -top-3 left-6">
          <span className="bg-[#005DFF] text-white text-xs font-semibold px-3 py-1 rounded-full">
            DreamScale Pro
          </span>
        </div>
        <div className="mb-4 mt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pro</h2>
            {isPro && <ProPlanBadge active />}
          </div>
          <p className="text-3xl font-bold text-[#005DFF] mt-1">{price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Billed monthly · cancel anytime
          </p>
          {zarNote && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{zarNote}</p>
          )}
        </div>
        <ul className="space-y-2 mb-6 flex-1">
          {PRO_PLAN_HIGHLIGHTS.map((line) => (
            <li
              key={line}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200"
            >
              <Zap className="w-4 h-4 text-[#005DFF] mt-0.5 shrink-0" />
              {line}
            </li>
          ))}
        </ul>
        <div className="border-t border-[#005DFF]/10 dark:border-gray-700 pt-4 space-y-3">
          {PLAN_FEATURE_ROWS.map((row) => (
            <div key={row.label} className="flex items-start gap-2 text-xs">
              <FeatureIcon included={row.proIncluded} />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{row.label}</p>
                <p className="text-gray-500 dark:text-gray-400">{row.pro}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {isPro ? (
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full border-gray-300 bg-white text-[#005DFF] hover:bg-white'
              )}
            >
              Open DreamScale
            </Link>
          ) : config && userId ? (
            <div className="flex flex-col items-center gap-2">
              <PayFastSubscribeForm
                config={config}
                userId={userId}
                userEmail={userEmail}
              />
            </div>
          ) : config ? (
            <Link
              href="/login"
              className={cn(
                buttonVariants(),
                'w-full bg-[#005DFF] hover:bg-[#0047cc] text-white'
              )}
            >
              Sign in to subscribe
            </Link>
          ) : (
            <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
              PayFast is not configured. Contact support to subscribe.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
