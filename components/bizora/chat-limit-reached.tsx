'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getChatLimitReachedCopy } from '@/lib/usage-quota/format-chat-resume'

type ChatLimitReachedProps = {
  cooldownUntil: string | null | undefined
  variant?: 'empty' | 'compact'
}

export function ChatLimitReached({
  cooldownUntil,
  variant = 'empty',
}: ChatLimitReachedProps) {
  const copy = getChatLimitReachedCopy(cooldownUntil)

  if (variant === 'compact') {
    return (
      <div
        className="mx-auto mb-3 max-w-4xl w-full rounded-2xl border border-[#e8e6dc] bg-[#f4f3ec] px-5 py-4 text-center shadow-sm dark:border-[#3d3a33] dark:bg-[#2a2824]"
        role="status"
        aria-live="polite"
      >
        <p className="text-[15px] font-medium text-[#1a1a18] dark:text-[#f5f4ef]">
          {copy.title}
        </p>
        <p className="mt-1.5 text-sm text-[#5c5a52] dark:text-[#b8b6ad]">
          {copy.resumeLine}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/billing"
            className={cn(
              buttonVariants(),
              'rounded-full bg-[#1a1a18] px-5 text-sm font-medium text-white hover:bg-[#333] dark:bg-[#f5f4ef] dark:text-[#1a1a18] dark:hover:bg-white'
            )}
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center max-w-lg mx-auto px-4" role="status" aria-live="polite">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Clock className="h-8 w-8 text-amber-700 dark:text-amber-300" aria-hidden />
      </div>
      <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
        {copy.title}
      </h3>
      <p className="text-base font-medium text-[#1a1a18] dark:text-[#f0efe8] mb-2">
        {copy.resumeLine}
      </p>
      <p className="text-sm text-black/70 dark:text-gray-400 mb-8">
        You&apos;ve used all 5 free messages for this cycle. Pro members chat without
        limits.
      </p>
      <Link
        href="/billing"
        className={cn(
          buttonVariants(),
          'rounded-full bg-[#1a1a18] px-6 text-sm font-medium text-white hover:bg-[#333] dark:bg-[#f5f4ef] dark:text-[#1a1a18] dark:hover:bg-white'
        )}
      >
        Upgrade to Pro
      </Link>
    </div>
  )
}
