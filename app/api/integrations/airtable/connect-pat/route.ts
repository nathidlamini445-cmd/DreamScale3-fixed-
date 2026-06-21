import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { validateAirtableAccessToken } from '@/lib/airtable/client'
import { saveAirtableIntegration } from '@/lib/airtable/store'

/** Local dev fallback when Airtable OAuth app is stuck in "development only" mode. */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Personal access token connect is only available in development.' },
      { status: 403 }
    )
  }

  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  let body: { token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  if (!token) {
    return NextResponse.json({ error: 'Paste your Airtable personal access token.' }, { status: 400 })
  }

  const valid = await validateAirtableAccessToken(token)
  if (!valid) {
    return NextResponse.json(
      {
        error:
          'That token did not work. Create one at airtable.com/create/tokens with data.records:write on your base.',
      },
      { status: 400 }
    )
  }

  const saved = await saveAirtableIntegration(proGate.user.id, {
    accessToken: token,
    refreshToken: null,
    expiresAt: null,
    tableName: 'DreamScale Export',
    connectedAt: new Date().toISOString(),
  })

  if (!saved) {
    return NextResponse.json({ error: 'Could not save Airtable connection.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, method: 'pat' })
}
