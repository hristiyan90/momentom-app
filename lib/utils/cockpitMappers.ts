/**
 * Mappers to convert API data to cockpit UI format
 * Transforms live API responses to match existing UI component expectations
 */

/**
 * Map API session data to cockpit workout format
 */
export function mapSessionsToWorkouts(sessions: Array<{
  session_id: string;
  date: string;
  sport: string;
  title: string;
  planned_duration_min: number;
  planned_load: number;
  planned_zone_primary: string;
  status: string;
  structure_json: {
    segments: Array<{ zone: number; duration: number }>;
  };
}>) {
  return sessions.map(session => {
    // Map sport to cockpit format
    const sport = mapSportToCockpit(session.sport);
    
    // Calculate duration string
    const hours = Math.floor(session.planned_duration_min / 60);
    const minutes = session.planned_duration_min % 60;
    const time = hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${minutes} min`;
    const duration = hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:00` : `0:${minutes.toString().padStart(2, '0')}:00`;
    
    // Map load to stress level
    const stress = mapLoadToStress(session.planned_load);
    
    // Map zone to workout type
    const workoutType = mapZoneToWorkoutType(session.planned_zone_primary);
    
    // Map segments
    const segments = session.structure_json.segments.map(segment => ({
      zone: segment.zone,
      duration: segment.duration,
    }));
    
    // Generate targets based on sport and zone
    const targets = generateTargetsForSport(sport, session.planned_zone_primary);
    
    // Generate fueling recommendations
    const fueling = generateFuelingForDuration(session.planned_duration_min);
    
    return {
      title: session.title,
      sport,
      stress,
      time,
      duration,
      load: session.planned_load,
      workoutType,
      segments,
      targets,
      fueling,
      completed: session.status === 'completed',
      missed: session.status === 'missed',
      compliance: session.status === 'completed' ? { duration: 95 } : undefined,
    };
  });
}

/**
 * Map API sport to cockpit sport format
 */
function mapSportToCockpit(sport: string): "swim" | "bike" | "run" {
  switch (sport.toLowerCase()) {
    case 'swimming':
    case 'swim':
      return 'swim';
    case 'cycling':
    case 'bike':
      return 'bike';
    case 'running':
    case 'run':
    default:
      return 'run';
  }
}

/**
 * Map load to stress level
 */
function mapLoadToStress(load: number): string {
  if (load >= 80) return 'High';
  if (load >= 50) return 'Medium';
  return 'Low';
}

/**
 * Map zone to workout type
 */
function mapZoneToWorkoutType(zone: string): string {
  switch (zone.toLowerCase()) {
    case 'z1':
      return 'Recovery';
    case 'z2':
      return 'Endurance';
    case 'z3':
      return 'Tempo';
    case 'z4':
      return 'Threshold';
    case 'z5':
      return 'VO2 Max';
    default:
      return 'Endurance';
  }
}

/**
 * Generate targets based on sport and zone
 */
function generateTargetsForSport(sport: "swim" | "bike" | "run", zone: string) {
  const targets: any = {};
  
  switch (sport) {
    case 'bike':
      targets.power = { min: 200, max: 250 };
      targets.hr = { min: 140, max: 160 };
      break;
    case 'run':
      targets.pace = { min: "4:30", max: "5:00" };
      targets.hr = { min: 160, max: 180 };
      break;
    case 'swim':
      targets.pace = { min: "2:00", max: "2:30" };
      targets.hr = { min: 120, max: 140 };
      break;
  }
  
  return targets;
}

/**
 * Generate fueling recommendations based on duration
 */
function generateFuelingForDuration(durationMin: number): string[] {
  const fueling: string[] = [];
  
  if (durationMin >= 60) {
    fueling.push("1 bottle/hour");
    fueling.push("60g carbs/hour");
  }
  
  if (durationMin >= 90) {
    fueling.push("Electrolytes");
  }
  
  if (durationMin >= 120) {
    fueling.push("Gel every 45min");
  }
  
  if (fueling.length === 0) {
    fueling.push("Hydration only");
  }
  
  return fueling;
}

/**
 * Map API readiness data to cockpit capacity format
 */
