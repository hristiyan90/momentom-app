import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId } from '@/lib/auth/athlete';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug upload error...');
    
    // Step 1: Check athlete authentication
    console.log('Step 1: Checking athlete authentication...');
    const athleteId = await getAthleteId(request);
    console.log('Athlete ID:', athleteId);
    
    if (!athleteId) {
      return NextResponse.json(
        { step: 1, error: 'No athlete ID found' },
        { status: 401 }
      );
    }
    
    // Step 2: Parse form data
    console.log('Step 2: Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { step: 2, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Step 3: File validation
    console.log('Step 3: File validation...');
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.tcx', '.gpx', '.fit'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return NextResponse.json(
        { 
          step: 3, 
          error: 'Invalid file extension',
          fileName,
          allowedExtensions
        },
        { status: 415 }
      );
    }
    
    // Step 4: Determine file type
    console.log('Step 4: Determining file type...');
    let fileType: 'tcx' | 'gpx' | 'fit';
    if (fileName.endsWith('.tcx')) {
      fileType = 'tcx';
    } else if (fileName.endsWith('.gpx')) {
      fileType = 'gpx';
    } else if (fileName.endsWith('.fit')) {
      fileType = 'fit';
    } else {
      return NextResponse.json(
        { step: 4, error: 'Unable to determine file type' },
        { status: 400 }
      );
    }
    
    console.log('File type determined:', fileType);
    
    // Step 5: Database connection test
    console.log('Step 5: Testing database connection...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { step: 5, error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Step 6: Test ingest_staging table insert
    console.log('Step 6: Testing ingest_staging insert...');
    const ingestId = crypto.randomUUID();
    
    const { data: ingestRecord, error: insertError } = await supabase
      .from('ingest_staging')
      .insert({
        ingest_id: ingestId,
        athlete_id: athleteId,
        filename: file.name,
        file_type: fileType,
        file_size: file.size,
        status: 'received',
        storage_path: `test-debug-${ingestId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { 
          step: 6, 
          error: 'Database insert failed',
          details: insertError,
          fileType,
          ingestId
        },
        { status: 500 }
      );
    }
    
    // Clean up test record
    await supabase
      .from('ingest_staging')
      .delete()
      .eq('ingest_id', ingestId);
    
    console.log('✅ All steps passed');
    
    return NextResponse.json({
      status: 'success',
      message: 'All upload steps would succeed',
      details: {
        athleteId,
        fileName: file.name,
        fileSize: file.size,
        fileType,
        ingestId
      }
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
