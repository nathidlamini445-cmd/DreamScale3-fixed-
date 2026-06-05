import {
  CHAT_MESSAGES_PER_CYCLE,
  MONTHLY_FEATURE_LIMIT,
  MONTHLY_UPLOAD_LIMIT,
  type FreeUsageRecord,
  type UsageQuotaPublic,
} from './types'
import { chatCooldownRemainingMs, refreshChatCycle } from './store'

export function toPublicUsage(
  isPro: boolean,
  usage: FreeUsageRecord,
  now = Date.now()
): UsageQuotaPublic {
  const u = refreshChatCycle(usage, now)
  const remainingMs = chatCooldownRemainingMs(u, now)
  const inCooldown = remainingMs > 0
  const period = u.period

  return {
    isPro,
    chat: {
      messagesUsed: inCooldown
        ? CHAT_MESSAGES_PER_CYCLE
        : Math.min(u.chat_messages_used, CHAT_MESSAGES_PER_CYCLE),
      messagesLimit: CHAT_MESSAGES_PER_CYCLE,
      inCooldown,
      cooldownUntil: u.chat_cooldown_until,
      remainingMs,
    },
    uploads: {
      used: u.bizora_uploads,
      limit: MONTHLY_UPLOAD_LIMIT,
      period,
    },
    monthly: {
      systems: { used: u.systems, limit: MONTHLY_FEATURE_LIMIT, period },
      revenue: { used: u.revenue, limit: MONTHLY_FEATURE_LIMIT, period },
      leadership: { used: u.leadership, limit: MONTHLY_FEATURE_LIMIT, period },
      teams: { used: u.teams, limit: MONTHLY_FEATURE_LIMIT, period },
      competitor: {
        used: u.competitor,
        limit: MONTHLY_FEATURE_LIMIT,
        period,
      },
    },
  }
}
