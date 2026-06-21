import { NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { clearAirtableIntegration } from '@/lib/airtable/store'

export async function POST() {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  const ok = await clearAirtableIntegration(proGate.user.id)
  if (!ok) {
    return NextResponse.json({ error: 'Failed to disconnect Airtable.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

