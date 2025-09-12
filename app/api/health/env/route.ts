import { NextResponse } from 'next/server'
import { getAuthFlags } from '@/lib/auth/athlete'

export async function GET() {
  const flags = getAuthFlags()
  
  const envStatus = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY_serverOnly: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
    },
    auth_mode: flags.mode,
    allow_header_override: flags.allow
  }

  return NextResponse.json(envStatus, { status: 200 })
}
