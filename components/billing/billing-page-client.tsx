'use client'



import Link from 'next/link'

import { PlanComparison } from '@/components/billing/plan-comparison'

import { LocalBillingNotice } from '@/components/billing/local-billing-notice'

import { CancelProSection } from '@/components/billing/cancel-pro-section'

import { ProPlanBadge } from '@/components/pro-plan-badge'

import { useSubscriptionStatus } from '@/hooks/use-subscription-status'

import type { PayfastSubscribeFormConfig } from '@/lib/payfast/subscribe-form'

import { formatUsdFromZarMonthly } from '@/lib/billing/display-pricing'



type Props = {

  isPro: boolean

  config: PayfastSubscribeFormConfig | null

  userId: string | null

  userEmail?: string

}



export function BillingPageClient({ isPro, config, userId, userEmail }: Props) {

  const { isPro: isProLive, subscription_status } = useSubscriptionStatus()

  const showProManage = isProLive && subscription_status === 'active'



  const amountLabel = config

    ? formatUsdFromZarMonthly(config.recurringAmount)

    : undefined



  return (

    <div className="fixed inset-0 z-0 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-white dark:bg-gray-900">

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 pb-20 sm:px-6">

        <div className="text-center space-y-2">

          {showProManage ? (

            <>

              <div className="flex items-center justify-center gap-2">

                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">

                  DreamScale Pro

                </h1>

                <ProPlanBadge active />

              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl mx-auto">

                You&apos;re subscribed. Compare plans below or cancel anytime.

              </p>

            </>

          ) : (

            <>

              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">

                Choose your plan

              </h1>

              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl mx-auto">

                DreamScale Pro is $19.99/month. PayFast charges the ZAR equivalent at checkout.

              </p>

            </>

          )}

        </div>



        <LocalBillingNotice isPro={isPro} signedIn={!!userId} />



        <PlanComparison

          isPro={isPro}

          config={config}

          userId={userId}

          userEmail={userEmail}

          amountLabel={amountLabel}

        />



        <CancelProSection />



        <p className="text-center text-xs text-gray-500">

          <Link href="/" className="underline hover:text-gray-700 dark:hover:text-gray-300">

            Back to DreamScale

          </Link>

        </p>

      </div>

    </div>

  )

}


