import { NextRequest, NextResponse } from 'next/server';

/**
 * Extract athlete ID from request with authentication mode awareness
 * 
 * Environment Variables:
 * - AUTH_MODE: Controls authentication strictness
 * - ALLOW_HEADER_OVERRIDE: Allows X-Athlete-Id header in non-prod
 * 
 * @param req - NextRequest object
 * @returns Promise<string> - Athlete ID
 * @throws Error when prod mapping is pending (A4)
 */
export async function getAthleteId(req: NextRequest): Promise<string> {
  const authMode = process.env.AUTH_MODE || 'dev';
  const allowHeaderOverride = process.env.ALLOW_HEADER_OVERRIDE === '1';
  const isProdAuth = authMode === 'prod';

  // Check for X-Athlete-Id header override
  const athleteIdHeader = req.headers.get('X-Athlete-Id');
  
  if (athleteIdHeader) {
    // In non-prod mode with header override enabled, use the header
    if (!isProdAuth && allowHeaderOverride) {
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
      
      return athleteId;
    }
  }

  // Production authentication mapping is not yet implemented
  throw new Error('prod mapping pending (A4)');
}

/**
 * Add standard H1-H7 security, cache, and correlation headers to response
 * 
 * @param res - NextResponse instance to modify
 * @param correlationId - Request correlation ID for tracing
 * @returns Modified NextResponse with standard headers
 */
export function addStandardHeaders(res: NextResponse, correlationId: string): NextResponse {
  // H3: Request/Trace Correlation Headers
  res.headers.set('X-Request-Id', correlationId);
  res.headers.set('X-Explainability-Id', `xpl_${correlationId.slice(0, 8)}`);

  // H5: Security Headers (Content-Type, X-Content-Type-Options, etc.)
  res.headers.set('Content-Type', 'application/json; charset=utf-8');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // H5: Vary Header for proper caching
  res.headers.set('Vary', 'X-Request-Id, X-Client-Timezone');

  // H5: Cache Control (no-store for mutations by default)
  if (!res.headers.get('Cache-Control')) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  return res;
}

/**
 * Add cache control hint to response
 * 
 * @param res - NextResponse instance
 * @param hint - Cache control directive (e.g., "private, max-age=60")
 */
export function setCacheHint(res: NextResponse, hint: string): void {
  res.headers.set('Cache-Control', hint);
}

/**
 * Add authentication challenge header for 401 responses
 * 
 * @param res - NextResponse instance  
 * @param realm - Authentication realm
 * @param error - OAuth error code
 */
export function addAuthChallenge(res: NextResponse, realm = 'momentom', error = 'invalid_token'): void {
  res.headers.set('WWW-Authenticate', `Bearer realm="${realm}", error="${error}"`);
}
