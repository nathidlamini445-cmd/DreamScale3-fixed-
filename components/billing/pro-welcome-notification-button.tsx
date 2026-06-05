'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import {
  WelcomeProModal,
  shouldShowProWelcome,
} from '@/components/billing/welcome-pro-modal'

type Props = {
  className?: string
}

/**
 * Bell next to Settings — red dot when Pro welcome is unread; click opens welcome modal.
 */
export function ProWelcomeNotificationButton({ className }: Props) {
  const { isPro, loading } = useSubscriptionStatus()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const showDot =
    !loading && isPro && !dismissed && shouldShowProWelcome()

  if (!isPro && !loading) return null

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={
          showDot
            ? 'New notification: Welcome to DreamScale Pro'
            : 'Notifications'
        }
        className={cn(
          'relative w-10 h-10 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800',
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Bell className="w-5 h-5" />
        {showDot && (
          <span
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-pulse"
            aria-hidden
          />
        )}
      </Button>

      <WelcomeProModal
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setDismissed(true)
        }}
      />
    </>
  )
}
