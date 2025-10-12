-- =====================================================
-- RLS Policies for Athlete-Scoped Tables
-- Sprint 1.5-A: Complete Supabase Auth Integration
-- =====================================================

-- Helper function to get current athlete_id from JWT
CREATE OR REPLACE FUNCTION public.get_current_athlete_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- =====================================================
-- athlete_profiles
-- =====================================================

ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;

-- Read own profile
CREATE POLICY "Athletes read own profile"
  ON public.athlete_profiles
  FOR SELECT
  USING (athlete_id = auth.uid());

-- Insert own profile (signup)
CREATE POLICY "Athletes insert own profile"
  ON public.athlete_profiles
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

-- Update own profile
CREATE POLICY "Athletes update own profile"
  ON public.athlete_profiles
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- No DELETE policy (account deletion is separate Sprint 5 feature)

-- =====================================================
-- athlete_preferences
-- =====================================================

ALTER TABLE public.athlete_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own preferences"
  ON public.athlete_preferences
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Athletes insert own preferences"
  ON public.athlete_preferences
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes update own preferences"
  ON public.athlete_preferences
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- =====================================================
-- race_calendar
-- =====================================================

ALTER TABLE public.race_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own races"
  ON public.race_calendar
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Athletes insert own races"
  ON public.race_calendar
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes update own races"
  ON public.race_calendar
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes delete own races"
  ON public.race_calendar
  FOR DELETE
  USING (athlete_id = auth.uid());

-- =====================================================
-- athlete_constraints
-- =====================================================

ALTER TABLE public.athlete_constraints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own constraints"
  ON public.athlete_constraints
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Athletes insert own constraints"
  ON public.athlete_constraints
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes update own constraints"
  ON public.athlete_constraints
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes delete own constraints"
  ON public.athlete_constraints
  FOR DELETE
  USING (athlete_id = auth.uid());

-- =====================================================
-- sessions (existing table from Cycle 1)
-- =====================================================

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own sessions"
  ON public.sessions
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Athletes insert own sessions"
  ON public.sessions
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes update own sessions"
  ON public.sessions
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes delete own sessions"
  ON public.sessions
  FOR DELETE
  USING (athlete_id = auth.uid());

-- =====================================================
-- readiness_daily - REMOVED (table doesn't exist, replaced by wellness_data)
-- =====================================================
-- Note: readiness_daily table was planned but never created
-- Database uses wellness_data table instead (created in B3e-T5)
-- RLS policies for wellness_data will be added in a future migration if needed

-- =====================================================
-- plan (existing table from Cycle 1)
-- =====================================================

ALTER TABLE public.plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own plan"
  ON public.plan
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "System manage plan"
  ON public.plan
  FOR ALL
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- =====================================================
-- Rollback Script
-- =====================================================

-- To rollback, drop all policies:
-- DROP POLICY IF EXISTS "Athletes read own profile" ON public.athlete_profiles;
-- DROP POLICY IF EXISTS "Athletes insert own profile" ON public.athlete_profiles;
-- DROP POLICY IF EXISTS "Athletes update own profile" ON public.athlete_profiles;
-- DROP POLICY IF EXISTS "Athletes read own preferences" ON public.athlete_preferences;
-- DROP POLICY IF EXISTS "Athletes insert own preferences" ON public.athlete_preferences;
-- DROP POLICY IF EXISTS "Athletes update own preferences" ON public.athlete_preferences;
-- DROP POLICY IF EXISTS "Athletes read own races" ON public.race_calendar;
-- DROP POLICY IF EXISTS "Athletes insert own races" ON public.race_calendar;
-- DROP POLICY IF EXISTS "Athletes update own races" ON public.race_calendar;
-- DROP POLICY IF EXISTS "Athletes delete own races" ON public.race_calendar;
-- DROP POLICY IF EXISTS "Athletes read own constraints" ON public.athlete_constraints;
-- DROP POLICY IF EXISTS "Athletes insert own constraints" ON public.athlete_constraints;
-- DROP POLICY IF EXISTS "Athletes update own constraints" ON public.athlete_constraints;
-- DROP POLICY IF EXISTS "Athletes delete own constraints" ON public.athlete_constraints;
-- DROP POLICY IF EXISTS "Athletes read own sessions" ON public.sessions;
-- DROP POLICY IF EXISTS "Athletes insert own sessions" ON public.sessions;
-- DROP POLICY IF EXISTS "Athletes update own sessions" ON public.sessions;
-- DROP POLICY IF EXISTS "Athletes delete own sessions" ON public.sessions;
-- readiness_daily policies removed (table doesn't exist)
-- DROP POLICY IF EXISTS "Athletes read own plan" ON public.plan;
-- DROP POLICY IF EXISTS "System manage plan" ON public.plan;
-- DROP FUNCTION IF EXISTS public.get_current_athlete_id();
-- 
-- Disable RLS:
-- ALTER TABLE public.athlete_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.athlete_preferences DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.race_calendar DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.athlete_constraints DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
-- readiness_daily removed (table doesn't exist)
-- ALTER TABLE public.plan DISABLE ROW LEVEL SECURITY;

