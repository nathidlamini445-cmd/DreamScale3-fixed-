import 'server-only'

import {
  addBillingPeriodEnd,
  resolveSubscriptionPeriodEnd,
} from '@/lib/subscription'
import { createAdminClient, hasAdminClient } from '@/lib/supabase/admin'

/** Clerk user ids (production) or legacy Supabase auth UUIDs. */
const CLERK_USER_ID_RE = /^user_[a-zA-Z0-9]+$/
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type PayfastItnPayload = Record<string, string>

function isValidProfileUserId(id: string | undefined): id is string {
  if (!id?.trim()) return false
  const trimmed = id.trim()
  return CLERK_USER_ID_RE.test(trimmed) || UUID_RE.test(trimmed)
}

async function logItnAction(
  admin: ReturnType<typeof createAdminClient>,
  params: {
    pfPaymentId: string
    mPaymentId?: string
    userId: string | null
    paymentStatus: string
    action: string
  }
): Promise<boolean> {
  const { error } = await admin.from('payfast_itn_log').insert({
    pf_payment_id: params.pfPaymentId,
    m_payment_id: params.mPaymentId ?? null,
    user_id: params.userId,
    payment_status: params.paymentStatus,
    action: params.action,
  })

  if (!error) return true
  if (error.code === '23505') return false

  console.error('[PayFast ITN] log insert failed:', error.message)
  return false
}

async function activatePro(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  data: PayfastItnPayload
): Promise<{ ok: boolean; reason?: string }> {
  const activatedAt = new Date().toISOString()
  const periodEnd = addBillingPeriodEnd(new Date()).toISOString()

  const { data: row, error } = await admin
    .from('user_profiles')
    .update({
      subscription_tier: 'pro',
      subscription_status: 'active',
      payfast_token: data.token || null,
      payfast_last_pf_payment_id: data.pf_payment_id || null,
      subscription_activated_at: activatedAt,
      subscription_ends_at: periodEnd,
      subscription_cancelled_at: null,
    })
    .eq('id', userId)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[PayFast ITN] activate failed:', error.message)
    return { ok: false, reason: 'db_update_failed' }
  }

  if (!row) {
    return { ok: false, reason: 'user_profile_not_found' }
  }

  return { ok: true }
}

async function deactivatePro(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  data: PayfastItnPayload
): Promise<{ ok: boolean; reason?: string }> {
  const { data: existing } = await admin
    .from('user_profiles')
    .select('subscription_status, subscription_ends_at, subscription_activated_at')
    .eq('id', userId)
    .maybeSingle()

  const periodEnd = resolveSubscriptionPeriodEnd(existing)
  if (periodEnd && periodEnd.getTime() > Date.now()) {
    const { error } = await admin
      .from('user_profiles')
      .update({
        subscription_tier: 'pro',
        subscription_status: 'cancel_at_period_end',
        payfast_token: null,
        payfast_last_pf_payment_id: data.pf_payment_id || null,
      })
      .eq('id', userId)

    if (error) {
      console.error('[PayFast ITN] cancel-at-period-end failed:', error.message)
      return { ok: false, reason: 'db_update_failed' }
    }

    return { ok: true }
  }

  const { error } = await admin
    .from('user_profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'cancelled',
      payfast_last_pf_payment_id: data.pf_payment_id || null,
      payfast_token: null,
    })
    .eq('id', userId)

  if (error) {
    console.error('[PayFast ITN] deactivate failed:', error.message)
    return { ok: false, reason: 'db_update_failed' }
  }

  return { ok: true }
}

export async function applyPayfastItn(
  data: PayfastItnPayload
): Promise<{ ok: boolean; reason?: string; skipped?: boolean }> {
  if (!hasAdminClient()) {
    return { ok: false, reason: 'missing_service_role_key' }
  }

  const paymentStatus = (data.payment_status || '').toUpperCase()
  const pfPaymentId = data.pf_payment_id
  const userId = data.custom_str1?.trim()

  if (!pfPaymentId) {
    return { ok: false, reason: 'missing_pf_payment_id' }
  }

  if (!isValidProfileUserId(userId)) {
    console.warn('[PayFast ITN] Invalid custom_str1 (expected Clerk user_… id)', {
      custom_str1: data.custom_str1,
      m_payment_id: data.m_payment_id,
    })
    return { ok: true, skipped: true, reason: 'missing_user_id' }
  }

  const admin = createAdminClient()

  if (paymentStatus === 'COMPLETE') {
    const shouldProcess = await logItnAction(admin, {
      pfPaymentId,
      mPaymentId: data.m_payment_id,
      userId,
      paymentStatus,
      action: 'activate_pro',
    })

    if (!shouldProcess) {
      return { ok: true, skipped: true, reason: 'already_processed' }
    }

    return activatePro(admin, userId, data)
  }

  if (paymentStatus === 'CANCELLED' || paymentStatus === 'FAILED') {
    const shouldProcess = await logItnAction(admin, {
      pfPaymentId,
      mPaymentId: data.m_payment_id,
      userId,
      paymentStatus,
      action: 'deactivate_pro',
    })

    if (!shouldProcess) {
      return { ok: true, skipped: true, reason: 'already_processed' }
    }

    return deactivatePro(admin, userId, data)
  }

  console.info('[PayFast ITN] Ignored payment_status:', paymentStatus)
  return { ok: true, skipped: true, reason: 'status_ignored' }
}
