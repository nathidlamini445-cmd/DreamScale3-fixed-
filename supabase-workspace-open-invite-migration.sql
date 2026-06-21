-- Workspace-level open invite links (share link; guests enter name on /join/[token]).
-- Prefer running supabase-workspace-invites-complete-migration.sql instead (includes workspace_members too).
-- Run once in Supabase SQL Editor after supabase-workspaces-migration.sql.

ALTER TABLE public.dreamscale_workspaces
  ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_dreamscale_workspaces_invite_token
  ON public.dreamscale_workspaces (invite_token)
  WHERE invite_token IS NOT NULL;

COMMENT ON COLUMN public.dreamscale_workspaces.invite_token IS 'Open workspace invite; guests join via /join/[token] with their name';
