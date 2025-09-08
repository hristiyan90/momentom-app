import { NextRequest, NextResponse } from 'next/server';
import { withSecurityHeaders } from '@/lib/http/headers';

export async function GET(req: NextRequest) { 
  // Check for partial mode via query param or header
  const { searchParams } = req.nextUrl;
  const demoPartialQuery = searchParams.get('demoPartial') === '1';
  const demoPartialHeader = req.headers.get('X-Demo-Partial') === 'true';
  const isPartialMode = demoPartialQuery || demoPartialHeader;

  // Base readiness data
  const readinessData = {
    date: '2025-09-06', 
    score: 62, 
    band: 'amber' as const, 
    drivers: [{ key: 'hrv' as const, z: -0.8, weight: 0.25, contribution: -8 }], 
    flags: ['monotony_high'], 
    data_quality: { missing: [] as string[], clipped: false } 
  };

  // Modify data for partial mode
  if (isPartialMode) {
    // Add missing signals to indicate partial data
    readinessData.data_quality.missing = ['sleep', 'rhr'];
    // Ensure flags include monotony_high for UI badges
    if (!readinessData.flags.includes('monotony_high')) {
      readinessData.flags.push('monotony_high');
    }

    // Return 206 with Warning header
    const response = NextResponse.json(readinessData, { status: 206 });
    response.headers.set('Warning', '199 - partial data');
    return withSecurityHeaders(response, { 
      cacheHint: "private, max-age=30, stale-while-revalidate=30" 
    });
  }

  // Normal mode: return 200 with complete data
  return withSecurityHeaders(NextResponse.json(readinessData, { status: 200 }), { 
    cacheHint: "private, max-age=30, stale-while-revalidate=30" 
  });
}
