import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { exchangeGoogleCode } from '@/lib/google/client'
import { saveGoogleIntegration } from '@/lib/google/store'

function redirectWithMessage(path: string, query: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
  const base = site.replace(/\/$/, '')
  const url = new URL(path.startsWith('/') ? path : '/revenue', base)
  url.searchParams.set('google', query)
  return NextResponse.redirect(url.toString())
}

export async function GET(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const storedState = request.cookies.get('google_oauth_state')?.value
  const returnTo = request.cookies.get('google_oauth_return')?.value || '/revenue?tab=dashboard'

  if (!state || !storedState || state !== storedState) {
    return redirectWithMessage(returnTo, 'error')
  }

  if (!code) {
    return redirectWithMessage(returnTo, 'cancelled')
  }

  try {
    const tokens = await exchangeGoogleCode(code)
    const saved = await saveGoogleIntegration(proGate.user.id, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      accountEmail: tokens.accountEmail,
    })

    if (!saved) {
      console.error(
        'Google OAuth callback: failed to save tokens (check user_integrations table and SUPABASE_SERVICE_ROLE_KEY).'
      )
      return redirectWithMessage(returnTo, 'error')
    }

    const success = redirectWithMessage(returnTo, 'connected')
    success.cookies.delete('google_oauth_state')
    success.cookies.delete('google_oauth_return')
    return success
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return redirectWithMessage(returnTo, 'error')
  }
}
