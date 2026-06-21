import type { RevenueData, RevenueGoal } from '@/lib/revenue-types'
import * as supabaseData from '@/lib/supabase-data'

const STORAGE_KEY = 'revenueos:data'

export async function loadRevenueDataLocal(userId?: string): Promise<RevenueData | null> {
  if (userId) {
    try {
      const db = await supabaseData.loadRevenueData(userId)
      if (db) {
        return {
          ...(db as RevenueData),
          weeklyCheckIns: (db as RevenueData).weeklyCheckIns ?? [],
        }
      }
    } catch {
      // fall through
    }
  }
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null
  try {
    const parsed = JSON.parse(saved) as RevenueData
    return {
      ...parsed,
      weeklyCheckIns: parsed.weeklyCheckIns ?? [],
    }
  } catch {
    return null
  }
}

export async function saveRevenueDataLocal(userId: string | undefined, data: RevenueData): Promise<void> {
  if (userId) {
    try {
      await supabaseData.saveRevenueData(userId, data)
    } catch (e) {
      console.error('Supabase revenue save failed:', e)
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

export async function updateRevenueGoalPersisted(
  userId: string | undefined,
  updatedGoal: RevenueGoal
): Promise<RevenueData | null> {
  const data = await loadRevenueDataLocal(userId)
  if (!data) return null
  const next: RevenueData = {
    ...data,
    goals: data.goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
  }
  await saveRevenueDataLocal(userId, next)
  return next
}
