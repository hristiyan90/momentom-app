'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/auth/client-simple';

export default function TestSimplePage() {
  const [result, setResult] = useState<string>('Testing...');
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    async function test() {
      try {
        setResult('Getting Supabase client...');
        const client = getSupabaseClient();

        setResult('Client created! Fetching session...');
        const { data, error } = await client.auth.getSession();

        if (error) {
          setResult(`Error: ${error.message}`);
          return;
        }

        if (!data.session) {
          setResult('✅ Success! No active session (not logged in)');
          setSessionData({ status: 'Not logged in' });
          return;
        }

        setResult('✅ Success! Session found!');
        setSessionData({
          email: data.session.user.email,
          hasRefreshToken: !!data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at! * 1000).toLocaleString(),
        });

      } catch (err: any) {
        setResult(`❌ Error: ${err.message}`);
        console.error('Test error:', err);
      }
    }

    test();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>🧪 Simple GAP-2 Test</h1>

      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: result.includes('❌') ? '#fee' : result.includes('✅') ? '#efe' : '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h2>{result}</h2>

        {sessionData && (
          <pre style={{
            marginTop: '20px',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>This test uses a simplified client initialization that should avoid the bundling issue.</p>
      </div>
    </div>
  );
}
