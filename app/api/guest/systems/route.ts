import { NextResponse } from 'next/server'
import { createAdminClient, hasAdminClient } from '@/lib/supabase/admin'
import { resolveGuestInvite } from '@/lib/workspace/guest-invite'

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

  const invite = await resolveGuestInvite(token)
  if (!invite) {
    return NextResponse.json({ error: 'Guest session not found' }, { status: 404 })
  }

  if (!hasAdminClient()) {
    return NextResponse.json({ systems: [], savedSOPs: [] })
  }

  const admin = createAdminClient()
  const ownerId = invite.workspace.owner_id

  const { data, error } = await admin
    .from('systems_data')
    .select('systems, saved_sops')
    .eq('user_id', ownerId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Could not load systems' }, { status: 500 })
  }

  return NextResponse.json({
    systems: data?.systems ?? [],
    savedSOPs: data?.saved_sops ?? [],
    workspaceName: invite.workspace.name,
  })
}
