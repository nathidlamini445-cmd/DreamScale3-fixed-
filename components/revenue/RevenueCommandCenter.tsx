'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  Target,
  TrendingUp,
  Sparkles,
  Table2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ExportToGoogleSheetsButton } from '@/components/integrations/ExportToGoogleSheetsButton'
import { formatFullRevenueOsForSheet } from '@/lib/revenue/format-revenue-export'
import { goalProgressPercent } from '@/lib/revenue/goal-utils'
import type { RevenueData } from '@/lib/revenue-types'
import { cn } from '@/lib/utils'

type RevenueCommandCenterProps = {
  data: RevenueData
  businessName?: string
  isPro: boolean
  onSeedFromProfile?: () => void
  seeding?: boolean
  showSeedPrompt?: boolean
  onTabChange?: (tab: string) => void
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function RevenueCommandCenter({
  data,
  businessName,
  isPro,
  onSeedFromProfile,
  seeding,
  showSeedPrompt,
  onTabChange,
}: RevenueCommandCenterProps) {
  const [dismissedSeed, setDismissedSeed] = useState(false)

  const latestDashboard = data.dashboards[data.dashboards.length - 1]
  const activeGoal =
    data.goals.find((g) => new Date(g.endDate) > new Date()) ?? data.goals[data.goals.length - 1]
  const latestOptimization = data.optimizations[data.optimizations.length - 1]
  const latestScenario = data.scenarios[data.scenarios.length - 1]

  const weeklyActions =
    activeGoal?.weeklyActions[0]?.actions.slice(0, 3) ??
    latestOptimization?.analysis.pricingChanges[0]?.implementation.slice(0, 3) ??
    []

  const fullExport = formatFullRevenueOsForSheet(data, businessName)
  const hasData =
    data.dashboards.length +
      data.goals.length +
      data.optimizations.length +
      data.scenarios.length >
    0

  return (
    <div className="mb-10 space-y-4">
      {showSeedPrompt && !dismissedSeed && onSeedFromProfile && (
        <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900 dark:bg-blue-950/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Quick start from your profile
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                We&apos;ll create a starter dashboard and revenue goal using your onboarding answers.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={onSeedFromProfile} disabled={seeding}>
              {seeding ? 'Setting up…' : 'Set up workspace'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDismissedSeed(true)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/80 p-6 shadow-sm dark:border-gray-800/60 dark:from-slate-950 dark:to-slate-900/80">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Command Center
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {businessName ? `${businessName} · ` : ''}
              Your live revenue snapshot
            </p>
          </div>
          {isPro && hasData && (
            <ExportToGoogleSheetsButton
              label="Export full workspace"
              title={fullExport.title}
              payload={{ sheets: fullExport.sheets, title: fullExport.title }}
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200/60 bg-white p-4 dark:border-gray-800/60 dark:bg-slate-950">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              <BarChart3 className="h-3.5 w-3.5" />
              MRR
            </div>
            {latestDashboard ? (
              <>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {fmt(latestDashboard.mrr)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Runway {latestDashboard.runway.toFixed(0)} mo · Churn {latestDashboard.churnRate}%
                </p>
                <Link
                  href={`/revenue-intelligence/dashboard/${latestDashboard.id}`}
                  className="mt-3 inline-flex items-center text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  View dashboard <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onTabChange?.('dashboard')}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Create your first dashboard
              </button>
            )}
          </div>

          <div className="rounded-lg border border-gray-200/60 bg-white p-4 dark:border-gray-800/60 dark:bg-slate-950">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              <Target className="h-3.5 w-3.5" />
              Active goal
            </div>
            {activeGoal ? (
              <>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {activeGoal.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {fmt(activeGoal.currentProgress)} / {fmt(activeGoal.target)}
                </p>
                <Progress value={goalProgressPercent(activeGoal)} className="mt-2 h-1.5" />
                <Link
                  href={`/revenue-intelligence/goal/${activeGoal.id}`}
                  className="mt-3 inline-flex items-center text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Track milestones <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onTabChange?.('goals')}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Set a revenue goal
              </button>
            )}
          </div>

          <div className="rounded-lg border border-gray-200/60 bg-white p-4 dark:border-gray-800/60 dark:bg-slate-950">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              <TrendingUp className="h-3.5 w-3.5" />
              Latest insight
            </div>
            {latestScenario ? (
              <>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {latestScenario.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">{latestScenario.scenario}</p>
                <Link
                  href={`/revenue-intelligence/scenario/${latestScenario.id}`}
                  className="mt-3 inline-flex items-center text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  View scenario <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </>
            ) : latestOptimization ? (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {latestOptimization.analysis.pricingChanges[0]?.suggestion ??
                  'Optimization analysis ready'}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => onTabChange?.('scenarios')}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Run a what-if scenario
              </button>
            )}
          </div>
        </div>

        {weeklyActions.length > 0 && (
          <div className="mt-6 rounded-lg border border-gray-200/60 bg-white p-4 dark:border-gray-800/60 dark:bg-slate-950">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                This week&apos;s revenue actions
              </p>
              <Link
                href="/venture-quest"
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Do in Venture Quest →
              </Link>
            </div>
            <ul className="space-y-2">
              {weeklyActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isPro && (
          <p className={cn('mt-4 text-center text-xs text-gray-500')}>
            <Table2 className="mr-1 inline h-3.5 w-3.5" />
            Upgrade to Pro for unlimited AI runs, charts, full workspace export, and Google Sheets sync.
          </p>
        )}
      </div>
    </div>
  )
}
