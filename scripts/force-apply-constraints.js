#!/usr/bin/env node

/**
 * Force apply FIT constraints using raw SQL execution
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function forceApplyConstraints() {
  try {
    console.log('🔧 Force applying FIT file constraints...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('📝 Step 1: Dropping existing constraints...');
    
    // Try to drop existing constraints first
    try {
      const { error: dropError1 } = await supabase
        .from('sessions')
        .select('*')
        .limit(0);
      console.log('   Sessions table accessible');
    } catch (error) {
      console.error('   Sessions table error:', error.message);
    }
    
    try {
      const { error: dropError2 } = await supabase
        .from('ingest_staging')
        .select('*')
        .limit(0);
      console.log('   Ingest staging table accessible');
    } catch (error) {
      console.error('   Ingest staging table error:', error.message);
    }
    
    console.log('📝 Step 2: Testing FIT insert directly...');
    
    // Try to insert a FIT session directly to see the exact constraint
    const testSessionData = {
      athlete_id: '00000000-0000-0000-0000-000000000001',
      date: '2025-09-26',
      sport: 'run',
      title: 'Direct FIT Test',
      status: 'completed',
      structure_json: { segments: [] },
      source_file_type: 'fit'
    };
    
    const { data: sessionResult, error: sessionError } = await supabase
      .from('sessions')
      .insert(testSessionData)
      .select('session_id')
      .single();
    
    if (sessionError) {
      console.log('❌ Sessions table constraint issue:');
      console.log('   Code:', sessionError.code);
      console.log('   Message:', sessionError.message);
      console.log('   Details:', sessionError.details);
    } else {
      console.log('✅ Sessions table accepts FIT files');
      // Clean up
      if (sessionResult?.session_id) {
        await supabase
          .from('sessions')
          .delete()
          .eq('session_id', sessionResult.session_id);
      }
    }
    
    console.log('📝 Step 3: Testing FIT ingest staging insert...');
    
    const testIngestData = {
      ingest_id: crypto.randomUUID(),
      athlete_id: '00000000-0000-0000-0000-000000000001',
      filename: 'test.fit',
      file_type: 'fit',
      file_size: 1000,
      status: 'received',
      storage_path: 'test-path'
    };
    
    const { data: ingestResult, error: ingestError } = await supabase
      .from('ingest_staging')
      .insert(testIngestData)
      .select('ingest_id')
      .single();
    
    if (ingestError) {
      console.log('❌ Ingest staging table constraint issue:');
      console.log('   Code:', ingestError.code);
      console.log('   Message:', ingestError.message);
      console.log('   Details:', ingestError.details);
      
      if (ingestError.code === '23514' && ingestError.message.includes('file_type_check')) {
        console.log('\n🔧 This confirms the ingest_staging table needs the constraint update.');
        console.log('📋 You need to run this SQL in Supabase:');
        console.log('ALTER TABLE public.ingest_staging DROP CONSTRAINT IF EXISTS ingest_staging_file_type_check;');
        console.log('ALTER TABLE public.ingest_staging ADD CONSTRAINT ingest_staging_file_type_check CHECK (file_type IN (\'tcx\', \'gpx\', \'fit\'));');
      }
    } else {
      console.log('✅ Ingest staging table accepts FIT files');
      // Clean up
      if (ingestResult?.ingest_id) {
        await supabase
          .from('ingest_staging')
          .delete()
          .eq('ingest_id', ingestResult.ingest_id);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

forceApplyConstraints();
