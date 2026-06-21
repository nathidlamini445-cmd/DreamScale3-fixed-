'use client'



import { useEffect, useState } from 'react'

import { ProPlanBadge } from '@/components/pro-plan-badge'

import { useSubscriptionStatus } from '@/hooks/use-subscription-status'

import { useUsageQuota } from '@/hooks/use-usage-quota'

import { SettingsPlanPanels } from '@/components/settings/settings-plan-panels'

import { CancelProSection } from '@/components/billing/cancel-pro-section'

import type { PayfastSubscribeFormConfig } from '@/lib/payfast/subscribe-form'

import { useUser } from '@clerk/nextjs'

import { Loader2 } from 'lucide-react'

import { MONTHLY_FEATURE_LIMIT } from '@/lib/usage-quota/types'
import { formatSubscriptionEndDate } from '@/lib/subscription'



export function PlanBillingSection() {

  const { user } = useUser()

  const { isPro, loading, subscription_status, subscription_tier, subscription_ends_at } =
    useSubscriptionStatus()

  const { usage } = useUsageQuota()

  const [payfastConfig, setPayfastConfig] = useState<PayfastSubscribeFormConfig | null>(

    null

  )

  const [configLoading, setConfigLoading] = useState(true)



  useEffect(() => {

    let cancelled = false

    void (async () => {

      try {

        const res = await fetch('/api/billing/plan-config', { credentials: 'include' })

        if (!res.ok) return

        const data = await res.json()

        if (!cancelled && data.fullConfig) setPayfastConfig(data.fullConfig)

      } finally {

        if (!cancelled) setConfigLoading(false)

      }

    })()

    return () => {

      cancelled = true

    }

  }, [])



  const periodEndLabel = formatSubscriptionEndDate(subscription_ends_at)
  const isPendingCancel = subscription_status === 'cancel_at_period_end'
  const statusLabel = isPendingCancel
    ? periodEndLabel
      ? `Pro until ${periodEndLabel}`
      : 'Pro until period ends'
    : (subscription_status ?? 'inactive')

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading plan…
      </div>
    )
  }



  return (

    <div className="space-y-6 pb-2">

      <div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">

          Your plan

        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400">

          Compare Free and Pro, subscribe with PayFast, or cancel when you need to.

        </p>

      </div>



      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/80 dark:bg-gray-800/40">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">

              Current plan

            </p>

            <div className="flex items-center gap-2 mt-1">

              <p className="text-lg font-semibold text-gray-900 dark:text-white">

                {isPro ? 'DreamScale Pro' : 'Free'}

              </p>

              {isPro && <ProPlanBadge active />}

            </div>

            <p className="text-xs text-gray-500 mt-0.5 capitalize">

              {statusLabel} · {subscription_tier ?? 'free'}

            </p>

          </div>

        </div>



        {!isPro && usage && !usage.isPro && (

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 space-y-1">

            <p className="font-medium text-gray-700 dark:text-gray-300">Usage this month</p>

            <p>

              Bizora: {usage.chat.messagesUsed}/{usage.chat.messagesLimit} messages

              {usage.chat.inCooldown ? ' · on cooldown' : ''}

            </p>

            <p>Each Pro module: up to {MONTHLY_FEATURE_LIMIT} AI runs / month</p>

            <p>

              Uploads: {usage.uploads.used}/{usage.uploads.limit}

            </p>

          </div>

        )}

      </div>



      <div>

        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">

          Compare plans

        </h3>

        {configLoading ? (

          <div className="flex justify-center py-8">

            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />

          </div>

        ) : (

          <SettingsPlanPanels

            isPro={isPro}

            config={payfastConfig}

            userId={user?.id ?? null}

            userEmail={user?.primaryEmailAddress?.emailAddress}

          />

        )}

      </div>



      <CancelProSection />

    </div>

  )

}

