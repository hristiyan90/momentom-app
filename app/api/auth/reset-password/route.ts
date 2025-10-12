import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/auth/client';
import { validateEmail } from '@/lib/auth/validation';
import { generateCorrelationId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  try {
    const body = await request.json();
    const { email } = body;
    
    // 1. Validate email format
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { 
          status: 400,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'no-store'
          }
        }
      );
    }
    
    // 2. Send password reset email via Supabase Auth
    // Note: This always succeeds regardless of whether the email exists
    // This is a security best practice to prevent email enumeration
    const { error } = await supabaseServer.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password/callback`
    });
    
    if (error) {
      console.error('Password reset error:', error);
      // Don't expose error details to prevent email enumeration
    }
    
    // 3. Return generic success message (security - no email enumeration)
    return NextResponse.json(
      { message: 'If the email exists, a password reset link has been sent' },
      { 
        status: 200,
        headers: {
          'X-Request-Id': correlationId,
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  } catch (error) {
    console.error('Password reset error:', error);
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

