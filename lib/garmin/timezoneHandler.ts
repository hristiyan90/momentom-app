/**
 * Timezone handling utilities for GarminDB data conversion
 * Handles timezone conversion and date normalization
 */

import type { TimezoneOptions } from './types'

/**
 * Converts GarminDB timestamp to UTC and extracts date
 * 
 * @param startTime - ISO timestamp from GarminDB (e.g., "2025-08-29 06:15:00")
 * @param options - Timezone conversion options
 * @returns Object with UTC timestamp and date string
 */
export function normalizeTimezone(
  startTime: string,
  options: TimezoneOptions = { targetTimezone: 'UTC' }
): { utcTimestamp: string; date: string } {
  try {
    // Handle GarminDB timestamp format: "YYYY-MM-DD HH:MM:SS"
    let dateTime: Date
    
    if (startTime.includes('T')) {
      // ISO format: "2025-08-29T06:15:00Z" or "2025-08-29T06:15:00"
      dateTime = new Date(startTime)
    } else {
      // GarminDB format: "2025-08-29 06:15:00"
      // Assume local timezone if no timezone info provided
      const isoString = startTime.replace(' ', 'T')
      dateTime = new Date(isoString)
    }
    
    // Validate date
    if (isNaN(dateTime.getTime())) {
      throw new Error(`Invalid date format: ${startTime}`)
    }
    
    // Convert to UTC if needed
    const utcDateTime = options.sourceTimezone 
      ? convertTimezone(dateTime, options.sourceTimezone, 'UTC')
      : dateTime
    
    // Extract date in YYYY-MM-DD format (in UTC)
    const date = utcDateTime.toISOString().split('T')[0]
    
    return {
      utcTimestamp: utcDateTime.toISOString(),
      date
    }
  } catch (error) {
    throw new Error(`Timezone conversion failed for "${startTime}": ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Converts time between timezones
 * 
 * @param date - Date object to convert
 * @param fromTimezone - Source timezone
 * @param toTimezone - Target timezone  
 * @returns Converted Date object
 */
function convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
  // For now, implement basic UTC conversion
  // In a full implementation, would use a library like date-fns-tz
  
  if (toTimezone === 'UTC') {
    // Convert to UTC (most common case for Momentom storage)
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
  }
  
  // For other timezone conversions, return as-is for now
  // TODO: Implement full timezone conversion with proper library
  return date
}

/**
 * Extracts date components for analysis
 * 
 * @param timestamp - ISO timestamp
 * @returns Date components object
 */
export function extractDateComponents(timestamp: string) {
  const date = new Date(timestamp)
  
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1, // 1-based month
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    dayOfWeek: date.getUTCDay(), // 0 = Sunday
    dayOfYear: getDayOfYear(date)
  }
}

/**
 * Gets day of year (1-365/366)
 * 
 * @param date - Date object
 * @returns Day of year number
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getUTCFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Validates timestamp format and range
 * 
 * @param timestamp - Timestamp to validate
 * @returns Validation result
 */
export function validateTimestamp(timestamp: string): { isValid: boolean; error?: string } {
  try {
    const date = new Date(timestamp)
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format' }
    }
    
    // Check reasonable date range (2020-2030)
    const year = date.getFullYear()
    if (year < 2020 || year > 2030) {
      return { isValid: false, error: `Date out of reasonable range: ${year}` }
    }
    
    return { isValid: true }
  } catch (error) {
    return { 
      isValid: false, 
      error: `Timestamp validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Formats duration from GarminDB time string to minutes
 * 
 * @param movingTime - Time string in HH:MM:SS format (e.g., "1:23:45")
 * @returns Duration in minutes
 */
export function parseDurationToMinutes(movingTime: string | null): number {
  if (!movingTime) return 0
  
  try {
    // Handle formats like "1:23:45" or "23:45" or "45"
    const parts = movingTime.split(':').map(p => parseInt(p, 10))
    
    if (parts.length === 3) {
      // HH:MM:SS
      const [hours, minutes, seconds] = parts
      return (hours * 60) + minutes + Math.round(seconds / 60)
    } else if (parts.length === 2) {
      // MM:SS
      const [minutes, seconds] = parts
      return minutes + Math.round(seconds / 60)
    } else if (parts.length === 1) {
      // SS (seconds only)
      return Math.round(parts[0] / 60)
    }
    
    throw new Error(`Unexpected time format: ${movingTime}`)
  } catch (error) {
    throw new Error(`Duration parsing failed for "${movingTime}": ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Gets timezone offset for debugging/analysis
 * 
 * @param date - Date to get offset for
 * @returns Timezone offset information
 */
export function getTimezoneInfo(date: Date = new Date()) {
  return {
    offsetMinutes: date.getTimezoneOffset(),
    offsetHours: date.getTimezoneOffset() / 60,
    isDST: isDaylightSavingTime(date),
    localTime: date.toLocaleString(),
    utcTime: date.toISOString()
  }
}

/**
 * Simple daylight saving time detection
 * 
 * @param date - Date to check
 * @returns True if date is during DST
 */
function isDaylightSavingTime(date: Date): boolean {
  const january = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
  const july = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
  return Math.max(january, july) !== date.getTimezoneOffset()
}
