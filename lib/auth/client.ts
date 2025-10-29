import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid bundling issues with env vars
let _supabaseClient: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

/**
 * Get or create the Supabase client (lazy initialization)
 * This avoids trying to access process.env during module bundling
 */
function createSupabaseClient(): SupabaseClient {
  if (_supabaseClient) {
    return _supabaseClient;
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase configuration missing:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
  }

  _supabaseClient = createClient(
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

  return _supabaseClient;
}

/**
 * Client-side Supabase client with anon key
 * Use for client-side operations and public data access
 *
 * Note: This uses lazy initialization to avoid bundling issues
 */
export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = createSupabaseClient();
    return (client as any)[prop];
  }
});

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

