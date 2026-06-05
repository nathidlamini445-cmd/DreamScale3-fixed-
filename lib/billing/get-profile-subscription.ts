import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { isDreamScalePro } from '@/lib/subscription'

export type ProfileSubscription = {
  subscription_tier?: string | null
  subscription_status?: string | null
}

export async function getProfileSubscriptionForUser(
  userId: string
): Promise<{ profile: ProfileSubscription | null; alreadyPro: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url?.trim() || !serviceKey?.trim()) {
    return { profile: null, alreadyPro: false }
  }

  const supabase = createClient(url.trim(), serviceKey.trim())
  const { data } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', userId)
    .maybeSingle()

  return {
    profile: data,
    alreadyPro: isDreamScalePro(data),
  }
}
