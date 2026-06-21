import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  const text = readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of text.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) env[m[1].trim()] = m[2].trim()
  }
  return env
}

const env = loadEnv()
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const { data, error } = await supabase
  .from('user_integrations')
  .select(
    'user_id, google_access_token, google_refresh_token, google_token_expires_at, google_account_email'
  )
  .not('google_access_token', 'is', null)
  .limit(1)
  .maybeSingle()

if (error || !data?.google_access_token) {
  console.error('No Google integration found:', error?.message)
  process.exit(1)
}

console.log('Testing Sheets API for', data.google_account_email)
console.log('Token expires:', data.google_token_expires_at)

let token = data.google_access_token
const expiresAt = data.google_token_expires_at
  ? new Date(data.google_token_expires_at).getTime()
  : 0
const needsRefresh = !expiresAt || expiresAt <= Date.now() + 60_000

if (needsRefresh && data.google_refresh_token) {
  console.log('Refreshing access token...')
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: data.google_refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  const tokens = await tokenRes.json()
  console.log('Refresh status:', tokenRes.status, tokens.error || 'ok')
  if (tokens.access_token) token = tokens.access_token
}

const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    properties: { title: 'DreamScale Sheets test' },
    sheets: [{ properties: { title: 'Milestones' } }],
  }),
})

const created = await createRes.json()
console.log('Create status:', createRes.status)
console.log('Create body:', JSON.stringify(created, null, 2))

if (!createRes.ok) process.exit(1)

const spreadsheetId = created.spreadsheetId
const updateRes = await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: "'Milestones'!A1",
          values: [
            ['Title', 'Status'],
            ['Test milestone', 'Pending'],
          ],
        },
      ],
    }),
  }
)

const updated = await updateRes.json()
console.log('Update status:', updateRes.status)
console.log('Update body:', JSON.stringify(updated, null, 2))
console.log('URL:', `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`)