export function mapReadinessToCapacity(readiness: {
  date: string;
  score: number;
  band: 'green' | 'amber' | 'red';
  drivers: Array<{
    key: string;
    z: number;
    weight: number;
    contribution: number;
  }>;
  flags: string[];
  data_quality: {
    missing: string[];
    clipped: boolean;
  };
}) {
  // Map drivers to capacity format
  const hrvDriver = readiness.drivers.find(d => d.key === 'hrv');
  const sleepDriver = readiness.drivers.find(d => d.key === 'sleep');
  const rhrDriver = readiness.drivers.find(d => d.key === 'rhr');
  const strainDriver = readiness.drivers.find(d => d.key === 'prior_strain');
  
  return {
    score: readiness.score,
    status: mapBandToStatus(readiness.band),
    hrv: {
      current: 38, // Mock value, would need actual HRV data
      sevenDayAvg: 42,
      lastWeekTrend: hrvDriver ? (hrvDriver.z > 0 ? "up" : "down") : "stable",
      trendPercentage: hrvDriver ? Math.round(Math.abs(hrvDriver.z * 10)) : 0,
    },
    sleep: {
      lastNight: {
        total: 6.8, // Mock values, would need actual sleep data
        deep: 1.2,
        rem: 1.8,
        light: 3.8,
      },
      sevenDayAvg: 7.2,
      lastWeekTrend: sleepDriver ? (sleepDriver.z > 0 ? "up" : "down") : "stable",
      trendPercentage: sleepDriver ? Math.round(Math.abs(sleepDriver.z * 10)) : 0,
    },
    rhr: {
      current: 52, // Mock value, would need actual RHR data
      sevenDayAvg: 49,
      lastWeekTrend: rhrDriver ? (rhrDriver.z > 0 ? "up" : "down") : "stable",
      trendPercentage: rhrDriver ? Math.round(Math.abs(rhrDriver.z * 10)) : 0,
    },
    strain: {
      current: 68, // Mock value, would need actual strain data
      sevenDayAvg: 62,
      lastWeekTrend: strainDriver ? (strainDriver.z > 0 ? "up" : "down") : "stable",
      trendPercentage: strainDriver ? Math.round(Math.abs(strainDriver.z * 10)) : 0,
    },
    soreness: {
      current: 25, // Mock value
      sevenDayAvg: 32,
      lastWeekTrend: "down" as const,
      trendPercentage: -8,
    },
    context: {
      current: 72, // Mock value
      sevenDayAvg: 68,
      lastWeekTrend: "up" as const,
      trendPercentage: 5,
    },
    advice: {
      message: generateAdviceMessage(readiness.score, readiness.band),
      action: readiness.band === 'red' ? 'take-easy' : readiness.band === 'amber' ? 'moderate' : 'push',
      showAdaptation: readiness.band === 'red',
    },
    lastSync: {
      source: "Live Data",
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: "Today",
    },
  };
}

/**
 * Map readiness band to status
 */
function mapBandToStatus(band: 'green' | 'amber' | 'red'): string {
  switch (band) {
    case 'green':
      return 'Excellent';
    case 'amber':
      return 'Good';
    case 'red':
      return 'Poor';
    default:
      return 'Good';
  }
}

/**
 * Generate advice message based on readiness
 */
function generateAdviceMessage(score: number, band: 'green' | 'amber' | 'red'): string {
  if (band === 'red') {
    return "Your readiness is low. Consider prioritizing recovery today.";
  }
  if (band === 'amber') {
    return "Your readiness is moderate. You can train but listen to your body.";
  }
  return "Your readiness is excellent. Great day for a challenging workout!";
}

/**
 * Map API plan data to cockpit week focus format
 */
export function mapPlanToWeekFocus(plan: {
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
}) {
  const currentBlock = plan.blocks[0]; // Assuming first block is current
  
  return {
    hasAdaptations: false, // Would need adaptation data
    weekType: mapPhaseToWeekType(currentBlock.phase),
    description: generateWeekDescription(currentBlock.phase, currentBlock.focus),
    adaptationStatus: null, // Would need adaptation data
  };
}

/**
 * Map plan phase to week type
 */
function mapPhaseToWeekType(phase: string): string {
  switch (phase.toLowerCase()) {
    case 'build':
      return 'Build Week';
    case 'base':
      return 'Base Week';
    case 'peak':
      return 'Peak Week';
    case 'taper':
      return 'Taper Week';
    case 'recovery':
      return 'Recovery Week';
    default:
      return 'Build Week';
  }
}

/**
 * Generate week description based on phase and focus
 */
function generateWeekDescription(phase: string, focus: string): string {
  const phaseMap: Record<string, string> = {
    build: "Building volume and intensity to improve fitness",
    base: "Establishing aerobic base with steady endurance work",
    peak: "Fine-tuning race pace and maintaining fitness",
    taper: "Reducing volume while maintaining intensity for race readiness",
    recovery: "Active recovery to allow adaptation and prevent overtraining",
  };
  
  return phaseMap[phase.toLowerCase()] || "Structured training to improve performance";
}
