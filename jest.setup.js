// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Set up environment variables for Supabase client initialization
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

// Add any global test setup here
