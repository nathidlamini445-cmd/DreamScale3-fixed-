/**

 * Daily quest progress — per goal, per day (path steps, tasks, XP earned TODAY).

 */



import {

  type Quest,

  type QuestProgress,

  type QuestReward,

  updateQuestProgress,

  checkQuestCompletions,

  saveQuestProgressForGoal,

} from './quest-system'

import { PATH_STEP_POINTS } from './path-progress'



export type DailyQuestActivity = {

  pathSteps: number

  tasksCompleted: number

  xpEarned: number

  highImpactTasks: number

  consecutiveCompletions: number

  date: string

}



function todayKey(): string {

  return new Date().toDateString()

}



function activityStorageKey(goalId: string): string {

  const id = goalId.trim() || 'default'

  return `hypeos:daily-quest-activity:${id}:${todayKey()}`

}



export function loadDailyQuestActivity(goalId: string): DailyQuestActivity {

  const empty: DailyQuestActivity = {

    pathSteps: 0,

    tasksCompleted: 0,

    xpEarned: 0,

    highImpactTasks: 0,

    consecutiveCompletions: 0,

    date: todayKey(),

  }

  if (typeof window === 'undefined') return empty

  try {

    const raw = localStorage.getItem(activityStorageKey(goalId))

    if (!raw) return empty

    const parsed = JSON.parse(raw) as DailyQuestActivity

    if (parsed.date !== todayKey()) return empty

    return { ...empty, ...parsed, date: todayKey() }

  } catch {

    return empty

  }

}



function saveDailyQuestActivity(

  goalId: string,

  activity: DailyQuestActivity

): void {

  if (typeof window === 'undefined') return

  localStorage.setItem(

    activityStorageKey(goalId),

    JSON.stringify({ ...activity, date: todayKey() })

  )

}



export function activityToQuestProgress(

  activity: DailyQuestActivity

): QuestProgress {

  return {

    tasksCompleted: activity.tasksCompleted,

    xpEarned: activity.xpEarned,

    streakCount: activity.consecutiveCompletions,

    highImpactTasks: activity.highImpactTasks,

    lastResetDate: todayKey(),

  }

}



export function recordPathStepComplete(

  goalId: string,

  xp: number,

  options?: { highImpact?: boolean }

): DailyQuestActivity {

  const activity = loadDailyQuestActivity(goalId)

  activity.pathSteps += 1

  activity.tasksCompleted += 1

  activity.xpEarned += xp

  if (options?.highImpact) activity.highImpactTasks += 1

  activity.consecutiveCompletions += 1

  saveDailyQuestActivity(goalId, activity)

  return activity

}



export function recordTaskListComplete(

  goalId: string,

  xp: number,

  impact: 'high' | 'medium' | 'low' = 'medium'

): DailyQuestActivity {

  const activity = loadDailyQuestActivity(goalId)

  activity.tasksCompleted += 1

  activity.xpEarned += xp

  if (impact === 'high') activity.highImpactTasks += 1

  activity.consecutiveCompletions += 1

  saveDailyQuestActivity(goalId, activity)

  return activity

}



/** Seed from free-tier path step counter when activity was never recorded (current goal only). */

export function seedDailyActivityFromPathStepCount(

  goalId: string,

  stepCount: number,

  xpPerStep = PATH_STEP_POINTS

): DailyQuestActivity {

  const activity = loadDailyQuestActivity(goalId)

  if (activity.pathSteps > 0 || stepCount <= 0) return activity



  activity.pathSteps = stepCount

  activity.tasksCompleted = Math.max(activity.tasksCompleted, stepCount)

  activity.xpEarned = Math.max(activity.xpEarned, stepCount * xpPerStep)

  saveDailyQuestActivity(goalId, activity)

  return activity

}



/** Backfill activity from this goal's saved quest progress only. */

export function seedDailyActivityFromSavedQuests(

  goalId: string,

  quests: Quest[]

): DailyQuestActivity {

  const activity = loadDailyQuestActivity(goalId)

  if (

    activity.tasksCompleted > 0 ||

    activity.pathSteps > 0 ||

    activity.xpEarned > 0

  ) {

    return activity

  }



  const hasProgress = quests.some((q) => q.current > 0)

  if (!hasProgress) return activity



  for (const q of quests) {

    switch (q.type) {

      case 'tasks':

        activity.tasksCompleted = Math.max(activity.tasksCompleted, q.current)

        break

      case 'xp':

        activity.xpEarned = Math.max(activity.xpEarned, q.current)

        break

      case 'performance':

        activity.highImpactTasks = Math.max(activity.highImpactTasks, q.current)

        break

      case 'streak':

        activity.consecutiveCompletions = Math.max(

          activity.consecutiveCompletions,

          q.current

        )

        break

    }

  }

  saveDailyQuestActivity(goalId, activity)

  return activity

}



/** Seed when activity is empty but this goal's tasks were completed today. */

export function seedDailyActivityFromTasks(

  goalId: string,

  tasks: {

    completed: boolean

    points?: number

    impact?: string

    completionDate?: string

  }[]

): DailyQuestActivity {

  const activity = loadDailyQuestActivity(goalId)

  if (activity.tasksCompleted > 0 || activity.pathSteps > 0) return activity



  const today = todayKey()

  const completedToday = tasks.filter((t) => {

    if (!t.completed) return false

    if (!t.completionDate) return true

    try {

      return new Date(t.completionDate).toDateString() === today

    } catch {

      return true

    }

  })



  if (completedToday.length === 0) return activity



  activity.tasksCompleted = completedToday.length

  activity.xpEarned = completedToday.reduce((sum, t) => sum + (t.points || 0), 0)

  activity.highImpactTasks = completedToday.filter(

    (t) => t.impact === 'high'

  ).length

  activity.consecutiveCompletions = completedToday.length

  saveDailyQuestActivity(goalId, activity)

  return activity

}



export function syncQuestsWithDailyActivity(

  quests: Quest[],

  goalId: string

): {

  updatedQuests: Quest[]

  rewards: QuestReward[]

  activity: DailyQuestActivity

} {

  const activity = loadDailyQuestActivity(goalId)

  const progress = activityToQuestProgress(activity)

  const updatedQuests = updateQuestProgress(quests, progress)

  const rewards = checkQuestCompletions(quests, updatedQuests)

  saveQuestProgressForGoal(goalId, updatedQuests)

  return { updatedQuests, rewards, activity }

}



export function applyQuestRewards(

  user: { hypePoints: number },

  rewards: QuestReward[]

): { hypePoints: number; totalBonus: number } {

  const totalBonus = rewards.reduce((sum, r) => sum + r.points, 0)

  return {

    hypePoints: user.hypePoints + totalBonus,

    totalBonus,

  }

}


