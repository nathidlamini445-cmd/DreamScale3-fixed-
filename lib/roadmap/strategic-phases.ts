export type StrategicPhaseId = 'clarify' | 'design' | 'execute'

export const STRATEGIC_PHASES: {
  id: StrategicPhaseId
  label: string
  subtitle: string
  accent: string
  border: string
  bg: string
}[] = [
  {
    id: 'clarify',
    label: 'Clarify',
    subtitle: 'Answer the hard questions',
    accent: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50/80 dark:bg-amber-950/30',
  },
  {
    id: 'design',
    label: 'Design',
    subtitle: 'Build the right systems',
    accent: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-300 dark:border-indigo-700',
    bg: 'bg-indigo-50/80 dark:bg-indigo-950/30',
  },
  {
    id: 'execute',
    label: 'Execute',
    subtitle: 'Focus & follow through',
    accent: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-700',
    bg: 'bg-rose-50/80 dark:bg-rose-950/30',
  },
]

export function assignStrategicPhase(index: number, total: number): StrategicPhaseId {
  if (total <= 1) return 'clarify'
  if (total === 2) return index === 0 ? 'clarify' : 'execute'
  const third = Math.ceil(total / 3)
  if (index < third) return 'clarify'
  if (index < third * 2) return 'design'
  return 'execute'
}
