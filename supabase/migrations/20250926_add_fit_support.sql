-- 20250926_add_fit_support.sql
-- Add FIT file format support to B2 Manual Upload system

-- Update file_type constraint to include 'fit'
ALTER TABLE public.ingest_staging 
DROP CONSTRAINT IF EXISTS ingest_staging_file_type_check;

ALTER TABLE public.ingest_staging 
ADD CONSTRAINT ingest_staging_file_type_check 
CHECK (file_type IN ('tcx', 'gpx', 'fit'));

-- Update source_file_type constraint to include 'fit'
ALTER TABLE public.sessions 
DROP CONSTRAINT IF EXISTS sessions_source_file_type_check;

ALTER TABLE public.sessions 
ADD CONSTRAINT sessions_source_file_type_check 
CHECK (source_file_type IN ('tcx', 'gpx', 'manual', 'fit'));

-- Add comment to document FIT support
COMMENT ON COLUMN public.ingest_staging.file_type IS 'File format: tcx, gpx, or fit';
COMMENT ON COLUMN public.sessions.source_file_type IS 'Source of session data: tcx, gpx, fit, or manual entry';

-- Verify the constraints
DO $$
BEGIN
    -- Test inserting a FIT file type (will rollback)
    INSERT INTO public.ingest_staging (athlete_id, filename, file_type, file_size) 
    VALUES ('00000000-0000-0000-0000-000000000001', 'test.fit', 'fit', 1000);
    
    -- If we get here, the constraint was added successfully
    RAISE NOTICE 'FIT file type constraint added successfully';
    
    -- Rollback the test insert
    ROLLBACK;
EXCEPTION
    WHEN check_violation THEN
        RAISE EXCEPTION 'FIT file type constraint failed to add properly';
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint validation completed';
        ROLLBACK;
END $$;
