/**
 * Calendar data mappers - transform API responses to calendar UI format
 * Maps API session data to DayAggregate and SessionLite formats
 */

import type { DayAggregate, SessionLite } from '@/components/calendar/MonthCell';

// API response types (from our API client)
export interface ApiSession {
  session_id: string;
  date: string; // ISO date string
  sport: string;
  title: string;
  planned_duration_min: number;
  planned_load: number;
  planned_zone_primary: string;
  status: string; // 'planned', 'completed', 'skipped'
  structure_json: {
    segments: Array<{ zone: number; duration: number }>;
  };
  actual_duration_min?: number | null;
  actual_distance_m?: number | null;
  source_file_type?: string | null;
  source_ingest_id?: string | null;
}

export interface ApiPlan {
  plan_id: string;
  version: number;
  status: string;
  start_date: string;
  end_date: string;
  blocks: Array<{
    block_id: string;
    phase: string;
    week_index: number;
    focus: string;
    start_date: string;
    end_date: string;
    planned_hours: number;
  }>;
}

/**
 * Map API session to calendar SessionLite format
 */
export function mapApiSessionToSessionLite(apiSession: ApiSession): SessionLite {
  // Map sport string to expected type
  const sport = mapSportString(apiSession.sport);
  
  // Map zone to intensity level
  const intensity = mapZoneToIntensity(apiSession.planned_zone_primary);
  
  // Calculate compliance for completed sessions
  const compliance = calculateSessionCompliance(apiSession);
  
  return {
    id: apiSession.session_id,
    dateISO: apiSession.date,
    sport,
    title: apiSession.title,
    minutes: apiSession.planned_duration_min,
    intensity,
    load: apiSession.planned_load,
    // Add status indicators for calendar display
    ...(apiSession.status === 'completed' ? { completed: true } : {}),
    ...(apiSession.status === 'missed' || apiSession.status === 'skipped' ? { missed: true } : {}),
    // Add compliance field that CalendarSidebar expects
    ...(compliance !== null ? { compliance } : {}),
    // Add actual duration for completed sessions
    ...(apiSession.actual_duration_min !== null ? { actualMinutes: apiSession.actual_duration_min } : {}),
  };
}

/**
 * Map sport string from API to calendar sport type
 */
function mapSportString(sport: string): 'swim' | 'bike' | 'run' | 'strength' {
  // Handle null/undefined/empty sports
  if (!sport) {
    return 'run'; // Default to run
  }
  
  const sportMap: Record<string, 'swim' | 'bike' | 'run' | 'strength'> = {
    'swim': 'swim',
    'swimming': 'swim',
    'bike': 'bike',
    'cycling': 'bike',
    'biking': 'bike',
    'run': 'run',
    'running': 'run',
    'strength': 'strength',
    'gym': 'strength',
    'weights': 'strength',
  };
  
  return sportMap[sport.toLowerCase()] || 'run'; // Default to run
}

/**
 * Map zone string to intensity level (1-5)
 */
function mapZoneToIntensity(zone: string): 'recovery' | 'endurance' | 'tempo' | 'threshold' | 'vo2' {
  // Handle null/undefined/empty zones
  if (!zone) {
    return 'endurance'; // Default to endurance
  }
  
  const intensityMap: Record<string, 'recovery' | 'endurance' | 'tempo' | 'threshold' | 'vo2'> = {
    'Z1': 'recovery',
    'Z2': 'endurance', 
    'Z3': 'tempo',
    'Z4': 'threshold',
    'Z5': 'vo2',
    'zone1': 'recovery',
    'zone2': 'endurance',
    'zone3': 'tempo', 
    'zone4': 'threshold',
    'zone5': 'vo2',
    'recovery': 'recovery',
    'endurance': 'endurance',
    'tempo': 'tempo',
    'threshold': 'threshold',
    'vo2': 'vo2',
    'vo2max': 'vo2',
  };
  
  return intensityMap[zone.toLowerCase()] || 'endurance'; // Default to endurance
}

/**
 * Group sessions by date and create DayAggregate map
 */
