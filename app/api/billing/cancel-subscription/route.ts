import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { createClient } from '@supabase/supabase-js'
import {
  addBillingPeriodEnd,
  formatSubscriptionEndDate,
  isDreamScalePro,
  resolveSubscriptionPeriodEnd,
} from '@/lib/subscription'
import { cancelPayfastSubscription } from '@/lib/payfast/cancel-subscription-api'

const REASON_LABELS: Record<string, string> = {
  too_expensive: 'Too expensive',
  not_using: 'Not using it enough',
  missing_features: 'Missing features',
  technical_issues: 'Technical issues',
  found_alternative: 'Switching to another tool',
  temporary_break: 'Taking a break',
  other: 'Other',
}

type CancelBody = {
  reason?: string
  improve?: string
  additional?: string
}

export async function POST(request: Request) {
  const authResult = await requireAuth()
  if (authResult.error) return authResult.error

  let body: CancelBody = {}
  try {
    body = (await request.json()) as CancelBody
  } catch {
    body = {}
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const supabase = createClient(url, serviceKey)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select(
      'subscription_tier, subscription_status, subscription_ends_at, subscription_activated_at, email, payfast_token'
    )
    .eq('id', authResult.user.id)
    .maybeSingle()

  if (!isDreamScalePro(profile) || profile?.subscription_status !== 'active') {
    return NextResponse.json(
      { error: 'You do not have an active Pro subscription to cancel.' },
      { status: 400 }
    )
  }

  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
  if (!reason) {
    return NextResponse.json(
      { error: 'Please select a reason for canceling.' },
      { status: 400 }
    )
  }

  const improve = typeof body.improve === 'string' ? body.improve.trim() : ''
  const additional =
    typeof body.additional === 'string' ? body.additional.trim() : ''
  const reasonLabel = REASON_LABELS[reason] ?? reason

  const feedbackText = [
    `Cancellation reason: ${reasonLabel}`,
    improve ? `Improve: ${improve}` : null,
    additional ? `Additional: ${additional}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const email = profile?.email ?? authResult.user.email ?? null

  const { error: feedbackError } = await supabase.from('feedback').insert({
    user_id: authResult.user.id,
    email,
    feedback: feedbackText,
    category: 'subscription_cancellation',
    priority: 'medium',
    issues: [reason, ...(improve ? ['has_improve_note'] : [])],
  })

  if (feedbackError) {
    console.error('[cancel-subscription] feedback save failed', feedbackError.message)
  }

  const payfastToken =
    typeof profile?.payfast_token === 'string' ? profile.payfast_token : null
  let payfastBillingStopped = false
  let payfastNote: string | undefined

  if (payfastToken) {
    const payfastResult = await cancelPayfastSubscription(payfastToken)
    if (!payfastResult.ok) {
      const message =
        payfastResult.reason === 'payfast_api_not_configured'
          ? 'Billing could not be stopped automatically. Contact support or cancel in your PayFast account.'
          : 'Could not stop PayFast billing. Try again in a moment or cancel from your PayFast account.'
      return NextResponse.json(
        {
          error: message,
          code: payfastResult.reason,
          detail: payfastResult.detail,
        },
        { status: 502 }
      )
    }
    payfastBillingStopped = !payfastResult.skipped
    if (payfastResult.reason === 'already_cancelled_at_payfast') {
      payfastNote = 'PayFast billing was already stopped.'
    }
  }

  const now = new Date()
  let periodEnd = resolveSubscriptionPeriodEnd(profile)
  if (!periodEnd || periodEnd.getTime() <= now.getTime()) {
    periodEnd = addBillingPeriodEnd(now)
  }

  const periodEndIso = periodEnd.toISOString()
  const periodEndLabel = formatSubscriptionEndDate(periodEndIso)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_tier: 'pro',
      subscription_status: 'cancel_at_period_end',
      subscription_ends_at: periodEndIso,
      subscription_cancelled_at: now.toISOString(),
      payfast_token: null,
    })
    .eq('id', authResult.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let message = periodEndLabel
    ? `Your subscription is cancelled. You keep DreamScale Pro until ${periodEndLabel}, then you move to Free. You will not be charged again.`
    : 'Your subscription is cancelled. You keep DreamScale Pro until the end of your paid period, then you move to Free. You will not be charged again.'

  if (payfastBillingStopped) {
    message = periodEndLabel
      ? `PayFast billing is stopped. You keep DreamScale Pro until ${periodEndLabel}, then you move to Free.`
      : 'PayFast billing is stopped. You keep Pro until the end of your paid period, then you move to Free.'
  } else if (payfastNote) {
    message = `${message} ${payfastNote}`
  }

  return NextResponse.json({
    ok: true,
    message,
    payfastBillingStopped,
    subscription_ends_at: periodEndIso,
  })
}
