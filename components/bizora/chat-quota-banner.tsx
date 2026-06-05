'use client'

import { useEffect } from 'react'
import type { UsageQuotaPublic } from '@/lib/usage-quota/types'
import { ChatLimitReached } from './chat-limit-reached'

type ChatQuotaBannerProps = {
  usage: UsageQuotaPublic | null
  storeError?: string | null
  onCooldownEnd?: () => void
}

/**
 * Rate-limit notice above the Bizora composer (when a conversation is active).
 */
export function ChatQuotaBanner({ usage, storeError, onCooldownEnd }: ChatQuotaBannerProps) {
  const chat = usage?.chat
  const isPro = usage?.isPro === true
  const inCooldown = !isPro && chat?.inCooldown === true

  useEffect(() => {
    if (!chat?.cooldownUntil || isPro) return
    const tick = () => {
      const left = new Date(chat.cooldownUntil!).getTime() - Date.now()
      if (left <= 0) onCooldownEnd?.()
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [chat?.cooldownUntil, isPro, onCooldownEnd])

  if (storeError) {
    return (
      <div
        className="mx-auto mb-3 max-w-4xl w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
        role="alert"
      >
        {storeError}
      </div>
    )
  }

  if (!usage || isPro) return null

  if (inCooldown) {
    return (
      <ChatLimitReached
        cooldownUntil={chat?.cooldownUntil}
        variant="compact"
      />
    )
  }

  const left = Math.max(0, (chat?.messagesLimit ?? 5) - (chat?.messagesUsed ?? 0))
  if (left >= (chat?.messagesLimit ?? 5)) return null

  return (
    <p className="mx-auto mb-2 max-w-4xl w-full text-center text-xs text-[#5c5a52] dark:text-[#9a9890]">
      <span className="font-medium text-[#3d3d39] dark:text-[#d4d2c8]">
        {left} of {chat?.messagesLimit ?? 5}
      </span>{' '}
      free {left === 1 ? 'message' : 'messages'} left this cycle
    </p>
  )
}
