import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId, addStandardHeaders, setCacheHint, addAuthChallenge } from '@/lib/auth/athlete';
import { getFuelSessionById } from '@/lib/data/reads';
import { generateCorrelationId } from '@/lib/utils';
import { etagFor } from '@/lib/http/etag';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = generateCorrelationId();
  
  try {
    // Extract athlete ID from request
    const athleteId = await getAthleteId(req);
    
    // Check for debug mode via query param or header
    const { searchParams } = req.nextUrl;
    const debugQuery = searchParams.get('debug') === '1';
    const debugHeader = req.headers.get('X-Debug') === 'true';
    const isDebugMode = debugQuery || debugHeader;
    
    // Get fuel session data from Supabase or fallback to fixture
    const row = await getFuelSessionById(athleteId, params.id);
    
    // Check if fuel session was found
    if (!row) {
      // Preserve Cycle-1 error shape and headers
      const errorResponse = NextResponse.json(
        { ok: false, error: 'Fuel session not found', request_id: correlationId },
        { status: 404 }
      );
      addStandardHeaders(errorResponse, correlationId);
      addAuthChallenge(errorResponse);
      return errorResponse;
    }
    
    // Add debug meta block if debug mode is enabled
    let fuelData = row;
    if (isDebugMode) {
      // Internal sodium concentration used for derivation
      const sodiumConcentrationRange = [300, 800]; // mg/L
      
      fuelData = {
        ...fuelData,
        meta: {
          sodium_mg_per_l: sodiumConcentrationRange
        }
      };
    }
    
    // Create response with exact Cycle-1 shape
    const { etag, body } = etagFor(fuelData);
    const inm = req.headers.get('if-none-match');
    if (inm && inm === etag) {
      const res = new NextResponse(null, { status: 304 });
      addStandardHeaders(res, correlationId);
      setCacheHint(res, "private, max-age=60, stale-while-revalidate=60");
      res.headers.set('ETag', etag);
      return res;
    }

    const res = new NextResponse(body, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    addStandardHeaders(res, correlationId);
    setCacheHint(res, "private, max-age=60, stale-while-revalidate=60");
    res.headers.set('ETag', etag);
    return res;
  } catch (error) {
    // Handle authentication errors gracefully
    console.error('Fuel session route error:', error);
    
    const errorResponse = NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Authentication required', request_id: correlationId } },
      { status: 401 }
    );
    
    addStandardHeaders(errorResponse, correlationId);
    errorResponse.headers.set('WWW-Authenticate', 'Bearer realm="momentom", error="invalid_token"');
    
    return errorResponse;
  }
}
