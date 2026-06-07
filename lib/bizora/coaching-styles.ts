export type CoachingStyleId =
  | 'balanced'
  | 'mentorship'
  | 'direct'
  | 'understanding'
  | 'deep'

export type CoachingStyleOption = {
  id: CoachingStyleId
  label: string
  description: string
}

export const BIZORA_COACHING_STYLES: CoachingStyleOption[] = [
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Clear, practical coaching (default)',
  },
  {
    id: 'mentorship',
    label: 'Mentorship',
    description: 'Teach, guide, and build your skills',
  },
  {
    id: 'direct',
    label: 'Direct & strict',
    description: 'Accountability-first, no fluff',
  },
  {
    id: 'understanding',
    label: 'Understanding',
    description: 'Patient, empathetic, supportive',
  },
  {
    id: 'deep',
    label: 'Deep dive',
    description: 'Thorough, nuanced exploration',
  },
]

const STYLE_PROMPTS: Record<CoachingStyleId, string> = {
  balanced: '',
  mentorship:
    '\n\nACTIVE COACHING STYLE — MENTORSHIP (you MUST follow this for the entire response): Act as a seasoned entrepreneur mentor. Teach frameworks, explain the why behind advice, and help the user build judgment—not just follow steps. Use examples from real business journeys. Tone: guiding and educational.',
  direct:
    '\n\nACTIVE COACHING STYLE — DIRECT & STRICT (you MUST follow this for the entire response): Be firm, concise, and accountability-focused. Challenge weak assumptions clearly. Prioritize decisive next actions, deadlines, and measurable commitments. Minimal fluff—hold the user to a high standard.',
  understanding:
    '\n\nACTIVE COACHING STYLE — UNDERSTANDING (you MUST follow this for the entire response): Lead with empathy and patience. Acknowledge pressure and uncertainty before advising. Break work into small, manageable steps and reinforce progress. Tone: warm, calm, and supportive.',
  deep:
    '\n\nACTIVE COACHING STYLE — DEEP DIVE (you MUST follow this for the entire response): Go substantially deeper than usual—multiple angles, trade-offs, risks, second-order effects, and nuance. Longer, thorough analysis is expected when it adds value.',
}

export function getCoachingStylePrompt(style: CoachingStyleId | undefined): string {
  if (!style || style === 'balanced') return ''
  return STYLE_PROMPTS[style] ?? ''
}

export function isCoachingStyleId(value: string): value is CoachingStyleId {
  return BIZORA_COACHING_STYLES.some((s) => s.id === value)
}
