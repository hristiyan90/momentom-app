import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAthleteId, addStandardHeaders } from '@/lib/auth/athlete';
import { supabaseClient } from '@/lib/auth/client';
import { generateCorrelationId } from '@/lib/utils';

/**
 * Zod schema for a single race entry
 */
const raceSchema = z.object({
  race_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  race_type: z.enum(['sprint', 'olympic', '70.3', '140.6', 'marathon', 'ultra', '5k', '10k', 'half_marathon']),
  priority: z.enum(['A', 'B', 'C']),
  race_name: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['planned', 'completed', 'dns', 'dnf']).optional().default('planned'),
});

/**
 * Schema for batch race creation
 * Accepts an array of race objects
 */
const batchRacesSchema = z.object({
  races: z.array(raceSchema).min(1, 'At least one race is required').max(50, 'Maximum 50 races allowed per request'),
});

type RaceRequest = z.infer<typeof raceSchema>;
type BatchRacesRequest = z.infer<typeof batchRacesSchema>;

/**
 * POST /api/races
 * Batch create races for the authenticated athlete
 *
 * Uses a transaction-like approach: all races succeed or all fail
 *
 * @returns 201 with created races on success
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
    const validatedData = batchRacesSchema.parse(body);

    // Validate each race's date constraints
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const race of validatedData.races) {
      const raceDate = new Date(race.race_date);
      raceDate.setHours(0, 0, 0, 0);

      // If status is 'planned', race date must be in the future
      if (race.status === 'planned' && raceDate < today) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `Planned race "${race.race_name || race.race_type}" must have a future date`,
              request_id: correlationId
            }
          },
          { status: 400 }
        );
      }
    }

    // Prepare race data with athlete_id
    const racesData = validatedData.races.map(race => ({
      athlete_id: athleteId,
      ...race,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Insert all races using Supabase
    // RLS ensures athlete can only create races for themselves
    const { data, error } = await supabaseClient
      .from('race_calendar')
      .insert(racesData)
      .select();

    if (error) {
      console.error('[Races API] Database error:', error);

      // Handle foreign key violations (athlete_profile must exist)
      if (error.code === '23503') {
        return NextResponse.json(
          {
            error: {
              code: 'PROFILE_NOT_FOUND',
              message: 'Athlete profile must be created before adding races',
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
            message: 'Failed to create races',
            request_id: correlationId
          }
        },
        { status: 500 }
      );
    }

    // Success response with 201 Created
    const response = NextResponse.json(
      {
        data,
        meta: {
          count: data?.length || 0,
          message: `Successfully created ${data?.length || 0} race(s)`
        }
      },
      { status: 201 }
    );

    addStandardHeaders(response, correlationId);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;

  } catch (error) {
    console.error('[Races API] Error:', error);

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

/**
 * GET /api/races
 * Retrieve all races for the authenticated athlete
 *
 * @returns 200 with races array
 * @returns 401 on authentication failure
 * @returns 500 on database error
 */
export async function GET(req: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    // Authenticate and extract athlete_id from JWT
    const athleteId = await getAthleteId(req);

    // Fetch all races for the athlete
    // RLS ensures athlete can only see their own races
    const { data, error } = await supabaseClient
      .from('race_calendar')
      .select('*')
      .order('race_date', { ascending: true });

    if (error) {
      console.error('[Races API] Database error:', error);

      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to retrieve races',
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
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=60');

    return response;

  } catch (error) {
    console.error('[Races API] Error:', error);

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
