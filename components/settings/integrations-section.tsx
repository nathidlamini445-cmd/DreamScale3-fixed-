'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { cn } from '@/lib/utils'

function IntegrationCard({
  title,
  description,
  showProBadge,
  isPro,
  comingSoonLabel,
  upgradeHref = '/billing',
}: {
  title: string
  description: string
  showProBadge: boolean
  isPro: boolean
  comingSoonLabel: string
  upgradeHref?: string
}) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="min-w-0 flex-1 p-5 pb-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {showProBadge && <ProPlanBadge active className="shrink-0 text-[10px]" />}
        </div>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Status: Not connected</p>
      </div>

      <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/40">
        {isPro ? (
          <div
            className={cn(
              'flex w-full min-h-10 items-center justify-center rounded-md border border-gray-200',
              'bg-white px-3 py-2.5 text-center text-sm font-medium text-gray-500',
              'dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400'
            )}
            aria-disabled="true"
          >
            {comingSoonLabel}
          </div>
        ) : (
          <Link
            href={upgradeHref}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 w-full')}
          >
            Upgrade to connect
          </Link>
        )}
      </div>
    </div>
  )
}

export function IntegrationsSection() {
  const { isPro, loading } = useSubscriptionStatus()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
          Integrations
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Connect DreamScale to Google and Notion (Pro). Export reports and sync your
          calendar from here.
        </p>
      </div>

      <div className="grid items-stretch gap-4 sm:grid-cols-2">
        <IntegrationCard
          title="Google"
          description="Calendar sync and export to Google Docs from Bizora, DreamPulse, and more."
          showProBadge={isPro}
          isPro={isPro}
          comingSoonLabel="Connect Google — coming soon"
        />
        <IntegrationCard
          title="Notion"
          description="Export roadmaps, competitor reports, and coaching notes to your Notion workspace."
          showProBadge={isPro}
          isPro={isPro}
          comingSoonLabel="Connect Notion — coming soon"
        />
      </div>

      {!loading && !isPro && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Integrations are included with DreamScale Pro.{' '}
          <Link href="/billing" className="text-[#005DFF] underline">
            View plans
          </Link>
        </p>
      )}
    </div>
  )
}
