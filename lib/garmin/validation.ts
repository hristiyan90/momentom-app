/**
 * Data validation utilities for GarminDB transformation
 * Based on T2 quality assessment: 97% success rate target
 */

import type { GarminActivity, ValidationResult, MomentomSport } from './types'
import { validateTimestamp } from './timezoneHandler'
import { isValidGarminSport } from './sportMapping'

/**
 * Validates GarminDB activity data for transformation
 * 
 * @param activity - Raw GarminDB activity data
 * @returns Validation result with errors and warnings
 */
export function validateActivityData(activity: GarminActivity): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required fields validation
  if (!activity.activity_id) {
    errors.push('Missing required field: activity_id')
  }
  
  if (!activity.start_time) {
    errors.push('Missing required field: start_time')
  } else {
    // Validate timestamp format
    const timestampValidation = validateTimestamp(activity.start_time)
    if (!timestampValidation.isValid) {
      errors.push(`Invalid start_time: ${timestampValidation.error}`)
    }
  }
  
  if (!activity.sport) {
    errors.push('Missing required field: sport')
  } else if (!isValidGarminSport(activity.sport)) {
    warnings.push(`Unknown sport type: ${activity.sport} - will map to fallback`)
  }
  
  // Data quality checks
  validateNumericFields(activity, errors, warnings)
  validateBusinessLogic(activity, errors, warnings)
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates numeric field ranges and consistency
 */
function validateNumericFields(
  activity: GarminActivity, 
  errors: string[], 
  warnings: string[]
): void {
  // Distance validation
  if (activity.distance !== null && activity.distance !== undefined) {
    if (activity.distance < 0) {
      errors.push('Distance cannot be negative')
    } else if (activity.distance > 1000) {
      warnings.push(`Unusually large distance: ${activity.distance} km`)
    }
  }
  
  // Heart rate validation
  if (activity.avg_hr !== null && activity.avg_hr !== undefined) {
    if (activity.avg_hr < 30 || activity.avg_hr > 220) {
      warnings.push(`Average HR out of typical range: ${activity.avg_hr} bpm`)
    }
  }
  
  if (activity.max_hr !== null && activity.max_hr !== undefined) {
    if (activity.max_hr < 40 || activity.max_hr > 220) {
      warnings.push(`Maximum HR out of typical range: ${activity.max_hr} bpm`)
    }
  }
  
  // Power validation
  if (activity.avg_power !== null && activity.avg_power !== undefined) {
    if (activity.avg_power < 0) {
      errors.push('Power cannot be negative')
    } else if (activity.avg_power > 1500) {
      warnings.push(`Unusually high average power: ${activity.avg_power} watts`)
    }
  }
  
  // Speed validation
  if (activity.avg_speed !== null && activity.avg_speed !== undefined) {
    if (activity.avg_speed < 0) {
      errors.push('Speed cannot be negative')
    } else if (activity.avg_speed > 100) {
      warnings.push(`Unusually high speed: ${activity.avg_speed} km/h`)
    }
  }
  
  // Calories validation
  if (activity.calories !== null && activity.calories !== undefined) {
    if (activity.calories < 0) {
      errors.push('Calories cannot be negative')
    } else if (activity.calories > 10000) {
      warnings.push(`Unusually high calories: ${activity.calories}`)
    }
  }
}

/**
 * Validates business logic and data consistency
 */
function validateBusinessLogic(
  activity: GarminActivity,
  errors: string[],
  warnings: string[]
): void {
  // Heart rate consistency
  if (activity.avg_hr && activity.max_hr && activity.avg_hr > activity.max_hr) {
    errors.push('Average heart rate cannot exceed maximum heart rate')
  }
  
  // Power consistency
  if (activity.avg_power && activity.max_power && activity.avg_power > activity.max_power) {
    errors.push('Average power cannot exceed maximum power')
  }
  
  // Speed consistency
  if (activity.avg_speed && activity.max_speed && activity.avg_speed > activity.max_speed) {
    errors.push('Average speed cannot exceed maximum speed')
  }
  
  // Cadence consistency
  if (activity.avg_cadence && activity.max_cadence && activity.avg_cadence > activity.max_cadence) {
    errors.push('Average cadence cannot exceed maximum cadence')
  }
  
  // Training effect validation
  if (activity.training_effect !== null && activity.training_effect !== undefined) {
    if (activity.training_effect < 0 || activity.training_effect > 5) {
      warnings.push(`Training effect out of typical range (0-5): ${activity.training_effect}`)
    }
  }
  
  // Moving time validation
  if (activity.moving_time) {
    try {
      // Basic format check for HH:MM:SS
      const timePattern = /^\d{1,2}:\d{2}:\d{2}$/
      if (!timePattern.test(activity.moving_time)) {
        warnings.push(`Unusual moving_time format: ${activity.moving_time}`)
      }
    } catch {
      warnings.push(`Invalid moving_time format: ${activity.moving_time}`)
    }
  }
}

