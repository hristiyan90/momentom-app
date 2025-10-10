/**
 * SQLite reader utilities for GarminDB data access
 * Reads activities and wellness data from GarminDB SQLite files
 */

import Database from 'better-sqlite3'
import { statSync } from 'fs'
import { FilterOptions, generateSqlFilter, type GarminActivity } from './dataFilters'

export interface SqliteReaderOptions {
  dbPath: string // Path to GarminDB SQLite file
  filters?: FilterOptions
  batchSize?: number
}

export interface ReadResult {
  activities: GarminActivity[]
  totalCount: number
  filteredCount: number
  executionTime: number
}

/**
 * Mock SQLite reader for development (will be replaced with actual SQLite integration)
 * This provides the interface and structure for the real implementation
 */
export class SqliteReader {
  private dbPath: string
  private batchSize: number

  constructor(options: SqliteReaderOptions) {
    this.dbPath = options.dbPath
    this.batchSize = options.batchSize || 100
  }

  /**
   * Reads filtered activities from GarminDB SQLite database
   * 
   * @param filters - Filter options for data selection
   * @returns Promise with read results
   */
  async readFilteredActivities(filters?: FilterOptions): Promise<ReadResult> {
    const startTime = Date.now()
    
    try {
      // Open SQLite database connection
      const db = new Database(this.dbPath, { readonly: true, fileMustExist: true })
      
      // Build SQL query with filters
      const { whereClause, params } = generateSqlFilter(filters)
      const sql = `
        SELECT 
          activity_id,
          name,
          sport,
          start_time,
          moving_time,
          distance,
          avg_hr,
          max_hr,
          calories,
          ascent,
          descent,
          avg_temperature
        FROM activities
        ${whereClause ? `WHERE ${whereClause}` : ''}
        ORDER BY start_time DESC
        ${filters?.limit ? `LIMIT ${filters.limit}` : ''}
      `
      
      // Execute query
      const stmt = db.prepare(sql)
      const rows = stmt.all(params) as GarminActivity[]
      
      // Get total count without limit
      const countSql = `SELECT COUNT(*) as count FROM activities ${whereClause ? `WHERE ${whereClause}` : ''}`
      const countStmt = db.prepare(countSql)
      const countResult = countStmt.get(params) as { count: number }
      
      db.close()
      
      const result: ReadResult = {
        activities: rows,
        totalCount: countResult.count,
        filteredCount: rows.length,
        executionTime: Date.now() - startTime
      }

      return result
    } catch (error) {
      throw new Error(`Failed to read activities from ${this.dbPath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Reads activities in batches for memory-efficient processing
   * 
   * @param filters - Filter options
   * @param batchCallback - Callback function for each batch
   * @returns Promise with total processing results
   */
  async readActivitiesInBatches(
    filters: FilterOptions | undefined,
    batchCallback: (batch: GarminActivity[], batchIndex: number) => Promise<void>
  ): Promise<ReadResult> {
    const result = await this.readFilteredActivities(filters)
    const { activities } = result
    
    // Process in batches
    for (let i = 0; i < activities.length; i += this.batchSize) {
      const batch = activities.slice(i, i + this.batchSize)
      const batchIndex = Math.floor(i / this.batchSize)
      
      await batchCallback(batch, batchIndex)
    }
    
    return result
  }

  /**
   * Validates SQLite database file accessibility
   * 
   * @returns Promise<boolean> indicating if database is accessible
   */
  async validateDatabase(): Promise<boolean> {
    try {
      // TODO: Replace with actual SQLite file validation
      // For now, just check if path is provided
      return this.dbPath && this.dbPath.length > 0
    } catch (error) {
      return false
    }
  }

  /**
   * Gets database metadata and statistics
   * 
   * @returns Promise with database information
   */
  async getDatabaseInfo(): Promise<{
    path: string
    size: number
    activityCount: number
    dateRange: { start: string; end: string }
    sports: string[]
  }> {
    try {
      const db = new Database(this.dbPath, { readonly: true, fileMustExist: true })
      
      // Get activity count
      const countResult = db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number }
      
      // Get date range
      const dateRangeResult = db.prepare('SELECT MIN(start_time) as start, MAX(start_time) as end FROM activities').get() as { start: string; end: string }
      
      // Get distinct sports
      const sportsResult = db.prepare('SELECT DISTINCT sport FROM activities WHERE sport IS NOT NULL').all() as { sport: string }[]
      
      // Get file size
      const stats = statSync(this.dbPath)
      
      db.close()
      
      return {
        path: this.dbPath,
        size: stats.size,
        activityCount: countResult.count,
        dateRange: {
          start: dateRangeResult.start?.split(' ')[0] || '',
          end: dateRangeResult.end?.split(' ')[0] || ''
        },
        sports: sportsResult.map(r => r.sport)
      }
    } catch (error) {
      throw new Error(`Failed to get database info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generates mock activities for development and testing
   * This will be removed when actual SQLite integration is implemented
   */
  private generateMockActivities(filters?: FilterOptions): GarminActivity[] {
    const mockActivities: GarminActivity[] = []
    const sports = filters?.sports || ['running', 'cycling', 'swimming']
    const startDate = new Date(filters?.startDate || '2024-06-01')
    const endDate = new Date(filters?.endDate || '2025-08-31')
    
    // Generate mock activities within the filtered timeframe
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const targetCount = Math.min(filters?.limit || 300, 300) // Target ~300 activities
    
    for (let i = 0; i < targetCount; i++) {
      const randomDays = Math.floor(Math.random() * daysDiff)
      const activityDate = new Date(startDate.getTime() + (randomDays * 24 * 60 * 60 * 1000))
      const sport = sports[Math.floor(Math.random() * sports.length)]
      
      mockActivities.push({
        activity_id: 1000000 + i,
        name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Activity ${i + 1}`,
        start_time: activityDate.toISOString().replace('T', ' ').replace('.000Z', ''),
        sport: sport,
        distance: sport === 'swimming' ? Math.random() * 3 : Math.random() * 50,
        moving_time: `${Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
      })
    }
    
    return mockActivities.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
  }
}

/**
 * Factory function to create SqliteReader instance
 * 
 * @param dbPath - Path to GarminDB SQLite file
 * @param options - Additional reader options
 * @returns SqliteReader instance
 */
export function createSqliteReader(dbPath: string, options?: Partial<SqliteReaderOptions>): SqliteReader {
  return new SqliteReader({
    dbPath,
    batchSize: 50, // Default batch size for T4
    ...options
  })
}

/**
 * Utility function to get the expected GarminDB file paths
 * Based on T1 implementation results
 */
export function getGarminDbPaths(baseDir: string = '~/.GarminDb'): {
  activities: string
  monitoring: string
  main: string
  summary: string
} {
  return {
    activities: `${baseDir}/garmin_activities.db`,
    monitoring: `${baseDir}/garmin_monitoring.db`, 
    main: `${baseDir}/garmin.db`,
    summary: `${baseDir}/garmin_summary.db`
  }
}
