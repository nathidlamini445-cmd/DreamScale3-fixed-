import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { updateSlackDefaultChannel } from '@/lib/slack/store'

export async function POST(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  let body: { defaultChannel?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!body.defaultChannel?.trim()) {
    return NextResponse.json({ error: 'defaultChannel is required.' }, { status: 400 })
  }

  const ok = await updateSlackDefaultChannel(proGate.user.id, body.defaultChannel)
  if (!ok) {
    return NextResponse.json({ error: 'Failed to save Slack settings.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, defaultChannel: body.defaultChannel.trim() })
}

