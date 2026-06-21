import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { getNotionClientId, getNotionRedirectUri, isNotionConfigured } from '@/lib/notion/config'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isNotionConfigured()) {
    return NextResponse.json(
      { error: 'Notion integration is not configured. Add NOTION_CLIENT_ID and NOTION_CLIENT_SECRET.' },
      { status: 503 }
    )
  }

  const clientId = getNotionClientId()!
  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/revenue?tab=dashboard'
  const safeReturn =
    returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/revenue?tab=dashboard'

  const state = randomBytes(24).toString('hex')
  const authorizeUrl = new URL('https://api.notion.com/v1/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('owner', 'user')
  authorizeUrl.searchParams.set('redirect_uri', getNotionRedirectUri())
  authorizeUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(authorizeUrl.toString())
  response.cookies.set('notion_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  response.cookies.set('notion_oauth_return', safeReturn, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}
