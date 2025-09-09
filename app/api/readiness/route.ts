import { NextRequest, NextResponse } from 'next/server';
import { getAthleteId, addStandardHeaders, setCacheHint } from '@/lib/auth/athlete';
import { getReadiness } from '@/lib/data/reads';
import { generateCorrelationId } from '@/lib/utils';

export async function GET(req: NextRequest) { 
  const correlationId = generateCorrelationId();
  
  try {
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
      const response = NextResponse.json(readinessData, { status: 206 });
      response.headers.set('Warning', '199 - partial data');
      
      addStandardHeaders(response, correlationId);
      setCacheHint(response, "private, max-age=30, stale-while-revalidate=30");
      
      return response;
    }
    
    // Normal mode: return 200 with complete data
    const response = NextResponse.json(readinessData, { status: 200 });
    
    // Add standard headers (H1-H7 compliance)
    addStandardHeaders(response, correlationId);
    setCacheHint(response, "private, max-age=30, stale-while-revalidate=30");
    
    return response;
  } catch (error) {
    // Handle authentication errors gracefully
    console.error('Readiness route error:', error);
    
    const errorResponse = NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Authentication required', request_id: correlationId } },
      { status: 401 }
    );
    
    addStandardHeaders(errorResponse, correlationId);
    errorResponse.headers.set('WWW-Authenticate', 'Bearer realm="momentom", error="invalid_token"');
    
    return errorResponse;
  }
}
