import { supabaseClient } from './client';
import { SessionRefreshError } from './errors';
import type { Session } from '@supabase/supabase-js';

/**
 * Refresh an expired access token using refresh token
 * @param refreshToken - The refresh token from previous session
 * @returns New session with refreshed access token
 * @throws SessionRefreshError if refresh fails
 */
export async function refreshSession(refreshToken: string): Promise<Session> {
  const { data, error } = await supabaseClient.auth.refreshSession({
    refresh_token: refreshToken
  });
  
  if (error || !data.session) {
    throw new SessionRefreshError(
      'Failed to refresh session',
      error || undefined
    );
  }
  
  return data.session;
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
  
  const { data } = await supabaseClient.auth.getUser(token);
  
  if (!data.user) {
    return null;
  }
  
  return {
    access_token: token,
    refresh_token: '', // Not available from header
    expires_in: 3600,
    token_type: 'bearer',
    user: data.user
  };
}

