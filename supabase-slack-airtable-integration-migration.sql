-- Slack + Airtable OAuth for Pro integrations.
-- Run once in Supabase → SQL Editor after google + notion migrations.

ALTER TABLE public.user_integrations
  ADD COLUMN IF NOT EXISTS slack_access_token TEXT,
  ADD COLUMN IF NOT EXISTS slack_team_id TEXT,
  ADD COLUMN IF NOT EXISTS slack_team_name TEXT,
  ADD COLUMN IF NOT EXISTS slack_default_channel TEXT,
  ADD COLUMN IF NOT EXISTS slack_connected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS airtable_access_token TEXT,
  ADD COLUMN IF NOT EXISTS airtable_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS airtable_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS airtable_base_id TEXT,
  ADD COLUMN IF NOT EXISTS airtable_table_name TEXT,
  ADD COLUMN IF NOT EXISTS airtable_connected_at TIMESTAMPTZ;

COMMENT ON COLUMN public.user_integrations.slack_default_channel IS 'Slack channel name or ID for notifications (e.g. #general)';
COMMENT ON COLUMN public.user_integrations.airtable_base_id IS 'Airtable base ID (appXXXXXXXX) for exports';
COMMENT ON COLUMN public.user_integrations.airtable_table_name IS 'Airtable table name for DreamScale row exports';

