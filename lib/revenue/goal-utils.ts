import type { RevenueGoal } from '@/lib/revenue-types'

export function goalProgressPercent(goal: RevenueGoal): number {
  if (!goal.target) return 0
  return Math.min((goal.currentProgress / goal.target) * 100, 100)
}

export function recalcGoalProgress(goal: RevenueGoal): RevenueGoal {
  const fromMilestones = goal.milestones
    .filter((m) => m.achieved)
    .reduce((sum, m) => sum + m.target, 0)
  return {
    ...goal,
    currentProgress: Math.min(Math.max(fromMilestones, goal.currentProgress), goal.target),
  }
}

export function toggleMilestone(goal: RevenueGoal, index: number): RevenueGoal {
  const milestones = goal.milestones.map((m, i) => {
    if (i !== index) return m
    const achieved = !m.achieved
    return {
      ...m,
      achieved,
      achievedDate: achieved ? new Date().toISOString() : undefined,
    }
  })
  return recalcGoalProgress({ ...goal, milestones })
}

export function setGoalProgress(goal: RevenueGoal, amount: number): RevenueGoal {
  return recalcGoalProgress({
    ...goal,
    currentProgress: Math.min(Math.max(0, amount), goal.target),
  })
}
