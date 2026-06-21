import { NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { clearNotionIntegration } from '@/lib/notion/store'

export async function POST() {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  const ok = await clearNotionIntegration(proGate.user.id)
  if (!ok) {
    return NextResponse.json({ error: 'Failed to disconnect Notion.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
