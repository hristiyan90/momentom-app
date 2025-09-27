-- Apply FIT file support constraints to database
-- Run this in Supabase SQL Editor

-- Update sessions table to accept FIT source type
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_source_file_type_check;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_source_file_type_check 
CHECK (source_file_type IN ('tcx', 'gpx', 'manual', 'fit'));

-- Update ingest_staging table to accept FIT file type  
ALTER TABLE public.ingest_staging DROP CONSTRAINT IF EXISTS ingest_staging_file_type_check;
ALTER TABLE public.ingest_staging ADD CONSTRAINT ingest_staging_file_type_check 
CHECK (file_type IN ('tcx', 'gpx', 'fit'));

-- Test that the constraints work
INSERT INTO public.sessions (
  athlete_id, 
  date, 
  sport, 
  title, 
  status, 
  structure_json, 
  source_file_type
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '2025-09-26',
  'run',
  'FIT Test Session',
  'completed',
  '{"segments": []}',
  'fit'
);

-- Clean up test session
DELETE FROM public.sessions WHERE title = 'FIT Test Session';

-- Verify constraints are working
SELECT 'FIT constraints applied successfully' as result;
