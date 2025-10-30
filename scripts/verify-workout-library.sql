-- =====================================================
-- Workout Library Verification Queries
-- Run these in Supabase SQL Editor to verify deployment
-- =====================================================

-- 1. Check if workout_library table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'workout_library'
) as table_exists;

-- 2. Count total workouts (expect 85)
SELECT COUNT(*) as total_workouts
FROM public.workout_library;

-- 3. Distribution by Sport
SELECT
  sport,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.workout_library), 1) as percentage
FROM public.workout_library
GROUP BY sport
ORDER BY sport;

-- 4. Distribution by Phase
SELECT
  phase,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.workout_library), 1) as percentage
FROM public.workout_library
GROUP BY phase
ORDER BY phase;

-- 5. Distribution by Zone
SELECT
  primary_zone,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.workout_library), 1) as percentage
FROM public.workout_library
GROUP BY primary_zone
ORDER BY count DESC;

-- 6. Duration Distribution
SELECT
  CASE
    WHEN duration_min <= 30 THEN '20-30 min'
    WHEN duration_min <= 45 THEN '31-45 min'
    WHEN duration_min <= 60 THEN '46-60 min'
    WHEN duration_min <= 90 THEN '61-90 min'
    ELSE '91+ min'
  END as duration_range,
  COUNT(*) as count
FROM public.workout_library
GROUP BY duration_range
ORDER BY MIN(duration_min);

-- 7. Test Helper Function: get_workouts_by_sport_phase
SELECT workout_id, title, duration_min, load_hint
FROM public.get_workouts_by_sport_phase('run', 'base')
LIMIT 5;

-- 8. Test Helper Function: get_workouts_by_zone
SELECT workout_id, title, duration_min, load_hint
FROM public.get_workouts_by_zone('run', 'z4', 60)
LIMIT 5;

-- 9. Test Helper Function: search_workouts_by_tags
SELECT workout_id, title, focus_tags
FROM public.search_workouts_by_tags('bike', ARRAY['threshold'])
LIMIT 5;

-- 10. Check RLS Policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'workout_library';

-- =====================================================
-- Expected Results Summary:
-- =====================================================
-- Total workouts: 85
-- Sports: bike (25), run (23), swim (20), strength (17)
-- Phases: build (27), base (25), peak (16), taper (9), recovery (8)
-- Zones: z2 (27), strength (17), z4 (15), z3 (13), z5 (7), z1 (6)
-- RLS: 1 policy (SELECT for authenticated users)
-- Helper functions: 3 functions should work
