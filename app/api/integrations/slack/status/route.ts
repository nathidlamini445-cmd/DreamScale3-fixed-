import { NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { getSlackRedirectUri, isSlackConfigured } from '@/lib/slack/config'
import { getSlackIntegration } from '@/lib/slack/store'

export async function GET() {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isSlackConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      teamName: null,
      defaultChannel: null,
      redirectUri: getSlackRedirectUri(),
    })
  }

  const integration = await getSlackIntegration(proGate.user.id)

  return NextResponse.json({
    configured: true,
    connected: !!integration,
    teamName: integration?.teamName ?? null,
    defaultChannel: integration?.defaultChannel ?? null,
    redirectUri: getSlackRedirectUri(),
  })
}

