'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  Building,
  Users,
  Settings,
  ArrowRight,
  UserCircle,
  Plus,
  Mail,
  Loader2,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  Link2,
  Pencil,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSessionSafe } from '@/lib/session-context'
import { useUser } from '@clerk/nextjs'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import {
  FREE_MAX_WORKSPACES,
  PRO_MAX_COLLABORATORS,
  PRO_MAX_WORKSPACES,
} from '@/lib/workspace/limits'
import { ProPlanBadge } from '@/components/pro-plan-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  WORKSPACE_COLLABORATOR_ROLES,
  workspaceRoleLabel,
  type WorkspaceCollaboratorRole,
} from '@/lib/workspace/roles'

type WorkspaceSection = 'general' | 'people' | 'teamspaces'

type WorkspaceMember = {
  id: string
  workspace_id: string
  email: string
  display_name: string | null
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'pending' | 'active' | 'removed'
  joined_at?: string | null
  inviteUrl?: string | null
}

type Workspace = {
  id: string
  name: string
  joinUrl?: string | null
  members: WorkspaceMember[]
}

type WorkspacePayload = {
  isPro: boolean
  limits: { maxWorkspaces: number; maxCollaborators: number }
  workspaces: Workspace[]
}

function formatField(value: string | string[] | null | undefined): string {
  if (value == null || value === '') return 'Not set'
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || 'Not set'
  return String(value)
}

function isGuestInviteEmail(email: string): boolean {
  return /@invite\.dreamscale\.local$/i.test(email.trim())
}

function memberDisplayName(person: WorkspaceMember): string {
  if (person.display_name?.trim()) return person.display_name.trim()
  if (isGuestInviteEmail(person.email)) return 'Guest collaborator'
  return person.email
}

function memberSubtitle(person: WorkspaceMember): string {
  if (person.status === 'active') {
    const joined = person.joined_at
      ? `Joined ${new Date(person.joined_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })}`
      : 'Joined'
    return isGuestInviteEmail(person.email) ? `${joined} · via invite link` : `${joined} · ${person.email}`
  }
  if (isGuestInviteEmail(person.email)) {
    return 'Waiting to join · via invite link'
  }
  return `Email sent · waiting to join · ${person.email}`
}

function canEmailInvite(person: WorkspaceMember): boolean {
  return person.status === 'pending' && !isGuestInviteEmail(person.email)
}

function memberCollaboratorRole(person: WorkspaceMember): WorkspaceCollaboratorRole {
  if (person.role === 'admin' || person.role === 'viewer') return person.role
  return 'member'
}

function activeCollaboratorCount(members: WorkspaceMember[]): number {
  return members.filter((m) => m.role !== 'owner' && m.status === 'active').length
}

type Props = {
  section: WorkspaceSection
  onClose?: () => void
  selectedWorkspaceId?: string | null
  onNavigateToPeople?: (workspaceId: string) => void
  onBackToTeamspaces?: () => void
}

