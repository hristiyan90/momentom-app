'use client';

import { useSession } from '@/lib/hooks/useSession';
import { useState } from 'react';

export default function TestSessionPage() {
  const { session, loading, error, isRefreshing } = useSession();
  const [testLog, setTestLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  // Calculate time until expiry
  const expiresAt = session?.expires_at;
  const timeUntilExpiry = expiresAt ? Math.floor((expiresAt - Date.now() / 1000)) : 0;
  const minutesUntilExpiry = Math.floor(timeUntilExpiry / 60);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">GAP-2 Session Auto-Refresh Test</h1>

        <div className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded bg-white">
              <h2 className="font-semibold text-sm text-gray-600 mb-2">Loading State</h2>
              <p className={`text-2xl font-bold ${loading ? "text-yellow-600" : "text-green-600"}`}>
                {loading ? "🔄 Loading..." : "✅ Loaded"}
              </p>
            </div>

            <div className="p-4 border rounded bg-white">
              <h2 className="font-semibold text-sm text-gray-600 mb-2">Refreshing State</h2>
              <p className={`text-2xl font-bold ${isRefreshing ? "text-blue-600 animate-pulse" : "text-gray-400"}`}>
                {isRefreshing ? "🔄 Refreshing..." : "⏸️ Idle"}
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 border-2 border-red-500 rounded bg-red-50">
              <h2 className="font-semibold text-red-700 mb-2">❌ Error</h2>
              <p className="text-red-600 font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Session Data */}
          {session && (
            <>
              <div className="p-6 border-2 border-green-500 rounded bg-green-50">
                <h2 className="font-semibold text-green-700 text-xl mb-4">✅ Session Active</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">User Email</p>
                    <p className="font-mono text-sm">{session.user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-mono text-xs">{session.user.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Expires At</p>
                    <p className="font-mono text-xs">{new Date(expiresAt! * 1000).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Time Until Expiry</p>
                    <p className={`font-bold text-lg ${timeUntilExpiry < 300 ? 'text-red-600' : 'text-green-600'}`}>
                      {minutesUntilExpiry} min ({timeUntilExpiry}s)
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Has Refresh Token</p>
                    <p className="font-bold text-lg">
                      {session.refresh_token ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Auto-Refresh Will Trigger</p>
                    <p className="font-bold text-lg">
                      {timeUntilExpiry < 300 ? '✅ Yes (< 5 min)' : '❌ No (> 5 min)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Auto-Refresh Info */}
              <div className="p-6 border rounded bg-blue-50">
                <h2 className="font-semibold text-blue-700 text-lg mb-4">🔄 Auto-Refresh Logic</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>Polling Interval:</span>
                    <span className="font-mono font-bold">30 seconds</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>Refresh Trigger Threshold:</span>
                    <span className="font-mono font-bold">300 seconds (5 min)</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>Current Time Until Expiry:</span>
                    <span className={`font-mono font-bold ${timeUntilExpiry < 300 ? 'text-red-600' : 'text-green-600'}`}>
                      {timeUntilExpiry}s
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>Retry Attempts on Failure:</span>
                    <span className="font-mono font-bold">3 attempts</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>Retry Delays:</span>
                    <span className="font-mono font-bold">1s, 2s, 4s (exponential backoff)</span>
                  </div>
                </div>

                {timeUntilExpiry < 300 && (
                  <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded">
                    <p className="text-yellow-800 font-semibold">
                      ⚠️ Auto-refresh should trigger within the next 30 seconds!
                    </p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Watch the console logs and the "Refreshing State" indicator above.
                    </p>
                  </div>
                )}
              </div>

              {/* Test Instructions */}
              <div className="p-6 border rounded bg-purple-50">
                <h2 className="font-semibold text-purple-700 text-lg mb-4">📋 Testing Instructions</h2>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold mb-1">1. Open Browser DevTools Console</p>
                    <p className="text-gray-600">Press F12 or Cmd+Option+I to view detailed logs</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-1">2. Watch for Auto-Refresh Logs</p>
                    <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                      <li>"Token expires in XXXs, triggering refresh"</li>
                      <li>"Refresh attempt 1/3"</li>
                      <li>"Session refresh successful"</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-1">3. Verify Refresh Status</p>
                    <p className="text-gray-600">
                      When time until expiry &lt; 5 minutes, watch the "Refreshing State" indicator turn blue
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold mb-1">4. Check New Expiry Time</p>
                    <p className="text-gray-600">
                      After successful refresh, "Time Until Expiry" should reset to ~60 minutes
                    </p>
                  </div>
                </div>
              </div>

              {/* Raw Session JSON */}
              <details className="p-4 border rounded bg-gray-50">
                <summary className="font-semibold cursor-pointer">🔍 View Raw Session Data (JSON)</summary>
                <pre className="mt-4 text-xs overflow-auto max-h-64 bg-gray-900 text-green-400 p-4 rounded">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </details>
            </>
          )}

          {/* Not Logged In */}
          {!loading && !session && (
            <div className="p-6 border-2 border-yellow-500 rounded bg-yellow-50">
              <h2 className="font-semibold text-yellow-700 text-xl mb-2">⚠️ Not Logged In</h2>
              <p className="text-yellow-600 mb-4">You need to be logged in to test session auto-refresh.</p>
              <a
                href="/login"
                className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Go to Login
              </a>
            </div>
          )}

          {/* Test Log */}
          {testLog.length > 0 && (
            <div className="p-4 border rounded bg-gray-900">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-green-400">Test Log</h2>
                <button
                  onClick={() => setTestLog([])}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear Log
                </button>
              </div>
              <div className="font-mono text-xs text-green-400 space-y-1 max-h-48 overflow-auto">
                {testLog.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Console Monitor Guide */}
          <div className="p-6 border rounded bg-gray-100">
            <h2 className="font-semibold text-gray-700 text-lg mb-4">👀 What to Watch in Console</h2>

            <div className="space-y-2 text-sm font-mono">
              <div className="p-2 bg-white rounded">
                <span className="text-blue-600">✓</span> Token expires in 240s, triggering refresh
              </div>
              <div className="p-2 bg-white rounded">
                <span className="text-blue-600">✓</span> Refresh attempt 1/3
              </div>
              <div className="p-2 bg-white rounded">
                <span className="text-green-600">✓</span> Session refresh successful
              </div>
              <div className="p-2 bg-white rounded">
                <span className="text-yellow-600">⚠</span> Refresh already in progress, skipping (if concurrent)
              </div>
              <div className="p-2 bg-white rounded">
                <span className="text-red-600">✗</span> All refresh attempts failed, redirecting to login (on error)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
