/**
 * PayFast Pay Now / subscription configuration (server + public site URL).
 * Pay Now buttons use `receiver` + `cmd=_paynow` (not merchant_key in the form).
 */

import { getProMonthlyZarAmount } from '@/lib/billing/pro-price'

/** PayFast minimum for amount + recurring_amount (ZAR). */
const PAYFAST_MIN_ZAR = 5

function formatAmount(value: string | undefined, fallback: string): string {
  const n = parseFloat(value ?? fallback)
  if (!Number.isFinite(n)) return Math.max(PAYFAST_MIN_ZAR, parseFloat(fallback)).toFixed(2)
  return Math.max(PAYFAST_MIN_ZAR, n).toFixed(2)
}

export function getPayfastSiteUrl(): string {
  const override = process.env.PAYFAST_RETURN_BASE_URL?.trim()
  if (override) return override.replace(/\/$/, '')
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (site) return site.replace(/\/$/, '')
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  return 'https://dreamscale.co.za'
}

export function getPayfastProcessUrl(): string {
  return (
    process.env.PAYFAST_PROCESS_URL ?? 'https://payment.payfast.io/eng/process'
  ).trim()
}

export function getPayfastReceiver(): string {
  const receiver =
    process.env.PAYFAST_RECEIVER?.trim() ||
    process.env.PAYFAST_MERCHANT_ID?.trim() ||
    ''
  return receiver
}

export function getPayfastBillingUrls() {
  const base = getPayfastSiteUrl()
  return {
    returnUrl: `${base}/billing/success`,
    cancelUrl: `${base}/billing/cancel`,
    notifyUrl: `${base}/api/payfast/itn`,
  }
}

export function getPayfastSubscriptionFields() {
  return {
    itemName:
      process.env.PAYFAST_ITEM_NAME?.trim() ?? 'DreamScale Pro — Monthly',
    itemDescription:
      process.env.PAYFAST_ITEM_DESCRIPTION?.trim() ??
      'Monthly access to DreamScale AI tools for revenue, competitors, systems, teams, and daily execution.',
    amount: formatAmount(
      process.env.PAYFAST_SUBSCRIPTION_AMOUNT,
      getProMonthlyZarAmount()
    ),
    recurringAmount: formatAmount(
      process.env.PAYFAST_RECURRING_AMOUNT,
      getProMonthlyZarAmount()
    ),
    subscriptionType: '1',
    cycles: process.env.PAYFAST_CYCLES?.trim() ?? '0',
    frequency: process.env.PAYFAST_FREQUENCY?.trim() ?? '3',
  }
}

export function getPayfastItnValidateUrl(): string {
  return (
    process.env.PAYFAST_ITN_VALIDATE_URL ??
    'https://www.payfast.co.za/eng/query/validate'
  ).trim()
}

export function getPayfastPassphrase(): string | undefined {
  const p = process.env.PAYFAST_PASSPHRASE?.trim()
  return p && p !== 'your_passphrase' ? p : undefined
}
