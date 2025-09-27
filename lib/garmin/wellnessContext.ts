/**
 * Wellness context utilities for readiness API enhancement
 * Provides historical wellness data context for readiness calculations
 */

import { serverClient } from '@/lib/supabase/server'
import type { SleepData, RHRData, WeightData } from './types'

export interface WellnessContext {
  sleep?: {
    recent: SleepData | null
    trend: 'improving' | 'stable' | 'declining' | null
    average_duration: number | null
    average_efficiency: number | null
  }
  rhr?: {
    recent: RHRData | null
    trend: 'improving' | 'stable' | 'declining' | null
    average_bpm: number | null
    baseline_bpm: number | null
  }
  weight?: {
    recent: WeightData | null
    trend: 'increasing' | 'stable' | 'decreasing' | null
    change_7d: number | null
    change_30d: number | null
  }
  data_quality: {
    sleep_days: number
    rhr_days: number
    weight_days: number
    completeness: number // 0-100%
  }
}

/**
 * Gets wellness context for a specific date and athlete
 * 
 * @param athleteId - Athlete ID
 * @param date - Target date (YYYY-MM-DD)
 * @param lookbackDays - Number of days to look back for context (default: 30)
 * @returns Wellness context data
 */
export async function getWellnessContext(
  athleteId: string,
  date: string,
  lookbackDays: number = 30
): Promise<WellnessContext | null> {
  try {
    const supabase = serverClient()
    
    // Calculate date range for lookback
    const targetDate = new Date(date)
    const startDate = new Date(targetDate)
    startDate.setDate(startDate.getDate() - lookbackDays)
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = date

    // Query wellness data for the period
    const { data: wellnessData, error } = await supabase
      .from('wellness_data')
      .select('date, data_type, value_json, created_at')
      .eq('athlete_id', athleteId)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: false })

    if (error) {
      console.warn('Failed to fetch wellness context:', error)
      return null
    }

    if (!wellnessData || wellnessData.length === 0) {
      return null
    }

    // Separate data by type
    const sleepRecords = wellnessData.filter(w => w.data_type === 'sleep')
    const rhrRecords = wellnessData.filter(w => w.data_type === 'rhr')
    const weightRecords = wellnessData.filter(w => w.data_type === 'weight')

    // Build wellness context
    const context: WellnessContext = {
      sleep: buildSleepContext(sleepRecords),
      rhr: buildRHRContext(rhrRecords),
      weight: buildWeightContext(weightRecords),
      data_quality: {
        sleep_days: sleepRecords.length,
        rhr_days: rhrRecords.length,
        weight_days: weightRecords.length,
        completeness: Math.round(
          ((sleepRecords.length + rhrRecords.length + weightRecords.length) / (lookbackDays * 3)) * 100
        )
      }
    }

    return context

  } catch (error) {
    console.error('Error getting wellness context:', error)
    return null
  }
}

/**
 * Builds sleep context from wellness records
 */
function buildSleepContext(sleepRecords: any[]): WellnessContext['sleep'] {
  if (sleepRecords.length === 0) return undefined

  const recent = sleepRecords[0]?.value_json as SleepData | null
  
  // Calculate averages
  const totalMinutes = sleepRecords
    .map(r => (r.value_json as SleepData).total_minutes)
    .filter(m => m > 0)
  
  const efficiencies = sleepRecords
    .map(r => (r.value_json as SleepData).efficiency)
    .filter(e => e !== null && e !== undefined)

  const averageDuration = totalMinutes.length > 0 
    ? Math.round(totalMinutes.reduce((a, b) => a + b, 0) / totalMinutes.length)
    : null

  const averageEfficiency = efficiencies.length > 0
    ? Math.round((efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length) * 10) / 10
    : null

  // Determine trend (compare first half vs second half)
  let trend: 'improving' | 'stable' | 'declining' | null = null
  if (totalMinutes.length >= 6) {
    const midpoint = Math.floor(totalMinutes.length / 2)
    const recentAvg = totalMinutes.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint
    const olderAvg = totalMinutes.slice(midpoint).reduce((a, b) => a + b, 0) / (totalMinutes.length - midpoint)
    
    if (recentAvg > olderAvg + 15) { // 15+ minutes improvement
      trend = 'improving'
    } else if (recentAvg < olderAvg - 15) { // 15+ minutes decline
      trend = 'declining'
    } else {
      trend = 'stable'
    }
  }

  return {
    recent,
    trend,
    average_duration: averageDuration,
    average_efficiency: averageEfficiency
  }
}

/**
 * Builds RHR context from wellness records
 */
