import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { updateAirtableTarget } from '@/lib/airtable/store'

export async function POST(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  let body: { baseId?: string; tableName?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!body.baseId?.trim()) {
    return NextResponse.json({ error: 'baseId is required.' }, { status: 400 })
  }

  const ok = await updateAirtableTarget(
    proGate.user.id,
    body.baseId,
    body.tableName?.trim() || 'DreamScale Export'
  )
  if (!ok) {
    return NextResponse.json({ error: 'Failed to save Airtable settings.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    baseId: body.baseId.trim(),
    tableName: body.tableName?.trim() || 'DreamScale Export',
  })
}

