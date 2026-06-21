import type { Skill } from './skill-tree'
import { getHowToCompleteInstructions } from './task-instructions'
import {
  detectGoalPathProfile,
  getCurriculumPool,
  pickStepsForSkill,
  getGoalPathProfileLabel,
  type PathUserContext,
} from './goal-path-curricula'

export type { PathUserContext }
export { detectGoalPathProfile, getGoalPathProfileLabel }

export type PersonalizedPathStep = {
  label: string
  description: string
  estimatedTime: string
  points: number
  steps: string[]
}

function fill(
  text: string,
  ctx: PathUserContext,
  skill: Skill
): string {
  const goal = ctx.goalTitle?.trim() || 'your goal'
  const target = ctx.goalTarget?.trim() || 'your target'
  const niche = ctx.category?.trim() || 'your niche'
  return text
    .replace(/\{goal\}/g, goal)
    .replace(/\{target\}/g, target)
    .replace(/\{niche\}/g, niche)
    .replace(/\{skill\}/g, skill.name)
}

const DEFAULT_STEPS = [
  'Break the task into 3 small actions you can finish today.',
  'Set a 25-minute focus timer and start with the hardest part.',
  'Write down blockers and ask Bizora AI if you get stuck.',
  'Mark complete when you have a tangible result to show.',
]

export function buildPersonalizedPathSteps(
  skill: Skill,
  ctx: PathUserContext,
  count: number
): PersonalizedPathStep[] {
  const profile = detectGoalPathProfile(ctx)
  const pool = getCurriculumPool(profile, skill.category)
  const templates = pickStepsForSkill(pool, count, ctx, skill.id)

  return templates.map((template) => {
    const label = fill(template.label, ctx, skill)
    const description = fill(template.description, ctx, skill)
    const howTo =
      getHowToCompleteInstructions(label, skill.category)?.slice(0, 5) ??
      DEFAULT_STEPS

    return {
      label,
      description,
      estimatedTime: template.estimatedTime,
      points: template.points,
      steps: howTo.map((s) => fill(s, ctx, skill)),
    }
  })
}
