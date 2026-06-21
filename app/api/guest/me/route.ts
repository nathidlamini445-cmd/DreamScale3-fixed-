import { NextResponse } from 'next/server'
import {
  getInviteByToken,
  isGuestInviteEmail,
  listActiveWorkspaceMembers,
  updateGuestMemberByToken,
} from '@/lib/workspace/store'
import { workspaceRoleLabel } from '@/lib/workspace/roles'

export async function POST(request: Request) {
  let body: { inviteToken?: string } = {}
  try {
    body = (await request.json()) as { inviteToken?: string }
  } catch {
    body = {}
  }

  const token = typeof body.inviteToken === 'string' ? body.inviteToken.trim() : ''
  if (!token) {
    return NextResponse.json({ error: 'Missing invite token' }, { status: 400 })
  }

  const details = await getInviteByToken(token)
  if (!details || details.member.status === 'removed') {
    return NextResponse.json({ error: 'Guest session not found' }, { status: 404 })
  }

  const teammates = await listActiveWorkspaceMembers(details.workspace.id)

  return NextResponse.json({
    memberId: details.member.id,
    workspaceId: details.workspace.id,
    workspaceName: details.workspace.name,
    displayName:
      details.member.display_name ||
      (isGuestInviteEmail(details.member.email)
        ? 'Guest'
        : details.member.email.split('@')[0]),
    email: isGuestInviteEmail(details.member.email) ? null : details.member.email,
    status: details.member.status,
    role: details.member.role,
    roleLabel: workspaceRoleLabel(details.member.role),
    joinedAt: details.member.joined_at,
    teammates: teammates.map((m) => ({
      id: m.id,
      displayName:
        m.display_name ||
        (m.role === 'owner'
          ? 'Owner'
          : isGuestInviteEmail(m.email)
            ? 'Guest'
            : m.email.split('@')[0]),
      role: m.role,
      roleLabel: workspaceRoleLabel(m.role),
      joinedAt: m.joined_at,
    })),
  })
}

export async function PATCH(request: Request) {
  let body: { inviteToken?: string; displayName?: string } = {}
  try {
    body = (await request.json()) as { inviteToken?: string; displayName?: string }
  } catch {
    body = {}
  }

  const token = typeof body.inviteToken === 'string' ? body.inviteToken.trim() : ''
  const displayName = typeof body.displayName === 'string' ? body.displayName : ''

  if (!token) {
    return NextResponse.json({ error: 'Missing invite token' }, { status: 400 })
  }

  const result = await updateGuestMemberByToken(token, displayName)
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Could not update name' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, displayName: result.displayName })
}