export function WorkspaceSettingsSection({
  section,
  onClose,
  selectedWorkspaceId,
  onNavigateToPeople,
  onBackToTeamspaces,
}: Props) {
  const sessionContext = useSessionSafe()
  const { user } = useUser()
  const { isPro: isProFromHook } = useSubscriptionStatus()
  const profile = sessionContext?.sessionData?.entrepreneurProfile

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<WorkspacePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)

  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [creatingWorkspace, setCreatingWorkspace] = useState(false)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteNotice, setInviteNotice] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editingMemberName, setEditingMemberName] = useState('')
  const [editingMemberRole, setEditingMemberRole] = useState<WorkspaceCollaboratorRole>('member')
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null)
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null)
  const [lastMailtoUrl, setLastMailtoUrl] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingWorkspaceId, setDeletingWorkspaceId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedWorkspaceId) {
      setActiveWorkspaceId(selectedWorkspaceId)
    }
  }, [selectedWorkspaceId])

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true)
    try {
      const res = await fetch('/api/workspace', { credentials: 'include', cache: 'no-store' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(
          typeof body.error === 'string'
            ? body.error
            : 'Could not load workspace data. Run supabase-workspaces-migration.sql in Supabase.'
        )
        setData(null)
        return
      }
      const json = (await res.json()) as WorkspacePayload
      setData(json)
      setError(null)
      if (!activeWorkspaceId && json.workspaces[0]?.id) {
        setActiveWorkspaceId(json.workspaces[0].id)
      }
    } catch {
      setError(
        'Connection failed. Open http://localhost:3000 and make sure the dev server is running.'
      )
    } finally {
      if (!options?.silent) setLoading(false)
    }
  }, [activeWorkspaceId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (section !== 'people') return
    const interval = setInterval(() => {
      void refresh({ silent: true })
    }, 10000)
    return () => clearInterval(interval)
  }, [section, refresh])

  const workspaceName =
    profile?.businessName?.trim() ||
    profile?.name?.trim() ||
    user?.fullName?.trim() ||
    'My workspace'

  const activeWorkspace =
    data?.workspaces.find((w) => w.id === activeWorkspaceId) ?? data?.workspaces[0] ?? null

  const collaborators =
    activeWorkspace?.members.filter((m) => m.role !== 'owner' && m.status !== 'removed') ?? []

  const planIsPro = data?.isPro === true || isProFromHook

  const limits = data?.limits ?? {
    maxWorkspaces: planIsPro ? PRO_MAX_WORKSPACES : FREE_MAX_WORKSPACES,
    maxCollaborators: planIsPro ? PRO_MAX_COLLABORATORS : 1,
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return
    setCreatingWorkspace(true)
    setError(null)
    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkspaceName.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Could not create workspace')
        return
      }
      setNewWorkspaceName('')
      await refresh()
      if (json.workspace?.id) setActiveWorkspaceId(json.workspace.id)
    } catch {
      setError('Could not create workspace')
    } finally {
      setCreatingWorkspace(false)
    }
  }

  const copyInviteLink = async (url: string, memberId: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(memberId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* ignore */
    }
  }

  const handleInvite = async () => {
    if (!activeWorkspace?.id || !inviteEmail.trim()) return
    const targetEmail = inviteEmail.trim()
    setInviting(true)
    setInviteError(null)
    setInviteNotice(null)
    try {
      const res = await fetch(`/api/workspace/${activeWorkspace.id}/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          displayName: inviteName.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setInviteError(json.error ?? 'Could not send invite')
        return
      }
      setInviteEmail('')
      setInviteName('')
      if (json.inviteUrl) {
        setLastInviteUrl(json.inviteUrl)
      }
      if (json.emailSent) {
        setInviteNotice(
          `Invite email sent to ${targetEmail}. They will show as Joined after they open the link and enter their name.`
        )
        setLastMailtoUrl(null)
      } else if (json.mailtoUrl) {
        setLastMailtoUrl(json.mailtoUrl)
        setInviteNotice(
          `Invite ready for ${targetEmail}. Click "Send from your email" below — it opens Gmail, Outlook, or your default mail app with the invite link filled in. No SendGrid or other service needed.`
        )
      } else {
        setInviteError(
          json.emailError ?? 'Invite created but could not be delivered. Copy the invite link below.'
        )
        if (json.inviteUrl) {
          await copyInviteLink(json.inviteUrl, json.member?.id ?? 'new')
        }
      }
      await refresh()
    } catch {
      setInviteError('Could not send invite')
    } finally {
      setInviting(false)
    }
  }

  const handleResendInvite = async (memberId: string, email: string) => {
    if (!activeWorkspace?.id) return
    setResendingId(memberId)
    setInviteError(null)
    setInviteNotice(null)
    try {
      const res = await fetch(
        `/api/workspace/${activeWorkspace.id}/members/${memberId}/resend`,
        { method: 'POST', credentials: 'include' }
      )
      const json = await res.json()
      if (json.emailSent) {
        setInviteNotice(`Invite email resent to ${email}.`)
        setLastMailtoUrl(null)
      } else if (json.mailtoUrl) {
        setLastMailtoUrl(json.mailtoUrl)
        setInviteNotice(`Open your email app to resend the invite to ${email}.`)
      } else {
        setInviteError(json.error ?? 'Could not resend invite')
        if (json.inviteUrl) {
          setLastInviteUrl(json.inviteUrl)
          await copyInviteLink(json.inviteUrl, memberId)
        }
      }
    } catch {
      setInviteError('Could not resend invite email')
    } finally {
      setResendingId(null)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!activeWorkspace?.id) return
    try {
      const res = await fetch(
        `/api/workspace/${activeWorkspace.id}/members/${memberId}`,
        { method: 'DELETE', credentials: 'include' }
      )
      if (!res.ok) return
      if (editingMemberId === memberId) {
        setEditingMemberId(null)
        setEditingMemberName('')
      }
      await refresh()
    } catch {
      /* ignore */
    }
  }

  const startEditingMember = (person: WorkspaceMember) => {
    setEditingMemberId(person.id)
    setEditingMemberName(memberDisplayName(person))
    setEditingMemberRole(memberCollaboratorRole(person))
    setInviteError(null)
  }

  const cancelEditingMember = () => {
    setEditingMemberId(null)
    setEditingMemberName('')
    setEditingMemberRole('member')
  }

  const handleSaveMember = async (memberId: string) => {
    if (!activeWorkspace?.id) return
    setSavingMemberId(memberId)
    setInviteError(null)
    try {
      const res = await fetch(
        `/api/workspace/${activeWorkspace.id}/members/${memberId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: editingMemberName.trim() || undefined,
            role: editingMemberRole,
          }),
        }
      )
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message =
          typeof json.error === 'string'
            ? json.error
            : res.status === 500
              ? 'Server error while saving. Check the dev server terminal.'
              : 'Could not update member'
        if (
          typeof message === 'string' &&
          /role|constraint|check/i.test(message) &&
          !message.includes('migration')
        ) {
          setInviteError(
            'Could not save role. Run supabase-workspace-member-roles-migration.sql in Supabase, then try again.'
          )
          return
        }
        setInviteError(message)
        return
      }
      setEditingMemberId(null)
      setEditingMemberName('')
      setEditingMemberRole('member')
      setInviteNotice('Member updated.')
      await refresh({ silent: true })
    } catch {
      setInviteError(
        'Connection failed. Make sure the dev server is running at http://localhost:3000, then try again.'
      )
    } finally {
      setSavingMemberId(null)
    }
  }

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!window.confirm('Delete this workspace? All members and invites will be removed.')) {
      return
    }
    setDeletingWorkspaceId(workspaceId)
    setError(null)
    try {
      const res = await fetch(`/api/workspace/${workspaceId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof json.error === 'string' ? json.error : 'Could not delete workspace')
        return
      }
      if (activeWorkspaceId === workspaceId) {
        setActiveWorkspaceId(null)
      }
      onBackToTeamspaces?.()
      await refresh()
    } catch {
      setError('Could not delete workspace')
    } finally {
      setDeletingWorkspaceId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading workspace…
      </div>
    )
  }

  if (section === 'general') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#005DFF]" />
            General
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your business workspace profile. Used to personalize AI recommendations across DreamScale.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
          {[
            { label: 'Workspace name', value: activeWorkspace?.name ?? workspaceName },
            { label: 'Industry', value: formatField(profile?.industry) },
            { label: 'Business stage', value: formatField(profile?.businessStage) },
            { label: 'Team size', value: formatField(profile?.teamSize) },
            { label: 'Experience level', value: formatField(profile?.experienceLevel) },
            { label: 'Primary revenue', value: formatField(profile?.primaryRevenue) },
            {
              label: 'Collaborators',
              value: `${collaborators.length} of ${limits.maxCollaborators}`,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400">{row.label}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {planIsPro
            ? `Pro: up to ${limits.maxWorkspaces} workspaces and ${limits.maxCollaborators} invited people.`
            : `Free: 1 workspace and ${limits.maxCollaborators} invited person. Upgrade to Pro for more.`}
        </p>

        {!profile?.onboardingCompleted && (
          <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
            Complete onboarding to fill in your workspace profile and unlock personalized guidance.
          </p>
        )}

        <Link href="/onboarding" onClick={onClose}>
          <Button variant="outline" className="gap-2">
            Update business profile
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    )
  }

  if (section === 'people') {
    const owner = activeWorkspace?.members.find((m) => m.role === 'owner')
    const ownerEmail =
      owner?.email ||
      sessionContext?.sessionData?.email ||
      user?.primaryEmailAddress?.emailAddress ||
      null
    const ownerDisplay =
      profile?.name?.trim() ||
      user?.fullName?.trim() ||
      owner?.display_name ||
      'You'

    const atLimit = collaborators.length >= limits.maxCollaborators

    return (
      <div className="space-y-6">
        {onBackToTeamspaces && (
          <button
            type="button"
            onClick={onBackToTeamspaces}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-[#005DFF] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Teamspaces
          </button>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#005DFF]" />
            {activeWorkspace?.name ?? 'People'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Share your invite link so people can join with their name. No DreamScale account required.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {data && data.workspaces.length > 1 && !selectedWorkspaceId && (
          <div>
            <Label className="text-sm text-gray-700 dark:text-gray-300">Workspace</Label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
              value={activeWorkspaceId ?? ''}
              onChange={(e) => setActiveWorkspaceId(e.target.value)}
            >
              {data.workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeWorkspace?.joinUrl && (
          <div className="rounded-xl border border-[#005DFF]/30 bg-[#005DFF]/5 p-4 space-y-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#005DFF]" />
              Invite link
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 break-all font-mono">
              {activeWorkspace.joinUrl}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => void copyInviteLink(activeWorkspace.joinUrl!, 'workspace-link')}
            >
              {copiedId === 'workspace-link' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy invite link
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Anyone with this link can join by entering their name.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-gray-50/50 dark:bg-gray-800/30">
          <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#005DFF]" />
            Invite by email
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sends automatically if you add a free Resend API key, or opens your own email app
            (Gmail, Outlook) with the invite pre-filled — no SendGrid required.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={inviting || atLimit}
            />
            <Input
              placeholder="Name (optional)"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              disabled={inviting || atLimit}
            />
          </div>
          {inviteNotice && (
            <p className="text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
              {inviteNotice}
            </p>
          )}
          {inviteError && (
            <p className="text-xs text-red-600 dark:text-red-400">{inviteError}</p>
          )}
          {atLimit && !planIsPro && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Free plan limit reached.{' '}
              <Link href="/billing" className="underline font-medium" onClick={onClose}>
                Upgrade to Pro
              </Link>{' '}
              to invite more people.
            </p>
          )}
          <Button
            size="sm"
            onClick={() => void handleInvite()}
            disabled={inviting || atLimit || !inviteEmail.trim()}
            className="gap-2"
          >
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Send invite email
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activeCollaboratorCount(collaborators)} joined · {collaborators.length} of{' '}
            {limits.maxCollaborators} seats used.
            {planIsPro && <ProPlanBadge active className="ml-2 align-middle" />}
          </p>
          {lastMailtoUrl && (
            <div className="rounded-lg border border-[#005DFF]/30 bg-[#005DFF]/5 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                Send from your email app
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Opens Gmail, Outlook, or your default mail client with the invite link already in the
                message.
              </p>
              <Button size="sm" className="gap-2 bg-[#005DFF] hover:bg-[#0050dd]" asChild>
                <a href={lastMailtoUrl}>
                  <Mail className="w-4 h-4" />
                  Send from your email
                </a>
              </Button>
            </div>
          )}
          {lastInviteUrl && (
            <div className="rounded-lg border border-[#005DFF]/30 bg-[#005DFF]/5 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-900 dark:text-white">Invite link (copy and send)</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 break-all font-mono">{lastInviteUrl}</p>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => void copyInviteLink(lastInviteUrl, 'latest')}
              >
                {copiedId === 'latest' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copy link
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-[#005DFF]/10 flex items-center justify-center shrink-0">
              <UserCircle className="w-5 h-5 text-[#005DFF]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {ownerDisplay}
                <span className="ml-2 text-[10px] uppercase tracking-wide text-[#005DFF] font-semibold">
                  Owner
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {ownerEmail ?? 'Owner'}
              </p>
            </div>
          </div>

          {collaborators.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-4 py-3"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  person.status === 'active'
                    ? 'bg-green-500/10'
                    : 'bg-gray-200/80 dark:bg-gray-700'
                }`}
              >
                <UserCircle
                  className={`w-5 h-5 ${
                    person.status === 'active'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                {editingMemberId === person.id ? (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <Input
                        value={editingMemberName}
                        onChange={(e) => setEditingMemberName(e.target.value)}
                        placeholder="Name"
                        className="h-8 text-sm flex-1"
                        disabled={savingMemberId === person.id}
                      />
                      <Select
                        value={editingMemberRole}
                        onValueChange={(value) =>
                          setEditingMemberRole(value as WorkspaceCollaboratorRole)
                        }
                        disabled={savingMemberId === person.id}
                      >
                        <SelectTrigger className="h-8 w-full sm:w-[140px] text-sm">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKSPACE_COLLABORATOR_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {workspaceRoleLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={() => void handleSaveMember(person.id)}
                        disabled={savingMemberId === person.id}
                      >
                        {savingMemberId === person.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={cancelEditingMember}
                        disabled={savingMemberId === person.id}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex items-center gap-2 flex-wrap">
                      {memberDisplayName(person)}
                      <span className="text-[10px] uppercase tracking-wide text-[#005DFF] font-semibold">
                        {workspaceRoleLabel(memberCollaboratorRole(person))}
                      </span>
                      {person.status === 'active' && (
                        <span className="text-[10px] uppercase tracking-wide text-green-600 dark:text-green-400 font-semibold">
                          Joined
                        </span>
                      )}
                      {person.status === 'pending' && (
                        <span className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400 font-semibold">
                          Waiting
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {memberSubtitle(person)}
                    </p>
                  </>
                )}
              </div>
              {editingMemberId !== person.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-gray-400 hover:text-[#005DFF]"
                  onClick={() => startEditingMember(person)}
                  aria-label="Edit member"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {editingMemberId !== person.id && person.inviteUrl && person.status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1 text-xs"
                  onClick={() => void copyInviteLink(person.inviteUrl!, person.id)}
                >
                  {copiedId === person.id ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  Link
                </Button>
              )}
              {editingMemberId !== person.id && canEmailInvite(person) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1 text-xs"
                  onClick={() => void handleResendInvite(person.id, person.email)}
                  disabled={resendingId === person.id}
                >
                  {resendingId === person.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  Resend
                </Button>
              )}
              {editingMemberId !== person.id && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-gray-400 hover:text-red-600"
                onClick={() => void handleRemove(person.id)}
                aria-label="Remove member"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              )}
            </div>
          ))}
        </div>

        {collaborators.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No collaborators yet. Share the invite link above.
          </p>
        )}

        {activeWorkspace && (data?.workspaces.length ?? 0) > 1 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
              onClick={() => void handleDeleteWorkspace(activeWorkspace.id)}
              disabled={deletingWorkspaceId === activeWorkspace.id}
            >
              {deletingWorkspaceId === activeWorkspace.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete workspace
            </Button>
          </div>
        )}
      </div>
    )
  }

  // teamspaces
  const canCreateMore = (data?.workspaces.length ?? 0) < limits.maxWorkspaces

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Building className="w-5 h-5 text-[#005DFF]" />
          Teamspaces
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create workspaces for your business. Each workspace holds roadmaps, systems, revenue data,
          and your invited team.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {(data?.workspaces ?? []).map((ws) => (
          <button
            key={ws.id}
            type="button"
            onClick={() => onNavigateToPeople?.(ws.id)}
            className="w-full text-left rounded-xl border-2 border-[#005DFF]/20 bg-gradient-to-br from-blue-50/80 to-cyan-50/50 dark:from-blue-950/30 dark:to-slate-900/50 p-5 transition-all hover:border-[#005DFF]/50 hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#005DFF] flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{ws.name}</p>
                  <span className="text-xs text-[#005DFF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                    Manage team
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatField(profile?.industry)}, {activeCollaboratorCount(ws.members)} collaborator
                  {activeCollaboratorCount(ws.members) === 1 ? '' : 's'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  Invite people and manage your team for this workspace.
                </p>
              </div>
              {(data?.workspaces.length ?? 0) > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-gray-400 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    void handleDeleteWorkspace(ws.id)
                  }}
                  disabled={deletingWorkspaceId === ws.id}
                  aria-label={`Delete ${ws.name}`}
                >
                  {deletingWorkspaceId === ws.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </button>
        ))}
      </div>

      {canCreateMore ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create a workspace
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              disabled={creatingWorkspace}
              className="flex-1"
            />
            <Button
              onClick={() => void handleCreateWorkspace()}
              disabled={creatingWorkspace || !newWorkspaceName.trim()}
            >
              {creatingWorkspace ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {data?.workspaces.length ?? 0} of {limits.maxWorkspaces} workspaces
            {planIsPro ? (
              <span> on Pro.</span>
            ) : (
              <>
                {' '}
                on Free.{' '}
                <Link href="/billing" className="underline" onClick={onClose}>
                  Go Pro
                </Link>{' '}
                for up to {PRO_MAX_WORKSPACES} workspaces.
              </>
            )}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {planIsPro
            ? `You have reached the ${limits.maxWorkspaces} workspace limit on Pro.`
            : (
              <>
                Free includes 1 workspace.{' '}
                <Link href="/billing" className="underline text-[#005DFF]" onClick={onClose}>
                  Upgrade to Pro
                </Link>{' '}
                to create more.
              </>
            )}
        </p>
      )}
    </div>
  )
}
