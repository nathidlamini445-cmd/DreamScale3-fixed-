import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth-guard'

import { loadUserQuotaContext, refreshChatCycle } from '@/lib/usage-quota/store'

import { quotaStoreUnavailableResponse } from '@/lib/usage-quota/store-errors'

import { toPublicUsage } from '@/lib/usage-quota/public'



export async function GET() {

  const user = await getAuthenticatedUser()

  if (!user) {

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  }



  const ctx = await loadUserQuotaContext(user.id)

  if (!ctx.ok) {

    return quotaStoreUnavailableResponse(ctx.code)

  }



  const usage = refreshChatCycle(ctx.usage)

  return NextResponse.json(toPublicUsage(ctx.isPro, usage))

}

