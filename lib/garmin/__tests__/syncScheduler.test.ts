/**
 * Unit tests for GarminSyncScheduler
 * T6: Scheduled Sync and Automation
 */

import { GarminSyncScheduler } from '../syncScheduler'
import { BackgroundSyncService } from '../backgroundSync'
import { serverClient } from '@/lib/supabase/server'

// Mock dependencies
jest.mock('../backgroundSync')
jest.mock('@/lib/supabase/server')
jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn()
  })
}))

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  update: jest.fn().mockReturnThis(),
  single: jest.fn()
}

const mockBackgroundSyncService = {
  syncUserData: jest.fn()
}

describe('GarminSyncScheduler', () => {
  let scheduler: GarminSyncScheduler

  beforeEach(() => {
    jest.clearAllMocks()
    ;(serverClient as jest.Mock).mockReturnValue(mockSupabase)
    ;(BackgroundSyncService as jest.Mock).mockImplementation(() => mockBackgroundSyncService)
    
    scheduler = new GarminSyncScheduler({
      enabled: true,
      check_interval_minutes: 1, // Fast interval for testing
      max_concurrent_syncs: 2
    })
  })

  afterEach(async () => {
    await scheduler.stop()
  })

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultScheduler = new GarminSyncScheduler()
      const status = defaultScheduler.getStatus()
      
      expect(status.options.enabled).toBe(true)
      expect(status.options.check_interval_minutes).toBe(5)
      expect(status.options.max_concurrent_syncs).toBe(3)
    })

    it('should merge custom options with defaults', () => {
      const customScheduler = new GarminSyncScheduler({
        check_interval_minutes: 10,
        max_concurrent_syncs: 1
      })
      const status = customScheduler.getStatus()
      
      expect(status.options.check_interval_minutes).toBe(10)
      expect(status.options.max_concurrent_syncs).toBe(1)
      expect(status.options.enabled).toBe(true) // Default value
    })
  })

  describe('start', () => {
    it('should start the scheduler when enabled', async () => {
      await scheduler.start()
      const status = scheduler.getStatus()
      
      expect(status.isRunning).toBe(true)
      expect(status.activeCronJobs).toBe(1)
    })

    it('should not start when disabled', async () => {
      const disabledScheduler = new GarminSyncScheduler({ enabled: false })
      await disabledScheduler.start()
      const status = disabledScheduler.getStatus()
      
      expect(status.isRunning).toBe(false)
      expect(status.activeCronJobs).toBe(0)
    })

    it('should not start if already running', async () => {
      await scheduler.start()
      await scheduler.start() // Second call should be ignored
      const status = scheduler.getStatus()
      
      expect(status.isRunning).toBe(true)
      expect(status.activeCronJobs).toBe(1)
    })
  })

  describe('stop', () => {
    it('should stop the scheduler', async () => {
      await scheduler.start()
      await scheduler.stop()
      const status = scheduler.getStatus()
      
      expect(status.isRunning).toBe(false)
      expect(status.activeCronJobs).toBe(0)
    })

    it('should handle stop when not running', async () => {
      await scheduler.stop() // Should not throw
      const status = scheduler.getStatus()
      
      expect(status.isRunning).toBe(false)
    })
  })

  describe('checkAndRunDueSyncs', () => {
    beforeEach(async () => {
      mockSupabase.select.mockResolvedValue({
        data: [],
        error: null
      })
      await scheduler.start() // Start scheduler before testing
    })

    it('should query for due sync configs', async () => {
      await scheduler.triggerCheck()
      
      expect(mockSupabase.from).toHaveBeenCalledWith('garmin_sync_config')
      expect(mockSupabase.eq).toHaveBeenCalledWith('enabled', true)
      expect(mockSupabase.neq).toHaveBeenCalledWith('frequency', 'manual_only')
      expect(mockSupabase.limit).toHaveBeenCalledWith(2) // max_concurrent_syncs
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.select.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      // Should not throw
      await scheduler.triggerCheck()
    })

    it('should process due syncs', async () => {
      const mockConfig = {
        config_id: 'config-1',
        athlete_id: 'athlete-1',
        enabled: true,
        frequency: 'daily',
        preferred_time: '06:00:00',
        data_types: ['activities', 'wellness'],
        next_sync_at: new Date(Date.now() - 1000).toISOString() // Due 1 second ago
      }

      mockSupabase.select
        .mockResolvedValueOnce({
          data: [mockConfig],
          error: null
        })
        .mockResolvedValueOnce({
          data: [], // No running syncs
          error: null
        })

      // Mock sync result
      mockBackgroundSyncService.syncUserData.mockResolvedValue({
        sync_id: 'sync-1',
        success: true
      })

      // Mock next sync time update
      mockSupabase.update.mockResolvedValue({
        data: mockConfig,
        error: null
      })

      await scheduler.triggerCheck()

      expect(mockBackgroundSyncService.syncUserData).toHaveBeenCalledWith({
        athlete_id: 'athlete-1',
        sync_type: 'scheduled',
        data_types: ['activities', 'wellness'],
        config: mockConfig
      })
    })

    it('should skip sync if user already has running sync', async () => {
      const mockConfig = {
        config_id: 'config-1',
        athlete_id: 'athlete-1',
        enabled: true,
        frequency: 'daily',
        data_types: ['activities', 'wellness']
      }

      mockSupabase.select
        .mockResolvedValueOnce({
          data: [mockConfig],
          error: null
        })
        .mockResolvedValueOnce({
          data: [{ sync_id: 'running-sync' }], // Running sync exists
          error: null
        })

      await scheduler.triggerCheck()

      expect(mockBackgroundSyncService.syncUserData).not.toHaveBeenCalled()
    })
  })

  describe('updateNextSyncTime', () => {
    it('should calculate next daily sync time', async () => {
      const config = {
        config_id: 'config-1',
        athlete_id: 'athlete-1',
        frequency: 'daily' as const,
        preferred_time: '06:00:00'
      }

      mockSupabase.eq.mockResolvedValue({
        data: config,
        error: null
      })

      // Access private method for testing
      await (scheduler as any).updateNextSyncTime(config)

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          last_sync_at: expect.any(String),
          next_sync_at: expect.any(String)
        })
      )
      expect(mockSupabase.eq).toHaveBeenCalledWith('config_id', 'config-1')
    })

    it('should calculate next weekly sync time', async () => {
      const config = {
        config_id: 'config-1',
        athlete_id: 'athlete-1',
        frequency: 'weekly' as const,
        preferred_time: '06:00:00'
      }

      mockSupabase.eq.mockResolvedValue({
        data: config,
        error: null
      })

      await (scheduler as any).updateNextSyncTime(config)

      expect(mockSupabase.update).toHaveBeenCalled()
      expect(mockSupabase.eq).toHaveBeenCalledWith('config_id', 'config-1')
    })

    it('should not update next sync time for manual_only', async () => {
      const config = {
        config_id: 'config-1',
        athlete_id: 'athlete-1',
        frequency: 'manual_only' as const,
        preferred_time: '06:00:00'
      }

      await (scheduler as any).updateNextSyncTime(config)

      expect(mockSupabase.update).not.toHaveBeenCalled()
    })
  })

  describe('getStatus', () => {
    it('should return current status', () => {
      const status = scheduler.getStatus()
      
      expect(status).toEqual({
        isRunning: false,
        activeCronJobs: 0,
        options: expect.objectContaining({
          enabled: true,
          check_interval_minutes: 1,
          max_concurrent_syncs: 2
        })
      })
    })
  })
})
