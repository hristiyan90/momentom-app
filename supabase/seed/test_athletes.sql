-- =====================================================
-- Test Data: Sample Athletes
-- Sprint 1.5: Database Foundation
-- Used for development and testing
-- =====================================================

-- =====================================================
-- Test Athlete 1: Beginner Triathlete (Minimal Data)
-- =====================================================

INSERT INTO public.athlete_profiles (
  athlete_id, 
  email, 
  name, 
  date_of_birth, 
  experience_level,
  available_hours_per_week, 
  training_days_per_week
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'beginner@momentom.test',
  'Beginner Betty',
  '1995-03-15',
  'beginner',
  8.0,
  4
)
ON CONFLICT (athlete_id) DO NOTHING;

INSERT INTO public.athlete_preferences (
  athlete_id, 
  focus_discipline, 
  has_bike, 
  has_pool_access
)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'balanced', 
  TRUE, 
  TRUE
)
ON CONFLICT (athlete_id) DO NOTHING;

INSERT INTO public.race_calendar (
  athlete_id, 
  race_date, 
  race_type, 
  priority, 
  race_name
)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  '2025-08-15', 
  'sprint', 
  'A', 
  'First Sprint Triathlon'
)
ON CONFLICT (race_id) DO NOTHING;

-- =====================================================
-- Test Athlete 2: Advanced Triathlete (With Thresholds)
-- =====================================================

INSERT INTO public.athlete_profiles (
  athlete_id, 
  email, 
  name, 
  date_of_birth, 
  experience_level,
  ftp_watts, 
  threshold_pace_min_per_km, 
  swim_css_pace_min_per_100m,
  max_heart_rate, 
  resting_heart_rate,
  available_hours_per_week, 
  training_days_per_week
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'advanced@momentom.test',
  'Advanced Andy',
  '1988-07-22',
  'advanced',
  285,
  3.75,
  1.35,
  185,
  48,
  15.0,
  6
)
ON CONFLICT (athlete_id) DO NOTHING;

INSERT INTO public.athlete_preferences (
  athlete_id, 
  focus_discipline, 
  preferred_training_time,
  has_bike, 
  has_pool_access, 
  has_power_meter, 
  has_hr_monitor
) VALUES (
  '22222222-2222-2222-2222-222222222222', 
  'bike', 
  'morning',
  TRUE, 
  TRUE, 
  TRUE, 
  TRUE
)
ON CONFLICT (athlete_id) DO NOTHING;

INSERT INTO public.race_calendar (
  athlete_id, 
  race_date, 
  race_type, 
  priority, 
  race_name
)
VALUES 
  (
    '22222222-2222-2222-2222-222222222222', 
    '2025-09-20', 
    '70.3', 
    'A', 
    'Iron Man 70.3 Regional'
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    '2025-06-10', 
    'olympic', 
    'B', 
    'Olympic Tune-Up'
  )
ON CONFLICT (race_id) DO NOTHING;

-- =====================================================
-- Test Athlete 3: Intermediate with Injury Constraint
-- =====================================================

INSERT INTO public.athlete_profiles (
  athlete_id, 
  email, 
  name, 
  date_of_birth, 
  experience_level,
  available_hours_per_week, 
  training_days_per_week
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'injured@momentom.test',
  'Injured Ian',
  '1992-11-05',
  'intermediate',
  10.0,
  5
)
ON CONFLICT (athlete_id) DO NOTHING;

INSERT INTO public.athlete_preferences (
  athlete_id, 
  focus_discipline
)
VALUES (
  '33333333-3333-3333-3333-333333333333', 
  'run'
)
ON CONFLICT (athlete_id) DO NOTHING;

INSERT INTO public.athlete_constraints (
  athlete_id, 
  constraint_type, 
  affected_disciplines, 
  start_date, 
  severity, 
  description
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'injury',
  ARRAY['run']::TEXT[],
  '2025-10-01',
  'moderate',
  'Plantar fasciitis - no running for 4 weeks'
)
ON CONFLICT (constraint_id) DO NOTHING;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify all 3 athletes created
SELECT 'Test Athletes Created:' AS status;
SELECT 
  athlete_id, 
  name, 
  experience_level, 
  available_hours_per_week
FROM public.athlete_profiles
WHERE athlete_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
ORDER BY experience_level;

-- Verify preferences created
SELECT 'Test Preferences Created:' AS status;
SELECT 
  athlete_id, 
  focus_discipline, 
  has_bike, 
  has_pool_access
FROM public.athlete_preferences
WHERE athlete_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
ORDER BY athlete_id;

-- Verify races created
SELECT 'Test Races Created:' AS status;
SELECT 
  athlete_id, 
  race_date, 
  race_type, 
  priority, 
  race_name
FROM public.race_calendar
WHERE athlete_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
ORDER BY athlete_id, race_date;

-- Verify constraints created
SELECT 'Test Constraints Created:' AS status;
SELECT 
  athlete_id, 
  constraint_type, 
  affected_disciplines, 
  severity, 
  description
FROM public.athlete_constraints
WHERE athlete_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
ORDER BY athlete_id;

SELECT 'Test data seed complete!' AS summary;

