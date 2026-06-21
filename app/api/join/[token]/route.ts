import { NextResponse } from 'next/server'
import {
  getOwnerPlanIsPro,
  getWorkspaceByOpenInviteToken,
  joinWorkspaceOpenInvite,
} from '@/lib/workspace/store'

type RouteContext = { params: Promise<{ token: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params
  const workspace = await getWorkspaceByOpenInviteToken(token)

  if (!workspace) {
    return NextResponse.json({ error: 'Invite link is invalid or expired' }, { status: 404 })
  }

  return NextResponse.json({
    workspaceId: workspace.id,
    workspaceName: workspace.name,
  })
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params

  let body: { displayName?: string } = {}
  try {
    body = (await request.json()) as { displayName?: string }
  } catch {
    body = {}
  }

  const workspace = await getWorkspaceByOpenInviteToken(token)
  if (!workspace) {
    return NextResponse.json({ error: 'Invite link is invalid or expired' }, { status: 404 })
  }

  const isPro = await getOwnerPlanIsPro(workspace.owner_id)
  const result = await joinWorkspaceOpenInvite(
    token,
    typeof body.displayName === 'string' ? body.displayName : '',
    isPro
  )

  if (!result.ok || !result.member || !result.workspace) {
    return NextResponse.json(
      { error: result.error ?? 'Could not join workspace' },
      { status: 400 }
    )
  }

  const { member, workspace: joinedWorkspace } = result

  return NextResponse.json({
    ok: true,
    workspaceId: joinedWorkspace.id,
    workspaceName: joinedWorkspace.name,
    email: member.email,
    displayName: member.display_name || member.email.split('@')[0],
    inviteToken: member.invite_token,
    status: member.status,
  })
}
