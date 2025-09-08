import { createClient } from '@supabase/supabase-js'

// NEVER import this into client components - server-only
// This module contains service role key and should only be used server-side

/**
 * Creates a Supabase admin client for server-side use with service role key
 * WARNING: Only use on the server - contains elevated permissions
 */
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

/**
 * JWT payload interface for type safety
 */
interface JWTPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  [key: string]: unknown;
}

/**
 * Helper function to decode JWT payload (base64url)
 */
function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    // Convert base64url to base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Simple mapping from JWT subject to athlete UUID
 * TODO: Replace with real database lookup
 */
function mapSubjectToAthleteId(sub: string): string {
  // Simple mapping for demo/testing - in production this would query the athlete table
  const subjectMap: Record<string, string> = {
    'user_123': '00000000-0000-0000-0000-000000000001',
    'user_456': '00000000-0000-0000-0000-000000000002',
    'user_789': '00000000-0000-0000-0000-000000000003',
    // Add more mappings as needed
  };
  
  // Default to first athlete if not found in map
  return subjectMap[sub] || '00000000-0000-0000-0000-000000000001';
}

/**
 * Extract athlete ID from request authentication
 * Supports both development and production authentication modes
 * 
 * Environment Variables:
 * - AUTH_MODE: "dev" (default) | "prod" - Controls authentication strictness
 * - ALLOW_HEADER_OVERRIDE: "0" (default) | "1" - Allow X-Athlete-Id in non-prod when enabled
 * 
 * Dev Mode (AUTH_MODE=dev):
 * - Accepts X-Athlete-Id header override
 * - Accepts Bearer DUMMY token  
 * - Falls back to mock athlete if no auth provided
 * 
 * Prod Mode (AUTH_MODE=prod):
 * - Requires valid JWT Bearer tokens with 'sub' claim
 * - Rejects Bearer DUMMY and dev fallbacks
 * - Only allows X-Athlete-Id if ALLOW_HEADER_OVERRIDE=1
 */
export async function getAthleteIdFromAuth(req: Request): Promise<{ athleteId: string } | null> {
  const authMode = process.env.AUTH_MODE || 'dev';
  const allowHeaderOverride = process.env.ALLOW_HEADER_OVERRIDE === '1';
  const isProdAuth = authMode === 'prod';
  
  console.log('🔐 Auth mode:', { authMode, isProdAuth, allowHeaderOverride });
  
  // Check for X-Athlete-Id header override
  const athleteIdHeader = req.headers.get('X-Athlete-Id');
  if (athleteIdHeader) {
    // In prod mode, only allow X-Athlete-Id if explicitly enabled
    if (isProdAuth && !allowHeaderOverride) {
      console.log('🚫 X-Athlete-Id header not allowed in production mode');
      return null;
    }
    
    // In dev mode or when explicitly allowed, process the header
    if (!isProdAuth || allowHeaderOverride) {
      console.log('✅ Using X-Athlete-Id header override:', athleteIdHeader);
      
      // Convert dev athlete names to UUIDs for database compatibility
      const athleteMap: Record<string, string> = {
        'ath_mock': '00000000-0000-0000-0000-000000000001',
        'ath_u1': '00000000-0000-0000-0000-000000000002',
        'ath_u2': '00000000-0000-0000-0000-000000000003'
      };
      
      // If it's already a UUID format, use it directly; otherwise map it
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const athleteId = uuidRegex.test(athleteIdHeader) 
        ? athleteIdHeader 
        : athleteMap[athleteIdHeader] || '00000000-0000-0000-0000-000000000001';
      
      return { athleteId };
    }
  }

  // Check Authorization header
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('🚫 No valid Authorization header found');
    
    // Development fallback: allow with mock athlete (unless in prod mode)
    if (!isProdAuth) {
      console.log('✅ Dev mode fallback to mock athlete');
      return { athleteId: '00000000-0000-0000-0000-000000000001' };
    }
    
    return null;
  }
  
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  
  // In production mode, reject Bearer DUMMY
  if (isProdAuth && token === 'DUMMY') {
    console.log('🚫 Bearer DUMMY rejected in production mode');
    return null;
  }
  
  // In dev mode, accept Bearer DUMMY
  if (!isProdAuth && token === 'DUMMY') {
    console.log('✅ Bearer DUMMY accepted in dev mode');
    return { athleteId: '00000000-0000-0000-0000-000000000001' };
  }
  
  // JWT validation for production mode
  if (isProdAuth) {
    console.log('🔍 Validating JWT token in production mode');
    
    // Basic JWT structure validation (should have 3 dot-separated parts)
    if (token.split('.').length !== 3) {
      console.log('🚫 Invalid JWT structure');
      return null;
    }
    
    // Decode and validate JWT payload
    const payload = decodeJWTPayload(token);
    if (!payload) {
      console.log('🚫 Failed to decode JWT payload');
      return null;
    }
    
    // Check for required 'sub' claim
    if (!payload.sub) {
      console.log('🚫 JWT missing required "sub" claim');
      return null;
    }
    
    console.log('✅ JWT validation successful, sub:', payload.sub);
    
    // Map subject to athlete ID
    const athleteId = mapSubjectToAthleteId(payload.sub);
    console.log('✅ Mapped to athlete ID:', athleteId);
    
    return { athleteId };
  }
  
  // Development mode: accept any Bearer token as valid
  console.log('✅ Dev mode: accepting Bearer token');
  return { athleteId: '00000000-0000-0000-0000-000000000001' };
}