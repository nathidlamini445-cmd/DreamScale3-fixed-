import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import {
  generateAirtableOAuthState,
  generateAirtablePkce,
  getAirtableAuthorizeUrl,
} from '@/lib/airtable/client'
import {
  buildAirtableRedirectUri,
  isAirtableConfigured,
  resolveAirtableOAuthOrigin,
} from '@/lib/airtable/config'

export async function GET(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isAirtableConfigured()) {
    return NextResponse.json(
      {
        error:
          'Airtable integration is not configured. Add AIRTABLE_CLIENT_ID and AIRTABLE_CLIENT_SECRET.',
      },
      { status: 503 }
    )
  }

  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/dashboard?section=integrations'
  const safeReturn =
    returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/dashboard?section=integrations'

  const redirectUri = buildAirtableRedirectUri(resolveAirtableOAuthOrigin(request))
  const state = generateAirtableOAuthState()
  const { verifier, challenge } = generateAirtablePkce()
  const authorizeUrl = getAirtableAuthorizeUrl(state, challenge, redirectUri)

  const response = NextResponse.redirect(authorizeUrl)
  response.cookies.set('airtable_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  response.cookies.set('airtable_oauth_return', safeReturn, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  response.cookies.set('airtable_pkce_verifier', verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  response.cookies.set('airtable_oauth_redirect', redirectUri, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}

