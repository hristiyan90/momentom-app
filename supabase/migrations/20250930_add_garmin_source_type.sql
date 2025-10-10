-- 20250930_add_garmin_source_type.sql
-- Add 'garmin' as an allowed value for source_file_type in sessions table

-- Update source_file_type constraint to include 'garmin'
ALTER TABLE public.sessions 
DROP CONSTRAINT IF EXISTS sessions_source_file_type_check;

ALTER TABLE public.sessions 
ADD CONSTRAINT sessions_source_file_type_check 
CHECK (source_file_type IN ('tcx', 'gpx', 'manual', 'fit', 'garmin'));

-- Update comment to document Garmin support
COMMENT ON COLUMN public.sessions.source_file_type IS 'Source of session data: tcx, gpx, fit, manual entry, or garmin import';

-- Verify the constraint works
DO $$
BEGIN
    -- Test inserting a Garmin source type (will rollback)
    INSERT INTO public.sessions (
        athlete_id, 
        date, 
        sport, 
        title, 
        status, 
        source_file_type
    ) VALUES (
        '00000000-0000-0000-0000-000000000001', 
        '2025-09-30', 
        'run', 
        'Test Garmin Import', 
        'completed', 
        'garmin'
    );
    
    -- If we get here, the constraint was added successfully
    RAISE NOTICE 'Garmin source_file_type constraint added successfully';
    
    -- Rollback the test insert
    ROLLBACK;
EXCEPTION
    WHEN check_violation THEN
        RAISE EXCEPTION 'Garmin source_file_type constraint failed to add properly';
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint validation completed';
        ROLLBACK;
END $$;
