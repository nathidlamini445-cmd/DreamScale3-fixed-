import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { isDreamScalePro } from '@/lib/subscription'
import {
  isMissingFreeUsageColumn,
  type QuotaLoadResult,
} from './store-errors'
import {
  CHAT_COOLDOWN_MS,
  CHAT_INACTIVITY_RESET_MS,
  CHAT_MESSAGES_PER_CYCLE,
  MONTHLY_FEATURE_LIMIT,
  MONTHLY_UPLOAD_LIMIT,
  type FreeUsageRecord,
  type MonthlyUsageBucket,
} from './types'

function currentPeriod(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function emptyUsage(): FreeUsageRecord {
  return {
    period: currentPeriod(),
    chat_messages_used: 0,
    chat_cooldown_until: null,
    chat_last_activity_at: null,
    bizora_uploads: 0,
    systems: 0,
    revenue: 0,
    leadership: 0,
    teams: 0,
    competitor: 0,
    venture_quest: 0,
  }
}

export function normalizeUsage(raw: unknown): FreeUsageRecord {
  const base = emptyUsage()
  if (!raw || typeof raw !== 'object') return base
  const o = raw as Record<string, unknown>
  const period = typeof o.period === 'string' ? o.period : base.period
  const out: FreeUsageRecord = {
    period,
    chat_messages_used:
      typeof o.chat_messages_used === 'number' ? o.chat_messages_used : 0,
    chat_cooldown_until:
      typeof o.chat_cooldown_until === 'string' ? o.chat_cooldown_until : null,
    chat_last_activity_at:
      typeof o.chat_last_activity_at === 'string'
        ? o.chat_last_activity_at
        : null,
    bizora_uploads: typeof o.bizora_uploads === 'number' ? o.bizora_uploads : 0,
    systems: typeof o.systems === 'number' ? o.systems : 0,
    revenue: typeof o.revenue === 'number' ? o.revenue : 0,
    leadership: typeof o.leadership === 'number' ? o.leadership : 0,
    teams: typeof o.teams === 'number' ? o.teams : 0,
    competitor: typeof o.competitor === 'number' ? o.competitor : 0,
    venture_quest: typeof o.venture_quest === 'number' ? o.venture_quest : 0,
  }
  if (out.period !== currentPeriod()) {
    out.period = currentPeriod()
    out.bizora_uploads = 0
    out.systems = 0
    out.revenue = 0
    out.leadership = 0
    out.teams = 0
    out.competitor = 0
    out.venture_quest = 0
  }
  return out
}

function resetChatQuota(usage: FreeUsageRecord): FreeUsageRecord {
  return {
    ...usage,
    chat_messages_used: 0,
    chat_cooldown_until: null,
  }
}

/** Reset after 6h inactivity or when cooldown expires. */
export function refreshChatCycle(usage: FreeUsageRecord, now = Date.now()): FreeUsageRecord {
  if (usage.chat_last_activity_at) {
    const last = new Date(usage.chat_last_activity_at).getTime()
    if (
      !Number.isNaN(last) &&
      now - last >= CHAT_INACTIVITY_RESET_MS
    ) {
      return resetChatQuota(usage)
    }
  }

  if (!usage.chat_cooldown_until) return usage
  const until = new Date(usage.chat_cooldown_until).getTime()
  if (until > now) return usage
  return resetChatQuota(usage)
}

async function ensureProfileRow(userId: string): Promise<boolean> {
  const supabase = createServiceRoleClient()
  if (!supabase) return false

  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (data?.id) return true

  const { error } = await supabase.from('user_profiles').upsert(
    { id: userId, onboarding_completed: false },
    { onConflict: 'id' }
  )
  if (error) {
    console.error('[usage-quota] ensure profile failed', error.message)
    return false
  }
  return true
}

export async function loadUserQuotaContext(userId: string): Promise<QuotaLoadResult> {
  const supabase = createServiceRoleClient()
  if (!supabase) {
    return { ok: false, code: 'SERVICE_UNAVAILABLE' }
  }

  const fullSelect =
    'subscription_tier, subscription_status, subscription_ends_at, subscription_activated_at, free_usage'
  let { data, error } = await supabase
    .from('user_profiles')
    .select(fullSelect)
    .eq('id', userId)
    .maybeSingle()

  if (error && isMissingFreeUsageColumn(error.message)) {
    const fallback = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_status, subscription_ends_at, subscription_activated_at')
      .eq('id', userId)
      .maybeSingle()
    data = fallback.data as typeof data
    error = fallback.error
    if (!error) {
      const isPro = isDreamScalePro(data)
      if (isPro) {
        return { ok: true, isPro: true, usage: emptyUsage() }
      }
      return { ok: false, code: 'SCHEMA_MISSING' }
    }
  }

  if (error) {
    console.error('[usage-quota] load failed', error.message)
    return { ok: false, code: 'LOAD_FAILED' }
  }

  if (!data) {
    const created = await ensureProfileRow(userId)
    if (!created) return { ok: false, code: 'LOAD_FAILED' }
    return { ok: true, isPro: false, usage: emptyUsage() }
  }

  const isPro = isDreamScalePro(data)
  let usage = normalizeUsage(
    (data as { free_usage?: unknown }).free_usage
  )
  usage = refreshChatCycle(usage)
  return { ok: true, isPro, usage }
}

export async function saveUsage(
  userId: string,
  usage: FreeUsageRecord
): Promise<boolean> {
  const supabase = createServiceRoleClient()
  if (!supabase) return false

  await ensureProfileRow(userId)

  const { error } = await supabase
    .from('user_profiles')
    .update({ free_usage: usage })
    .eq('id', userId)

  if (error) {
    if (isMissingFreeUsageColumn(error.message)) {
      console.error('[usage-quota] save failed — run supabase-free-usage-migration.sql')
      return false
    }
    console.error('[usage-quota] save failed', error.message)
    return false
  }
  return true
}

export function chatCooldownRemainingMs(
  usage: FreeUsageRecord,
  now = Date.now()
): number {
  if (!usage.chat_cooldown_until) return 0
  const until = new Date(usage.chat_cooldown_until).getTime()
  return Math.max(0, until - now)
}

/** Block the next message once the current cycle is exhausted (5 sends allowed). */
export function isChatBlocked(usage: FreeUsageRecord, now = Date.now()): boolean {
  const u = refreshChatCycle(usage, now)
  if (chatCooldownRemainingMs(u, now) > 0) return true
  return u.chat_messages_used >= CHAT_MESSAGES_PER_CYCLE
}

export function consumeChatMessage(usage: FreeUsageRecord, now = Date.now()): FreeUsageRecord {
  let u = refreshChatCycle(usage, now)
  u = {
    ...u,
    chat_messages_used: u.chat_messages_used + 1,
    chat_last_activity_at: new Date(now).toISOString(),
  }
  if (u.chat_messages_used >= CHAT_MESSAGES_PER_CYCLE) {
    u = {
      ...u,
      chat_cooldown_until: new Date(now + CHAT_COOLDOWN_MS).toISOString(),
    }
  }
  return u
}

export function canUseMonthly(
  usage: FreeUsageRecord,
  bucket: MonthlyUsageBucket
): boolean {
  return usage[bucket] < MONTHLY_FEATURE_LIMIT
}

export function consumeMonthly(
  usage: FreeUsageRecord,
  bucket: MonthlyUsageBucket
): FreeUsageRecord {
  return { ...usage, [bucket]: usage[bucket] + 1 }
}

export function canUpload(usage: FreeUsageRecord): boolean {
  return usage.bizora_uploads < MONTHLY_UPLOAD_LIMIT
}

export function consumeUpload(usage: FreeUsageRecord): FreeUsageRecord {
  return { ...usage, bizora_uploads: usage.bizora_uploads + 1 }
}
