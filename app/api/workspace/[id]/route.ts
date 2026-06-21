import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { deleteWorkspace } from '@/lib/workspace/store'

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: workspaceId } = await context.params
  const result = await deleteWorkspace(auth.user.id, workspaceId)

  if (!result.ok) {
    const status = result.code === 'last_workspace' ? 403 : result.code === 'not_found' ? 404 : 400
    return NextResponse.json({ error: result.error, code: result.code }, { status })
  }

  return NextResponse.json({ ok: true })
}
