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

// GarminDB wellness data structures (from monitoring databases)
export interface GarminSleepRecord {
  day: string // YYYY-MM-DD
  total_sleep: string | null // HH:MM:SS format
  deep_sleep: string | null
  light_sleep: string | null
  rem_sleep: string | null
  awake: string | null
  sleep_score: number | null
  bedtime: string | null // HH:MM:SS
  wake_time: string | null // HH:MM:SS
}

export interface GarminRHRRecord {
  day: string // YYYY-MM-DD
  resting_hr: number | null
}

export interface GarminWeightRecord {
  day: string // YYYY-MM-DD
  weight: number | null // kg
  body_fat: number | null // percentage
  muscle_mass: number | null // kg
  bone_mass: number | null // kg
  body_water: number | null // percentage
}

// Momentom wellness data structure (target format)
export interface MomentomWellnessData {
  wellness_id: string // UUID
  athlete_id: string // UUID
  date: string // YYYY-MM-DD
  data_type: 'sleep' | 'rhr' | 'weight'
  value_json: SleepData | RHRData | WeightData
  source_type: 'garmin'
  metadata?: {
    garmin_record_id?: string
    quality_score?: number
    [key: string]: any
  }
  created_at?: string
  updated_at?: string
}

// Wellness data value structures
export interface SleepData {
  total_minutes: number
  deep_minutes: number | null
  light_minutes: number | null
  rem_minutes: number | null
  awake_minutes: number | null
  efficiency: number | null // percentage
  score: number | null // 0-100
  bedtime?: string // HH:MM format
  wake_time?: string // HH:MM format
}

export interface RHRData {
  bpm: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  trend: 'improving' | 'stable' | 'declining' | null
}

export interface WeightData {
  weight_kg: number
  body_fat_percent: number | null
  muscle_mass_kg: number | null
  bone_mass_kg: number | null
  body_water_percent: number | null
  bmi?: number
}

// Wellness transformation result
export interface WellnessTransformResult {
  success: boolean
  data?: MomentomWellnessData
  warnings: string[]
  errors: string[]
}

// Wellness batch processing result
export interface WellnessBatchResult {
  total_processed: number
  successful_imports: number
  failed_imports: number
  sleep_records: number
  rhr_records: number
  weight_records: number
  processing_time_ms: number
  errors: Array<{
    record_id: string
    error: string
    data_type: string
  }>
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