/**
 * Validates session title for Momentom requirements
 * 
 * @param title - Generated or existing title
 * @returns Validation result
 */
export function validateSessionTitle(title: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!title || title.trim().length === 0) {
    errors.push('Session title cannot be empty')
  } else {
    const trimmed = title.trim()
    
    if (trimmed.length > 200) {
      warnings.push('Session title is quite long (>200 chars)')
    }
    
    if (trimmed.length < 3) {
      warnings.push('Session title is very short (<3 chars)')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates athlete_id format (UUID)
 * 
 * @param athleteId - UUID string to validate
 * @returns Validation result
 */
export function validateAthleteId(athleteId: string): ValidationResult {
  const errors: string[] = []
  
  if (!athleteId) {
    errors.push('athlete_id is required')
  } else {
    // UUID v4 pattern validation
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidPattern.test(athleteId)) {
      errors.push('athlete_id must be a valid UUID v4')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  }
}

/**
 * Performs comprehensive validation on transformed session data
 * 
 * @param session - Transformed session object
 * @returns Validation result
 */
export function validateTransformedSession(session: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required fields (metadata is optional since current schema doesn't support it)
  const requiredFields = [
    'session_id', 
    'athlete_id', 
    'date', 
    'sport', 
    'title', 
    'actual_duration_min', 
    'status',
    'source_file_type'
  ]
  
  requiredFields.forEach(field => {
    if (session[field] === undefined || session[field] === null) {
      errors.push(`Missing required field: ${field}`)
    }
  })
  
  // Field-specific validation
  if (session.actual_duration_min !== undefined) {
    if (typeof session.actual_duration_min !== 'number' || session.actual_duration_min <= 0) {
      errors.push('actual_duration_min must be a positive number')
    }
  }
  
  if (session.actual_distance_m !== undefined && session.actual_distance_m !== null) {
    if (typeof session.actual_distance_m !== 'number' || session.actual_distance_m < 0) {
      errors.push('actual_distance_m must be a non-negative number')
    }
  }
  
  // Sport validation
  const validSports = ['run', 'bike', 'swim', 'strength', 'mobility']
  if (session.sport && !validSports.includes(session.sport)) {
    errors.push(`Invalid sport: ${session.sport}`)
  }
  
  // Status validation
  if (session.status && session.status !== 'completed') {
    warnings.push(`Unexpected status for historical data: ${session.status}`)
  }
  
  // Date format validation
  if (session.date) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(session.date)) {
      errors.push(`Invalid date format (expected YYYY-MM-DD): ${session.date}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Gets validation statistics for batch processing
 * 
 * @param results - Array of validation results
 * @returns Summary statistics
 */
export function getValidationStats(results: ValidationResult[]) {
  const stats = {
    total: results.length,
    valid: 0,
    invalid: 0,
    withWarnings: 0,
    totalErrors: 0,
    totalWarnings: 0,
    commonErrors: new Map<string, number>(),
    commonWarnings: new Map<string, number>()
  }
  
  results.forEach(result => {
    if (result.isValid) {
      stats.valid++
    } else {
      stats.invalid++
    }
    
    if (result.warnings.length > 0) {
      stats.withWarnings++
    }
    
    stats.totalErrors += result.errors.length
    stats.totalWarnings += result.warnings.length
    
    // Track common issues
    result.errors.forEach(error => {
      stats.commonErrors.set(error, (stats.commonErrors.get(error) || 0) + 1)
    })
    
    result.warnings.forEach(warning => {
      stats.commonWarnings.set(warning, (stats.commonWarnings.get(warning) || 0) + 1)
    })
  })
  
  return {
    ...stats,
    validPercentage: Math.round((stats.valid / stats.total) * 100),
    errorRate: Math.round((stats.totalErrors / stats.total) * 100) / 100,
    warningRate: Math.round((stats.totalWarnings / stats.total) * 100) / 100
  }
}
