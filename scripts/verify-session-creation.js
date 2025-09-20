const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySessionCreation() {
  try {
    console.log('🔍 Verifying session creation...');
    
    // Check sessions table
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (sessionsError) {
      console.error('❌ Error querying sessions:', sessionsError);
      return;
    }
    
    console.log('✅ Sessions found:');
    sessions.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.title} (${session.sport}) - ${session.date}`);
      console.log(`      Session ID: ${session.session_id}`);
      console.log(`      Source: ${session.source_file_type} (${session.source_ingest_id})`);
      console.log(`      Duration: ${session.actual_duration_min} min`);
      console.log(`      Distance: ${session.actual_distance_m || 'N/A'} m`);
      console.log('');
    });
    
    // Check ingest_staging table
    const { data: ingestRecords, error: ingestError } = await supabase
      .from('ingest_staging')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ingestError) {
      console.error('❌ Error querying ingest_staging:', ingestError);
      return;
    }
    
    console.log('✅ Ingest records found:');
    ingestRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.filename} (${record.file_type}) - ${record.status}`);
      console.log(`      Ingest ID: ${record.ingest_id}`);
      console.log(`      Session ID: ${record.session_id || 'None'}`);
      console.log(`      Size: ${record.file_size} bytes`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifySessionCreation();
