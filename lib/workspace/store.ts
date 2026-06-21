import 'server-only'

import { createAdminClient, hasAdminClient } from '@/lib/supabase/admin'
import { generateInviteToken } from '@/lib/workspace/invite-token'
import {
  isCollaboratorRole,
  type WorkspaceCollaboratorRole,
} from '@/lib/workspace/roles'
import {
  maxCollaboratorsForPlan,
  maxWorkspacesForPlan,
} from '@/lib/workspace/limits'

export type WorkspaceRow = {
  id: string
  owner_id: string
  name: string
  created_at: string
  updated_at: string
  invite_token?: string | null
}

export type WorkspaceMemberRow = {
  id: string
  workspace_id: string
  user_id: string | null
  email: string
  display_name: string | null
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'pending' | 'active' | 'removed'
  invited_at: string
  joined_at: string | null
  invite_token: string | null
}

export type WorkspaceWithMembers = WorkspaceRow & {
  members: WorkspaceMemberRow[]
}

function isMissingInviteTokenColumn(message: string): boolean {
  return /invite_token/i.test(message)
}

const MEMBER_SELECT_BASE =
  'id, workspace_id, user_id, email, display_name, role, status, invited_at, joined_at'

async function fetchWorkspaceMembers(
  admin: ReturnType<typeof createAdminClient>,
  workspaceIds: string[]
): Promise<WorkspaceMemberRow[]> {
  const { data, error } = await admin
    .from('workspace_members')
    .select(`${MEMBER_SELECT_BASE}, invite_token`)
    .in('workspace_id', workspaceIds)
    .neq('status', 'removed')
    .order('invited_at', { ascending: true })

  if (!error) {
    return (data ?? []) as WorkspaceMemberRow[]
  }

  if (isMissingInviteTokenColumn(error.message)) {
    const fallback = await admin
      .from('workspace_members')
      .select(MEMBER_SELECT_BASE)
      .in('workspace_id', workspaceIds)
      .neq('status', 'removed')
      .order('invited_at', { ascending: true })

    if (fallback.error) {
      console.error('[workspace] members load failed:', fallback.error.message)
      return []
    }

    return (fallback.data ?? []).map((m) => ({
      ...(m as WorkspaceMemberRow),
      invite_token: null,
    }))
  }

  console.error('[workspace] members load failed:', error.message)
  return []
}

export async function listWorkspacesForOwner(
  ownerId: string
): Promise<WorkspaceWithMembers[]> {
  if (!hasAdminClient()) return []

  const admin = createAdminClient()
  const { data: workspaces, error } = await admin
    .from('dreamscale_workspaces')
    .select('id, owner_id, name, created_at, updated_at, invite_token')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })

  if (error) {
    if (isMissingInviteTokenColumn(error.message)) {
      const fallback = await admin
        .from('dreamscale_workspaces')
        .select('id, owner_id, name, created_at, updated_at')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: true })

      if (fallback.error) {
        console.error('[workspace] list failed:', fallback.error.message)
        return []
      }

      const ids = (fallback.data ?? []).map((w) => w.id)
      const members = await fetchWorkspaceMembers(admin, ids)
      const byWorkspace = new Map<string, WorkspaceMemberRow[]>()
      for (const m of members) {
        const list = byWorkspace.get(m.workspace_id) ?? []
        list.push(m)
        byWorkspace.set(m.workspace_id, list)
      }

      return (fallback.data ?? []).map((w) => ({
        ...(w as WorkspaceRow),
        invite_token: null,
        members: byWorkspace.get(w.id) ?? [],
      }))
    }

    console.error('[workspace] list failed:', error.message)
    return []
  }

  if (!workspaces?.length) return []

  const ids = workspaces.map((w) => w.id)
  const members = await fetchWorkspaceMembers(admin, ids)

  const byWorkspace = new Map<string, WorkspaceMemberRow[]>()
  for (const m of members) {
    const list = byWorkspace.get(m.workspace_id) ?? []
    list.push(m)
    byWorkspace.set(m.workspace_id, list)
  }

  return workspaces.map((w) => ({
    ...(w as WorkspaceRow),
    members: byWorkspace.get(w.id) ?? [],
  }))
}

