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

  const [sessionResult, profileResult] = await Promise.all([
    supabase
      .from('user_sessions')
      .select('session_data')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('user_profiles')
      .select(
        'onboarding_completed, user_name, business_name, industry, business_stage'
      )
      .eq('id', user.id)
      .maybeSingle(),
  ])

  if (sessionResult.error) {
    const hint = hintForSupabaseServiceError(sessionResult.error.message)
    return NextResponse.json(
      { error: sessionResult.error.message, ...(hint ? { hint } : {}) },
      { status: 500 }
    )
  }

  const profileRow = profileResult.error ? null : profileResult.data
  const profileOnboardingDone = profileRow?.onboarding_completed === true

  const rawSession = sessionResult.data?.session_data
  const sessionData =
    rawSession && typeof rawSession === 'object' && !Array.isArray(rawSession)
      ? { ...(rawSession as Record<string, unknown>) }
      : ({} as Record<string, unknown>)

  const existingProfile =
    sessionData.entrepreneurProfile &&
    typeof sessionData.entrepreneurProfile === 'object' &&
    !Array.isArray(sessionData.entrepreneurProfile)
      ? (sessionData.entrepreneurProfile as Record<string, unknown>)
      : {}

  sessionData.entrepreneurProfile = {
    ...existingProfile,
    onboardingCompleted:
      profileOnboardingDone || existingProfile.onboardingCompleted === true,
    name:
      (existingProfile.name as string | null | undefined) ??
      profileRow?.user_name ??
      null,
    businessName:
      (existingProfile.businessName as string | null | undefined) ??
      profileRow?.business_name ??
      null,
    industry:
      (existingProfile.industry as string | string[] | null | undefined) ??
      profileRow?.industry ??
      null,
    businessStage:
      (existingProfile.businessStage as string | string[] | null | undefined) ??
      profileRow?.business_stage ??
      null,
  }

  const hasSessionPayload =
    Object.keys(sessionData).length > 0 ||
    profileOnboardingDone ||
    profileRow != null

  return NextResponse.json({
    sessionData: hasSessionPayload ? sessionData : null,
  })
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
