/**
 * DreamScale Pro monthly price — USD is the product price; PayFast charges ZAR equivalent.
 */

const DEFAULT_PRO_MONTHLY_USD = 19.99

/** ZAR per 1 USD (approx.). Override with NEXT_PUBLIC_ZAR_PER_USD. */
export function getZarPerUsd(): number {
  const raw = process.env.NEXT_PUBLIC_ZAR_PER_USD?.trim()
  const n = raw ? parseFloat(raw) : NaN
  return Number.isFinite(n) && n > 0 ? n : 18.5
}

export function getProMonthlyUsd(): number {
  const raw = process.env.NEXT_PUBLIC_PRO_MONTHLY_USD?.trim()
  const n = raw ? parseFloat(raw) : NaN
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_PRO_MONTHLY_USD
}

/** ZAR amount sent to PayFast (first + recurring). */
export function getProMonthlyZarAmount(): string {
  const zar = Math.round(getProMonthlyUsd() * getZarPerUsd() * 100) / 100
  return zar.toFixed(2)
}

export function formatProMonthlyUsd(): string {
  const usd = getProMonthlyUsd()
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd)
  return `${formatted}/mo`
}

export function formatProChargeSummary(zarRecurring?: string): string {
  const zar = zarRecurring ?? getProMonthlyZarAmount()
  return `${formatProMonthlyUsd()} · charged as R${zar}/mo via PayFast`
}
