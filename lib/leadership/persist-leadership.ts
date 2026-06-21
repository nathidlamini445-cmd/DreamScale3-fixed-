import {
  INITIAL_LEADERSHIP_DATA,
  type LeadershipAdvice,
  type LeadershipData,
} from '@/lib/leadership-types'
import * as supabaseData from '@/lib/supabase-data'

export const LEADERSHIP_STORAGE_KEY = 'leadership:data'
const LEGACY_PROBLEM_SOLVER_KEY = 'leadership:problem-solver'

function readLocalLeadership(): LeadershipData | null {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(LEADERSHIP_STORAGE_KEY)
  if (!saved) return null
  try {
    return normalizeLeadershipData(JSON.parse(saved))
  } catch {
    return null
  }
}

function readLegacyProblemSolver(): LeadershipAdvice[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(LEGACY_PROBLEM_SOLVER_KEY)
  if (!saved) return []
  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function normalizeLeadershipData(raw: Partial<LeadershipData> | null): LeadershipData {
  const base = { ...INITIAL_LEADERSHIP_DATA, ...raw }
  return {
    styleAssessment: base.styleAssessment ?? null,
    decisions: base.decisions ?? [],
    communications: base.communications ?? [],
    conflicts: base.conflicts ?? [],
    routines: base.routines ?? [],
    challenges: base.challenges ?? [],
    feedback360: base.feedback360 ?? [],
    problemSolverAdvice: base.problemSolverAdvice ?? [],
  }
}

export async function loadLeadershipDataLocal(userId?: string): Promise<LeadershipData> {
  const local = readLocalLeadership()
  const legacyAdvice = readLegacyProblemSolver()

  if (userId) {
    try {
      const db = await supabaseData.loadLeadershipData(userId)
      if (db) {
        const merged = normalizeLeadershipData(db as Partial<LeadershipData>)
        if (!merged.problemSolverAdvice.length && local?.problemSolverAdvice?.length) {
          merged.problemSolverAdvice = local.problemSolverAdvice
        }
        if (!merged.problemSolverAdvice.length && legacyAdvice.length) {
          merged.problemSolverAdvice = legacyAdvice
        }
        return merged
      }
    } catch (e) {
      console.warn('Failed to load leadership data from Supabase:', e)
    }
  }

  if (local) {
    if (!local.problemSolverAdvice.length && legacyAdvice.length) {
      local.problemSolverAdvice = legacyAdvice
    }
    return local
  }

  if (legacyAdvice.length) {
    return { ...INITIAL_LEADERSHIP_DATA, problemSolverAdvice: legacyAdvice }
  }

  return { ...INITIAL_LEADERSHIP_DATA }
}

export async function saveLeadershipDataLocal(
  userId: string | undefined,
  data: LeadershipData
): Promise<void> {
  const normalized = normalizeLeadershipData(data)

  if (userId) {
    try {
      await supabaseData.saveLeadershipData(userId, normalized)
    } catch (e) {
      console.error('Supabase leadership save failed:', e)
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LEADERSHIP_STORAGE_KEY, JSON.stringify(normalized))
    if (normalized.problemSolverAdvice.length) {
      localStorage.removeItem(LEGACY_PROBLEM_SOLVER_KEY)
    }
  }
}

export type LeadershipDetailKind =
  | 'decisions'
  | 'communications'
  | 'conflicts'
  | 'routines'
  | 'challenges'
  | 'feedback360'
  | 'problemSolverAdvice'

export async function findLeadershipItemById<T extends { id: string }>(
  userId: string | undefined,
  kind: LeadershipDetailKind,
  id: string
): Promise<T | null> {
  const data = await loadLeadershipDataLocal(userId)
  const list = data[kind] as T[]
  return list.find((item) => item.id === id) ?? null
}
