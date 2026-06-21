import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { getProfileSubscriptionForUser } from '@/lib/billing/get-profile-subscription'
import { isDreamScalePro } from '@/lib/subscription'
import { inviteToWorkspace } from '@/lib/workspace/store'
import { sendWorkspaceInviteEmail } from '@/lib/email/send-workspace-invite'

type RouteContext = { params: Promise<{ id: string }> }

function inviterDisplayName(
  profile: { user_name?: string | null } | null,
  authUser: { fullName?: string | null; primaryEmailAddress?: { emailAddress?: string } | null }
): string {
  const fromProfile =
    typeof profile?.user_name === 'string' && profile.user_name.trim()
      ? profile.user_name.trim()
      : null
  return (
    fromProfile ||
    authUser.fullName?.trim() ||
    authUser.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'A DreamScale user'
  )
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: workspaceId } = await context.params

  let body: { email?: string; displayName?: string } = {}
  try {
    body = (await request.json()) as { email?: string; displayName?: string }
  } catch {
    body = {}
  }

  const { profile, alreadyPro } = await getProfileSubscriptionForUser(auth.user.id)
  const isPro = isDreamScalePro(profile) || alreadyPro

  const result = await inviteToWorkspace(
    auth.user.id,
    workspaceId,
    {
      email: typeof body.email === 'string' ? body.email : '',
      displayName: typeof body.displayName === 'string' ? body.displayName : undefined,
    },
    isPro
  )

  if (result.error) {
    const status =
      result.code === 'member_limit' ? 403 : result.code === 'not_found' ? 404 : 400
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status }
    )
  }

  const memberId = result.member?.id
  if (!memberId) {
    return NextResponse.json({ error: 'Invite could not be created' }, { status: 500 })
  }

  const emailResult = await sendWorkspaceInviteEmail({
    ownerId: auth.user.id,
    workspaceId,
    memberId,
    inviterName: inviterDisplayName(profile, auth.user),
    request,
  })

  return NextResponse.json({
    member: result.member,
    inviteUrl: emailResult.inviteUrl ?? null,
    mailtoUrl: emailResult.mailtoUrl ?? null,
    emailSent: emailResult.sent,
    delivery: emailResult.delivery,
    emailError: emailResult.error,
    message: emailResult.sent
      ? 'Invite email sent'
      : emailResult.delivery === 'mailto'
        ? 'Invite ready — send from your email app'
        : emailResult.error ?? 'Invite created. Copy the link below.',
  })
}
