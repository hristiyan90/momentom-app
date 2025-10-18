import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/auth/client';
import { getAthleteId } from '@/lib/auth/athlete';
import { UnauthorizedError } from '@/lib/auth/errors';
import { generateCorrelationId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  try {
    // 1. Verify authentication (uses Task 2 middleware)
    await getAthleteId(request);
    
    // 2. Sign out via Supabase Auth
    const { error } = await supabaseServer.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
    
    // 3. Clear cookies
    const response = NextResponse.json(
      { message: 'Successfully logged out' },
      { 
        status: 200,
        headers: {
          'X-Request-Id': correlationId,
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
    
    // Clear HTTP-only cookies
    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });
    
    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });
    
    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message },
        { 
          status: 401,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'no-store',
            'WWW-Authenticate': `Bearer realm="momentom", error="${error.code}"`
          }
        }
      );
    }
    
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'X-Request-Id': correlationId,
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}

