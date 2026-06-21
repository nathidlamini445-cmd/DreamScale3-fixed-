import { NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { clearGoogleIntegration } from '@/lib/google/store'

export async function POST() {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  const ok = await clearGoogleIntegration(proGate.user.id)
  if (!ok) {
    return NextResponse.json({ error: 'Failed to disconnect Google.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
