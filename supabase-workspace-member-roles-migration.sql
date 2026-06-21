-- Allow admin and viewer workspace roles (owner + member already exist).
-- Run once in Supabase SQL Editor.

ALTER TABLE public.workspace_members
  DROP CONSTRAINT IF EXISTS workspace_members_role_check;

ALTER TABLE public.workspace_members
  ADD CONSTRAINT workspace_members_role_check
  CHECK (role IN ('owner', 'admin', 'member', 'viewer'));

COMMENT ON COLUMN public.workspace_members.role IS 'owner = workspace owner; admin/member/viewer = collaborators';
