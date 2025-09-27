/**
 * Sport mapping utilities for GarminDB → Momentom sport conversion
 * Based on T2 analysis: 9 GarminDB sports → 5 Momentom categories
 */

import type { GarminSport, MomentomSport } from './types'

/**
 * Sport mapping configuration based on T2 analysis
 * From docs/specs/C2-S1-B3e.md Section 6.2
 */
const SPORT_MAPPING: Record<GarminSport, MomentomSport> = {
  // Endurance → run
  'running': 'run',
  'walking': 'run', 
  'hiking': 'run',
  
  // Cycling → bike
  'cycling': 'bike',
  
  // Swimming → swim
  'swimming': 'swim',
  
  // Strength/fitness → strength
  'fitness_equipment': 'strength',
  'snowboarding': 'strength',
  'rock_climbing': 'strength',
  
  // Unknown/fallback → strength
  'UnknownEnumValue_54': 'strength'
}

/**
 * Maps GarminDB sport type to Momentom sport category
 * 
 * @param garminSport - The sport type from GarminDB
 * @returns Mapped Momentom sport category
 * 
 * @example
 * mapSportType('running') // returns 'run'
 * mapSportType('cycling') // returns 'bike'
 * mapSportType('UnknownEnumValue_54') // returns 'strength' (fallback)
 */
export function mapSportType(garminSport: string): MomentomSport {
  // Normalize input (handle case variations)
  const normalizedSport = garminSport.toLowerCase().trim()
  
  // Direct mapping lookup
  if (normalizedSport in SPORT_MAPPING) {
    return SPORT_MAPPING[normalizedSport as GarminSport]
  }
  
  // Fuzzy matching for common variations
  if (normalizedSport.includes('run')) return 'run'
  if (normalizedSport.includes('walk')) return 'run'
  if (normalizedSport.includes('bike') || normalizedSport.includes('cycle')) return 'bike'
  if (normalizedSport.includes('swim')) return 'swim'
  if (normalizedSport.includes('strength') || normalizedSport.includes('weight')) return 'strength'
  
  // Default fallback to strength for unknown sports
  return 'strength'
}

/**
 * Gets all supported GarminDB sport types
 * @returns Array of supported Garmin sport types
 */
export function getSupportedGarminSports(): GarminSport[] {
  return Object.keys(SPORT_MAPPING) as GarminSport[]
}

/**
 * Gets all Momentom sport categories
 * @returns Array of Momentom sport categories
 */
export function getMomentomSports(): MomentomSport[] {
  return ['run', 'bike', 'swim', 'strength', 'mobility']
}

/**
 * Validates if a sport type is recognized
 * @param sport - Sport type to validate
 * @returns True if sport is recognized
 */
export function isValidGarminSport(sport: string): sport is GarminSport {
  const normalizedSport = sport.toLowerCase().trim()
  return normalizedSport in SPORT_MAPPING
}

/**
 * Gets sport mapping statistics for analysis
 * @returns Mapping statistics object
 */
export function getSportMappingStats() {
  const stats: Record<MomentomSport, GarminSport[]> = {
    run: [],
    bike: [],
    swim: [],
    strength: [],
    mobility: []
  }
  
  Object.entries(SPORT_MAPPING).forEach(([garmin, momentom]) => {
    stats[momentom].push(garmin as GarminSport)
  })
  
  return {
    totalGarminSports: Object.keys(SPORT_MAPPING).length,
    totalMomentomSports: Object.keys(stats).length,
    mapping: stats
  }
}
