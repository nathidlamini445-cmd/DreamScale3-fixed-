import type { RevenueData } from '@/lib/revenue-types'
import {
  buildStarterDashboard,
  buildStarterGoal,
  parseOnboardingMrr,
  parseOnboardingRevenueGoal,
} from '@/lib/revenue/onboarding-seed'

type ProfileLike = {
  monthlyRevenue?: string | string[] | null
  revenueGoal?: string | string[] | null
  businessName?: string | null
  name?: string | null
} | null | undefined

export function shouldAutoSeedRevenue(
  data: RevenueData,
  profile: ProfileLike
): boolean {
  if (data.dashboards.length > 0 || data.goals.length > 0) return false
  if (!profile) return false
  return !!(profile.monthlyRevenue || profile.revenueGoal)
}

export function seedRevenueFromProfile(
  profile: ProfileLike,
  existing: RevenueData
): RevenueData {
  const businessName =
    (typeof profile?.businessName === 'string' ? profile.businessName : null) ??
    (typeof profile?.name === 'string' ? profile.name : null) ??
    undefined

  const mrr = parseOnboardingMrr(profile?.monthlyRevenue ?? null)
  const target = parseOnboardingRevenueGoal(profile?.revenueGoal ?? null, mrr)
  const dashboard = buildStarterDashboard({ businessName, mrr })
  const goal = buildStarterGoal({ businessName, target })

  return {
    ...existing,
    dashboards: [...existing.dashboards, dashboard],
    goals: [...existing.goals, goal],
  }
}
