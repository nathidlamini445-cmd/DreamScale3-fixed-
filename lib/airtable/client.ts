import 'server-only'

import { createHash, randomBytes } from 'crypto'
import {
  getAirtableClientId,
  getAirtableClientSecret,
  getAirtableRedirectUri,
  AIRTABLE_SCOPES,
} from './config'
import {
  getAirtableIntegration,
  saveAirtableIntegration,
  type AirtableIntegration,
} from './store'

const AIRTABLE_PKCE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._'

function generateAirtableState(): string {
  const bytes = randomBytes(32)
  let state = ''
  for (let i = 0; i < bytes.length; i++) {
    state += AIRTABLE_PKCE_CHARS[bytes[i] % AIRTABLE_PKCE_CHARS.length]
  }
  return state
}

export function generateAirtablePkce(): { verifier: string; challenge: string } {
  // Airtable: verifier 43–128 chars from [A-Za-z0-9._-]
  const bytes = randomBytes(64)
  let verifier = ''
  for (let i = 0; i < bytes.length; i++) {
    verifier += AIRTABLE_PKCE_CHARS[bytes[i] % AIRTABLE_PKCE_CHARS.length]
  }
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function generateAirtableOAuthState(): string {
  return generateAirtableState()
}

function airtableBasicCredentials(clientId: string, clientSecret: string): string {
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
}

export async function validateAirtableAccessToken(token: string): Promise<boolean> {
  const res = await fetch('https://api.airtable.com/v0/meta/whoami', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.ok
}

export function getAirtableAuthorizeUrl(
  state: string,
  codeChallenge: string,
  redirectUri: string = getAirtableRedirectUri()
): string {
  const clientId = getAirtableClientId()
  if (!clientId) throw new Error('Airtable integration is not configured.')

  const params = new URLSearchParams()
  params.set('client_id', clientId)
  params.set('redirect_uri', redirectUri)
  params.set('response_type', 'code')
  params.set('scope', AIRTABLE_SCOPES)
  params.set('state', state)
  params.set('code_challenge', codeChallenge)
  params.set('code_challenge_method', 'S256')

  return `https://airtable.com/oauth2/v1/authorize?${params.toString()}`
}

type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

export async function exchangeAirtableCode(
  code: string,
  codeVerifier: string,
  redirectUri: string = getAirtableRedirectUri()
): Promise<{ accessToken: string; refreshToken: string | null; expiresAt: string | null }> {
  const clientId = getAirtableClientId()
  const clientSecret = getAirtableClientSecret()
  if (!clientId || !clientSecret) {
    throw new Error('Airtable integration is not configured on the server.')
  }

  const credentials = airtableBasicCredentials(clientId, clientSecret)
  const res = await fetch('https://airtable.com/oauth2/v1/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  const data = (await res.json().catch(() => ({}))) as TokenResponse
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Failed to connect Airtable.')
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt:
      typeof data.expires_in === 'number'
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : null,
  }
}

async function refreshAirtableToken(refreshToken: string): Promise<{
  accessToken: string
  expiresAt: string | null
}> {
  const clientId = getAirtableClientId()
  const clientSecret = getAirtableClientSecret()
  if (!clientId || !clientSecret) {
    throw new Error('Airtable integration is not configured.')
  }

  const credentials = airtableBasicCredentials(clientId, clientSecret)
  const res = await fetch('https://airtable.com/oauth2/v1/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  })

  const data = (await res.json().catch(() => ({}))) as TokenResponse
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Airtable session expired. Reconnect.')
  }

  return {
    accessToken: data.access_token,
    expiresAt:
      typeof data.expires_in === 'number'
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : null,
  }
}

export async function getValidAirtableAccessToken(userId: string): Promise<string> {
  const integration = await getAirtableIntegration(userId)
  if (!integration?.accessToken) {
    throw new Error('Connect Airtable in Settings → Integrations first.')
  }

  const expiresAt = integration.expiresAt ? new Date(integration.expiresAt).getTime() : 0
  if (expiresAt > Date.now() + 60_000) return integration.accessToken

  // Personal access tokens have no refresh flow — use until disconnected.
  if (!integration.refreshToken) return integration.accessToken

  const refreshed = await refreshAirtableToken(integration.refreshToken)
  await saveAirtableIntegration(userId, {
    accessToken: refreshed.accessToken,
    refreshToken: integration.refreshToken,
    expiresAt: refreshed.expiresAt,
    baseId: integration.baseId,
    tableName: integration.tableName,
  })

  return refreshed.accessToken
}

function rowsToAirtableRecords(rows: string[][]): Record<string, string>[] {
  if (!rows.length) return []
  const [header, ...dataRows] = rows
  if (!header?.length) return []

  const fields = header.map((h, i) => h.trim() || `Column ${i + 1}`)

  return dataRows
    .filter((row) => row.some((cell) => String(cell ?? '').trim()))
    .map((row) => {
      const record: Record<string, string> = {}
      fields.forEach((field, i) => {
        record[field] = String(row[i] ?? '')
      })
      return record
    })
}

export async function exportRowsToAirtable(
  accessToken: string,
  baseId: string,
  tableName: string,
  rows: string[][]
): Promise<{ count: number }> {
  const records = rowsToAirtableRecords(rows)
  if (!records.length) {
    throw new Error('No data rows to export.')
  }

  const encodedTable = encodeURIComponent(tableName)
  const batchSize = 10
  let count = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodedTable}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: batch.map((fields) => ({ fields })),
        typecast: true,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg =
        typeof data.error?.message === 'string'
          ? data.error.message
          : 'Failed to export to Airtable. Check base ID, table name, and column headers.'
      throw new Error(msg)
    }
    count += batch.length
  }

  return { count }
}

export function integrationHasTarget(integration: AirtableIntegration): boolean {
  return !!(integration.baseId?.trim() && integration.tableName?.trim())
}

