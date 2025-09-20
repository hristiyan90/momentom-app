import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ingest/workout (test version)
 * Test endpoint without database dependencies
 */
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const source = formData.get('source') as string | null;
    const notes = formData.get('notes') as string | null;

    // Basic validation
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Check file size (25MB limit)
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

    // Generate mock ingest ID
    const ingestId = crypto.randomUUID();

    // Return success response
    return NextResponse.json(
      {
        ingest_id: ingestId,
        status: 'received',
        message: 'File validation successful (test mode)',
        filename: file.name,
        file_size: file.size,
        file_type: fileName.endsWith('.tcx') ? 'tcx' : 'gpx'
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

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Cache-Control': 'no-store' } }
  );
}
