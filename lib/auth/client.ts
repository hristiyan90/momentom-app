import { createClient } from '@supabase/supabase-js';

// Get env vars with logging for debugging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log for debugging (only in development)
if (typeof window !== 'undefined' && !supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
}
if (typeof window !== 'undefined' && !supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
}

/**
 * Client-side Supabase client with anon key
 * Use for client-side operations and public data access
 */
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

/**
 * Server-side Supabase client with service role key
 * Use for server operations requiring elevated permissions
 */
export const supabaseServer = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

