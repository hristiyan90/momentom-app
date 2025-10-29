'use client';

import { useEffect, useState } from 'react';

export default function GAP2TestPage() {
  const [status, setStatus] = useState<string>('Checking...');
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        setStatus('Loading Supabase client...');

        // Dynamically import to catch any errors
        const { supabaseClient } = await import('@/lib/auth/client');

        setStatus('Fetching session...');

        const { data, error: sessionError } = await supabaseClient.auth.getSession();

        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          setStatus('Error occurred');
          return;
        }

        if (!data.session) {
          setStatus('No active session');
          setSessionInfo({ message: 'Not logged in' });
          return;
        }

        setStatus('Session found!');
        setSessionInfo({
          email: data.session.user.email,
          userId: data.session.user.id,
          expiresAt: new Date(data.session.expires_at! * 1000).toLocaleString(),
          hasRefreshToken: !!data.session.refresh_token,
          minutesLeft: Math.floor((data.session.expires_at! - Date.now() / 1000) / 60)
        });

      } catch (err: any) {
        setError(`Caught error: ${err.message || String(err)}`);
        setStatus('Failed');
        console.error('GAP-2 Test Error:', err);
      }
    }

    checkSession();
  }, []);

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'monospace',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🧪 GAP-2 Session Test</h1>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>Status: {status}</h2>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #fcc',
            marginTop: '10px'
          }}>
            <strong>❌ Error:</strong>
            <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>{error}</pre>
          </div>
        )}

        {sessionInfo && (
          <div style={{ marginTop: '20px' }}>
            <h3>Session Info:</h3>
            <pre style={{
              backgroundColor: '#f9f9f9',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}

        {!error && !sessionInfo && status === 'Checking...' && (
          <p>Loading...</p>
        )}
      </div>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        border: '1px solid #90caf9'
      }}>
        <h3>What This Tests:</h3>
        <ul>
          <li>✅ Supabase client initialization</li>
          <li>✅ Session fetching</li>
          <li>✅ Refresh token presence</li>
          <li>✅ Token expiration info</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>This page uses try-catch to prevent crashes and shows detailed error info.</p>
        <p>Check browser console (F12) for additional logs.</p>
      </div>
    </div>
  );
}
