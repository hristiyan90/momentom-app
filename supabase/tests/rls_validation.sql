-- =====================================================
-- RLS Validation Tests
-- Sprint 1.5: Database Foundation
-- =====================================================

-- =====================================================
-- Test 1: Schema Validation
-- =====================================================

-- Verify all 4 new tables exist
SELECT 'Test 1.1: Verify tables created' AS test_name;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('athlete_profiles', 'athlete_preferences', 'race_calendar', 'athlete_constraints')
ORDER BY table_name;
-- Expected: 4 rows

-- Verify all helper functions exist
SELECT 'Test 1.2: Verify helper functions exist' AS test_name;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_athlete_age', 'get_active_constraints', 'get_next_a_race', 'get_current_athlete_id')
ORDER BY routine_name;
-- Expected: 4 rows

-- Verify RLS is enabled on all tables
SELECT 'Test 1.3: Verify RLS enabled' AS test_name;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('athlete_profiles', 'athlete_preferences', 'race_calendar', 'athlete_constraints', 'sessions', 'readiness_daily', 'plan')
ORDER BY tablename;
-- Expected: 7 rows, all with rowsecurity = true

-- =====================================================
-- Test 2: Constraint Validation (should all FAIL)
-- =====================================================

-- Test 2.1: Age < 13 (should FAIL)
SELECT 'Test 2.1: Age validation (< 13) - SHOULD FAIL' AS test_name;
-- INSERT INTO athlete_profiles (
--   athlete_id, email, name, date_of_birth, experience_level,
--   available_hours_per_week, training_days_per_week
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'child@test.com',
--   'Too Young',
--   '2020-01-01',
--   'beginner',
--   5.0,
--   3
-- );
-- Expected: ERROR violates check constraint "minimum_age_13"

-- Test 2.2: Future date of birth (should FAIL)
SELECT 'Test 2.2: Date of birth validation (future) - SHOULD FAIL' AS test_name;
-- INSERT INTO athlete_profiles (
--   athlete_id, email, name, date_of_birth, experience_level,
--   available_hours_per_week, training_days_per_week
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000002',
--   'future@test.com',
--   'Future Person',
--   '2030-01-01',
--   'beginner',
--   8.0,
--   4
-- );
-- Expected: ERROR violates check constraint "date_of_birth_in_past"

-- Test 2.3: Invalid FTP (should FAIL)
SELECT 'Test 2.3: FTP validation (out of range) - SHOULD FAIL' AS test_name;
-- INSERT INTO athlete_profiles (
--   athlete_id, email, name, date_of_birth, experience_level,
--   ftp_watts, available_hours_per_week, training_days_per_week
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000003',
--   'ftp@test.com',
--   'Invalid FTP',
--   '1990-01-01',
--   'advanced',
--   999,
--   10.0,
--   5
-- );
-- Expected: ERROR violates check constraint on ftp_watts

-- Test 2.4: Invalid threshold pace (should FAIL)
SELECT 'Test 2.4: Threshold pace validation (out of range) - SHOULD FAIL' AS test_name;
-- INSERT INTO athlete_profiles (
--   athlete_id, email, name, date_of_birth, experience_level,
--   threshold_pace_min_per_km, available_hours_per_week, training_days_per_week
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000004',
--   'pace@test.com',
--   'Invalid Pace',
--   '1990-01-01',
--   'advanced',
--   1.5,
--   10.0,
--   5
-- );
-- Expected: ERROR violates check constraint on threshold_pace_min_per_km

-- Test 2.5: No training days available (should FAIL)
SELECT 'Test 2.5: Training days validation (none available) - SHOULD FAIL' AS test_name;
-- First create a valid athlete profile
-- INSERT INTO athlete_profiles (
--   athlete_id, email, name, date_of_birth, experience_level,
--   available_hours_per_week, training_days_per_week
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000005',
--   'nodays@test.com',
--   'No Days',
--   '1990-01-01',
--   'beginner',
--   5.0,
--   3
-- );
-- Then try to create preferences with no days available
-- INSERT INTO athlete_preferences (
--   athlete_id,
--   sunday_available, monday_available, tuesday_available,
--   wednesday_available, thursday_available, friday_available, saturday_available
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000005',
--   FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE
-- );
-- Expected: ERROR violates check constraint "at_least_one_day_available"

