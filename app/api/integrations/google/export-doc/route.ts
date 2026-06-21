import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { createGoogleDoc, getValidGoogleAccessToken } from '@/lib/google/client'
import { isGoogleConfigured } from '@/lib/google/config'
import { getGoogleIntegration } from '@/lib/google/store'
import type { BusinessSystem } from '@/components/systems/SystemBuilder'
import { formatSystemForExport } from '@/lib/systems/format-system-for-export'

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
      {
        error: 'Connect Google in Settings → Integrations first.',
        code: 'GOOGLE_NOT_CONNECTED',
      },
      { status: 400 }
    )
  }

  let body: {
    title?: string
    content?: string
    system?: BusinessSystem
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  let title = body.title?.trim()
  let content = body.content?.trim()

  if (body.system?.name) {
    const system: BusinessSystem = {
      ...body.system,
      lastAnalyzed:
        typeof body.system.lastAnalyzed === 'string'
          ? new Date(body.system.lastAnalyzed)
          : body.system.lastAnalyzed,
    }
    title = title || system.name
    content = content || formatSystemForExport(system)
  }

  if (!title || !content) {
    return NextResponse.json(
      { error: 'Title and content (or system) are required.' },
      { status: 400 }
    )
  }

  try {
    const accessToken = await getValidGoogleAccessToken(proGate.user.id)
    const result = await createGoogleDoc(accessToken, title, content)
    return NextResponse.json({
      success: true,
      url: result.url,
      documentId: result.documentId,
    })
  } catch (error) {
    console.error('Google Docs export error:', error)
    const message = error instanceof Error ? error.message : 'Failed to export to Google Docs.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
