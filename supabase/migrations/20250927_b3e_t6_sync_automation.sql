-- 20250927_b3e_t6_sync_automation.sql
-- B3e-T6: Scheduled Sync and Automation
-- Creates sync configuration and history tables for GarminDB automation

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- SYNC CONFIGURATION TABLE
-- Stores user preferences for automated GarminDB sync
CREATE TABLE IF NOT EXISTS public.garmin_sync_config (
  config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.athlete(athlete_id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'manual_only')),
  preferred_time TIME NOT NULL DEFAULT '06:00:00', -- UTC time for scheduled sync
  data_types TEXT[] NOT NULL DEFAULT ARRAY['activities', 'wellness'], -- What to sync
  garmin_db_path TEXT, -- Optional custom GarminDB path
  garmin_monitoring_db_path TEXT, -- Optional custom monitoring DB path
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ, -- Calculated next sync time
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(athlete_id)
);

COMMENT ON TABLE public.garmin_sync_config IS 'User configuration for automated GarminDB sync';
COMMENT ON COLUMN public.garmin_sync_config.frequency IS 'Sync frequency: daily, weekly, or manual_only';
COMMENT ON COLUMN public.garmin_sync_config.preferred_time IS 'UTC time for daily sync (e.g., 06:00:00)';
COMMENT ON COLUMN public.garmin_sync_config.data_types IS 'Array of data types to sync: activities, wellness';

-- SYNC HISTORY TABLE
-- Tracks all sync operations (scheduled and manual) with results
CREATE TABLE IF NOT EXISTS public.garmin_sync_history (
  sync_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.athlete(athlete_id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('scheduled', 'manual')),
  data_types TEXT[] NOT NULL, -- What was requested to sync
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER, -- Processing time in milliseconds
  activities_imported INTEGER DEFAULT 0,
  wellness_records_imported INTEGER DEFAULT 0,
  activities_skipped INTEGER DEFAULT 0, -- Duplicates or filtered out
  wellness_skipped INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]', -- Array of error messages
  metadata JSONB DEFAULT '{}', -- Additional sync metadata (filters, options, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.garmin_sync_history IS 'History of all GarminDB sync operations';
COMMENT ON COLUMN public.garmin_sync_history.sync_type IS 'Type of sync: scheduled (automatic) or manual (user-triggered)';
COMMENT ON COLUMN public.garmin_sync_history.status IS 'Current status: running, completed, failed, or cancelled';
COMMENT ON COLUMN public.garmin_sync_history.errors IS 'JSON array of error messages if sync failed';
COMMENT ON COLUMN public.garmin_sync_history.metadata IS 'Additional sync details (filters, batch size, etc.)';

-- INDEXES
CREATE INDEX IF NOT EXISTS garmin_sync_config_athlete_idx ON public.garmin_sync_config(athlete_id);
CREATE INDEX IF NOT EXISTS garmin_sync_config_enabled_next_sync_idx ON public.garmin_sync_config(enabled, next_sync_at) WHERE enabled = true;

CREATE INDEX IF NOT EXISTS garmin_sync_history_athlete_started_idx ON public.garmin_sync_history(athlete_id, started_at DESC);
CREATE INDEX IF NOT EXISTS garmin_sync_history_status_started_idx ON public.garmin_sync_history(status, started_at DESC);
CREATE INDEX IF NOT EXISTS garmin_sync_history_sync_type_idx ON public.garmin_sync_history(sync_type, started_at DESC);

-- RLS POLICIES
ALTER TABLE public.garmin_sync_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garmin_sync_history ENABLE ROW LEVEL SECURITY;

-- Sync config policies - users can only access their own configuration
DROP POLICY IF EXISTS "garmin_sync_config_athlete_isolation" ON public.garmin_sync_config;
CREATE POLICY "garmin_sync_config_athlete_isolation" ON public.garmin_sync_config
  FOR ALL USING (athlete_id = auth.uid()::uuid);

-- Sync history policies - users can only access their own sync history
DROP POLICY IF EXISTS "garmin_sync_history_athlete_isolation" ON public.garmin_sync_history;
CREATE POLICY "garmin_sync_history_athlete_isolation" ON public.garmin_sync_history
  FOR ALL USING (athlete_id = auth.uid()::uuid);

-- TRIGGERS for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_garmin_sync_config_updated_at ON public.garmin_sync_config;
CREATE TRIGGER update_garmin_sync_config_updated_at
    BEFORE UPDATE ON public.garmin_sync_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
