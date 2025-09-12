import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId, addStandardHeaders, setCacheHint, getAuthFlags, addAuthDebug } from '@/lib/auth/athlete';
import { getReadiness, isMissingRelation } from '@/lib/data/reads';
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
    
    // Check for partial mode via query param or header
    const { searchParams } = req.nextUrl;
    const demoPartialQuery = searchParams.get('demoPartial') === '1';
    const demoPartialHeader = req.headers.get('X-Demo-Partial') === 'true';
    const isPartialMode = demoPartialQuery || demoPartialHeader;
    
    // Get readiness data from Supabase or fallback to fixture
    // Use current date as default, could be made configurable
    const date = searchParams.get('date') || '2025-09-06';
    let readinessData = await getReadiness(athleteId, { date });
    
    // Apply partial mode logic (simulates missing drivers)
    if (isPartialMode) {
      // Simulate partial data by removing some drivers and renormalizing weights
      const fullDrivers = [...readinessData.drivers];
      const missingDrivers = ['sleep', 'rhr'];
      
      // Filter out missing drivers
      let drivers = fullDrivers.filter(d => !missingDrivers.includes(d.key));
      
      // Renormalize weights to sum to 1.00
      const weightSum = drivers.reduce((sum, driver) => sum + driver.weight, 0);
      if (weightSum > 0) {
        drivers = drivers.map(driver => ({
          ...driver,
          weight: driver.weight / weightSum
        }));
      }
      
      // Update readiness data for partial mode
      readinessData = {
        ...readinessData,
        drivers,
        data_quality: { ...readinessData.data_quality, missing: missingDrivers }
      };
      
      // Ensure flags include monotony_high for UI badges
      if (!readinessData.flags.includes('monotony_high')) {
        readinessData.flags.push('monotony_high');
      }
      
      // Return 206 with Warning header for partial data
      const { etag, body } = etagFor(readinessData);
      const inm = req.headers.get('if-none-match');
      if (inm && inm === etag) {
        const res = new NextResponse(null, { status: 304 });
        addStandardHeaders(res, correlationId);
        setCacheHint(res, "private, max-age=30, stale-while-revalidate=30");
        res.headers.set('ETag', etag);
        addAuthDebug(res, { mode: flags.mode, allow: flags.allow, saw_header: !!rawHeader });
        return res;
      }

      const res = new NextResponse(body, { status: 206, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
      res.headers.set('Warning', '199 - partial data');
      addStandardHeaders(res, correlationId);
      setCacheHint(res, "private, max-age=30, stale-while-revalidate=30");
      res.headers.set('ETag', etag);
      addAuthDebug(res, { mode: flags.mode, allow: flags.allow, saw_header: !!rawHeader });
      return res;
    }
    
    // Normal mode: return 200 with complete data
    const { etag, body } = etagFor(readinessData);
    const inm = req.headers.get('if-none-match');
    if (inm && inm === etag) {
      const res = new NextResponse(null, { status: 304 });
      addStandardHeaders(res, correlationId);
      setCacheHint(res, "private, max-age=30, stale-while-revalidate=30");
      res.headers.set('ETag', etag);
      addAuthDebug(res, { mode: flags.mode, allow: flags.allow, saw_header: !!rawHeader });
      return res;
    }

    const res = new NextResponse(body, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    addStandardHeaders(res, correlationId);
    setCacheHint(res, "private, max-age=30, stale-while-revalidate=30");
    res.headers.set('ETag', etag);
    addAuthDebug(res, { mode: flags.mode, allow: flags.allow, saw_header: !!rawHeader });
    return res;
  } catch (error) {
    // Classify error type for appropriate logging
    if (isMissingRelation(error)) {
      console.info('Supabase readiness missing; using fixtures', { code: (error as any).code });
    } else {
      console.error('Readiness route error:', error);
    }
    
    // Return successful JSON with fixture data to maintain contract
    const fixtureReadiness = {
      date: '2025-09-06',
      score: 62,
      band: 'amber' as const,
      drivers: [
        { key: 'hrv' as const, z: -0.8, weight: 0.3333333333333333, contribution: -8.0 },
        { key: 'sleep' as const, z: -0.3, weight: 0.26666666666666666, contribution: -3.0 },
        { key: 'rhr' as const, z: 0.2, weight: 0.2, contribution: -2.0 },
        { key: 'prior_strain' as const, z: 0.7, weight: 0.2, contribution: -5.0 }
      ],
      flags: ['monotony_high'],
      data_quality: { missing: [] as string[], clipped: false }
    };
    
    const { etag, body } = etagFor(fixtureReadiness);
    const inm = req.headers.get('if-none-match');
    if (inm && inm === etag) {
      const res = new NextResponse(null, { status: 304 });
      addStandardHeaders(res, correlationId);
      setCacheHint(res, "private, max-age=30, stale-while-revalidate=30");
      res.headers.set('ETag', etag);
      addAuthDebug(res, { mode: flags.mode, allow: flags.allow, saw_header: !!rawHeader });
      return res;
    }

    const res = new NextResponse(body, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    addStandardHeaders(res, correlationId);
    setCacheHint(res, "private, max-age=30, stale-while-revalidate=30");
    res.headers.set('ETag', etag);
    addAuthDebug(res, { mode: flags.mode, allow: flags.allow, saw_header: !!rawHeader });
    return res;
  }
}
