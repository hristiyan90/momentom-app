/**
 * Unit tests for sport mapping utilities
 */

import { 
  mapSportType,
  getSupportedGarminSports,
  getMomentomSports,
  isValidGarminSport,
  getSportMappingStats
} from '../sportMapping'

describe('sportMapping', () => {
  describe('mapSportType', () => {
    it('should map running sports to run', () => {
      expect(mapSportType('running')).toBe('run')
      expect(mapSportType('walking')).toBe('run')
      expect(mapSportType('hiking')).toBe('run')
    })

    it('should map cycling to bike', () => {
      expect(mapSportType('cycling')).toBe('bike')
    })

    it('should map swimming to swim', () => {
      expect(mapSportType('swimming')).toBe('swim')
    })

    it('should map fitness activities to strength', () => {
      expect(mapSportType('fitness_equipment')).toBe('strength')
      expect(mapSportType('snowboarding')).toBe('strength')
      expect(mapSportType('rock_climbing')).toBe('strength')
    })

    it('should handle unknown enum values', () => {
      expect(mapSportType('UnknownEnumValue_54')).toBe('strength')
    })

    it('should handle case variations', () => {
      expect(mapSportType('RUNNING')).toBe('run')
      expect(mapSportType('Running')).toBe('run')
      expect(mapSportType(' cycling ')).toBe('bike')
    })

    it('should use fuzzy matching for variations', () => {
      expect(mapSportType('marathon_running')).toBe('run')
      expect(mapSportType('bike_riding')).toBe('bike')
      expect(mapSportType('pool_swimming')).toBe('swim')
      expect(mapSportType('weight_training')).toBe('strength')
    })

    it('should fallback to strength for unknown sports', () => {
      expect(mapSportType('unknown_sport')).toBe('strength')
      expect(mapSportType('')).toBe('strength')
      expect(mapSportType('yoga')).toBe('strength')
    })
  })

  describe('getSupportedGarminSports', () => {
    it('should return all supported Garmin sports', () => {
      const sports = getSupportedGarminSports()
      expect(sports).toContain('running')
      expect(sports).toContain('cycling')
      expect(sports).toContain('swimming')
      expect(sports).toContain('fitness_equipment')
      expect(sports.length).toBe(9)
    })
  })

  describe('getMomentomSports', () => {
    it('should return all Momentom sport categories', () => {
      const sports = getMomentomSports()
      expect(sports).toEqual(['run', 'bike', 'swim', 'strength', 'mobility'])
    })
  })

  describe('isValidGarminSport', () => {
    it('should validate known Garmin sports', () => {
      expect(isValidGarminSport('running')).toBe(true)
      expect(isValidGarminSport('cycling')).toBe(true)
      expect(isValidGarminSport('unknown_sport')).toBe(false)
    })

    it('should handle case insensitive validation', () => {
      expect(isValidGarminSport('RUNNING')).toBe(true)
      expect(isValidGarminSport('Running')).toBe(true)
    })
  })

  describe('getSportMappingStats', () => {
    it('should return mapping statistics', () => {
      const stats = getSportMappingStats()
      
      expect(stats.totalGarminSports).toBe(9)
      expect(stats.totalMomentomSports).toBe(5)
      expect(stats.mapping.run).toContain('running')
      expect(stats.mapping.run).toContain('walking')
      expect(stats.mapping.bike).toContain('cycling')
      expect(stats.mapping.swim).toContain('swimming')
      expect(stats.mapping.strength.length).toBeGreaterThan(0)
    })
  })
})
