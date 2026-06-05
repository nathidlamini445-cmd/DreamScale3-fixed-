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
import { formatUsdFree, formatUsdFromZarMonthly } from '@/lib/billing/display-pricing'

type Props = {
  isPro: boolean
  config: PayfastSubscribeFormConfig | null
  userId: string | null
  userEmail?: string
}

export function SettingsPlanPanels({ isPro, config, userId, userEmail }: Props) {
  const price = config
    ? formatUsdFromZarMonthly(config.recurringAmount)
    : '$0.00/mo'

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-white">Free</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {formatUsdFree()}
        </p>
        <p className="text-xs text-gray-500 mb-3">Limits apply — full app access</p>
        <ul className="space-y-1.5 flex-1 text-xs text-gray-600 dark:text-gray-300">
          {FREE_PLAN_HIGHLIGHTS.map((line) => (
            <li key={line} className="flex gap-2">
              <Check className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
              {line}
            </li>
          ))}
        </ul>
        <ul className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          {PLAN_FEATURE_ROWS.slice(0, 4).map((row) => (
            <li key={row.label} className="flex gap-2 text-xs">
              {row.freeIncluded ? (
                <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              )}
              <span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {row.label}
                </span>
                <span className="text-gray-500"> — {row.free}</span>
              </span>
            </li>
          ))}
        </ul>
        <Button variant="outline" className="w-full mt-4" disabled size="sm">
          {isPro ? 'Included' : 'Current plan'}
        </Button>
      </div>

      <div className="rounded-xl border-2 border-[#005DFF]/25 bg-[#005DFF]/5 dark:bg-[#005DFF]/10 p-4 flex flex-col">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Pro</h3>
          {isPro && <ProPlanBadge active className="text-[10px]" />}
        </div>
        <p className="text-2xl font-bold text-[#005DFF] mt-1">{price}</p>
        <p className="text-xs text-gray-500 mb-3">PayFast · cancel anytime</p>
        <ul className="space-y-1.5 flex-1 text-xs text-gray-700 dark:text-gray-200">
          {PRO_PLAN_HIGHLIGHTS.map((line) => (
            <li key={line} className="flex gap-2">
              <Zap className="w-3.5 h-3.5 text-[#005DFF] shrink-0 mt-0.5" />
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          {isPro ? (
            <Link
              href="/billing#cancel-pro"
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'w-full border-gray-300 bg-white text-[#005DFF] hover:bg-white'
              )}
            >
              Manage or cancel Pro
            </Link>
          ) : config && userId ? (
            <div className="flex flex-col items-stretch gap-2">
              <PayFastSubscribeForm
                config={config}
                userId={userId}
                userEmail={userEmail}
              />
              <Link
                href="/billing"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'text-xs w-full'
                )}
              >
                Open full comparison page
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'w-full bg-[#005DFF] hover:bg-[#0047cc] text-white'
              )}
            >
              Sign in to subscribe
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
