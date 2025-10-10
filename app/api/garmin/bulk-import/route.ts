/**
 * Bulk import API endpoint for GarminDB activities
 * POST /api/garmin/bulk-import
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase/server'
import { getAthleteId } from '@/lib/auth/athlete'
import { BulkImportService, type BulkImportOptions } from '@/lib/garmin/bulkImport'
import { DEFAULT_FILTER_OPTIONS, type FilterOptions } from '@/lib/garmin/dataFilters'
import { getGarminDbPaths } from '@/lib/garmin/sqliteReader'

interface BulkImportRequest {
  dbPath?: string // Optional: custom path to GarminDB files
  filters?: {
    startDate?: string
    endDate?: string
    sports?: string[]
    limit?: number
  }
  batchSize?: number
  dryRun?: boolean // For testing without actual imports
}

/**
 * POST /api/garmin/bulk-import
 * Imports filtered activities from GarminDB to Momentom sessions
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: BulkImportRequest = await request.json()
    
    // Get athlete_id from auth (using existing auth pattern)
    const supabase = serverClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'authentication_required', message: 'Valid JWT token required' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer error="invalid_token"',
            'Cache-Control': 'no-store',
            'X-Request-Id': crypto.randomUUID()
          }
        }
      )
    }

    // Extract athlete_id from user metadata or fallback to sub
    const athleteId = user.user_metadata?.athlete_id || user.id
    
    if (!athleteId) {
      return NextResponse.json(
        { error: 'invalid_athlete_id', message: 'Unable to determine athlete ID' },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
            'X-Request-Id': crypto.randomUUID()
          }
        }
      )
    }

    // Validate and set up import options
    const filters: FilterOptions = {
      ...DEFAULT_FILTER_OPTIONS,
      ...body.filters
    }

    // Validate date range
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate)
      const endDate = new Date(filters.endDate)
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: 'invalid_date_range', message: 'Start date must be before end date' },
          { 
            status: 400,
            headers: {
              'Cache-Control': 'no-store',
              'X-Request-Id': crypto.randomUUID()
            }
          }
        )
      }
    }

    // Validate sports filter
    const allowedSports = ['running', 'cycling', 'swimming', 'walking', 'hiking', 'fitness_equipment']
    if (filters.sports) {
      const invalidSports = filters.sports.filter(sport => !allowedSports.includes(sport))
      if (invalidSports.length > 0) {
        return NextResponse.json(
          { 
            error: 'invalid_sports', 
            message: `Invalid sports: ${invalidSports.join(', ')}. Allowed: ${allowedSports.join(', ')}` 
          },
          { 
            status: 400,
            headers: {
              'Cache-Control': 'no-store',
              'X-Request-Id': crypto.randomUUID()
            }
          }
        )
      }
    }

    // Set up database path
    const dbPath = body.dbPath || getGarminDbPaths().activities

    // Configure import options
    const importOptions: BulkImportOptions = {
      athleteId,
      dbPath,
      filters,
      batchSize: Math.min(body.batchSize || 50, 100), // Cap at 100 for safety
      dryRun: body.dryRun || false
    }

    // Execute bulk import
    const importService = new BulkImportService()
    const result = await importService.importActivities(importOptions)

    // Return results
    const responseData = {
      success: result.success,
      message: result.success 
        ? `Successfully imported ${result.summary.successfulImports} activities`
        : `Import completed with errors. ${result.summary.successfulImports} successful, ${result.summary.failedImports} failed`,
      summary: result.summary,
      filterStats: result.filterStats,
      ...(result.errors.length > 0 && { 
        errors: result.errors.slice(0, 10), // Limit errors in response
        totalErrors: result.errors.length 
      }),
      ...(body.dryRun && { note: 'Dry run - no data was actually imported' })
    }

    const statusCode = result.success ? 200 : 207 // 207 Multi-Status for partial success

    return NextResponse.json(responseData, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store',
        'X-Request-Id': crypto.randomUUID(),
        'X-Processing-Time': `${result.summary.processingTime}ms`
      }
    })

  } catch (error) {
    console.error('Bulk import error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'import_failed', 
        message: 'Bulk import failed',
        details: errorMessage
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'X-Request-Id': crypto.randomUUID()
        }
      }
    )
  }
}

/**
 * GET /api/garmin/bulk-import
 * Returns information about available import options and database status
 */
export async function GET(request: NextRequest) {
  try {
    // Get athlete_id from auth
    const supabase = serverClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'authentication_required', message: 'Valid JWT token required' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer error="invalid_token"',
            'Cache-Control': 'private, max-age=60',
            'X-Request-Id': crypto.randomUUID()
          }
        }
      )
    }

    const athleteId = user.user_metadata?.athlete_id || user.id

    // Get current import statistics
    const { data: existingSessions, error: queryError } = await supabase
      .from('sessions')
      .select('session_id, date, sport, source_file_type, metadata')
      .eq('athlete_id', athleteId)
      .eq('source_file_type', 'garmin')
      .order('date', { ascending: false })
      .limit(10)

    if (queryError) {
      console.warn('Failed to query existing sessions:', queryError)
    }

    const garminDbPaths = getGarminDbPaths()
    
    const responseData = {
      status: 'ready',
      defaultFilters: DEFAULT_FILTER_OPTIONS,
      allowedSports: ['running', 'cycling', 'swimming', 'walking', 'hiking', 'fitness_equipment'],
      expectedDbPaths: garminDbPaths,
      existingImports: {
        count: existingSessions?.length || 0,
        latestDate: existingSessions?.[0]?.date || null,
        sports: [...new Set(existingSessions?.map(s => s.sport) || [])],
        recentSessions: existingSessions?.slice(0, 5).map(s => ({
          date: s.date,
          sport: s.sport,
          garminId: s.metadata?.garmin_activity_id
        })) || []
      },
      limits: {
        maxBatchSize: 100,
        maxActivities: 1000,
        timeoutMinutes: 10
      }
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minutes cache
        'X-Request-Id': crypto.randomUUID(),
        'ETag': `"${Buffer.from(JSON.stringify(responseData)).toString('base64')}"`
      }
    })

  } catch (error) {
    console.error('Bulk import info error:', error)
    
    return NextResponse.json(
      { 
        error: 'info_failed', 
        message: 'Failed to get import information'
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'X-Request-Id': crypto.randomUUID()
        }
      }
    )
  }
}
