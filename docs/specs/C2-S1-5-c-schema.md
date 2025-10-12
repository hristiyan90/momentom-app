# Specification: Athlete Data Schema Expansion

**Task ID:** 1.5-C  
**Sprint:** 1.5 - Foundation & User Lifecycle  
**Owner:** Product Architect  
**Status:** ✅ Implemented (PR #30)  
**Updated:** October 12, 2025

---

## 1) Scope

### In Scope
- Athlete profile schema (demographics, fitness metrics, experience)
- Training preferences (time, focus, metrics)
- Race calendar (A/B/C priorities, dates, types)
- Training constraints (injuries, availability, equipment)
- Quick vs Advanced onboarding data mapping
- Complete SQL migrations with validation rules
- Indexes for query performance

### Out of Scope
- Historical training data import - Sprint 2+
- Coach/team management - Sprint 4+
- Workout completion tracking - covered by `sessions` table (Cycle 1)
- Race results/performance - Sprint 3+

---

## 2) Requirements

### Functional Requirements

#### FR-1: Athlete Profile
**Purpose:** Store athlete demographics, fitness metrics, and experience level  
**Fields:**
- `athlete_id` (UUID, PK) - matches auth.uid()
- `email` (TEXT, unique, required) - from Supabase auth
- `name` (TEXT, required) - display name
- `date_of_birth` (DATE, required) - for age calculation
- `experience_level` (TEXT, required) - enum: beginner/intermediate/advanced/elite
- `ftp_watts` (INTEGER, optional) - cycling threshold power (50-500W)
- `threshold_pace_min_per_km` (DECIMAL(4,2), optional) - running threshold (2.5-8.0 min/km)
- `swim_css_pace_min_per_100m` (DECIMAL(4,2), optional) - swim critical speed (1.0-4.0 min/100m)
- `max_heart_rate` (INTEGER, optional) - 100-220 bpm
- `resting_heart_rate` (INTEGER, optional) - 30-100 bpm
- `available_hours_per_week` (DECIMAL(4,1), required) - 1.0-30.0 hours
- `training_days_per_week` (INTEGER, required) - 1-7 days

#### FR-2: Training Preferences
**Purpose:** Store athlete's training preferences and constraints  
**Fields:**
- `athlete_id` (UUID, PK, FK → athlete_profiles)
- `preferred_training_time` (TEXT) - enum: morning/afternoon/evening/flexible
- `focus_discipline` (TEXT) - enum: swim/bike/run/balanced
- `preferred_run_metric` (TEXT) - enum: pace/power/hr (default: pace)
- `preferred_bike_metric` (TEXT) - enum: power/hr (default: power)
- `preferred_swim_metric` (TEXT) - enum: pace/hr (default: pace)
- `sunday_available` (BOOLEAN, default: true)
- `monday_available` (BOOLEAN, default: true)
- `tuesday_available` (BOOLEAN, default: true)
- `wednesday_available` (BOOLEAN, default: true)
- `thursday_available` (BOOLEAN, default: true)
- `friday_available` (BOOLEAN, default: true)
- `saturday_available` (BOOLEAN, default: true)

#### FR-3: Race Calendar
**Purpose:** Store planned races with priorities and details  
**Fields:**
- `race_id` (UUID, PK)
- `athlete_id` (UUID, FK → athlete_profiles)
- `race_date` (DATE, required)
- `race_type` (TEXT, required) - enum: sprint/olympic/70.3/140.6/marathon/ultra
- `priority` (TEXT, required) - enum: A/B/C
- `race_name` (TEXT, optional)
- `location` (TEXT, optional)
- `notes` (TEXT, optional)
- `status` (TEXT, default: planned) - enum: planned/completed/dns/dnf

#### FR-4: Training Constraints
**Purpose:** Track injuries, time off, equipment limitations  
**Fields:**
- `constraint_id` (UUID, PK)
- `athlete_id` (UUID, FK → athlete_profiles)
- `constraint_type` (TEXT, required) - enum: injury/equipment/availability
- `affected_disciplines` (TEXT[], required) - array: swim/bike/run/strength
- `start_date` (DATE, required)
- `end_date` (DATE, optional) - null means ongoing
- `severity` (TEXT, required) - enum: mild/moderate/severe
- `description` (TEXT, optional)

### Non-Functional Requirements

#### NFR-1: Data Validation
- Age calculated from `date_of_birth` must be ≥ 13 (legal requirement)
- Date of birth must be in the past
- Planned race dates must be in the future
- Fitness thresholds within realistic ranges
- Available hours/week ≤ 168 (total hours in week)

#### NFR-2: Performance
- Profile reads < 50ms
- Indexes on foreign keys and date ranges
- Denormalize athlete name in plan/sessions for display (avoid JOIN)

#### NFR-3: Privacy
- All data scoped by athlete_id via RLS (see Task 1.5-A)
- No PII exposed in logs or error messages

---

## 3) Data Model & Migrations

### Complete Migration: Athlete Schema

**File:** `supabase/migrations/20251011000002_athlete_schema.sql`

```sql
-- =====================================================
-- Athlete Data Schema
-- Sprint 1.5-C: Athlete Data Schema Expansion
-- =====================================================

-- =====================================================
-- 1. athlete_profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS public.athlete_profiles (
  athlete_id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'elite')),
  
  -- Fitness Thresholds (optional, used for zone calculations)
  ftp_watts INTEGER CHECK (ftp_watts IS NULL OR (ftp_watts >= 50 AND ftp_watts <= 500)),
  threshold_pace_min_per_km DECIMAL(4,2) CHECK (threshold_pace_min_per_km IS NULL OR (threshold_pace_min_per_km >= 2.5 AND threshold_pace_min_per_km <= 8.0)),
  swim_css_pace_min_per_100m DECIMAL(4,2) CHECK (swim_css_pace_min_per_100m IS NULL OR (swim_css_pace_min_per_100m >= 1.0 AND swim_css_pace_min_per_100m <= 4.0)),
  max_heart_rate INTEGER CHECK (max_heart_rate IS NULL OR (max_heart_rate >= 100 AND max_heart_rate <= 220)),
  resting_heart_rate INTEGER CHECK (resting_heart_rate IS NULL OR (resting_heart_rate >= 30 AND resting_heart_rate <= 100)),
  
  -- Training Capacity
  available_hours_per_week DECIMAL(4,1) NOT NULL CHECK (available_hours_per_week >= 1.0 AND available_hours_per_week <= 30.0),
  training_days_per_week INTEGER NOT NULL CHECK (training_days_per_week >= 1 AND training_days_per_week <= 7),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validation: Date of birth in past
  CONSTRAINT date_of_birth_in_past CHECK (date_of_birth < CURRENT_DATE),
  
  -- Validation: Minimum age 13 (COPPA compliance)
  CONSTRAINT minimum_age_13 CHECK (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) >= 13),
  
  -- Validation: Available hours realistic
  CONSTRAINT available_hours_realistic CHECK (available_hours_per_week <= training_days_per_week * 24)
);

-- Indexes
CREATE INDEX idx_athlete_profiles_email ON public.athlete_profiles(email);
CREATE INDEX idx_athlete_profiles_experience ON public.athlete_profiles(experience_level);

-- Trigger: Update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_athlete_profiles_updated_at
  BEFORE UPDATE ON public.athlete_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. athlete_preferences
-- =====================================================

CREATE TABLE IF NOT EXISTS public.athlete_preferences (
  athlete_id UUID PRIMARY KEY REFERENCES public.athlete_profiles(athlete_id) ON DELETE CASCADE,
  
  -- Training Time & Focus
  preferred_training_time TEXT CHECK (preferred_training_time IN ('morning', 'afternoon', 'evening', 'flexible')),
  focus_discipline TEXT CHECK (focus_discipline IN ('swim', 'bike', 'run', 'balanced')),
  
  -- Metric Preferences
  preferred_run_metric TEXT NOT NULL DEFAULT 'pace' CHECK (preferred_run_metric IN ('pace', 'power', 'hr')),
  preferred_bike_metric TEXT NOT NULL DEFAULT 'power' CHECK (preferred_bike_metric IN ('power', 'hr')),
  preferred_swim_metric TEXT NOT NULL DEFAULT 'pace' CHECK (preferred_swim_metric IN ('pace', 'hr')),
  
  -- Weekly Availability
  sunday_available BOOLEAN NOT NULL DEFAULT TRUE,
  monday_available BOOLEAN NOT NULL DEFAULT TRUE,
  tuesday_available BOOLEAN NOT NULL DEFAULT TRUE,
  wednesday_available BOOLEAN NOT NULL DEFAULT TRUE,
  thursday_available BOOLEAN NOT NULL DEFAULT TRUE,
  friday_available BOOLEAN NOT NULL DEFAULT TRUE,
  saturday_available BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Equipment Access
  has_bike BOOLEAN NOT NULL DEFAULT TRUE,
  has_pool_access BOOLEAN NOT NULL DEFAULT TRUE,
  has_power_meter BOOLEAN NOT NULL DEFAULT FALSE,
  has_hr_monitor BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validation: At least one training day available
  CONSTRAINT at_least_one_day_available CHECK (
    sunday_available OR monday_available OR tuesday_available OR 
    wednesday_available OR thursday_available OR friday_available OR saturday_available
  )
);

CREATE TRIGGER update_athlete_preferences_updated_at
  BEFORE UPDATE ON public.athlete_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. race_calendar
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_calendar (
  race_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.athlete_profiles(athlete_id) ON DELETE CASCADE,
  
  -- Race Details
  race_date DATE NOT NULL,
  race_type TEXT NOT NULL CHECK (race_type IN ('sprint', 'olympic', '70.3', '140.6', 'marathon', 'ultra', '5k', '10k', 'half_marathon')),
  priority TEXT NOT NULL CHECK (priority IN ('A', 'B', 'C')),
  race_name TEXT,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'dns', 'dnf')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validation: Planned races must be in future
  CONSTRAINT planned_races_in_future CHECK (
    status != 'planned' OR race_date >= CURRENT_DATE
  )
);

-- Indexes
CREATE INDEX idx_race_calendar_athlete ON public.race_calendar(athlete_id);
CREATE INDEX idx_race_calendar_dates ON public.race_calendar(athlete_id, race_date);
CREATE INDEX idx_race_calendar_priority ON public.race_calendar(athlete_id, priority, race_date);

CREATE TRIGGER update_race_calendar_updated_at
  BEFORE UPDATE ON public.race_calendar
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. athlete_constraints
-- =====================================================

CREATE TABLE IF NOT EXISTS public.athlete_constraints (
  constraint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.athlete_profiles(athlete_id) ON DELETE CASCADE,
  
  -- Constraint Details
  constraint_type TEXT NOT NULL CHECK (constraint_type IN ('injury', 'equipment', 'availability')),
  affected_disciplines TEXT[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  description TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validation: End date after start date
  CONSTRAINT end_after_start CHECK (end_date IS NULL OR end_date >= start_date),
  
  -- Validation: At least one discipline affected
  CONSTRAINT at_least_one_discipline CHECK (array_length(affected_disciplines, 1) > 0),
  
  -- Validation: Valid disciplines only
  CONSTRAINT valid_disciplines CHECK (
    affected_disciplines <@ ARRAY['swim', 'bike', 'run', 'strength']::TEXT[]
  )
);

-- Indexes
CREATE INDEX idx_athlete_constraints_athlete ON public.athlete_constraints(athlete_id);
CREATE INDEX idx_athlete_constraints_dates ON public.athlete_constraints(athlete_id, start_date, end_date);
CREATE INDEX idx_athlete_constraints_active ON public.athlete_constraints(athlete_id, start_date, end_date) 
  WHERE end_date IS NULL OR end_date >= CURRENT_DATE;

CREATE TRIGGER update_athlete_constraints_updated_at
  BEFORE UPDATE ON public.athlete_constraints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Calculate athlete age
CREATE OR REPLACE FUNCTION public.get_athlete_age(p_date_of_birth DATE)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_date_of_birth))::INTEGER;
$$;

-- Get active constraints for athlete
CREATE OR REPLACE FUNCTION public.get_active_constraints(p_athlete_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  constraint_id UUID,
  constraint_type TEXT,
  affected_disciplines TEXT[],
  severity TEXT,
  description TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT constraint_id, constraint_type, affected_disciplines, severity, description
  FROM public.athlete_constraints
  WHERE athlete_id = p_athlete_id
    AND start_date <= p_date
    AND (end_date IS NULL OR end_date >= p_date);
$$;

-- Get next A-priority race
CREATE OR REPLACE FUNCTION public.get_next_a_race(p_athlete_id UUID)
RETURNS TABLE (
  race_id UUID,
  race_date DATE,
  race_type TEXT,
  race_name TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT race_id, race_date, race_type, race_name
  FROM public.race_calendar
  WHERE athlete_id = p_athlete_id
    AND priority = 'A'
    AND status = 'planned'
    AND race_date >= CURRENT_DATE
  ORDER BY race_date ASC
  LIMIT 1;
$$;

-- =====================================================
-- Rollback Script
-- =====================================================

-- To rollback, run in reverse order:
-- DROP FUNCTION IF EXISTS public.get_next_a_race(UUID);
-- DROP FUNCTION IF EXISTS public.get_active_constraints(UUID, DATE);
-- DROP FUNCTION IF EXISTS public.get_athlete_age(DATE);
-- DROP TABLE IF EXISTS public.athlete_constraints CASCADE;
-- DROP TABLE IF EXISTS public.race_calendar CASCADE;
-- DROP TABLE IF EXISTS public.athlete_preferences CASCADE;
-- DROP TABLE IF EXISTS public.athlete_profiles CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
```

### Test Data: Sample Athletes

**File:** `supabase/seed/test_athletes.sql`

```sql
-- =====================================================
-- Test Data: Sample Athletes
-- Used for development and testing
-- =====================================================

-- Test Athlete 1: Beginner Triathlete
INSERT INTO public.athlete_profiles (
  athlete_id, email, name, date_of_birth, experience_level,
  available_hours_per_week, training_days_per_week
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'beginner@momentom.test',
  'Beginner Betty',
  '1995-03-15',
  'beginner',
  8.0,
  4
);

INSERT INTO public.athlete_preferences (athlete_id, focus_discipline, has_bike, has_pool_access)
VALUES ('11111111-1111-1111-1111-111111111111', 'balanced', TRUE, TRUE);

INSERT INTO public.race_calendar (athlete_id, race_date, race_type, priority, race_name)
VALUES ('11111111-1111-1111-1111-111111111111', '2025-08-15', 'sprint', 'A', 'First Sprint Triathlon');

-- Test Athlete 2: Advanced Triathlete with Thresholds
INSERT INTO public.athlete_profiles (
  athlete_id, email, name, date_of_birth, experience_level,
  ftp_watts, threshold_pace_min_per_km, swim_css_pace_min_per_100m,
  max_heart_rate, resting_heart_rate,
  available_hours_per_week, training_days_per_week
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
);

INSERT INTO public.athlete_preferences (
  athlete_id, focus_discipline, preferred_training_time,
  has_bike, has_pool_access, has_power_meter, has_hr_monitor
) VALUES (
  '22222222-2222-2222-2222-222222222222', 
  'bike', 
  'morning',
  TRUE, TRUE, TRUE, TRUE
);

INSERT INTO public.race_calendar (athlete_id, race_date, race_type, priority, race_name)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '2025-09-20', '70.3', 'A', 'Iron Man 70.3 Regional'),
  ('22222222-2222-2222-2222-222222222222', '2025-06-10', 'olympic', 'B', 'Olympic Tune-Up');

-- Test Athlete 3: Athlete with Injury Constraint
INSERT INTO public.athlete_profiles (
  athlete_id, email, name, date_of_birth, experience_level,
  available_hours_per_week, training_days_per_week
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'injured@momentom.test',
  'Injured Ian',
  '1992-11-05',
  'intermediate',
  10.0,
  5
);

INSERT INTO public.athlete_preferences (athlete_id, focus_discipline)
VALUES ('33333333-3333-3333-3333-333333333333', 'run');

INSERT INTO public.athlete_constraints (
  athlete_id, constraint_type, affected_disciplines, start_date, severity, description
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'injury',
  ARRAY['run']::TEXT[],
  '2025-10-01',
  'moderate',
  'Plantar fasciitis - no running for 4 weeks'
);
```

---

## 4) Onboarding Data Mapping

### Quick Start Onboarding (Minimal Fields)

**UI → Database Mapping:**

| UI Field | Table | Column | Validation |
|----------|-------|--------|------------|
| Email | athlete_profiles | email | Valid email format |
| Password | Supabase Auth | - | Min 8 chars |
| Name | athlete_profiles | name | 2-50 chars |
| Date of Birth | athlete_profiles | date_of_birth | Age ≥ 13 |
| Experience | athlete_profiles | experience_level | beginner/intermediate/advanced/elite |
| Hours/Week | athlete_profiles | available_hours_per_week | 1-30 |
| Days/Week | athlete_profiles | training_days_per_week | 1-7 |
| A-Race Date | race_calendar | race_date | Future date |
| A-Race Type | race_calendar | race_type | sprint/olympic/70.3/140.6 |

**Defaults Applied:**
- `athlete_preferences`: All defaults (balanced focus, all days available)
- `race_calendar.priority`: 'A' (for quick start race)
- `race_calendar.status`: 'planned'

### Advanced Setup (All Fields)

**Step 1: Account Creation** (same as Quick Start)

**Step 2: Experience & Background**
- Previous racing experience → notes in race_calendar
- Current weekly volume → available_hours_per_week

**Step 3: Training Preferences**
- Preferred time → athlete_preferences.preferred_training_time
- Focus discipline → athlete_preferences.focus_discipline
- Day availability → athlete_preferences.[day]_available

**Step 4: Equipment & Access**
- Has bike → athlete_preferences.has_bike
- Pool access → athlete_preferences.has_pool_access
- Power meter → athlete_preferences.has_power_meter
- HR monitor → athlete_preferences.has_hr_monitor

**Step 5: Fitness Thresholds** (Optional - skip if unknown)
- FTP → athlete_profiles.ftp_watts
- Threshold pace → athlete_profiles.threshold_pace_min_per_km
- CSS → athlete_profiles.swim_css_pace_min_per_100m
- Max HR → athlete_profiles.max_heart_rate
- Resting HR → athlete_profiles.resting_heart_rate

**Step 6: Race Calendar**
- Multiple races with A/B/C priorities
- Each race: date, type, name, location

---

## 5) Testing & Validation

### Definition of Done

#### Schema Creation
- [ ] All 4 tables created with correct structure
- [ ] All constraints and validation rules applied
- [ ] All indexes created for performance
- [ ] Helper functions working correctly
- [ ] Triggers updating `updated_at` on modifications

#### Data Validation
- [ ] Cannot insert athlete with age < 13
- [ ] Cannot insert athlete with date_of_birth in future
- [ ] Cannot plan race in past
- [ ] FTP constrained to 50-500W
- [ ] Threshold pace constrained to 2.5-8.0 min/km
- [ ] At least one training day must be available
- [ ] Constraint end_date must be after start_date

#### RLS Integration
- [ ] All tables have RLS policies (from Task 1.5-A)
- [ ] 3-account test: each athlete sees only own data
- [ ] Foreign key cascades respect RLS

#### Quick Onboarding
- [ ] Can create athlete with 9 minimal fields
- [ ] Defaults applied correctly
- [ ] Plan generation succeeds with minimal data

#### Advanced Onboarding
- [ ] Can populate all optional fields
- [ ] Multiple races with priorities
- [ ] Training constraints tracked correctly

### Manual Test Scenarios

#### Test 1: Quick Onboarding
```sql
-- Create beginner athlete with minimal data
INSERT INTO athlete_profiles (
  athlete_id, email, name, date_of_birth, experience_level,
  available_hours_per_week, training_days_per_week
) VALUES (
  'test-quick-1',
  'quick@test.com',
  'Quick Quinn',
  '2000-01-01',
  'beginner',
  8.0,
  4
);

-- Verify defaults applied
SELECT * FROM athlete_preferences WHERE athlete_id = 'test-quick-1';
-- Expected: Row exists with all default values

-- Add A-race
INSERT INTO race_calendar (athlete_id, race_date, race_type, priority)
VALUES ('test-quick-1', '2025-08-01', 'sprint', 'A');

-- Verify athlete ready for plan generation
SELECT 
  ap.experience_level,
  ap.available_hours_per_week,
  ap.training_days_per_week,
  rc.race_date,
  rc.race_type
FROM athlete_profiles ap
LEFT JOIN race_calendar rc ON rc.athlete_id = ap.athlete_id AND rc.priority = 'A'
WHERE ap.athlete_id = 'test-quick-1';
-- Expected: All required fields populated
```

#### Test 2: Advanced Onboarding with Thresholds
```sql
-- Create advanced athlete with all fields
INSERT INTO athlete_profiles (
  athlete_id, email, name, date_of_birth, experience_level,
  ftp_watts, threshold_pace_min_per_km, swim_css_pace_min_per_100m,
  max_heart_rate, resting_heart_rate,
  available_hours_per_week, training_days_per_week
) VALUES (
  'test-advanced-1',
  'advanced@test.com',
  'Advanced Alice',
  '1990-05-15',
  'advanced',
  300,
  3.5,
  1.3,
  190,
  45,
  12.0,
  5
);

-- Set detailed preferences
INSERT INTO athlete_preferences (
  athlete_id, preferred_training_time, focus_discipline,
  has_bike, has_pool_access, has_power_meter, has_hr_monitor,
  sunday_available, saturday_available
) VALUES (
  'test-advanced-1',
  'morning',
  'bike',
  TRUE, TRUE, TRUE, TRUE,
  FALSE, TRUE  -- No Sunday training
);

-- Add multiple races
INSERT INTO race_calendar (athlete_id, race_date, race_type, priority, race_name) VALUES
  ('test-advanced-1', '2025-09-15', '70.3', 'A', 'Iron Man 70.3'),
  ('test-advanced-1', '2025-07-01', 'olympic', 'B', 'Olympic Tune-Up'),
  ('test-advanced-1', '2025-05-15', 'sprint', 'C', 'Sprint Practice');

-- Verify all data stored correctly
SELECT * FROM athlete_profiles WHERE athlete_id = 'test-advanced-1';
SELECT * FROM athlete_preferences WHERE athlete_id = 'test-advanced-1';
SELECT * FROM race_calendar WHERE athlete_id = 'test-advanced-1' ORDER BY race_date;
```

#### Test 3: Data Validation Rules
```sql
-- Test 1: Age validation (should FAIL - under 13)
INSERT INTO athlete_profiles (
  athlete_id, email, name, date_of_birth, experience_level,
  available_hours_per_week, training_days_per_week
) VALUES (
  'test-child',
  'child@test.com',
  'Too Young',
  '2020-01-01',  -- Age 5
  'beginner',
  5.0,
  3
);
-- Expected: ERROR - violates check constraint "minimum_age_13"

-- Test 2: Future date of birth (should FAIL)
INSERT INTO athlete_profiles (
  athlete_id, email, name, date_of_birth, experience_level,
  available_hours_per_week, training_days_per_week
) VALUES (
  'test-future',
  'future@test.com',
  'Future Person',
  '2030-01-01',
  'beginner',
  8.0,
  4
);
-- Expected: ERROR - violates check constraint "date_of_birth_in_past"

-- Test 3: Invalid FTP range (should FAIL)
INSERT INTO athlete_profiles (
  athlete_id, email, name, date_of_birth, experience_level,
  ftp_watts, available_hours_per_week, training_days_per_week
) VALUES (
  'test-ftp',
  'ftp@test.com',
  'Invalid FTP',
  '1990-01-01',
  'advanced',
  999,  -- Too high
  10.0,
  5
);
-- Expected: ERROR - violates check constraint on ftp_watts

-- Test 4: Race in past (should FAIL for planned races)
INSERT INTO race_calendar (athlete_id, race_date, race_type, priority, status)
VALUES ('existing-athlete-id', '2024-01-01', 'sprint', 'A', 'planned');
-- Expected: ERROR - violates check constraint "planned_races_in_future"

-- Test 5: No training days available (should FAIL)
INSERT INTO athlete_preferences (
  athlete_id,
  sunday_available, monday_available, tuesday_available,
  wednesday_available, thursday_available, friday_available, saturday_available
) VALUES (
  'existing-athlete-id',
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE
);
-- Expected: ERROR - violates check constraint "at_least_one_day_available"
```

#### Test 4: Helper Functions
```sql
-- Test age calculation
SELECT get_athlete_age('1990-05-15'::DATE);
-- Expected: 35 (as of October 2025)

-- Test active constraints
INSERT INTO athlete_constraints (
  athlete_id, constraint_type, affected_disciplines,
  start_date, severity, description
) VALUES (
  'test-athlete',
  'injury',
  ARRAY['run']::TEXT[],
  '2025-10-01',
  'moderate',
  'Shin splints'
);

SELECT * FROM get_active_constraints('test-athlete', '2025-10-15'::DATE);
-- Expected: Returns the injury constraint

SELECT * FROM get_active_constraints('test-athlete', '2025-09-15'::DATE);
-- Expected: No rows (constraint starts Oct 1)

-- Test next A-race
SELECT * FROM get_next_a_race('test-athlete');
-- Expected: Nearest future A-priority race
```

### Performance Tests

```sql
-- Test query performance with indexes
EXPLAIN ANALYZE
SELECT * FROM athlete_profiles WHERE athlete_id = 'test-athlete';
-- Expected: Index scan, < 1ms

EXPLAIN ANALYZE
SELECT * FROM race_calendar
WHERE athlete_id = 'test-athlete'
  AND race_date >= CURRENT_DATE
ORDER BY race_date;
-- Expected: Index scan on idx_race_calendar_dates, < 5ms

EXPLAIN ANALYZE
SELECT * FROM athlete_constraints
WHERE athlete_id = 'test-athlete'
  AND start_date <= CURRENT_DATE
  AND (end_date IS NULL OR end_date >= CURRENT_DATE);
-- Expected: Index scan on idx_athlete_constraints_active, < 5ms
```

---

## 6) Implementation Guidance

### Migration Order
1. Run `20251011000002_athlete_schema.sql` (creates tables, constraints, functions)
2. Run `20251011000001_rls_policies.sql` (from Task 1.5-A - adds RLS)
3. Optionally run `test_athletes.sql` (seed test data)

### Critical Implementation Notes

**Age vs Date of Birth:**
- Store `date_of_birth` in database (source of truth)
- Calculate age dynamically using `get_athlete_age()` function
- UI can display age but always store DOB

**Experience Level Mapping:**
- UI shows: Beginner / Intermediate / Competitive / Elite
- Database stores: beginner / intermediate / advanced / elite
- Map "Competitive" → "advanced" in application code

**Constraint End Date:**
- `NULL` end_date = ongoing constraint
- Set end_date when constraint resolves
- Filter active constraints: `end_date IS NULL OR end_date >= CURRENT_DATE`

**Race Priority:**
- Only ONE A-priority race recommended per season
- Multiple B/C races allowed
- Plan generation focuses on A-race

### Query Patterns

**Get Athlete Profile (Full):**
```sql
SELECT 
  ap.*,
  apref.*,
  get_athlete_age(ap.date_of_birth) AS age,
  COALESCE(array_agg(rc.race_id) FILTER (WHERE rc.race_id IS NOT NULL), '{}') AS races,
  COALESCE(array_agg(ac.constraint_id) FILTER (WHERE ac.constraint_id IS NOT NULL), '{}') AS active_constraints
FROM athlete_profiles ap
LEFT JOIN athlete_preferences apref ON apref.athlete_id = ap.athlete_id
LEFT JOIN race_calendar rc ON rc.athlete_id = ap.athlete_id AND rc.status = 'planned'
LEFT JOIN athlete_constraints ac ON ac.athlete_id = ap.athlete_id 
  AND (ac.end_date IS NULL OR ac.end_date >= CURRENT_DATE)
WHERE ap.athlete_id = $1
GROUP BY ap.athlete_id, apref.athlete_id;
```

**Get Plan Generation Minimum Data:**
```sql
SELECT 
  ap.athlete_id,
  ap.experience_level,
  ap.available_hours_per_week,
  ap.training_days_per_week,
  apref.focus_discipline,
  apref.has_bike,
  apref.has_pool_access,
  get_next_a_race(ap.athlete_id) AS a_race
FROM athlete_profiles ap
LEFT JOIN athlete_preferences apref ON apref.athlete_id = ap.athlete_id
WHERE ap.athlete_id = $1;
```

---

## 7) Documentation Deliverables

### docs/architecture/athlete-schema.md

```markdown
# Athlete Data Schema

## Overview
The athlete schema stores profile, preferences, race calendar, and training constraints.

## Tables

### athlete_profiles
**Purpose:** Core athlete demographics and fitness metrics  
**Key Fields:**
- `athlete_id` (PK, UUID) - matches auth.uid()
- `date_of_birth` - stored for age calculation
- `experience_level` - beginner/intermediate/advanced/elite
- Fitness thresholds (optional): FTP, threshold pace, CSS, HR

### athlete_preferences
**Purpose:** Training preferences and equipment  
**Key Fields:**
- Weekly day availability (7 boolean flags)
- Preferred training time and focus discipline
- Equipment flags (bike, pool, power meter, HR monitor)

### race_calendar
**Purpose:** Planned races with priorities  
**Key Fields:**
- `race_date`, `race_type`, `priority` (A/B/C)
- `status` (planned/completed/dns/dnf)

### athlete_constraints
**Purpose:** Injuries, equipment issues, availability gaps  
**Key Fields:**
- `constraint_type` (injury/equipment/availability)
- `affected_disciplines` (array of swim/bike/run/strength)
- `start_date`, `end_date` (null = ongoing)
- `severity` (mild/moderate/severe)

## Validation Rules
- Age ≥ 13 (COPPA compliance)
- Date of birth in past
- Planned races in future
- Fitness thresholds in realistic ranges
- At least one training day available

## Onboarding Flows

### Quick Start (9 fields)
Minimum viable data for plan generation:
- Email, password, name, DOB
- Experience, hours/week, days/week
- A-race date and type

### Advanced Setup (all fields)
Complete profile with thresholds, preferences, equipment, multiple races

## Helper Functions
- `get_athlete_age(date)` - Calculate age from DOB
- `get_active_constraints(athlete_id, date)` - Filter active constraints
- `get_next_a_race(athlete_id)` - Next A-priority race
```

### docs/architecture/onboarding-mapping.md

```markdown
# Onboarding Data Mapping

## Quick Start Flow

| Step | UI Field | Database Mapping |
|------|----------|------------------|
| 1 | Email | athlete_profiles.email |
| 1 | Password | Supabase Auth |
| 1 | Name | athlete_profiles.name |
| 2 | Date of Birth | athlete_profiles.date_of_birth |
| 2 | Experience | athlete_profiles.experience_level |
| 3 | Hours/Week | athlete_profiles.available_hours_per_week |
| 3 | Days/Week | athlete_profiles.training_days_per_week |
| 4 | A-Race Date | race_calendar.race_date |
| 4 | A-Race Type | race_calendar.race_type |

**Applied Defaults:**
- athlete_preferences: All defaults (balanced, all days available)
- race_calendar.priority: 'A'
- race_calendar.status: 'planned'

## Advanced Setup Flow

### Step 1: Account (same as Quick Start)
### Step 2: Experience & Background
- Previous races → notes in race_calendar
- Current volume → available_hours_per_week

### Step 3: Training Preferences
- Time preference → athlete_preferences.preferred_training_time
- Focus → athlete_preferences.focus_discipline
- Day availability → athlete_preferences.[day]_available

### Step 4: Equipment
- Equipment → athlete_preferences.has_* flags

### Step 5: Fitness Thresholds (Optional)
- FTP, threshold pace, CSS, HR → athlete_profiles.*

### Step 6: Race Calendar
- Multiple races → race_calendar (with A/B/C priorities)

## Plan Generation Requirements

**Absolute Minimum:**
- experience_level
- available_hours_per_week
- training_days_per_week
- At least 1 A-race with date and type
- has_bike, has_pool_access

**Enhanced with:**
- Fitness thresholds (better zone prescription)
- Day availability (better schedule fit)
- Active constraints (injury accommodation)
```

---

## 8) Open Questions - RESOLVED

### Q1: Age or Date of Birth?
**Decision:** Store `date_of_birth`, calculate age dynamically. Allows historical accuracy and correct age calculation over time.

### Q2: athlete vs athlete_profiles table name?
**Decision:** Use `athlete_profiles` to clarify it's profile data, not the core identity (which is in Supabase Auth).

### Q3: Required vs Optional Thresholds?
**Decision:** All fitness thresholds optional. Beginners may not know FTP/pace. Plan generation adapts based on available data.

### Q4: Multiple A-Races Allowed?
**Decision:** System allows multiple A-races, but recommend only one per season. UI can warn/guide user.

### Q5: Experience Level "Competitive"?
**Decision:** UI shows "Competitive", database stores "advanced". Keep "elite" for pros. Map in application layer.

---

## 9) Success Criteria

### Must Have
✅ All 4 tables created with constraints and indexes  
✅ Validation rules prevent invalid data (age, dates, ranges)  
✅ Helper functions working correctly  
✅ RLS policies prevent cross-athlete access  
✅ Quick onboarding creates athlete with 9 fields  
✅ Advanced onboarding supports all optional fields  
✅ Test data seed script works  

### Should Have
✅ Triggers update `updated_at` on modifications  
✅ Query performance < 50ms for profile reads  
✅ Complete onboarding mapping documentation  
✅ Validation test suite passes all scenarios  

### Nice to Have
- Profile completion percentage (for gamification)
- Threshold estimation based on race results
- Constraint history/audit log

---

## 10) Dependencies

**Requires:**
- Task 1.5-A: RLS policies (athlete_id scoping)
- Supabase Auth: athlete_id from auth.uid()

**Enables:**
- Task 1.5-D: Workout library (experience_level for filtering)
- Sprint 2: Plan generation (requires profile data)
- Sprint 2: Adaptation rules (uses constraints, races, thresholds)

---

**Status:** ✅ Production-Ready Specification  
**Next Steps:** Run migrations → Test validation → Implement onboarding UI → Seed test data