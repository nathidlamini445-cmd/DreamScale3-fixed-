import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  isDreamScalePro,
  type SubscriptionProfileFields,
} from '@/lib/subscription'

export async function expireSubscriptionIfNeeded(
  supabase: SupabaseClient,
  userId: string,
  profile: SubscriptionProfileFields | null
): Promise<SubscriptionProfileFields | null> {
  if (!profile || isDreamScalePro(profile)) {
    return profile
  }

  if (
    profile.subscription_tier !== 'pro' ||
    profile.subscription_status !== 'cancel_at_period_end'
  ) {
    return profile
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'cancelled',
    })
    .eq('id', userId)

  if (error) {
    console.error('[subscription] expire failed:', error.message)
    return profile
  }

  return {
    ...profile,
    subscription_tier: 'free',
    subscription_status: 'cancelled',
  }
}
