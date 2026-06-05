import { createPayfastApiHeaders } from '@/lib/payfast/api-signature'

export type PayfastCancelResult =
  | { ok: true; skipped?: boolean; reason?: string }
  | { ok: false; reason: string; detail?: string }

export function isPayfastApiTesting(): boolean {
  const v = process.env.PAYFAST_API_TESTING?.trim().toLowerCase()
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return process.env.NODE_ENV === 'development'
}

function payfastApiBaseUrl(): string {
  return (
    process.env.PAYFAST_API_BASE_URL?.trim() ?? 'https://api.payfast.co.za'
  ).replace(/\/$/, '')
}

/**
 * Cancel recurring billing at PayFast using the subscription token from ITN.
 * @see https://developers.payfast.co.za/api#cancel-a-subscription
 */
export async function cancelPayfastSubscription(
  token: string
): Promise<PayfastCancelResult> {
  const trimmed = token?.trim()
  if (!trimmed) {
    return { ok: true, skipped: true, reason: 'no_token' }
  }

  const headers = createPayfastApiHeaders()
  if (!headers) {
    return { ok: false, reason: 'payfast_api_not_configured' }
  }

  const testing = isPayfastApiTesting()
  const url = `${payfastApiBaseUrl()}/subscriptions/${encodeURIComponent(trimmed)}/cancel${
    testing ? '?testing=true' : ''
  }`

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers,
    })

    const text = (await res.text()).trim()

    if (res.ok) {
      return { ok: true }
    }

    // Already cancelled / not found — treat as success so DreamScale can still downgrade
    if (res.status === 404) {
      return { ok: true, reason: 'already_cancelled_at_payfast' }
    }

    console.error('[PayFast cancel]', res.status, text)
    return {
      ok: false,
      reason: 'payfast_cancel_failed',
      detail: text.slice(0, 300),
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'network error'
    console.error('[PayFast cancel] network error', detail)
    return { ok: false, reason: 'payfast_cancel_network_error', detail }
  }
}
