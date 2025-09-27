/**
 * Wellness data transformation utilities for GarminDB → Momentom format
 * Transforms sleep, RHR, and weight data with validation and quality scoring
 */

import { randomUUID } from 'crypto'
import type {
  GarminSleepRecord,
  GarminRHRRecord,
  GarminWeightRecord,
  MomentomWellnessData,
  SleepData,
  RHRData,
  WeightData,
  WellnessTransformResult
} from './types'

/**
 * Transforms GarminDB sleep record to Momentom wellness format
 * 
 * @param sleepRecord - Raw GarminDB sleep record
 * @param athleteId - Target athlete ID
 * @returns Transformation result with validation
 */
export function transformSleepRecord(
  sleepRecord: GarminSleepRecord,
  athleteId: string
): WellnessTransformResult {
  const warnings: string[] = []
  const errors: string[] = []

  try {
    // Validate required fields
    if (!sleepRecord.day) {
      errors.push('Missing required field: day')
      return { success: false, warnings, errors }
    }

    if (!sleepRecord.total_sleep) {
      errors.push('Missing required field: total_sleep')
      return { success: false, warnings, errors }
    }

    // Parse sleep durations
    const totalMinutes = parseTimeStringToMinutes(sleepRecord.total_sleep)
    const deepMinutes = sleepRecord.deep_sleep ? parseTimeStringToMinutes(sleepRecord.deep_sleep) : null
    const lightMinutes = sleepRecord.light_sleep ? parseTimeStringToMinutes(sleepRecord.light_sleep) : null
    const remMinutes = sleepRecord.rem_sleep ? parseTimeStringToMinutes(sleepRecord.rem_sleep) : null
    const awakeMinutes = sleepRecord.awake ? parseTimeStringToMinutes(sleepRecord.awake) : null

    // Validate sleep duration ranges
    if (totalMinutes < 180 || totalMinutes > 720) { // 3-12 hours
      warnings.push(`Unusual total sleep duration: ${totalMinutes} minutes`)
    }

    // Calculate sleep efficiency
    let efficiency: number | null = null
    if (totalMinutes && awakeMinutes !== null) {
      efficiency = Math.round(((totalMinutes - awakeMinutes) / totalMinutes) * 100 * 10) / 10
      if (efficiency < 70) {
        warnings.push(`Low sleep efficiency: ${efficiency}%`)
      }
    }

    // Parse bedtime and wake time
    const bedtime = sleepRecord.bedtime ? parseTimeToHHMM(sleepRecord.bedtime) : undefined
    const wakeTime = sleepRecord.wake_time ? parseTimeToHHMM(sleepRecord.wake_time) : undefined

    // Validate sleep score
    if (sleepRecord.sleep_score !== null && (sleepRecord.sleep_score < 0 || sleepRecord.sleep_score > 100)) {
      warnings.push(`Invalid sleep score: ${sleepRecord.sleep_score}`)
    }

    // Create sleep data
    const sleepData: SleepData = {
      total_minutes: totalMinutes,
      deep_minutes: deepMinutes,
      light_minutes: lightMinutes,
      rem_minutes: remMinutes,
      awake_minutes: awakeMinutes,
      efficiency,
      score: sleepRecord.sleep_score,
      bedtime,
      wake_time: wakeTime
    }

    // Create Momentom wellness record
    const wellnessData: MomentomWellnessData = {
      wellness_id: randomUUID(),
      athlete_id: athleteId,
      date: sleepRecord.day,
      data_type: 'sleep',
      value_json: sleepData,
      source_type: 'garmin',
      metadata: {
        garmin_record_id: sleepRecord.day,
        quality_score: sleepRecord.sleep_score || undefined
      }
    }

    return {
      success: true,
      data: wellnessData,
      warnings,
      errors
    }

  } catch (error) {
    errors.push(`Sleep transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { success: false, warnings, errors }
  }
}

/**
 * Transforms GarminDB RHR record to Momentom wellness format
 * 
 * @param rhrRecord - Raw GarminDB RHR record
 * @param athleteId - Target athlete ID
 * @param historicalContext - Optional historical RHR data for trend analysis
 * @returns Transformation result with validation
 */
export function transformRHRRecord(
  rhrRecord: GarminRHRRecord,
  athleteId: string,
  historicalContext?: number[]
): WellnessTransformResult {
  const warnings: string[] = []
  const errors: string[] = []

  try {
    // Validate required fields
    if (!rhrRecord.day) {
      errors.push('Missing required field: day')
      return { success: false, warnings, errors }
    }

    if (rhrRecord.resting_hr === null || rhrRecord.resting_hr === undefined) {
      errors.push('Missing required field: resting_hr')
      return { success: false, warnings, errors }
    }

    const rhr = rhrRecord.resting_hr

    // Validate RHR range
    if (rhr < 30 || rhr > 120) {
      errors.push(`Invalid RHR value: ${rhr} bpm`)
      return { success: false, warnings, errors }
    } else if (rhr < 40 || rhr > 100) {
      warnings.push(`Unusual RHR value: ${rhr} bpm`)
    }

    // Determine RHR quality based on typical athlete ranges
    let quality: RHRData['quality']
    if (rhr <= 50) {
      quality = 'excellent'
    } else if (rhr <= 60) {
      quality = 'good'
    } else if (rhr <= 70) {
      quality = 'fair'
    } else {
      quality = 'poor'
    }

    // Determine trend if historical context is available
    let trend: RHRData['trend'] = null
    if (historicalContext && historicalContext.length >= 7) {
      const recentAvg = historicalContext.slice(0, 7).reduce((a, b) => a + b, 0) / 7
      const olderAvg = historicalContext.slice(7, 14).reduce((a, b) => a + b, 0) / 7
      
      if (recentAvg < olderAvg - 2) {
        trend = 'improving'
      } else if (recentAvg > olderAvg + 2) {
        trend = 'declining'
      } else {
        trend = 'stable'
      }
    }

    // Create RHR data
    const rhrData: RHRData = {
      bpm: rhr,
      quality,
      trend
    }

    // Create Momentom wellness record
    const wellnessData: MomentomWellnessData = {
      wellness_id: randomUUID(),
      athlete_id: athleteId,
      date: rhrRecord.day,
      data_type: 'rhr',
      value_json: rhrData,
      source_type: 'garmin',
      metadata: {
        garmin_record_id: rhrRecord.day,
        historical_context_days: historicalContext?.length || 0
      }
    }

    return {
      success: true,
      data: wellnessData,
      warnings,
      errors
    }

  } catch (error) {
    errors.push(`RHR transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { success: false, warnings, errors }
  }
}

/**
 * Transforms GarminDB weight record to Momentom wellness format
 * 
 * @param weightRecord - Raw GarminDB weight record
 * @param athleteId - Target athlete ID
 * @returns Transformation result with validation
 */
export function transformWeightRecord(
  weightRecord: GarminWeightRecord,
  athleteId: string
): WellnessTransformResult {
  const warnings: string[] = []
  const errors: string[] = []

  try {
    // Validate required fields
    if (!weightRecord.day) {
      errors.push('Missing required field: day')
      return { success: false, warnings, errors }
    }

    if (weightRecord.weight === null || weightRecord.weight === undefined) {
      errors.push('Missing required field: weight')
      return { success: false, warnings, errors }
    }

    const weight = weightRecord.weight

    // Validate weight range (reasonable for adult athletes)
    if (weight < 40 || weight > 200) {
      if (weight < 30 || weight > 250) {
        errors.push(`Invalid weight value: ${weight} kg`)
        return { success: false, warnings, errors }
      } else {
        warnings.push(`Unusual weight value: ${weight} kg`)
      }
    }

    // Validate body composition percentages
    if (weightRecord.body_fat !== null && (weightRecord.body_fat < 3 || weightRecord.body_fat > 50)) {
      warnings.push(`Unusual body fat percentage: ${weightRecord.body_fat}%`)
    }

    if (weightRecord.body_water !== null && (weightRecord.body_water < 45 || weightRecord.body_water > 75)) {
      warnings.push(`Unusual body water percentage: ${weightRecord.body_water}%`)
    }

    // Calculate BMI (assuming average height for context - this is approximate)
    // Note: In a real implementation, we'd want to get actual height from user profile
    const estimatedHeight = 1.75 // 175cm average
    const bmi = Math.round((weight / (estimatedHeight * estimatedHeight)) * 10) / 10

    // Create weight data
    const weightData: WeightData = {
      weight_kg: Math.round(weight * 10) / 10, // Round to 1 decimal
      body_fat_percent: weightRecord.body_fat ? Math.round(weightRecord.body_fat * 10) / 10 : null,
      muscle_mass_kg: weightRecord.muscle_mass ? Math.round(weightRecord.muscle_mass * 10) / 10 : null,
      bone_mass_kg: weightRecord.bone_mass ? Math.round(weightRecord.bone_mass * 10) / 10 : null,
      body_water_percent: weightRecord.body_water ? Math.round(weightRecord.body_water * 10) / 10 : null,
      bmi
    }

    // Create Momentom wellness record
    const wellnessData: MomentomWellnessData = {
      wellness_id: randomUUID(),
      athlete_id: athleteId,
      date: weightRecord.day,
      data_type: 'weight',
      value_json: weightData,
      source_type: 'garmin',
      metadata: {
        garmin_record_id: weightRecord.day,
        has_body_composition: !!(weightRecord.body_fat || weightRecord.muscle_mass)
      }
    }

    return {
      success: true,
      data: wellnessData,
      warnings,
      errors
    }

  } catch (error) {
    errors.push(`Weight transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { success: false, warnings, errors }
  }
}

/**
 * Batch transforms multiple wellness records
 * 
 * @param sleepRecords - Array of sleep records
 * @param rhrRecords - Array of RHR records
 * @param weightRecords - Array of weight records
 * @param athleteId - Target athlete ID
 * @returns Batch transformation results
 */
export function transformWellnessBatch(
  sleepRecords: GarminSleepRecord[],
  rhrRecords: GarminRHRRecord[],
  weightRecords: GarminWeightRecord[],
  athleteId: string
): {
  successful: MomentomWellnessData[]
  failed: Array<{ record: any; errors: string[]; type: string }>
  summary: {
    total: number
    successful: number
    failed: number
    sleepCount: number
    rhrCount: number
    weightCount: number
  }
} {
  const successful: MomentomWellnessData[] = []
  const failed: Array<{ record: any; errors: string[]; type: string }> = []

  // Transform sleep records
  for (const sleepRecord of sleepRecords) {
    const result = transformSleepRecord(sleepRecord, athleteId)
    if (result.success && result.data) {
      successful.push(result.data)
    } else {
      failed.push({ record: sleepRecord, errors: result.errors, type: 'sleep' })
    }
  }

  // Transform RHR records with historical context
  const rhrValues = rhrRecords
    .filter(r => r.resting_hr !== null)
    .map(r => r.resting_hr!)
    .reverse() // Oldest first for trend analysis

  for (let i = 0; i < rhrRecords.length; i++) {
    const rhrRecord = rhrRecords[i]
    const historicalContext = rhrValues.slice(Math.max(0, i - 14), i) // Last 14 days
    
    const result = transformRHRRecord(rhrRecord, athleteId, historicalContext)
    if (result.success && result.data) {
      successful.push(result.data)
    } else {
      failed.push({ record: rhrRecord, errors: result.errors, type: 'rhr' })
    }
  }

  // Transform weight records
  for (const weightRecord of weightRecords) {
    const result = transformWeightRecord(weightRecord, athleteId)
    if (result.success && result.data) {
      successful.push(result.data)
    } else {
      failed.push({ record: weightRecord, errors: result.errors, type: 'weight' })
    }
  }

  return {
    successful,
    failed,
    summary: {
      total: sleepRecords.length + rhrRecords.length + weightRecords.length,
      successful: successful.length,
      failed: failed.length,
      sleepCount: sleepRecords.length,
      rhrCount: rhrRecords.length,
      weightCount: weightRecords.length
    }
  }
}

/**
 * Parses time string (HH:MM:SS) to total minutes
 * 
 * @param timeString - Time in HH:MM:SS format
 * @returns Total minutes
 */
function parseTimeStringToMinutes(timeString: string): number {
  if (!timeString) return 0
  
  try {
    const parts = timeString.split(':').map(p => parseInt(p, 10))
    
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts
      return hours * 60 + minutes + Math.round(seconds / 60)
    } else if (parts.length === 2) {
      const [hours, minutes] = parts
      return hours * 60 + minutes
    }
    
    throw new Error(`Invalid time format: ${timeString}`)
  } catch (error) {
    throw new Error(`Failed to parse time string "${timeString}": ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Parses time string to HH:MM format
 * 
 * @param timeString - Time in HH:MM:SS format
 * @returns Time in HH:MM format
 */
function parseTimeToHHMM(timeString: string): string {
  if (!timeString) return ''
  
  try {
    const parts = timeString.split(':')
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
    }
    
    throw new Error(`Invalid time format: ${timeString}`)
  } catch (error) {
    throw new Error(`Failed to parse time to HH:MM "${timeString}": ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validates wellness data quality and completeness
 * 
 * @param wellnessData - Transformed wellness data
 * @returns Validation result with quality score
 */
export function validateWellnessData(wellnessData: MomentomWellnessData): {
  isValid: boolean
  qualityScore: number // 0-100
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []
  let qualityScore = 100

  // Validate basic structure
  if (!wellnessData.wellness_id || !wellnessData.athlete_id || !wellnessData.date) {
    issues.push('Missing required fields')
    qualityScore -= 50
  }

  // Type-specific validation
  if (wellnessData.data_type === 'sleep') {
    const sleepData = wellnessData.value_json as SleepData
    
    if (!sleepData.total_minutes || sleepData.total_minutes < 180) {
      issues.push('Insufficient sleep duration')
      qualityScore -= 20
    }
    
    if (sleepData.efficiency && sleepData.efficiency < 80) {
      recommendations.push('Consider sleep hygiene improvements')
      qualityScore -= 10
    }
  } else if (wellnessData.data_type === 'rhr') {
    const rhrData = wellnessData.value_json as RHRData
    
    if (rhrData.quality === 'poor') {
      recommendations.push('Monitor cardiovascular health')
      qualityScore -= 15
    }
  }

  return {
    isValid: issues.length === 0,
    qualityScore: Math.max(0, qualityScore),
    issues,
    recommendations
  }
}
