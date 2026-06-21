export function getNotionRedirectUri(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const base = site || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/api/integrations/notion/callback`
}

export function getNotionClientId(): string | null {
  const id = process.env.NOTION_CLIENT_ID?.trim()
  return id || null
}

export function getNotionClientSecret(): string | null {
  const secret = process.env.NOTION_CLIENT_SECRET?.trim()
  return secret || null
}

export function isNotionConfigured(): boolean {
  return !!(getNotionClientId() && getNotionClientSecret())
}
