import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId, addStandardHeaders, setCacheHint } from '@/lib/auth/athlete';
import { getFuelSessionById } from '@/lib/data/reads';
import { generateCorrelationId } from '@/lib/utils';

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
    let fuelData = await getFuelSessionById(athleteId, params.id);
    
    // Add debug meta block if debug mode is enabled
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
    const response = NextResponse.json(fuelData, { status: 200 });
    
    // Add standard headers (H1-H7 compliance)
    addStandardHeaders(response, correlationId);
    setCacheHint(response, "private, max-age=60, stale-while-revalidate=60");
    
    return response;
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
