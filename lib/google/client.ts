import 'server-only'

import {
  getGoogleClientId,
  getGoogleClientSecret,
  getGoogleRedirectUri,
  GOOGLE_INTEGRATION_SCOPES,
} from './config'
import { normalizeSheetRows } from './sheet-cell'
import type { SheetTab } from './sheet-types'
import {
  clearGoogleIntegration,
  getGoogleIntegration,
  saveGoogleIntegration,
} from './store'

type TokenResponse = {
  access_token: string
  expires_in?: number
  refresh_token?: string
  token_type?: string
  scope?: string
}

export async function exchangeGoogleCode(code: string): Promise<{
  accessToken: string
  refreshToken: string | null
  expiresAt: string | null
  accountEmail: string | null
}> {
  const clientId = getGoogleClientId()
  const clientSecret = getGoogleClientSecret()
  if (!clientId || !clientSecret) {
    throw new Error('Google integration is not configured on the server.')
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  })

  const tokens = (await tokenRes.json().catch(() => ({}))) as TokenResponse & {
    error?: string
    error_description?: string
  }

  if (!tokenRes.ok || !tokens.access_token) {
    throw new Error(tokens.error_description || tokens.error || 'Failed to connect Google.')
  }

  const expiresAt =
    typeof tokens.expires_in === 'number'
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

  let accountEmail: string | null = null
  try {
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (profileRes.ok) {
      const profile = await profileRes.json()
      accountEmail = typeof profile.email === 'string' ? profile.email : null
    }
  } catch {
    // optional
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? null,
    expiresAt,
    accountEmail,
  }
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  accessToken: string
  expiresAt: string | null
}> {
  const clientId = getGoogleClientId()
  const clientSecret = getGoogleClientSecret()
  if (!clientId || !clientSecret) {
    throw new Error('Google integration is not configured on the server.')
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const tokens = (await tokenRes.json().catch(() => ({}))) as TokenResponse & {
    error?: string
    error_description?: string
  }

  if (!tokenRes.ok || !tokens.access_token) {
    throw new Error(tokens.error_description || tokens.error || 'Google session expired. Reconnect Google.')
  }

  return {
    accessToken: tokens.access_token,
    expiresAt:
      typeof tokens.expires_in === 'number'
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
  }
}

export async function getValidGoogleAccessToken(userId: string): Promise<string> {
  const integration = await getGoogleIntegration(userId)
  if (!integration?.accessToken) {
    throw new Error('Connect Google in Settings → Integrations first.')
  }

  const expiresAt = integration.expiresAt ? new Date(integration.expiresAt).getTime() : 0
  const stillValid = expiresAt > Date.now() + 60_000

  if (stillValid) return integration.accessToken

  if (!integration.refreshToken) {
    await clearGoogleIntegration(userId)
    throw new Error('Google session expired. Please reconnect Google.')
  }

  const refreshed = await refreshGoogleAccessToken(integration.refreshToken)
  await saveGoogleIntegration(userId, {
    accessToken: refreshed.accessToken,
    refreshToken: integration.refreshToken,
    expiresAt: refreshed.expiresAt,
    accountEmail: integration.accountEmail,
  })

  return refreshed.accessToken
}

const INSERT_CHUNK = 8000

function googleApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback
  const err = (payload as { error?: { message?: string; status?: string } }).error
  const message = typeof err?.message === 'string' ? err.message.trim() : ''
  if (!message) return fallback
  if (/insufficient|permission|scope/i.test(message)) {
    return `${message} Disconnect Google in Settings, then Connect again to grant Sheets access.`
  }
  if (/has not been used|disabled|accessNotConfigured/i.test(message)) {
    return `${message} Enable Google Sheets API in Google Cloud Console.`
  }
  return message
}

function splitText(text: string, size: number): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) {
    const chunk = text.slice(i, i + size)
    if (chunk) chunks.push(chunk)
  }
  return chunks
}

