import { NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { clearSlackIntegration } from '@/lib/slack/store'

export async function POST() {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  const ok = await clearSlackIntegration(proGate.user.id)
  if (!ok) {
    return NextResponse.json({ error: 'Failed to disconnect Slack.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

