'use client';

export default function EnvCheckPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Check</h1>

      <div style={{ marginTop: '20px', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h2>Client-Side Environment Variables:</h2>
        <pre style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px' }}>
          NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ MISSING'}
        </pre>
        <pre style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', marginTop: '10px' }}>
          NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?
            `✅ ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` :
            '❌ MISSING'}
        </pre>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <strong>If both show ❌ MISSING:</strong>
          <ol>
            <li>Your dev server needs to be restarted</li>
            <li>Run: <code>rm -rf .next && npm run dev</code></li>
            <li>Then refresh this page</li>
          </ol>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
          <strong>If both show values:</strong>
          <p>Environment variables are loaded correctly! The Supabase client should work.</p>
        </div>
      </div>
    </div>
  );
}
