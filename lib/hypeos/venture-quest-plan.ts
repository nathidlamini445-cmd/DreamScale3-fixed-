/** Venture Quest Free vs Pro limits and helpers */

export const VENTURE_QUEST_FREE_BRANCH_ID = 'sales'

export const VENTURE_QUEST_FREE_AI_GENS_LIMIT = 2

export const VENTURE_QUEST_FREE_DAILY_PATH_STEPS = 3

export const VENTURE_QUEST_FREE_MAX_GOALS = 1

export function canAccessVentureQuestBranch(
  branchId: string,
  isPro: boolean
): boolean {
  return isPro || branchId === VENTURE_QUEST_FREE_BRANCH_ID
}

export function getStreakMomentumMultiplier(
  streak: number,
  isPro: boolean
): number {
  if (!isPro) return 1
  return streak >= 3 ? 1.5 : 1
}

function currentPeriod(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function todayKey(): string {
  return new Date().toDateString()
}

/** Local fallback when user is not signed in */
export function canUseLocalAiGeneration(): boolean {
  if (typeof window === 'undefined') return true
  const period = currentPeriod()
  const key = `hypeos:free:aiGens:${period}`
  const used = parseInt(localStorage.getItem(key) || '0', 10)
  return used < VENTURE_QUEST_FREE_AI_GENS_LIMIT
}

export function recordLocalAiGeneration(): void {
  if (typeof window === 'undefined') return
  const period = currentPeriod()
  const key = `hypeos:free:aiGens:${period}`
  const used = parseInt(localStorage.getItem(key) || '0', 10)
  localStorage.setItem(key, String(used + 1))
}

export function canUseLocalPathStep(): boolean {
  if (typeof window === 'undefined') return true
  const key = `hypeos:free:pathSteps:${todayKey()}`
  const used = parseInt(localStorage.getItem(key) || '0', 10)
  return used < VENTURE_QUEST_FREE_DAILY_PATH_STEPS
}

export function recordLocalPathStep(): void {
  if (typeof window === 'undefined') return
  const key = `hypeos:free:pathSteps:${todayKey()}`
  const used = parseInt(localStorage.getItem(key) || '0', 10)
  localStorage.setItem(key, String(used + 1))
}

export function getLocalPathStepsUsedToday(): number {
  if (typeof window === 'undefined') return 0
  const key = `hypeos:free:pathSteps:${todayKey()}`
  return parseInt(localStorage.getItem(key) || '0', 10)
}
