import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug browser upload request...');
    
    // Log all headers
    console.log('Headers:');
    request.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // Check if we have X-Athlete-Id
    const athleteId = request.headers.get('X-Athlete-Id');
    console.log('X-Athlete-Id from headers:', athleteId);
    
    // Parse form data
    const formData = await request.formData();
    console.log('Form data keys:', Array.from(formData.keys()));
    
    const file = formData.get('file') as File;
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    } else {
      console.log('No file found in form data');
    }
    
    // Now try to forward to the real endpoint
    console.log('Forwarding to real endpoint...');
    
    const realResponse = await fetch('http://localhost:3000/api/ingest/workout', {
      method: 'POST',
      headers: athleteId ? { 'X-Athlete-Id': athleteId } : {},
      body: formData
    });
    
    const responseText = await realResponse.text();
    console.log('Real endpoint response status:', realResponse.status);
    console.log('Real endpoint response:', responseText);
    
    return NextResponse.json({
      debug: 'Browser upload debug',
      headers: Object.fromEntries(request.headers.entries()),
      athleteId,
      fileInfo: file ? {
        name: file.name,
        size: file.size,
        type: file.type
      } : null,
      realEndpointStatus: realResponse.status,
      realEndpointResponse: responseText
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
