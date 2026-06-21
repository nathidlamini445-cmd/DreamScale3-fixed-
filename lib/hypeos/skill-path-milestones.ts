import type { Skill } from '@/lib/hypeos/skill-tree'
import { getSkillTaskLabels } from '@/lib/hypeos/skill-expansion'
import {
  buildPersonalizedPathSteps,
  type PathUserContext,
} from '@/lib/hypeos/personalized-path-tasks'

export type { PathUserContext }

export type PathTaskInput = {
  title: string
  completed: boolean
  category?: string
}

export type PathMilestone = {
  id: string
  skillId: string
  index: number
  label: string
  description?: string
  steps?: string[]
  points?: number
  estimatedTime?: string
  completed: boolean
  locked: boolean
  isNext: boolean
}

export type PathSkillNode = {
  kind: 'skill'
  skill: Skill
  globalIndex: number
}

export type PathTaskNode = {
  kind: 'task'
  milestone: PathMilestone
  skill: Skill
  globalIndex: number
}

export type PathItem = PathSkillNode | PathTaskNode

const TASK_STEP_LABELS: Record<string, string[]> = {
  sales: [
    'Draft your outreach email',
    'Send 5 cold emails',
    'Follow up with prospects',
    'Log responses in CRM',
    'Refine your pitch script',
    'Run 10 practice calls',
    'Book 3 discovery calls',
    'Handle objections live',
    'Send proposals',
    'Close your first deal',
  ],
  content: [
    'Pick your content pillar',
    'Write 3 post drafts',
    'Publish your first post',
    'Engage with 10 accounts',
    'Plan a content calendar',
    'Record a short video',
    'Edit and publish video',
    'Review analytics',
    'Repurpose top post',
    'Batch next week content',
  ],
  marketing: [
    'Define your audience',
    'Set up tracking',
    'Launch a small campaign',
    'Review campaign metrics',
    'A/B test one variable',
    'Optimize landing copy',
    'Grow email list',
    'Run retargeting',
    'Document what worked',
    'Scale winning channel',
  ],
  networking: [
    'Update your profile',
    'Send 5 connection requests',
    'Write a value-first DM',
    'Schedule a coffee chat',
    'Prepare intro pitch',
    'Attend one event',
    'Follow up within 24h',
    'Share a resource',
    'Ask for a referral',
    'Nurture 3 relationships',
  ],
}

function milestoneCountForSkill(skill: Skill): number {
  // Make the path dense (Duolingo-like) without changing mastery rules.
  // Generated higher-level skills get more steps.
  if (skill.id.includes('-gen-')) {
    if (skill.difficulty === 'expert') return Math.max(skill.requiredTasks, 24)
    if (skill.difficulty === 'advanced') return Math.max(skill.requiredTasks, 18)
    return Math.max(skill.requiredTasks, 14)
  }
  return Math.max(skill.requiredTasks, 12)
}

function labelsForSkill(skill: Skill, count: number): string[] {
  const generated = getSkillTaskLabels(skill)
  if (generated.length) {
    return Array.from({ length: count }, (_, i) => generated[i] ?? `${skill.name} · step ${i + 1}`)
  }
  const pool = TASK_STEP_LABELS[skill.category] ?? TASK_STEP_LABELS.sales
  const fromReal: string[] = []
  return Array.from({ length: count }, (_, i) => fromReal[i] ?? pool[i] ?? `${skill.name} · step ${i + 1}`)
}

export function buildMilestonesForSkill(
  skill: Skill,
  tasks: PathTaskInput[],
  userContext?: PathUserContext | null
): PathMilestone[] {
  const totalMilestones = milestoneCountForSkill(skill)

  const personalized =
    userContext?.goalTitle?.trim()
      ? buildPersonalizedPathSteps(skill, userContext, totalMilestones)
      : null

  const fallbacks = labelsForSkill(skill, totalMilestones)

  return Array.from({ length: totalMilestones }, (_, index) => {
    const personal = personalized?.[index]
    const label = personal?.label ?? fallbacks[index]
    // Only path-step progress counts — not daily-focus task completion.
    const completed = skill.mastered || index < skill.tasksCompleted
    const locked =
      !skill.unlocked ||
      (!skill.mastered && index > skill.tasksCompleted + 1)

    return {
      id: `${skill.id}-task-${index}`,
      skillId: skill.id,
      index,
      label,
      description: personal?.description,
      steps: personal?.steps,
      points: personal?.points,
      estimatedTime: personal?.estimatedTime,
      completed,
      locked,
      isNext: false,
    }
  })
}

export function buildPathItems(
  skills: Skill[],
  tasks: PathTaskInput[],
  userContext?: PathUserContext | null
): PathItem[] {
  const items: PathItem[] = []
  let globalIndex = 0

  for (const skill of skills) {
    items.push({ kind: 'skill', skill, globalIndex })
    globalIndex++

    const milestones = buildMilestonesForSkill(skill, tasks, userContext)
    for (const milestone of milestones) {
      items.push({ kind: 'task', milestone, skill, globalIndex })
      globalIndex++
    }
  }

  let foundNext = false
  for (const item of items) {
    if (item.kind !== 'task') continue
    if (item.milestone.completed || item.milestone.locked) continue
    item.milestone.isNext = true
    foundNext = true
    break
  }

  return items
}

export function getNextPathItem(items: PathItem[]): PathItem | null {
  for (const item of items) {
    if (item.kind === 'task' && item.milestone.isNext) return item
  }
  for (const item of items) {
    if (item.kind === 'skill' && item.skill.unlocked && !item.skill.mastered) {
      return item
    }
  }
  return null
}
