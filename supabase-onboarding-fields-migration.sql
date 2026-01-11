-- Migration: Add onboarding data fields to user_profiles table
-- This migration adds all onboarding question fields to the user_profiles table

-- Add all onboarding fields to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS business_stage TEXT,
ADD COLUMN IF NOT EXISTS revenue_goal TEXT,
ADD COLUMN IF NOT EXISTS target_market TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS team_size TEXT,
ADD COLUMN IF NOT EXISTS biggest_challenges TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS revenue_model TEXT,
ADD COLUMN IF NOT EXISTS customer_acquisition TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mrr TEXT,
ADD COLUMN IF NOT EXISTS key_metrics TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS growth_strategy TEXT,
ADD COLUMN IF NOT EXISTS six_month_goal TEXT,
ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS favorite_song TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_name ON public.user_profiles(business_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON public.user_profiles USING GIN(industry);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_stage ON public.user_profiles(business_stage);

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.business_name IS 'Name of the user''s business';
COMMENT ON COLUMN public.user_profiles.industry IS 'Array of industries the user is in';
COMMENT ON COLUMN public.user_profiles.business_stage IS 'Current stage of the business';
COMMENT ON COLUMN public.user_profiles.revenue_goal IS 'Revenue goal for the year';
COMMENT ON COLUMN public.user_profiles.target_market IS 'Array of target market segments';
COMMENT ON COLUMN public.user_profiles.team_size IS 'Current team size';
COMMENT ON COLUMN public.user_profiles.biggest_challenges IS 'Array of biggest challenges';
COMMENT ON COLUMN public.user_profiles.revenue_model IS 'Primary revenue model';
COMMENT ON COLUMN public.user_profiles.customer_acquisition IS 'Array of customer acquisition methods';
COMMENT ON COLUMN public.user_profiles.mrr IS 'Monthly recurring revenue';
COMMENT ON COLUMN public.user_profiles.key_metrics IS 'Array of key metrics tracked';
COMMENT ON COLUMN public.user_profiles.growth_strategy IS 'Primary growth strategy';
COMMENT ON COLUMN public.user_profiles.six_month_goal IS 'Biggest goal for next 6 months';
COMMENT ON COLUMN public.user_profiles.hobbies IS 'Array of user hobbies';
COMMENT ON COLUMN public.user_profiles.favorite_song IS 'User''s favorite song';
COMMENT ON COLUMN public.user_profiles.user_name IS 'Name the user wants to be called';
