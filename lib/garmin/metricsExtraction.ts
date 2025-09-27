/**
 * Performance metrics extraction from GarminDB data
 * Based on T2 analysis data quality assessment
 */

import type { 
  GarminActivity, 
  PerformanceMetrics, 
  EnvironmentalData,
  MomentomSport 
} from './types'

/**
 * Extracts performance metrics from GarminDB activity data
 * 
 * @param activity - Raw GarminDB activity data
 * @param sport - Mapped Momentom sport type
 * @returns Structured performance metrics object
 */
export function extractPerformanceMetrics(
  activity: GarminActivity, 
  sport: MomentomSport
): PerformanceMetrics | undefined {
  const metrics: PerformanceMetrics = {}
  
  // Heart rate metrics (available for all sports)
  if (activity.avg_hr && activity.max_hr) {
    metrics.heart_rate = {
      avg_bpm: Math.round(activity.avg_hr),
      max_bpm: Math.round(activity.max_hr)
    }
  }
  
  // Power metrics (primarily cycling, some running)
  if (activity.avg_power && activity.max_power) {
    metrics.power = {
      avg_watts: Math.round(activity.avg_power),
      max_watts: Math.round(activity.max_power)
    }
  }
  
  // Speed metrics (run, bike, swim)
  if (activity.avg_speed && activity.max_speed && sport !== 'strength') {
    metrics.speed = {
      avg_kmh: Math.round(activity.avg_speed * 10) / 10, // 1 decimal
      max_kmh: Math.round(activity.max_speed * 10) / 10
    }
  }
  
  // Cadence metrics (sport-specific interpretation)
  if (activity.avg_cadence && activity.max_cadence) {
    metrics.cadence = {
      avg_rpm: Math.round(activity.avg_cadence),
      max_rpm: Math.round(activity.max_cadence)
    }
  }
  
  // Calories (all sports)
  if (activity.calories && activity.calories > 0) {
    metrics.calories = Math.round(activity.calories)
  }
  
  // Training effect (Garmin-specific metrics)
  if (activity.training_effect && activity.anaerobic_training_effect) {
    metrics.training_effect = {
      aerobic: Math.round(activity.training_effect * 10) / 10, // 1 decimal
      anaerobic: Math.round(activity.anaerobic_training_effect * 10) / 10
    }
  }
  
  // Return undefined if no meaningful metrics found
  const hasMetrics = Object.keys(metrics).length > 0
  return hasMetrics ? metrics : undefined
}

/**
 * Extracts environmental data from GarminDB activity
 * 
 * @param activity - Raw GarminDB activity data
 * @returns Environmental data object or undefined
 */
export function extractEnvironmentalData(
  activity: GarminActivity
): EnvironmentalData | undefined {
  const environmental: EnvironmentalData = {}
  
  // Elevation data
  if (activity.elevation_gain && activity.elevation_gain > 0) {
    environmental.elevation_gain_m = Math.round(activity.elevation_gain)
  }
  
  if (activity.elevation_loss && activity.elevation_loss > 0) {
    environmental.elevation_loss_m = Math.round(activity.elevation_loss)
  }
  
  // Temperature data
  if (activity.temperature !== null && activity.temperature !== undefined) {
    environmental.temperature_c = Math.round(activity.temperature * 10) / 10 // 1 decimal
  }
  
  // Return undefined if no environmental data
  const hasData = Object.keys(environmental).length > 0
  return hasData ? environmental : undefined
}

/**
 * Calculates derived metrics based on activity data
 * 
 * @param activity - Raw GarminDB activity data
 * @param durationMinutes - Activity duration in minutes
 * @param sport - Mapped sport type
 * @returns Object with calculated metrics
 */
export function calculateDerivedMetrics(
  activity: GarminActivity,
  durationMinutes: number,
  sport: MomentomSport
) {
  const derived: Record<string, number> = {}
  
  // Pace calculation (for running/walking activities)
  if (sport === 'run' && activity.distance && activity.distance > 0) {
    // Convert to min/km pace
    const paceMinPerKm = durationMinutes / activity.distance
    derived.pace_min_per_km = Math.round(paceMinPerKm * 100) / 100
  }
  
  // Power-to-weight ratio (if weight data available - future enhancement)
  if (activity.avg_power && sport === 'bike') {
    // Placeholder for power-to-weight calculation
    // Would need athlete weight data from another source
    derived.avg_power_watts = Math.round(activity.avg_power)
  }
  
  // Intensity factor calculations
  if (activity.avg_hr && activity.max_hr) {
    const intensity = (activity.avg_hr / activity.max_hr) * 100
    derived.intensity_percent = Math.round(intensity)
  }
  
  return derived
}

/**
 * Validates performance metrics for data quality
 * 
 * @param metrics - Extracted performance metrics
 * @param sport - Sport type for context
 * @returns Validation result with warnings
 */
export function validateMetrics(
  metrics: PerformanceMetrics | undefined,
  sport: MomentomSport
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = []
  
  if (!metrics) {
    warnings.push('No performance metrics extracted')
    return { isValid: true, warnings } // Valid but limited data
  }
  
  // Heart rate validation
  if (metrics.heart_rate) {
    const { avg_bpm, max_bpm } = metrics.heart_rate
    
    if (avg_bpm > max_bpm) {
      warnings.push('Average HR exceeds maximum HR - data inconsistency')
    }
    
    if (avg_bpm > 220 || max_bpm > 220) {
      warnings.push('Heart rate values unusually high (>220 bpm)')
    }
    
    if (avg_bpm < 40) {
      warnings.push('Average heart rate unusually low (<40 bpm)')
    }
  }
  
  // Power validation (cycling)
  if (metrics.power && sport === 'bike') {
    const { avg_watts, max_watts } = metrics.power
    
    if (avg_watts > max_watts) {
      warnings.push('Average power exceeds maximum power - data inconsistency')
    }
    
    if (avg_watts > 1000) {
      warnings.push('Power values unusually high (>1000W)')
    }
  }
  
  // Speed validation
  if (metrics.speed) {
    const { avg_kmh, max_kmh } = metrics.speed
    
    if (avg_kmh > max_kmh) {
      warnings.push('Average speed exceeds maximum speed - data inconsistency')
    }
    
    // Sport-specific speed validation
    if (sport === 'run' && max_kmh > 30) {
      warnings.push('Running speed unusually high (>30 km/h)')
    }
    
    if (sport === 'bike' && max_kmh > 80) {
      warnings.push('Cycling speed unusually high (>80 km/h)')
    }
  }
  
  return { isValid: true, warnings }
}
