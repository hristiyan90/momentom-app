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
CREATE INDEX idx_athlete_constraints_active ON public.athlete_constraints(athlete_id, start_date, end_date);

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

