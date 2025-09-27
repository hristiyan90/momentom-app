/**
 * TypeScript interfaces for GarminDB data transformation
 * Based on T2 schema analysis in docs/specs/C2-S1-B3e.md
 */

// GarminDB raw activity structure (from T2 analysis)
export interface GarminActivity {
  activity_id: number
  name: string | null
  start_time: string // ISO timestamp
  sport: string
  distance: number | null // kilometers
  moving_time: string | null // HH:MM:SS format
  avg_hr: number | null
  max_hr: number | null
  avg_speed: number | null // km/h
  max_speed: number | null // km/h
  avg_power: number | null // watts
  max_power: number | null // watts
  avg_cadence: number | null
  max_cadence: number | null
  calories: number | null
  training_effect: number | null
  anaerobic_training_effect: number | null
  elevation_gain: number | null // meters
  elevation_loss: number | null // meters
  temperature: number | null // celsius
}

// Momentom session structure (target format)
export interface MomentomSession {
  session_id: string // UUID
  athlete_id: string // UUID
  date: string // YYYY-MM-DD
  sport: 'run' | 'bike' | 'swim' | 'strength' | 'mobility'
  title: string
  actual_duration_min: number
  actual_distance_m: number | null
  status: 'completed'
  source_file_type: 'garmin'
  metadata: {
    garmin_activity_id: number
    performance_metrics?: PerformanceMetrics
    environmental?: EnvironmentalData
  }
}

// Performance metrics structure
export interface PerformanceMetrics {
  heart_rate?: {
    avg_bpm: number
    max_bpm: number
  }
  power?: {
    avg_watts: number
    max_watts: number
  }
  speed?: {
    avg_kmh: number
    max_kmh: number
  }
  cadence?: {
    avg_rpm: number
    max_rpm: number
  }
  calories?: number
  training_effect?: {
    aerobic: number
    anaerobic: number
  }
}

// Environmental data structure
export interface EnvironmentalData {
  elevation_gain_m?: number
  elevation_loss_m?: number
  temperature_c?: number
}

// Sport mapping types
export type GarminSport = 
  | 'running' 
  | 'walking' 
  | 'hiking'
  | 'cycling' 
  | 'swimming' 
  | 'fitness_equipment' 
  | 'snowboarding' 
  | 'rock_climbing'
  | 'UnknownEnumValue_54'

export type MomentomSport = 'run' | 'bike' | 'swim' | 'strength' | 'mobility'

// Transformation result
export interface TransformationResult {
  success: boolean
  session?: MomentomSession
  error?: string
  warnings?: string[]
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Timezone conversion options
export interface TimezoneOptions {
  sourceTimezone?: string
  targetTimezone: 'UTC'
}
