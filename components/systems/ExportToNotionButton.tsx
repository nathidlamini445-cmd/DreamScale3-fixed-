"use client"

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { BusinessSystem } from './SystemBuilder'
import { toast } from 'sonner'

type NotionStatus = {
  configured: boolean
  connected: boolean
  workspaceName: string | null
}

type ExportToNotionButtonProps = {
  system: BusinessSystem
  className?: string
}

export function ExportToNotionButton({ system, className }: ExportToNotionButtonProps) {
  const pathname = usePathname()
  const { isPro, loading: subLoading } = useSubscriptionStatus()
  const [status, setStatus] = useState<NotionStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const returnTo =
    typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : pathname

  const loadStatus = useCallback(async () => {
    if (!isPro) return
    setStatusLoading(true)
    try {
      const res = await fetch('/api/integrations/notion/status', { credentials: 'include' })
      if (res.ok) {
        setStatus(await res.json())
      }
    } catch {
      setStatus(null)
    } finally {
      setStatusLoading(false)
    }
  }, [isPro])

  useEffect(() => {
    if (!subLoading && isPro) void loadStatus()
  }, [subLoading, isPro, loadStatus])

  const handleConnect = () => {
    window.location.href = `/api/integrations/notion/connect?returnTo=${encodeURIComponent(returnTo)}`
  }

  const handleExport = async () => {
    if (!status?.connected) {
      handleConnect()
      return
    }

    setExporting(true)
    try {
      const res = await fetch('/api/integrations/notion/export-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          system: {
            ...system,
            lastAnalyzed:
              system.lastAnalyzed instanceof Date
                ? system.lastAnalyzed.toISOString()
                : system.lastAnalyzed,
          },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.code === 'NOTION_NOT_CONNECTED') {
          handleConnect()
          return
        }
        throw new Error(data.error || 'Export failed')
      }
      toast.success('Exported to Notion', {
        description: status.workspaceName
          ? `Added to ${status.workspaceName}`
          : 'Your system is now in Notion.',
        action: data.url
          ? {
              label: 'Open',
              onClick: () => window.open(data.url, '_blank', 'noopener,noreferrer'),
            }
          : undefined,
      })
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      toast.error('Notion export failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setExporting(false)
    }
  }

  if (subLoading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Notion
      </Button>
    )
  }

  if (!isPro) {
    return (
      <Button variant="outline" size="sm" asChild className={className}>
        <Link href="/billing">
          <span className="mr-2">Export to Notion</span>
          <ProPlanBadge active className="text-[10px]" />
        </Link>
      </Button>
    )
  }

  const busy = exporting || statusLoading

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={busy || status?.configured === false}
      className={className}
      title={
        status?.configured === false
          ? 'Notion is not configured on this server yet.'
          : status?.connected
            ? `Export to ${status.workspaceName ?? 'Notion'}`
            : 'Connect Notion to export'
      }
    >
      {busy ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ExternalLink className="mr-2 h-4 w-4" />
      )}
      {exporting
        ? 'Exporting…'
        : status?.connected
          ? 'Export to Notion'
          : 'Connect & export to Notion'}
    </Button>
  )
}
