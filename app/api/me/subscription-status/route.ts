import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth-guard'
import { expireSubscriptionIfNeeded } from '@/lib/billing/expire-subscription'
import { isDreamScalePro } from '@/lib/subscription'
import { hintForSupabaseServiceError } from '@/lib/supabase-service-error-hint'

/**
 * Returns subscription fields from user_profiles (service role + Clerk session).
 * Does not touch Clerk — read-only profile check for billing UI.
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
    .select(
      'subscription_tier, subscription_status, subscription_ends_at, subscription_activated_at'
    )
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    const hint = hintForSupabaseServiceError(error.message)
    return NextResponse.json(
      { error: error.message, ...(hint ? { hint } : {}) },
      { status: 500 }
    )
  }

  const profile = await expireSubscriptionIfNeeded(supabase, user.id, data)

  return NextResponse.json({
    isPro: isDreamScalePro(profile),
    subscription_tier: profile?.subscription_tier ?? 'free',
    subscription_status: profile?.subscription_status ?? 'inactive',
    subscription_ends_at: profile?.subscription_ends_at ?? null,
  })
}
