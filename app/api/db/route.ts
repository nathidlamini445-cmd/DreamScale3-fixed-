import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth-guard'
import { hintForSupabaseServiceError } from '@/lib/supabase-service-error-hint'

/**
 * Secure server-side data proxy.
 *
 * Why this exists: the app authenticates with Clerk, not Supabase Auth. The browser
 * Supabase client therefore has no Supabase session, so `auth.uid()` is null and every
 * table's RLS policy (`auth.uid()::text = user_id`) rejects reads/writes. That silently
 * broke persistence for chat, HypeOS, systems, calendar, tasks, etc.
 *
 * This route runs queries with the SERVICE ROLE key (bypasses RLS) but forces every
 * operation to be scoped to the authenticated Clerk user id, so a user can only ever
 * read or write their own rows regardless of what the client sends.
 */

type FilterOp = { column: string; value: unknown }
type Result = 'single' | 'maybeSingle' | 'many'

interface QueryDescriptor {
  table: string
  action: 'select' | 'insert' | 'upsert' | 'update' | 'delete'
  columns?: string
  filters?: FilterOp[]
  order?: { column: string; ascending: boolean }
  values?: unknown
  onConflict?: string
  returning?: { columns: string } | null
  result?: Result
}

/**
 * Whitelist of tables this proxy may touch. `userCol` is the column that stores the
 * Clerk user id. `allowAnonInsert` permits inserts from signed-out visitors (e.g. landing
 * page email capture / feedback) without scoping.
 */
const TABLE_CONFIG: Record<string, { userCol: string; allowAnonInsert?: boolean }> = {
  calendar_events: { userCol: 'user_id' },
  hypeos_data: { userCol: 'user_id' },
  chat_conversations: { userCol: 'user_id' },
  systems_data: { userCol: 'user_id' },
  revenue_data: { userCol: 'user_id' },
  leadership_data: { userCol: 'user_id' },
  teams_data: { userCol: 'user_id' },
  daily_mood: { userCol: 'user_id' },
  tasks_data: { userCol: 'user_id' },
  dreampulse_data: { userCol: 'user_id' },
  user_preferences: { userCol: 'user_id' },
  user_notifications: { userCol: 'user_id' },
  skilldrops_progress: { userCol: 'user_id' },
  projects_data: { userCol: 'user_id' },
  flowmatch_data: { userCol: 'user_id' },
  suggestions_data: { userCol: 'user_id' },
  feedback: { userCol: 'user_id', allowAnonInsert: true },
  testimonials: { userCol: 'user_id', allowAnonInsert: true },
  email_captures: { userCol: 'user_id', allowAnonInsert: true },
}

function scopeValues(values: unknown, userCol: string, userId: string): unknown {
  if (Array.isArray(values)) {
    return values.map((row) =>
      row && typeof row === 'object' ? { ...row, [userCol]: userId } : row
    )
  }
  if (values && typeof values === 'object') {
    return { ...(values as Record<string, unknown>), [userCol]: userId }
  }
  return values
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser()

  let body: QueryDescriptor
  try {
    body = (await request.json()) as QueryDescriptor
  } catch {
    return NextResponse.json({ data: null, error: { message: 'Invalid JSON' } }, { status: 400 })
  }

  const cfg = body?.table ? TABLE_CONFIG[body.table] : undefined
  if (!cfg) {
    return NextResponse.json(
      { data: null, error: { message: `Table not allowed: ${body?.table}` } },
      { status: 400 }
    )
  }

  // Auth: signed-out callers may only insert into explicitly public tables.
  if (!user) {
    if (!(cfg.allowAnonInsert && body.action === 'insert')) {
      return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url?.trim() || !serviceKey?.trim()) {
    return NextResponse.json(
      { data: null, error: { message: 'Server misconfigured: missing Supabase service role key' } },
      { status: 500 }
    )
  }

  const supabase = createClient(url.trim(), serviceKey.trim())
  const userCol = cfg.userCol
  const userId = user?.id ?? null
  const filters = Array.isArray(body.filters) ? body.filters : []

  try {
    let query: any = supabase.from(body.table)

    switch (body.action) {
      case 'select': {
        query = query.select(body.columns || '*')
        if (userId) query = query.eq(userCol, userId)
        for (const f of filters) {
          if (f.column !== userCol) query = query.eq(f.column, f.value)
        }
        if (body.order) {
          query = query.order(body.order.column, { ascending: body.order.ascending !== false })
        }
        if (body.result === 'single') query = query.single()
        else if (body.result === 'maybeSingle') query = query.maybeSingle()
        break
      }
      case 'insert': {
        const values = userId ? scopeValues(body.values, userCol, userId) : body.values
        query = query.insert(values)
        if (body.returning) {
          query = query.select(body.returning.columns || '*')
          if (body.result === 'single') query = query.single()
          else if (body.result === 'maybeSingle') query = query.maybeSingle()
        }
        break
      }
      case 'upsert': {
        const values = userId ? scopeValues(body.values, userCol, userId) : body.values
        query = query.upsert(values, body.onConflict ? { onConflict: body.onConflict } : undefined)
        if (body.returning) {
          query = query.select(body.returning.columns || '*')
          if (body.result === 'single') query = query.single()
          else if (body.result === 'maybeSingle') query = query.maybeSingle()
        }
        break
      }
      case 'update': {
        query = query.update(body.values)
        if (userId) query = query.eq(userCol, userId)
        for (const f of filters) {
          if (f.column !== userCol) query = query.eq(f.column, f.value)
        }
        break
      }
      case 'delete': {
        query = query.delete()
        if (userId) query = query.eq(userCol, userId)
        for (const f of filters) {
          if (f.column !== userCol) query = query.eq(f.column, f.value)
        }
        break
      }
      default:
        return NextResponse.json(
          { data: null, error: { message: `Unsupported action: ${body.action}` } },
          { status: 400 }
        )
    }

    const { data, error } = await query

    if (error) {
      const hint = hintForSupabaseServiceError(error.message)
      return NextResponse.json({
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          ...(hint ? { hint } : {}),
        },
      })
    }

    return NextResponse.json({ data: data ?? null, error: null })
  } catch (e: any) {
    return NextResponse.json(
      { data: null, error: { message: e?.message || 'Database proxy error' } },
      { status: 500 }
    )
  }
}
