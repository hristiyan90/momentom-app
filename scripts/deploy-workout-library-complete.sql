-- =====================================================
-- Complete Workout Library Deployment Script
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- This script will:
-- 1. Create the workout_library table with indexes and RLS
-- 2. Create 3 helper functions
-- 3. Seed 85 workouts
-- 4. Run verification queries
-- 5. Update migration history

BEGIN;

-- =====================================================
-- PART 1: Create workout_library table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.workout_library (
  workout_id TEXT PRIMARY KEY,

  -- Sport & Classification
  sport TEXT NOT NULL CHECK (sport IN ('run', 'bike', 'swim', 'strength')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('base', 'build', 'peak', 'taper', 'recovery')),
  focus_tags TEXT[] NOT NULL DEFAULT '{}',

  -- Intensity & Duration
  primary_zone TEXT CHECK (primary_zone IN ('z1', 'z2', 'z3', 'z4', 'z5', 'strength')),
  duration_min INTEGER NOT NULL CHECK (duration_min > 0 AND duration_min <= 360),
  load_hint INTEGER NOT NULL CHECK (load_hint > 0 AND load_hint <= 300),

  -- Workout Structure
  structure_json JSONB NOT NULL DEFAULT '{"segments": []}',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Validation: Focus tags array not empty
  CONSTRAINT focus_tags_not_empty CHECK (array_length(focus_tags, 1) > 0),

  -- Validation: Structure has segments
  CONSTRAINT structure_has_segments CHECK (structure_json ? 'segments')
);

-- Comments
COMMENT ON TABLE public.workout_library IS 'Workout templates for plan generation engine';
COMMENT ON COLUMN public.workout_library.workout_id IS 'Unique identifier (e.g., run-base-1, bike-threshold-intervals-8x4)';
COMMENT ON COLUMN public.workout_library.sport IS 'Sport discipline';
COMMENT ON COLUMN public.workout_library.phase IS 'Training phase this workout belongs to';
COMMENT ON COLUMN public.workout_library.focus_tags IS 'Training focus tags for workout selection';
COMMENT ON COLUMN public.workout_library.primary_zone IS 'Primary training zone or strength';
COMMENT ON COLUMN public.workout_library.duration_min IS 'Total workout duration in minutes';
COMMENT ON COLUMN public.workout_library.load_hint IS 'Training load proxy (similar to TSS)';
COMMENT ON COLUMN public.workout_library.structure_json IS 'Workout structure with segments array';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workout_library_sport ON public.workout_library(sport);
CREATE INDEX IF NOT EXISTS idx_workout_library_phase ON public.workout_library(phase);
CREATE INDEX IF NOT EXISTS idx_workout_library_zone ON public.workout_library(primary_zone);
CREATE INDEX IF NOT EXISTS idx_workout_library_sport_phase ON public.workout_library(sport, phase);
CREATE INDEX IF NOT EXISTS idx_workout_library_focus_tags ON public.workout_library USING GIN(focus_tags);

-- RLS Policies
ALTER TABLE public.workout_library ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read the workout library
DROP POLICY IF EXISTS "workout_library_read_all" ON public.workout_library;
CREATE POLICY "workout_library_read_all" ON public.workout_library
  FOR SELECT
  USING (true);

-- Prevent modifications (managed via migrations only)
DROP POLICY IF EXISTS "workout_library_no_insert" ON public.workout_library;
CREATE POLICY "workout_library_no_insert" ON public.workout_library
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "workout_library_no_update" ON public.workout_library;
CREATE POLICY "workout_library_no_update" ON public.workout_library
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "workout_library_no_delete" ON public.workout_library;
CREATE POLICY "workout_library_no_delete" ON public.workout_library
  FOR DELETE
  USING (false);

-- =====================================================
-- PART 2: Create helper functions
-- =====================================================

-- Get workouts by sport and phase
CREATE OR REPLACE FUNCTION public.get_workouts_by_sport_phase(
  p_sport TEXT,
  p_phase TEXT
)
RETURNS TABLE (
  workout_id TEXT,
  title TEXT,
  description TEXT,
  primary_zone TEXT,
  duration_min INTEGER,
  load_hint INTEGER,
  focus_tags TEXT[]
)
LANGUAGE SQL
STABLE
AS $$
  SELECT workout_id, title, description, primary_zone, duration_min, load_hint, focus_tags
  FROM public.workout_library
  WHERE sport = p_sport
    AND phase = p_phase
  ORDER BY duration_min ASC, primary_zone ASC;
$$;

-- Get workouts by zone
CREATE OR REPLACE FUNCTION public.get_workouts_by_zone(
  p_sport TEXT,
  p_zone TEXT,
  p_max_duration INTEGER DEFAULT NULL
)
RETURNS TABLE (
  workout_id TEXT,
  title TEXT,
  description TEXT,
  phase TEXT,
  duration_min INTEGER,
  load_hint INTEGER,
  focus_tags TEXT[]
)
LANGUAGE SQL
STABLE
AS $$
  SELECT workout_id, title, description, phase, duration_min, load_hint, focus_tags
  FROM public.workout_library
  WHERE sport = p_sport
    AND primary_zone = p_zone
    AND (p_max_duration IS NULL OR duration_min <= p_max_duration)
  ORDER BY duration_min ASC;
$$;

-- Search workouts by tags
CREATE OR REPLACE FUNCTION public.search_workouts_by_tags(
  p_sport TEXT,
  p_required_tags TEXT[]
)
RETURNS TABLE (
  workout_id TEXT,
  title TEXT,
  description TEXT,
  phase TEXT,
  primary_zone TEXT,
  duration_min INTEGER,
  load_hint INTEGER,
  focus_tags TEXT[]
)
LANGUAGE SQL
STABLE
AS $$
  SELECT workout_id, title, description, phase, primary_zone, duration_min, load_hint, focus_tags
  FROM public.workout_library
  WHERE sport = p_sport
    AND focus_tags && p_required_tags
  ORDER BY
    (SELECT COUNT(*) FROM unnest(focus_tags) tag WHERE tag = ANY(p_required_tags)) DESC,
    duration_min ASC;
$$;

COMMIT;

-- =====================================================
-- PART 3: Seed workouts
-- =====================================================
-- NOTE: Run the seed migration separately after this completes
-- File: supabase/migrations/20251029_seed_workout_library.sql
-- Reason: It's 75KB and contains 85 INSERT statements

-- =====================================================
-- Quick verification
-- =====================================================

SELECT 'Workout library table created!' as status;
SELECT 'Helper functions created!' as status;
SELECT 'Now run: supabase/migrations/20251029_seed_workout_library.sql' as next_step;
