-- DreamScale invite links — run once in Supabase SQL Editor.
-- Fixes: "Could not find the 'invite_token' column of 'workspace_members' in the schema cache"
--
-- Adds:
--   workspace_members.invite_token  → personal invite links (/invite/[token])
--   dreamscale_workspaces.invite_token → shared workspace links (/join/[token])

-- 1) Per-member invite tokens (required for email invites + guest revisit links)
ALTER TABLE public.workspace_members
  ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_workspace_members_invite_token
  ON public.workspace_members (invite_token)
  WHERE invite_token IS NOT NULL;

COMMENT ON COLUMN public.workspace_members.invite_token IS
  'Secret link token; guest joins via /invite/[token] without a DreamScale account';

-- 2) Workspace-wide share link (copy link from Settings → Teamspaces → workspace → People)
ALTER TABLE public.dreamscale_workspaces
  ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_dreamscale_workspaces_invite_token
  ON public.dreamscale_workspaces (invite_token)
  WHERE invite_token IS NOT NULL;

COMMENT ON COLUMN public.dreamscale_workspaces.invite_token IS
  'Open workspace invite; guests join via /join/[token] with their name';

-- 3) Reload PostgREST schema cache (Supabase API) so the new columns are visible immediately
NOTIFY pgrst, 'reload schema';
