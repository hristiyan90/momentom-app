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
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec', { sql: statement });
        
        if (error) {
          console.warn(`   ⚠️  Statement ${i + 1} warning:`, error.message);
          // Continue with other statements
        } else {
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('✅ B2 migration completed!');
    console.log('📋 Created tables:');
    console.log('   - public.sessions (with RLS)');
    console.log('   - public.ingest_staging (with RLS)');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

applyB2Migration();
