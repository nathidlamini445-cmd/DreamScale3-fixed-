-- Free-tier usage quotas (REQUIRED — run once in Supabase SQL Editor).
-- Without this column, free limits cannot be saved and Bizora will allow unlimited messages.
-- Dashboard → SQL → New query → paste → Run.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS free_usage JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_profiles.free_usage IS 'Free tier counters: chat, monthly modules, uploads';
