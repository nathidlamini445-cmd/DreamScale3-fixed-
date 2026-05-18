import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth-guard'
import { hintForSupabaseServiceError } from '@/lib/supabase-service-error-hint'

/**
 * Load user_sessions.session_data with the service role (same as POST).
 * The browser anon client often cannot read this row due to RLS — without this,
 * SessionProvider never sees onboardingCompleted after save → user sent back to /onboarding.
 */
export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url?.trim() || !serviceKey?.trim()) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const supabase = createClient(url.trim(), serviceKey.trim())
  const { data, error } = await supabase
    .from('user_sessions')
    .select('session_data')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    const hint = hintForSupabaseServiceError(error.message)
    return NextResponse.json(
      { error: error.message, ...(hint ? { hint } : {}) },
      { status: 500 }
    )
  }

  return NextResponse.json({ sessionData: data?.session_data ?? null })
}

/**
 * Persist user_sessions with the service role (Clerk-authenticated request).
 * The browser anon client often cannot write here (RLS + UUID/FK mismatch with Clerk ids).
 */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { userId?: string; sessionData?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.userId != null && body.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (body.sessionData == null || typeof body.sessionData !== 'object') {
    return NextResponse.json({ error: 'sessionData object required' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url?.trim() || !serviceKey?.trim()) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const supabase = createClient(url.trim(), serviceKey.trim())
  const { error } = await supabase.from('user_sessions').upsert(
    {
      user_id: user.id,
      session_data: body.sessionData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    const hint = hintForSupabaseServiceError(error.message)
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(hint ? { hint } : {}),
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true })
}
