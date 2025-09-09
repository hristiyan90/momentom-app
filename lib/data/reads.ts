import { serverClient } from '@/lib/supabase/server';
import { TABLES } from './sources';

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
  
  // Query Supabase for plan data
  const { data, error } = await supabase
    .from(TABLES.plan)
    .select('*')
    .eq('athlete_id', athleteId)
    .limit(1);

  if (error) {
    console.warn('Supabase plan query error:', error);
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

  // Fallback to Cycle-1 fixture
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
  filters: { start?: string; end?: string; sport?: string } = {}
) {
  const supabase = serverClient();
  
  // Build query with athlete filter
  let query = supabase
    .from(TABLES.sessions)
    .select('*')
    .eq('athlete_id', athleteId);

  // Apply date range filters if provided
  if (filters.start) {
    query = query.gte('date', filters.start);
  }
  if (filters.end) {
    query = query.lte('date', filters.end);
  }
  if (filters.sport) {
    query = query.eq('sport', filters.sport);
  }

  const { data, error } = await query;

  if (error) {
    console.warn('Supabase sessions query error:', error);
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

    return { items, next_cursor: null };
  }

  // Fallback to Cycle-1 fixture with filtering applied
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
  if (filters.start || filters.end) {
    filteredItems = filteredItems.filter(item => {
      const itemDate = new Date(item.date);
      let includeItem = true;

      if (filters.start) {
        try {
          const startDate = new Date(filters.start);
          if (!isNaN(startDate.getTime())) {
            includeItem = includeItem && itemDate >= startDate;
          }
        } catch {
          // Ignore invalid start date
        }
      }

      if (filters.end) {
        try {
          const endDate = new Date(filters.end);
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
  if (filters.sport) {
    const validSports = ['run', 'bike', 'swim', 'strength', 'mobility'];
    if (validSports.includes(filters.sport)) {
      filteredItems = filteredItems.filter(item => item.sport === filters.sport);
    }
    // If invalid sport, ignore filter (don't filter out anything)
  }

  return { items: filteredItems, next_cursor: null };
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
  
  // Query Supabase for readiness data on specific date
  const { data, error } = await supabase
    .from(TABLES.readiness)
    .select('*')
    .eq('athlete_id', athleteId)
    .eq('date', options.date)
    .limit(1);

  if (error) {
    console.warn('Supabase readiness query error:', error);
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

  // Fallback to Cycle-1 fixture
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
  
  // Query Supabase for fuel session data
  const { data, error } = await supabase
    .from(TABLES.fuel)
    .select('*')
    .eq('athlete_id', athleteId)
    .eq('session_id', id)
    .limit(1);

  if (error) {
    console.warn('Supabase fuel session query error:', error);
  }

  // If we have data, map it to Cycle-1 format
  if (data && data.length > 0) {
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

  // Fallback to Cycle-1 fixture
  return {
    session_id: id,
    weight_kg: 75,
    pre: { carb_g_per_kg: [1.0, 2.0], fluid_ml_per_kg: [5, 10] },
    during: { 
      carb_g_per_h: [60, 90], 
      fluid_l_per_h: [0.4, 0.8], 
      sodium_mg_per_h: [120, 640] 
    },
    post: { carb_g_per_kg: [1.0, 1.2], protein_g: [20, 40], fluid_replacement_pct: 150 },
    modifiers: { heat: true, altitude: false, fasted_variant: false }
  };
}
