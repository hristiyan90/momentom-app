/**
 * Unit tests for validation utilities
 */

import {
  validateActivityData,
  validateSessionTitle,
  validateAthleteId,
  validateTransformedSession,
  getValidationStats
} from '../validation'
import type { GarminActivity, ValidationResult } from '../types'

describe('validation', () => {
  const mockValidActivity: GarminActivity = {
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

  describe('validateActivityData', () => {
    it('should validate correct activity data', () => {
      const result = validateActivityData(mockValidActivity)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should catch missing required fields', () => {
      const invalidActivity = { ...mockValidActivity, activity_id: undefined as any }
      const result = validateActivityData(invalidActivity)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing required field: activity_id')
    })

    it('should catch invalid start_time', () => {
      const invalidActivity = { ...mockValidActivity, start_time: 'invalid-date' }
      const result = validateActivityData(invalidActivity)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Invalid start_time'))).toBe(true)
    })

    it('should warn about unknown sport types', () => {
      const unknownSportActivity = { ...mockValidActivity, sport: 'unknown_sport' }
      const result = validateActivityData(unknownSportActivity)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Unknown sport type: unknown_sport - will map to fallback')
    })

    it('should catch negative values', () => {
      const invalidActivity = { ...mockValidActivity, distance: -5 }
      const result = validateActivityData(invalidActivity)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Distance cannot be negative')
    })

    it('should warn about unusual values', () => {
      const unusualActivity = { ...mockValidActivity, avg_hr: 250 }
      const result = validateActivityData(unusualActivity)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings.some(w => w.includes('HR out of typical range'))).toBe(true)
    })

    it('should catch data inconsistencies', () => {
      const inconsistentActivity = { ...mockValidActivity, avg_hr: 180, max_hr: 150 }
      const result = validateActivityData(inconsistentActivity)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Average heart rate cannot exceed maximum heart rate')
    })
  })

  describe('validateSessionTitle', () => {
    it('should validate correct titles', () => {
      const result = validateSessionTitle('Morning Run')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty titles', () => {
      const result = validateSessionTitle('')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Session title cannot be empty')
    })

    it('should warn about very long titles', () => {
      const longTitle = 'A'.repeat(250)
      const result = validateSessionTitle(longTitle)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Session title is quite long (>200 chars)')
    })

    it('should warn about very short titles', () => {
      const result = validateSessionTitle('AB')
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Session title is very short (<3 chars)')
    })
  })

  describe('validateAthleteId', () => {
    const validUUID = '11111111-1111-4111-1111-111111111111'

    it('should validate correct UUID', () => {
      const result = validateAthleteId(validUUID)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty athlete ID', () => {
      const result = validateAthleteId('')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('athlete_id is required')
    })

    it('should reject invalid UUID format', () => {
      const result = validateAthleteId('invalid-uuid')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('athlete_id must be a valid UUID v4')
    })
  })

  describe('validateTransformedSession', () => {
    const validSession = {
      session_id: '11111111-1111-4111-1111-111111111111',
      athlete_id: '22222222-2222-4222-2222-222222222222',
      date: '2025-08-29',
      sport: 'run',
      title: 'Morning Run',
      actual_duration_min: 60,
      actual_distance_m: 10000,
      status: 'completed',
      source_file_type: 'garmin',
      metadata: {}
    }

    it('should validate correct session', () => {
      const result = validateTransformedSession(validSession)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should catch missing required fields', () => {
      const { session_id, ...incompleteSession } = validSession
      const result = validateTransformedSession(incompleteSession)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing required field: session_id')
    })

    it('should validate duration is positive', () => {
      const invalidSession = { ...validSession, actual_duration_min: -10 }
      const result = validateTransformedSession(invalidSession)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('actual_duration_min must be a positive number')
    })

    it('should validate sport values', () => {
      const invalidSession = { ...validSession, sport: 'invalid_sport' }
      const result = validateTransformedSession(invalidSession)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid sport: invalid_sport')
    })

    it('should validate date format', () => {
      const invalidSession = { ...validSession, date: '2025/08/29' }
      const result = validateTransformedSession(invalidSession)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Invalid date format'))).toBe(true)
    })
  })

  describe('getValidationStats', () => {
    it('should calculate validation statistics', () => {
      const results: ValidationResult[] = [
        { isValid: true, errors: [], warnings: ['Warning 1'] },
        { isValid: false, errors: ['Error 1'], warnings: [] },
        { isValid: true, errors: [], warnings: ['Warning 1', 'Warning 2'] },
        { isValid: false, errors: ['Error 1', 'Error 2'], warnings: ['Warning 1'] }
      ]
      
      const stats = getValidationStats(results)
      
      expect(stats.total).toBe(4)
      expect(stats.valid).toBe(2)
      expect(stats.invalid).toBe(2)
      expect(stats.withWarnings).toBe(3)
      expect(stats.validPercentage).toBe(50)
      expect(stats.totalErrors).toBe(3)
      expect(stats.totalWarnings).toBe(4)
      expect(stats.commonErrors.get('Error 1')).toBe(2)
      expect(stats.commonWarnings.get('Warning 1')).toBe(3)
    })
  })
})
