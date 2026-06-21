import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { postSlackMessage } from '@/lib/slack/client'
import { isSlackConfigured } from '@/lib/slack/config'
import { getSlackIntegration } from '@/lib/slack/store'

export async function POST(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isSlackConfigured()) {
    return NextResponse.json({ error: 'Slack is not configured on the server.' }, { status: 503 })
  }

  const integration = await getSlackIntegration(proGate.user.id)
  if (!integration) {
    return NextResponse.json(
      { error: 'Connect Slack in Settings → Integrations first.', code: 'SLACK_NOT_CONNECTED' },
      { status: 400 }
    )
  }

  let body: { message?: string; title?: string; channel?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const text = body.message?.trim() || body.title?.trim()
  if (!text) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }

  const channel = body.channel?.trim() || integration.defaultChannel || '#general'

  try {
    await postSlackMessage(integration.accessToken, channel, text)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Slack notify error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send to Slack.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

