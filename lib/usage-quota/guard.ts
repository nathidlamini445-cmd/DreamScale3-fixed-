import { NextResponse } from 'next/server'
import {
  canUpload,
  canUseMonthly,
  consumeChatMessage,
  consumeMonthly,
  consumeUpload,
  isChatBlocked,
  loadUserQuotaContext,
  refreshChatCycle,
  saveUsage,
} from './store'
import { quotaStoreUnavailableResponse } from './store-errors'
import { toPublicUsage } from './public'
import type { MonthlyUsageBucket, QuotaDeniedPayload } from './types'

function denied(
  message: string,
  isPro: boolean,
  usage: ReturnType<typeof refreshChatCycle>,
  bucket?: string
): NextResponse {
  const body: QuotaDeniedPayload = {
    error: message,
    code: 'QUOTA_EXCEEDED',
    usage: toPublicUsage(isPro, usage),
    bucket,
  }
  return NextResponse.json(body, { status: 403 })
}

const MONTHLY_LABELS: Record<MonthlyUsageBucket, string> = {
  systems: 'Systems',
  revenue: 'Revenue',
  leadership: 'Leadership',
  teams: 'Teams',
  competitor: 'Competitive Intelligence',
  venture_quest: 'Venture Quest',
}

async function loadOrDeny(userId: string): Promise<
  | { isPro: true }
  | { isPro: false; usage: ReturnType<typeof refreshChatCycle> }
  | { error: NextResponse }
> {
  const ctx = await loadUserQuotaContext(userId)
  if (!ctx.ok) {
    return { error: quotaStoreUnavailableResponse(ctx.code) }
  }
  if (ctx.isPro) return { isPro: true }
  return { isPro: false, usage: refreshChatCycle(ctx.usage) }
}

/** Check only — call before running the model. */
export async function assertChatAllowed(
  userId: string,
  options?: { hasFileAttachments?: boolean }
): Promise<NextResponse | null> {
  const loaded = await loadOrDeny(userId)
  if ('error' in loaded) return loaded.error
  if (loaded.isPro) return null

  const usage = loaded.usage

  if (isChatBlocked(usage)) {
    return denied(
      "You've reached your free message limit.",
      false,
      usage,
      'chat'
    )
  }

  if (options?.hasFileAttachments && !canUpload(usage)) {
    return denied(
      `You've used your 2 free file uploads this month. Upgrade to Pro for unlimited uploads.`,
      false,
      usage,
      'uploads'
    )
  }

  return null
}

/** Record usage after a successful chat response. */
export async function recordChatSuccess(
  userId: string,
  options?: { hasFileAttachments?: boolean }
): Promise<void> {
  const ctx = await loadUserQuotaContext(userId)
  if (!ctx.ok || ctx.isPro) return

  let usage = refreshChatCycle(ctx.usage)
  if (options?.hasFileAttachments) {
    usage = consumeUpload(usage)
  }
  usage = consumeChatMessage(usage)
  const saved = await saveUsage(userId, usage)
  if (!saved) {
    console.error('[usage-quota] chat usage not persisted for', userId)
  }
}

/** @deprecated Use assertChatAllowed + recordChatSuccess */
export async function guardChatMessage(
  userId: string,
  options?: { hasFileAttachments?: boolean }
): Promise<NextResponse | null> {
  const deniedRes = await assertChatAllowed(userId, options)
  if (deniedRes) return deniedRes
  await recordChatSuccess(userId, options)
  return null
}

export async function guardMonthlyFeature(
  userId: string,
  bucket: MonthlyUsageBucket
): Promise<NextResponse | null> {
  const loaded = await loadOrDeny(userId)
  if ('error' in loaded) return loaded.error
  if (loaded.isPro) return null

  const usage = loaded.usage
  if (!canUseMonthly(usage, bucket)) {
    const label = MONTHLY_LABELS[bucket]
    return denied(
      `You've used your 2 free ${label} AI runs this month. Upgrade to Pro for unlimited access.`,
      false,
      usage,
      bucket
    )
  }

  const ctx = await loadUserQuotaContext(userId)
  if (!ctx.ok || ctx.isPro) return null
  const saved = await saveUsage(userId, consumeMonthly(ctx.usage, bucket))
  if (!saved) {
    return quotaStoreUnavailableResponse('SCHEMA_MISSING')
  }
  return null
}

export async function guardFileUpload(userId: string): Promise<NextResponse | null> {
  const loaded = await loadOrDeny(userId)
  if ('error' in loaded) return loaded.error
  if (loaded.isPro) return null

  const usage = loaded.usage
  if (!canUpload(usage)) {
    return denied(
      "You've used your 2 free file uploads this month. Upgrade to Pro for unlimited uploads.",
      false,
      usage,
      'uploads'
    )
  }

  const ctx = await loadUserQuotaContext(userId)
  if (!ctx.ok || ctx.isPro) return null
  const saved = await saveUsage(userId, consumeUpload(ctx.usage))
  if (!saved) {
    return quotaStoreUnavailableResponse('SCHEMA_MISSING')
  }
  return null
}
