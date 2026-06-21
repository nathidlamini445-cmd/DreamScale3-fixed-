import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import {
  exportRowsToAirtable,
  getValidAirtableAccessToken,
  integrationHasTarget,
} from '@/lib/airtable/client'
import { isAirtableConfigured } from '@/lib/airtable/config'
import { getAirtableIntegration } from '@/lib/airtable/store'

export async function POST(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isAirtableConfigured()) {
    return NextResponse.json({ error: 'Airtable is not configured on the server.' }, { status: 503 })
  }

  const integration = await getAirtableIntegration(proGate.user.id)
  if (!integration) {
    return NextResponse.json(
      { error: 'Connect Airtable in Settings → Integrations first.', code: 'AIRTABLE_NOT_CONNECTED' },
      { status: 400 }
    )
  }

  let body: {
    rows?: string[][]
    baseId?: string
    tableName?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const baseId = body.baseId?.trim() || integration.baseId
  const tableName = body.tableName?.trim() || integration.tableName

  if (!baseId || !tableName) {
    return NextResponse.json(
      {
        error: 'Set your Airtable Base ID and table name in Settings → Integrations.',
        code: 'AIRTABLE_TARGET_MISSING',
      },
      { status: 400 }
    )
  }

  if (!body.rows?.length) {
    return NextResponse.json({ error: 'rows are required.' }, { status: 400 })
  }

  try {
    const accessToken = await getValidAirtableAccessToken(proGate.user.id)
    const result = await exportRowsToAirtable(accessToken, baseId, tableName, body.rows)
    return NextResponse.json({
      success: true,
      count: result.count,
      url: `https://airtable.com/${baseId}`,
    })
  } catch (error) {
    console.error('Airtable export error:', error)
    const message = error instanceof Error ? error.message : 'Failed to export to Airtable.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

