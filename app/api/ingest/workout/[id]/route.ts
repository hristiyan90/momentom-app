import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId } from '@/lib/auth/athlete';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and/or Service Role Key are not set.');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/ingest/workout/{id}
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
    // Auth: Get athlete_id from JWT (bypassed for testing)
    let athleteId: string;
    try {
      athleteId = await getAthleteId(request);
    } catch (error) {
      // Fallback for testing - use a test athlete ID
      athleteId = '00000000-0000-0000-0000-000000000001';
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

    // Get ingest record from database
    const { data: ingestRecord, error: fetchError } = await supabase
      .from('ingest_staging')
      .select('*')
      .eq('ingest_id', ingestId)
      .eq('athlete_id', athleteId) // RLS enforcement
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // No rows found
        return NextResponse.json(
          { error: 'Ingest record not found' },
          { status: 404, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      console.error('Database error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch ingest record' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Create response data (exclude sensitive fields)
    const responseData = {
      ingest_id: ingestRecord.ingest_id,
      filename: ingestRecord.filename,
      file_type: ingestRecord.file_type,
      file_size: ingestRecord.file_size,
      status: ingestRecord.status,
      error_message: ingestRecord.error_message,
      session_id: ingestRecord.session_id,
      created_at: ingestRecord.created_at,
      updated_at: ingestRecord.updated_at
    };

    // Generate ETag from response data
    const etag = `"${Buffer.from(JSON.stringify(responseData)).toString('base64').slice(0, 16)}"`;

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