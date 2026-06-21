-- Notion OAuth tokens for Pro integrations (Clerk user id as TEXT).
-- Run once in Supabase → SQL Editor.

CREATE TABLE IF NOT EXISTS public.user_integrations (
  user_id TEXT PRIMARY KEY,
  notion_access_token TEXT,
  notion_workspace_id TEXT,
  notion_workspace_name TEXT,
  notion_bot_id TEXT,
  notion_connected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_integrations_notion_connected
  ON public.user_integrations (notion_connected_at)
  WHERE notion_access_token IS NOT NULL;

COMMENT ON TABLE public.user_integrations IS 'Third-party OAuth tokens per user (Notion, etc.)';
