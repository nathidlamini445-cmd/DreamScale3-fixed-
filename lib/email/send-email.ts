import 'server-only'

export type SendEmailResult = {
  sent: boolean
  provider?: 'resend'
  error?: string
}

function emailFromAddress(): string {
  return (
    process.env.RESEND_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    'DreamScale <onboarding@resend.dev>'
  )
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return { sent: false, error: 'RESEND_API_KEY is not set' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFromAddress(),
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      return { sent: false, provider: 'resend', error: body || response.statusText }
    }

    return { sent: true, provider: 'resend' }
  } catch (error) {
    return {
      sent: false,
      provider: 'resend',
      error: error instanceof Error ? error.message : 'Resend request failed',
    }
  }
}

export async function sendTransactionalEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<SendEmailResult> {
  const to = params.to.trim()
  if (!to.includes('@')) {
    return { sent: false, error: 'Invalid recipient email' }
  }

  return sendViaResend(to, params.subject, params.html)
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}
