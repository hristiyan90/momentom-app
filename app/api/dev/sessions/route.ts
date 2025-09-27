import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { generateCorrelationId } from '@/lib/utils';

/**
 * Development-only sessions endpoint that bypasses RLS
 * Use this endpoint for testing calendar integration with seeded data
 * 
 * This endpoint uses the admin client to bypass RLS policies that prevent
 * regular sessions API from accessing data seeded with service role key.
 */
export async function GET(req: NextRequest) {
  const correlationId = generateCorrelationId();
  
  try {
    const supabase = createSupabaseAdmin();
    
    // Parse query parameters
    const { searchParams } = req.nextUrl;
    const athleteId = req.headers.get('x-athlete-id') || '00000000-0000-0000-0000-000000000001';
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const sport = searchParams.get('sport');
    const limit = Number(searchParams.get('limit') ?? '20');
    const cursor = searchParams.get('cursor') ?? undefined;
    
    console.log(`🔍 Dev sessions query - athlete: ${athleteId}, start: ${start}, end: ${end}`);
    
    // Build query with athlete filter (bypasses RLS)
    let query = supabase
      .from('sessions')
      .select('*')
      .eq('athlete_id', athleteId);
    
    // Apply date range filters if provided
    if (start) {
      query = query.gte('date', start);
    }
    if (end) {
      query = query.lte('date', end);
    }
    if (sport) {
      query = query.eq('sport', sport);
    }
    
    // Apply ordering and limit
    query = query
      .order('date', { ascending: true })
      .order('session_id', { ascending: true })
      .limit(Math.max(1, Math.min(100, limit)));
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Dev sessions query error:', error);
      return NextResponse.json(
        { error: 'Sessions query failed', details: error.message },
        { status: 500 }
      );
    }
    
    // Transform to match regular sessions API format
    const items = (data || []).map(row => ({
      session_id: row.session_id,
      date: row.date,
      sport: row.sport,
      title: row.title,
      planned_duration_min: row.planned_duration_min,
      planned_load: row.planned_load,
      planned_zone_primary: row.planned_zone_primary,
      status: row.status,
      structure_json: row.structure_json || { segments: [] },
      actual_duration_min: row.actual_duration_min,
      actual_distance_m: row.actual_distance_m,
      source_file_type: row.source_file_type,
      source_ingest_id: row.source_ingest_id
    }));
    
    console.log(`✅ Dev sessions query returned ${items.length} sessions`);
    
    return NextResponse.json({
      items,
      next_cursor: null, // Simplified pagination for dev
      debug: {
        correlation_id: correlationId,
        athlete_id: athleteId,
        filters_applied: { start, end, sport, limit },
        bypass_note: 'This endpoint bypasses RLS for development testing'
      }
    });
    
  } catch (error) {
    console.error('❌ Dev sessions endpoint failed:', error);
    return NextResponse.json(
      { 
        error: 'Dev sessions endpoint failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        correlation_id: correlationId
      },
      { status: 500 }
    );
  }
}
