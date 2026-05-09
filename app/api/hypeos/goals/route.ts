import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';

// TODO(persistence): replace this in-memory store with a real Supabase
// table (e.g. `hypeos_goals` keyed on user_id with RLS). Until then, state
// is per-process and reset on cold starts. We at least scope it per-user
// so signed-in callers can't see / mutate each other's goals.
type Goal = {
  id: number
  userId: string
  title: string
  description: string
  category: string
  timeline: string
  targetValue: string
  currentValue: string
  progress: number
  status: string
  createdAt: Date
  phases: any[]
}

const goalsByUser = new Map<string, Goal[]>()
let nextGoalId = 1

function getUserGoals(userId: string): Goal[] {
  if (!goalsByUser.has(userId)) goalsByUser.set(userId, [])
  return goalsByUser.get(userId)!
}

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    return NextResponse.json({ success: true, data: getUserGoals(auth.user.id) })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const body = await request.json()
    const { title, description, category, timeline, targetValue, currentValue } = body
    if (typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    const newGoal: Goal = {
      id: nextGoalId++,
      userId: auth.user.id,
      title,
      description: typeof description === 'string' ? description : '',
      category: typeof category === 'string' ? category : 'general',
      timeline: typeof timeline === 'string' ? timeline : '',
      targetValue: typeof targetValue === 'string' ? targetValue : '',
      currentValue: typeof currentValue === 'string' ? currentValue : '',
      progress: 0,
      status: 'active',
      createdAt: new Date(),
      phases: [],
    }
    getUserGoals(auth.user.id).push(newGoal)
    return NextResponse.json({ success: true, data: newGoal })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create goal' }, { status: 500 })
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
    // Don't let the client overwrite ownership.
    delete (updates as any).userId
    delete (updates as any).id

    const userGoals = getUserGoals(auth.user.id)
    const idx = userGoals.findIndex(g => g.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Goal not found' }, { status: 404 })
    }
    userGoals[idx] = { ...userGoals[idx], ...updates }
    return NextResponse.json({ success: true, data: userGoals[idx] })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update goal' }, { status: 500 })
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

    const userGoals = getUserGoals(auth.user.id)
    const idx = userGoals.findIndex(g => g.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Goal not found' }, { status: 404 })
    }
    userGoals.splice(idx, 1)
    return NextResponse.json({ success: true, message: 'Goal deleted successfully' })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete goal' }, { status: 500 })
  }
}
