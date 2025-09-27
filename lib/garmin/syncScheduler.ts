/**
 * GarminDB Sync Scheduler
 * Manages automated sync scheduling using node-cron
 * T6: Scheduled Sync and Automation
 */

import * as cron from 'node-cron'
import { serverClient } from '@/lib/supabase/server'
import { GarminSyncConfig, SchedulerOptions } from './types'
import { BackgroundSyncService } from './backgroundSync'

export class GarminSyncScheduler {
  private cronJobs: Map<string, cron.ScheduledTask> = new Map()
  private backgroundSyncService: BackgroundSyncService
  private options: SchedulerOptions
  private isRunning: boolean = false

  constructor(options: Partial<SchedulerOptions> = {}) {
    this.options = {
      enabled: true,
      check_interval_minutes: 5, // Check every 5 minutes for due syncs
      max_concurrent_syncs: 3, // Limit concurrent operations
      retry_failed_syncs: true,
      retry_delay_minutes: 30,
      ...options
    }
    this.backgroundSyncService = new BackgroundSyncService()
  }

  /**
   * Start the scheduler - sets up periodic checks for due syncs
   */
  async start(): Promise<void> {
    if (!this.options.enabled || this.isRunning) {
      return
    }

    console.log('🕒 Starting GarminDB sync scheduler...')
    
    // Schedule periodic checks for due syncs
    const cronExpression = `*/${this.options.check_interval_minutes} * * * *`
    const task = cron.schedule(cronExpression, async () => {
      await this.checkAndRunDueSyncs()
    }, {
      scheduled: false // Don't start immediately
    })

    this.cronJobs.set('scheduler', task)
    task.start()
    this.isRunning = true

    console.log(`✅ Sync scheduler started (checking every ${this.options.check_interval_minutes} minutes)`)
  }

  /**
   * Stop the scheduler and cancel all scheduled tasks
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return
    }

    console.log('🛑 Stopping GarminDB sync scheduler...')
    
    // Stop all cron jobs
    for (const [name, task] of this.cronJobs) {
      task.stop()
      task.destroy()
      console.log(`  Stopped ${name} task`)
    }
    
    this.cronJobs.clear()
    this.isRunning = false
    
    console.log('✅ Sync scheduler stopped')
  }

  /**
   * Check for users with due syncs and trigger them
   */
  private async checkAndRunDueSyncs(): Promise<void> {
    try {
      const supabase = serverClient()
      const now = new Date()

      // Query for enabled configs with due syncs
      const { data: dueConfigs, error } = await supabase
        .from('garmin_sync_config')
        .select('*')
        .eq('enabled', true)
        .neq('frequency', 'manual_only')
        .or(`next_sync_at.is.null,next_sync_at.lte.${now.toISOString()}`)
        .limit(this.options.max_concurrent_syncs || 3)

      if (error) {
        console.error('❌ Error fetching due sync configs:', error)
        return
      }

      if (!dueConfigs || dueConfigs.length === 0) {
        return // No due syncs
      }

      console.log(`🔄 Found ${dueConfigs.length} due sync(s)`)

      // Process each due sync
      for (const config of dueConfigs) {
        await this.triggerScheduledSync(config as GarminSyncConfig)
      }

    } catch (error) {
      console.error('❌ Error in checkAndRunDueSyncs:', error)
    }
  }

  /**
   * Trigger a scheduled sync for a specific user
   */
  private async triggerScheduledSync(config: GarminSyncConfig): Promise<void> {
    try {
      console.log(`🚀 Triggering scheduled sync for athlete ${config.athlete_id}`)

      // Check if user already has a running sync
      const supabase = serverClient()
      const { data: runningSyncs } = await supabase
        .from('garmin_sync_history')
        .select('sync_id')
        .eq('athlete_id', config.athlete_id)
        .eq('status', 'running')
        .limit(1)

      if (runningSyncs && runningSyncs.length > 0) {
        console.log(`⏭️  Skipping sync for athlete ${config.athlete_id} - already running`)
        return
      }

      // Trigger background sync
      const syncResult = await this.backgroundSyncService.syncUserData({
        athlete_id: config.athlete_id,
        sync_type: 'scheduled',
        data_types: config.data_types as ('activities' | 'wellness')[],
        config: config
      })

      // Update next sync time
      await this.updateNextSyncTime(config)

      console.log(`✅ Scheduled sync initiated for athlete ${config.athlete_id}, sync_id: ${syncResult.sync_id}`)

    } catch (error) {
      console.error(`❌ Error triggering scheduled sync for athlete ${config.athlete_id}:`, error)
    }
  }

  /**
   * Calculate and update the next sync time for a config
   */
  private async updateNextSyncTime(config: GarminSyncConfig): Promise<void> {
    const supabase = serverClient()
    const now = new Date()
    let nextSync: Date

    // Calculate next sync based on frequency
    switch (config.frequency) {
      case 'daily':
        nextSync = new Date(now)
        nextSync.setDate(nextSync.getDate() + 1)
        // Set to preferred time
        const [hours, minutes] = config.preferred_time.split(':').map(Number)
        nextSync.setUTCHours(hours, minutes, 0, 0)
        break
      
      case 'weekly':
        nextSync = new Date(now)
        nextSync.setDate(nextSync.getDate() + 7)
        // Set to preferred time
        const [weeklyHours, weeklyMinutes] = config.preferred_time.split(':').map(Number)
        nextSync.setUTCHours(weeklyHours, weeklyMinutes, 0, 0)
        break
      
      default:
        return // manual_only - no next sync
    }

    // Update the config
    const { error } = await supabase
      .from('garmin_sync_config')
      .update({
        last_sync_at: now.toISOString(),
        next_sync_at: nextSync.toISOString()
      })
      .eq('config_id', config.config_id)

    if (error) {
      console.error(`❌ Error updating next sync time for config ${config.config_id}:`, error)
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; activeCronJobs: number; options: SchedulerOptions } {
    return {
      isRunning: this.isRunning,
      activeCronJobs: this.cronJobs.size,
      options: this.options
    }
  }

  /**
   * Manually trigger a sync check (for testing)
   */
  async triggerCheck(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Scheduler is not running')
    }
    await this.checkAndRunDueSyncs()
  }
}

// Singleton instance for the application
let schedulerInstance: GarminSyncScheduler | null = null

/**
 * Get the global scheduler instance
 */
export function getScheduler(): GarminSyncScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new GarminSyncScheduler()
  }
  return schedulerInstance
}

/**
 * Initialize the scheduler (call this in app startup)
 */
export async function initializeScheduler(options?: Partial<SchedulerOptions>): Promise<void> {
  const scheduler = getScheduler()
  
  // Update options if provided
  if (options) {
    Object.assign(scheduler['options'], options)
  }
  
  await scheduler.start()
}

/**
 * Shutdown the scheduler (call this in app shutdown)
 */
export async function shutdownScheduler(): Promise<void> {
  if (schedulerInstance) {
    await schedulerInstance.stop()
    schedulerInstance = null
  }
}
