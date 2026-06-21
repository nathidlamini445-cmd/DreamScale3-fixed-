export const GOOGLE_INTEGRATION_SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ')



/** @deprecated Use GOOGLE_INTEGRATION_SCOPES */

export const GOOGLE_DOCS_SCOPES = GOOGLE_INTEGRATION_SCOPES



export function getGoogleRedirectUri(): string {

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  const base = site || 'http://localhost:3000'

  return `${base.replace(/\/$/, '')}/api/integrations/google/callback`

}



export function getGoogleClientId(): string | null {

  const id = process.env.GOOGLE_CLIENT_ID?.trim()

  return id || null

}



export function getGoogleClientSecret(): string | null {

  const secret = process.env.GOOGLE_CLIENT_SECRET?.trim()

  return secret || null

}



export function isGoogleConfigured(): boolean {

  return !!(getGoogleClientId() && getGoogleClientSecret())

}


