-- Google OAuth tokens for Pro integrations (Docs export; Calendar later).
-- Run once in Supabase → SQL Editor after supabase-notion-integration-migration.sql.

ALTER TABLE public.user_integrations
  ADD COLUMN IF NOT EXISTS google_access_token TEXT,
  ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS google_account_email TEXT,
  ADD COLUMN IF NOT EXISTS google_connected_at TIMESTAMPTZ;

COMMENT ON COLUMN public.user_integrations.google_access_token IS 'Google OAuth access token (Docs/Drive)';
COMMENT ON COLUMN public.user_integrations.google_refresh_token IS 'Google OAuth refresh token';
