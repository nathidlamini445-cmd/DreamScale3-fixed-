import type { RevenueData, RevenueGoal } from '@/lib/revenue-types'
import { setGoalProgress } from '@/lib/revenue/goal-utils'
import { saveRevenueDataLocal, loadRevenueDataLocal } from '@/lib/revenue/persist-revenue'
import { buildGoalId } from '@/lib/hypeos/goal-storage'

export type RevenueVentureSync = {
  revenueGoalId: string
  ventureGoalId: string
  ventureGoalTitle: string
  weeklyActions: string[]
  completedPathSteps: number
  weekKey: string
  linkedAt: string
}

const SYNC_PREFIX = 'hypeos:revenue-sync:'

function weekKey(): string {
  const d = new Date()
  const onejan = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
  )
  return `${d.getFullYear()}-W${week}`
}

function syncStorageKey(ventureGoalId: string): string {
  return `${SYNC_PREFIX}${ventureGoalId}`
}

export function loadRevenueVentureSync(
  ventureGoalId: string
): RevenueVentureSync | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(syncStorageKey(ventureGoalId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as RevenueVentureSync
    if (parsed.weekKey !== weekKey()) {
      return {
        ...parsed,
        completedPathSteps: 0,
        weekKey: weekKey(),
      }
    }
    return parsed
  } catch {
    return null
  }
}

export function linkRevenueGoalToVentureQuest(opts: {
  revenueGoal: RevenueGoal
  ventureGoalTitle: string
  ventureCategory: string
}): RevenueVentureSync {
  const ventureGoalId = buildGoalId(
    opts.ventureGoalTitle,
    opts.ventureCategory
  )
  const weeklyActions =
    opts.revenueGoal.weeklyActions[0]?.actions?.slice(0, 3) ?? [
      'Complete one high-impact revenue action',
      'Review pricing or offer positioning',
      'Log outreach or sales activity',
    ]

  const sync: RevenueVentureSync = {
    revenueGoalId: opts.revenueGoal.id,
    ventureGoalId,
    ventureGoalTitle: opts.ventureGoalTitle,
    weeklyActions,
    completedPathSteps: 0,
    weekKey: weekKey(),
    linkedAt: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(syncStorageKey(ventureGoalId), JSON.stringify(sync))
  }
  return sync
}

export function progressBumpPerStep(goal: RevenueGoal): number {
  const actions =
    goal.weeklyActions[0]?.actions?.length ||
    loadRevenueVentureSync(goal.ventureQuestGoalId || '')?.weeklyActions
      .length ||
    3
  return Math.max(goal.target / (actions * 4), 50)
}

export async function applyVentureQuestStepToRevenue(
  userId: string | undefined,
  ventureGoalId: string
): Promise<{ goal: RevenueGoal; bump: number } | null> {
  const sync = loadRevenueVentureSync(ventureGoalId)
  if (!sync) return null

  const data = await loadRevenueDataLocal(userId)
  if (!data) return null

  const goalIndex = data.goals.findIndex((g) => g.id === sync.revenueGoalId)
  if (goalIndex < 0) return null

  const goal = data.goals[goalIndex]
  const maxSteps = sync.weeklyActions.length
  if (sync.completedPathSteps >= maxSteps) return null

  const bump = progressBumpPerStep(goal)
  const updatedGoal = setGoalProgress(goal, goal.currentProgress + bump)
  updatedGoal.ventureQuestGoalId = ventureGoalId

  const nextGoals = [...data.goals]
  nextGoals[goalIndex] = updatedGoal

  const nextData: RevenueData = { ...data, goals: nextGoals }
  await saveRevenueDataLocal(userId, nextData)

  const nextSync: RevenueVentureSync = {
    ...sync,
    completedPathSteps: sync.completedPathSteps + 1,
    weekKey: weekKey(),
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      syncStorageKey(ventureGoalId),
      JSON.stringify(nextSync)
    )
  }

  return { goal: updatedGoal, bump }
}

export function getActiveRevenueGoal(data: RevenueData): RevenueGoal | null {
  const active = data.goals.find((g) => new Date(g.endDate) > new Date())
  return active ?? data.goals[data.goals.length - 1] ?? null
}

export function normalizeRevenueData(parsed: Partial<RevenueData>): RevenueData {
  return {
    dashboards: parsed.dashboards || [],
    optimizations: parsed.optimizations || [],
    pricingStrategies: parsed.pricingStrategies || [],
    goals: parsed.goals || [],
    ltvAnalyses: parsed.ltvAnalyses || [],
    scenarios: parsed.scenarios || [],
    weeklyCheckIns: parsed.weeklyCheckIns || [],
  }
}
