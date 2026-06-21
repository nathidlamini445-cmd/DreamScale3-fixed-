'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { routineToCalendarEvents } from '@/lib/leadership/routine-calendar'
import type { CEORoutine } from '@/lib/leadership-types'
import { toast } from 'sonner'

type AddRoutineToGoogleCalendarButtonProps = {
  routine: CEORoutine
  className?: string
  label?: string
}

export function AddRoutineToGoogleCalendarButton({
  routine,
  className,
  label,
}: AddRoutineToGoogleCalendarButtonProps) {
  const pathname = usePathname()
  const { isPro, loading: subLoading } = useSubscriptionStatus()
  const [connected, setConnected] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  const returnTo =
    typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : pathname

  const loadStatus = useCallback(async () => {
    if (!isPro) return
    try {
      const res = await fetch('/api/integrations/google/status', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setConnected(!!data.connected)
      }
    } catch {
      setConnected(null)
    }
  }, [isPro])

  useEffect(() => {
    if (!subLoading && isPro) void loadStatus()
  }, [subLoading, isPro, loadStatus])

  const handleClick = async () => {
    const events = routineToCalendarEvents(routine)
    if (!events.length) {
      toast.error('No time blocks to add')
      return
    }

    if (!connected) {
      window.location.href = `/api/integrations/google/connect?returnTo=${encodeURIComponent(returnTo)}`
      return
    }

    setBusy(true)
    let created = 0
    let lastUrl: string | undefined

    try {
      for (const event of events) {
        const res = await fetch('/api/integrations/google/create-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(event),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (data.code === 'GOOGLE_NOT_CONNECTED') {
            window.location.href = `/api/integrations/google/connect?returnTo=${encodeURIComponent(returnTo)}`
            return
          }
          throw new Error(data.error || 'Failed to add calendar events')
        }
        created += 1
        if (data.url) lastUrl = data.url
      }

      toast.success(`Added ${created} block${created === 1 ? '' : 's'} to Google Calendar`, {
        action: lastUrl
          ? { label: 'Open', onClick: () => window.open(lastUrl, '_blank', 'noopener,noreferrer') }
          : undefined,
      })
      if (lastUrl) window.open(lastUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast.error('Calendar export failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setBusy(false)
    }
  }

  if (subLoading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Calendar
      </Button>
    )
  }

  if (!isPro) {
    return (
      <Button variant="outline" size="sm" asChild className={className}>
        <Link href="/billing">
          <span className="mr-2">{label ?? 'Add routine to Calendar'}</span>
          <ProPlanBadge active className="text-[10px]" />
        </Link>
      </Button>
    )
  }

  const blockCount = routine.template.timeBlocks.length

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={busy || !blockCount} className={className}>
      {busy ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Calendar className="mr-2 h-4 w-4" />
      )}
      {busy
        ? 'Adding…'
        : (label ?? (connected ? `Add ${blockCount} blocks to Calendar` : 'Connect & add to Calendar'))}
    </Button>
  )
}
