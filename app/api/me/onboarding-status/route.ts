import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth-guard'
import { hintForSupabaseServiceError } from '@/lib/supabase-service-error-hint'

/**
 * Returns onboarding_completed from user_profiles using the service role so
 * RLS cannot hide the row from the browser anon client (Clerk is the auth source).
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
    .from('user_profiles')
    .select('onboarding_completed, user_name')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    const hint = hintForSupabaseServiceError(error.message)
    return NextResponse.json(
      { error: error.message, ...(hint ? { hint } : {}) },
      { status: 500 }
    )
  }

  const preferredNameRaw = data?.user_name
  const preferredName = typeof preferredNameRaw === 'string' ? preferredNameRaw.trim() || null : null

  return NextResponse.json({
    onboardingCompleted: data?.onboarding_completed === true,
    preferredName,
  })
}
