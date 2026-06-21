import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth-guard'
import { getProfileSubscriptionForUser } from '@/lib/billing/get-profile-subscription'
import { isDreamScalePro } from '@/lib/subscription'
import {
  maxCollaboratorsForPlan,
  maxWorkspacesForPlan,
} from '@/lib/workspace/limits'
import { hasAdminClient } from '@/lib/supabase/admin'
import {
  createWorkspace,
  ensureDefaultWorkspace,
  ensureMemberInviteToken,
  ensureWorkspaceInviteToken,
  listWorkspacesForOwner,
} from '@/lib/workspace/store'
import { buildInviteUrl, buildWorkspaceJoinUrl } from '@/lib/workspace/invite-token'

async function defaultWorkspaceName(userId: string): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return 'My workspace'

  const supabase = createClient(url, key)
  const { data } = await supabase
    .from('user_profiles')
    .select('user_name, email')
    .eq('id', userId)
    .maybeSingle()

  const fromProfile =
    typeof data?.user_name === 'string' && data.user_name.trim()
      ? data.user_name.trim()
      : null

  return fromProfile || 'My workspace'
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    if (!hasAdminClient()) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing Supabase service role key.' },
        { status: 500 }
      )
    }

    const { profile, alreadyPro } = await getProfileSubscriptionForUser(auth.user.id)
    const isPro = isDreamScalePro(profile) || alreadyPro

    const name = await defaultWorkspaceName(auth.user.id)
    await ensureDefaultWorkspace(auth.user.id, name, auth.user.email ?? null)

    const workspaces = await listWorkspacesForOwner(auth.user.id)

    const enriched = await Promise.all(
      workspaces.map(async (ws) => {
        const workspaceToken =
          ws.invite_token ?? (await ensureWorkspaceInviteToken(ws.id))
        return {
          ...ws,
          joinUrl: workspaceToken ? buildWorkspaceJoinUrl(workspaceToken, request) : null,
          members: await Promise.all(
            ws.members.map(async (m) => {
              if (m.role === 'owner') return { ...m, inviteUrl: null }
              const token =
                m.invite_token ?? (await ensureMemberInviteToken(m.id))
              return {
                ...m,
                inviteUrl: token ? buildInviteUrl(token, request) : null,
              }
            })
          ),
        }
      })
    )

    return NextResponse.json({
      isPro,
      limits: {
        maxWorkspaces: maxWorkspacesForPlan(isPro),
        maxCollaborators: maxCollaboratorsForPlan(isPro),
      },
      workspaces: enriched,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Workspace load failed'
    console.error('[workspace] GET failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  let body: { name?: string } = {}
  try {
    body = (await request.json()) as { name?: string }
  } catch {
    body = {}
  }

  const { profile, alreadyPro } = await getProfileSubscriptionForUser(auth.user.id)
  const isPro = isDreamScalePro(profile) || alreadyPro

  const result = await createWorkspace(
    auth.user.id,
    typeof body.name === 'string' ? body.name : '',
    isPro,
    auth.user.email ?? null
  )

  if (result.error) {
    const status = result.code === 'workspace_limit' ? 403 : 400
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status }
    )
  }

  return NextResponse.json({ workspace: result.workspace })
}
