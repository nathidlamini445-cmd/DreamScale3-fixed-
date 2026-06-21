import type { RevenueDashboard, RevenueGoal } from '@/lib/revenue-types'

/** Parse onboarding MRR strings like "$1K-$5K" into a numeric estimate. */
export function parseOnboardingMrr(value: string | string[] | null | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'string') return 0
  const s = raw.toLowerCase().trim()
  if (s.includes('under') || s.includes('pre-revenue') || s.includes('none')) return 0
  const range = s.match(/(\d+(?:\.\d+)?)\s*k\s*[-–]\s*(\d+(?:\.\d+)?)\s*k/)
  if (range) return ((parseFloat(range[1]) + parseFloat(range[2])) / 2) * 1000
  const singleK = s.match(/(\d+(?:\.\d+)?)\s*k/)
  if (singleK) return parseFloat(singleK[1]) * 1000
  const digits = s.replace(/[^0-9.]/g, '')
  const num = parseFloat(digits)
  return Number.isFinite(num) ? num : 0
}

export function parseOnboardingRevenueGoal(
  value: string | string[] | null | undefined,
  fallbackMrr: number
): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'string') return fallbackMrr * 2 || 10000
  const mrr = parseOnboardingMrr(raw)
  if (mrr > 0) return mrr
  if (raw.toLowerCase().includes('10k')) return 10000
  if (raw.toLowerCase().includes('50k')) return 50000
  if (raw.toLowerCase().includes('100k')) return 100000
  return fallbackMrr * 3 || 15000
}

export function buildStarterDashboard(opts: {
  businessName?: string
  mrr: number
}): RevenueDashboard {
  const mrr = opts.mrr || 2500
  const name = opts.businessName?.trim() || 'My Revenue Dashboard'
  const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']
  const growth = 1.05
  return {
    id: `seed-${Date.now()}`,
    name: `${name} — Starter`,
    mrr,
    arr: mrr * 12,
    churnRate: 3,
    runway: mrr > 0 ? 12 : 6,
    forecast: months.map((month, i) => ({
      month,
      projectedRevenue: Math.round(mrr * Math.pow(growth, i)),
      confidence: Math.max(55, 85 - i * 5),
    })),
    date: new Date().toISOString(),
  }
}

export function buildStarterGoal(opts: {
  businessName?: string
  target: number
}): RevenueGoal {
  const target = opts.target || 10000
  const name = opts.businessName?.trim() || 'My Business'
  const end = new Date()
  end.setMonth(end.getMonth() + 3)
  return {
    id: `seed-goal-${Date.now()}`,
    name: `${name} — Q Revenue Target`,
    target,
    timeframe: 'quarterly',
    startDate: new Date().toISOString(),
    endDate: end.toISOString(),
    currentProgress: 0,
    weeklyActions: [
      {
        week: 'Week 1',
        actions: [
          'Review current revenue streams and pricing',
          'Identify top 3 upsell opportunities',
          'Set up weekly revenue tracking',
        ],
        target: Math.round(target / 12),
      },
    ],
    milestones: [
      { milestone: '25% of target', target: target * 0.25, achieved: false },
      { milestone: '50% of target', target: target * 0.5, achieved: false },
      { milestone: '75% of target', target: target * 0.75, achieved: false },
      { milestone: 'Goal reached', target, achieved: false },
    ],
    date: new Date().toISOString(),
  }
}
