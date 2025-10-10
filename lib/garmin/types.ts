/**
 * TypeScript interfaces for GarminDB data transformation and sync automation
 * Based on T2 schema analysis in docs/specs/C2-S1-B3e.md
 * T6: Added sync configuration and history types
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
  metadata?: { // Optional - current sessions table schema doesn't support this field
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

// ============================================================================
// T6: SYNC AUTOMATION TYPES
// ============================================================================

// Sync configuration (matches database schema)
export interface GarminSyncConfig {
  config_id: string
  athlete_id: string
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'manual_only'
  preferred_time: string // HH:MM:SS format
  data_types: ('activities' | 'wellness')[]
  garmin_db_path?: string | null
  garmin_monitoring_db_path?: string | null
  last_sync_at?: string | null // ISO timestamp
  next_sync_at?: string | null // ISO timestamp
  created_at: string
  updated_at: string
}

// Sync configuration input (for API requests)
export interface SyncConfigInput {
  enabled?: boolean
  frequency?: 'daily' | 'weekly' | 'manual_only'
  preferred_time?: string // HH:MM:SS format
  data_types?: ('activities' | 'wellness')[]
  garmin_db_path?: string | null
  garmin_monitoring_db_path?: string | null
}

// Sync history record (matches database schema)
export interface GarminSyncHistory {
  sync_id: string
  athlete_id: string
  sync_type: 'scheduled' | 'manual'
  data_types: ('activities' | 'wellness')[]
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string // ISO timestamp
  completed_at?: string | null // ISO timestamp
  duration_ms?: number | null
  activities_imported: number
  wellness_records_imported: number
  activities_skipped: number
  wellness_skipped: number
  errors: string[] // JSON array of error messages
  metadata: Record<string, any> // Additional sync metadata
  created_at: string
}

// Sync operation request
export interface SyncRequest {
  sync_type: 'manual' // Only manual triggers via API
  data_types?: ('activities' | 'wellness')[]
  force_refresh?: boolean // Ignore last_sync_at and sync all data
  dry_run?: boolean // Test sync without importing
}

// Sync operation result
export interface SyncResult {
  sync_id: string
  success: boolean
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string
  duration_ms?: number
  activities_imported: number
  wellness_records_imported: number
  activities_skipped: number
  wellness_skipped: number
  errors: string[]
  metadata: Record<string, any>
}

// Sync status response (for polling)
export interface SyncStatus {
  sync_id?: string
  is_running: boolean
  current_sync?: GarminSyncHistory
  last_completed_sync?: GarminSyncHistory
  next_scheduled_sync?: string | null // ISO timestamp
  config: GarminSyncConfig
}

// Sync scheduler options
export interface SchedulerOptions {
  enabled: boolean
  check_interval_minutes?: number // How often to check for due syncs
  max_concurrent_syncs?: number // Limit concurrent sync operations
  retry_failed_syncs?: boolean
  retry_delay_minutes?: number
}

// Background sync service options
export interface BackgroundSyncOptions {
  athlete_id: string
  sync_type: 'scheduled' | 'manual'
  data_types: ('activities' | 'wellness')[]
  force_refresh?: boolean
  dry_run?: boolean
  config?: GarminSyncConfig // Pre-fetched config to avoid extra DB call
}