export async function ensureDefaultWorkspace(
  ownerId: string,
  defaultName: string,
  ownerEmail: string | null
): Promise<WorkspaceWithMembers | null> {
  const existing = await listWorkspacesForOwner(ownerId)
  if (existing.length > 0) return existing[0]

  if (!hasAdminClient()) return null

  const admin = createAdminClient()
  const name = defaultName.trim() || 'My workspace'
  const { data: workspace, error } = await admin
    .from('dreamscale_workspaces')
    .insert({ owner_id: ownerId, name })
    .select('id, owner_id, name, created_at, updated_at')
    .single()

  if (error || !workspace) return null

  const email = ownerEmail ? normalizeEmail(ownerEmail) : `${ownerId}@owner.local`
  const { data: ownerMember, error: memberError } = await admin
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: ownerId,
      email,
      display_name: null,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
    })
    .select(
      'id, workspace_id, user_id, email, display_name, role, status, invited_at, joined_at, invite_token'
    )
    .single()

  if (memberError) return null

  return {
    ...(workspace as WorkspaceRow),
    members: ownerMember ? [ownerMember as WorkspaceMemberRow] : [],
  }
}

export async function createWorkspace(
  ownerId: string,
  name: string,
  isPro: boolean,
  ownerEmail?: string | null
): Promise<{ workspace?: WorkspaceRow; error?: string; code?: string }> {
  if (!hasAdminClient()) {
    return { error: 'Server misconfigured', code: 'no_admin' }
  }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Workspace name is required', code: 'invalid_name' }

  const existing = await listWorkspacesForOwner(ownerId)
  const limit = maxWorkspacesForPlan(isPro)
  if (existing.length >= limit) {
    return {
      error: isPro
        ? `You can create up to ${limit} workspaces on Pro.`
        : 'Free plan includes 1 workspace. Upgrade to Pro to create more.',
      code: 'workspace_limit',
    }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('dreamscale_workspaces')
    .insert({ owner_id: ownerId, name: trimmed })
    .select('id, owner_id, name, created_at, updated_at')
    .single()

  if (error) return { error: error.message, code: 'db_error' }

  const email = ownerEmail ? normalizeEmail(ownerEmail) : `${ownerId}@owner.local`
  await admin.from('workspace_members').insert({
    workspace_id: data.id,
    user_id: ownerId,
    email,
    display_name: null,
    role: 'owner',
    status: 'active',
    joined_at: new Date().toISOString(),
  })

  await ensureWorkspaceInviteToken(data.id)

  return { workspace: data as WorkspaceRow }
}

export async function inviteToWorkspace(
  ownerId: string,
  workspaceId: string,
  params: { email: string; displayName?: string },
  isPro: boolean
): Promise<{ member?: WorkspaceMemberRow; error?: string; code?: string }> {
  if (!hasAdminClient()) {
    return { error: 'Server misconfigured', code: 'no_admin' }
  }

  const email = normalizeEmail(params.email)
  if (!email.includes('@')) {
    return { error: 'Enter a valid email address', code: 'invalid_email' }
  }

  const admin = createAdminClient()
  const { data: workspace } = await admin
    .from('dreamscale_workspaces')
    .select('id, owner_id')
    .eq('id', workspaceId)
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (!workspace) {
    return { error: 'Workspace not found', code: 'not_found' }
  }

  const { data: members } = await admin
    .from('workspace_members')
    .select('id, role, status, email')
    .eq('workspace_id', workspaceId)
    .neq('status', 'removed')

  const collaborators = (members ?? []).filter((m) => m.role !== 'owner')
  const limit = maxCollaboratorsForPlan(isPro)
  if (collaborators.length >= limit) {
    return {
      error: isPro
        ? `Pro workspaces can invite up to ${limit} people.`
        : 'Free plan includes 1 invited person. Upgrade to Pro to invite more.',
      code: 'member_limit',
    }
  }

  if ((members ?? []).some((m) => normalizeEmail(m.email) === email)) {
    return { error: 'This person is already in the workspace', code: 'duplicate' }
  }

  const { data, error } = await admin
    .from('workspace_members')
    .insert({
      workspace_id: workspaceId,
      email,
      display_name: params.displayName?.trim() || null,
      role: 'member',
      status: 'pending',
      invite_token: generateInviteToken(),
    })
    .select(
      'id, workspace_id, user_id, email, display_name, role, status, invited_at, joined_at, invite_token'
    )
    .single()

  if (error) return { error: error.message, code: 'db_error' }
  return { member: data as WorkspaceMemberRow }
}

export async function removeWorkspaceMember(
  ownerId: string,
  workspaceId: string,
  memberId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!hasAdminClient()) return { ok: false, error: 'Server misconfigured' }

  const admin = createAdminClient()
  const { data: workspace } = await admin
    .from('dreamscale_workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (!workspace) return { ok: false, error: 'Workspace not found' }

  const { data: member } = await admin
    .from('workspace_members')
    .select('id, role')
    .eq('id', memberId)
    .eq('workspace_id', workspaceId)
    .maybeSingle()

  if (!member) return { ok: false, error: 'Member not found' }
  if (member.role === 'owner') return { ok: false, error: 'Cannot remove workspace owner' }

  const { error } = await admin
    .from('workspace_members')
    .update({ status: 'removed' })
    .eq('id', memberId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function updateWorkspaceMember(
  ownerId: string,
  workspaceId: string,
  memberId: string,
  updates: { displayName?: string; role?: WorkspaceCollaboratorRole }
): Promise<{ ok: boolean; member?: WorkspaceMemberRow; error?: string }> {
  if (!hasAdminClient()) return { ok: false, error: 'Server misconfigured' }

  const trimmedName = updates.displayName?.trim()
  const nextRole = updates.role

  if (!trimmedName && !nextRole) {
    return { ok: false, error: 'Nothing to update' }
  }

  if (nextRole && !isCollaboratorRole(nextRole)) {
    return { ok: false, error: 'Invalid role' }
  }

  const admin = createAdminClient()
  const { data: workspace } = await admin
    .from('dreamscale_workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (!workspace) return { ok: false, error: 'Workspace not found' }

  const { data: member } = await admin
    .from('workspace_members')
    .select('id, role, status, display_name')
    .eq('id', memberId)
    .eq('workspace_id', workspaceId)
    .neq('status', 'removed')
    .maybeSingle()

  if (!member) return { ok: false, error: 'Member not found' }
  if (member.role === 'owner') return { ok: false, error: 'Cannot edit workspace owner here' }

  const patch: { display_name?: string; role?: WorkspaceCollaboratorRole } = {}
  if (trimmedName) patch.display_name = trimmedName
  if (nextRole) patch.role = nextRole

  const { data, error } = await admin
    .from('workspace_members')
    .update(patch)
    .eq('id', memberId)
    .select(
      'id, workspace_id, user_id, email, display_name, role, status, invited_at, joined_at, invite_token'
    )
    .single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, member: data as WorkspaceMemberRow }
}

export async function updateGuestMemberByToken(
  token: string,
  displayName: string
): Promise<{ ok: boolean; displayName?: string; error?: string }> {
  const trimmedName = displayName.trim()
  if (!trimmedName) return { ok: false, error: 'Name is required' }

  const details = await getInviteByToken(token)
  if (!details || details.member.status === 'removed') {
    return { ok: false, error: 'Guest session not found' }
  }

  if (!hasAdminClient()) return { ok: false, error: 'Server misconfigured' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('workspace_members')
    .update({ display_name: trimmedName })
    .eq('id', details.member.id)
    .eq('invite_token', token.trim())

  if (error) return { ok: false, error: error.message }
  return { ok: true, displayName: trimmedName }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function countCollaborators(members: WorkspaceMemberRow[]): number {
  return members.filter((m) => m.role !== 'owner' && m.status !== 'removed').length
}

export function isGuestInviteEmail(email: string): boolean {
  return /@invite\.dreamscale\.local$/i.test(email.trim())
}

export async function listActiveWorkspaceMembers(
  workspaceId: string
): Promise<
  Pick<WorkspaceMemberRow, 'id' | 'display_name' | 'email' | 'role' | 'status' | 'joined_at'>[]
> {
  if (!hasAdminClient()) return []

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('workspace_members')
    .select('id, display_name, email, role, status, joined_at')
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .order('role', { ascending: false })
    .order('joined_at', { ascending: true, nullsFirst: false })

  if (error) return []
  return (data ?? []) as Pick<
    WorkspaceMemberRow,
    'id' | 'display_name' | 'email' | 'role' | 'status' | 'joined_at'
  >[]
}

export type InviteDetails = {
  member: WorkspaceMemberRow
  workspace: WorkspaceRow
  ownerEmail: string | null
}

export async function getInviteByToken(
  token: string
): Promise<InviteDetails | null> {
  if (!hasAdminClient() || !token.trim()) return null

  const admin = createAdminClient()
  const { data: member } = await admin
    .from('workspace_members')
    .select(
      'id, workspace_id, user_id, email, display_name, role, status, invited_at, joined_at, invite_token'
    )
    .eq('invite_token', token.trim())
    .neq('status', 'removed')
    .maybeSingle()

  if (!member || member.role === 'owner') return null

  const { data: workspace } = await admin
    .from('dreamscale_workspaces')
    .select('id, owner_id, name, created_at, updated_at')
    .eq('id', member.workspace_id)
    .maybeSingle()

  if (!workspace) return null

  const { data: ownerProfile } = await admin
    .from('user_profiles')
    .select('email, user_name')
    .eq('id', workspace.owner_id)
    .maybeSingle()

  return {
    member: member as WorkspaceMemberRow,
    workspace: workspace as WorkspaceRow,
    ownerEmail: ownerProfile?.email ?? null,
  }
}

export async function deleteWorkspace(
  ownerId: string,
  workspaceId: string
): Promise<{ ok: boolean; error?: string; code?: string }> {
  if (!hasAdminClient()) return { ok: false, error: 'Server misconfigured' }

  const existing = await listWorkspacesForOwner(ownerId)
  if (existing.length <= 1) {
    return {
      ok: false,
      error: 'Keep at least one workspace. Create another before deleting this one.',
      code: 'last_workspace',
    }
  }

  const admin = createAdminClient()
  const { data: workspace } = await admin
    .from('dreamscale_workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (!workspace) return { ok: false, error: 'Workspace not found', code: 'not_found' }

  const { error } = await admin.from('dreamscale_workspaces').delete().eq('id', workspaceId)

  if (error) return { ok: false, error: error.message, code: 'db_error' }
  return { ok: true }
}

export async function ensureWorkspaceInviteToken(
  workspaceId: string
): Promise<string | null> {
  if (!hasAdminClient()) return null

  const admin = createAdminClient()
  const { data: workspace } = await admin
    .from('dreamscale_workspaces')
    .select('id, invite_token')
    .eq('id', workspaceId)
    .maybeSingle()

  if (!workspace) return null
  if (workspace.invite_token) return workspace.invite_token as string

  const token = generateInviteToken()
  const { error } = await admin
    .from('dreamscale_workspaces')
    .update({ invite_token: token })
    .eq('id', workspaceId)

  if (error) {
    if (isMissingInviteTokenColumn(error.message)) return null
    return null
  }

  return token
}

export async function getWorkspaceByOpenInviteToken(
  token: string
): Promise<WorkspaceRow | null> {
  if (!hasAdminClient() || !token.trim()) return null

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('dreamscale_workspaces')
    .select('id, owner_id, name, created_at, updated_at, invite_token')
    .eq('invite_token', token.trim())
    .maybeSingle()

  if (error) {
    if (isMissingInviteTokenColumn(error.message)) return null
    return null
  }

  return data as WorkspaceRow | null
}

export async function joinWorkspaceOpenInvite(
  workspaceToken: string,
  displayName: string,
  isPro: boolean
): Promise<{
  ok: boolean
  member?: WorkspaceMemberRow
  workspace?: WorkspaceRow
  error?: string
}> {
  const trimmedName = displayName.trim()
  if (!trimmedName) return { ok: false, error: 'Enter your name to join' }

  const workspace = await getWorkspaceByOpenInviteToken(workspaceToken)
  if (!workspace) return { ok: false, error: 'Invite link is invalid or expired' }

  if (!hasAdminClient()) return { ok: false, error: 'Server misconfigured' }

  const admin = createAdminClient()
  const { data: members } = await admin
    .from('workspace_members')
    .select('id, role, status, email')
    .eq('workspace_id', workspace.id)
    .neq('status', 'removed')

  const collaborators = (members ?? []).filter((m) => m.role !== 'owner')
  const limit = maxCollaboratorsForPlan(isPro)
  if (collaborators.length >= limit) {
    return { ok: false, error: 'This workspace has reached its collaborator limit.' }
  }

  const memberToken = generateInviteToken()
  const guestEmail = `guest+${memberToken.slice(0, 16).toLowerCase()}@invite.dreamscale.local`

  const { data, error } = await admin
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      email: guestEmail,
      display_name: trimmedName,
      role: 'member',
      status: 'active',
      invite_token: memberToken,
      joined_at: new Date().toISOString(),
    })
    .select(
      'id, workspace_id, user_id, email, display_name, role, status, invited_at, joined_at, invite_token'
    )
    .single()

  if (error) return { ok: false, error: error.message }

  return {
    ok: true,
    member: data as WorkspaceMemberRow,
    workspace,
  }
}

export async function getOwnerPlanIsPro(ownerId: string): Promise<boolean> {
  if (!hasAdminClient()) return false

  const admin = createAdminClient()
  const { data } = await admin
    .from('user_profiles')
    .select('subscription_tier, subscription_status, subscription_ends_at')
    .eq('id', ownerId)
    .maybeSingle()

  if (!data) return false

  const { isDreamScalePro } = await import('@/lib/subscription')
  return isDreamScalePro(data)
}

export async function acceptInviteByToken(
  token: string,
  displayName?: string
): Promise<{ ok: boolean; details?: InviteDetails; error?: string }> {
  const details = await getInviteByToken(token)
  if (!details) return { ok: false, error: 'Invite not found or expired' }

  const trimmedName = displayName?.trim()
  if (details.member.status !== 'active' && !trimmedName) {
    return { ok: false, error: 'Enter your name to join' }
  }

  if (details.member.status === 'active') {
    return { ok: true, details }
  }

  if (!hasAdminClient()) return { ok: false, error: 'Server misconfigured' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('workspace_members')
    .update({
      status: 'active',
      joined_at: new Date().toISOString(),
      display_name: trimmedName || details.member.display_name,
    })
    .eq('id', details.member.id)
    .eq('invite_token', token.trim())

  if (error) return { ok: false, error: error.message }

  const finalName =
    trimmedName || details.member.display_name || details.member.email.split('@')[0]

  return {
    ok: true,
    details: {
      ...details,
      member: {
        ...details.member,
        status: 'active',
        joined_at: new Date().toISOString(),
        display_name: finalName,
      },
    },
  }
}

export async function ensureMemberInviteToken(
  memberId: string
): Promise<string | null> {
  if (!hasAdminClient()) return null

  const admin = createAdminClient()
  const { data: member } = await admin
    .from('workspace_members')
    .select('id, invite_token, role, status')
    .eq('id', memberId)
    .maybeSingle()

  if (!member || member.role === 'owner' || member.status === 'removed') {
    return null
  }

  if (member.invite_token) return member.invite_token

  const token = generateInviteToken()
  const { error } = await admin
    .from('workspace_members')
    .update({ invite_token: token })
    .eq('id', memberId)

  if (error) {
    if (isMissingInviteTokenColumn(error.message)) return null
    return null
  }

  return token
}