export async function createGoogleDoc(
  accessToken: string,
  title: string,
  body: string
): Promise<{ documentId: string; url: string }> {
  const safeTitle = title.trim().slice(0, 200) || 'DreamScale Export'

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: safeTitle,
      mimeType: 'application/vnd.google-apps.document',
    }),
  })

  const created = await createRes.json().catch(() => ({}))
  if (!createRes.ok || !created.id) {
    throw new Error(googleApiErrorMessage(created, 'Failed to create Google Doc.'))
  }

  const documentId = created.id as string
  const chunks = splitText(body, INSERT_CHUNK)

  if (chunks.length > 0) {
    let index = 1
    const requests = chunks.map((chunk) => {
      const request = {
        insertText: {
          location: { index },
          text: chunk,
        },
      }
      index += chunk.length
      return request
    })

    const updateRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    )

    const updated = await updateRes.json().catch(() => ({}))
    if (!updateRes.ok) {
      throw new Error(
        googleApiErrorMessage(updated, 'Failed to write content to Google Doc.')
      )
    }
  }

  return {
    documentId,
    url: `https://docs.google.com/document/d/${documentId}/edit`,
  }
}

function escapeSheetRangeName(name: string): string {
  return `'${name.replace(/'/g, "''")}'`
}

export async function createGoogleSpreadsheet(
  accessToken: string,
  title: string,
  sheets: SheetTab[]
): Promise<{ spreadsheetId: string; url: string }> {
  const safeTitle = title.trim().slice(0, 200) || 'DreamScale Export'
  const tabs = sheets.length ? sheets : [{ name: 'Data', rows: [['No data']] }]

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: safeTitle },
      sheets: tabs.map((tab) => ({
        properties: { title: tab.name.slice(0, 80) || 'Sheet' },
      })),
    }),
  })

  const created = await createRes.json().catch(() => ({}))
  if (!createRes.ok || !created.spreadsheetId) {
    throw new Error(googleApiErrorMessage(created, 'Failed to create Google Sheet.'))
  }

  const spreadsheetId = created.spreadsheetId as string
  const valueRanges = tabs
    .filter((tab) => tab.rows.length > 0)
    .map((tab) => ({
      range: `${escapeSheetRangeName(tab.name.slice(0, 80) || 'Sheet')}!A1`,
      values: normalizeSheetRows(tab.rows as unknown[][]),
    }))

  if (valueRanges.length > 0) {
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: valueRanges,
        }),
      }
    )

    const updated = await updateRes.json().catch(() => ({}))
    if (!updateRes.ok) {
      throw new Error(
        googleApiErrorMessage(updated, 'Failed to write data to Google Sheet.')
      )
    }
  }

  return {
    spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  }
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    title: string
    description?: string
    start: string
    end?: string
    allDay?: boolean
  }
): Promise<{ eventId: string; url: string }> {
  const start = new Date(event.start)
  if (Number.isNaN(start.getTime())) {
    throw new Error('Invalid event start date.')
  }
  const end = event.end ? new Date(event.end) : new Date(start.getTime() + 60 * 60 * 1000)

  const body = event.allDay
    ? {
        summary: event.title.slice(0, 200),
        description: event.description?.slice(0, 8000),
        start: { date: start.toISOString().slice(0, 10) },
        end: { date: end.toISOString().slice(0, 10) },
      }
    : {
        summary: event.title.slice(0, 200),
        description: event.description?.slice(0, 8000),
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      }

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.id) {
    throw new Error(googleApiErrorMessage(data, 'Failed to create Google Calendar event.'))
  }

  return {
    eventId: data.id as string,
    url: (data.htmlLink as string) || 'https://calendar.google.com/',
  }
}

export function getGoogleAuthorizeUrl(state: string): string {
  const clientId = getGoogleClientId()
  if (!clientId) throw new Error('Google integration is not configured.')

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', getGoogleRedirectUri())
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', GOOGLE_INTEGRATION_SCOPES)
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('state', state)
  return url.toString()
}
