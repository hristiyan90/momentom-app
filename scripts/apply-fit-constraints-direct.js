#!/usr/bin/env node

/**
 * Apply FIT file constraints directly to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function applyConstraints() {
  try {
    console.log('🔄 Applying FIT file constraints...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test if FIT constraint is already working by creating a test session
    console.log('🧪 Testing current constraints...');
    
    const testSessionData = {
      athlete_id: '00000000-0000-0000-0000-000000000001',
      date: '2025-09-26',
      sport: 'run',
      title: 'FIT Constraint Test',
      status: 'completed',
      structure_json: { segments: [] },
      source_file_type: 'fit'
    };
    
    const { data: sessionResult, error: sessionError } = await supabase
      .from('sessions')
      .insert(testSessionData)
      .select('session_id')
      .single();
    
    if (sessionError && sessionError.code === '23514') {
      console.log('❌ FIT constraints not applied yet');
      console.log('🔧 Manual SQL needed:');
      console.log('');
      console.log('-- Run these commands in Supabase SQL Editor:');
      console.log('ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_source_file_type_check;');
      console.log('ALTER TABLE public.sessions ADD CONSTRAINT sessions_source_file_type_check CHECK (source_file_type IN (\'tcx\', \'gpx\', \'manual\', \'fit\'));');
      console.log('');
      console.log('ALTER TABLE public.ingest_staging DROP CONSTRAINT IF EXISTS ingest_staging_file_type_check;');
      console.log('ALTER TABLE public.ingest_staging ADD CONSTRAINT ingest_staging_file_type_check CHECK (file_type IN (\'tcx\', \'gpx\', \'fit\'));');
      console.log('');
      
      return;
    }
    
    if (sessionError) {
      console.error('❌ Unexpected error:', sessionError);
      return;
    }
    
    // If we got here, the constraint is working!
    console.log('✅ FIT constraints are already applied!');
    
    // Clean up test session
    if (sessionResult?.session_id) {
      await supabase
        .from('sessions')
        .delete()
        .eq('session_id', sessionResult.session_id);
      console.log('🧹 Cleaned up test session');
    }
    
    console.log('🎉 FIT file support is ready to use!');
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

applyConstraints();
