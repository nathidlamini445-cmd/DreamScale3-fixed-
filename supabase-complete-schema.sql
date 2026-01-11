-- ============================================
-- DREAMSCALE COMPLETE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- This creates ALL tables needed for the app
-- ============================================

-- ============================================
-- 1. USER PROFILES TABLE (Onboarding Data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  user_name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
  business_name TEXT,
  industry TEXT[] DEFAULT '{}',
  business_stage TEXT,
  revenue_goal TEXT,
  target_market TEXT[] DEFAULT '{}',
  team_size TEXT,
  biggest_challenges TEXT[] DEFAULT '{}',
  revenue_model TEXT,
  customer_acquisition TEXT[] DEFAULT '{}',
  mrr TEXT,
  key_metrics TEXT[] DEFAULT '{}',
  growth_strategy TEXT,
  six_month_goal TEXT,
  hobbies TEXT[] DEFAULT '{}',
  favorite_song TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  mindset_answers JSONB DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 2. CALENDAR EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  category TEXT,
  color TEXT,
  expense JSONB,
  time_balance_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 3. HYPEOS (VENTURE QUEST) DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.hypeos_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_data JSONB,
  tasks JSONB DEFAULT '[]'::jsonb,
  mini_wins JSONB DEFAULT '[]'::jsonb,
  quests JSONB DEFAULT '[]'::jsonb,
  all_goals JSONB DEFAULT '[]'::jsonb,
  tasks_last_date TEXT,
  redeemed_rewards JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 4. TASKS DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_tasks JSONB DEFAULT '[]'::jsonb,
  weekly_tasks JSONB DEFAULT '[]'::jsonb,
  monthly_tasks JSONB DEFAULT '[]'::jsonb,
  yearly_tasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 5. CHAT CONVERSATIONS TABLE (BIZORA AI)
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 6. SYSTEMS DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.systems_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  systems JSONB DEFAULT '[]'::jsonb,
  saved_sops JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 7. REVENUE INTELLIGENCE DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.revenue_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboards JSONB DEFAULT '[]'::jsonb,
  optimizations JSONB DEFAULT '[]'::jsonb,
  pricing_strategies JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  ltv_analyses JSONB DEFAULT '[]'::jsonb,
  scenarios JSONB DEFAULT '[]'::jsonb,
  revenue_analyses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 8. LEADERSHIP DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.leadership_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_assessment JSONB,
  decisions JSONB DEFAULT '[]'::jsonb,
  communications JSONB DEFAULT '[]'::jsonb,
  conflicts JSONB DEFAULT '[]'::jsonb,
  routines JSONB DEFAULT '[]'::jsonb,
  challenges JSONB DEFAULT '[]'::jsonb,
  feedback_360 JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 9. TEAMS DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.teams_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dna_analyses JSONB DEFAULT '[]'::jsonb,
  task_assignments JSONB DEFAULT '[]'::jsonb,
  health_monitors JSONB DEFAULT '[]'::jsonb,
  cofounder_matches JSONB DEFAULT '[]'::jsonb,
  rituals JSONB DEFAULT '[]'::jsonb,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 10. DREAMPULSE DATA TABLE (Competitor Intelligence)
-- ============================================
CREATE TABLE IF NOT EXISTS public.dreampulse_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_analyses JSONB DEFAULT '[]'::jsonb,
  competitor_monitoring JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 11. DAILY MOOD TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_mood (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);

-- ============================================
-- 12. FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  feedback TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  issues TEXT[],
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 13. TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  testimonial TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 14. USER SESSIONS TABLE (General Session Data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 15. USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'en',
  notification_settings JSONB DEFAULT '{}'::jsonb,
  email_preferences JSONB DEFAULT '{}'::jsonb,
  ui_preferences JSONB DEFAULT '{}'::jsonb,
  feature_flags JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 16. USER NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_seen_status JSONB DEFAULT '{}'::jsonb,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 17. EMAIL CAPTURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  source TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 18. SKILLDROPS PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.skilldrops_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_lessons JSONB DEFAULT '[]'::jsonb,
  progress_tracking JSONB DEFAULT '{}'::jsonb,
  certificates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 19. PROJECTS DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  projects JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 20. FLOWMATCH DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.flowmatch_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flow_matches JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 21. SUGGESTIONS/ROADMAP DATA TABLE
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

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hypeos_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systems_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreampulse_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_mood ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skilldrops_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowmatch_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions_data ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- User Profiles
CREATE POLICY "Users can manage own profile"
  ON public.user_profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Calendar Events
CREATE POLICY "Users can manage own calendar events"
  ON public.calendar_events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- HypeOS Data
CREATE POLICY "Users can manage own hypeos data"
  ON public.hypeos_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tasks Data
CREATE POLICY "Users can manage own tasks data"
  ON public.tasks_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chat Conversations
CREATE POLICY "Users can manage own conversations"
  ON public.chat_conversations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Systems Data
CREATE POLICY "Users can manage own systems data"
  ON public.systems_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Revenue Data
CREATE POLICY "Users can manage own revenue data"
  ON public.revenue_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Leadership Data
CREATE POLICY "Users can manage own leadership data"
  ON public.leadership_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Teams Data
CREATE POLICY "Users can manage own teams data"
  ON public.teams_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DreamPulse Data
CREATE POLICY "Users can manage own dreampulse data"
  ON public.dreampulse_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Daily Mood
CREATE POLICY "Users can manage own daily mood"
  ON public.daily_mood
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Feedback (users can insert their own, admins can read all)
CREATE POLICY "Users can insert own feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own feedback"
  ON public.feedback
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Testimonials (users can insert their own, admins can read all)
CREATE POLICY "Users can insert own testimonials"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own testimonials"
  ON public.testimonials
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- User Sessions
CREATE POLICY "Users can manage own sessions"
  ON public.user_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Preferences
CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Notifications
CREATE POLICY "Users can manage own notifications"
  ON public.user_notifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Email Captures (users can insert, admins can read all)
CREATE POLICY "Users can insert own email captures"
  ON public.email_captures
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own email captures"
  ON public.email_captures
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- SkillDrops Progress
CREATE POLICY "Users can manage own skilldrops progress"
  ON public.skilldrops_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Projects Data
CREATE POLICY "Users can manage own projects data"
  ON public.projects_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- FlowMatch Data
CREATE POLICY "Users can manage own flowmatch data"
  ON public.flowmatch_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suggestions Data
CREATE POLICY "Users can manage own suggestions data"
  ON public.suggestions_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE TRIGGER on_user_profiles_updated
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_calendar_events_updated
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_hypeos_data_updated
  BEFORE UPDATE ON public.hypeos_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_tasks_data_updated
  BEFORE UPDATE ON public.tasks_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_chat_conversations_updated
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_systems_data_updated
  BEFORE UPDATE ON public.systems_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_revenue_data_updated
  BEFORE UPDATE ON public.revenue_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_leadership_data_updated
  BEFORE UPDATE ON public.leadership_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_teams_data_updated
  BEFORE UPDATE ON public.teams_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_dreampulse_data_updated
  BEFORE UPDATE ON public.dreampulse_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_user_sessions_updated
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_user_preferences_updated
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_user_notifications_updated
  BEFORE UPDATE ON public.user_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_skilldrops_progress_updated
  BEFORE UPDATE ON public.skilldrops_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_projects_data_updated
  BEFORE UPDATE ON public.projects_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_suggestions_data_updated
  BEFORE UPDATE ON public.suggestions_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_flowmatch_data_updated
  BEFORE UPDATE ON public.flowmatch_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- FUNCTION TO AUTO-CREATE USER PROFILE
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_email TEXT;
BEGIN
  user_email := NEW.email;
  
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.user_metadata->>'full_name',
    NEW.user_metadata->>'name',
    NULL
  );
  
  INSERT INTO public.user_profiles (id, email, full_name, onboarding_completed)
  VALUES (NEW.id, user_email, user_name, FALSE)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER TO AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed ON public.user_profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_name ON public.user_profiles(business_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON public.user_profiles USING GIN(industry);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON public.chat_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON public.feedback(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_timestamp ON public.testimonials(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_daily_mood_user_date ON public.daily_mood(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_mood_date ON public.daily_mood(date DESC);

CREATE INDEX IF NOT EXISTS idx_email_captures_email ON public.email_captures(email);
CREATE INDEX IF NOT EXISTS idx_email_captures_user_id ON public.email_captures(user_id);
CREATE INDEX IF NOT EXISTS idx_email_captures_timestamp ON public.email_captures(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_suggestions_data_user_id ON public.suggestions_data(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_data_last_generated ON public.suggestions_data(last_generated_at DESC);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE public.user_profiles IS 'User profile data including onboarding information';
COMMENT ON TABLE public.calendar_events IS 'Calendar events with expenses and time tracking';
COMMENT ON TABLE public.hypeos_data IS 'Venture Quest/HypeOS data: goals, tasks, streaks, points, quests, mini wins, rewards';
COMMENT ON TABLE public.tasks_data IS 'User tasks organized by daily, weekly, monthly, yearly';
COMMENT ON TABLE public.chat_conversations IS 'Bizora AI chat conversation history';
COMMENT ON TABLE public.systems_data IS 'Systems and SOPs (Standard Operating Procedures)';
COMMENT ON TABLE public.revenue_data IS 'Revenue intelligence dashboards, optimizations, pricing strategies, analyses';
COMMENT ON TABLE public.leadership_data IS 'Leadership coaching data: assessments, decisions, communications, conflicts, routines';
COMMENT ON TABLE public.teams_data IS 'Team management: DNA analyses, task assignments, health monitors, cofounder matches';
COMMENT ON TABLE public.dreampulse_data IS 'Competitor intelligence: saved analyses and monitoring data';
COMMENT ON TABLE public.daily_mood IS 'Daily mood tracking entries';
COMMENT ON TABLE public.feedback IS 'User feedback submissions';
COMMENT ON TABLE public.testimonials IS 'User testimonials';
COMMENT ON TABLE public.user_sessions IS 'General user session data';
COMMENT ON TABLE public.user_preferences IS 'User preferences: theme, language, notifications, UI settings';
COMMENT ON TABLE public.user_notifications IS 'Feature seen status and notification preferences';
COMMENT ON TABLE public.email_captures IS 'Email addresses captured from modals';
COMMENT ON TABLE public.skilldrops_progress IS 'SkillDrops learning progress and certificates';
COMMENT ON TABLE public.projects_data IS 'User projects and milestones';
COMMENT ON TABLE public.flowmatch_data IS 'FlowMatch preferences and results';
COMMENT ON TABLE public.suggestions_data IS 'Personalized roadmap suggestions and recommendations for users';

-- ============================================
-- SCHEMA CREATION COMPLETE
-- ============================================
-- All 21 tables have been created with:
-- ✅ Row Level Security (RLS) enabled
-- ✅ RLS policies for user data access
-- ✅ Auto-update triggers for updated_at
-- ✅ Auto-create profile trigger on signup
-- ✅ Performance indexes
-- ✅ Foreign key constraints with CASCADE delete
-- ✅ Documentation comments
