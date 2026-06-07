export const CHAT_MESSAGES_PER_CYCLE = 5
/** Cooldown after using all 5 messages (also used as inactivity reset window). */
export const CHAT_COOLDOWN_MS = 6 * 60 * 60 * 1000
export const CHAT_INACTIVITY_RESET_MS = CHAT_COOLDOWN_MS
export const MONTHLY_FEATURE_LIMIT = 2
export const MONTHLY_UPLOAD_LIMIT = 2

export type MonthlyUsageBucket =
  | 'systems'
  | 'revenue'
  | 'leadership'
  | 'teams'
  | 'competitor'

export type FreeUsageRecord = {
  period: string
  chat_messages_used: number
  chat_cooldown_until: string | null
  /** ISO timestamp of last Bizora message — resets quota after inactivity. */
  chat_last_activity_at: string | null
  bizora_uploads: number
  systems: number
  revenue: number
  leadership: number
  teams: number
  competitor: number
}

export type UsageQuotaPublic = {
  isPro: boolean
  chat: {
    messagesUsed: number
    messagesLimit: number
    inCooldown: boolean
    cooldownUntil: string | null
    remainingMs: number
  }
  uploads: {
    used: number
    limit: number
    period: string
  }
  monthly: Record<
    MonthlyUsageBucket,
    { used: number; limit: number; period: string }
  >
}

export type QuotaDeniedPayload = {
  error: string
  code: 'QUOTA_EXCEEDED' | 'QUOTA_STORE_UNAVAILABLE'
  usage?: UsageQuotaPublic
  bucket?: string
  storeCode?: string
}
