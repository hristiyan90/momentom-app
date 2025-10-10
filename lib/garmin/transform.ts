/**
 * Main transformation utilities for GarminDB → Momentom data conversion
 * Orchestrates the complete transformation pipeline
 */

import { v4 as uuidv4 } from 'uuid'
import type { 
  GarminActivity, 
  MomentomSession, 
  TransformationResult 
} from './types'
import { mapSportType } from './sportMapping'
import { extractPerformanceMetrics, extractEnvironmentalData } from './metricsExtraction'
import { normalizeTimezone, parseDurationToMinutes } from './timezoneHandler'
import { validateActivityData, validateTransformedSession } from './validation'

/**
 * Transforms a single GarminDB activity into Momentom session format
 * 
 * @param activity - Raw GarminDB activity data
 * @param athleteId - Target athlete UUID
 * @param options - Transformation options
 * @returns Transformation result with session or error
 */
export function transformGarminActivity(
  activity: GarminActivity,
  athleteId: string,
  options: {
    generateTitle?: boolean
    preserveOriginalId?: boolean
    timezone?: string
  } = {}
): TransformationResult {
  try {
    // Step 1: Validate input data
    const validation = validateActivityData(activity)
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
        warnings: validation.warnings
      }
    }
    
    // Step 2: Generate session ID
    const sessionId = uuidv4()
    
    // Step 3: Map sport type
    const sport = mapSportType(activity.sport)
    
    // Step 4: Handle timezone and date
    const { date } = normalizeTimezone(activity.start_time, {
      sourceTimezone: options.timezone,
      targetTimezone: 'UTC'
    })
    
    // Step 5: Calculate duration
    const actualDurationMin = parseDurationToMinutes(activity.moving_time)
    
    // Step 6: Convert distance (km → meters)
    const actualDistanceM = activity.distance 
      ? Math.round(activity.distance * 1000)
      : null
    
    // Step 7: Generate title
    const title = generateSessionTitle(activity, sport, date, options.generateTitle)
    
    // Step 8: Extract performance metrics
    const performanceMetrics = extractPerformanceMetrics(activity, sport)
    const environmentalData = extractEnvironmentalData(activity)
    
    // Step 9: Build metadata object (for future use when schema supports it)
    const metadata = {
      garmin_activity_id: activity.activity_id,
      ...(performanceMetrics && { performance_metrics: performanceMetrics }),
      ...(environmentalData && { environmental: environmentalData })
    }
    
    // Step 10: Construct Momentom session (without metadata field - not supported in current schema)
    const session: MomentomSession = {
      session_id: sessionId,
      athlete_id: athleteId,
      date,
      sport,
      title,
      actual_duration_min: actualDurationMin,
      actual_distance_m: actualDistanceM,
      status: 'completed',
      source_file_type: 'garmin'
      // Note: metadata field omitted - current sessions table schema doesn't support it
    }
    
    // Step 11: Validate transformed session
    const sessionValidation = validateTransformedSession(session)
    if (!sessionValidation.isValid) {
      return {
        success: false,
        error: `Session validation failed: ${sessionValidation.errors.join(', ')}`,
        warnings: [...validation.warnings, ...sessionValidation.warnings]
      }
    }
    
    return {
      success: true,
      session,
      warnings: [...validation.warnings, ...sessionValidation.warnings]
    }
    
  } catch (error) {
    return {
      success: false,
      error: `Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      warnings: []
    }
  }
}

/**
 * Transforms multiple GarminDB activities in batch
 * 
 * @param activities - Array of GarminDB activities
 * @param athleteId - Target athlete UUID
 * @param options - Batch transformation options
 * @returns Array of transformation results
 */
export function transformGarminActivitiesBatch(
  activities: GarminActivity[],
  athleteId: string,
  options: {
    continueOnError?: boolean
    generateTitles?: boolean
    timezone?: string
    progressCallback?: (completed: number, total: number) => void
  } = {}
): TransformationResult[] {
  const results: TransformationResult[] = []
  
  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i]
    
    try {
      const result = transformGarminActivity(activity, athleteId, {
        generateTitle: options.generateTitles,
        timezone: options.timezone
      })
      
      results.push(result)
      
      // Stop on first error if not continuing
      if (!result.success && !options.continueOnError) {
        break
      }
      
    } catch (error) {
      const errorResult: TransformationResult = {
        success: false,
        error: `Batch transformation failed at index ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        warnings: []
      }
      
      results.push(errorResult)
      
      if (!options.continueOnError) {
        break
      }
    }
    
    // Progress callback
    if (options.progressCallback) {
      options.progressCallback(i + 1, activities.length)
    }
  }
  
  return results
}

/**
 * Generates appropriate session title
 * 
 * @param activity - GarminDB activity data
 * @param sport - Mapped sport type
 * @param date - Session date
 * @param forceGenerate - Force generation even if name exists
 * @returns Generated or existing title
 */
function generateSessionTitle(
  activity: GarminActivity,
  sport: string,
  date: string,
  forceGenerate = false
): string {
  // Use existing name if available and not forcing generation
  if (activity.name && activity.name.trim() && !forceGenerate) {
    return activity.name.trim()
  }
  
  // Generate title based on sport and date
  const sportNames = {
    run: 'Run',
    bike: 'Bike',
    swim: 'Swim',
    strength: 'Strength',
    mobility: 'Mobility'
  }
  
  const sportName = sportNames[sport as keyof typeof sportNames] || 'Workout'
  const formattedDate = formatDateForTitle(date)
  
  return `${sportName} - ${formattedDate}`
}

/**
 * Formats date for session title
 * 
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string
 */
function formatDateForTitle(date: string): string {
  try {
    const dateObj = new Date(date + 'T00:00:00Z') // Ensure UTC
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return date // Fallback to ISO format
  }
}

/**
 * Gets transformation statistics for batch processing
 * 
 * @param results - Array of transformation results
 * @returns Summary statistics
 */
export function getTransformationStats(results: TransformationResult[]) {
  const stats = {
    total: results.length,
    successful: 0,
    failed: 0,
    withWarnings: 0,
    totalWarnings: 0,
    errors: [] as string[],
    commonWarnings: new Map<string, number>()
  }
  
  results.forEach(result => {
    if (result.success) {
      stats.successful++
    } else {
      stats.failed++
      if (result.error) {
        stats.errors.push(result.error)
      }
    }
    
    if (result.warnings && result.warnings.length > 0) {
      stats.withWarnings++
      stats.totalWarnings += result.warnings.length
      
      result.warnings.forEach(warning => {
        stats.commonWarnings.set(warning, (stats.commonWarnings.get(warning) || 0) + 1)
      })
    }
  })
  
  return {
    ...stats,
    successRate: Math.round((stats.successful / stats.total) * 100),
    failureRate: Math.round((stats.failed / stats.total) * 100),
    warningRate: Math.round((stats.withWarnings / stats.total) * 100)
  }
}

/**
 * Creates a transformation summary for logging/reporting
 * 
 * @param results - Array of transformation results
 * @returns Summary object
 */
export function createTransformationSummary(results: TransformationResult[]) {
  const stats = getTransformationStats(results)
  
  return {
    summary: `Processed ${stats.total} activities: ${stats.successful} successful (${stats.successRate}%), ${stats.failed} failed (${stats.failureRate}%)`,
    details: {
      ...stats,
      topWarnings: Array.from(stats.commonWarnings.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([warning, count]) => ({ warning, count })),
      recentErrors: stats.errors.slice(-5) // Last 5 errors
    }
  }
}
