const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAthleteSchema() {
  try {
    console.log('🔍 Checking athlete table schema...');
    
    // Try to get an existing athlete to see the schema
    const { data: athletes, error } = await supabase
      .from('athlete')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying athlete table:', error);
      return;
    }
    
    if (athletes && athletes.length > 0) {
      console.log('✅ Athlete table schema:');
      console.log(JSON.stringify(athletes[0], null, 2));
    } else {
      console.log('📋 No athletes found, trying to create one with minimal fields...');
      
      // Try with just the required fields
      const { data, error: insertError } = await supabase
        .from('athlete')
        .insert({
          athlete_id: '00000000-0000-0000-0000-000000000000'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error creating minimal athlete:', insertError);
      } else {
        console.log('✅ Minimal athlete created:', data);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkAthleteSchema();
