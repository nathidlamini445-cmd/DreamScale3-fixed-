/** Must match scopes enabled on your integration at airtable.com/create/oauth */
export const AIRTABLE_SCOPES = 'data.records:write'

export const AIRTABLE_CALLBACK_PATH = '/api/integrations/airtable/callback'

export function normalizeOAuthOrigin(origin: string): string {
  try {
    const url = new URL(origin)
    // Dev server runs with -H 0.0.0.0; Airtable only accepts localhost / 127.0.0.1, not 0.0.0.0.
    if (url.hostname === '0.0.0.0') {
      url.hostname = 'localhost'
    }
    return url.origin
  } catch {
    const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
    return site ? normalizeOAuthOrigin(site) : 'http://localhost:3000'
  }
}

export function resolveAirtableOAuthOrigin(request: {
  nextUrl: URL
  headers: { get(name: string): string | null }
}): string {
  if (process.env.NODE_ENV === 'development') {
    const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
    if (site) return normalizeOAuthOrigin(site)
  }

  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (host) {
    return normalizeOAuthOrigin(`${request.nextUrl.protocol}//${host}`)
  }

  return normalizeOAuthOrigin(request.nextUrl.origin)
}

export function buildAirtableRedirectUri(origin: string): string {
  return `${normalizeOAuthOrigin(origin)}${AIRTABLE_CALLBACK_PATH}`
}

export function getAirtableRedirectUri(): string {
  const override = process.env.AIRTABLE_REDIRECT_URI?.trim()
  if (override) return override

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const base = site || 'http://localhost:3000'
  return buildAirtableRedirectUri(base)
}

/** Register every URI here in Airtable OAuth settings (dev often needs both). */
export function getAirtableRedirectUrisForSetup(): string[] {
  const uris = new Set<string>()
  uris.add(getAirtableRedirectUri())
  uris.add(buildAirtableRedirectUri('http://localhost:3000'))
  uris.add(buildAirtableRedirectUri('http://127.0.0.1:3000'))
  return [...uris]
}

export function getAirtableClientId(): string | null {
  const id = process.env.AIRTABLE_CLIENT_ID?.trim()
  return id || null
}

export function getAirtableClientSecret(): string | null {
  const secret = process.env.AIRTABLE_CLIENT_SECRET?.trim()
  return secret || null
}

export function isAirtableConfigured(): boolean {
  return !!(getAirtableClientId() && getAirtableClientSecret())
}
