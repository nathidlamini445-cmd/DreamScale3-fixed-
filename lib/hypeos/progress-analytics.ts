import { loadUserHistory } from './daily-goals'
import { loadDailyQuestActivity } from './daily-quest-sync'
import { loadSkillTree } from './skill-tree'
import { buildGoalId } from './goal-storage'

export type ProgressUser = {
  name?: string
  level?: number
  hypePoints?: number
  currentStreak?: number
  longestStreak?: number
  goalProgress?: number
  goalTitle?: string
  goalTarget?: string
  goalCurrent?: string
  category?: string
}

export type ProgressTask = {
  id: number
  title: string
  completed: boolean
  points: number
  impact?: 'high' | 'medium' | 'low'
  category?: string
}

export type ProgressAnalytics = {
  totalPoints: number
  weeklyPoints: number[]
  monthlyProgress: number
  streakData: { current: number; longest: number; average: number }
  taskCompletion: { high: number; medium: number; low: number }
  categoryBreakdown: Array<{ category: string; points: number; percentage: number }>
  weeklyInsights: string[]
  growthVelocity: string | null
}

function pathProgressPercent(user: ProgressUser, userId: string): number {
  if (!user.goalTitle || typeof window === 'undefined') return 0
  const goalId = buildGoalId(user.goalTitle, user.category || '')
  const tree = loadSkillTree(userId, goalId)
  if (!tree?.branches?.length) return 0

  const skills = tree.branches.flatMap((branch) => branch.skills || [])
  if (skills.length === 0) return 0

  const avg =
    skills.reduce((sum, skill) => sum + (skill.progress || 0), 0) / skills.length
  return Math.round(avg)
}

function calcGrowthVelocity(lastWeekXP: number[]): string | null {
  if (!lastWeekXP.length) return null
  const firstHalf = lastWeekXP.slice(0, 3).reduce((sum, val) => sum + val, 0)
  const secondHalf = lastWeekXP.slice(4, 7).reduce((sum, val) => sum + val, 0)
  if (firstHalf === 0 && secondHalf === 0) return null
  if (firstHalf === 0) return 'New momentum'
  const mult = secondHalf / Math.max(1, firstHalf)
  return mult >= 1 ? `+${mult.toFixed(1)}x` : `${mult.toFixed(1)}x`
}

export function buildProgressAnalytics(
  user: ProgressUser | null,
  tasks: ProgressTask[],
  userId: string
): ProgressAnalytics {
  const history = loadUserHistory(userId)
  const goalId = user?.goalTitle
    ? buildGoalId(user.goalTitle, user.category || '')
    : 'default'
  const activity = loadDailyQuestActivity(goalId)

  const totalPoints = user?.hypePoints || 0
  const weeklyPoints =
    history.lastWeekXP.length === 7
      ? [...history.lastWeekXP]
      : Array.from({ length: 7 }, () => 0)

  // Ensure today's path/task work shows even if history wasn't synced yet
  const todayIndex = (() => {
    const day = new Date().getDay()
    return day === 0 ? 6 : day - 1
  })()
  if (activity.xpEarned > 0 && weeklyPoints[todayIndex] < activity.xpEarned) {
    weeklyPoints[todayIndex] = activity.xpEarned
  }

  const completedTasks = tasks.filter((t) => t.completed)
  const highImpactTasks = tasks.filter((t) => t.impact === 'high')
  const mediumImpactTasks = tasks.filter((t) => t.impact === 'medium')
  const lowImpactTasks = tasks.filter((t) => t.impact === 'low')

  let taskCompletion = {
    high:
      highImpactTasks.length > 0
        ? Math.round(
            (highImpactTasks.filter((t) => t.completed).length /
              highImpactTasks.length) *
              100
          )
        : 0,
    medium:
      mediumImpactTasks.length > 0
        ? Math.round(
            (mediumImpactTasks.filter((t) => t.completed).length /
              mediumImpactTasks.length) *
              100
          )
        : 0,
    low:
      lowImpactTasks.length > 0
        ? Math.round(
            (lowImpactTasks.filter((t) => t.completed).length /
              lowImpactTasks.length) *
              100
          )
        : 0,
  }

  // Path-only work: derive rates from today's activity
  if (completedTasks.length === 0 && activity.tasksCompleted > 0) {
    taskCompletion = {
      high: Math.min(100, Math.round((activity.highImpactTasks / 2) * 100)),
      medium: Math.min(
        100,
        Math.round(
          ((activity.tasksCompleted - activity.highImpactTasks) / 3) * 100
        )
      ),
      low: 0,
    }
  }

  const categoryMap = new Map<string, number>()
  completedTasks.forEach((task) => {
    const category = task.category || 'Venture Quest'
    categoryMap.set(category, (categoryMap.get(category) || 0) + (task.points || 0))
  })
  if (activity.xpEarned > 0 && categoryMap.size === 0) {
    categoryMap.set('Skill path', activity.xpEarned)
  }

  const totalCategoryPoints = Array.from(categoryMap.values()).reduce(
    (sum, val) => sum + val,
    0
  )
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, points]) => ({
      category,
      points,
      percentage:
        totalCategoryPoints > 0
          ? Math.round((points / totalCategoryPoints) * 100)
          : 0,
    }))
    .sort((a, b) => b.points - a.points)

  const pathProgress = user ? pathProgressPercent(user, userId) : 0
  const monthlyProgress = Math.max(user?.goalProgress || 0, pathProgress)

  const insights: string[] = []
  const tasksDone = Math.max(completedTasks.length, activity.tasksCompleted)
  if (tasksDone > 0) {
    insights.push(
      `You've completed ${tasksDone} task${tasksDone !== 1 ? 's' : ''} recently`
    )
  }
  if (user?.currentStreak && user.currentStreak > 0) {
    insights.push(`You're on a ${user.currentStreak}-day streak!`)
  }
  if (activity.pathSteps > 0) {
    insights.push(
      `${activity.pathSteps} skill path step${activity.pathSteps !== 1 ? 's' : ''} completed today`
    )
  }
  if (taskCompletion.high >= 70) {
    insights.push("You're excelling at high-impact tasks")
  }
  if (totalPoints > 0) {
    insights.push(`You've earned ${totalPoints.toLocaleString()} points total`)
  }

  return {
    totalPoints,
    weeklyPoints,
    monthlyProgress,
    streakData: {
      current: user?.currentStreak || 0,
      longest: user?.longestStreak || 0,
      average: user?.currentStreak || 0,
    },
    taskCompletion,
    categoryBreakdown:
      categoryBreakdown.length > 0
        ? categoryBreakdown
        : [{ category: 'Skill path', points: activity.xpEarned || 0, percentage: 100 }],
    weeklyInsights:
      insights.length > 0
        ? insights
        : ['Start completing tasks to see your analytics'],
    growthVelocity: calcGrowthVelocity(weeklyPoints),
  }
}
