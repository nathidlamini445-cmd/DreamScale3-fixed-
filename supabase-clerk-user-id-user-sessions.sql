-- Fix user_sessions for Clerk user IDs (e.g. user_2abc...) instead of Supabase auth UUIDs.
-- Symptom: HTTP 400 on upsert / PostgREST "conflict=user_id" or invalid uuid / FK errors.
--
-- Run this ONCE in Supabase → SQL Editor. Safe to re-run: DROP IF EXISTS, USING cast.

ALTER TABLE public.user_sessions
  DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;

ALTER TABLE public.user_sessions
  ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- PostgREST/Supabase upsert uses ON CONFLICT (user_id). Without a UNIQUE index on
-- user_id you get: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
CREATE UNIQUE INDEX IF NOT EXISTS user_sessions_user_id_unique ON public.user_sessions (user_id);