function buildRHRContext(rhrRecords: any[]): WellnessContext['rhr'] {
  if (rhrRecords.length === 0) return undefined

  const recent = rhrRecords[0]?.value_json as RHRData | null
  
  // Calculate averages and baseline
  const bpmValues = rhrRecords
    .map(r => (r.value_json as RHRData).bpm)
    .filter(bpm => bpm > 0)

  const averageBpm = bpmValues.length > 0
    ? Math.round(bpmValues.reduce((a, b) => a + b, 0) / bpmValues.length)
    : null

  // Baseline is the median of the oldest 7 days (if available)
  const baselineBpm = bpmValues.length >= 7
    ? Math.round(bpmValues.slice(-7).sort((a, b) => a - b)[3]) // Median of last 7
    : averageBpm

  // Determine trend
  let trend: 'improving' | 'stable' | 'declining' | null = null
  if (bpmValues.length >= 6) {
    const midpoint = Math.floor(bpmValues.length / 2)
    const recentAvg = bpmValues.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint
    const olderAvg = bpmValues.slice(midpoint).reduce((a, b) => a + b, 0) / (bpmValues.length - midpoint)
    
    if (recentAvg < olderAvg - 2) { // 2+ bpm improvement (lower is better)
      trend = 'improving'
    } else if (recentAvg > olderAvg + 2) { // 2+ bpm decline
      trend = 'declining'
    } else {
      trend = 'stable'
    }
  }

  return {
    recent,
    trend,
    average_bpm: averageBpm,
    baseline_bpm: baselineBpm
  }
}

/**
 * Builds weight context from wellness records
 */
function buildWeightContext(weightRecords: any[]): WellnessContext['weight'] {
  if (weightRecords.length === 0) return undefined

  const recent = weightRecords[0]?.value_json as WeightData | null
  
  // Calculate weight changes
  const weights = weightRecords
    .map(r => ({ 
      date: r.date, 
      weight: (r.value_json as WeightData).weight_kg 
    }))
    .filter(w => w.weight > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  let change7d: number | null = null
  let change30d: number | null = null
  let trend: 'increasing' | 'stable' | 'decreasing' | null = null

  if (weights.length >= 2) {
    const currentWeight = weights[0].weight
    
    // Find weight ~7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const weight7d = weights.find(w => new Date(w.date) <= sevenDaysAgo)
    if (weight7d) {
      change7d = Math.round((currentWeight - weight7d.weight) * 10) / 10
    }

    // Find weight ~30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const weight30d = weights.find(w => new Date(w.date) <= thirtyDaysAgo)
    if (weight30d) {
      change30d = Math.round((currentWeight - weight30d.weight) * 10) / 10
    }

    // Determine trend based on 7-day change
    if (change7d !== null) {
      if (change7d > 0.5) {
        trend = 'increasing'
      } else if (change7d < -0.5) {
        trend = 'decreasing'
      } else {
        trend = 'stable'
      }
    }
  }

  return {
    recent,
    trend,
    change_7d: change7d,
    change_30d: change30d
  }
}

/**
 * Enhances readiness response with wellness context
 * 
 * @param readinessData - Original readiness response
 * @param wellnessContext - Wellness context data
 * @returns Enhanced readiness response
 */
export function enhanceReadinessWithWellness(
  readinessData: any,
  wellnessContext: WellnessContext | null
): any {
  if (!wellnessContext) {
    return readinessData
  }

  // Add wellness_context to the response (optional field)
  return {
    ...readinessData,
    wellness_context: {
      sleep: wellnessContext.sleep ? {
        recent_duration_min: wellnessContext.sleep.recent?.total_minutes,
        recent_efficiency: wellnessContext.sleep.recent?.efficiency,
        average_duration_min: wellnessContext.sleep.average_duration,
        trend: wellnessContext.sleep.trend
      } : null,
      rhr: wellnessContext.rhr ? {
        recent_bpm: wellnessContext.rhr.recent?.bpm,
        average_bpm: wellnessContext.rhr.average_bpm,
        baseline_bpm: wellnessContext.rhr.baseline_bpm,
        trend: wellnessContext.rhr.trend
      } : null,
      weight: wellnessContext.weight ? {
        recent_kg: wellnessContext.weight.recent?.weight_kg,
        change_7d_kg: wellnessContext.weight.change_7d,
        trend: wellnessContext.weight.trend
      } : null,
      data_availability: {
        sleep_days: wellnessContext.data_quality.sleep_days,
        rhr_days: wellnessContext.data_quality.rhr_days,
        weight_days: wellnessContext.data_quality.weight_days,
        completeness_percent: wellnessContext.data_quality.completeness
      }
    }
  }
}
