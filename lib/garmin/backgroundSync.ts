/**
 * Background Sync Service
 * Handles the actual sync operations by orchestrating existing import APIs
 * T6: Scheduled Sync and Automation
 */

import { serverClient } from '@/lib/supabase/server'
import { BackgroundSyncOptions, SyncResult } from './types'

export class BackgroundSyncService {
  
  /**
   * Main entry point for syncing user data
   * Creates sync history record and orchestrates the sync process
   */
  async syncUserData(options: BackgroundSyncOptions): Promise<SyncResult> {
    const supabase = serverClient()
    const startTime = Date.now()

    // Create initial sync history record
    const { data: syncRecord, error: createError } = await supabase
      .from('garmin_sync_history')
      .insert({
        athlete_id: options.athlete_id,
        sync_type: options.sync_type,
        data_types: options.data_types,
        status: 'running',
        started_at: new Date().toISOString(),
        metadata: {
          force_refresh: options.force_refresh || false,
          dry_run: options.dry_run || false,
          config_snapshot: options.config ? {
            frequency: options.config.frequency,
            preferred_time: options.config.preferred_time,
            garmin_db_path: options.config.garmin_db_path,
            garmin_monitoring_db_path: options.config.garmin_monitoring_db_path
          } : null
        }
      })
      .select()
      .single()

    if (createError || !syncRecord) {
      throw new Error(`Failed to create sync history record: ${createError?.message}`)
    }

    const syncId = syncRecord.sync_id
    // eslint-disable-next-line prefer-const
    let result: SyncResult = {
      sync_id: syncId,
      success: false,
      status: 'running',
      started_at: syncRecord.started_at,
      activities_imported: 0,
      wellness_records_imported: 0,
      activities_skipped: 0,
      wellness_skipped: 0,
      errors: [],
      metadata: syncRecord.metadata as Record<string, any>
    }

    try {
      // Perform the actual sync operations
      if (options.data_types.includes('activities')) {
        const activityResult = await this.syncActivities(options)
        result.activities_imported = activityResult.imported
        result.activities_skipped = activityResult.skipped
        result.errors.push(...activityResult.errors)
      }

      if (options.data_types.includes('wellness')) {
        const wellnessResult = await this.syncWellnessData(options)
        result.wellness_records_imported = wellnessResult.imported
        result.wellness_skipped = wellnessResult.skipped
        result.errors.push(...wellnessResult.errors)
      }

      // Determine final status
      const hasErrors = result.errors.length > 0
      const hasImports = result.activities_imported > 0 || result.wellness_records_imported > 0
      
      result.success = !hasErrors || hasImports // Success if no errors OR some data was imported
      result.status = hasErrors ? (hasImports ? 'completed' : 'failed') : 'completed'
      result.completed_at = new Date().toISOString()
      result.duration_ms = Date.now() - startTime

      // Update sync history record
      await supabase
        .from('garmin_sync_history')
        .update({
          status: result.status,
          completed_at: result.completed_at,
          duration_ms: result.duration_ms,
          activities_imported: result.activities_imported,
          wellness_records_imported: result.wellness_records_imported,
          activities_skipped: result.activities_skipped,
          wellness_skipped: result.wellness_skipped,
          errors: result.errors,
          metadata: result.metadata
        })
        .eq('sync_id', syncId)

      return result

    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : String(error)
      result.errors.push(`Sync failed: ${errorMessage}`)
      result.status = 'failed'
      result.completed_at = new Date().toISOString()
      result.duration_ms = Date.now() - startTime

      // Update sync history with error
      await supabase
        .from('garmin_sync_history')
        .update({
          status: 'failed',
          completed_at: result.completed_at,
          duration_ms: result.duration_ms,
          errors: result.errors,
          metadata: result.metadata
        })
        .eq('sync_id', syncId)

      return result
    }
  }

  /**
   * Sync activities using the existing bulk-import API
   */
  private async syncActivities(
    options: BackgroundSyncOptions
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    try {
      // Prepare bulk import request
      const importRequest = {
        filters: this.buildActivityFilters(options),
        dryRun: options.dry_run || false,
        batchSize: 50 // Conservative batch size for background processing
      }

      // Call the existing bulk import service
      // Note: We need to import and use the BulkImportService from T4
      const { BulkImportService } = await import('./bulkImport')
      const importService = new BulkImportService()
      
      const importOptions = {
        athleteId: options.athlete_id,
        dbPath: options.config?.garmin_db_path || this.getDefaultGarminDbPath(),
        filters: importRequest.filters,
        batchSize: importRequest.batchSize,
        dryRun: importRequest.dryRun,
        supabaseClient: this.supabase // Pass authenticated client
      }

      const result = await importService.importActivities(importOptions)

      return {
        imported: result.summary.successfulImports,
        skipped: result.summary.duplicateSkips + result.summary.filteredOut,
        errors: result.errors.map(e => `Activity import: ${e.error}`)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        imported: 0,
        skipped: 0,
        errors: [`Activity sync failed: ${errorMessage}`]
      }
    }
  }

