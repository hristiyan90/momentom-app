import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAthleteId, addStandardHeaders } from '@/lib/auth/athlete';
import { supabaseClient } from '@/lib/auth/client';
import { generateCorrelationId } from '@/lib/utils';

/**
 * Zod schema for athlete profile request body
 * Validates incoming data against database constraints
 */
const athleteProfileSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),

  // Optional fitness thresholds
  ftp_watts: z.number().int().min(50).max(500).nullable().optional(),
  threshold_pace_min_per_km: z.number().min(2.5).max(8.0).nullable().optional(),
  swim_css_pace_min_per_100m: z.number().min(1.0).max(4.0).nullable().optional(),
  max_heart_rate: z.number().int().min(100).max(220).nullable().optional(),
  resting_heart_rate: z.number().int().min(30).max(100).nullable().optional(),

  // Training capacity (required)
  available_hours_per_week: z.number().min(1.0).max(30.0),
  training_days_per_week: z.number().int().min(1).max(7),
});

type AthleteProfileRequest = z.infer<typeof athleteProfileSchema>;

/**
 * GET /api/athlete/profile
 * Retrieve athlete profile for authenticated user
 *
 * @returns 200 with profile data if found
 * @returns 404 if profile doesn't exist
 * @returns 401 on authentication failure
 * @returns 500 on database error
 */
export async function GET(req: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    // Authenticate and extract athlete_id from JWT
    const athleteId = await getAthleteId(req);

    // Query athlete profile with RLS enforcement
    const { data, error } = await supabaseClient
      .from('athlete_profiles')
      .select('*')
      .eq('athlete_id', athleteId)
      .single();

    if (error) {
      // Handle not found case
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: {
              code: 'PROFILE_NOT_FOUND',
              message: 'Profile not found',
              request_id: correlationId,
            },
          },
          { status: 404 }
        );
      }

      console.error('[Profile GET] Database error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to retrieve profile',
            request_id: correlationId,
          },
        },
        { status: 500 }
      );
    }

    // Success response with caching headers
    const response = NextResponse.json({ data }, { status: 200 });
    addStandardHeaders(response, correlationId);
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=60');
    return response;

  } catch (error: any) {
    // Handle authentication errors (401)
    if (error.message?.includes('expired') || error.message?.includes('token')) {
      const response = NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: error.message || 'Authentication failed',
            request_id: correlationId,
          },
        },
        { status: 401 }
      );
      response.headers.set('WWW-Authenticate', 'Bearer');
      addStandardHeaders(response, correlationId);
      return response;
    }

    console.error('[Profile GET] Unexpected error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          request_id: correlationId,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/athlete/profile
 * Create or update athlete profile (UPSERT)
 *
 * @returns 200 with profile data on success
 * @returns 400 on validation error
 * @returns 401 on authentication failure
 * @returns 500 on database error
 */
export async function POST(req: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    // Authenticate and extract athlete_id from JWT
    const athleteId = await getAthleteId(req);

    // Parse and validate request body
    const body = await req.json();
    const validatedData = athleteProfileSchema.parse(body);

    // Validate date of birth is in the past
    const dob = new Date(validatedData.date_of_birth);
    if (dob >= new Date()) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Date of birth must be in the past',
            request_id: correlationId
          }
        },
        { status: 400 }
      );
    }

    // Validate minimum age (13 years for COPPA compliance)
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Athlete must be at least 13 years old',
            request_id: correlationId
          }
        },
        { status: 400 }
      );
    }

    // Validate available hours is realistic (not more than training days * 24)
    if (validatedData.available_hours_per_week > validatedData.training_days_per_week * 24) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Available hours per week cannot exceed training days × 24',
            request_id: correlationId
          }
        },
        { status: 400 }
      );
    }

    // Prepare data for upsert (use athlete_id from JWT, not from request body)
    const profileData = {
      athlete_id: athleteId,
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // UPSERT athlete profile using Supabase
    // RLS ensures athlete can only update their own profile
    const { data, error } = await supabaseClient
      .from('athlete_profiles')
      .upsert(profileData, {
        onConflict: 'athlete_id',
        returning: 'representation'
      })
      .select()
      .single();

    if (error) {
      console.error('[Profile API] Database error:', error);

      // Handle unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json(
          {
            error: {
              code: 'DUPLICATE_EMAIL',
              message: 'Email address is already registered',
              request_id: correlationId
            }
          },
          { status: 400 }
        );
      }

      // Generic database error
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to save athlete profile',
            request_id: correlationId
          }
        },
        { status: 500 }
      );
    }

    // Success response
    const response = NextResponse.json(
      { data },
      { status: 200 }
    );

    addStandardHeaders(response, correlationId);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;

  } catch (error) {
    console.error('[Profile API] Error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
            request_id: correlationId
          }
        },
        { status: 400 }
      );
    }

    // Handle authentication errors
    const errorMessage = error instanceof Error ? error.message : 'Authentication required';
    if (errorMessage.includes('JWT') || errorMessage.includes('token') || errorMessage.includes('athlete')) {
      const errorResponse = NextResponse.json(
        {
          error: {
            code: 'AUTH_REQUIRED',
            message: errorMessage,
            request_id: correlationId
          }
        },
        { status: 401 }
      );

      addStandardHeaders(errorResponse, correlationId);
      errorResponse.headers.set('WWW-Authenticate', 'Bearer realm="momentom", error="invalid_token"');

      return errorResponse;
    }

    // Generic error
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          request_id: correlationId
        }
      },
      { status: 500 }
    );

    addStandardHeaders(errorResponse, correlationId);

    return errorResponse;
  }
}
