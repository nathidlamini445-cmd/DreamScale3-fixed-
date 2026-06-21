"use client"

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Database, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { toast } from 'sonner'

type ExportToAirtableButtonProps = {
  rows: string[][]
  className?: string
  label?: string
}

export function ExportToAirtableButton({ rows, className, label }: ExportToAirtableButtonProps) {
  const pathname = usePathname()
  const { isPro, loading: subLoading } = useSubscriptionStatus()
  const [connected, setConnected] = useState(false)
  const [hasTarget, setHasTarget] = useState(false)
  const [busy, setBusy] = useState(false)

  const returnTo =
    typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : pathname

  const loadStatus = useCallback(async () => {
    if (!isPro) return
    try {
      const res = await fetch('/api/integrations/airtable/status', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setConnected(!!data.connected)
        setHasTarget(!!(data.baseId && data.tableName))
      }
    } catch {
      setConnected(false)
    }
  }, [isPro])

  useEffect(() => {
    if (!subLoading && isPro) void loadStatus()
  }, [subLoading, isPro, loadStatus])

  const handleExport = async () => {
    if (!connected) {
      window.location.href = `/api/integrations/airtable/connect?returnTo=${encodeURIComponent(returnTo)}`
      return
    }
    if (!hasTarget) {
      toast.error('Set Airtable base & table in Settings → Integrations')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/integrations/airtable/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rows }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.code === 'AIRTABLE_NOT_CONNECTED') {
          window.location.href = `/api/integrations/airtable/connect?returnTo=${encodeURIComponent(returnTo)}`
          return
        }
        if (data.code === 'AIRTABLE_TARGET_MISSING') {
          toast.error('Set your Airtable Base ID and table name in Settings')
          return
        }
        throw new Error(data.error || 'Export failed')
      }
      toast.success(`Exported ${data.count} rows to Airtable`, {
        action: data.url
          ? { label: 'Open', onClick: () => window.open(data.url, '_blank', 'noopener,noreferrer') }
          : undefined,
      })
    } catch (error) {
      toast.error('Airtable export failed', {
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
        Airtable
      </Button>
    )
  }

  if (!isPro) {
    return (
      <Button variant="outline" size="sm" asChild className={className}>
        <Link href="/billing">
          <span className="mr-2">{label ?? 'Export to Airtable'}</span>
          <ProPlanBadge active className="text-[10px]" />
        </Link>
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={busy} className={className}>
      {busy ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Database className="mr-2 h-4 w-4" />
      )}
      {busy ? 'Exporting…' : (label ?? (connected ? 'Export to Airtable' : 'Connect Airtable'))}
    </Button>
  )
}

