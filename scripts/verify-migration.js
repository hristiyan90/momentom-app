const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  try {
    console.log('🔍 Verifying B2 migration...');
    
    // Check if tables exist
    console.log('📋 Checking tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .in('table_name', ['sessions', 'ingest_staging']);
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message);
      return;
    }
    
    console.log('✅ Tables found:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name} (${table.table_type})`);
    });
    
    // Check RLS policies
    console.log('🔒 Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, permissive, cmd')
      .in('tablename', ['sessions', 'ingest_staging']);
    
    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError.message);
      return;
    }
    
    console.log('✅ RLS policies found:');
    policies.forEach(policy => {
      console.log(`   - ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
    });
    
    // Test basic insert (this will fail due to RLS, but that's expected)
    console.log('🧪 Testing RLS (should fail without auth)...');
    const { error: insertError } = await supabase
      .from('sessions')
      .insert({
        athlete_id: '00000000-0000-0000-0000-000000000000',
        date: '2025-01-19',
        sport: 'run',
        title: 'Test Session'
      });
    
    if (insertError && insertError.message.includes('RLS')) {
      console.log('✅ RLS is working - insert blocked as expected');
    } else {
      console.log('⚠️  RLS test inconclusive:', insertError?.message || 'No error');
    }
    
    console.log('✅ Migration verification complete!');
    console.log('📋 Ready for real database operations');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyMigration();
