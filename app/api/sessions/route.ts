import { NextRequest, NextResponse } from 'next/server';
import { withSecurityHeaders } from '@/lib/http/headers';

export async function GET(req: NextRequest) {
  // Mock data with multiple sessions for testing
  const allItems = [
    { 
      session_id: 'ses_001', 
      date: '2025-09-06', 
      sport: 'run', 
      title: 'Endurance Base', 
      planned_duration_min: 90, 
      planned_load: 75, 
      planned_zone_primary: 'z2', 
      status: 'planned', 
      structure_json: { segments: [] } 
    },
    { 
      session_id: 'ses_002', 
      date: '2025-09-07', 
      sport: 'bike', 
      title: 'Tempo Intervals', 
      planned_duration_min: 60, 
      planned_load: 65, 
      planned_zone_primary: 'z3', 
      status: 'planned', 
      structure_json: { segments: [] } 
    },
    { 
      session_id: 'ses_003', 
      date: '2025-09-08', 
      sport: 'swim', 
      title: 'Technique Focus', 
      planned_duration_min: 45, 
      planned_load: 40, 
      planned_zone_primary: 'z1', 
      status: 'planned', 
      structure_json: { segments: [] } 
    },
    { 
      session_id: 'ses_004', 
      date: '2025-09-06', 
      sport: 'strength', 
      title: 'Core & Stability', 
      planned_duration_min: 30, 
      planned_load: 20, 
      planned_zone_primary: null, 
      status: 'planned', 
      structure_json: { segments: [] } 
    }
  ];

  // Parse query parameters
  const { searchParams } = req.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const sport = searchParams.get('sport');

  // Apply soft filtering
  let filteredItems = [...allItems];

  // Filter by date range if start/end provided
  if (start || end) {
    filteredItems = filteredItems.filter(item => {
      const itemDate = new Date(item.date);
      let includeItem = true;

      if (start) {
        try {
          const startDate = new Date(start);
          if (!isNaN(startDate.getTime())) {
            includeItem = includeItem && itemDate >= startDate;
          }
        } catch {
          // Ignore invalid start date
        }
      }

      if (end) {
        try {
          const endDate = new Date(end);
          if (!isNaN(endDate.getTime())) {
            // Include end date (end of day)
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            includeItem = includeItem && itemDate <= endOfDay;
          }
        } catch {
          // Ignore invalid end date
        }
      }

      return includeItem;
    });
  }

  // Filter by sport if provided
  if (sport) {
    const validSports = ['run', 'bike', 'swim', 'strength', 'mobility'];
    if (validSports.includes(sport)) {
      filteredItems = filteredItems.filter(item => item.sport === sport);
    }
    // If invalid sport, ignore filter (don't filter out anything)
  }

  return withSecurityHeaders(NextResponse.json({ items: filteredItems, next_cursor: null }), { 
    cacheHint: "private, max-age=60, stale-while-revalidate=60" 
  });
}
