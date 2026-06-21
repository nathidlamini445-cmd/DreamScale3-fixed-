export type RoadmapPhaseId = 'week' | 'month' | 'quarter'

export const ROADMAP_PHASES: {
  id: RoadmapPhaseId
  label: string
  subtitle: string
  accent: string
  border: string
  bg: string
}[] = [
  {
    id: 'week',
    label: 'This Week',
    subtitle: 'Start here — quick wins',
    accent: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
  },
  {
    id: 'month',
    label: 'This Month',
    subtitle: 'Build momentum',
    accent: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
    bg: 'bg-blue-50/80 dark:bg-blue-950/30',
  },
  {
    id: 'quarter',
    label: 'This Quarter',
    subtitle: 'Strategic moves',
    accent: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-300 dark:border-violet-700',
    bg: 'bg-violet-50/80 dark:bg-violet-950/30',
  },
]

/** Distribute roadmap items across time phases. */
export function assignSuggestionPhase(
  index: number,
  total: number,
  priority: 'high' | 'medium' | 'low'
): RoadmapPhaseId {
  if (total <= 3) {
    if (index === 0) return 'week'
    if (index === 1) return 'month'
    return 'quarter'
  }
  if (priority === 'high' && index < 2) return 'week'
  const weekSlots = Math.max(2, Math.ceil(total * 0.4))
  const monthSlots = Math.max(2, Math.ceil(total * 0.4))
  if (index < weekSlots) return 'week'
  if (index < weekSlots + monthSlots) return 'month'
  return 'quarter'
}
