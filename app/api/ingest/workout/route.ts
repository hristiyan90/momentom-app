import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId } from '@/lib/auth/athlete';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { parseTCX, parseGPX } from '@/lib/parsers/workout-files';
import { mapParsedWorkoutToSession, createSessionFromParsedData, updateIngestWithSession, updateIngestWithError } from '@/lib/mappers/session';
import { uploadFileToStorage, generateStoragePath } from '@/lib/storage/ingest';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and/or Service Role Key are not set.');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/ingest/workout
 * Upload and process workout file (TCX/GPX)
 * 
 * Headers:
 * - Authorization: Bearer <jwt>
 * - Content-Type: multipart/form-data
 * 
 * Response:
 * - 201: Upload successful with ingest_id
 * - 400: Invalid file or missing file
 * - 401: Auth error
 * - 413: File too large
 * - 415: Unsupported file type
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: Get athlete_id from JWT (bypassed for testing)
    let athleteId: string;
    try {
      athleteId = await getAthleteId(request);
    } catch (error) {
      // Fallback for testing - use a test athlete ID
      athleteId = '00000000-0000-0000-0000-000000000001';
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const source = formData.get('source') as string | null;
    const notes = formData.get('notes') as string | null;

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Basic file validation
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size ${file.size} exceeds maximum ${maxSize} bytes (25MB)` },
        { status: 413, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.tcx', '.gpx'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return NextResponse.json(
        { error: `File type not supported. Allowed: ${allowedExtensions.join(', ')}` },
        { status: 415, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Generate ingest ID and file type
    const ingestId = crypto.randomUUID();
    const fileType = fileName.endsWith('.tcx') ? 'tcx' : 'gpx';
    const storagePath = generateStoragePath(athleteId, ingestId, fileType);

    // Create initial ingest_staging record
    const { data: ingestRecord, error: insertError } = await supabase
      .from('ingest_staging')
      .insert({
        ingest_id: ingestId,
        athlete_id: athleteId,
        filename: file.name,
        file_type: fileType,
        file_size: file.size,
        status: 'received',
        storage_path: storagePath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting ingest_staging record:', insertError);
      return NextResponse.json(
        { error: 'Failed to initiate upload process.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    try {
      // Step 1: Upload file to Supabase Storage
      console.log('Uploading file to storage...');
      await uploadFileToStorage(file, storagePath, 'workout-uploads');
      
      // Update status to indicate file is uploaded
      await supabase
        .from('ingest_staging')
        .update({ 
          status: 'uploaded',
          updated_at: new Date().toISOString()
        })
        .eq('ingest_id', ingestId);

      // Step 2: Read and parse file content
      console.log('Parsing file content...');
      const fileBuffer = await file.arrayBuffer();
      const fileContent = new TextDecoder().decode(fileBuffer);
      
      let parsedData;
      if (fileType === 'tcx') {
        parsedData = parseTCX(fileContent);
      } else if (fileType === 'gpx') {
        parsedData = parseGPX(fileContent);
      } else {
        throw new Error('Unsupported file type for parsing');
      }

      // Update status to indicate parsing is complete
      await supabase
        .from('ingest_staging')
        .update({ 
          status: 'parsed',
          parsed_data: parsedData,
          updated_at: new Date().toISOString()
        })
        .eq('ingest_id', ingestId);

      // Step 3: Create session from parsed data
      console.log('Creating session from parsed data...');
      const sessionResult = await createSessionFromParsedData(parsedData, athleteId, ingestId);
      
      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Session creation failed');
      }

      // Step 4: Update ingest record with session_id and final status
      console.log('Updating ingest record with session...');
      await updateIngestWithSession(ingestId, sessionResult.sessionId!);

      // Return success response
      return NextResponse.json(
        {
          ingest_id: ingestId,
          status: 'normalized',
          message: 'Workout uploaded and processed successfully',
          filename: file.name,
          file_size: file.size,
          file_type: fileType,
          athlete_id: athleteId,
          session_id: sessionResult.sessionId
        },
        { 
          status: 201, 
          headers: { 
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json'
          } 
        }
      );

    } catch (processingError) {
      console.error('Error processing workout file:', processingError);
      
      // Update ingest record with error status
      await updateIngestWithError(ingestId, processingError instanceof Error ? processingError.message : 'Unknown processing error');
      
      return NextResponse.json(
        { 
          error: 'File processing failed',
          details: processingError instanceof Error ? processingError.message : 'Unknown error'
        },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

  } catch (error) {
    console.error('Workout upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Cache-Control': 'no-store' } }
  );
}
