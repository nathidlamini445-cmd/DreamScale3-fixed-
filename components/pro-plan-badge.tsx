'use client'

import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProPlanBadgeProps = {
  className?: string
  /** Active nav row (blue background) — keeps white pill readable */
  inverted?: boolean
  /** Only show for subscribed Pro users */
  active?: boolean
}

/**
 * Official Pro badge: white pill + check. Hidden entirely on free tier.
 */
export function ProPlanBadge({
  className,
  inverted = false,
  active = false,
}: ProPlanBadgeProps) {
  if (!active) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full shrink-0 leading-none',
        'bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700',
        'border border-gray-200/90 shadow-sm',
        inverted && 'border-white/50 shadow-md',
        'dark:bg-white dark:text-gray-800 dark:border-gray-200/80',
        className
      )}
      title="DreamScale Pro plan"
    >
      <BadgeCheck
        className="w-3 h-3 shrink-0 text-[#005DFF]"
        aria-hidden
      />
      <span>Pro plan</span>
    </span>
  )
}
