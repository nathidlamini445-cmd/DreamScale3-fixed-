import 'server-only'

import { createClient } from '@supabase/supabase-js'

export type GoogleIntegration = {
  accessToken: string
  refreshToken: string | null
  expiresAt: string | null
  accountEmail: string | null
  connectedAt: string | null
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url?.trim() || !serviceKey?.trim()) return null
  return createClient(url.trim(), serviceKey.trim())
}

export async function getGoogleIntegration(
  userId: string
): Promise<GoogleIntegration | null> {
  const supabase = getServiceClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_integrations')
    .select(
      'google_access_token, google_refresh_token, google_token_expires_at, google_account_email, google_connected_at'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data?.google_access_token) return null

  return {
    accessToken: data.google_access_token,
    refreshToken: data.google_refresh_token,
    expiresAt: data.google_token_expires_at,
    accountEmail: data.google_account_email,
    connectedAt: data.google_connected_at,
  }
}

export async function saveGoogleIntegration(
  userId: string,
  integration: {
    accessToken: string
    refreshToken?: string | null
    expiresAt?: string | null
    accountEmail?: string | null
    connectedAt?: string
  }
): Promise<boolean> {
  const supabase = getServiceClient()
  if (!supabase) return false

  const existing = await getGoogleIntegration(userId)
  const refreshToken =
    integration.refreshToken ?? existing?.refreshToken ?? null

  const { error } = await supabase.from('user_integrations').upsert(
    {
      user_id: userId,
      google_access_token: integration.accessToken,
      google_refresh_token: refreshToken,
      google_token_expires_at: integration.expiresAt ?? null,
      google_account_email: integration.accountEmail ?? existing?.accountEmail ?? null,
      google_connected_at: integration.connectedAt ?? existing?.connectedAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    console.error('saveGoogleIntegration failed:', error.message, error.code, error.details)
  }

  return !error
}

export async function clearGoogleIntegration(userId: string): Promise<boolean> {
  const supabase = getServiceClient()
  if (!supabase) return false

  const { error } = await supabase.from('user_integrations').upsert(
    {
      user_id: userId,
      google_access_token: null,
      google_refresh_token: null,
      google_token_expires_at: null,
      google_account_email: null,
      google_connected_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return !error
}
