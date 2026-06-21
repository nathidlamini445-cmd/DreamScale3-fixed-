import { NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { getGoogleRedirectUri, isGoogleConfigured } from '@/lib/google/config'
import { getGoogleIntegration } from '@/lib/google/store'

export async function GET() {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isGoogleConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      accountEmail: null,
      redirectUri: getGoogleRedirectUri(),
    })
  }

  const integration = await getGoogleIntegration(proGate.user.id)

  return NextResponse.json({
    configured: true,
    connected: !!integration,
    accountEmail: integration?.accountEmail ?? null,
    redirectUri: getGoogleRedirectUri(),
  })
}
