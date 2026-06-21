import 'server-only'

import {
  getSlackClientId,
  getSlackClientSecret,
  getSlackRedirectUri,
  SLACK_SCOPES,
} from './config'

type SlackOAuthResponse = {
  ok: boolean
  access_token?: string
  team?: { id: string; name: string }
  error?: string
}

export function getSlackAuthorizeUrl(state: string): string {
  const clientId = getSlackClientId()
  if (!clientId) throw new Error('Slack integration is not configured.')

  const url = new URL('https://slack.com/oauth/v2/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('scope', SLACK_SCOPES)
  url.searchParams.set('redirect_uri', getSlackRedirectUri())
  url.searchParams.set('state', state)
  return url.toString()
}

export async function exchangeSlackCode(code: string): Promise<{
  accessToken: string
  teamId: string | null
  teamName: string | null
}> {
  const clientId = getSlackClientId()
  const clientSecret = getSlackClientSecret()
  if (!clientId || !clientSecret) {
    throw new Error('Slack integration is not configured on the server.')
  }

  const res = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: getSlackRedirectUri(),
    }),
  })

  const data = (await res.json().catch(() => ({}))) as SlackOAuthResponse
  if (!data.ok || !data.access_token) {
    throw new Error(data.error || 'Failed to connect Slack.')
  }

  return {
    accessToken: data.access_token,
    teamId: data.team?.id ?? null,
    teamName: data.team?.name ?? null,
  }
}

export async function postSlackMessage(
  accessToken: string,
  channel: string,
  text: string
): Promise<{ ok: boolean; ts?: string }> {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: channel.startsWith('#') || channel.startsWith('C') ? channel : `#${channel}`,
      text: text.slice(0, 4000),
      unfurl_links: false,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!data.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Failed to post to Slack.')
  }

  return { ok: true, ts: data.ts }
}

