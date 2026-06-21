import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { requireProUser } from '@/lib/billing/require-pro'
import { getGoogleAuthorizeUrl } from '@/lib/google/client'
import { isGoogleConfigured } from '@/lib/google/config'

export async function GET(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  if (!isGoogleConfigured()) {
    return NextResponse.json(
      {
        error:
          'Google integration is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
      },
      { status: 503 }
    )
  }

  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/revenue?tab=dashboard'
  const safeReturn =
    returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/revenue?tab=dashboard'

  const state = randomBytes(24).toString('hex')
  const authorizeUrl = getGoogleAuthorizeUrl(state)

  const response = NextResponse.redirect(authorizeUrl)
  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  response.cookies.set('google_oauth_return', safeReturn, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}
