/** Shared subscription helpers (safe for client + server). */

export const BILLING_PERIOD_DAYS = 30

export type SubscriptionProfileFields = {
  subscription_tier?: string | null
  subscription_status?: string | null
  subscription_ends_at?: string | null
  subscription_activated_at?: string | null
}

export function addBillingPeriodEnd(from: Date = new Date()): Date {
  const end = new Date(from)
  end.setUTCDate(end.getUTCDate() + BILLING_PERIOD_DAYS)
  return end
}

export function resolveSubscriptionPeriodEnd(
  profile: SubscriptionProfileFields | null | undefined
): Date | null {
  if (!profile) return null

  if (profile.subscription_ends_at) {
    const explicit = new Date(profile.subscription_ends_at)
    if (!Number.isNaN(explicit.getTime())) return explicit
  }

  if (profile.subscription_activated_at) {
    const activated = new Date(profile.subscription_activated_at)
    if (!Number.isNaN(activated.getTime())) return addBillingPeriodEnd(activated)
  }

  return null
}

export function isDreamScalePro(
  profile: SubscriptionProfileFields | null | undefined
): boolean {
  if (profile?.subscription_tier !== 'pro') return false

  const status = profile.subscription_status
  if (status === 'active') return true

  if (status === 'cancel_at_period_end') {
    const periodEnd = resolveSubscriptionPeriodEnd(profile)
    if (!periodEnd) return true
    return periodEnd.getTime() > Date.now()
  }

  return false
}

export function formatSubscriptionEndDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function daysRemainingInPeriod(
  profile: SubscriptionProfileFields | null | undefined
): number | null {
  const end = resolveSubscriptionPeriodEnd(profile)
  if (!end) return null
  const ms = end.getTime() - Date.now()
  if (ms <= 0) return 0
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}
