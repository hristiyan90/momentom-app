import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId } from '@/lib/auth/athlete';
import { getIngestRecord } from '@/lib/mappers/session';
import { createHash } from 'crypto';

/**
 * GET /api/_internal/ingest/workout/{id}
 * Get ingest status and details
 * 
 * Headers:
 * - Authorization: Bearer <jwt>
 * - If-None-Match: <etag> (optional)
 * 
 * Response:
 * - 200: Ingest details with ETag
 * - 304: Not modified (if If-None-Match matches)
 * - 401: Auth error
 * - 404: Ingest not found
 * - 500: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: Get athlete_id from JWT
    const athleteId = await getAthleteId(request);
    if (!athleteId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const ingestId = params.id;

    // Validate ingest ID format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(ingestId)) {
      return NextResponse.json(
        { error: 'Invalid ingest ID format' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Get ingest record
    const result = await getIngestRecord(ingestId, athleteId);
    if (!result.success) {
      if (result.error?.includes('not found')) {
        return NextResponse.json(
          { error: 'Ingest record not found' },
          { status: 404, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const ingestData = result.data;

    // Create response data (exclude sensitive fields)
    const responseData = {
      ingest_id: ingestData.ingest_id,
      filename: ingestData.filename,
      file_type: ingestData.file_type,
      file_size: ingestData.file_size,
      status: ingestData.status,
      error_message: ingestData.error_message,
      session_id: ingestData.session_id,
      created_at: ingestData.created_at,
      updated_at: ingestData.updated_at
    };

    // Generate strong ETag from canonical JSON
    const canonicalJson = JSON.stringify(responseData, Object.keys(responseData).sort());
    const etag = `"${createHash('sha256').update(canonicalJson).digest('hex').substring(0, 16)}"`;

    // Check If-None-Match header
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, max-age=60',
          'Vary': 'X-Client-Timezone, Authorization'
        }
      });
    }

    // Return 200 with ETag
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'ETag': etag,
        'Cache-Control': 'private, max-age=60',
        'Vary': 'X-Client-Timezone, Authorization',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Ingest status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

// Handle unsupported methods
export async function POST() {
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
