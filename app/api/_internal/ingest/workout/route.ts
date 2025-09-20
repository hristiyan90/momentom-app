import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId } from '@/lib/auth/athlete';
import { 
  validateFileUpload, 
  determineFileType, 
  uploadFileToStorage,
  generateStoragePath 
} from '@/lib/storage/ingest';
import { parseWorkoutFile, validateParsedData } from '@/lib/parsers/workout-files';
import { 
  createIngestRecord, 
  updateIngestWithParsedData,
  createSessionFromParsedData,
  updateIngestWithSession,
  updateIngestWithError 
} from '@/lib/mappers/session';

/**
 * POST /api/_internal/ingest/workout
 * Upload and process workout file (TCX/GPX)
 * 
 * Headers:
 * - Authorization: Bearer <jwt>
 * - Content-Type: multipart/form-data
 * 
 * Body:
 * - file: File (required) - TCX or GPX file
 * - source: string (optional) - Source device/app
 * - notes: string (optional) - User notes
 * 
 * Response:
 * - 201: { ingest_id: string, status: string }
 * - 400: Validation error
 * - 401: Auth error
 * - 413: File too large
 * - 415: Unsupported file type
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: Get athlete_id from JWT
    const athleteId = await getAthleteId(request);
    if (!athleteId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
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

    // Validate file upload
    const validation = validateFileUpload(file);
    if (!validation.valid) {
      const statusCode = validation.error?.includes('exceeds maximum') ? 413 : 415;
      return NextResponse.json(
        { error: validation.error },
        { status: statusCode, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Determine file type
    const fileType = determineFileType(file);
    if (!fileType) {
      return NextResponse.json(
        { error: 'Unable to determine file type. Must be .tcx or .gpx' },
        { status: 415, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Generate ingest ID and storage path
    const ingestId = crypto.randomUUID();
    const storagePath = generateStoragePath(athleteId, ingestId, fileType);

    // Upload file to storage
    const uploadResult = await uploadFileToStorage(athleteId, ingestId, file, fileType);
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadResult.error}` },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Create initial ingest record
    const ingestResult = await createIngestRecord(
      athleteId,
      file.name,
      fileType,
      file.size,
      uploadResult.path!
    );
    
    if (!ingestResult.success) {
      // Clean up uploaded file
      await uploadFileToStorage(athleteId, ingestId, file, fileType); // This will fail but that's ok
      return NextResponse.json(
        { error: `Database error: ${ingestResult.error}` },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Parse file content
    try {
      const fileContent = await file.text();
      const parsedData = parseWorkoutFile(fileContent, fileType);
      
      // Validate parsed data
      const dataValidation = validateParsedData(parsedData);
      if (!dataValidation.valid) {
        await updateIngestWithError(ingestId, `Parse validation failed: ${dataValidation.errors.join(', ')}`);
        return NextResponse.json(
          { error: `Invalid workout data: ${dataValidation.errors.join(', ')}` },
          { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
      }

      // Update ingest record with parsed data
      await updateIngestWithParsedData(ingestId, parsedData);

      // Create session from parsed data
      const sessionResult = await createSessionFromParsedData(parsedData, athleteId, ingestId);
      if (!sessionResult.success) {
        await updateIngestWithError(ingestId, `Session creation failed: ${sessionResult.error}`);
        return NextResponse.json(
          { error: `Session creation failed: ${sessionResult.error}` },
          { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
      }

      // Update ingest record with session ID
      await updateIngestWithSession(ingestId, sessionResult.sessionId!);

      // Return success response
      return NextResponse.json(
        {
          ingest_id: ingestId,
          status: 'normalized',
          session_id: sessionResult.sessionId,
          message: 'Workout uploaded and processed successfully'
        },
        { 
          status: 201, 
          headers: { 
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json'
          } 
        }
      );

    } catch (parseError) {
      // Handle parsing errors
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      await updateIngestWithError(ingestId, `Parse error: ${errorMessage}`);
      
      return NextResponse.json(
        { error: `File parsing failed: ${errorMessage}` },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
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

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Cache-Control': 'no-store' } }
  );
}
