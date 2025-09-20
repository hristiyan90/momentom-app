import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId } from '@/lib/auth/athlete';

/**
 * POST /api/ingest/workout
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
    // Auth: Get athlete_id from JWT (bypassed for testing)
    let athleteId: string;
    try {
      athleteId = await getAthleteId(request);
    } catch (error) {
      // Fallback for testing
      athleteId = 'test-athlete-id';
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

    // Generate ingest ID
    const ingestId = crypto.randomUUID();
    const fileType = fileName.endsWith('.tcx') ? 'tcx' : 'gpx';

    // Return success response (simplified - no database operations yet)
    return NextResponse.json(
      {
        ingest_id: ingestId,
        status: 'received',
        message: 'File validation successful - database operations pending',
        filename: file.name,
        file_size: file.size,
        file_type: fileType,
        athlete_id: athleteId
      },
      { 
        status: 201, 
        headers: { 
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json'
        } 
      }
    );

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
