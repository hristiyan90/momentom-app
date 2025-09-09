import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId, addStandardHeaders, setCacheHint } from '@/lib/auth/athlete';
import { getSessions } from '@/lib/data/reads';
import { generateCorrelationId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const correlationId = generateCorrelationId();
  
  try {
    // Extract athlete ID from request
    const athleteId = await getAthleteId(req);
    
    // Parse query parameters for soft filtering and pagination
    const { searchParams } = req.nextUrl;
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const sport = searchParams.get('sport');
    const limit = Number(searchParams.get('limit') ?? '');
    const cursor = searchParams.get('cursor') ?? undefined;
    
    // Build filters object (soft validation - ignore invalids)
    const filters: { start?: string; end?: string; sport?: string; cursor?: string; limit?: number } = {};
    
    if (start) {
      // Soft validate start date
      try {
        const startDate = new Date(start);
        if (!isNaN(startDate.getTime())) {
          filters.start = start;
        }
      } catch {
        // Ignore invalid start date - no error thrown
      }
    }
    
    if (end) {
      // Soft validate end date
      try {
        const endDate = new Date(end);
        if (!isNaN(endDate.getTime())) {
          filters.end = end;
        }
      } catch {
        // Ignore invalid end date - no error thrown
      }
    }
    
    if (sport) {
      // Soft validate sport
      const validSports = ['run', 'bike', 'swim', 'strength', 'mobility'];
      if (validSports.includes(sport)) {
        filters.sport = sport;
      }
      // If invalid sport, ignore filter (don't add to filters)
    }
    
    // Add pagination parameters
    if (cursor) {
      filters.cursor = cursor;
    }
    if (Number.isFinite(limit)) {
      filters.limit = limit;
    }
    
    // Get sessions data from Supabase or fallback to fixture with filtering and pagination
    const sessionsData = await getSessions(athleteId, filters);
    
    // Create response with exact Cycle-1 shape
    const response = NextResponse.json(sessionsData, { status: 200 });
    
    // Add standard headers (H1-H7 compliance)
    addStandardHeaders(response, correlationId);
    setCacheHint(response, "private, max-age=60, stale-while-revalidate=60");
    
    return response;
  } catch (error) {
    // Handle authentication errors gracefully
    console.error('Sessions route error:', error);
    
    const errorResponse = NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Authentication required', request_id: correlationId } },
      { status: 401 }
    );
    
    addStandardHeaders(errorResponse, correlationId);
    errorResponse.headers.set('WWW-Authenticate', 'Bearer realm="momentom", error="invalid_token"');
    
    return errorResponse;
  }
}
