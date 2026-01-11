-- ============================================
-- SUGGESTIONS/ROADMAP DATA TABLE MIGRATION
-- Run this in Supabase SQL Editor to create the table
-- ============================================

CREATE TABLE IF NOT EXISTS public.suggestions_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  main_suggestions JSONB DEFAULT '[]'::jsonb,
  daily_suggestions JSONB DEFAULT '[]'::jsonb,
  deep_focus_areas JSONB DEFAULT '[]'::jsonb,
  completed_suggestion_ids JSONB DEFAULT '[]'::jsonb,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.suggestions_data ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy
CREATE POLICY "Users can manage own suggestions data"
  ON public.suggestions_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_suggestions_data_user_id ON public.suggestions_data(user_id);

-- Add updated_at trigger
CREATE TRIGGER suggestions_data_updated_at
  BEFORE UPDATE ON public.suggestions_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.suggestions_data IS 'Stores personalized roadmap suggestions and recommendations for users';
COMMENT ON COLUMN public.suggestions_data.main_suggestions IS 'Main personalized recommendations (typically 3 items)';
COMMENT ON COLUMN public.suggestions_data.daily_suggestions IS 'Daily actionable recommendations';
COMMENT ON COLUMN public.suggestions_data.deep_focus_areas IS 'Deep focus areas for strategic planning';
COMMENT ON COLUMN public.suggestions_data.completed_suggestion_ids IS 'Array of suggestion IDs that user has marked as completed';
COMMENT ON COLUMN public.suggestions_data.last_generated_at IS 'Timestamp when recommendations were last generated';
