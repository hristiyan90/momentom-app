import { NextRequest, NextResponse } from 'next/server';

/**
 * Get normalized authentication flags from environment
 * @returns Object with normalized mode and allow override flags
 */
export function getAuthFlags() {
  const mode = (process.env.AUTH_MODE ?? 'dev').toLowerCase();
  const allow =
    mode !== 'prod' &&
    ['1','true','yes'].includes((process.env.ALLOW_HEADER_OVERRIDE ?? '0').toLowerCase());
  return { mode, allow };
}

/**
 * Extract athlete ID from request with authentication mode awareness
 * 
 * Environment Variables:
 * - AUTH_MODE: Controls authentication strictness (dev/prod)
 * - ALLOW_HEADER_OVERRIDE: Allows x-athlete-id header (1/true/yes)
 * 
 * @param req - NextRequest object
 * @returns Promise<string> - Athlete ID
 * @throws Error when prod mapping is pending (A4) or invalid header
 */
export async function getAthleteId(req: NextRequest): Promise<string> {
  const { mode, allow } = getAuthFlags();

  // Check for x-athlete-id header override (case-insensitive)
  const athleteIdHeader = req.headers.get('x-athlete-id');
  
  if (athleteIdHeader) {
    // In non-prod mode with header override enabled, use the header
    if (mode !== 'prod' && allow) {
      const raw = athleteIdHeader.trim();
      
      // Validate UUID v4/any format: 36 characters with hyphens and hex digits
      if (!/^[0-9a-fA-F-]{36}$/.test(raw)) {
        throw new Error('invalid athlete id header');
      }
      
      // Additional UUID structure validation (8-4-4-4-12 format)
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
      if (!uuidRegex.test(raw)) {
        throw new Error('invalid athlete id header');
      }
      
      return raw;
    }
  }

  // Production authentication mapping is not yet implemented
  if (mode === 'prod') {
    throw new Error('prod mapping pending (A4)');
  }
  
  // In dev mode without valid header override, provide fallback
  throw new Error('authentication required');
}

/**
 * Add standard H1-H7 security, cache, and correlation headers to response
 * 
 * @param res - NextResponse instance to modify
 * @param correlationId - Request correlation ID for tracing
 * @returns Modified NextResponse with standard headers
 */
export function addStandardHeaders(res: NextResponse, correlationId: string): NextResponse {
  const { allow } = getAuthFlags();

  // H3: Request/Trace Correlation Headers
  res.headers.set('X-Request-Id', correlationId);
  res.headers.set('X-Explainability-Id', `xpl_${correlationId.slice(0, 8)}`);

  // H5: Security Headers (Content-Type, X-Content-Type-Options, etc.)
  res.headers.set('Content-Type', 'application/json; charset=utf-8');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // H5: Vary Header for proper caching (include X-Athlete-Id when overrides enabled)
  const varyHeaders = ['X-Request-Id', 'X-Client-Timezone'];
  if (allow) {
    varyHeaders.push('X-Athlete-Id');
  }
  res.headers.set('Vary', varyHeaders.join(', '));

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
