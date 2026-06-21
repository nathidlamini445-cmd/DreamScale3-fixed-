import 'server-only'

import { createClient } from '@supabase/supabase-js'

export type AirtableIntegration = {
  accessToken: string
  refreshToken: string | null
  expiresAt: string | null
  baseId: string | null
  tableName: string | null
  connectedAt: string | null
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url?.trim() || !serviceKey?.trim()) return null
  return createClient(url.trim(), serviceKey.trim())
}

export async function getAirtableIntegration(userId: string): Promise<AirtableIntegration | null> {
  const supabase = getServiceClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_integrations')
    .select(
      'airtable_access_token, airtable_refresh_token, airtable_token_expires_at, airtable_base_id, airtable_table_name, airtable_connected_at'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data?.airtable_access_token) return null

  return {
    accessToken: data.airtable_access_token,
    refreshToken: data.airtable_refresh_token,
    expiresAt: data.airtable_token_expires_at,
    baseId: data.airtable_base_id,
    tableName: data.airtable_table_name,
    connectedAt: data.airtable_connected_at,
  }
}

export async function saveAirtableIntegration(
  userId: string,
  integration: Partial<AirtableIntegration> & { accessToken: string }
): Promise<boolean> {
  const supabase = getServiceClient()
  if (!supabase) return false

  const existing = await getAirtableIntegration(userId)

  const { error } = await supabase.from('user_integrations').upsert(
    {
      user_id: userId,
      airtable_access_token: integration.accessToken,
      airtable_refresh_token: integration.refreshToken ?? existing?.refreshToken ?? null,
      airtable_token_expires_at: integration.expiresAt ?? existing?.expiresAt ?? null,
      airtable_base_id: integration.baseId ?? existing?.baseId ?? null,
      airtable_table_name: integration.tableName ?? existing?.tableName ?? 'DreamScale Export',
      airtable_connected_at:
        integration.connectedAt ?? existing?.connectedAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) console.error('saveAirtableIntegration failed:', error.message)
  return !error
}

export async function updateAirtableTarget(
  userId: string,
  baseId: string,
  tableName: string
): Promise<boolean> {
  const supabase = getServiceClient()
  if (!supabase) return false

  const { error } = await supabase.from('user_integrations').upsert(
    {
      user_id: userId,
      airtable_base_id: baseId.trim(),
      airtable_table_name: tableName.trim() || 'DreamScale Export',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return !error
}

export async function clearAirtableIntegration(userId: string): Promise<boolean> {
  const supabase = getServiceClient()
  if (!supabase) return false

  const { error } = await supabase.from('user_integrations').upsert(
    {
      user_id: userId,
      airtable_access_token: null,
      airtable_refresh_token: null,
      airtable_token_expires_at: null,
      airtable_base_id: null,
      airtable_table_name: null,
      airtable_connected_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return !error
}

