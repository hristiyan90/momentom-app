/**
 * Unit tests for main transformation utilities
 */

import {
  transformGarminActivity,
  transformGarminActivitiesBatch,
  getTransformationStats,
  createTransformationSummary
} from '../transform'
import type { GarminActivity, TransformationResult } from '../types'

// Mock UUID to make tests deterministic
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234-5678-9012')
}))

describe('transform', () => {
  const mockActivity: GarminActivity = {
    activity_id: 123456,
    name: 'Morning Run',
    start_time: '2025-08-29 06:15:00',
    sport: 'running',
    distance: 10.5,
    moving_time: '1:23:45',
    avg_hr: 145,
    max_hr: 165,
    avg_speed: 12.5,
    max_speed: 18.2,
    avg_power: null,
    max_power: null,
    avg_cadence: 180,
    max_cadence: 190,
    calories: 650,
    training_effect: 3.2,
    anaerobic_training_effect: 1.8,
    elevation_gain: 150,
    elevation_loss: 145,
    temperature: 18.5
  }

  const athleteId = '11111111-1111-4111-1111-111111111111'

  describe('transformGarminActivity', () => {
    it('should successfully transform valid activity', () => {
      const result = transformGarminActivity(mockActivity, athleteId)
      
      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
      expect(result.error).toBeUndefined()
      
      if (result.session) {
        expect(result.session.session_id).toBe('test-uuid-1234-5678-9012')
        expect(result.session.athlete_id).toBe(athleteId)
        expect(result.session.sport).toBe('run')
        expect(result.session.title).toBe('Morning Run')
        expect(result.session.actual_duration_min).toBe(84) // 1:23:45 = 84 minutes (rounded)
        expect(result.session.actual_distance_m).toBe(10500) // 10.5 km = 10500 m
        expect(result.session.status).toBe('completed')
        expect(result.session.source_file_type).toBe('garmin')
        expect(result.session.metadata.garmin_activity_id).toBe(123456)
      }
    })

    it('should handle activity without name', () => {
      const activityWithoutName = { ...mockActivity, name: null }
      const result = transformGarminActivity(activityWithoutName, athleteId, { generateTitle: true })
      
      expect(result.success).toBe(true)
      if (result.session) {
        expect(result.session.title).toMatch(/^Run - /)
      }
    })

    it('should extract performance metrics', () => {
      const result = transformGarminActivity(mockActivity, athleteId)
      
      expect(result.success).toBe(true)
      if (result.session) {
        const metrics = result.session.metadata.performance_metrics
        expect(metrics).toBeDefined()
        expect(metrics?.heart_rate?.avg_bpm).toBe(145)
        expect(metrics?.heart_rate?.max_bpm).toBe(165)
        expect(metrics?.calories).toBe(650)
      }
    })

    it('should handle distance conversion', () => {
      const result = transformGarminActivity(mockActivity, athleteId)
      
      expect(result.success).toBe(true)
      if (result.session) {
        expect(result.session.actual_distance_m).toBe(10500) // 10.5 km to meters
      }
    })

    it('should handle null distance', () => {
      const activityWithoutDistance = { ...mockActivity, distance: null }
      const result = transformGarminActivity(activityWithoutDistance, athleteId)
      
      expect(result.success).toBe(true)
      if (result.session) {
        expect(result.session.actual_distance_m).toBeNull()
      }
    })

    it('should fail validation for invalid activity', () => {
      const invalidActivity = { ...mockActivity, activity_id: undefined as any }
      const result = transformGarminActivity(invalidActivity, athleteId)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Validation failed')
    })

    it('should map different sports correctly', () => {
      const cyclingActivity = { ...mockActivity, sport: 'cycling' }
      const result = transformGarminActivity(cyclingActivity, athleteId)
      
      expect(result.success).toBe(true)
      if (result.session) {
        expect(result.session.sport).toBe('bike')
      }
    })
  })

  describe('transformGarminActivitiesBatch', () => {
    const activities = [
      mockActivity,
      { ...mockActivity, activity_id: 234567, sport: 'cycling' },
      { ...mockActivity, activity_id: 345678, sport: 'swimming' }
    ]

    it('should transform multiple activities successfully', () => {
      const results = transformGarminActivitiesBatch(activities, athleteId)
      
      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      
      // Check different sport mappings
      expect(results[0].session?.sport).toBe('run')
      expect(results[1].session?.sport).toBe('bike')
      expect(results[2].session?.sport).toBe('swim')
    })

    it('should handle progress callback', () => {
      const progressCallback = jest.fn()
      
      transformGarminActivitiesBatch(activities, athleteId, { progressCallback })
      
      expect(progressCallback).toHaveBeenCalledTimes(3)
      expect(progressCallback).toHaveBeenCalledWith(1, 3)
      expect(progressCallback).toHaveBeenCalledWith(2, 3)
      expect(progressCallback).toHaveBeenCalledWith(3, 3)
    })

    it('should stop on error when continueOnError is false', () => {
      const activitiesWithError = [
        mockActivity,
        { ...mockActivity, activity_id: undefined as any }, // Invalid
        { ...mockActivity, activity_id: 345678 }
      ]
      
      const results = transformGarminActivitiesBatch(activitiesWithError, athleteId, {
        continueOnError: false
      })
      
      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
    })

    it('should continue on error when continueOnError is true', () => {
      const activitiesWithError = [
        mockActivity,
        { ...mockActivity, activity_id: undefined as any }, // Invalid
        { ...mockActivity, activity_id: 345678 }
      ]
      
      const results = transformGarminActivitiesBatch(activitiesWithError, athleteId, {
        continueOnError: true
      })
      
      expect(results).toHaveLength(3)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[2].success).toBe(true)
    })
  })

  describe('getTransformationStats', () => {
    it('should calculate transformation statistics', () => {
      const results: TransformationResult[] = [
        { success: true, session: {} as any, warnings: ['Warning 1'] },
        { success: false, error: 'Error 1', warnings: [] },
        { success: true, session: {} as any, warnings: ['Warning 1', 'Warning 2'] },
        { success: false, error: 'Error 2', warnings: ['Warning 1'] }
      ]
      
      const stats = getTransformationStats(results)
      
      expect(stats.total).toBe(4)
      expect(stats.successful).toBe(2)
      expect(stats.failed).toBe(2)
      expect(stats.successRate).toBe(50)
      expect(stats.failureRate).toBe(50)
      expect(stats.withWarnings).toBe(3)
      expect(stats.totalWarnings).toBe(4)
      expect(stats.errors).toHaveLength(2)
      expect(stats.commonWarnings.get('Warning 1')).toBe(3)
    })
  })

  describe('createTransformationSummary', () => {
    it('should create comprehensive summary', () => {
      const results: TransformationResult[] = [
        { success: true, session: {} as any, warnings: ['Warning 1'] },
        { success: false, error: 'Error 1', warnings: [] },
        { success: true, session: {} as any, warnings: ['Warning 1'] }
      ]
      
      const summary = createTransformationSummary(results)
      
      expect(summary.summary).toContain('Processed 3 activities')
      expect(summary.summary).toContain('2 successful (67%)')
      expect(summary.summary).toContain('1 failed (33%)')
      expect(summary.details.total).toBe(3)
      expect(summary.details.topWarnings).toHaveLength(1)
      expect(summary.details.topWarnings[0]).toEqual({ warning: 'Warning 1', count: 2 })
    })
  })
})
