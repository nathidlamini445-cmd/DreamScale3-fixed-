-- Adds Problem Solver history to leadership_data (run once in Supabase SQL editor)
ALTER TABLE public.leadership_data
  ADD COLUMN IF NOT EXISTS problem_solver_advice JSONB DEFAULT '[]'::jsonb;
