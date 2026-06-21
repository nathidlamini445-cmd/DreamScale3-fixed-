import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { createGoogleCalendarEvent, getValidGoogleAccessToken } from '@/lib/google/client'
import { isGoogleConfigured } from '@/lib/google/config'
import { getGoogleIntegration } from '@/lib/google/store'

export async function POST(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isGoogleConfigured()) {
    return NextResponse.json(
      { error: 'Google integration is not configured on the server.' },
      { status: 503 }
    )
  }

  const integration = await getGoogleIntegration(proGate.user.id)
  if (!integration) {
    return NextResponse.json(
      { error: 'Connect Google in Settings → Integrations first.', code: 'GOOGLE_NOT_CONNECTED' },
      { status: 400 }
    )
  }

  let body: { title?: string; description?: string; start?: string; end?: string; allDay?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!body.title?.trim() || !body.start) {
    return NextResponse.json({ error: 'Title and start are required.' }, { status: 400 })
  }

  try {
    const accessToken = await getValidGoogleAccessToken(proGate.user.id)
    const result = await createGoogleCalendarEvent(accessToken, {
      title: body.title.trim(),
      description: body.description?.trim(),
      start: body.start,
      end: body.end,
      allDay: body.allDay,
    })
    return NextResponse.json({ success: true, url: result.url, eventId: result.eventId })
  } catch (error) {
    console.error('Google Calendar event error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create calendar event.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

