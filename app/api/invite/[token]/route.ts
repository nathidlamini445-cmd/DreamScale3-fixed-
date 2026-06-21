import { NextResponse } from 'next/server'
import { buildInviteUrl } from '@/lib/workspace/invite-token'
import { acceptInviteByToken, getInviteByToken } from '@/lib/workspace/store'

type RouteContext = { params: Promise<{ token: string }> }

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params
  const details = await getInviteByToken(token)

  if (!details) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  return NextResponse.json({
    workspaceId: details.workspace.id,
    workspaceName: details.workspace.name,
    email: details.member.email,
    displayName: details.member.display_name,
    status: details.member.status,
    inviteUrl: buildInviteUrl(token, request),
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

  const result = await acceptInviteByToken(
    token,
    typeof body.displayName === 'string' ? body.displayName : undefined
  )

  if (!result.ok || !result.details) {
    return NextResponse.json(
      { error: result.error ?? 'Could not accept invite' },
      { status: 404 }
    )
  }

  const { member, workspace } = result.details

  return NextResponse.json({
    ok: true,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    email: member.email,
    displayName: member.display_name || member.email.split('@')[0],
    status: member.status,
  })
}
