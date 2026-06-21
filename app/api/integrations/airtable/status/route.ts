import { NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import {
  getAirtableRedirectUri,
  getAirtableRedirectUrisForSetup,
  isAirtableConfigured,
} from '@/lib/airtable/config'
import { getAirtableIntegration } from '@/lib/airtable/store'

export async function GET() {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isAirtableConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      baseId: null,
      tableName: null,
      redirectUri: getAirtableRedirectUri(),
      redirectUris: getAirtableRedirectUrisForSetup(),
    })
  }

  const integration = await getAirtableIntegration(proGate.user.id)

  return NextResponse.json({
    configured: true,
    connected: !!integration,
    connectionMethod: integration?.refreshToken ? 'oauth' : integration ? 'pat' : null,
    baseId: integration?.baseId ?? null,
    tableName: integration?.tableName ?? null,
    redirectUri: getAirtableRedirectUri(),
    redirectUris: getAirtableRedirectUrisForSetup(),
    oauthBlockedHint:
      'If OAuth shows "outside of development", sign into the same Airtable account that created the app, or add Support email + Privacy + Terms URLs in airtable.com/create/oauth. On localhost you can use a Personal Access Token instead.',
  })
}

