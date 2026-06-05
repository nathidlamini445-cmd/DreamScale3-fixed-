-- PayFast / DreamScale Pro — run once in Supabase SQL Editor.
-- Compatible with Clerk user ids (user_…) on user_profiles.id.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS payfast_token TEXT,
  ADD COLUMN IF NOT EXISTS payfast_last_pf_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_activated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.user_profiles.subscription_tier IS 'free | pro';
COMMENT ON COLUMN public.user_profiles.subscription_status IS 'inactive | active | cancelled';

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier
  ON public.user_profiles (subscription_tier);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status
  ON public.user_profiles (subscription_status);

CREATE TABLE IF NOT EXISTS public.payfast_itn_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pf_payment_id TEXT NOT NULL,
  m_payment_id TEXT,
  user_id TEXT,
  payment_status TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (pf_payment_id, action)
);

ALTER TABLE public.payfast_itn_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to payfast_itn_log"
  ON public.payfast_itn_log
  FOR ALL
  USING (false);
