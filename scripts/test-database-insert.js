const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseInsert() {
  try {
    console.log('🧪 Testing database insert...');
    
    const testAthleteId = '00000000-0000-0000-0000-000000000001';
    const ingestId = crypto.randomUUID();
    
    console.log('📝 Inserting test record...');
    console.log('   Athlete ID:', testAthleteId);
    console.log('   Ingest ID:', ingestId);
    
    const { data, error } = await supabase
      .from('ingest_staging')
      .insert({
        ingest_id: ingestId,
        athlete_id: testAthleteId,
        filename: 'test.tcx',
        file_type: 'tcx',
        file_size: 268,
        status: 'received',
        storage_path: `raw/${testAthleteId}/${ingestId}.tcx`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Insert failed:', error);
      return;
    }
    
    console.log('✅ Insert successful!');
    console.log('📋 Created record:', data);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testDatabaseInsert();
