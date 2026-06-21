import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { exchangeSlackCode } from '@/lib/slack/client'
import { saveSlackIntegration } from '@/lib/slack/store'

function redirectWithMessage(path: string, query: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
  const base = site.replace(/\/$/, '')
  const url = new URL(path.startsWith('/') ? path : '/dashboard', base)
  url.searchParams.set('slack', query)
  return NextResponse.redirect(url.toString())
}

export async function GET(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const storedState = request.cookies.get('slack_oauth_state')?.value
  const returnTo = request.cookies.get('slack_oauth_return')?.value || '/dashboard?section=integrations'

  if (!state || !storedState || state !== storedState) {
    return redirectWithMessage(returnTo, 'error')
  }

  if (!code) {
    return redirectWithMessage(returnTo, 'cancelled')
  }

  try {
    const tokens = await exchangeSlackCode(code)
    const saved = await saveSlackIntegration(proGate.user.id, {
      accessToken: tokens.accessToken,
      teamId: tokens.teamId,
      teamName: tokens.teamName,
      defaultChannel: '#general',
    })

    if (!saved) {
      return redirectWithMessage(returnTo, 'error')
    }

    const success = redirectWithMessage(returnTo, 'connected')
    success.cookies.delete('slack_oauth_state')
    success.cookies.delete('slack_oauth_return')
    return success
  } catch (error) {
    console.error('Slack OAuth callback error:', error)
    return redirectWithMessage(returnTo, 'error')
  }
}

