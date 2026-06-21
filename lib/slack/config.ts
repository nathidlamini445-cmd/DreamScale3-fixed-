export const SLACK_SCOPES = ['chat:write', 'channels:read'].join(',')

export function getSlackRedirectUri(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const base = site || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/api/integrations/slack/callback`
}

export function getSlackClientId(): string | null {
  const id = process.env.SLACK_CLIENT_ID?.trim()
  return id || null
}

export function getSlackClientSecret(): string | null {
  const secret = process.env.SLACK_CLIENT_SECRET?.trim()
  return secret || null
}

export function isSlackConfigured(): boolean {
  return !!(getSlackClientId() && getSlackClientSecret())
}
