import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId, addStandardHeaders, setCacheHint, getAuthFlags, addAuthDebug } from '@/lib/auth/athlete';
import { getPlan } from '@/lib/data/reads';
import { generateCorrelationId } from '@/lib/utils';
import { etagFor } from '@/lib/http/etag';

export async function GET(req: NextRequest) { 
  const correlationId = generateCorrelationId();
  
  try {
    // Capture auth flags and raw header for debug
    const flags = getAuthFlags();
    const rawHeader = req.headers.get('x-athlete-id') ?? null;
    
    // Extract athlete ID from request
    const athleteId = await getAthleteId(req);
    
    // Get plan data from Supabase or fallback to fixture
    const payload = await getPlan(athleteId);
    
    const { etag, body } = etagFor(payload);
    const inm = req.headers.get('if-none-match');
    if (inm && inm === etag) {
      const res = new NextResponse(null, { status: 304 });
      addStandardHeaders(res, correlationId);
      setCacheHint(res, "private, max-age=60, stale-while-revalidate=60");
      res.headers.set('ETag', etag);
      addAuthDebug(res, { mode: flags.mode, allow: flags.allow, saw_header: !!rawHeader });
      return res;
    }

    const res = new NextResponse(body, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    addStandardHeaders(res, correlationId);
    setCacheHint(res, "private, max-age=60, stale-while-revalidate=60");
    res.headers.set('ETag', etag);
    addAuthDebug(res, { mode: flags.mode, allow: flags.allow, saw_header: !!rawHeader });
    return res;
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
