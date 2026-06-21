import 'server-only'

import { createClient } from '@supabase/supabase-js'

export type NotionIntegration = {
  accessToken: string
  workspaceId: string | null
  workspaceName: string | null
  botId: string | null
  connectedAt: string | null
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url?.trim() || !serviceKey?.trim()) return null
  return createClient(url.trim(), serviceKey.trim())
}

export async function getNotionIntegration(
  userId: string
): Promise<NotionIntegration | null> {
  const supabase = getServiceClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_integrations')
    .select(
      'notion_access_token, notion_workspace_id, notion_workspace_name, notion_bot_id, notion_connected_at'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data?.notion_access_token) return null

  return {
    accessToken: data.notion_access_token,
    workspaceId: data.notion_workspace_id,
    workspaceName: data.notion_workspace_name,
    botId: data.notion_bot_id,
    connectedAt: data.notion_connected_at,
  }
}

export async function saveNotionIntegration(
  userId: string,
  integration: Omit<NotionIntegration, 'connectedAt'> & { connectedAt?: string }
): Promise<boolean> {
  const supabase = getServiceClient()
  if (!supabase) return false

  const { error } = await supabase.from('user_integrations').upsert(
    {
      user_id: userId,
      notion_access_token: integration.accessToken,
      notion_workspace_id: integration.workspaceId,
      notion_workspace_name: integration.workspaceName,
      notion_bot_id: integration.botId,
      notion_connected_at: integration.connectedAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return !error
}

export async function clearNotionIntegration(userId: string): Promise<boolean> {
  const supabase = getServiceClient()
  if (!supabase) return false

  const { error } = await supabase.from('user_integrations').upsert(
    {
      user_id: userId,
      notion_access_token: null,
      notion_workspace_id: null,
      notion_workspace_name: null,
      notion_bot_id: null,
      notion_connected_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return !error
}
