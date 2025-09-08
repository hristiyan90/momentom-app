'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SupabaseCheckPage() {
  const [clientStatus, setClientStatus] = useState<'loading' | 'ok' | string>('loading')

  useEffect(() => {
    try {
      // Attempt to instantiate the browser client
      const supabase = createSupabaseBrowser()
      
      // If we get here without throwing, the client was created successfully
      console.log('Supabase browser client created successfully')
      setClientStatus('ok')
    } catch (error) {
      // Capture the error message for display
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Supabase browser client failed:', errorMessage)
      setClientStatus(errorMessage)
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg-app p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-1 mb-6">Supabase Connection Check</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-bg-surface rounded-lg border border-border-weak">
            <h2 className="text-lg font-semibold text-text-1 mb-2">Browser Client Status</h2>
            <div className="flex items-center gap-2">
              {clientStatus === 'loading' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent"></div>
                  <span className="text-text-2">Checking...</span>
                </>
              )}
              {clientStatus === 'ok' && (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Browser client: OK</span>
                </>
              )}
              {clientStatus !== 'loading' && clientStatus !== 'ok' && (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-red-600">{clientStatus}</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 bg-bg-surface rounded-lg border border-border-weak">
            <h2 className="text-lg font-semibold text-text-1 mb-2">Environment Variables</h2>
            <p className="text-text-2 text-sm mb-3">
              Check which environment variables are present (no values shown for security)
            </p>
            <Link 
              href="/api/health/env"
              className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Environment Status →
            </Link>
          </div>

          <div className="p-4 bg-bg-surface rounded-lg border border-border-weak">
            <h2 className="text-lg font-semibold text-text-1 mb-2">Setup Instructions</h2>
            <div className="text-text-2 text-sm space-y-2">
              <p>If you're seeing errors, ensure these environment variables are set in <code className="bg-bg-raised px-1 rounded">.env.local</code>:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code className="bg-bg-raised px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li><code className="bg-bg-raised px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                <li><code className="bg-bg-raised px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> (server-only)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
