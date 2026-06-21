/** Per-goal Venture Quest progress (tasks + path snapshots in localStorage). */

export function buildGoalId(goalTitle: string, category: string): string {
  return `${goalTitle}-${category}`
}

export type GoalSnapshot = {
  tasks: unknown[]
  miniWins: unknown[]
  quests: unknown[]
  hypePoints?: number
  currentStreak?: number
  longestStreak?: number
  goalProgress?: number
  lastActiveDate?: string
  streakStartDate?: string
}

function snapshotKey(userId: string, goalId: string): string {
  return `hypeos-goal-snapshot-${userId}-${goalId}`
}

export function saveGoalSnapshot(
  userId: string,
  goalId: string,
  snapshot: GoalSnapshot
): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(snapshotKey(userId, goalId), JSON.stringify(snapshot))
  } catch (error) {
    console.error('Error saving goal snapshot:', error)
  }
}

export function loadGoalSnapshot(
  userId: string,
  goalId: string
): GoalSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(snapshotKey(userId, goalId))
    if (!stored) return null
    return JSON.parse(stored) as GoalSnapshot
  } catch (error) {
    console.error('Error loading goal snapshot:', error)
    return null
  }
}
