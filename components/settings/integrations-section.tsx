'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type IntegrationStatus = {
  configured: boolean
  connected: boolean
  workspaceName?: string | null
  accountEmail?: string | null
  teamName?: string | null
  defaultChannel?: string | null
}

function IntegrationCard({
  title,
  description,
  showProBadge,
  isPro,
  comingSoonLabel,
  upgradeHref = '/billing',
  children,
}: {
  title: string
  description: string
  showProBadge: boolean
  isPro: boolean
  comingSoonLabel?: string
  upgradeHref?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="min-w-0 flex-1 p-5 pb-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {showProBadge && <ProPlanBadge active className="shrink-0 text-[10px]" />}
        </div>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/40">
        {isPro ? (
          children ?? (
            <div
              className={cn(
                'flex w-full min-h-10 items-center justify-center rounded-md border border-gray-200',
                'bg-white px-3 py-2.5 text-center text-sm font-medium text-gray-500',
                'dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400'
              )}
              aria-disabled="true"
            >
              {comingSoonLabel}
            </div>
          )
        ) : (
          <Link
            href={upgradeHref}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 w-full')}
          >
            Upgrade to connect
          </Link>
        )}
      </div>
    </div>
  )
}

export function IntegrationsSection() {
  const searchParams = useSearchParams()
  const { isPro, loading } = useSubscriptionStatus()
  const [notionStatus, setNotionStatus] = useState<IntegrationStatus | null>(null)
  const [googleStatus, setGoogleStatus] = useState<IntegrationStatus | null>(null)
  const [slackStatus, setSlackStatus] = useState<IntegrationStatus | null>(null)
  const [slackChannel, setSlackChannel] = useState('#general')
  const [notionLoading, setNotionLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [slackLoading, setSlackLoading] = useState(false)
  const [disconnecting, setDisconnecting] = useState<'notion' | 'google' | 'slack' | null>(null)
  const [savingSettings, setSavingSettings] = useState<'slack' | null>(null)

  const returnTo =
    typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : '/dashboard?section=integrations'

  const loadNotionStatus = useCallback(async () => {
    if (!isPro) return
    setNotionLoading(true)
    try {
      const res = await fetch('/api/integrations/notion/status', { credentials: 'include' })
      if (res.ok) setNotionStatus(await res.json())
    } catch {
      setNotionStatus(null)
    } finally {
      setNotionLoading(false)
    }
  }, [isPro])

  const loadGoogleStatus = useCallback(async () => {
    if (!isPro) return
    setGoogleLoading(true)
    try {
      const res = await fetch('/api/integrations/google/status', { credentials: 'include' })
      if (res.ok) setGoogleStatus(await res.json())
    } catch {
      setGoogleStatus(null)
    } finally {
      setGoogleLoading(false)
    }
  }, [isPro])

  const loadSlackStatus = useCallback(async () => {
    if (!isPro) return
    setSlackLoading(true)
    try {
      const res = await fetch('/api/integrations/slack/status', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSlackStatus(data)
        if (data.defaultChannel) setSlackChannel(data.defaultChannel)
      }
    } catch {
      setSlackStatus(null)
    } finally {
      setSlackLoading(false)
    }
  }, [isPro])

  useEffect(() => {
    if (!loading && isPro) {
      void loadNotionStatus()
      void loadGoogleStatus()
      void loadSlackStatus()
    }
  }, [loading, isPro, loadNotionStatus, loadGoogleStatus, loadSlackStatus])

  useEffect(() => {
    const google = searchParams.get('google')
    const slack = searchParams.get('slack')
    if (google === 'connected' || google === 'error') void loadGoogleStatus()
    if (slack === 'connected' || slack === 'error') void loadSlackStatus()
  }, [searchParams, loadGoogleStatus, loadSlackStatus])

  const connectGoogle = () => {
    window.location.href = `/api/integrations/google/connect?returnTo=${encodeURIComponent(returnTo)}`
  }
  const connectNotion = () => {
    window.location.href = `/api/integrations/notion/connect?returnTo=${encodeURIComponent(returnTo)}`
  }
  const connectSlack = () => {
    window.location.href = `/api/integrations/slack/connect?returnTo=${encodeURIComponent(returnTo)}`
  }

  const saveSlackChannel = async () => {
    setSavingSettings('slack')
    try {
      const res = await fetch('/api/integrations/slack/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ defaultChannel: slackChannel }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Slack channel saved')
      await loadSlackStatus()
    } catch {
      toast.error('Could not save Slack channel')
    } finally {
      setSavingSettings(null)
    }
  }

  const disconnect = async (provider: 'notion' | 'google' | 'slack') => {
    setDisconnecting(provider)
    try {
      const res = await fetch(`/api/integrations/${provider}/disconnect`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Disconnect failed')
      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected`)
      if (provider === 'notion') await loadNotionStatus()
      if (provider === 'google') await loadGoogleStatus()
      if (provider === 'slack') await loadSlackStatus()
    } catch {
      toast.error(`Could not disconnect ${provider}`)
    } finally {
      setDisconnecting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Integrations</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Connect Google, Notion, and Slack so your plans flow into the tools you already use.
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Instagram & HubSpot coming later.
        </p>
      </div>

      <div className="grid items-stretch gap-4 sm:grid-cols-2">
        <IntegrationCard
          title="Google Workspace"
          description="Send roadmaps, revenue reports, and business systems to Google Docs or Sheets, ready to share or edit with your team."
          showProBadge={isPro}
          isPro={isPro}
        >
          {googleLoading ? (
            <div className="flex h-10 items-center justify-center text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking…
            </div>
          ) : googleStatus?.connected ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Connected as{' '}
                <span className="font-medium">{googleStatus.accountEmail ?? 'Google account'}</span>
              </p>
              <button
                type="button"
                onClick={() => disconnect('google')}
                disabled={disconnecting === 'google'}
                className={cn(buttonVariants({ variant: 'outline' }), 'h-10 w-full text-red-600')}
              >
                {disconnecting === 'google' ? 'Disconnecting…' : 'Disconnect Google'}
              </button>
            </div>
          ) : googleStatus?.configured === false ? (
            <p className="text-center text-sm text-gray-500">Google not configured on server.</p>
          ) : (
            <div className="space-y-2">
              <button type="button" onClick={connectGoogle} className={cn(buttonVariants({ variant: 'default' }), 'h-10 w-full')}>
                Connect Google
              </button>
              {googleStatus?.redirectUri ? (
                <p className="text-[11px] text-gray-500">
                  Redirect URI:{' '}
                  <code className="break-all rounded bg-gray-100 px-1 text-[10px] dark:bg-gray-800">
                    {googleStatus.redirectUri}
                  </code>
                </p>
              ) : null}
            </div>
          )}
        </IntegrationCard>

        <IntegrationCard
          title="Notion"
          description="Turn DreamScale roadmaps, systems, and revenue insights into Notion pages. Keep your planning, analysis, and next steps in the workspace your team already uses."
          showProBadge={isPro}
          isPro={isPro}
        >
          {notionLoading ? (
            <div className="flex h-10 items-center justify-center text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking…
            </div>
          ) : notionStatus?.connected ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Connected to{' '}
                <span className="font-medium">{notionStatus.workspaceName ?? 'workspace'}</span>
              </p>
              <button
                type="button"
                onClick={() => disconnect('notion')}
                disabled={disconnecting === 'notion'}
                className={cn(buttonVariants({ variant: 'outline' }), 'h-10 w-full text-red-600')}
              >
                {disconnecting === 'notion' ? 'Disconnecting…' : 'Disconnect Notion'}
              </button>
            </div>
          ) : notionStatus?.configured === false ? (
            <p className="text-center text-sm text-gray-500">Notion not configured on server.</p>
          ) : (
            <button type="button" onClick={connectNotion} className={cn(buttonVariants({ variant: 'default' }), 'h-10 w-full')}>
              Connect Notion
            </button>
          )}
        </IntegrationCard>

        <IntegrationCard
          title="Slack"
          description="Share roadmap updates, revenue insights, and AI summaries with your team in Slack. Choose a default channel once, then send from Roadmap, Revenue, or Share with no copy-paste needed."
          showProBadge={isPro}
          isPro={isPro}
        >
          {slackLoading ? (
            <div className="flex h-10 items-center justify-center text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking…
            </div>
          ) : slackStatus?.connected ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Workspace:{' '}
                <span className="font-medium">{slackStatus.teamName ?? 'Slack'}</span>
              </p>
              <div className="space-y-1">
                <Label htmlFor="slack-channel" className="text-xs">
                  Default channel
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="slack-channel"
                    value={slackChannel}
                    onChange={(e) => setSlackChannel(e.target.value)}
                    placeholder="#general"
                    className="h-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={saveSlackChannel}
                    disabled={savingSettings === 'slack'}
                    className={cn(buttonVariants({ variant: 'outline' }), 'h-9 shrink-0 px-3 text-xs')}
                  >
                    Save
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => disconnect('slack')}
                disabled={disconnecting === 'slack'}
                className={cn(buttonVariants({ variant: 'outline' }), 'h-10 w-full text-red-600')}
              >
                {disconnecting === 'slack' ? 'Disconnecting…' : 'Disconnect Slack'}
              </button>
            </div>
          ) : slackStatus?.configured === false ? (
            <p className="text-center text-sm text-gray-500">Slack not configured on server.</p>
          ) : (
            <button type="button" onClick={connectSlack} className={cn(buttonVariants({ variant: 'default' }), 'h-10 w-full')}>
              Connect Slack
            </button>
          )}
        </IntegrationCard>

        <IntegrationCard
          title="Google Calendar"
          description="Put roadmap milestones and revenue weekly actions on your calendar so nothing slips. One click from Roadmap or Revenue goals adds events to Google Calendar."
          showProBadge={isPro}
          isPro={isPro}
        >
          {googleLoading ? (
            <div className="flex h-10 items-center justify-center text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking…
            </div>
          ) : googleStatus?.connected ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Ready via{' '}
                <span className="font-medium">{googleStatus.accountEmail ?? 'Google account'}</span>
              </p>
              <p className="text-[11px] text-gray-500">
                Use <strong>Add to Calendar</strong> on Roadmap milestones and Revenue weekly actions.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/suggestions"
                  className={cn(buttonVariants({ variant: 'outline' }), 'h-9 w-full text-xs')}
                >
                  Open Roadmap
                </Link>
                <Link
                  href="/revenue-intelligence"
                  className={cn(buttonVariants({ variant: 'outline' }), 'h-9 w-full text-xs')}
                >
                  Open Revenue
                </Link>
              </div>
            </div>
          ) : googleStatus?.configured === false ? (
            <p className="text-center text-sm text-gray-500">Google not configured on server.</p>
          ) : (
            <div className="space-y-2">
              <button type="button" onClick={connectGoogle} className={cn(buttonVariants({ variant: 'default' }), 'h-10 w-full')}>
                Connect Google for Calendar
              </button>
              <p className="text-[11px] text-gray-500">
                Uses the same Google connection as Docs and Sheets. Enable the Calendar API in Google Cloud.
              </p>
            </div>
          )}
        </IntegrationCard>
      </div>

      {!loading && !isPro && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Integrations are included with DreamScale Pro.{' '}
          <Link href="/billing" className="text-[#005DFF] underline">
            View plans
          </Link>
        </p>
      )}
    </div>
  )
}

