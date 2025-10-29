'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/auth/client';
import type { Session } from '@supabase/supabase-js';

/**
 * Simple session status widget to add to any existing page for testing
 * Add this to cockpit page temporarily to test GAP-2
 *
 * NOTE: This version doesn't use useSession hook to avoid redirects during testing
 */
export function SessionTestWidget() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch session directly without redirect
    supabaseClient.auth.getSession()
      .then(({ data: { session: s }, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setSession(s);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null; // Don't show during initial load

  const timeUntilExpiry = session?.expires_at
    ? Math.floor((session.expires_at - Date.now() / 1000))
    : 0;
  const minutesLeft = Math.floor(timeUntilExpiry / 60);

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-w-sm z-50">
      <div className="text-xs font-mono space-y-2">
        <div className="font-bold text-sm mb-2">🧪 GAP-2 Session Test</div>

        {error && (
          <div className="text-red-600">❌ Error: {error}</div>
        )}

        {session ? (
          <>
            <div className="text-gray-600">
              ✅ Active
            </div>

            <div>
              <span className="text-gray-500">Email:</span> {session.user.email}
            </div>

            <div>
              <span className="text-gray-500">Refresh Token:</span>
              <span className={session.refresh_token ? 'text-green-600' : 'text-red-600'}>
                {session.refresh_token ? ' ✅ Yes' : ' ❌ No'}
              </span>
            </div>

            <div>
              <span className="text-gray-500">Expires in:</span>
              <span className={timeUntilExpiry < 300 ? 'text-red-600 font-bold' : 'text-green-600'}>
                {' '}{minutesLeft}m ({timeUntilExpiry}s)
              </span>
            </div>

            {timeUntilExpiry < 300 && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-800">
                ⚠️ Auto-refresh should trigger soon!
              </div>
            )}

            <div className="mt-2 pt-2 border-t text-gray-400 text-xs">
              Check console for logs
            </div>
          </>
        ) : (
          <div>
            <div className="text-yellow-600 mb-2">⚠️ No session</div>
            <div className="text-xs text-gray-500">
              You need to log in to test auto-refresh
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
