#!/usr/bin/env node

/**
 * Diagnostic script for signup issues
 * Run: node diagnose-signup.js
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== Signup Diagnostic Check ===\n');

// Check environment variables
console.log('1. Environment Variables:');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_BASE_URL',
  'SUPABASE_URL'
];

let missingRequired = [];
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${varName}: MISSING`);
    missingRequired.push(varName);
  }
});

optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ℹ️  ${varName}: ${process.env[varName].substring(0, 20)}...`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set (optional)`);
  }
});

console.log('');

if (missingRequired.length > 0) {
  console.log('❌ ERROR: Missing required environment variables:', missingRequired.join(', '));
  console.log('\nPlease add these to your .env.local file:');
  missingRequired.forEach(varName => {
    console.log(`  ${varName}=your-value-here`);
  });
  process.exit(1);
}

// Test Supabase connection
console.log('2. Testing Supabase Connection:');

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

(async () => {
  try {
    // Test database connection
    const { data, error } = await supabase.from('athlete_profiles').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('  ❌ athlete_profiles table does not exist');
        console.log('     Run migrations: npm run db:migrate or apply migrations in Supabase dashboard');
      } else if (error.message.includes('JWT')) {
        console.log('  ❌ JWT authentication failed');
        console.log('     Check SUPABASE_SERVICE_ROLE_KEY and SUPABASE_JWT_SECRET');
      } else {
        console.log('  ❌ Database connection error:', error.message);
      }
      process.exit(1);
    }
    
    console.log('  ✅ Database connection successful');
    console.log('  ✅ athlete_profiles table exists');
    
    // Test auth
    console.log('\n3. Testing Auth Service:');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!'
    });
    
    if (authError) {
      console.log('  ❌ Auth signup test failed:', authError.message);
      
      if (authError.message.includes('invalid')) {
        console.log('     This is expected for @example.com emails');
        console.log('     Try with a real email domain like @gmail.com in actual tests');
      }
    } else if (authData.user) {
      console.log('  ✅ Auth signup successful');
      console.log('  ℹ️  User created:', authData.user.id);
      console.log('  ℹ️  Session:', authData.session ? 'Returned' : 'Not returned (email confirmation required)');
      
      // Clean up test user
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('  ✅ Test user cleaned up');
      } catch (e) {
        console.log('  ⚠️  Could not delete test user (may need manual cleanup)');
      }
    }
    
    console.log('\n=== Diagnostic Complete ===\n');
    console.log('If all checks passed, the signup endpoint should work.');
    console.log('If you see errors, fix them and run this diagnostic again.\n');
    
  } catch (error) {
    console.log('  ❌ Unexpected error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();

