-- Add invite link tokens for workspace collaborators (run if you already ran supabase-workspaces-migration.sql).
-- Prefer running supabase-workspace-invites-complete-migration.sql instead (includes workspace share links too).

ALTER TABLE public.workspace_members
  ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_workspace_members_invite_token
  ON public.workspace_members (invite_token)
  WHERE invite_token IS NOT NULL;

COMMENT ON COLUMN public.workspace_members.invite_token IS 'Secret link token; guest joins via /invite/[token] without a DreamScale account';
