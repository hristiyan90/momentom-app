import { NextResponse } from 'next/server';
import { getAuthFlags, addStandardHeaders } from '@/lib/auth/athlete';
import { generateCorrelationId } from '@/lib/utils';

/**
 * Health check endpoint for environment configuration
 * Returns the current AUTH_MODE and ALLOW_HEADER_OVERRIDE settings
 * 
 * GET /api/health/env
 * Returns: { ok: true, auth_mode: string, allow_header_override: boolean }
 */
export async function GET() {
  const correlationId = generateCorrelationId();
  
  // Get normalized authentication flags
  const { mode, allow } = getAuthFlags();
  
  // Create response with environment configuration
  const response = NextResponse.json({
    ok: true,
    auth_mode: mode,
    allow_header_override: allow
  }, { status: 200 });
  
  // Add standard headers (H1-H7 compliance)
  addStandardHeaders(response, correlationId);
  
  return response;
}