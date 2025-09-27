/**
 * Unit tests for wellness reader utilities
 */

import { WellnessReader, createWellnessReader, getGarminWellnessDbPaths } from '../wellnessReader'

describe('wellnessReader', () => {
  const mockDbPaths = {
    garminDbPath: '/mock/path/garmin.db',
    monitoringDbPath: '/mock/path/garmin_monitoring.db'
  }

  describe('WellnessReader', () => {
    let reader: WellnessReader

    beforeEach(() => {
      reader = new WellnessReader(mockDbPaths)
    })

    describe('readAllWellnessData', () => {
      it('should successfully read all wellness data types', async () => {
        const result = await reader.readAllWellnessData()

        expect(result).toBeDefined()
        expect(result.sleepRecords).toBeDefined()
        expect(result.rhrRecords).toBeDefined()
        expect(result.weightRecords).toBeDefined()
        expect(result.totalRecords).toBeGreaterThan(0)
        expect(result.readTime).toBeGreaterThan(0)
        
        // Verify total records calculation
        const expectedTotal = result.sleepRecords.length + result.rhrRecords.length + result.weightRecords.length
        expect(result.totalRecords).toBe(expectedTotal)
      })

      it('should generate realistic mock data', async () => {
        const result = await reader.readAllWellnessData()

        // Sleep records should have valid structure
        if (result.sleepRecords.length > 0) {
          const sleepRecord = result.sleepRecords[0]
          expect(sleepRecord.day).toMatch(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
          expect(sleepRecord.total_sleep).toMatch(/^\d{1,2}:\d{2}:\d{2}$/) // HH:MM:SS format
          expect(sleepRecord.sleep_score).toBeGreaterThanOrEqual(70)
          expect(sleepRecord.sleep_score).toBeLessThanOrEqual(95)
        }

        // RHR records should have valid values
        if (result.rhrRecords.length > 0) {
          const rhrRecord = result.rhrRecords[0]
          expect(rhrRecord.day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(rhrRecord.resting_hr).toBeGreaterThanOrEqual(45)
          expect(rhrRecord.resting_hr).toBeLessThanOrEqual(65)
        }

        // Weight records should have valid values
        if (result.weightRecords.length > 0) {
          const weightRecord = result.weightRecords[0]
          expect(weightRecord.day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(weightRecord.weight).toBeGreaterThanOrEqual(70)
          expect(weightRecord.weight).toBeLessThanOrEqual(80)
        }
      })

      it('should respect date range filtering', async () => {
        const dateRange = {
          startDate: '2024-07-01',
          endDate: '2024-07-31'
        }
        
        const filteredReader = new WellnessReader({
          ...mockDbPaths,
          dateRange
        })

        const result = await filteredReader.readAllWellnessData()

        // All records should be within the specified date range
        const startDate = new Date(dateRange.startDate)
        const endDate = new Date(dateRange.endDate)

        result.sleepRecords.forEach(record => {
          const recordDate = new Date(record.day)
          expect(recordDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime())
          expect(recordDate.getTime()).toBeLessThanOrEqual(endDate.getTime())
        })

        result.rhrRecords.forEach(record => {
          const recordDate = new Date(record.day)
          expect(recordDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime())
          expect(recordDate.getTime()).toBeLessThanOrEqual(endDate.getTime())
        })

        result.weightRecords.forEach(record => {
          const recordDate = new Date(record.day)
          expect(recordDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime())
          expect(recordDate.getTime()).toBeLessThanOrEqual(endDate.getTime())
        })
      })
    })

    describe('readSleepData', () => {
      it('should read sleep data with proper structure', async () => {
        const sleepRecords = await reader.readSleepData()

        expect(Array.isArray(sleepRecords)).toBe(true)
        
        if (sleepRecords.length > 0) {
          const record = sleepRecords[0]
          expect(record).toHaveProperty('day')
          expect(record).toHaveProperty('total_sleep')
          expect(record).toHaveProperty('deep_sleep')
          expect(record).toHaveProperty('light_sleep')
          expect(record).toHaveProperty('rem_sleep')
          expect(record).toHaveProperty('awake')
          expect(record).toHaveProperty('sleep_score')
          expect(record).toHaveProperty('bedtime')
          expect(record).toHaveProperty('wake_time')
        }
      })

      it('should return records in descending date order', async () => {
        const sleepRecords = await reader.readSleepData()

        if (sleepRecords.length > 1) {
          for (let i = 0; i < sleepRecords.length - 1; i++) {
            const currentDate = new Date(sleepRecords[i].day)
            const nextDate = new Date(sleepRecords[i + 1].day)
            expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime())
          }
        }
      })
    })

    describe('readRestingHRData', () => {
      it('should read RHR data with proper structure', async () => {
        const rhrRecords = await reader.readRestingHRData()

        expect(Array.isArray(rhrRecords)).toBe(true)
        
        if (rhrRecords.length > 0) {
          const record = rhrRecords[0]
          expect(record).toHaveProperty('day')
          expect(record).toHaveProperty('resting_hr')
          expect(typeof record.resting_hr).toBe('number')
        }
      })

      it('should generate realistic RHR values', async () => {
        const rhrRecords = await reader.readRestingHRData()

        rhrRecords.forEach(record => {
          expect(record.resting_hr).toBeGreaterThanOrEqual(45)
          expect(record.resting_hr).toBeLessThanOrEqual(65)
        })
      })
    })

    describe('readWeightData', () => {
      it('should read weight data with proper structure', async () => {
        const weightRecords = await reader.readWeightData()

        expect(Array.isArray(weightRecords)).toBe(true)
        
        if (weightRecords.length > 0) {
          const record = weightRecords[0]
          expect(record).toHaveProperty('day')
          expect(record).toHaveProperty('weight')
          expect(record).toHaveProperty('body_fat')
          expect(record).toHaveProperty('muscle_mass')
          expect(record).toHaveProperty('bone_mass')
          expect(record).toHaveProperty('body_water')
        }
      })

      it('should generate realistic weight values', async () => {
        const weightRecords = await reader.readWeightData()

        weightRecords.forEach(record => {
          expect(record.weight).toBeGreaterThanOrEqual(70)
          expect(record.weight).toBeLessThanOrEqual(80)
          
          if (record.body_fat !== null) {
            expect(record.body_fat).toBeGreaterThanOrEqual(12)
            expect(record.body_fat).toBeLessThanOrEqual(15)
          }
        })
      })

      it('should have sparse weight measurements (not daily)', async () => {
        const weightRecords = await reader.readWeightData()
        const allRecords = await reader.readAllWellnessData()
        
        // Weight records should be less frequent than sleep/RHR
        expect(weightRecords.length).toBeLessThan(allRecords.sleepRecords.length)
        expect(weightRecords.length).toBeLessThan(allRecords.rhrRecords.length)
      })
    })

    describe('validateDatabases', () => {
      it('should validate database paths', async () => {
        const result = await reader.validateDatabases()

        expect(result).toHaveProperty('garminDb')
        expect(result).toHaveProperty('monitoringDb')
        expect(result).toHaveProperty('errors')
        expect(Array.isArray(result.errors)).toBe(true)
      })

      it('should return true for valid paths', async () => {
        const result = await reader.validateDatabases()

        expect(result.garminDb).toBe(true)
        expect(result.monitoringDb).toBe(true)
        expect(result.errors.length).toBe(0)
      })

      it('should return false for invalid paths', async () => {
        const invalidReader = new WellnessReader({
          garminDbPath: '',
          monitoringDbPath: ''
        })

        const result = await invalidReader.validateDatabases()

        expect(result.garminDb).toBe(false)
        expect(result.monitoringDb).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })

    describe('getDatabaseStats', () => {
      it('should return database statistics', async () => {
        const stats = await reader.getDatabaseStats()

        expect(stats).toHaveProperty('garminDb')
        expect(stats).toHaveProperty('monitoringDb')
        
        expect(stats.garminDb).toHaveProperty('path')
        expect(stats.garminDb).toHaveProperty('sleepRecords')
        expect(stats.garminDb).toHaveProperty('weightRecords')
        expect(stats.garminDb).toHaveProperty('dateRange')
        
        expect(stats.monitoringDb).toHaveProperty('path')
        expect(stats.monitoringDb).toHaveProperty('rhrRecords')
        expect(stats.monitoringDb).toHaveProperty('dateRange')
        
        expect(typeof stats.garminDb.sleepRecords).toBe('number')
        expect(typeof stats.garminDb.weightRecords).toBe('number')
        expect(typeof stats.monitoringDb.rhrRecords).toBe('number')
      })
    })
  })

  describe('createWellnessReader', () => {
    it('should create WellnessReader instance with correct paths', () => {
      const reader = createWellnessReader(
        mockDbPaths.garminDbPath,
        mockDbPaths.monitoringDbPath
      )

      expect(reader).toBeInstanceOf(WellnessReader)
    })

    it('should accept additional options', () => {
      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }

      const reader = createWellnessReader(
        mockDbPaths.garminDbPath,
        mockDbPaths.monitoringDbPath,
        { dateRange }
      )

      expect(reader).toBeInstanceOf(WellnessReader)
    })
  })

  describe('getGarminWellnessDbPaths', () => {
    it('should return default paths', () => {
      const paths = getGarminWellnessDbPaths()

      expect(paths).toHaveProperty('garminDb')
      expect(paths).toHaveProperty('monitoringDb')
      expect(paths.garminDb).toContain('garmin.db')
      expect(paths.monitoringDb).toContain('garmin_monitoring.db')
    })

    it('should accept custom base directory', () => {
      const customBaseDir = '/custom/path'
      const paths = getGarminWellnessDbPaths(customBaseDir)

      expect(paths.garminDb).toBe(`${customBaseDir}/garmin.db`)
      expect(paths.monitoringDb).toBe(`${customBaseDir}/garmin_monitoring.db`)
    })
  })

  describe('time conversion utilities', () => {
    it('should convert minutes to time string correctly', () => {
      const reader = new WellnessReader(mockDbPaths)
      
      // Access private method through any cast for testing
      const minutesToTimeString = (reader as any).minutesToTimeString
      
      expect(minutesToTimeString(465)).toBe('07:45:00') // 7 hours 45 minutes
      expect(minutesToTimeString(90)).toBe('01:30:00')  // 1 hour 30 minutes
      expect(minutesToTimeString(30)).toBe('00:30:00')  // 30 minutes
      expect(minutesToTimeString(0)).toBe('00:00:00')   // 0 minutes
    })
  })
})
