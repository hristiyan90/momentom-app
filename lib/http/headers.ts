import { NextResponse } from 'next/server';

export interface SecurityHeadersOptions {
  /** Add X-Client-Timezone to Vary header (default: true) */
  varyTimezone?: boolean;
  /** Set no-store cache control (default: false) */
  noStore?: boolean;
  /** Custom cache control hint (e.g., "private, max-age=60") */
  cacheHint?: string;
  /** Add WWW-Authenticate header for 401 responses */
  wwwAuthenticate?: string;
}

/**
 * Apply consistent security and cache headers to API responses
 * 
 * @param res - NextResponse instance to modify
 * @param opts - Header configuration options
 * @returns Modified NextResponse with security headers applied
 */
export function withSecurityHeaders(
  res: NextResponse, 
  opts: SecurityHeadersOptions = {}
): NextResponse {
  const { varyTimezone = true, noStore = false, cacheHint, wwwAuthenticate } = opts;

  // Core security headers
  res.headers.set('Content-Type', 'application/json; charset=utf-8');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // Vary headers for proper caching
  const varyHeaders = ['X-Request-Id'];
  if (varyTimezone) {
    varyHeaders.push('X-Client-Timezone');
  }
  res.headers.set('Vary', varyHeaders.join(', '));

  // Cache control headers
  if (noStore) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  } else if (cacheHint) {
    res.headers.set('Cache-Control', cacheHint);
  }

  // Authentication headers for 401 responses
  if (wwwAuthenticate) {
    res.headers.set('WWW-Authenticate', wwwAuthenticate);
  }

  return res;
}
