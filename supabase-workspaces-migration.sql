-- DreamScale workspaces & collaborator invites (Clerk user ids as TEXT).
-- Run once in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.dreamscale_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dreamscale_workspaces_owner
  ON public.dreamscale_workspaces (owner_id);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.dreamscale_workspaces(id) ON DELETE CASCADE,
  user_id TEXT,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ,
  invite_token TEXT UNIQUE,
  UNIQUE (workspace_id, email)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_invite_token
  ON public.workspace_members (invite_token)
  WHERE invite_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace
  ON public.workspace_members (workspace_id);

CREATE INDEX IF NOT EXISTS idx_workspace_members_email
  ON public.workspace_members (lower(email));

COMMENT ON TABLE public.dreamscale_workspaces IS 'User-owned workspaces (teamspaces)';
COMMENT ON TABLE public.workspace_members IS 'Workspace owner + invited collaborators';
