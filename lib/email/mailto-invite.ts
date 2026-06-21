import 'server-only'

type MailtoInviteParams = {
  to: string
  subject: string
  inviteeName?: string | null
  inviterName: string
  workspaceName: string
  inviteUrl: string
}

export function buildWorkspaceInviteMailtoUrl(params: MailtoInviteParams): string {
  const greeting =
    params.inviteeName?.trim() ||
    params.to.split('@')[0] ||
    'there'

  const body = [
    `Hi ${greeting},`,
    '',
    `${params.inviterName} invited you to join "${params.workspaceName}" on DreamScale.`,
    '',
    'Click this link to accept your invite, enter your name, and join the workspace:',
    params.inviteUrl,
    '',
    'No DreamScale account is required.',
    '',
    'See you there,',
    'DreamScale',
  ].join('\n')

  const query = new URLSearchParams({
    subject: params.subject,
    body,
  })

  return `mailto:${encodeURIComponent(params.to)}?${query.toString()}`
}