export function mapSessionsToDayAggregates(sessions: ApiSession[]): Map<string, DayAggregate> {
  const dayMap = new Map<string, DayAggregate>();
  
  sessions.forEach(apiSession => {
    const dateISO = apiSession.date;
    const sessionLite = mapApiSessionToSessionLite(apiSession);
    
    if (!dayMap.has(dateISO)) {
      dayMap.set(dateISO, {
        dateISO,
        bySportMinutes: {},
        sessions: [],
      });
    }
    
    const dayAggregate = dayMap.get(dateISO)!;
    dayAggregate.sessions.push(sessionLite);
    
    // Update sport minutes aggregation
    const sportMinutes = dayAggregate.bySportMinutes[sessionLite.sport] || 0;
    dayAggregate.bySportMinutes[sessionLite.sport] = sportMinutes + sessionLite.minutes;
  });
  
  return dayMap;
}

/**
 * Get DayAggregate for specific date (used by calendar components)
 */
export function getDayDataForDate(
  sessions: ApiSession[], 
  date: Date
): DayAggregate | undefined {
  const dateISO = date.toISOString().split('T')[0];
  const dayMap = mapSessionsToDayAggregates(sessions);
  return dayMap.get(dateISO);
}

/**
 * Map API sessions for week view
 */
export interface WeekSession {
  id: string;
  sport: 'swim' | 'bike' | 'run';
  title: string;
  duration: string; // Format: "1:30" 
  intensity: number; // 1-5
  time?: string;
  completed?: boolean;
  missed?: boolean;
  compliance?: number;
}

export function mapApiSessionToWeekSession(apiSession: ApiSession): WeekSession {
  const sport = mapSportString(apiSession.sport);
  const intensityLevel = mapIntensityToNumber(mapZoneToIntensity(apiSession.planned_zone_primary));
  
  // Format duration as HH:MM
  const hours = Math.floor(apiSession.planned_duration_min / 60);
  const minutes = apiSession.planned_duration_min % 60;
  const duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
  
  return {
    id: apiSession.session_id,
    sport: sport === 'strength' ? 'run' : sport, // Use run icon for strength in week view
    title: apiSession.title,
    duration,
    intensity: intensityLevel,
    time: undefined, // Would need to come from API or be set separately
    completed: apiSession.status === 'completed',
    missed: apiSession.status === 'missed',
    compliance: apiSession.status === 'completed' ? calculateCompliance(apiSession) : undefined,
  };
}

/**
 * Map intensity name to number for week view
 */
function mapIntensityToNumber(intensity: 'recovery' | 'endurance' | 'tempo' | 'threshold' | 'vo2'): number {
  const intensityMap = {
    recovery: 1,
    endurance: 2,
    tempo: 3,
    threshold: 4,
    vo2: 5,
  };
  return intensityMap[intensity];
}

/**
 * Calculate compliance percentage for completed sessions
 */
function calculateSessionCompliance(session: ApiSession): number | null {
  if (session.status !== 'completed' || session.actual_duration_min === null) {
    return session.status === 'skipped' ? 0 : null; // 0 for skipped, null for planned
  }
  
  // Calculate compliance based on actual vs planned duration
  const plannedMinutes = session.planned_duration_min;
  const actualMinutes = session.actual_duration_min;
  
  if (plannedMinutes === 0) return 100;
  
  // Compliance percentage based on duration completion
  const durationCompliance = Math.min(100, (actualMinutes / plannedMinutes) * 100);
  
  // Round to nearest whole number and ensure it's at least 1% for completed sessions
  return Math.max(1, Math.round(durationCompliance));
}

/**
 * Calculate compliance percentage (placeholder - would use actual data)
 */
function calculateCompliance(session: ApiSession): number {
  // This would typically come from the API or be calculated based on actual vs planned
  // For now, return a reasonable default based on load
  if (session.planned_load > 200) return 95; // High intensity sessions
  if (session.planned_load > 100) return 90; // Medium intensity
  return 85; // Recovery sessions
}

/**
 * Map plan data for calendar context (macro phases, etc.)
 */
export interface CalendarPlanContext {
  currentPhase?: string;
  currentBlock?: {
    phase: string;
    focus: string;
    start_date: string;
    end_date: string;
  };
  weekFocus?: string;
}

export function mapPlanToCalendarContext(plan: ApiPlan, currentDate: Date): CalendarPlanContext {
  const dateISO = currentDate.toISOString().split('T')[0];
  
  // Find current block
  const currentBlock = plan.blocks.find(block => 
    dateISO >= block.start_date && dateISO <= block.end_date
  );
  
  return {
    currentPhase: currentBlock?.phase,
    currentBlock,
    weekFocus: currentBlock?.focus,
  };
}
