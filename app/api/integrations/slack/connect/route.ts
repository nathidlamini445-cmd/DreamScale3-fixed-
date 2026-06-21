import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { requireProUser } from '@/lib/billing/require-pro'
import { getSlackAuthorizeUrl } from '@/lib/slack/client'
import { isSlackConfigured } from '@/lib/slack/config'

export async function GET(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isSlackConfigured()) {
    return NextResponse.json(
      { error: 'Slack integration is not configured. Add SLACK_CLIENT_ID and SLACK_CLIENT_SECRET.' },
      { status: 503 }
    )
  }

  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/dashboard?section=integrations'
  const safeReturn =
    returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/dashboard?section=integrations'

  const state = randomBytes(24).toString('hex')
  const authorizeUrl = getSlackAuthorizeUrl(state)

  const response = NextResponse.redirect(authorizeUrl)
  response.cookies.set('slack_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  response.cookies.set('slack_oauth_return', safeReturn, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}

