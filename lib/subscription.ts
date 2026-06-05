/** Shared subscription helpers (safe for client + server). */

export type SubscriptionProfileFields = {
  subscription_tier?: string | null
  subscription_status?: string | null
}

export function isDreamScalePro(
  profile: SubscriptionProfileFields | null | undefined
): boolean {
  return (
    profile?.subscription_tier === 'pro' &&
    profile?.subscription_status === 'active'
  )
}
