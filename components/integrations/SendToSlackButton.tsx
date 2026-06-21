"use client"

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { toast } from 'sonner'

type SendToSlackButtonProps = {
  message: string
  title?: string
  className?: string
  label?: string
}

export function SendToSlackButton({
  message,
  title,
  className,
  label,
}: SendToSlackButtonProps) {
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
      const res = await fetch('/api/integrations/slack/status', { credentials: 'include' })
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

  const handleSend = async () => {
    if (!connected) {
      window.location.href = `/api/integrations/slack/connect?returnTo=${encodeURIComponent(returnTo)}`
      return
    }
    setBusy(true)
    try {
      const text = title ? `*${title}*\n\n${message}` : message
      const res = await fetch('/api/integrations/slack/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: text, title }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.code === 'SLACK_NOT_CONNECTED') {
          window.location.href = `/api/integrations/slack/connect?returnTo=${encodeURIComponent(returnTo)}`
          return
        }
        throw new Error(data.error || 'Send failed')
      }
      toast.success('Sent to Slack')
    } catch (error) {
      toast.error('Slack send failed', {
        description: error instanceof Error ? error.message : 'Check your channel in Settings.',
      })
    } finally {
      setBusy(false)
    }
  }

  if (subLoading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Slack
      </Button>
    )
  }

  if (!isPro) {
    return (
      <Button variant="outline" size="sm" asChild className={className}>
        <Link href="/billing">
          <span className="mr-2">{label ?? 'Send to Slack'}</span>
          <ProPlanBadge active className="text-[10px]" />
        </Link>
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSend} disabled={busy} className={className}>
      {busy ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="mr-2 h-4 w-4" />
      )}
      {busy ? 'Sending…' : (label ?? (connected ? 'Send to Slack' : 'Connect Slack'))}
    </Button>
  )
}

