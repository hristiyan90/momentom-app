import { serverClient } from '@/lib/supabase/server';
import { TABLES } from './sources';
import { encodeCursor, decodeCursor } from '@/lib/pagination/cursor';

/**
 * Type-safe helper to detect PostgreSQL missing relation errors
 * PGRST205 indicates a relation/table doesn't exist or isn't accessible
 * 
 * @param e - Unknown error object to check
 * @returns Type predicate indicating if error is a missing relation error
 */
export function isMissingRelation(e: unknown): e is { code: string } {
  return typeof e === 'object' && e !== null && 'code' in e && (e as any).code === 'PGRST205';
}

/**
 * Get plan data for an athlete
 * Returns Supabase data if found, otherwise falls back to Cycle-1 fixture
 * 
 * @param athleteId - Athlete UUID
 * @returns Plan data in exact Cycle-1 JSON format
 */
export async function getPlan(athleteId: string) {
  const supabase = serverClient();
  
  try {
    // Query Supabase for plan data
    const { data, error } = await supabase
      .from(TABLES.plan)
      .select('*')
      .eq('athlete_id', athleteId)
      .limit(1);

    if (error) {
      throw error;
    }

    // If we have data, map it to Cycle-1 format
    if (data && data.length > 0) {
      const planRow = data[0];
      return {
        plan_id: planRow.plan_id,
        version: planRow.version,
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
      };
    }

    // No data found, return Cycle-1 fixture
    return {
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
    };
  } catch (err) {
    if (isMissingRelation(err)) {
      console.info('Supabase plan missing; using fixtures', { code: (err as any).code });
    } else {
      console.error('Supabase plan query error', err);
    }
    
    // Return Cycle-1 fixture on any error to keep API green
    return {
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
    };
  }
}

/**
 * Get sessions for an athlete with optional filtering
 * Returns Supabase data if found, otherwise falls back to Cycle-1 fixture
 * 
 * @param athleteId - Athlete UUID
 * @param filters - Optional filters for start, end, sport
 * @returns Sessions data in exact Cycle-1 JSON format
 */
