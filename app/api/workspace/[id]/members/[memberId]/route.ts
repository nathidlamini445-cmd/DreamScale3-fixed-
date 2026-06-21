import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { removeWorkspaceMember, updateWorkspaceMember } from '@/lib/workspace/store'
import { isCollaboratorRole } from '@/lib/workspace/roles'

type RouteContext = { params: Promise<{ id: string; memberId: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: workspaceId, memberId } = await context.params

  let body: { displayName?: string; role?: string } = {}
  try {
    body = (await request.json()) as { displayName?: string; role?: string }
  } catch {
    body = {}
  }

  const role =
    typeof body.role === 'string' && isCollaboratorRole(body.role) ? body.role : undefined

  const result = await updateWorkspaceMember(auth.user.id, workspaceId, memberId, {
    displayName: typeof body.displayName === 'string' ? body.displayName : undefined,
    role,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Could not update member' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, member: result.member })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: workspaceId, memberId } = await context.params

  const result = await removeWorkspaceMember(auth.user.id, workspaceId, memberId)
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Could not remove member' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
