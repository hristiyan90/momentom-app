-- B3e-T5: Wellness Data Integration
-- Create wellness_data table for storing sleep, RHR, and weight data from GarminDB

-- Create wellness_data table
CREATE TABLE IF NOT EXISTS wellness_data (
  wellness_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athlete(athlete_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('sleep', 'rhr', 'weight')),
  value_json JSONB NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'garmin' CHECK (source_type IN ('garmin', 'manual', 'api')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique records per athlete/date/type
  UNIQUE(athlete_id, date, data_type)
);

-- Enable Row Level Security
ALTER TABLE wellness_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for athlete data isolation
CREATE POLICY "wellness_data_athlete_isolation" ON wellness_data
  FOR ALL USING (athlete_id = auth.uid()::uuid);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wellness_data_athlete_date 
  ON wellness_data(athlete_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_wellness_data_type_date 
  ON wellness_data(athlete_id, data_type, date DESC);

CREATE INDEX IF NOT EXISTS idx_wellness_data_source 
  ON wellness_data(athlete_id, source_type, date DESC);

-- Create index on JSONB for common queries
CREATE INDEX IF NOT EXISTS idx_wellness_data_value_json 
  ON wellness_data USING GIN (value_json);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_wellness_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_wellness_data_updated_at
  BEFORE UPDATE ON wellness_data
  FOR EACH ROW
  EXECUTE FUNCTION update_wellness_data_updated_at();

-- Add comments for documentation
COMMENT ON TABLE wellness_data IS 'Stores wellness data (sleep, RHR, weight) from various sources including GarminDB';
COMMENT ON COLUMN wellness_data.wellness_id IS 'Unique identifier for wellness record';
COMMENT ON COLUMN wellness_data.athlete_id IS 'Reference to athlete, enforced by RLS';
COMMENT ON COLUMN wellness_data.date IS 'Date of wellness measurement (YYYY-MM-DD)';
COMMENT ON COLUMN wellness_data.data_type IS 'Type of wellness data: sleep, rhr, or weight';
COMMENT ON COLUMN wellness_data.value_json IS 'Wellness data in JSON format, structure varies by data_type';
COMMENT ON COLUMN wellness_data.source_type IS 'Source of the data: garmin, manual, or api';
COMMENT ON COLUMN wellness_data.metadata IS 'Additional metadata about the record (quality scores, etc.)';

-- Sample value_json structures for documentation:
-- 
-- Sleep data (data_type = 'sleep'):
-- {
--   "total_minutes": 465,
--   "deep_minutes": 90,
--   "light_minutes": 315,
--   "rem_minutes": 60,
--   "awake_minutes": 15,
--   "efficiency": 96.8,
--   "score": 85,
--   "bedtime": "22:30",
--   "wake_time": "06:30"
-- }
--
-- RHR data (data_type = 'rhr'):
-- {
--   "bpm": 52,
--   "quality": "good",
--   "trend": "stable"
-- }
--
-- Weight data (data_type = 'weight'):
-- {
--   "weight_kg": 75.2,
--   "body_fat_percent": 12.5,
--   "muscle_mass_kg": 34.2,
--   "bone_mass_kg": 11.3,
--   "body_water_percent": 58.7,
--   "bmi": 22.1
-- }