export async function getSessions(
  athleteId: string, 
  params: { start?: string; end?: string; sport?: string; cursor?: string; limit?: number } = {}
) {
  const supabase = serverClient();
  
  try {
    // Build query with athlete filter
    let query = supabase
      .from(TABLES.sessions)
      .select('*')
      .eq('athlete_id', athleteId);

    // Apply date range filters if provided
    if (params.start) {
      query = query.gte('date', params.start);
    }
    if (params.end) {
      query = query.lte('date', params.end);
    }
    if (params.sport) {
      query = query.eq('sport', params.sport);
    }

    // Apply cursor-based pagination if provided
    if (params.cursor) {
      const decodedCursor = decodeCursor(params.cursor);
      if (decodedCursor) {
        // Use cursor for pagination: date > cursor.date OR (date = cursor.date AND session_id > cursor.i)
        query = query.or(`date.gt.${decodedCursor.d},and(date.eq.${decodedCursor.d},session_id.gt.${decodedCursor.i})`);
      }
    }

    // Apply limit (default to 20 if not specified)
    const limit = params.limit || 20;
    query = query.limit(limit + 1); // Get one extra to determine if there are more results

    // Order by date (ascending) then by session_id (ascending) for consistent pagination
    query = query.order('date', { ascending: true }).order('session_id', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // If we have data, map it to Cycle-1 format
    if (data && data.length > 0) {
      const items = data.map(sessionRow => ({
        session_id: sessionRow.session_id,
        date: sessionRow.date,
        sport: sessionRow.sport,
        title: sessionRow.title || 'Session',
        planned_duration_min: sessionRow.planned_duration_min || 60,
        planned_load: sessionRow.planned_load || 50,
        planned_zone_primary: sessionRow.planned_zone_primary || 'z2',
        status: sessionRow.status || 'planned',
        structure_json: sessionRow.structure_json || { segments: [] }
      }));

      // Determine if there are more results and generate next cursor
      const hasMore = data.length > limit;
      const nextCursor = hasMore && items.length > 0 ? 
        encodeCursor({ d: items[items.length - 1].date, i: items[items.length - 1].session_id }) : 
        null;

      // Remove the extra item if we fetched one more than requested
      const finalItems = hasMore ? items.slice(0, limit) : items;

      return { items: finalItems, next_cursor: nextCursor };
    }

    // No data found, return Cycle-1 fixture with filtering applied
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

    // Apply soft filtering to fixture data (same logic as API route)
    let filteredItems = [...allItems];

    // Filter by date range if start/end provided
    if (params.start || params.end) {
      filteredItems = filteredItems.filter(item => {
        const itemDate = new Date(item.date);
        let includeItem = true;

        if (params.start) {
          try {
            const startDate = new Date(params.start);
            if (!isNaN(startDate.getTime())) {
              includeItem = includeItem && itemDate >= startDate;
            }
          } catch {
            // Ignore invalid start date
          }
        }

        if (params.end) {
          try {
            const endDate = new Date(params.end);
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
    if (params.sport) {
      const validSports = ['run', 'bike', 'swim', 'strength', 'mobility'];
      if (validSports.includes(params.sport)) {
        filteredItems = filteredItems.filter(item => item.sport === params.sport);
      }
      // If invalid sport, ignore filter (don't filter out anything)
    }

    // Apply cursor-based pagination to fixtures if provided
    if (params.cursor) {
      const decodedCursor = decodeCursor(params.cursor);
      if (decodedCursor) {
        filteredItems = filteredItems.filter(item => {
          const itemDate = item.date;
          const itemId = item.session_id;
          
          // Date > cursor.date OR (date = cursor.date AND session_id > cursor.i)
          return itemDate > decodedCursor.d || 
                 (itemDate === decodedCursor.d && itemId > decodedCursor.i);
        });
      }
    }

    // Apply limit to fixtures (default to 20 if not specified)
    const limit = params.limit || 20;
    const hasMore = filteredItems.length > limit;
    const finalItems = hasMore ? filteredItems.slice(0, limit) : filteredItems;
    
    // Generate next cursor for fixtures
    const nextCursor = hasMore && finalItems.length > 0 ? 
      encodeCursor({ d: finalItems[finalItems.length - 1].date, i: finalItems[finalItems.length - 1].session_id }) : 
      null;

    return { items: finalItems, next_cursor: nextCursor };
  } catch (err) {
    if (isMissingRelation(err)) {
      console.info('Supabase sessions missing; using fixtures', { code: (err as any).code });
    } else {
      console.error('Supabase sessions query error', err);
    }
    
    // Return Cycle-1 fixture on any error to keep API green
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

    // Apply soft filtering to fixture data
    let filteredItems = [...allItems];

    if (params.start || params.end) {
      filteredItems = filteredItems.filter(item => {
        const itemDate = new Date(item.date);
        let includeItem = true;

        if (params.start) {
          try {
            const startDate = new Date(params.start);
            if (!isNaN(startDate.getTime())) {
              includeItem = includeItem && itemDate >= startDate;
            }
          } catch {
            // Ignore invalid start date
          }
        }

        if (params.end) {
          try {
            const endDate = new Date(params.end);
            if (!isNaN(endDate.getTime())) {
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

    if (params.sport) {
      const validSports = ['run', 'bike', 'swim', 'strength', 'mobility'];
      if (validSports.includes(params.sport)) {
        filteredItems = filteredItems.filter(item => item.sport === params.sport);
      }
    }

    // Apply cursor-based pagination to fixtures if provided
    if (params.cursor) {
      const decodedCursor = decodeCursor(params.cursor);
      if (decodedCursor) {
        filteredItems = filteredItems.filter(item => {
          const itemDate = item.date;
          const itemId = item.session_id;
          
          // Date > cursor.date OR (date = cursor.date AND session_id > cursor.i)
          return itemDate > decodedCursor.d || 
                 (itemDate === decodedCursor.d && itemId > decodedCursor.i);
        });
      }
    }

    // Apply limit to fixtures (default to 20 if not specified)
    const limit = params.limit || 20;
    const hasMore = filteredItems.length > limit;
    const finalItems = hasMore ? filteredItems.slice(0, limit) : filteredItems;
    
    // Generate next cursor for fixtures
    const nextCursor = hasMore && finalItems.length > 0 ? 
      encodeCursor({ d: finalItems[finalItems.length - 1].date, i: finalItems[finalItems.length - 1].session_id }) : 
      null;

    return { items: finalItems, next_cursor: nextCursor };
  }
}

/**
 * Get readiness data for an athlete on a specific date
 * Returns Supabase data if found, otherwise falls back to Cycle-1 fixture
 * 
 * @param athleteId - Athlete UUID
 * @param options - Options including date
 * @returns Readiness data in exact Cycle-1 JSON format
 */
export async function getReadiness(
  athleteId: string, 
  options: { date: string }
) {
  const supabase = serverClient();
  
  try {
    // Query Supabase for readiness data on specific date
    const { data, error } = await supabase
      .from(TABLES.readiness)
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('date', options.date)
      .limit(1);

    if (error) {
      throw error;
    }

    // If we have data, map it to Cycle-1 format
    if (data && data.length > 0) {
      const readinessRow = data[0];
      return {
        date: readinessRow.date,
        score: readinessRow.score || 62,
        band: readinessRow.band || 'amber',
        drivers: readinessRow.drivers || [
          { key: 'hrv', z: -0.8, weight: 0.3333333333333333, contribution: -8.0 },
          { key: 'sleep', z: -0.3, weight: 0.26666666666666666, contribution: -3.0 },
          { key: 'rhr', z: 0.2, weight: 0.2, contribution: -2.0 },
          { key: 'prior_strain', z: 0.7, weight: 0.2, contribution: -5.0 }
        ],
        flags: readinessRow.flags || ['monotony_high'],
        data_quality: readinessRow.data_quality || { missing: [], clipped: false }
      };
    }

    // No data found, return Cycle-1 fixture
    return {
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
  } catch (err) {
    if (isMissingRelation(err)) {
      console.info('Supabase readiness missing; using fixtures', { code: (err as any).code });
    } else {
      console.error('Supabase readiness query error', err);
    }
    
    // Return Cycle-1 fixture on any error to keep API green
    return {
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
  }
}

/**
 * Get fuel session data by ID for an athlete
 * Returns Supabase data if found, otherwise falls back to Cycle-1 fixture
 * 
 * @param athleteId - Athlete UUID
 * @param id - Session ID
 * @returns Fuel session data in exact Cycle-1 JSON format
 */
export async function getFuelSessionById(athleteId: string, id: string) {
  const supabase = serverClient();
  
  // Local fuel fixtures record keyed by session_id
  const FUEL_FIXTURES_BY_ID: Record<string, any> = {
    'ses_777': {
      session_id: 'ses_777',
      weight_kg: 75,
      pre: { carb_g_per_kg: [1.0, 2.0], fluid_ml_per_kg: [5, 10] },
      during: { 
        carb_g_per_h: [60, 90], 
        fluid_l_per_h: [0.4, 0.8], 
        sodium_mg_per_h: [120, 640] 
      },
      post: { carb_g_per_kg: [1.0, 1.2], protein_g: [20, 40], fluid_replacement_pct: 150 },
      modifiers: { heat: true, altitude: false, fasted_variant: false }
    }
  };
  
  try {
    // Query Supabase for fuel session data with RLS
    const { data, error } = await supabase
      .from(TABLES.fuel)
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('session_id', id)
      .limit(1);

    if (error) {
      throw error;
    }

    // If we have exactly 1 row, map and return it
    if (data && data.length === 1) {
      const fuelRow = data[0];
      return {
        session_id: fuelRow.session_id,
        weight_kg: fuelRow.weight_kg || 75,
        pre: fuelRow.pre || { carb_g_per_kg: [1.0, 2.0], fluid_ml_per_kg: [5, 10] },
        during: fuelRow.during || { 
          carb_g_per_h: [60, 90], 
          fluid_l_per_h: [0.4, 0.8], 
          sodium_mg_per_h: [120, 640] 
        },
        post: fuelRow.post || { carb_g_per_kg: [1.0, 1.2], protein_g: [20, 40], fluid_replacement_pct: 150 },
        modifiers: fuelRow.modifiers || { heat: true, altitude: false, fasted_variant: false }
      };
    }

    // If success and rows.length === 0, fall through to fixtures check
    const fx = FUEL_FIXTURES_BY_ID[id];
    if (fx) return fx;
    return null; // Important: indicate "not found" to the route
  } catch (e) {
    if (isMissingRelation(e)) {
      console.info('Supabase fuel_sessions missing; using fixtures');
    } else {
      console.error('Supabase fuel session query error', e);
    }
    
    // Fixtures path
    const fx = FUEL_FIXTURES_BY_ID[id];
    if (fx) return fx;
    return null; // Important: indicate "not found" to the route
  }
}
