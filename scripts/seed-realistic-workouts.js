#!/usr/bin/env node

/**
 * Seed Realistic Workout Data
 * 
 * Generates 4 months of realistic training data for calendar testing.
 * Creates varied workouts across running, cycling, swimming, and strength training.
 */

async function seedWorkoutData() {
  try {
    console.log('🏃 Starting realistic workout data seeding...');
    
    const baseUrl = process.env.API_BASE || 'http://localhost:3000';
    const endpoint = `${baseUrl}/api/dev/seed-workout-data`;
    
    console.log(`📡 Calling: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Workout data seeding completed successfully!');
    console.log(`📊 Results:`);
    console.log(`   - Sessions inserted: ${result.sessionsInserted}`);
    console.log(`   - Date range: ${result.dateRange}`);
    console.log(`   - Sports included: ${result.sports.join(', ')}`);
    console.log(`   - Note: ${result.note}`);
    console.log('');
    console.log('🏆 Compliance Features:');
    console.log(`   - ${result.features.completion_logic}`);
    console.log(`   - ${result.features.duration_variance}`);
    console.log(`   - ${result.features.compliance_factors}`);
    console.log(`   - ${result.features.future_sessions}`);
    console.log('');
    console.log('🗓️ Calendar testing:');
    console.log('   - Navigate to June 2025 through September 2025');
    console.log('   - Past sessions show realistic completion patterns');
    console.log('   - Completed sessions have varied actual durations');
    console.log('   - Future sessions are marked as planned');
    
  } catch (error) {
    console.error('❌ Workout data seeding failed:');
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Make sure the development server is running (npm run dev)');
    console.error('   2. Verify Supabase connection is working');
    console.error('   3. Check that the test athlete exists in the database');
    console.error('   4. Ensure database migrations have been applied');
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedWorkoutData();
}

module.exports = { seedWorkoutData };
