'use client'

import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { ArrowUp, Loader2 } from 'lucide-react'

export function UpgradeDropdown() {
  const { isPro, loading } = useSubscriptionStatus()

  if (loading) {
    return (
      <Button
        disabled
        className="bg-[#39d2c0]/60 text-white shadow-lg min-w-[120px]"
        aria-label="Checking subscription"
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        …
      </Button>
    )
  }

  if (isPro) {
    return (
      <Link
        href="/billing#cancel-pro"
        title="Manage or cancel DreamScale Pro"
        className={cn(
          buttonVariants(),
          'min-w-[140px] inline-flex items-center justify-center gap-2 border-2 border-gray-300 bg-white text-[#005DFF] shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 dark:bg-slate-800 dark:border-slate-600 dark:text-blue-400 dark:hover:bg-slate-700 dark:hover:border-slate-500 [&_span]:!text-inherit'
        )}
      >
        <ProPlanBadge active />
        <span className="font-semibold text-[#005DFF] dark:text-blue-400">Subscribed</span>
      </Link>
    )
  }

  return (
    <Link
      href="/billing"
      className={cn(
        buttonVariants(),
        'inline-flex items-center justify-center gap-2 bg-[#39d2c0] hover:bg-[#2bb3a3] text-white shadow-lg hover:shadow-xl transition-all duration-300'
      )}
    >
      <ArrowUp className="w-4 h-4" />
      Upgrade
    </Link>
  )
}
