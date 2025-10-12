import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/auth/client';
import { generateCorrelationId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // 1. Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'email and password are required'
        },
        { 
          status: 400,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'no-store'
          }
        }
      );
    }
    
    // 2. Authenticate with Supabase
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { 
          status: 401,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'no-store',
            'WWW-Authenticate': 'Bearer realm="momentom", error="invalid_credentials"'
          }
        }
      );
    }
    
    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { 
          status: 401,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'no-store',
            'WWW-Authenticate': 'Bearer realm="momentom", error="invalid_credentials"'
          }
        }
      );
    }
    
    // 3. Return success with tokens
    const response = NextResponse.json(
      {
        access_token: data.session.access_token,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at
        }
      },
      { 
        status: 200,
        headers: {
          'X-Request-Id': correlationId,
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
    
    // 4. Set HTTP-only cookies for tokens
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });
    
    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
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