-- Test 2.6: Race in past with status 'planned' (should FAIL)
SELECT 'Test 2.6: Planned race in past - SHOULD FAIL' AS test_name;
-- INSERT INTO race_calendar (
--   athlete_id, race_date, race_type, priority, status
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000005',
--   '2020-01-01',
--   'sprint',
--   'A',
--   'planned'
-- );
-- Expected: ERROR violates check constraint "planned_races_in_future"

-- =====================================================
-- Test 3: Helper Functions
-- =====================================================

-- Test 3.1: Age calculation
SELECT 'Test 3.1: Age calculation' AS test_name;
SELECT get_athlete_age('1990-05-15'::DATE) AS calculated_age;
-- Expected: 35 (as of October 2025)

SELECT get_athlete_age('2000-01-01'::DATE) AS calculated_age;
-- Expected: 25 (as of October 2025)

-- Test 3.2: Current athlete ID (requires auth context)
SELECT 'Test 3.2: Current athlete ID' AS test_name;
SELECT get_current_athlete_id();
-- Expected: Returns UUID of authenticated user (auth.uid())

-- =====================================================
-- Test 4: RLS Isolation (3-Account Test)
-- =====================================================

-- Setup: Create 3 test athletes via Supabase Auth UI
-- athlete1: 11111111-1111-1111-1111-111111111111
-- athlete2: 22222222-2222-2222-2222-222222222222
-- athlete3: 33333333-3333-3333-3333-333333333333

SELECT 'Test 4.1: Create test athletes (run manually with proper auth)' AS test_name;
-- NOTE: These inserts should be run with proper JWT authentication
-- They are commented out to avoid errors when running the entire script

-- Test 4.2: Athlete 1 can only see own profile
SELECT 'Test 4.2: RLS isolation - athlete sees only own data' AS test_name;
-- (Run with athlete1's JWT)
-- SELECT * FROM athlete_profiles;
-- Expected: Only athlete1's row

-- Test 4.3: Athlete 1 cannot see athlete 2's data
SELECT 'Test 4.3: RLS isolation - cannot see other athlete data' AS test_name;
-- (Run with athlete1's JWT)
-- SELECT * FROM athlete_profiles WHERE athlete_id = '22222222-2222-2222-2222-222222222222';
-- Expected: 0 rows

-- Test 4.4: Cross-athlete session access blocked
SELECT 'Test 4.4: RLS isolation - sessions access blocked' AS test_name;
-- (Run with athlete2's JWT)
-- SELECT * FROM sessions WHERE athlete_id = '11111111-1111-1111-1111-111111111111';
-- Expected: 0 rows

-- Test 4.5: Athlete cannot insert data for another athlete
SELECT 'Test 4.5: RLS isolation - cannot insert for other athlete' AS test_name;
-- (Run with athlete3's JWT)
-- INSERT INTO race_calendar (athlete_id, race_date, race_type, priority)
-- VALUES ('11111111-1111-1111-1111-111111111111', '2025-07-01', 'olympic', 'A');
-- Expected: ERROR - RLS policy violation

-- =====================================================
-- Test 5: Performance Tests
-- =====================================================

-- Test 5.1: Profile lookup by athlete_id (should use index)
SELECT 'Test 5.1: Profile lookup performance' AS test_name;
-- EXPLAIN ANALYZE 
-- SELECT * FROM athlete_profiles 
-- WHERE athlete_id = '11111111-1111-1111-1111-111111111111';
-- Expected: Index scan, < 1ms

-- Test 5.2: Race calendar date range query (should use index)
SELECT 'Test 5.2: Race calendar date range performance' AS test_name;
-- EXPLAIN ANALYZE 
-- SELECT * FROM race_calendar 
-- WHERE athlete_id = '11111111-1111-1111-1111-111111111111'
--   AND race_date >= CURRENT_DATE
-- ORDER BY race_date;
-- Expected: Index scan on idx_race_calendar_dates, < 5ms

-- Test 5.3: Active constraints query (should use partial index)
SELECT 'Test 5.3: Active constraints performance' AS test_name;
-- EXPLAIN ANALYZE 
-- SELECT * FROM athlete_constraints
-- WHERE athlete_id = '11111111-1111-1111-1111-111111111111'
--   AND start_date <= CURRENT_DATE
--   AND (end_date IS NULL OR end_date >= CURRENT_DATE);
-- Expected: Index scan on idx_athlete_constraints_active, < 5ms

-- =====================================================
-- Test Summary
-- =====================================================

SELECT 'All validation tests defined. Run individual tests manually with proper authentication context.' AS summary;

