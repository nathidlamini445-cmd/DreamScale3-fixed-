import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { addBillingPeriodEnd } from '@/lib/subscription'

/**
 * Local dev only: PayFast ITN cannot reach localhost without ngrok.
 * After a real test payment, use this once to mark Pro active in Supabase.
 */
export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const now = new Date()
    const { error } = await admin
      .from('user_profiles')
      .update({
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_activated_at: now.toISOString(),
        subscription_ends_at: addBillingPeriodEnd(now).toISOString(),
        subscription_cancelled_at: null,
      })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, isPro: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Activation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
