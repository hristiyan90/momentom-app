const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyB2Migration() {
  try {
    console.log('🔄 Applying B2 Manual Upload migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250118_b2_manual_upload_phase1.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded, executing...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return;
    }
    
    console.log('✅ B2 migration applied successfully!');
    console.log('📋 Created tables:');
    console.log('   - public.sessions (with RLS)');
    console.log('   - public.ingest_staging (with RLS)');
    console.log('   - Storage bucket: workout-uploads');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

applyB2Migration();
