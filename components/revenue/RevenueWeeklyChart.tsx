'use client'

import type { WeeklyRevenueCheckIn } from '@/lib/revenue-types'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

type RevenueWeeklyChartProps = {
  checkIns: WeeklyRevenueCheckIn[]
}

export function RevenueWeeklyChart({ checkIns }: RevenueWeeklyChartProps) {
  const recent = [...checkIns]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-8)

  if (recent.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 p-6 text-center text-sm text-gray-500">
        Complete your first weekly check-in to see your revenue trend.
      </div>
    )
  }

  const max = Math.max(...recent.map((c) => c.amount), 1)

  return (
    <div className="w-full rounded-xl border border-gray-200/60 bg-white p-6 dark:border-gray-800/60 dark:bg-slate-950">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Revenue trend (weekly)
      </h3>
      <div className="flex items-end gap-2 h-32">
        {recent.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-1 flex-col items-center justify-end gap-1 min-w-0"
          >
            <span className="text-[10px] text-gray-500 truncate w-full text-center">
              {fmt(entry.amount)}
            </span>
            <div
              className="w-full rounded-t bg-gray-900 dark:bg-white transition-all"
              style={{
                height: `${Math.max(8, (entry.amount / max) * 100)}%`,
              }}
              title={`${entry.weekKey}: ${fmt(entry.amount)}`}
            />
            <span className="text-[10px] text-gray-400 truncate w-full text-center">
              {entry.weekKey.replace(/^\d+-W/, 'W')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
