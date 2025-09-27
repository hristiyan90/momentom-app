/**
 * Bulk import service for GarminDB activities
 * Orchestrates the complete import process with filtering, transformation, and progress tracking
 */

import { createClient } from '@/lib/supabase/server'
import { SqliteReader, type ReadResult } from './sqliteReader'
import { ProgressTracker, type ProgressCallback, type ProgressUpdate } from './progressTracker'
import { applyFilters, type FilterOptions, DEFAULT_FILTER_OPTIONS, getFilterStats } from './dataFilters'
import type { GarminActivity } from './dataFilters'

export interface BulkImportOptions {
  athleteId: string
  dbPath: string
  filters?: FilterOptions
  batchSize?: number
  progressCallback?: ProgressCallback
  dryRun?: boolean // For testing without actual database writes
}

export interface BulkImportResult {
  success: boolean
  summary: {
    totalActivities: number
    filteredActivities: number
    successfulImports: number
    failedImports: number
    duplicatesSkipped: number
    processingTime: number
    successRate: number
  }
  filterStats: ReturnType<typeof getFilterStats>
  errors: Array<{
    activityId: number
    error: string
    timestamp: number
  }>
  importedSessionIds: string[] // For potential rollback
}

/**
 * Mock transformation function (placeholder for T3 utilities)
 * This will be replaced with actual transformation utilities when T3 is merged
 */
interface MockMomentomSession {
  session_id: string
  athlete_id: string
  date: string
  sport: 'run' | 'bike' | 'swim' | 'strength' | 'mobility'
  title: string
  actual_duration_min: number
  actual_distance_m: number | null
  status: 'completed'
  source_file_type: 'garmin'
  metadata: {
    garmin_activity_id: number
    [key: string]: any
  }
}

function mockTransformActivity(activity: GarminActivity, athleteId: string): MockMomentomSession {
  // Mock transformation logic - will be replaced with T3 utilities
  const sportMapping: Record<string, 'run' | 'bike' | 'swim' | 'strength' | 'mobility'> = {
    'running': 'run',
    'cycling': 'bike', 
    'swimming': 'swim'
  }

  const sport = sportMapping[activity.sport] || 'strength'
  const durationMin = activity.moving_time ? parseDurationToMinutes(activity.moving_time) : 0
  const distanceM = activity.distance ? Math.round(activity.distance * 1000) : null

  return {
    session_id: `garmin-${activity.activity_id}-${Date.now()}`, // Mock UUID
    athlete_id: athleteId,
    date: activity.start_time.split(' ')[0], // Extract date part
    sport,
    title: activity.name || `${sport.charAt(0).toUpperCase() + sport.slice(1)} Activity`,
    actual_duration_min: durationMin,
    actual_distance_m: distanceM,
    status: 'completed',
    source_file_type: 'garmin',
    metadata: {
      garmin_activity_id: activity.activity_id
    }
  }
}

function parseDurationToMinutes(timeString: string): number {
  const parts = timeString.split(':').map(p => parseInt(p, 10))
  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60)
  }
  return 0
}

/**
 * Main bulk import service class
 */
export class BulkImportService {
  private supabase = createClient()
  private progressTracker?: ProgressTracker

  /**
   * Executes the complete bulk import process
   */
  async importActivities(options: BulkImportOptions): Promise<BulkImportResult> {
    const startTime = Date.now()
    const filters = { ...DEFAULT_FILTER_OPTIONS, ...options.filters }
    const batchSize = options.batchSize || 50
    const importedSessionIds: string[] = []
    const errors: BulkImportResult['errors'] = []

    try {
      // Phase 1: Read and filter activities
      const reader = new SqliteReader({ 
        dbPath: options.dbPath, 
        batchSize,
        filters 
      })

      const readResult = await this.readActivities(reader, filters, options.progressCallback)
      const { activities } = readResult

      // Initialize progress tracker
      this.progressTracker = new ProgressTracker(activities.length, options.progressCallback)
      this.progressTracker.setPhase('transforming', 'Starting transformation...')

      // Phase 2: Transform and import in batches
      const totalBatches = Math.ceil(activities.length / batchSize)
      this.progressTracker.setBatchInfo(totalBatches)

      let successCount = 0
      let duplicateCount = 0

      for (let i = 0; i < activities.length; i += batchSize) {
        const batch = activities.slice(i, i + batchSize)
        const batchIndex = Math.floor(i / batchSize)

        this.progressTracker.setPhase('importing', `Processing batch ${batchIndex + 1}/${totalBatches}`)

        try {
          const batchResult = await this.processBatch(batch, options, batchIndex)
          successCount += batchResult.successCount
          duplicateCount += batchResult.duplicateCount
          importedSessionIds.push(...batchResult.sessionIds)
          errors.push(...batchResult.errors)

          this.progressTracker.updateBatch(batchIndex, batch.length)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown batch error'
          this.progressTracker.recordError(`Batch ${batchIndex + 1} failed: ${errorMessage}`)
          
          // Add errors for all items in failed batch
          batch.forEach(activity => {
            errors.push({
              activityId: activity.activity_id,
              error: errorMessage,
              timestamp: Date.now()
            })
          })
        }
      }

      // Complete the import
      this.progressTracker.complete()

      const processingTime = Date.now() - startTime
      const failedImports = activities.length - successCount - duplicateCount
      const successRate = activities.length > 0 ? Math.round((successCount / activities.length) * 100) : 0

      const result: BulkImportResult = {
        success: errors.length === 0 || successCount > 0,
        summary: {
          totalActivities: readResult.totalCount,
          filteredActivities: activities.length,
          successfulImports: successCount,
          failedImports,
          duplicatesSkipped: duplicateCount,
          processingTime,
          successRate
        },
        filterStats: getFilterStats(readResult.totalCount, activities.length, filters),
        errors,
        importedSessionIds
      }

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (this.progressTracker) {
        this.progressTracker.fail(errorMessage)
      }

      return {
        success: false,
        summary: {
          totalActivities: 0,
          filteredActivities: 0,
          successfulImports: 0,
          failedImports: 0,
          duplicatesSkipped: 0,
          processingTime: Date.now() - startTime,
          successRate: 0
        },
        filterStats: getFilterStats(0, 0, filters),
        errors: [{
          activityId: 0,
          error: errorMessage,
          timestamp: Date.now()
        }],
        importedSessionIds
      }
    }
  }

