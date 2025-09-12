import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

/**
 * Get normalized authentication flags from environment
 * @returns Object with normalized mode and allow override flags
 */
export function getAuthFlags() {
  const mode = (process.env.AUTH_MODE ?? 'dev').toLowerCase();
  // In dev-like modes, default override ON unless explicitly disabled
  const allow =
    mode !== 'prod' &&
    ['1','true','yes'].includes((process.env.ALLOW_HEADER_OVERRIDE ?? '1').toLowerCase());
  return { mode, allow };
}

type JwtAthleteClaims = {
  sub?: string;
  user_metadata?: { athlete_id?: string } | null;
  [k: string]: unknown;
};

async function verifySupabaseJwt(token: string): Promise<JwtAthleteClaims | null> {
  try {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) return null;
    const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256']
    });
    return payload as JwtAthleteClaims;
  } catch {
    return null;
  }
}

function readAuthToken(req: NextRequest): string | null {
  const h = req.headers.get('authorization');
  if (h && /^bearer\s+/i.test(h)) return h.split(/\s+/)[1] ?? null;
  // Supabase cookie (server-side)
  const cookie = req.cookies.get('sb-access-token')?.value;
  return cookie ?? null;
}

function isUuid(value: string): boolean {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Extract athlete ID from request with authentication mode awareness
 * 
 * Environment Variables:
 * - AUTH_MODE: Controls authentication strictness (dev/prod)
 * - ALLOW_HEADER_OVERRIDE: Allows x-athlete-id header (1/true/yes)
 * - SUPABASE_JWT_SECRET: JWT secret for production token verification
 * 
 * @param req - NextRequest object
 * @returns Promise<string> - Athlete ID
 * @throws Error when authentication fails or invalid tokens
 */
export async function getAthleteId(req: NextRequest): Promise<string> {
  const { mode, allow } = getAuthFlags();

  // Dev override path
  const rawHeader = req.headers.get('x-athlete-id');
  if (mode !== 'prod' && allow && rawHeader) {
    const id = rawHeader.trim();
    if (!isUuid(id)) throw new Error('invalid athlete id header');
    return id;
  }

  // Prod (and dev without override): require Supabase JWT
  const token = readAuthToken(req);
  if (!token) {
    if (mode === 'prod') throw new Error('prod mapping pending (A4)');
    // dev fallback when no override/token
    throw new Error('authentication required');
  }

  const claims = await verifySupabaseJwt(token);
  if (!claims) {
    if (mode === 'prod') throw new Error('invalid token');
    throw new Error('invalid token');
  }

  const metaId = claims.user_metadata?.athlete_id;
  if (typeof metaId === 'string' && isUuid(metaId)) return metaId;

  const sub = typeof claims.sub === 'string' ? claims.sub : '';
  if (isUuid(sub)) return sub;

  // No usable mapping in token
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

/**
 * Add authentication debug header for non-production environments
 * 
 * @param res - NextResponse instance
 * @param info - Authentication debug information
 */
export function addAuthDebug(res: NextResponse, info: { mode: string; allow: boolean; saw_header: boolean }) {
  if (info.mode !== 'prod') {
    res.headers.set('X-Debug-Auth', JSON.stringify(info));
  }
}
