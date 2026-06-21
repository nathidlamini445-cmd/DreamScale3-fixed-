import {
  type SkillTree,
  calculateSkillTreeProgress,
  updateSkillProgress,
} from './skill-tree'
import { cloneSkillTree } from './sync-skill-tree'
import { expandSkillTree, unlockNextInChain } from './skill-expansion'

export const PATH_STEP_POINTS = 75

export function getSkillUserId(opts: {
  email?: string | null
  authId?: string | null
  name?: string | null
}): string {
  return opts.email || opts.authId || opts.name || 'default-user'
}

export type PathStepResult = {
  tree: SkillTree
  skillId: string
  skillName: string
  stepIndex: number
  stepLabel?: string
  points: number
  mastered: boolean
}

function finalizeTree(tree: SkillTree): SkillTree {
  expandSkillTree(tree)
  unlockNextInChain(tree)
  const pd = calculateSkillTreeProgress(tree)
  tree.overallProgress = pd.overallProgress
  tree.unlockedSkills = pd.unlockedCount
  tree.masteredSkills = pd.masteredCount
  tree.totalSkills = tree.branches.reduce((sum, b) => sum + b.skills.length, 0)
  return tree
}

/** Advance one step on a specific skill (path milestone). */
export function completeNextPathStep(
  tree: SkillTree,
  skillId: string,
  pointsPerStep = PATH_STEP_POINTS
): PathStepResult | null {
  const next = cloneSkillTree(tree)

  for (const branch of next.branches) {
    const skill = branch.skills.find((s) => s.id === skillId)
    if (!skill || !skill.unlocked || skill.mastered) return null

    const stepIndex = skill.tasksCompleted
    const newTasksCompleted = stepIndex + 1
    const newPointsEarned = skill.pointsEarned + pointsPerStep
    const progressUpdate = updateSkillProgress(
      skill,
      newTasksCompleted,
      newPointsEarned
    )

    Object.assign(skill, progressUpdate.updatedSkill)

    branch.progress =
      branch.skills.length > 0
        ? branch.skills.reduce((sum, s) => sum + s.progress, 0) /
          branch.skills.length
        : 0

    finalizeTree(next)

    return {
      tree: next,
      skillId: skill.id,
      skillName: skill.name,
      stepIndex,
      points: pointsPerStep,
      mastered: progressUpdate.isMastered,
    }
  }

  return null
}

/** Advance the active in-progress skill for a category (e.g. after daily focus). */
export function advancePathForCategory(
  tree: SkillTree,
  category: string,
  pointsPerStep = PATH_STEP_POINTS
): PathStepResult | null {
  const normalized = category.toLowerCase()

  // Skill already in progress in this category
  for (const branch of tree.branches) {
    for (const skill of branch.skills) {
      if (
        skill.category.toLowerCase() === normalized &&
        skill.unlocked &&
        !skill.mastered &&
        skill.tasksCompleted > 0
      ) {
        return completeNextPathStep(tree, skill.id, pointsPerStep)
      }
    }
  }

  // First unlocked skill in category
  for (const branch of tree.branches) {
    for (const skill of branch.skills) {
      if (
        skill.category.toLowerCase() === normalized &&
        skill.unlocked &&
        !skill.mastered
      ) {
        return completeNextPathStep(tree, skill.id, pointsPerStep)
      }
    }
  }

  return null
}
