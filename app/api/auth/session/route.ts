import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId } from '@/lib/auth/athlete';
import { getSession, refreshSession } from '@/lib/auth/session';
import { UnauthorizedError } from '@/lib/auth/errors';
import { generateCorrelationId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  try {
    // 1. Verify authentication (uses Task 2 middleware)
    await getAthleteId(request);
    
    // 2. Get current session
    let session = await getSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { 
          status: 401,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'private, no-cache',
            'WWW-Authenticate': 'Bearer realm="momentom", error="no_session"'
          }
        }
      );
    }
    
    // 3. Check if token needs refresh (< 5 min remaining)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    const expiresIn = expiresAt - now;
    
    if (expiresIn < 300 && session.refresh_token) {
      // Auto-refresh token
      try {
        const newSession = await refreshSession(session.refresh_token);
        session = newSession;
      } catch (refreshError) {
        console.error('Session auto-refresh failed:', refreshError);
        // Continue with existing session (will expire soon, but don't fail request)
      }
    }
    
    // 4. Generate ETag based on session state
    const etag = `"${session.access_token.substring(0, 16)}-${session.expires_at}"`;
    
    // 5. Check If-None-Match header
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { 
        status: 304,
        headers: {
          'X-Request-Id': correlationId,
          'ETag': etag,
          'Cache-Control': 'private, no-cache',
          'Vary': 'Authorization, X-Client-Timezone'
        }
      });
    }
    
    // 6. Return session with caching headers
    return NextResponse.json(
      {
        user: {
          id: session.user.id,
          email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at
        },
        expires_at: session.expires_at
      },
      {
        status: 200,
        headers: {
          'X-Request-Id': correlationId,
          'ETag': etag,
          'Cache-Control': 'private, no-cache',
          'Vary': 'Authorization, X-Client-Timezone',
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message },
        { 
          status: 401,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'private, no-cache',
            'WWW-Authenticate': `Bearer realm="momentom", error="${error.code}"`
          }
        }
      );
    }
    
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'X-Request-Id': correlationId,
          'Cache-Control': 'private, no-cache'
        }
      }
    );
  }
}

