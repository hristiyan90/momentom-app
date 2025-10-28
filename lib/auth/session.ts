import { supabaseClient } from './client';
import { SessionRefreshError } from './errors';
import type { Session } from '@supabase/supabase-js';

/**
 * Refresh an expired access token using refresh token
 * Implements retry logic with exponential backoff (3 attempts: 0s, 1s, 2s, 4s delays)
 * @param refreshToken - The refresh token from previous session
 * @returns New session with refreshed access token
 * @throws SessionRefreshError if refresh fails after all retry attempts
 */
export async function refreshSession(refreshToken: string): Promise<Session> {
  const maxAttempts = 3;
  const delays = [0, 1000, 2000, 4000]; // 0s, 1s, 2s, 4s
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Wait before retry (first attempt has 0ms delay)
      if (delays[attempt] > 0) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      }

      const { data, error } = await supabaseClient.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error || !data.session) {
        throw error || new Error('Session data not returned');
      }

      // Success - return session
      return data.session;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt, break and throw error
      if (attempt === maxAttempts - 1) {
        break;
      }
    }
  }

  // All attempts failed
  throw new SessionRefreshError(
    `Failed to refresh session after ${maxAttempts} attempts`,
    lastError
  );
}

/**
 * Extract refresh token from cookie header
 * @param cookieHeader - The Cookie header string
 * @returns Refresh token if found, empty string otherwise
 */
function extractRefreshToken(cookieHeader: string | null): string {
  if (!cookieHeader) {
    return '';
  }

  // Parse cookies - format: "name1=value1; name2=value2"
  const cookies = cookieHeader.split(';').map(c => c.trim());

  for (const cookie of cookies) {
    if (cookie.startsWith('sb-refresh-token=')) {
      return cookie.substring('sb-refresh-token='.length);
    }
  }

  return '';
}

/**
 * Get current session from request
 * Extracts session from cookies or headers
 * @param request - The incoming request
 * @returns Session if valid, null otherwise
 */
export async function getSession(request: Request): Promise<Session | null> {
  // Extract token from Authorization header or cookies
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  // Verify token and get user - this also validates the session is still active
  const { data, error } = await supabaseClient.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  // Extract refresh token from cookies
  const cookieHeader = request.headers.get('cookie');
  const refreshToken = extractRefreshToken(cookieHeader);

  // Decode JWT to get expiration time
  let expiresAt: number | undefined;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    expiresAt = payload.exp;
  } catch {
    // If we can't decode, use default 1 hour from now
    expiresAt = Math.floor(Date.now() / 1000) + 3600;
  }

  return {
    access_token: token,
    refresh_token: refreshToken,
    expires_in: 3600,
    expires_at: expiresAt,
    token_type: 'bearer',
    user: data.user
  };
}

