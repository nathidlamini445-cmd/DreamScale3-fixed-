import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';

// TODO(persistence): replace this in-memory store with a real Supabase
// table (e.g. `hypeos_tasks`/`hypeos_mini_wins` keyed on user_id with RLS).
// Until then, state is per-process and reset on cold starts. Per-user
// partitioning here stops signed-in callers from seeing each other's data.
type Task = {
  id: number
  userId: string
  goalId: number
  title: string
  description: string
  impact: string
  category: string
  points: number
  completed: boolean
  dueDate: Date
  createdAt: Date
  completedAt: Date | null
  howToComplete?: any[]
}
type MiniWin = {
  id: number
  userId: string
  title: string
  description: string
  points: number
  time: string
  category: string
  difficulty: string
  completed: boolean
  createdAt: Date
}

const tasksByUser = new Map<string, Task[]>()
const miniWinsByUser = new Map<string, MiniWin[]>()
let nextTaskId = 1
let nextMiniWinId = 1

const getUserTasks = (userId: string) => {
  if (!tasksByUser.has(userId)) tasksByUser.set(userId, [])
  return tasksByUser.get(userId)!
}
const getUserMiniWins = (userId: string) => {
  if (!miniWinsByUser.has(userId)) miniWinsByUser.set(userId, [])
  return miniWinsByUser.get(userId)!
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goalId')
    const type = searchParams.get('type') || 'all'

    let tasks = getUserTasks(auth.user.id)
    const miniWins = getUserMiniWins(auth.user.id)

    if (goalId) {
      const gid = parseInt(goalId)
      tasks = tasks.filter(task => task.goalId === gid)
    }

    const response: any = { success: true }
    if (type === 'tasks' || type === 'all') response.tasks = tasks
    if (type === 'mini-wins' || type === 'all') response.miniWins = miniWins
    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const body = await request.json()
    const { goalId, title, description, impact, category, points, type = 'task', howToComplete } = body
    if (typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    if (type === 'mini-win') {
      const newMiniWin: MiniWin = {
        id: nextMiniWinId++,
        userId: auth.user.id,
        title,
        description: typeof description === 'string' ? description : '',
        points: typeof points === 'number' ? points : 25,
        time: '2 min',
        category: typeof category === 'string' ? category : 'admin',
        difficulty: 'easy',
        completed: false,
        createdAt: new Date(),
      }
      getUserMiniWins(auth.user.id).push(newMiniWin)
      return NextResponse.json({ success: true, data: newMiniWin })
    }

    const newTask: Task = {
      id: nextTaskId++,
      userId: auth.user.id,
      goalId: typeof goalId === 'number' ? goalId : 0,
      title,
      description: typeof description === 'string' ? description : '',
      impact: typeof impact === 'string' ? impact : 'medium',
      category: typeof category === 'string' ? category : 'admin',
      points: typeof points === 'number' ? points : 100,
      completed: false,
      dueDate: new Date(),
      createdAt: new Date(),
      completedAt: null,
      howToComplete: Array.isArray(howToComplete) ? howToComplete : [],
    }
    getUserTasks(auth.user.id).push(newTask)
    return NextResponse.json({ success: true, data: newTask })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const body = await request.json()
    const { id, ...updates } = body
    if (typeof id !== 'number') {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    }
    delete (updates as any).userId
    delete (updates as any).id

    const tasks = getUserTasks(auth.user.id)
    const miniWins = getUserMiniWins(auth.user.id)
    const taskIndex = tasks.findIndex(t => t.id === id)
    const miniWinIndex = miniWins.findIndex(w => w.id === id)

    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates }
      if (updates.completed && !tasks[taskIndex].completedAt) {
        tasks[taskIndex].completedAt = new Date()
      }
      return NextResponse.json({ success: true, data: tasks[taskIndex] })
    }
    if (miniWinIndex !== -1) {
      miniWins[miniWinIndex] = { ...miniWins[miniWinIndex], ...updates }
      return NextResponse.json({ success: true, data: miniWins[miniWinIndex] })
    }
    return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    }

    const tasks = getUserTasks(auth.user.id)
    const miniWins = getUserMiniWins(auth.user.id)
    const taskIndex = tasks.findIndex(t => t.id === id)
    const miniWinIndex = miniWins.findIndex(w => w.id === id)

    if (taskIndex !== -1) tasks.splice(taskIndex, 1)
    else if (miniWinIndex !== -1) miniWins.splice(miniWinIndex, 1)
    else return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })

    return NextResponse.json({ success: true, message: 'Task deleted successfully' })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 })
  }
}
