import {
  type SkillTree,
  canUnlockSkill,
  unlockSkill,
  updateSkillProgress,
  calculateSkillTreeProgress,
} from './skill-tree'
import { expandSkillTree, unlockNextInChain } from './skill-expansion'

export type UserSkillStats = {
  completedTasks: number
  totalPoints: number
  categoryTaskCounts: Record<string, number>
  categoryPoints: Record<string, number>
}

export function cloneSkillTree(tree: SkillTree): SkillTree {
  return JSON.parse(JSON.stringify(tree)) as SkillTree
}

export function getMasteredSkillIds(tree: SkillTree): string[] {
  return tree.branches.flatMap((b) =>
    b.skills.filter((s) => s.mastered).map((s) => s.id)
  )
}

export function buildUserSkillStats(
  tasks: { completed: boolean; category?: string; points?: number }[],
  totalPoints: number
): UserSkillStats {
  const categoryTaskCounts: Record<string, number> = {}
  const categoryPoints: Record<string, number> = {}

  tasks
    .filter((t) => t.completed)
    .forEach((t) => {
      const cat = t.category || 'general'
      categoryTaskCounts[cat] = (categoryTaskCounts[cat] || 0) + 1
      categoryPoints[cat] = (categoryPoints[cat] || 0) + (t.points || 0)
    })

  return {
    completedTasks: tasks.filter((t) => t.completed).length,
    totalPoints,
    categoryTaskCounts,
    categoryPoints,
  }
}

/** Sync unlock state + per-skill progress from task/point stats. */
export function syncSkillTreeWithUserProgress(
  tree: SkillTree,
  stats: UserSkillStats,
  options?: { isPro?: boolean }
): SkillTree {
  const next = cloneSkillTree(tree)
  const masteredSkills = getMasteredSkillIds(next)
  const progress = {
    completedTasks: stats.completedTasks,
    totalPoints: stats.totalPoints,
    masteredSkills,
  }

  next.branches.forEach((branch) => {
    branch.skills.forEach((skill) => {
      if (!skill.unlocked && !skill.mastered) {
        const check = canUnlockSkill(skill, progress)
        const prereqsMet = skill.prerequisites.every((p) =>
          masteredSkills.includes(p)
        )
        if (check.canUnlock || (prereqsMet && skill.prerequisites.length > 0)) {
          const unlocked = unlockSkill(skill)
          Object.assign(skill, unlocked.updatedSkill)
        }
      }

      if (skill.unlocked && !skill.mastered) {
        // Path step progress is only advanced via completeNextPathStep — not daily tasks.
        const updated = updateSkillProgress(
          skill,
          skill.tasksCompleted,
          skill.pointsEarned
        )
        Object.assign(skill, updated.updatedSkill)
      }
    })

    branch.progress =
      branch.skills.length > 0
        ? branch.skills.reduce((sum, s) => sum + s.progress, 0) /
          branch.skills.length
        : 0
  })

  if (options?.isPro !== false) {
    expandSkillTree(next)
  }
  unlockNextInChain(next)

  const pd = calculateSkillTreeProgress(next)
  next.overallProgress = pd.overallProgress
  next.unlockedSkills = pd.unlockedCount
  next.masteredSkills = pd.masteredCount
  next.totalSkills = next.branches.reduce(
    (sum, branch) => sum + branch.skills.length,
    0
  )

  return next
}
