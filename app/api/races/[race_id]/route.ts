import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId, addStandardHeaders } from '@/lib/auth/athlete';
import { supabaseClient } from '@/lib/auth/client';
import { generateCorrelationId } from '@/lib/utils';

/**
 * Validate UUID format
 * @param uuid - String to validate
 * @returns True if valid UUID, false otherwise
 */
function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * DELETE /api/races/[race_id]
 * Delete a specific race by ID
 *
 * @param req - NextRequest object
 * @param params - Route parameters containing race_id
 * @returns 200 on successful deletion
 * @returns 400 on invalid race_id format
 * @returns 401 on authentication failure
 * @returns 404 if race not found or doesn't belong to athlete
 * @returns 500 on database error
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { race_id: string } }
) {
  const correlationId = generateCorrelationId();

  try {
    // Authenticate and extract athlete_id from JWT
    const athleteId = await getAthleteId(req);

    // Validate race_id format
    const raceId = params.race_id;
    if (!isValidUuid(raceId)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_RACE_ID',
            message: 'Race ID must be a valid UUID',
            request_id: correlationId
          }
        },
        { status: 400 }
      );
    }

    // Delete the race using Supabase
    // RLS ensures athlete can only delete their own races
    const { data, error } = await supabaseClient
      .from('race_calendar')
      .delete()
      .eq('race_id', raceId)
      .select();

    if (error) {
      console.error('[Delete Race API] Database error:', error);

      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to delete race',
            request_id: correlationId
          }
        },
        { status: 500 }
      );
    }

    // Check if race was found and deleted
    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'RACE_NOT_FOUND',
            message: 'Race not found or you do not have permission to delete it',
            request_id: correlationId
          }
        },
        { status: 404 }
      );
    }

    // Success response
    const response = NextResponse.json(
      {
        data: data[0],
        message: 'Race deleted successfully'
      },
      { status: 200 }
    );

    addStandardHeaders(response, correlationId);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;

  } catch (error) {
    console.error('[Delete Race API] Error:', error);

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
 * GET /api/races/[race_id]
 * Retrieve a specific race by ID
 *
 * @param req - NextRequest object
 * @param params - Route parameters containing race_id
 * @returns 200 with race data
 * @returns 400 on invalid race_id format
 * @returns 401 on authentication failure
 * @returns 404 if race not found
 * @returns 500 on database error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { race_id: string } }
) {
  const correlationId = generateCorrelationId();

  try {
    // Authenticate and extract athlete_id from JWT
    const athleteId = await getAthleteId(req);

    // Validate race_id format
    const raceId = params.race_id;
    if (!isValidUuid(raceId)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_RACE_ID',
            message: 'Race ID must be a valid UUID',
            request_id: correlationId
          }
        },
        { status: 400 }
      );
    }

    // Fetch the race using Supabase
    // RLS ensures athlete can only see their own races
    const { data, error } = await supabaseClient
      .from('race_calendar')
      .select('*')
      .eq('race_id', raceId)
      .single();

    if (error) {
      console.error('[Get Race API] Database error:', error);

      // Handle not found error
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: {
              code: 'RACE_NOT_FOUND',
              message: 'Race not found',
              request_id: correlationId
            }
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to retrieve race',
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
    console.error('[Get Race API] Error:', error);

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
 * PATCH /api/races/[race_id]
 * Update a specific race by ID
 *
 * @param req - NextRequest object
 * @param params - Route parameters containing race_id
 * @returns 200 with updated race data
 * @returns 400 on validation error
 * @returns 401 on authentication failure
 * @returns 404 if race not found
 * @returns 500 on database error
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { race_id: string } }
) {
  const correlationId = generateCorrelationId();

  try {
    // Authenticate and extract athlete_id from JWT
    const athleteId = await getAthleteId(req);

    // Validate race_id format
    const raceId = params.race_id;
    if (!isValidUuid(raceId)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_RACE_ID',
            message: 'Race ID must be a valid UUID',
            request_id: correlationId
          }
        },
        { status: 400 }
      );
    }

    // Parse request body (allow partial updates)
    const body = await req.json();

    // Prepare update data
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Update the race using Supabase
    // RLS ensures athlete can only update their own races
    const { data, error } = await supabaseClient
      .from('race_calendar')
      .update(updateData)
      .eq('race_id', raceId)
      .select()
      .single();

    if (error) {
      console.error('[Update Race API] Database error:', error);

      // Handle not found error
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: {
              code: 'RACE_NOT_FOUND',
              message: 'Race not found or you do not have permission to update it',
              request_id: correlationId
            }
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update race',
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
    console.error('[Update Race API] Error:', error);

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
