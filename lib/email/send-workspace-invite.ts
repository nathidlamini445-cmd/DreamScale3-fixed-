import 'server-only'

import { createAdminClient, hasAdminClient } from '@/lib/supabase/admin'
import {
  buildWorkspaceInviteEmailHtml,
  workspaceInviteEmailSubject,
} from '@/lib/email/workspace-invite-email'
import { buildWorkspaceInviteMailtoUrl } from '@/lib/email/mailto-invite'
import { isEmailConfigured, sendTransactionalEmail } from '@/lib/email/send-email'
import { buildInviteUrl, resolvePublicAppOrigin } from '@/lib/workspace/invite-token'
import { ensureMemberInviteToken } from '@/lib/workspace/store'

export type SendWorkspaceInviteEmailParams = {
  ownerId: string
  workspaceId: string
  memberId: string
  inviterName: string
  request?: Request
}

export type SendWorkspaceInviteResult = {
  sent: boolean
  inviteUrl?: string
  mailtoUrl?: string
  delivery: 'resend' | 'mailto' | 'none'
  error?: string
}

export async function sendWorkspaceInviteEmail(
  params: SendWorkspaceInviteEmailParams
): Promise<SendWorkspaceInviteResult> {
  if (!hasAdminClient()) {
    return { sent: false, delivery: 'none', error: 'Server misconfigured' }
  }

  const admin = createAdminClient()
  const { data: workspace } = await admin
    .from('dreamscale_workspaces')
    .select('id, name, owner_id')
    .eq('id', params.workspaceId)
    .eq('owner_id', params.ownerId)
    .maybeSingle()

  if (!workspace) {
    return { sent: false, delivery: 'none', error: 'Workspace not found' }
  }

  const { data: member } = await admin
    .from('workspace_members')
    .select('id, email, display_name, role, status')
    .eq('id', params.memberId)
    .eq('workspace_id', params.workspaceId)
    .neq('status', 'removed')
    .maybeSingle()

  if (!member || member.role === 'owner') {
    return { sent: false, delivery: 'none', error: 'Invite not found' }
  }

  const token = await ensureMemberInviteToken(member.id)
  if (!token) {
    return { sent: false, delivery: 'none', error: 'Could not create invite link' }
  }

  const inviteUrl = buildInviteUrl(token, params.request)
  const subject = workspaceInviteEmailSubject(workspace.name)
  const mailtoUrl = buildWorkspaceInviteMailtoUrl({
    to: member.email,
    subject,
    inviteeName: member.display_name,
    inviterName: params.inviterName,
    workspaceName: workspace.name,
    inviteUrl,
  })

  if (!isEmailConfigured()) {
    return {
      sent: false,
      inviteUrl,
      mailtoUrl,
      delivery: 'mailto',
      error: undefined,
    }
  }

  const html = buildWorkspaceInviteEmailHtml({
    inviteeEmail: member.email,
    inviteeName: member.display_name,
    inviterName: params.inviterName,
    workspaceName: workspace.name,
    inviteUrl,
    appOrigin: resolvePublicAppOrigin(params.request),
  })

  const result = await sendTransactionalEmail({
    to: member.email,
    subject,
    html,
  })

  if (!result.sent) {
    console.error('[workspace-invite-email] Resend failed:', result.error)
    return {
      sent: false,
      inviteUrl,
      mailtoUrl,
      delivery: 'mailto',
      error: result.error,
    }
  }

  return { sent: true, inviteUrl, delivery: 'resend' }
}