  /**
   * Reads and filters activities from GarminDB
   */
  private async readActivities(
    reader: SqliteReader, 
    filters: FilterOptions,
    progressCallback?: ProgressCallback
  ): Promise<ReadResult> {
    if (progressCallback) {
      progressCallback({
        progress: {
          phase: 'reading',
          totalItems: 0,
          processedItems: 0,
          successCount: 0,
          errorCount: 0,
          currentBatch: 0,
          totalBatches: 0,
          startTime: Date.now(),
          lastUpdateTime: Date.now(),
          errors: []
        },
        percentage: 0,
        elapsedTime: 0,
        itemsPerSecond: 0,
        message: 'Reading activities from GarminDB...'
      })
    }

    return await reader.readFilteredActivities(filters)
  }

  /**
   * Processes a batch of activities
   */
  private async processBatch(
    activities: GarminActivity[],
    options: BulkImportOptions,
    batchIndex: number
  ): Promise<{
    successCount: number
    duplicateCount: number
    sessionIds: string[]
    errors: BulkImportResult['errors']
  }> {
    const sessionIds: string[] = []
    const errors: BulkImportResult['errors'] = []
    let successCount = 0
    let duplicateCount = 0

    for (const activity of activities) {
      try {
        // Transform activity to Momentom session format
        const session = mockTransformActivity(activity, options.athleteId)

        // Check for duplicates (mock implementation)
        const isDuplicate = await this.checkForDuplicate(activity.activity_id, options.athleteId)
        
        if (isDuplicate) {
          duplicateCount++
          continue
        }

        // Insert session (mock implementation for dry run)
        if (!options.dryRun) {
          const { error } = await this.supabase
            .from('sessions')
            .insert(session)

          if (error) {
            throw new Error(`Database insert failed: ${error.message}`)
          }
        }

        sessionIds.push(session.session_id)
        successCount++

        if (this.progressTracker) {
          this.progressTracker.recordSuccess(activity.activity_id)
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({
          activityId: activity.activity_id,
          error: errorMessage,
          timestamp: Date.now()
        })

        if (this.progressTracker) {
          this.progressTracker.recordError(errorMessage, activity.activity_id)
        }
      }
    }

    return { successCount, duplicateCount, sessionIds, errors }
  }

  /**
   * Checks if an activity has already been imported
   */
  private async checkForDuplicate(activityId: number, athleteId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('sessions')
        .select('session_id')
        .eq('athlete_id', athleteId)
        .eq('source_file_type', 'garmin')
        .contains('metadata', { garmin_activity_id: activityId })
        .limit(1)

      if (error) {
        console.warn(`Duplicate check failed for activity ${activityId}:`, error)
        return false
      }

      return data && data.length > 0
    } catch (error) {
      console.warn(`Duplicate check error for activity ${activityId}:`, error)
      return false
    }
  }

  /**
   * Rolls back imported sessions (for error recovery)
   */
  async rollbackImport(sessionIds: string[], athleteId: string): Promise<{
    success: boolean
    deletedCount: number
    errors: string[]
  }> {
    const errors: string[] = []
    let deletedCount = 0

    try {
      const { error, count } = await this.supabase
        .from('sessions')
        .delete()
        .eq('athlete_id', athleteId)
        .in('session_id', sessionIds)

      if (error) {
        errors.push(`Rollback failed: ${error.message}`)
        return { success: false, deletedCount: 0, errors }
      }

      deletedCount = count || 0

      return {
        success: true,
        deletedCount,
        errors
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown rollback error'
      errors.push(errorMessage)
      
      return {
        success: false,
        deletedCount,
        errors
      }
    }
  }
}

/**
 * Factory function to create BulkImportService instance
 */
export function createBulkImportService(): BulkImportService {
  return new BulkImportService()
}
