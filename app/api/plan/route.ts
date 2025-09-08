import { NextResponse } from 'next/server';
import { withSecurityHeaders } from '@/lib/http/headers';

export async function GET() { 
  return withSecurityHeaders(NextResponse.json({ 
    plan_id: 'pln_abc', 
    version: 12, 
    status: 'active', 
    start_date: '2025-06-16', 
    end_date: '2025-10-05', 
    blocks: [{ 
      block_id: 'blk_3', 
      phase: 'build', 
      week_index: 10, 
      focus: 'push', 
      start_date: '2025-09-09', 
      end_date: '2025-09-15', 
      planned_hours: 12.5 
    }] 
  }), { cacheHint: "private, max-age=60, stale-while-revalidate=60" }); 
}
