/**
 * Unit tests for BackgroundSyncService
 * T6: Scheduled Sync and Automation
 */

import { BackgroundSyncService } from '../backgroundSync'
import { serverClient } from '@/lib/supabase/server'
import { BulkImportService } from '../bulkImport'
import { WellnessReader } from '../wellnessReader'
import { transformWellnessBatch, transformSleepRecord, transformRHRRecord, transformWeightRecord } from '../wellnessTransform'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('../bulkImport')
jest.mock('../wellnessReader')
jest.mock('../wellnessTransform')

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({
    data: {
      sync_id: 'sync-1',
      athlete_id: 'athlete-1',
      sync_type: 'manual',
      data_types: ['activities', 'wellness'],
      status: 'running',
      started_at: new Date().toISOString(),
      metadata: {}
    },
    error: null
  })
}

const mockBulkImportService = {
  importActivities: jest.fn()
}

const mockWellnessReader = {
  validateDatabases: jest.fn(),
  readAllWellnessData: jest.fn()
}

describe('BackgroundSyncService', () => {
  let service: BackgroundSyncService

  beforeEach(() => {
    jest.clearAllMocks()
    ;(serverClient as jest.Mock).mockReturnValue(mockSupabase)
    ;(BulkImportService as jest.Mock).mockImplementation(() => mockBulkImportService)
    ;(WellnessReader as jest.Mock).mockImplementation(() => mockWellnessReader)
    
    service = new BackgroundSyncService()
  })

  describe('syncUserData', () => {
    const mockOptions = {
      athlete_id: 'athlete-1',
      sync_type: 'manual' as const,
      data_types: ['activities', 'wellness'] as ('activities' | 'wellness')[],
      force_refresh: false,
      dry_run: false
    }

    beforeEach(() => {
      // Mock sync history creation
      mockSupabase.insert.mockResolvedValue({
        data: {
          sync_id: 'sync-1',
          athlete_id: 'athlete-1',
          sync_type: 'manual',
          data_types: ['activities', 'wellness'],
          status: 'running',
          started_at: new Date().toISOString(),
          metadata: {}
        },
        error: null
      })

      // Mock sync history update
      mockSupabase.update.mockResolvedValue({
        data: {},
        error: null
      })
    })

    it('should create sync history record', async () => {
      mockBulkImportService.importActivities.mockResolvedValue({
        summary: { successfulImports: 5, duplicateSkips: 2, filteredOut: 1 },
        errors: []
      })

      mockWellnessReader.validateDatabases.mockResolvedValue({
        garminDb: true,
        monitoringDb: true,
        errors: []
      })

      mockWellnessReader.readAllWellnessData.mockResolvedValue({
        sleepRecords: [],
        rhrRecords: [],
        weightRecords: []
      })

      ;(transformWellnessBatch as jest.Mock).mockReturnValue({
        successful_imports: 0,
        failed_imports: 0,
        errors: []
      })

      const result = await service.syncUserData(mockOptions)

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          athlete_id: 'athlete-1',
          sync_type: 'manual',
          data_types: ['activities', 'wellness'],
          status: 'running'
        })
      )

      expect(result.sync_id).toBe('sync-1')
    })

    it('should handle sync history creation failure', async () => {
      mockSupabase.insert.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(service.syncUserData(mockOptions)).rejects.toThrow('Failed to create sync history record')
    })

    it('should sync activities when included in data_types', async () => {
      mockBulkImportService.importActivities.mockResolvedValue({
        summary: { successfulImports: 10, duplicateSkips: 5, filteredOut: 2 },
        errors: ['Error 1', 'Error 2']
      })

      mockWellnessReader.validateDatabases.mockResolvedValue({
        garminDb: true,
        monitoringDb: true,
        errors: []
      })

      mockWellnessReader.readAllWellnessData.mockResolvedValue({
        sleepRecords: [],
        rhrRecords: [],
        weightRecords: []
      })

      ;(transformWellnessBatch as jest.Mock).mockReturnValue({
        successful_imports: 0,
        failed_imports: 0,
        errors: []
      })

      const result = await service.syncUserData({
        ...mockOptions,
        data_types: ['activities']
      })

      expect(mockBulkImportService.importActivities).toHaveBeenCalled()
      expect(result.activities_imported).toBe(10)
      expect(result.activities_skipped).toBe(7) // duplicateSkips + filteredOut
      expect(result.errors).toEqual(['Activity import: Error 1', 'Activity import: Error 2'])
    })

    it('should sync wellness data when included in data_types', async () => {
      mockWellnessReader.validateDatabases.mockResolvedValue({
        garminDb: true,
        monitoringDb: true,
        errors: []
      })

      mockWellnessReader.readAllWellnessData.mockResolvedValue({
        sleepRecords: [{ day: '2024-01-01', total_sleep: '08:00:00' }],
        rhrRecords: [{ day: '2024-01-01', resting_hr: 55 }],
        weightRecords: [{ day: '2024-01-01', weight: 70 }]
      })

      ;(transformWellnessBatch as jest.Mock).mockReturnValue({
        successful_imports: 3,
        failed_imports: 0,
        errors: []
      })

      // Mock individual transformations
      ;(transformSleepRecord as jest.Mock).mockReturnValue({
        success: true,
        data: { wellness_id: 'w1', data_type: 'sleep', date: '2024-01-01' }
      })
      ;(transformRHRRecord as jest.Mock).mockReturnValue({
        success: true,
        data: { wellness_id: 'w2', data_type: 'rhr', date: '2024-01-01' }
      })
      ;(transformWeightRecord as jest.Mock).mockReturnValue({
        success: true,
        data: { wellness_id: 'w3', data_type: 'weight', date: '2024-01-01' }
      })

      // Mock duplicate check (no existing records)
      mockSupabase.select.mockResolvedValue({
        data: [],
        error: null
      })

      // Mock successful inserts
      mockSupabase.insert.mockResolvedValue({
        data: {},
        error: null
      })

      const result = await service.syncUserData({
        ...mockOptions,
        data_types: ['wellness']
      })

      expect(mockWellnessReader.readAllWellnessData).toHaveBeenCalled()
      expect(result.wellness_records_imported).toBe(3)
    })

    it('should handle wellness database validation failure', async () => {
      mockWellnessReader.validateDatabases.mockResolvedValue({
        garminDb: false,
        monitoringDb: true,
        errors: ['Garmin DB not found']
      })

      const result = await service.syncUserData({
        ...mockOptions,
        data_types: ['wellness']
      })

      expect(result.wellness_records_imported).toBe(0)
      expect(result.errors).toContain('Wellness sync failed: Garmin DB not found')
    })

    it('should handle dry run mode', async () => {
      mockWellnessReader.validateDatabases.mockResolvedValue({
        garminDb: true,
        monitoringDb: true,
        errors: []
      })

      mockWellnessReader.readAllWellnessData.mockResolvedValue({
        sleepRecords: [{ day: '2024-01-01' }],
        rhrRecords: [{ day: '2024-01-01' }],
        weightRecords: [{ day: '2024-01-01' }]
      })

      const result = await service.syncUserData({
        ...mockOptions,
        data_types: ['wellness'],
        dry_run: true
      })

      expect(result.wellness_records_imported).toBe(3) // Count without actual import
      expect(mockSupabase.insert).toHaveBeenCalledTimes(1) // Only sync history, no wellness data
    })

    it('should determine final status correctly', async () => {
      mockBulkImportService.importActivities.mockResolvedValue({
        summary: { successfulImports: 0, duplicateSkips: 0, filteredOut: 0 },
        errors: ['Import failed']
      })

      const result = await service.syncUserData({
        ...mockOptions,
        data_types: ['activities']
      })

      expect(result.success).toBe(false)
      expect(result.status).toBe('failed')
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle unexpected errors', async () => {
      mockBulkImportService.importActivities.mockRejectedValue(new Error('Unexpected error'))

      const result = await service.syncUserData({
        ...mockOptions,
        data_types: ['activities']
      })

      expect(result.success).toBe(false)
      expect(result.status).toBe('failed')
      expect(result.errors).toContain('Sync failed: Unexpected error')
    })

    it('should update sync history with final results', async () => {
      mockBulkImportService.importActivities.mockResolvedValue({
        summary: { successfulImports: 5, duplicateSkips: 1, filteredOut: 0 },
        errors: []
      })

      mockWellnessReader.validateDatabases.mockResolvedValue({
        garminDb: true,
        monitoringDb: true,
        errors: []
      })

      mockWellnessReader.readAllWellnessData.mockResolvedValue({
        sleepRecords: [],
        rhrRecords: [],
        weightRecords: []
      })

      ;(transformWellnessBatch as jest.Mock).mockReturnValue({
        successful_imports: 0,
        failed_imports: 0,
        errors: []
      })

      await service.syncUserData(mockOptions)

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          completed_at: expect.any(String),
          duration_ms: expect.any(Number),
          activities_imported: 5,
          activities_skipped: 1
        })
      )
    })
  })

  describe('buildActivityFilters', () => {
    it('should build incremental filters when not force refresh', () => {
      const options = {
        athlete_id: 'athlete-1',
        sync_type: 'scheduled' as const,
        data_types: ['activities'] as ('activities' | 'wellness')[],
        force_refresh: false,
        config: {
          last_sync_at: '2024-01-01T00:00:00Z'
        }
      }

      const filters = (service as any).buildActivityFilters(options)

      expect(filters.startDate).toBe('2023-12-31') // 1 day before last sync
      expect(filters.endDate).toBe(new Date().toISOString().split('T')[0])
    })

    it('should build full sync filters when force refresh', () => {
      const options = {
        athlete_id: 'athlete-1',
        sync_type: 'manual' as const,
        data_types: ['activities'] as ('activities' | 'wellness')[],
        force_refresh: true
      }

      const filters = (service as any).buildActivityFilters(options)

      expect(filters.startDate).toBe('2024-01-01')
      expect(filters.endDate).toBe(new Date().toISOString().split('T')[0])
    })
  })

  describe('buildWellnessDateRange', () => {
    it('should build incremental date range when not force refresh', () => {
      const options = {
        athlete_id: 'athlete-1',
        sync_type: 'scheduled' as const,
        data_types: ['wellness'] as ('activities' | 'wellness')[],
        force_refresh: false,
        config: {
          last_sync_at: '2024-01-01T00:00:00Z'
        }
      }

      const dateRange = (service as any).buildWellnessDateRange(options)

      expect(dateRange.startDate).toBe('2023-12-31') // 1 day before last sync
      expect(dateRange.endDate).toBe(new Date().toISOString().split('T')[0])
    })

    it('should build full date range when force refresh', () => {
      const options = {
        athlete_id: 'athlete-1',
        sync_type: 'manual' as const,
        data_types: ['wellness'] as ('activities' | 'wellness')[],
        force_refresh: true
      }

      const dateRange = (service as any).buildWellnessDateRange(options)

      expect(dateRange.startDate).toBe('2024-01-01')
      expect(dateRange.endDate).toBe(new Date().toISOString().split('T')[0])
    })
  })
})
