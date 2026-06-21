import { NextRequest, NextResponse } from 'next/server'
import { requireProUser } from '@/lib/billing/require-pro'
import { exchangeNotionCode } from '@/lib/notion/client'
import { saveNotionIntegration } from '@/lib/notion/store'

function redirectWithMessage(path: string, query: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
  const base = site.replace(/\/$/, '')
  const url = new URL(path.startsWith('/') ? path : '/revenue', base)
  url.searchParams.set('notion', query)
  return NextResponse.redirect(url.toString())
}

export async function GET(request: NextRequest) {
  const proGate = await requireProUser()
  if (proGate.error) return proGate.error

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const storedState = request.cookies.get('notion_oauth_state')?.value
  const returnTo = request.cookies.get('notion_oauth_return')?.value || '/revenue?tab=dashboard'

  if (!state || !storedState || state !== storedState) {
    return redirectWithMessage(returnTo, 'error')
  }

  if (!code) {
    return redirectWithMessage(returnTo, 'cancelled')
  }

  try {
    const token = await exchangeNotionCode(code)
    await saveNotionIntegration(proGate.user.id, {
      accessToken: token.access_token,
      workspaceId: token.workspace_id ?? null,
      workspaceName: token.workspace_name ?? null,
      botId: token.bot_id ?? null,
    })

    const success = redirectWithMessage(returnTo, 'connected')
    success.cookies.delete('notion_oauth_state')
    success.cookies.delete('notion_oauth_return')
    return success
  } catch (error) {
    console.error('Notion OAuth callback error:', error)
    return redirectWithMessage(returnTo, 'error')
  }
}
