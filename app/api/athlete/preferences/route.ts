import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAthleteId, addStandardHeaders } from '@/lib/auth/athlete';
import { supabaseClient } from '@/lib/auth/client';
import { generateCorrelationId } from '@/lib/utils';

/**
 * Zod schema for athlete preferences request body
 * All fields are optional to allow partial updates
 */
const athletePreferencesSchema = z.object({
  // Training time & focus
  preferred_training_time: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),
  focus_discipline: z.enum(['swim', 'bike', 'run', 'balanced']).optional(),

  // Metric preferences (defaults if not provided)
  preferred_run_metric: z.enum(['pace', 'power', 'hr']).optional().default('pace'),
  preferred_bike_metric: z.enum(['power', 'hr']).optional().default('power'),
  preferred_swim_metric: z.enum(['pace', 'hr']).optional().default('pace'),

  // Weekly availability (defaults to all true)
  sunday_available: z.boolean().optional().default(true),
  monday_available: z.boolean().optional().default(true),
  tuesday_available: z.boolean().optional().default(true),
  wednesday_available: z.boolean().optional().default(true),
  thursday_available: z.boolean().optional().default(true),
  friday_available: z.boolean().optional().default(true),
  saturday_available: z.boolean().optional().default(true),

  // Equipment access
  has_bike: z.boolean().optional().default(true),
  has_pool_access: z.boolean().optional().default(true),
  has_power_meter: z.boolean().optional().default(false),
  has_hr_monitor: z.boolean().optional().default(false),
});

type AthletePreferencesRequest = z.infer<typeof athletePreferencesSchema>;

/**
 * GET /api/athlete/preferences
 * Retrieve athlete preferences for authenticated user
 *
 * @returns 200 with preferences data if found
 * @returns 404 if preferences don't exist
 * @returns 401 on authentication failure
 * @returns 500 on database error
 */
export async function GET(req: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    // Authenticate and extract athlete_id from JWT
    const athleteId = await getAthleteId(req);

    // Query athlete preferences with RLS enforcement
    const { data, error } = await supabaseClient
      .from('athlete_preferences')
      .select('*')
      .eq('athlete_id', athleteId)
      .single();

    if (error) {
      // Handle not found case
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: {
              code: 'PREFERENCES_NOT_FOUND',
              message: 'Preferences not found',
              request_id: correlationId,
            },
          },
          { status: 404 }
        );
      }

      console.error('[Preferences GET] Database error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to retrieve preferences',
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

    console.error('[Preferences GET] Unexpected error:', error);
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
 * POST /api/athlete/preferences
 * Create or update athlete preferences (UPSERT)
 *
 * @returns 200 with preferences data on success
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
    const validatedData = athletePreferencesSchema.parse(body);

    // Validate that at least one training day is available
    const availableDays = [
      validatedData.sunday_available,
      validatedData.monday_available,
      validatedData.tuesday_available,
      validatedData.wednesday_available,
      validatedData.thursday_available,
      validatedData.friday_available,
      validatedData.saturday_available,
    ];

    if (!availableDays.some(day => day === true)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one training day must be available',
            request_id: correlationId
          }
        },
        { status: 400 }
      );
    }

    // Prepare data for upsert
    const preferencesData = {
      athlete_id: athleteId,
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // UPSERT athlete preferences using Supabase
    // RLS ensures athlete can only update their own preferences
    const { data, error } = await supabaseClient
      .from('athlete_preferences')
      .upsert(preferencesData, {
        onConflict: 'athlete_id',
        returning: 'representation'
      })
      .select()
      .single();

    if (error) {
      console.error('[Preferences API] Database error:', error);

      // Handle foreign key violations (athlete_profile must exist)
      if (error.code === '23503') {
        return NextResponse.json(
          {
            error: {
              code: 'PROFILE_NOT_FOUND',
              message: 'Athlete profile must be created before setting preferences',
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
            message: 'Failed to save athlete preferences',
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
    console.error('[Preferences API] Error:', error);

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
