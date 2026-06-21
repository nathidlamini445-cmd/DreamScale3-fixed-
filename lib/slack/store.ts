import 'server-only'

import { createClient } from '@supabase/supabase-js'

export type SlackIntegration = {
  accessToken: string
  teamId: string | null
  teamName: string | null
  defaultChannel: string | null
  connectedAt: string | null
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url?.trim() || !serviceKey?.trim()) return null
  return createClient(url.trim(), serviceKey.trim())
}

export async function getSlackIntegration(userId: string): Promise<SlackIntegration | null> {
  const supabase = getServiceClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_integrations')
    .select(
      'slack_access_token, slack_team_id, slack_team_name, slack_default_channel, slack_connected_at'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data?.slack_access_token) return null

  return {
    accessToken: data.slack_access_token,
    teamId: data.slack_team_id,
    teamName: data.slack_team_name,
    defaultChannel: data.slack_default_channel,
    connectedAt: data.slack_connected_at,
  }
}

export async function saveSlackIntegration(
  userId: string,
  integration: {
    accessToken: string
    teamId?: string | null
    teamName?: string | null
    defaultChannel?: string | null
    connectedAt?: string
  }
): Promise<boolean> {
  const supabase = getServiceClient()
  if (!supabase) return false

  const existing = await getSlackIntegration(userId)

  const { error } = await supabase.from('user_integrations').upsert(
    {
      user_id: userId,
      slack_access_token: integration.accessToken,
      slack_team_id: integration.teamId ?? existing?.teamId ?? null,
      slack_team_name: integration.teamName ?? existing?.teamName ?? null,
      slack_default_channel:
        integration.defaultChannel ?? existing?.defaultChannel ?? '#general',
      slack_connected_at: integration.connectedAt ?? existing?.connectedAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) console.error('saveSlackIntegration failed:', error.message)
  return !error
}

export async function updateSlackDefaultChannel(
  userId: string,
  channel: string
): Promise<boolean> {
  const supabase = getServiceClient()
  if (!supabase) return false

  const { error } = await supabase.from('user_integrations').upsert(
    {
      user_id: userId,
      slack_default_channel: channel.trim() || '#general',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return !error
}

export async function clearSlackIntegration(userId: string): Promise<boolean> {
  const supabase = getServiceClient()
  if (!supabase) return false

  const { error } = await supabase.from('user_integrations').upsert(
    {
      user_id: userId,
      slack_access_token: null,
      slack_team_id: null,
      slack_team_name: null,
      slack_default_channel: null,
      slack_connected_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return !error
}

