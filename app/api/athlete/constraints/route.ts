import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAthleteId, addStandardHeaders } from '@/lib/auth/athlete';
import { supabaseClient } from '@/lib/auth/client';
import { generateCorrelationId } from '@/lib/utils';

/**
 * Zod schema for a single constraint entry
 */
const constraintSchema = z.object({
  constraint_type: z.enum(['injury', 'equipment', 'availability']),
  affected_disciplines: z.array(z.enum(['swim', 'bike', 'run', 'strength'])).min(1, 'At least one discipline required'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().nullable(),
  severity: z.enum(['mild', 'moderate', 'severe']),
  description: z.string().optional().nullable(),
});

/**
 * Schema for batch constraint creation
 * Accepts an array of constraint objects
 */
const batchConstraintsSchema = z.object({
  constraints: z.array(constraintSchema).min(1, 'At least one constraint is required').max(50, 'Maximum 50 constraints allowed per request'),
});

type ConstraintRequest = z.infer<typeof constraintSchema>;
type BatchConstraintsRequest = z.infer<typeof batchConstraintsSchema>;

/**
 * POST /api/athlete/constraints
 * Batch create athlete constraints
 *
 * Uses a transaction-like approach: all constraints succeed or all fail
 *
 * @returns 201 with created constraints on success
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
    const validatedData = batchConstraintsSchema.parse(body);

    // Validate date constraints
    for (const constraint of validatedData.constraints) {
      const startDate = new Date(constraint.start_date);

      // If end_date is provided, ensure it's after start_date
      if (constraint.end_date) {
        const endDate = new Date(constraint.end_date);

        if (endDate < startDate) {
          return NextResponse.json(
            {
              error: {
                code: 'VALIDATION_ERROR',
                message: 'End date must be after or equal to start date',
                request_id: correlationId
              }
            },
            { status: 400 }
          );
        }
      }

      // Validate affected_disciplines is not empty (already checked by zod, but double-check)
      if (constraint.affected_disciplines.length === 0) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'At least one affected discipline is required',
              request_id: correlationId
            }
          },
          { status: 400 }
        );
      }
    }

    // Prepare constraint data with athlete_id
    const constraintsData = validatedData.constraints.map(constraint => ({
      athlete_id: athleteId,
      ...constraint,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Insert all constraints using Supabase
    // RLS ensures athlete can only create constraints for themselves
    const { data, error } = await supabaseClient
      .from('athlete_constraints')
      .insert(constraintsData)
      .select();

    if (error) {
      console.error('[Constraints API] Database error:', error);

      // Handle foreign key violations (athlete_profile must exist)
      if (error.code === '23503') {
        return NextResponse.json(
          {
            error: {
              code: 'PROFILE_NOT_FOUND',
              message: 'Athlete profile must be created before adding constraints',
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
            message: 'Failed to create constraints',
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
          message: `Successfully created ${data?.length || 0} constraint(s)`
        }
      },
      { status: 201 }
    );

    addStandardHeaders(response, correlationId);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;

  } catch (error) {
    console.error('[Constraints API] Error:', error);

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
 * GET /api/athlete/constraints
 * Retrieve all constraints for the authenticated athlete
 *
 * Supports optional query parameters:
 * - active: 'true' to filter only active constraints (default: all)
 * - date: YYYY-MM-DD to check constraints active on specific date
 *
 * @returns 200 with constraints array
 * @returns 401 on authentication failure
 * @returns 500 on database error
 */
export async function GET(req: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    // Authenticate and extract athlete_id from JWT
    const athleteId = await getAthleteId(req);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';
    const dateParam = searchParams.get('date');

    // Build query
    let query = supabaseClient
      .from('athlete_constraints')
      .select('*')
      .order('start_date', { ascending: true });

    // Filter for active constraints if requested
    if (activeOnly || dateParam) {
      const checkDate = dateParam || new Date().toISOString().split('T')[0];

      query = query
        .lte('start_date', checkDate)
        .or(`end_date.is.null,end_date.gte.${checkDate}`);
    }

    // Execute query
    // RLS ensures athlete can only see their own constraints
    const { data, error } = await query;

    if (error) {
      console.error('[Constraints API] Database error:', error);

      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to retrieve constraints',
            request_id: correlationId
          }
        },
        { status: 500 }
      );
    }

    // Success response
    const response = NextResponse.json(
      {
        data,
        meta: {
          count: data?.length || 0,
          filters: {
            active: activeOnly,
            date: dateParam || null
          }
        }
      },
      { status: 200 }
    );

    addStandardHeaders(response, correlationId);
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=60');

    return response;

  } catch (error) {
    console.error('[Constraints API] Error:', error);

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
