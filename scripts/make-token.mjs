import { SignJWT } from 'jose'
import { TextEncoder } from 'node:util'

const secret = process.env.SUPABASE_JWT_SECRET
if (!secret) throw new Error('SUPABASE_JWT_SECRET not set')

const now = Math.floor(Date.now()/1000)

// choose ONE of these IDs to be your athlete id
const athleteId = '00000000-0000-0000-0000-000000000001' // <- fixture uuid

const payload = {
  sub: athleteId,                           // fallback if user_metadata missing
  user_metadata: { athlete_id: athleteId }, // preferred path
  iss: 'supabase',
  iat: now,
  exp: now + 60*60                           // 1h
}

const jwt = await new SignJWT(payload)
  .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
  .sign(new TextEncoder().encode(secret))

console.log(jwt)
