-- End-of-period cancellation: keep Pro until subscription_ends_at.
-- Run once in Supabase SQL Editor.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.user_profiles.subscription_ends_at IS 'Pro access valid until this time (inclusive of paid period)';
COMMENT ON COLUMN public.user_profiles.subscription_cancelled_at IS 'When the user requested cancellation (billing stopped)';

COMMENT ON COLUMN public.user_profiles.subscription_status IS
  'inactive | active | cancel_at_period_end | cancelled';
