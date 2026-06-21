"use client"

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Loader2, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { exportToGoogleSheets } from '@/lib/integrations/export-google-sheets'
import { toast } from 'sonner'
import type { BusinessSystem } from '@/components/systems/SystemBuilder'

type GoogleStatus = {
  configured: boolean
  connected: boolean
  accountEmail: string | null
}

type ExportToGoogleSheetsButtonProps = {
  className?: string
  label?: string
  title?: string
  system?: BusinessSystem
  payload?: Record<string, unknown>
}

export function ExportToGoogleSheetsButton({
  className,
  label,
  title,
  system,
  payload,
}: ExportToGoogleSheetsButtonProps) {
  const pathname = usePathname()
  const { isPro, loading: subLoading } = useSubscriptionStatus()
  const [status, setStatus] = useState<GoogleStatus | null>(null)
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
      const res = await fetch('/api/integrations/google/status', { credentials: 'include' })
      if (res.ok) setStatus(await res.json())
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
    window.location.href = `/api/integrations/google/connect?returnTo=${encodeURIComponent(returnTo)}`
  }

  const handleExport = async () => {
    if (!status?.connected) {
      handleConnect()
      return
    }

    setExporting(true)
    try {
      const body: Record<string, unknown> = { ...payload }
      if (system) {
        body.system = {
          ...system,
          lastAnalyzed:
            system.lastAnalyzed instanceof Date
              ? system.lastAnalyzed.toISOString()
              : system.lastAnalyzed,
        }
      }
      if (title) body.title = title

      const data = await exportToGoogleSheets(body, returnTo)
      if (data.code === 'GOOGLE_NOT_CONNECTED') return

      toast.success('Exported to Google Sheets', {
        description: status.accountEmail
          ? `Saved to ${status.accountEmail}'s Drive`
          : 'Your spreadsheet is ready.',
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
      toast.error('Google Sheets export failed', {
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
        Google Sheets
      </Button>
    )
  }

  if (!isPro) {
    return (
      <Button variant="outline" size="sm" asChild className={className}>
        <Link href="/billing">
          <span className="mr-2">{label ?? 'Export to Google Sheets'}</span>
          <ProPlanBadge active className="text-[10px]" />
        </Link>
      </Button>
    )
  }

  const busy = exporting || statusLoading
  const defaultLabel = status?.connected
    ? 'Export to Google Sheets'
    : 'Connect & export to Sheets'

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={busy || status?.configured === false}
      className={className}
      title={
        status?.configured === false
          ? 'Google is not configured on this server yet.'
          : status?.connected
            ? `Export to ${status.accountEmail ?? 'Google Sheets'}`
            : 'Connect Google to export'
      }
    >
      {busy ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Table2 className="mr-2 h-4 w-4" />
      )}
      {exporting ? 'Exporting…' : (label ?? defaultLabel)}
    </Button>
  )
}

