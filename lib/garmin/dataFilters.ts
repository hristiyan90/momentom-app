/**
 * Data filtering utilities for GarminDB bulk import
 * Filters activities by time range and sport type per T4 requirements
 */

export interface FilterOptions {
  startDate?: string // YYYY-MM-DD format
  endDate?: string // YYYY-MM-DD format
  sports?: string[] // Array of sport types to include
  limit?: number // Maximum number of activities to process
}

export interface GarminActivity {
  activity_id: number
  name: string | null
  start_time: string // ISO timestamp
  sport: string
  distance: number | null
  moving_time: string | null
  // Additional fields as needed
}

/**
 * Default filter configuration for T4 implementation
 */
export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  startDate: '2024-06-01',
  endDate: '2025-08-31',
  sports: ['running', 'cycling', 'swimming'],
  limit: 500 // Safety limit
}

/**
 * Applies time range filter to activities
 * 
 * @param activities - Array of GarminDB activities
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Filtered activities within date range
 */
export function applyTimeRangeFilter(
  activities: GarminActivity[],
  startDate: string,
  endDate: string
): GarminActivity[] {
  const start = new Date(startDate + 'T00:00:00Z')
  const end = new Date(endDate + 'T23:59:59Z')
  
  return activities.filter(activity => {
    if (!activity.start_time) return false
    
    try {
      // Handle GarminDB timestamp format: "YYYY-MM-DD HH:MM:SS"
      const activityDate = new Date(activity.start_time.replace(' ', 'T') + 'Z')
      return activityDate >= start && activityDate <= end
    } catch (error) {
      console.warn(`Invalid date format for activity ${activity.activity_id}: ${activity.start_time}`)
      return false
    }
  })
}

/**
 * Applies sports filter to activities
 * 
 * @param activities - Array of GarminDB activities
 * @param allowedSports - Array of sport types to include
 * @returns Filtered activities matching allowed sports
 */
export function applySportsFilter(
  activities: GarminActivity[],
  allowedSports: string[]
): GarminActivity[] {
  const normalizedSports = allowedSports.map(sport => sport.toLowerCase().trim())
  
  return activities.filter(activity => {
    if (!activity.sport) return false
    
    const normalizedSport = activity.sport.toLowerCase().trim()
    return normalizedSports.includes(normalizedSport)
  })
}

/**
 * Applies all filters to activities based on filter options
 * 
 * @param activities - Array of GarminDB activities
 * @param options - Filter options
 * @returns Filtered activities
 */
export function applyFilters(
  activities: GarminActivity[],
  options: FilterOptions = DEFAULT_FILTER_OPTIONS
): GarminActivity[] {
  let filtered = activities

  // Apply time range filter
  if (options.startDate && options.endDate) {
    filtered = applyTimeRangeFilter(filtered, options.startDate, options.endDate)
  }

  // Apply sports filter
  if (options.sports && options.sports.length > 0) {
    filtered = applySportsFilter(filtered, options.sports)
  }

  // Apply limit
  if (options.limit && filtered.length > options.limit) {
    filtered = filtered.slice(0, options.limit)
  }

  return filtered
}

/**
 * Generates SQL WHERE clause for filtering activities in GarminDB
 * 
 * @param options - Filter options
 * @returns SQL WHERE clause string
 */
export function generateSqlFilter(options: FilterOptions = DEFAULT_FILTER_OPTIONS): string {
  const conditions: string[] = []

  // Time range filter
  if (options.startDate) {
    conditions.push(`start_time >= '${options.startDate} 00:00:00'`)
  }
  if (options.endDate) {
    conditions.push(`start_time <= '${options.endDate} 23:59:59'`)
  }

  // Sports filter
  if (options.sports && options.sports.length > 0) {
    const sportsClause = options.sports.map(sport => `'${sport}'`).join(', ')
    conditions.push(`sport IN (${sportsClause})`)
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
}

/**
 * Gets filter statistics for reporting
 * 
 * @param originalCount - Original number of activities
 * @param filteredCount - Number of activities after filtering
 * @param options - Filter options used
 * @returns Filter statistics object
 */
export function getFilterStats(
  originalCount: number,
  filteredCount: number,
  options: FilterOptions
) {
  return {
    original: originalCount,
    filtered: filteredCount,
    excluded: originalCount - filteredCount,
    exclusionRate: Math.round(((originalCount - filteredCount) / originalCount) * 100),
    filters: {
      timeRange: options.startDate && options.endDate 
        ? `${options.startDate} to ${options.endDate}`
        : 'None',
      sports: options.sports?.join(', ') || 'All',
      limit: options.limit || 'None'
    }
  }
}
