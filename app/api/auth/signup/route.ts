import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/auth/client';
import { validateEmail, validatePassword, validateAge } from '@/lib/auth/validation';
import { generateCorrelationId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  try {
    const body = await request.json();
    const { email, password, name, date_of_birth } = body;
    
    // 1. Validate input
    if (!email || !password || !name || !date_of_birth) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'email, password, name, and date_of_birth are required'
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
    
    if (!validateEmail(email)) {
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
    
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { 
          status: 400,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'no-store'
          }
        }
      );
    }
    
    if (!validateAge(date_of_birth)) {
      return NextResponse.json(
        { error: 'Must be at least 13 years old' },
        { 
          status: 400,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'no-store'
          }
        }
      );
    }
    
    // 2. Create Supabase auth user
    const { data: authData, error: authError } = await supabaseServer.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`
      }
    });
    
    if (authError) {
      // Check for invalid email from Supabase
      if (authError.message?.includes('is invalid') || authError.message?.includes('invalid email')) {
        return NextResponse.json(
          { error: 'Invalid email address format. Please use a valid email provider.' },
          { 
            status: 400,
            headers: {
              'X-Request-Id': correlationId,
              'Cache-Control': 'no-store'
            }
          }
        );
      }
      
      // Check for duplicate email
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { 
            status: 409,
            headers: {
              'X-Request-Id': correlationId,
              'Cache-Control': 'no-store'
            }
          }
        );
      }
      
      console.error('Auth signup error:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      console.error('No user data returned from Supabase');
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { 
          status: 500,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'no-store'
          }
        }
      );
    }
    
    // 3. Create athlete_profiles record
    const { error: profileError } = await supabaseServer
      .from('athlete_profiles')
      .insert({
        athlete_id: authData.user.id,
        email,
        name,
        date_of_birth,
        experience_level: 'beginner', // default
        available_hours_per_week: 8.0, // default
        training_days_per_week: 4 // default
      });
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // Rollback: Delete auth user if profile creation fails
      try {
        await supabaseServer.auth.admin.deleteUser(authData.user.id);
        console.log('Rolled back auth user after profile creation failure');
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
      
      throw profileError;
    }
    
    // 4. Return success with tokens (if session exists) or without tokens (if email confirmation required)
    if (authData.session) {
      // Session created - return tokens
      return NextResponse.json(
        {
          access_token: authData.session.access_token,
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: authData.session.refresh_token,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            email_confirmed_at: authData.user.email_confirmed_at
          }
        },
        { 
          status: 201,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    } else {
      // No session - email confirmation required
      return NextResponse.json(
        {
          user: {
            id: authData.user.id,
            email: authData.user.email,
            email_confirmed_at: authData.user.email_confirmed_at
          },
          message: 'Account created successfully. Please check your email to confirm your account before logging in.'
        },
        { 
          status: 201,
          headers: {
            'X-Request-Id': correlationId,
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle Supabase-specific auth errors that weren't caught above
    if (error.__isAuthError || error.name === 'AuthApiError') {
      // Email validation error from Supabase
      if (error.message?.includes('is invalid') || error.message?.includes('invalid email') || error.code === 'email_address_invalid') {
        return NextResponse.json(
          { error: 'Invalid email address format. Please use a valid email provider.' },
          { 
            status: 400,
            headers: {
              'X-Request-Id': correlationId,
              'Cache-Control': 'no-store'
            }
          }
        );
      }
      
      // Email already registered
      if (error.message?.includes('already registered') || error.code === 'user_already_exists') {
        return NextResponse.json(
          { error: 'Email already exists' },
          { 
            status: 409,
            headers: {
              'X-Request-Id': correlationId,
              'Cache-Control': 'no-store'
            }
          }
        );
      }
    }
    
    // Handle database constraint violations (e.g., duplicate email in athlete_profiles)
    if (error.code === '23505') {
      // PostgreSQL unique constraint violation
      if (error.message?.includes('email')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { 
            status: 409,
            headers: {
              'X-Request-Id': correlationId,
              'Cache-Control': 'no-store'
            }
          }
        );
      }
    }
    
    // Generic server error for unexpected errors
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

