import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { exchangeAirtableCode } from '@/lib/airtable/client'
import { getAirtableRedirectUri } from '@/lib/airtable/config'
import { saveAirtableIntegration } from '@/lib/airtable/store'

function redirectWithMessage(path: string, query: string, reason?: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
  const base = site.replace(/\/$/, '')
  const url = new URL(path.startsWith('/') ? path : '/dashboard', base)
  url.searchParams.set('airtable', query)
  if (reason) url.searchParams.set('airtable_reason', reason)
  return NextResponse.redirect(url.toString())
}

export async function GET(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const storedState = request.cookies.get('airtable_oauth_state')?.value
  const verifier = request.cookies.get('airtable_pkce_verifier')?.value
  const returnTo = request.cookies.get('airtable_oauth_return')?.value || '/dashboard?section=integrations'
  const redirectUri =
    request.cookies.get('airtable_oauth_redirect')?.value || getAirtableRedirectUri()

  const oauthError = request.nextUrl.searchParams.get('error')
  const oauthErrorDescription = request.nextUrl.searchParams.get('error_description')

  if (oauthError) {
    console.error(
      '[Airtable OAuth] authorization failed:',
      oauthError,
      oauthErrorDescription ?? ''
    )
    const reason =
      oauthError === 'access_denied' &&
      oauthErrorDescription?.toLowerCase().includes('outside of development')
        ? 'development'
        : oauthError
    return redirectWithMessage(returnTo, 'error', reason)
  }

  if (!state || !storedState || state !== storedState || !verifier) {
    return redirectWithMessage(returnTo, 'error')
  }

  if (!code) {
    return redirectWithMessage(returnTo, 'cancelled')
  }

  try {
    const tokens = await exchangeAirtableCode(code, verifier, redirectUri)
    const saved = await saveAirtableIntegration(proGate.user.id, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      tableName: 'DreamScale Export',
    })

    if (!saved) {
      return redirectWithMessage(returnTo, 'error')
    }

    const success = redirectWithMessage(returnTo, 'connected')
    success.cookies.delete('airtable_oauth_state')
    success.cookies.delete('airtable_oauth_return')
    success.cookies.delete('airtable_pkce_verifier')
    success.cookies.delete('airtable_oauth_redirect')
    return success
  } catch (error) {
    console.error('Airtable OAuth callback error:', error)
    return redirectWithMessage(returnTo, 'error')
  }
}

