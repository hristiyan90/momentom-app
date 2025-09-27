/**
 * Unit tests for timezone handling utilities
 */

import {
  normalizeTimezone,
  extractDateComponents,
  validateTimestamp,
  parseDurationToMinutes,
  getTimezoneInfo
} from '../timezoneHandler'

describe('timezoneHandler', () => {
  describe('normalizeTimezone', () => {
    it('should handle GarminDB timestamp format', () => {
      const result = normalizeTimezone('2025-08-29 06:15:00')
      
      expect(result.date).toBe('2025-08-29')
      expect(result.utcTimestamp).toMatch(/2025-08-29T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    })

    it('should handle ISO timestamp format', () => {
      const result = normalizeTimezone('2025-08-29T06:15:00Z')
      
      expect(result.date).toBe('2025-08-29')
      expect(result.utcTimestamp).toBe('2025-08-29T06:15:00.000Z')
    })

    it('should handle ISO timestamp without Z', () => {
      const result = normalizeTimezone('2025-08-29T06:15:00')
      
      expect(result.date).toBe('2025-08-29')
      expect(result.utcTimestamp).toMatch(/2025-08-29T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    })

    it('should throw error for invalid timestamp', () => {
      expect(() => normalizeTimezone('invalid-date')).toThrow()
      expect(() => normalizeTimezone('')).toThrow()
      expect(() => normalizeTimezone('2025-13-45 25:00:00')).toThrow()
    })
  })

  describe('extractDateComponents', () => {
    it('should extract correct date components', () => {
      const components = extractDateComponents('2025-08-29T14:30:45Z')
      
      expect(components.year).toBe(2025)
      expect(components.month).toBe(8)
      expect(components.day).toBe(29)
      expect(components.hour).toBe(14)
      expect(components.minute).toBe(30)
      expect(components.dayOfWeek).toBe(5) // Friday
      expect(components.dayOfYear).toBeGreaterThan(200)
    })
  })

  describe('validateTimestamp', () => {
    it('should validate correct timestamps', () => {
      expect(validateTimestamp('2025-08-29T14:30:45Z')).toEqual({ isValid: true })
      expect(validateTimestamp('2024-01-01T00:00:00Z')).toEqual({ isValid: true })
    })

    it('should reject invalid timestamps', () => {
      const result = validateTimestamp('invalid-date')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid date format')
    })

    it('should reject dates outside reasonable range', () => {
      const result1 = validateTimestamp('2019-01-01T00:00:00Z')
      expect(result1.isValid).toBe(false)
      expect(result1.error).toContain('out of reasonable range')

      const result2 = validateTimestamp('2031-01-01T00:00:00Z')
      expect(result2.isValid).toBe(false)
      expect(result2.error).toContain('out of reasonable range')
    })
  })

  describe('parseDurationToMinutes', () => {
    it('should parse HH:MM:SS format', () => {
      expect(parseDurationToMinutes('1:23:45')).toBe(84) // 60 + 23 + 1 (rounded)
      expect(parseDurationToMinutes('0:30:00')).toBe(30)
      expect(parseDurationToMinutes('2:00:30')).toBe(121) // 120 + 1 (rounded)
    })

    it('should parse MM:SS format', () => {
      expect(parseDurationToMinutes('45:30')).toBe(46) // 45 + 1 (rounded)
      expect(parseDurationToMinutes('30:00')).toBe(30)
    })

    it('should parse SS format', () => {
      expect(parseDurationToMinutes('90')).toBe(2) // 90 seconds = 1.5 minutes, rounded to 2
      expect(parseDurationToMinutes('30')).toBe(1) // 30 seconds = 0.5 minutes, rounded to 1
    })

    it('should handle null/empty input', () => {
      expect(parseDurationToMinutes(null)).toBe(0)
      expect(parseDurationToMinutes('')).toBe(0)
    })

    it('should throw error for invalid format', () => {
      expect(() => parseDurationToMinutes('invalid')).toThrow()
      expect(() => parseDurationToMinutes('1:2:3:4')).toThrow()
    })
  })

  describe('getTimezoneInfo', () => {
    it('should return timezone information', () => {
      const info = getTimezoneInfo()
      
      expect(typeof info.offsetMinutes).toBe('number')
      expect(typeof info.offsetHours).toBe('number')
      expect(typeof info.isDST).toBe('boolean')
      expect(typeof info.localTime).toBe('string')
      expect(typeof info.utcTime).toBe('string')
      expect(info.utcTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    })
  })
})
