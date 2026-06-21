import { NextResponse } from 'next/server'
import { getPayfastSubscribeFormConfig } from '@/lib/payfast/subscribe-form'
import { getAuthenticatedUser } from '@/lib/auth-guard'
import { createClient } from '@supabase/supabase-js'
import { isDreamScalePro } from '@/lib/subscription'

export async function GET() {
  const config = getPayfastSubscribeFormConfig()
  const user = await getAuthenticatedUser()

  let isPro = false
  if (user) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    if (url && key) {
      const supabase = createClient(url, key)
      const { data } = await supabase
        .from('user_profiles')
        .select('subscription_tier, subscription_status, subscription_ends_at, subscription_activated_at')
        .eq('id', user.id)
        .maybeSingle()
      isPro = isDreamScalePro(data)
    }
  }

  return NextResponse.json({
    isPro,
    config: config
      ? {
          amount: config.amount,
          recurringAmount: config.recurringAmount,
          itemName: config.itemName,
        }
      : null,
    fullConfig: config,
    userId: user?.id ?? null,
  })
}
