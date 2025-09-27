/**
 * GarminDB wellness data reader for monitoring databases
 * Reads sleep, RHR, and weight data from garmin.db and garmin_monitoring.db
 */

import type { 
  GarminSleepRecord, 
  GarminRHRRecord, 
  GarminWeightRecord 
} from './types'

export interface WellnessReaderOptions {
  garminDbPath: string // Path to garmin.db (sleep, weight)
  monitoringDbPath: string // Path to garmin_monitoring.db (RHR)
  dateRange?: {
    startDate: string // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
  }
}

export interface WellnessReadResult {
  sleepRecords: GarminSleepRecord[]
  rhrRecords: GarminRHRRecord[]
  weightRecords: GarminWeightRecord[]
  totalRecords: number
  readTime: number
}

/**
 * Mock wellness reader for development (will be replaced with actual SQLite integration)
 * This provides the interface and structure for the real implementation
 */
export class WellnessReader {
  private garminDbPath: string
  private monitoringDbPath: string
  private dateRange?: { startDate: string; endDate: string }

  constructor(options: WellnessReaderOptions) {
    this.garminDbPath = options.garminDbPath
    this.monitoringDbPath = options.monitoringDbPath
    this.dateRange = options.dateRange
  }

  /**
   * Reads all wellness data from GarminDB monitoring databases
   * 
   * @returns Promise with all wellness records
   */
  async readAllWellnessData(): Promise<WellnessReadResult> {
    const startTime = Date.now()
    
    try {
      // TODO: Replace with actual SQLite integration
      // For now, return mock data structure based on T2 analysis
      const [sleepRecords, rhrRecords, weightRecords] = await Promise.all([
        this.readSleepData(),
        this.readRestingHRData(),
        this.readWeightData()
      ])

      const result: WellnessReadResult = {
        sleepRecords,
        rhrRecords,
        weightRecords,
        totalRecords: sleepRecords.length + rhrRecords.length + weightRecords.length,
        readTime: Date.now() - startTime
      }

      return result
    } catch (error) {
      throw new Error(`Failed to read wellness data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Reads sleep data from garmin.db sleep table
   * 
   * @returns Promise with sleep records
   */
  async readSleepData(): Promise<GarminSleepRecord[]> {
    try {
      // TODO: Replace with actual SQLite query
      // SELECT day, total_sleep, deep_sleep, light_sleep, rem_sleep, awake, 
      //        sleep_score, bedtime, wake_time 
      // FROM sleep 
      // WHERE day BETWEEN ? AND ?
      // ORDER BY day DESC
      
      return this.generateMockSleepData()
    } catch (error) {
      throw new Error(`Failed to read sleep data from ${this.garminDbPath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Reads resting heart rate data from garmin_monitoring.db
   * 
   * @returns Promise with RHR records
   */
  async readRestingHRData(): Promise<GarminRHRRecord[]> {
    try {
      // TODO: Replace with actual SQLite query
      // SELECT day, resting_hr 
      // FROM resting_hr 
      // WHERE day BETWEEN ? AND ? AND resting_hr IS NOT NULL
      // ORDER BY day DESC
      
      return this.generateMockRHRData()
    } catch (error) {
      throw new Error(`Failed to read RHR data from ${this.monitoringDbPath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Reads weight data from garmin.db weight table
   * 
   * @returns Promise with weight records
   */
  async readWeightData(): Promise<GarminWeightRecord[]> {
    try {
      // TODO: Replace with actual SQLite query
      // SELECT day, weight, body_fat, muscle_mass, bone_mass, body_water 
      // FROM weight 
      // WHERE day BETWEEN ? AND ? AND weight IS NOT NULL
      // ORDER BY day DESC
      
      return this.generateMockWeightData()
    } catch (error) {
      throw new Error(`Failed to read weight data from ${this.garminDbPath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validates database file accessibility
   * 
   * @returns Promise<boolean> indicating if databases are accessible
   */
  async validateDatabases(): Promise<{
    garminDb: boolean
    monitoringDb: boolean
    errors: string[]
  }> {
    const errors: string[] = []
    
    try {
      // TODO: Replace with actual SQLite file validation
      const garminDb = !!(this.garminDbPath && this.garminDbPath.length > 0)
      const monitoringDb = !!(this.monitoringDbPath && this.monitoringDbPath.length > 0)
      
      if (!garminDb) {
        errors.push('Invalid garmin.db path')
      }
      if (!monitoringDb) {
        errors.push('Invalid garmin_monitoring.db path')
      }
      
      return {
        garminDb,
        monitoringDb,
        errors
      }
    } catch (error) {
      errors.push(`Database validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        garminDb: false,
        monitoringDb: false,
        errors
      }
    }
  }

  /**
   * Gets database statistics and metadata
   * 
   * @returns Promise with database information
   */
  async getDatabaseStats(): Promise<{
    garminDb: {
      path: string
      sleepRecords: number
      weightRecords: number
      dateRange: { start: string; end: string }
    }
    monitoringDb: {
      path: string
      rhrRecords: number
      dateRange: { start: string; end: string }
    }
  }> {
    // TODO: Replace with actual database introspection
    return {
      garminDb: {
        path: this.garminDbPath,
        sleepRecords: 1000,
        weightRecords: 500,
        dateRange: {
          start: '2021-09-10',
          end: '2025-08-29'
        }
      },
      monitoringDb: {
        path: this.monitoringDbPath,
        rhrRecords: 500,
        dateRange: {
          start: '2021-09-10',
          end: '2025-08-29'
        }
      }
    }
  }

  /**
   * Generates mock sleep data for development and testing
   * This will be removed when actual SQLite integration is implemented
   */
  private generateMockSleepData(): GarminSleepRecord[] {
    const records: GarminSleepRecord[] = []
    const startDate = new Date(this.dateRange?.startDate || '2024-06-01')
    const endDate = new Date(this.dateRange?.endDate || '2025-08-31')
    
    // Generate daily sleep records
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Generate realistic sleep data
      const totalSleepMinutes = 420 + Math.floor(Math.random() * 120) // 7-9 hours
      const deepSleepMinutes = Math.floor(totalSleepMinutes * (0.15 + Math.random() * 0.1)) // 15-25%
      const remSleepMinutes = Math.floor(totalSleepMinutes * (0.20 + Math.random() * 0.1)) // 20-30%
      const lightSleepMinutes = totalSleepMinutes - deepSleepMinutes - remSleepMinutes - 15 // Rest minus awake
      const awakeMinutes = 10 + Math.floor(Math.random() * 10) // 10-20 minutes
      
      records.push({
        day: dateStr,
        total_sleep: this.minutesToTimeString(totalSleepMinutes),
        deep_sleep: this.minutesToTimeString(deepSleepMinutes),
        light_sleep: this.minutesToTimeString(lightSleepMinutes),
        rem_sleep: this.minutesToTimeString(remSleepMinutes),
        awake: this.minutesToTimeString(awakeMinutes),
        sleep_score: 70 + Math.floor(Math.random() * 25), // 70-95
        bedtime: '22:30:00',
        wake_time: '06:30:00'
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return records.reverse() // Most recent first
  }

  /**
   * Generates mock RHR data for development and testing
   */
  private generateMockRHRData(): GarminRHRRecord[] {
    const records: GarminRHRRecord[] = []
    const startDate = new Date(this.dateRange?.startDate || '2024-06-01')
    const endDate = new Date(this.dateRange?.endDate || '2025-08-31')
    
    const currentDate = new Date(startDate)
    let baseRHR = 52 // Starting RHR
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Add some natural variation
      const variation = Math.floor(Math.random() * 6) - 3 // -3 to +3
      const rhr = Math.max(45, Math.min(65, baseRHR + variation))
      
      records.push({
        day: dateStr,
        resting_hr: rhr
      })
      
      // Slight trend over time
      if (Math.random() > 0.8) {
        baseRHR += Math.random() > 0.5 ? 1 : -1
        baseRHR = Math.max(48, Math.min(58, baseRHR))
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return records.reverse() // Most recent first
  }

  /**
   * Generates mock weight data for development and testing
   */
  private generateMockWeightData(): GarminWeightRecord[] {
    const records: GarminWeightRecord[] = []
    const startDate = new Date(this.dateRange?.startDate || '2024-06-01')
    const endDate = new Date(this.dateRange?.endDate || '2025-08-31')
    
    const currentDate = new Date(startDate)
    let baseWeight = 75.0 // Starting weight in kg
    
    // Generate weight records every few days (not daily)
    while (currentDate <= endDate) {
      if (Math.random() > 0.7) { // ~30% chance of weight measurement
        const dateStr = currentDate.toISOString().split('T')[0]
        
        // Add some natural variation
        const variation = (Math.random() - 0.5) * 2 // -1 to +1 kg
        const weight = Math.round((baseWeight + variation) * 10) / 10
        
        records.push({
          day: dateStr,
          weight: weight,
          body_fat: 12 + Math.random() * 3, // 12-15%
          muscle_mass: weight * (0.45 + Math.random() * 0.05), // 45-50% of body weight
          bone_mass: weight * 0.15, // ~15% of body weight
          body_water: 55 + Math.random() * 5 // 55-60%
        })
        
        // Slight trend over time
        if (Math.random() > 0.9) {
          baseWeight += (Math.random() - 0.5) * 0.5
          baseWeight = Math.max(70, Math.min(80, baseWeight))
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return records.reverse() // Most recent first
  }

  /**
   * Converts minutes to HH:MM:SS time string format
   */
  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`
  }
}

/**
 * Factory function to create WellnessReader instance
 * 
 * @param garminDbPath - Path to garmin.db file
 * @param monitoringDbPath - Path to garmin_monitoring.db file
 * @param options - Additional reader options
 * @returns WellnessReader instance
 */
export function createWellnessReader(
  garminDbPath: string, 
  monitoringDbPath: string, 
  options?: Partial<WellnessReaderOptions>
): WellnessReader {
  return new WellnessReader({
    garminDbPath,
    monitoringDbPath,
    ...options
  })
}

/**
 * Utility function to get the expected GarminDB wellness file paths
 * Based on T1 implementation results
 */
export function getGarminWellnessDbPaths(baseDir: string = '~/.GarminDb'): {
  garminDb: string
  monitoringDb: string
} {
  return {
    garminDb: `${baseDir}/garmin.db`,
    monitoringDb: `${baseDir}/garmin_monitoring.db`
  }
}
