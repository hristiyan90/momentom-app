import { NextRequest, NextResponse } from 'next/server';
import { withSecurityHeaders } from '@/lib/http/headers';

export async function GET(req: NextRequest) { 
  // Check for partial mode via query param or header
  const { searchParams } = req.nextUrl;
  const demoPartialQuery = searchParams.get('demoPartial') === '1';
  const demoPartialHeader = req.headers.get('X-Demo-Partial') === 'true';
  const isPartialMode = demoPartialQuery || demoPartialHeader;

  // Base readiness data - full driver set
  const allDrivers = [
    { key: 'hrv' as const, z: -0.8, weight: 0.25, contribution: -8 },
    { key: 'sleep' as const, z: -0.3, weight: 0.2, contribution: -3 },
    { key: 'rhr' as const, z: 0.2, weight: 0.15, contribution: -2 },
    { key: 'prior_strain' as const, z: 0.7, weight: 0.15, contribution: -5 }
  ];

  let drivers = [...allDrivers];
  let missingDrivers: string[] = [];

  // In partial mode, remove some drivers and track missing ones
  if (isPartialMode) {
    missingDrivers = ['sleep', 'rhr'];
    drivers = drivers.filter(d => !missingDrivers.includes(d.key));
  }

  // Renormalize weights to sum to 1.00
  const weightSum = drivers.reduce((sum, driver) => sum + driver.weight, 0);
  if (weightSum > 0) {
    drivers = drivers.map(driver => ({
      ...driver,
      weight: driver.weight / weightSum
    }));
  }

  const readinessData = {
    date: '2025-09-06', 
    score: 62, 
    band: 'amber' as const, 
    drivers, 
    flags: ['monotony_high'], 
    data_quality: { missing: missingDrivers, clipped: false } 
  };

  // Return appropriate response based on mode
  if (isPartialMode) {
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
