import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { getProfileSubscriptionForUser } from '@/lib/billing/get-profile-subscription'
import { sendWorkspaceInviteEmail } from '@/lib/email/send-workspace-invite'

type RouteContext = { params: Promise<{ id: string; memberId: string }> }

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

  const { id: workspaceId, memberId } = await context.params
  const { profile } = await getProfileSubscriptionForUser(auth.user.id)

  const result = await sendWorkspaceInviteEmail({
    ownerId: auth.user.id,
    workspaceId,
    memberId,
    inviterName: inviterDisplayName(profile, auth.user),
    request,
  })

  if (!result.sent) {
    return NextResponse.json(
      {
        emailSent: false,
        inviteUrl: result.inviteUrl ?? null,
        mailtoUrl: result.mailtoUrl ?? null,
        delivery: result.delivery,
        error: result.error,
        message:
          result.delivery === 'mailto'
            ? 'Open your email app to resend the invite'
            : result.error ?? 'Could not send invite email',
      },
      { status: result.inviteUrl || result.mailtoUrl ? 200 : 400 }
    )
  }

  return NextResponse.json({
    emailSent: true,
    inviteUrl: result.inviteUrl ?? null,
    delivery: result.delivery,
    message: 'Invite email resent',
  })
}