  /**
   * Sync wellness data using the existing wellness-import logic
   */
  private async syncWellnessData(
    options: BackgroundSyncOptions
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    try {
      // Prepare wellness import request
      const dateRange = this.buildWellnessDateRange(options)
      
      // Use the existing wellness import logic
      const { WellnessReader } = await import('./wellnessReader')
      const { transformWellnessBatch } = await import('./wellnessTransform')
      
      // For wellness data, we need garmin.db (not garmin_activities.db)
      const wellnessDbPath = options.config?.garmin_db_path?.replace('garmin_activities.db', 'garmin.db') || 
                            '/Users/chris/HealthData/DBs/garmin.db'
      const monitoringDbPath = options.config?.garmin_monitoring_db_path || 
                              '/Users/chris/HealthData/DBs/garmin_monitoring.db'
      
      const reader = new WellnessReader(wellnessDbPath, monitoringDbPath)

      // Validate databases
      const dbValidation = await reader.validateDatabases()
      if (!dbValidation.garminDb || !dbValidation.monitoringDb) {
        return {
          imported: 0,
          skipped: 0,
          errors: [`Wellness sync failed: ${dbValidation.errors.join('; ')}`]
        }
      }

      // Read wellness data
      const { sleepRecords, rhrRecords, weightRecords } = await reader.readAllWellnessData(dateRange)

      if (options.dry_run) {
        // For dry run, just return counts without importing
        return {
          imported: sleepRecords.length + rhrRecords.length + weightRecords.length,
          skipped: 0,
          errors: []
        }
      }

      // Transform wellness data
      const transformResult = transformWellnessBatch(
        sleepRecords,
        rhrRecords,
        weightRecords,
        options.athlete_id,
        new Map() // Empty historical context for now
      )

      // Import to database using authenticated client
      const supabase = this.supabase
      let imported = 0
      let skipped = 0
      const errors: string[] = []

      // Import successful transformations
      if (transformResult.successful_imports > 0) {
        // Re-transform to get actual data (transformWellnessBatch only returns counts)
        // This is a simplification - in production, we'd optimize this
        const { transformSleepRecord, transformRHRRecord, transformWeightRecord } = await import('./wellnessTransform')
        
        const wellnessData = []
        
        // Transform sleep records
        for (const record of sleepRecords) {
          const result = transformSleepRecord(record, options.athlete_id)
          if (result.success && result.data) {
            wellnessData.push(result.data)
          }
        }
        
        // Transform RHR records
        for (const record of rhrRecords) {
          const result = transformRHRRecord(record, options.athlete_id)
          if (result.success && result.data) {
            wellnessData.push(result.data)
          }
        }
        
        // Transform weight records
        for (const record of weightRecords) {
          const result = transformWeightRecord(record, options.athlete_id)
          if (result.success && result.data) {
            wellnessData.push(result.data)
          }
        }

        // Insert with duplicate handling
        for (const record of wellnessData) {
          try {
            // Check for existing record
            const { data: existing } = await supabase
              .from('wellness_data')
              .select('wellness_id')
              .eq('athlete_id', options.athlete_id)
              .eq('date', record.date)
              .eq('data_type', record.data_type)
              .limit(1)

            if (existing && existing.length > 0) {
              skipped++
              continue
            }

            // Insert new record
            const { error: insertError } = await supabase
              .from('wellness_data')
              .insert(record)

            if (insertError) {
              errors.push(`Failed to insert ${record.data_type} record for ${record.date}: ${insertError.message}`)
            } else {
              imported++
            }

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            errors.push(`Wellness import error for ${record.data_type} ${record.date}: ${errorMessage}`)
          }
        }
      }

      return { imported, skipped, errors }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        imported: 0,
        skipped: 0,
        errors: [`Wellness sync failed: ${errorMessage}`]
      }
    }
  }

  /**
   * Build activity filters for bulk import
   */
  private buildActivityFilters(options: BackgroundSyncOptions) {
    const filters: any = {}

    // If force_refresh is false, only sync recent data
    if (!options.force_refresh && options.config?.last_sync_at) {
      const lastSync = new Date(options.config.last_sync_at)
      const startDate = new Date(lastSync)
      startDate.setDate(startDate.getDate() - 1) // Start 1 day before last sync for overlap
      
      filters.startDate = startDate.toISOString().split('T')[0]
      filters.endDate = new Date().toISOString().split('T')[0]
    } else {
      // Full sync - use a reasonable default range
      filters.startDate = '2024-01-01'
      filters.endDate = new Date().toISOString().split('T')[0]
    }

    return filters
  }

  /**
   * Build date range for wellness data
   */
  private buildWellnessDateRange(options: BackgroundSyncOptions) {
    if (!options.force_refresh && options.config?.last_sync_at) {
      const lastSync = new Date(options.config.last_sync_at)
      const startDate = new Date(lastSync)
      startDate.setDate(startDate.getDate() - 1) // Start 1 day before last sync
      
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    }

    // Full sync
    return {
      startDate: '2024-01-01',
      endDate: new Date().toISOString().split('T')[0]
    }
  }

  /**
   * Get default GarminDB path
   */
  private getDefaultGarminDbPath(): string {
    return process.env.GARMIN_DB_PATH || '/Users/chris/.GarminDB/garmin_activities.db'
  }

  /**
   * Get default monitoring DB path
   */
  private getDefaultMonitoringDbPath(): string {
    return process.env.GARMIN_MONITORING_DB_PATH || '/Users/chris/.GarminDB/garmin_monitoring.db'
  }
}
