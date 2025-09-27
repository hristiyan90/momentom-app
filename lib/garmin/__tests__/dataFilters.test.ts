/**
 * Unit tests for data filtering utilities
 */

import {
  applyTimeRangeFilter,
  applySportsFilter,
  applyFilters,
  generateSqlFilter,
  getFilterStats,
  DEFAULT_FILTER_OPTIONS,
  type GarminActivity
} from '../dataFilters'

describe('dataFilters', () => {
  const mockActivities: GarminActivity[] = [
    {
      activity_id: 1,
      name: 'Morning Run',
      start_time: '2024-07-15 06:00:00',
      sport: 'running',
      distance: 10.5,
      moving_time: '1:00:00'
    },
    {
      activity_id: 2,
      name: 'Evening Bike',
      start_time: '2024-07-20 18:00:00',
      sport: 'cycling',
      distance: 25.0,
      moving_time: '1:30:00'
    },
    {
      activity_id: 3,
      name: 'Pool Swim',
      start_time: '2024-08-05 07:00:00',
      sport: 'swimming',
      distance: 2.0,
      moving_time: '0:45:00'
    },
    {
      activity_id: 4,
      name: 'Gym Session',
      start_time: '2024-06-10 19:00:00',
      sport: 'fitness_equipment',
      distance: null,
      moving_time: '1:15:00'
    },
    {
      activity_id: 5,
      name: 'Mountain Hike',
      start_time: '2025-09-01 09:00:00',
      sport: 'hiking',
      distance: 15.0,
      moving_time: '3:00:00'
    }
  ]

  describe('applyTimeRangeFilter', () => {
    it('should filter activities within date range', () => {
      const filtered = applyTimeRangeFilter(mockActivities, '2024-07-01', '2024-07-31')
      
      expect(filtered).toHaveLength(2)
      expect(filtered.map(a => a.activity_id)).toEqual([1, 2])
    })

    it('should return empty array for invalid date range', () => {
      const filtered = applyTimeRangeFilter(mockActivities, '2025-01-01', '2025-01-31')
      
      expect(filtered).toHaveLength(0)
    })

    it('should handle activities with invalid timestamps', () => {
      const activitiesWithInvalid = [
        ...mockActivities,
        {
          activity_id: 6,
          name: 'Invalid Date',
          start_time: 'invalid-date',
          sport: 'running',
          distance: 5.0,
          moving_time: '0:30:00'
        }
      ]

      const filtered = applyTimeRangeFilter(activitiesWithInvalid, '2024-07-01', '2024-07-31')
      
      expect(filtered).toHaveLength(2) // Should exclude invalid date activity
    })

    it('should include activities on boundary dates', () => {
      const filtered = applyTimeRangeFilter(mockActivities, '2024-07-15', '2024-07-20')
      
      expect(filtered).toHaveLength(2)
      expect(filtered.map(a => a.activity_id)).toEqual([1, 2])
    })
  })

  describe('applySportsFilter', () => {
    it('should filter activities by allowed sports', () => {
      const filtered = applySportsFilter(mockActivities, ['running', 'cycling'])
      
      expect(filtered).toHaveLength(2)
      expect(filtered.map(a => a.sport)).toEqual(['running', 'cycling'])
    })

    it('should handle case-insensitive sport matching', () => {
      const filtered = applySportsFilter(mockActivities, ['RUNNING', 'Cycling'])
      
      expect(filtered).toHaveLength(2)
      expect(filtered.map(a => a.sport)).toEqual(['running', 'cycling'])
    })

    it('should return empty array when no sports match', () => {
      const filtered = applySportsFilter(mockActivities, ['unknown_sport'])
      
      expect(filtered).toHaveLength(0)
    })

    it('should handle activities with null/undefined sport', () => {
      const activitiesWithNullSport = [
        ...mockActivities,
        {
          activity_id: 6,
          name: 'No Sport',
          start_time: '2024-07-01 10:00:00',
          sport: null as any,
          distance: 5.0,
          moving_time: '0:30:00'
        }
      ]

      const filtered = applySportsFilter(activitiesWithNullSport, ['running'])
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].sport).toBe('running')
    })
  })

  describe('applyFilters', () => {
    it('should apply default filters correctly', () => {
      const filtered = applyFilters(mockActivities)
      
      // Should filter by default date range (2024-06-01 to 2025-08-31) and sports (running, cycling, swimming)
      expect(filtered).toHaveLength(3) // running, cycling, swimming within date range
      expect(filtered.map(a => a.sport)).toEqual(['running', 'cycling', 'swimming'])
    })

    it('should apply custom filters', () => {
      const customFilters = {
        startDate: '2024-07-01',
        endDate: '2024-08-31',
        sports: ['running', 'swimming'],
        limit: 10
      }

      const filtered = applyFilters(mockActivities, customFilters)
      
      expect(filtered).toHaveLength(2)
      expect(filtered.map(a => a.sport)).toEqual(['running', 'swimming'])
    })

    it('should apply limit correctly', () => {
      const filtered = applyFilters(mockActivities, { limit: 2 })
      
      expect(filtered).toHaveLength(2)
    })

    it('should handle empty activities array', () => {
      const filtered = applyFilters([])
      
      expect(filtered).toHaveLength(0)
    })

    it('should handle partial filter options', () => {
      const filtered = applyFilters(mockActivities, { sports: ['cycling'] })
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].sport).toBe('cycling')
    })
  })

  describe('generateSqlFilter', () => {
    it('should generate correct SQL WHERE clause with default options', () => {
      const sql = generateSqlFilter()
      
      expect(sql).toContain("WHERE")
      expect(sql).toContain("start_time >= '2024-06-01 00:00:00'")
      expect(sql).toContain("start_time <= '2025-08-31 23:59:59'")
      expect(sql).toContain("sport IN ('running', 'cycling', 'swimming')")
    })

    it('should generate SQL with custom options', () => {
      const options = {
        startDate: '2024-07-01',
        endDate: '2024-07-31',
        sports: ['running']
      }

      const sql = generateSqlFilter(options)
      
      expect(sql).toContain("start_time >= '2024-07-01 00:00:00'")
      expect(sql).toContain("start_time <= '2024-07-31 23:59:59'")
      expect(sql).toContain("sport IN ('running')")
    })

    it('should handle empty options', () => {
      const sql = generateSqlFilter({})
      
      expect(sql).toBe('')
    })

    it('should handle partial options', () => {
      const sql = generateSqlFilter({ sports: ['cycling', 'swimming'] })
      
      expect(sql).toBe("WHERE sport IN ('cycling', 'swimming')")
    })
  })

  describe('getFilterStats', () => {
    it('should calculate filter statistics correctly', () => {
      const stats = getFilterStats(1000, 300, DEFAULT_FILTER_OPTIONS)
      
      expect(stats.original).toBe(1000)
      expect(stats.filtered).toBe(300)
      expect(stats.excluded).toBe(700)
      expect(stats.exclusionRate).toBe(70)
      expect(stats.filters.sports).toBe('running, cycling, swimming')
      expect(stats.filters.timeRange).toBe('2024-06-01 to 2025-08-31')
    })

    it('should handle zero original count', () => {
      const stats = getFilterStats(0, 0, {})
      
      expect(stats.original).toBe(0)
      expect(stats.filtered).toBe(0)
      expect(stats.excluded).toBe(0)
      expect(stats.exclusionRate).toBe(NaN) // Division by zero
    })

    it('should handle custom filter options', () => {
      const customOptions = {
        startDate: '2024-07-01',
        endDate: '2024-07-31',
        sports: ['running'],
        limit: 100
      }

      const stats = getFilterStats(500, 150, customOptions)
      
      expect(stats.filters.timeRange).toBe('2024-07-01 to 2024-07-31')
      expect(stats.filters.sports).toBe('running')
      expect(stats.filters.limit).toBe(100)
    })

    it('should handle missing filter options', () => {
      const stats = getFilterStats(100, 50, {})
      
      expect(stats.filters.timeRange).toBe('None')
      expect(stats.filters.sports).toBe('All')
      expect(stats.filters.limit).toBe('None')
    })
  })

  describe('DEFAULT_FILTER_OPTIONS', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_FILTER_OPTIONS.startDate).toBe('2024-06-01')
      expect(DEFAULT_FILTER_OPTIONS.endDate).toBe('2025-08-31')
      expect(DEFAULT_FILTER_OPTIONS.sports).toEqual(['running', 'cycling', 'swimming'])
      expect(DEFAULT_FILTER_OPTIONS.limit).toBe(500)
    })
  })
})
