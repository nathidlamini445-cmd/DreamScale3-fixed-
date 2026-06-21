"use client"

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { toast } from 'sonner'

type AddToGoogleCalendarButtonProps = {
  className?: string
  label?: string
  title: string
  description?: string
  start: string
  end?: string
  allDay?: boolean
}

export function AddToGoogleCalendarButton({
  className,
  label,
  title,
  description,
  start,
  end,
  allDay,
}: AddToGoogleCalendarButtonProps) {
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
    if (!connected) {
      window.location.href = `/api/integrations/google/connect?returnTo=${encodeURIComponent(returnTo)}`
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/integrations/google/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, description, start, end, allDay }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.code === 'GOOGLE_NOT_CONNECTED') {
          window.location.href = `/api/integrations/google/connect?returnTo=${encodeURIComponent(returnTo)}`
          return
        }
        throw new Error(data.error || 'Failed to add event')
      }
      toast.success('Added to Google Calendar', {
        action: data.url
          ? { label: 'Open', onClick: () => window.open(data.url, '_blank', 'noopener,noreferrer') }
          : undefined,
      })
      if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast.error('Calendar add failed', {
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
          <span className="mr-2">{label ?? 'Add to Calendar'}</span>
          <ProPlanBadge active className="text-[10px]" />
        </Link>
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={busy} className={className}>
      {busy ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Calendar className="mr-2 h-4 w-4" />
      )}
      {busy ? 'Adding…' : (label ?? (connected ? 'Add to Calendar' : 'Connect & add to Calendar'))}
    </Button>
  )
}

