const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAthlete() {
  try {
    console.log('🔄 Creating test athlete...');
    
    const testAthleteId = '00000000-0000-0000-0000-000000000000';
    
    // Check if athlete already exists
    const { data: existingAthlete, error: checkError } = await supabase
      .from('athlete')
      .select('athlete_id')
      .eq('athlete_id', testAthleteId)
      .single();
    
    if (existingAthlete) {
      console.log('✅ Test athlete already exists');
      return;
    }
    
    // Create test athlete
    const { data, error } = await supabase
      .from('athlete')
      .insert({
        athlete_id: testAthleteId,
        name: 'Test Athlete',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating test athlete:', error);
      return;
    }
    
    console.log('✅ Test athlete created successfully');
    console.log('📋 Athlete ID:', data.athlete_id);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createTestAthlete();
