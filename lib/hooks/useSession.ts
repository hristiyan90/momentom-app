'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/auth/client';
import type { Session } from '@supabase/supabase-js';

interface UseSessionReturn {
  session: Session | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
}

/**
 * Custom hook for managing user session with automatic token refresh
 *
 * Features:
 * - Fetches current session from /api/auth/session on mount
 * - Automatically refreshes access token 5 minutes before expiration
 * - Polls every 30 seconds when in warning period (< 5 min to expiry)
 * - Implements retry logic with exponential backoff (3 attempts)
 * - Redirects to /login after failed refresh attempts
 *
 * @returns Session state with loading, error, and refresh status
 */
export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Use ref to prevent multiple concurrent refresh attempts
  const refreshInProgress = useRef(false);

  /**
   * Fetch current session from API endpoint
   * The /api/auth/session endpoint returns user info and expires_at
   * We need to get the full session from Supabase client for refresh_token
   */
  const fetchSession = useCallback(async () => {
    try {
      // Get session from Supabase client (includes refresh_token)
      const { data: { session: supabaseSession }, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (sessionError || !supabaseSession) {
        // No active session
        setSession(null);
        return null;
      }

      setSession(supabaseSession);
      setError(null);
      return supabaseSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch session';
      setError(message);
      console.error('Error fetching session:', err);
      return null;
    }
  }, []);

  /**
   * Refresh session with retry logic
   * Implements exponential backoff: 1s, 2s, 4s between attempts
   * Redirects to /login after 3 failed attempts
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent refresh attempts
    if (refreshInProgress.current) {
      console.log('Refresh already in progress, skipping');
      return false;
    }

    if (!session?.refresh_token) {
      console.warn('No refresh token available');
      router.push('/login');
      return false;
    }

    refreshInProgress.current = true;
    const maxAttempts = 3;
    const delays = [1000, 2000, 4000]; // 1s, 2s, 4s

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Wait before retry (skip on first attempt)
        if (attempt > 0) {
          console.log(`Waiting ${delays[attempt - 1]}ms before retry attempt ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
        }

        console.log(`Refresh attempt ${attempt + 1}/${maxAttempts}`);

        const { data, error: refreshError } = await supabaseClient.auth.refreshSession({
          refresh_token: session.refresh_token,
        });

        if (refreshError) {
          console.error(`Refresh attempt ${attempt + 1} failed:`, refreshError.message);

          if (attempt === maxAttempts - 1) {
            // Last attempt failed - redirect to login
            console.error('All refresh attempts failed, redirecting to login');
            refreshInProgress.current = false;
            router.push('/login');
            return false;
          }
          continue;
        }

        if (data.session) {
          // Success - update session
          console.log('Session refresh successful');
          setSession(data.session);
          setError(null);
          refreshInProgress.current = false;
          return true;
        }
      } catch (err) {
        console.error(`Refresh attempt ${attempt + 1} error:`, err);

        if (attempt === maxAttempts - 1) {
          refreshInProgress.current = false;
          router.push('/login');
          return false;
        }
      }
    }

    refreshInProgress.current = false;
    router.push('/login');
    return false;
  }, [session?.refresh_token, router]);

  /**
   * Initial session fetch on mount
   */
  useEffect(() => {
    fetchSession().finally(() => setLoading(false));
  }, [fetchSession]);

  /**
   * Auto-refresh timer
   * Checks every 30 seconds if token needs refresh
   * Triggers refresh when < 5 minutes (300 seconds) until expiration
   */
  useEffect(() => {
    if (!session?.expires_at) {
      return;
    }

    const checkInterval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = session.expires_at! - now;

      // If less than 5 minutes (300 seconds) remaining, trigger refresh
      if (timeUntilExpiry < 300 && timeUntilExpiry > 0 && !isRefreshing && !refreshInProgress.current) {
        console.log(`Token expires in ${timeUntilExpiry}s, triggering refresh`);
        setIsRefreshing(true);
        refreshSession().finally(() => setIsRefreshing(false));
      } else if (timeUntilExpiry <= 0) {
        // Token already expired
        console.warn('Token has expired');
        router.push('/login');
      }
    }, 30000); // Check every 30 seconds

    // Also do an immediate check on mount/session change
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = session.expires_at! - now;

    if (timeUntilExpiry < 300 && timeUntilExpiry > 0 && !isRefreshing && !refreshInProgress.current) {
      console.log(`Token expires in ${timeUntilExpiry}s (initial check), triggering refresh`);
      setIsRefreshing(true);
      refreshSession().finally(() => setIsRefreshing(false));
    }

    return () => clearInterval(checkInterval);
  }, [session, isRefreshing, refreshSession, router]);

  return { session, loading, error, isRefreshing };
}
