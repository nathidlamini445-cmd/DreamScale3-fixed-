import type { SmartTaskAssignment } from '@/lib/teams-types'
import type { Task as AppTask } from '@/lib/tasks/generate-tasks-from-onboarding'

export type TasksBucket = {
  daily: AppTask[]
  weekly: AppTask[]
  monthly: AppTask[]
  yearly: AppTask[]
}

const EMPTY_TASKS: TasksBucket = {
  daily: [],
  weekly: [],
  monthly: [],
  yearly: [],
}

function mapPriority(priority: string): AppTask['priority'] {
  if (priority === 'urgent' || priority === 'high') return 'high'
  if (priority === 'low') return 'low'
  return 'medium'
}

export function teamsAssignmentToAppTasks(assignment: SmartTaskAssignment): AppTask[] {
  const now = new Date()
  return assignment.tasks.map((task) => {
    const assignee = task.aiAssignment?.assignedMember
    const title = assignee ? `${task.title} (${assignee})` : task.title
    const descriptionParts = [
      task.description,
      assignee ? `Assigned to: ${assignee}` : '',
      task.aiAssignment?.reasoning ? `Why: ${task.aiAssignment.reasoning}` : '',
      `From TeamSync project: ${assignment.projectName}`,
    ].filter(Boolean)

    return {
      id: `teams-${assignment.id}-${task.id}`,
      title,
      description: descriptionParts.join('\n\n'),
      type: 'weekly',
      priority: mapPriority(task.priority),
      category: assignment.projectName || 'Team Project',
      completed: false,
      createdAt: now,
    }
  })
}

function parseStoredTasks(raw: string | null): TasksBucket {
  if (!raw) return { ...EMPTY_TASKS }
  try {
    const parsed = JSON.parse(raw)
    return {
      daily: parsed.daily ?? [],
      weekly: parsed.weekly ?? [],
      monthly: parsed.monthly ?? [],
      yearly: parsed.yearly ?? [],
    }
  } catch {
    return { ...EMPTY_TASKS }
  }
}

export function pushAssignmentToTasks(assignment: SmartTaskAssignment): {
  tasks: TasksBucket
  addedCount: number
} {
  const incoming = teamsAssignmentToAppTasks(assignment)
  const existing =
    typeof window !== 'undefined'
      ? parseStoredTasks(localStorage.getItem('dreamscale_tasks'))
      : { ...EMPTY_TASKS }

  const existingIds = new Set(
    [...existing.daily, ...existing.weekly, ...existing.monthly, ...existing.yearly].map(
      (t) => t.id
    )
  )
  const toAdd = incoming.filter((t) => !existingIds.has(t.id))

  const tasks: TasksBucket = {
    ...existing,
    weekly: [...existing.weekly, ...toAdd],
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('dreamscale_tasks', JSON.stringify(tasks))
    window.dispatchEvent(new CustomEvent('dreamscale:task-interaction'))
  }

  return { tasks, addedCount: toAdd.length }
}
