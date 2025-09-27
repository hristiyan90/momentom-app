/**
 * Unit tests for wellness transformation utilities
 */

import {
  transformSleepRecord,
  transformRHRRecord,
  transformWeightRecord,
  transformWellnessBatch,
  validateWellnessData
} from '../wellnessTransform'
import type { GarminSleepRecord, GarminRHRRecord, GarminWeightRecord } from '../types'

describe('wellnessTransform', () => {
  const mockAthleteId = 'test-athlete-123'

  describe('transformSleepRecord', () => {
    const mockSleepRecord: GarminSleepRecord = {
      day: '2024-09-15',
      total_sleep: '7:45:00',
      deep_sleep: '1:30:00',
      light_sleep: '5:15:00',
      rem_sleep: '1:00:00',
      awake: '0:15:00',
      sleep_score: 85,
      bedtime: '22:30:00',
      wake_time: '06:30:00'
    }

    it('should successfully transform valid sleep record', () => {
      const result = transformSleepRecord(mockSleepRecord, mockAthleteId)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.athlete_id).toBe(mockAthleteId)
      expect(result.data?.date).toBe('2024-09-15')
      expect(result.data?.data_type).toBe('sleep')
      expect(result.data?.source_type).toBe('garmin')
      
      const sleepData = result.data?.value_json as any
      expect(sleepData.total_minutes).toBe(465) // 7:45 = 465 minutes
      expect(sleepData.deep_minutes).toBe(90)   // 1:30 = 90 minutes
      expect(sleepData.light_minutes).toBe(315) // 5:15 = 315 minutes
      expect(sleepData.rem_minutes).toBe(60)    // 1:00 = 60 minutes
      expect(sleepData.awake_minutes).toBe(15)  // 0:15 = 15 minutes
      expect(sleepData.efficiency).toBeCloseTo(96.8, 1) // (465-15)/465 * 100
      expect(sleepData.score).toBe(85)
      expect(sleepData.bedtime).toBe('22:30')
      expect(sleepData.wake_time).toBe('06:30')
    })

    it('should handle missing optional fields', () => {
      const minimalRecord: GarminSleepRecord = {
        day: '2024-09-15',
        total_sleep: '8:00:00',
        deep_sleep: null,
        light_sleep: null,
        rem_sleep: null,
        awake: null,
        sleep_score: null,
        bedtime: null,
        wake_time: null
      }

      const result = transformSleepRecord(minimalRecord, mockAthleteId)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      
      const sleepData = result.data?.value_json as any
      expect(sleepData.total_minutes).toBe(480) // 8:00 = 480 minutes
      expect(sleepData.deep_minutes).toBeNull()
      expect(sleepData.light_minutes).toBeNull()
      expect(sleepData.rem_minutes).toBeNull()
      expect(sleepData.awake_minutes).toBeNull()
      expect(sleepData.efficiency).toBeNull()
      expect(sleepData.score).toBeNull()
    })

    it('should fail with missing required fields', () => {
      const invalidRecord = {
        day: '',
        total_sleep: null,
        deep_sleep: null,
        light_sleep: null,
        rem_sleep: null,
        awake: null,
        sleep_score: null,
        bedtime: null,
        wake_time: null
      } as GarminSleepRecord

      const result = transformSleepRecord(invalidRecord, mockAthleteId)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Missing required field')
    })

    it('should warn about unusual sleep duration', () => {
      const unusualRecord: GarminSleepRecord = {
        ...mockSleepRecord,
        total_sleep: '2:30:00' // Very short sleep
      }

      const result = transformSleepRecord(unusualRecord, mockAthleteId)

      expect(result.success).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('Unusual total sleep duration')
    })

    it('should warn about low sleep efficiency', () => {
      const lowEfficiencyRecord: GarminSleepRecord = {
        ...mockSleepRecord,
        total_sleep: '8:00:00',
        awake: '2:30:00' // High awake time = low efficiency
      }

      const result = transformSleepRecord(lowEfficiencyRecord, mockAthleteId)

      expect(result.success).toBe(true)
      expect(result.warnings.some(w => w.includes('Low sleep efficiency'))).toBe(true)
    })
  })

  describe('transformRHRRecord', () => {
    const mockRHRRecord: GarminRHRRecord = {
      day: '2024-09-15',
      resting_hr: 52
    }

    it('should successfully transform valid RHR record', () => {
      const result = transformRHRRecord(mockRHRRecord, mockAthleteId)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.athlete_id).toBe(mockAthleteId)
      expect(result.data?.date).toBe('2024-09-15')
      expect(result.data?.data_type).toBe('rhr')
      
      const rhrData = result.data?.value_json as any
      expect(rhrData.bpm).toBe(52)
      expect(rhrData.quality).toBe('good') // 52 bpm is good (51-60 range)
      expect(rhrData.trend).toBeNull() // No historical context
    })

    it('should determine correct quality levels', () => {
      const testCases = [
        { bpm: 45, expectedQuality: 'excellent' },
        { bpm: 55, expectedQuality: 'good' },
        { bpm: 65, expectedQuality: 'fair' },
        { bpm: 75, expectedQuality: 'poor' }
      ]

      testCases.forEach(({ bpm, expectedQuality }) => {
        const record = { ...mockRHRRecord, resting_hr: bpm }
        const result = transformRHRRecord(record, mockAthleteId)
        
        expect(result.success).toBe(true)
        const rhrData = result.data?.value_json as any
        expect(rhrData.quality).toBe(expectedQuality)
      })
    })

    it('should determine trend with historical context', () => {
      const historicalContext = [50, 51, 52, 53, 54, 55, 56] // Declining trend (recent values are higher)
      const result = transformRHRRecord(mockRHRRecord, mockAthleteId, historicalContext)

      expect(result.success).toBe(true)
      const rhrData = result.data?.value_json as any
      expect(rhrData.trend).toBe('declining') // Higher RHR is declining fitness
    })

    it('should fail with invalid RHR values', () => {
      const invalidRecord = { ...mockRHRRecord, resting_hr: 25 } // Too low
      const result = transformRHRRecord(invalidRecord, mockAthleteId)

      expect(result.success).toBe(false)
      expect(result.errors[0]).toContain('Invalid RHR value')
    })

    it('should warn about unusual but valid RHR values', () => {
      const unusualRecord = { ...mockRHRRecord, resting_hr: 105 } // High but valid (101-120 range)
      const result = transformRHRRecord(unusualRecord, mockAthleteId)

      expect(result.success).toBe(true)
      expect(result.warnings.some(w => w.includes('Unusual RHR value'))).toBe(true)
    })
  })

  describe('transformWeightRecord', () => {
    const mockWeightRecord: GarminWeightRecord = {
      day: '2024-09-15',
      weight: 75.2,
      body_fat: 12.5,
      muscle_mass: 34.2,
      bone_mass: 11.3,
      body_water: 58.7
    }

    it('should successfully transform valid weight record', () => {
      const result = transformWeightRecord(mockWeightRecord, mockAthleteId)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.athlete_id).toBe(mockAthleteId)
      expect(result.data?.date).toBe('2024-09-15')
      expect(result.data?.data_type).toBe('weight')
      
      const weightData = result.data?.value_json as any
      expect(weightData.weight_kg).toBe(75.2)
      expect(weightData.body_fat_percent).toBe(12.5)
      expect(weightData.muscle_mass_kg).toBe(34.2)
      expect(weightData.bone_mass_kg).toBe(11.3)
      expect(weightData.body_water_percent).toBe(58.7)
      expect(weightData.bmi).toBeCloseTo(24.6, 1) // Calculated BMI
    })

    it('should handle weight-only record', () => {
      const minimalRecord: GarminWeightRecord = {
        day: '2024-09-15',
        weight: 70.0,
        body_fat: null,
        muscle_mass: null,
        bone_mass: null,
        body_water: null
      }

      const result = transformWeightRecord(minimalRecord, mockAthleteId)

      expect(result.success).toBe(true)
      const weightData = result.data?.value_json as any
      expect(weightData.weight_kg).toBe(70.0)
      expect(weightData.body_fat_percent).toBeNull()
      expect(weightData.muscle_mass_kg).toBeNull()
      expect(weightData.bone_mass_kg).toBeNull()
      expect(weightData.body_water_percent).toBeNull()
      expect(weightData.bmi).toBeCloseTo(22.9, 1)
    })

    it('should fail with invalid weight values', () => {
      const invalidRecord = { ...mockWeightRecord, weight: 25 } // Too low
      const result = transformWeightRecord(invalidRecord, mockAthleteId)

      expect(result.success).toBe(false)
      expect(result.errors[0]).toContain('Invalid weight value')
    })

    it('should warn about unusual body composition values', () => {
      const unusualRecord = { 
        ...mockWeightRecord, 
        body_fat: 2.0, // Very low body fat
        body_water: 80.0 // Very high body water
      }
      
      const result = transformWeightRecord(unusualRecord, mockAthleteId)

      expect(result.success).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('body fat percentage'))).toBe(true)
      expect(result.warnings.some(w => w.includes('body water percentage'))).toBe(true)
    })
  })

  describe('transformWellnessBatch', () => {
    const mockSleepRecords: GarminSleepRecord[] = [
      {
        day: '2024-09-15',
        total_sleep: '7:45:00',
        deep_sleep: '1:30:00',
        light_sleep: '5:15:00',
        rem_sleep: '1:00:00',
        awake: '0:15:00',
        sleep_score: 85,
        bedtime: '22:30:00',
        wake_time: '06:30:00'
      }
    ]

    const mockRHRRecords: GarminRHRRecord[] = [
      { day: '2024-09-15', resting_hr: 52 },
      { day: '2024-09-14', resting_hr: 54 }
    ]

    const mockWeightRecords: GarminWeightRecord[] = [
      {
        day: '2024-09-15',
        weight: 75.2,
        body_fat: 12.5,
        muscle_mass: 34.2,
        bone_mass: 11.3,
        body_water: 58.7
      }
    ]

    it('should successfully transform batch of wellness records', () => {
      const result = transformWellnessBatch(
        mockSleepRecords,
        mockRHRRecords,
        mockWeightRecords,
        mockAthleteId
      )

      expect(result.successful.length).toBe(4) // 1 sleep + 2 RHR + 1 weight
      expect(result.failed.length).toBe(0)
      expect(result.summary.total).toBe(4)
      expect(result.summary.successful).toBe(4)
      expect(result.summary.failed).toBe(0)
      expect(result.summary.sleepCount).toBe(1)
      expect(result.summary.rhrCount).toBe(2)
      expect(result.summary.weightCount).toBe(1)

      // Verify data types
      const sleepRecords = result.successful.filter(r => r.data_type === 'sleep')
      const rhrRecords = result.successful.filter(r => r.data_type === 'rhr')
      const weightRecords = result.successful.filter(r => r.data_type === 'weight')

      expect(sleepRecords.length).toBe(1)
      expect(rhrRecords.length).toBe(2)
      expect(weightRecords.length).toBe(1)
    })

    it('should handle mixed success and failure', () => {
      const invalidSleepRecords: GarminSleepRecord[] = [
        { ...mockSleepRecords[0] }, // Valid
        { day: '', total_sleep: null } as GarminSleepRecord // Invalid
      ]

      const result = transformWellnessBatch(
        invalidSleepRecords,
        mockRHRRecords,
        mockWeightRecords,
        mockAthleteId
      )

      expect(result.successful.length).toBe(4) // 1 valid sleep + 2 RHR + 1 weight
      expect(result.failed.length).toBe(1) // 1 invalid sleep
      expect(result.summary.successful).toBe(4)
      expect(result.summary.failed).toBe(1)
    })
  })

  describe('validateWellnessData', () => {
    it('should validate good quality sleep data', () => {
      const sleepData = {
        wellness_id: 'test-id',
        athlete_id: mockAthleteId,
        date: '2024-09-15',
        data_type: 'sleep' as const,
        value_json: {
          total_minutes: 480,
          deep_minutes: 90,
          light_minutes: 315,
          rem_minutes: 75,
          awake_minutes: 10,
          efficiency: 97.9,
          score: 88
        },
        source_type: 'garmin'
      }

      const result = validateWellnessData(sleepData)

      expect(result.isValid).toBe(true)
      expect(result.qualityScore).toBeGreaterThan(90)
      expect(result.issues.length).toBe(0)
    })

    it('should identify poor quality sleep data', () => {
      const poorSleepData = {
        wellness_id: 'test-id',
        athlete_id: mockAthleteId,
        date: '2024-09-15',
        data_type: 'sleep' as const,
        value_json: {
          total_minutes: 150, // Very short sleep
          deep_minutes: 20,
          light_minutes: 100,
          rem_minutes: 20,
          awake_minutes: 30,
          efficiency: 65, // Low efficiency
          score: 45
        },
        source_type: 'garmin'
      }

      const result = validateWellnessData(poorSleepData)

      expect(result.isValid).toBe(false)
      expect(result.qualityScore).toBeLessThan(80)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('should validate RHR data quality', () => {
      const rhrData = {
        wellness_id: 'test-id',
        athlete_id: mockAthleteId,
        date: '2024-09-15',
        data_type: 'rhr' as const,
        value_json: {
          bpm: 85, // High RHR
          quality: 'poor',
          trend: 'declining'
        },
        source_type: 'garmin'
      }

      const result = validateWellnessData(rhrData)

      expect(result.isValid).toBe(true) // Valid structure
      expect(result.qualityScore).toBeLessThan(90) // But lower quality
      expect(result.recommendations.some(r => r.includes('cardiovascular'))).toBe(true)
    })

    it('should fail validation for missing required fields', () => {
      const invalidData = {
        wellness_id: '',
        athlete_id: '',
        date: '',
        data_type: 'sleep' as const,
        value_json: {},
        source_type: 'garmin'
      }

      const result = validateWellnessData(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.qualityScore).toBeLessThan(50)
      expect(result.issues.some(i => i.includes('Missing required fields'))).toBe(true)
    })
  })
})
