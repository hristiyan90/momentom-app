import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId, addStandardHeaders, setCacheHint } from '@/lib/auth/athlete';
import { getPlan } from '@/lib/data/reads';
import { generateCorrelationId } from '@/lib/utils';

export async function GET(req: NextRequest) { 
  const correlationId = generateCorrelationId();
  
  try {
    // Extract athlete ID from request
    const athleteId = await getAthleteId(req);
    
    // Get plan data from Supabase or fallback to fixture
    const planData = await getPlan(athleteId);
    
    // Create response with exact Cycle-1 shape
    const response = NextResponse.json(planData, { status: 200 });
    
    // Add standard headers (H1-H7 compliance)
    addStandardHeaders(response, correlationId);
    setCacheHint(response, "private, max-age=60, stale-while-revalidate=60");
    
    return response;
  } catch (error) {
    // Handle authentication errors gracefully
    console.error('Plan route error:', error);
    
    const errorResponse = NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Authentication required', request_id: correlationId } },
      { status: 401 }
    );
    
    addStandardHeaders(errorResponse, correlationId);
    errorResponse.headers.set('WWW-Authenticate', 'Bearer realm="momentom", error="invalid_token"');
    
    return errorResponse;
  }
}
