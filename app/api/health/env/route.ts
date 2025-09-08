import { NextResponse } from 'next/server'

export async function GET() {
  // Check environment variable presence without leaking actual values
  const envStatus = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY_serverOnly: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
    }
  }

  return NextResponse.json(envStatus, { status: 200 })
}
