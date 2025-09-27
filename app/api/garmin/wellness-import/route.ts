/**
 * Wellness import API endpoint for GarminDB wellness data
 * POST /api/garmin/wellness-import - Import wellness data
 * GET /api/garmin/wellness-import - Get import status and configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase/server'
import { WellnessReader, getGarminWellnessDbPaths } from '@/lib/garmin/wellnessReader'
import { transformWellnessBatch } from '@/lib/garmin/wellnessTransform'
import type { MomentomWellnessData, WellnessBatchResult } from '@/lib/garmin/types'

interface WellnessImportRequest {
  garminDbPath?: string // Optional: custom path to garmin.db
  monitoringDbPath?: string // Optional: custom path to garmin_monitoring.db
  dateRange?: {
    startDate: string // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
  }
  dataTypes?: ('sleep' | 'rhr' | 'weight')[] // Optional: filter data types
  dryRun?: boolean // For testing without actual imports
}

interface WellnessImportResponse {
  success: boolean
  message: string
  summary: {
    total_processed: number
    successful_imports: number
    failed_imports: number
    sleep_records: number
    rhr_records: number
    weight_records: number
    processing_time_ms: number
    duplicate_skipped: number
  }
  errors?: Array<{
    record_id: string
    error: string
    data_type: string
  }>
  imported_wellness_ids?: string[]
}

/**
 * POST /api/garmin/wellness-import
 * Imports wellness data from GarminDB to Momentom wellness_data table
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: WellnessImportRequest = await request.json()
    
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
            'Cache-Control': 'no-store',
            'X-Request-Id': crypto.randomUUID()
          }
        }
      )
    }

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

    // Set up database paths
    const dbPaths = getGarminWellnessDbPaths()
    const garminDbPath = body.garminDbPath || dbPaths.garminDb
    const monitoringDbPath = body.monitoringDbPath || dbPaths.monitoringDb

    // Validate date range
    if (body.dateRange) {
      const startDate = new Date(body.dateRange.startDate)
      const endDate = new Date(body.dateRange.endDate)
      
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

    // Create wellness reader
    const reader = new WellnessReader({
      garminDbPath,
      monitoringDbPath,
      dateRange: body.dateRange
    })

    // Validate databases
    const dbValidation = await reader.validateDatabases()
    if (!dbValidation.garminDb || !dbValidation.monitoringDb) {
      return NextResponse.json(
        { 
          error: 'invalid_databases', 
          message: 'Unable to access GarminDB files',
          details: dbValidation.errors
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

    const startTime = Date.now()

    // Read wellness data from GarminDB
    const wellnessData = await reader.readAllWellnessData()

    // Filter by data types if specified
    let sleepRecords = wellnessData.sleepRecords
    let rhrRecords = wellnessData.rhrRecords
    let weightRecords = wellnessData.weightRecords

    if (body.dataTypes && body.dataTypes.length > 0) {
      if (!body.dataTypes.includes('sleep')) sleepRecords = []
      if (!body.dataTypes.includes('rhr')) rhrRecords = []
      if (!body.dataTypes.includes('weight')) weightRecords = []
    }

    // Transform wellness data
    const transformResult = transformWellnessBatch(
      sleepRecords,
      rhrRecords,
      weightRecords,
      athleteId
    )

    let duplicateCount = 0
    let importedWellnessIds: string[] = []

    // Import to database (unless dry run)
    if (!body.dryRun && transformResult.successful.length > 0) {
      const importResult = await importWellnessData(
        supabase,
        transformResult.successful,
        athleteId
      )
      duplicateCount = importResult.duplicateCount
      importedWellnessIds = importResult.importedIds
    }

    const processingTime = Date.now() - startTime

    // Prepare response
    const response: WellnessImportResponse = {
      success: transformResult.failed.length === 0 || transformResult.successful.length > 0,
      message: body.dryRun 
        ? `Dry run completed. Would import ${transformResult.successful.length} wellness records`
        : `Successfully imported ${transformResult.successful.length} wellness records`,
      summary: {
        total_processed: transformResult.summary.total,
        successful_imports: transformResult.successful.length,
        failed_imports: transformResult.failed.length,
        sleep_records: transformResult.summary.sleepCount,
        rhr_records: transformResult.summary.rhrCount,
        weight_records: transformResult.summary.weightCount,
        processing_time_ms: processingTime,
        duplicate_skipped: duplicateCount
      },
      ...(transformResult.failed.length > 0 && {
        errors: transformResult.failed.map(f => ({
          record_id: f.record.day || 'unknown',
          error: f.errors.join('; '),
          data_type: f.type
        }))
      }),
      ...(importedWellnessIds.length > 0 && { imported_wellness_ids: importedWellnessIds })
    }

    const statusCode = transformResult.failed.length > 0 ? 207 : 200 // 207 Multi-Status for partial success

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store',
        'X-Request-Id': crypto.randomUUID(),
        'X-Processing-Time': `${processingTime}ms`
      }
    })

  } catch (error) {
    console.error('Wellness import error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'import_failed', 
        message: 'Wellness import failed',
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
 * GET /api/garmin/wellness-import
 * Returns information about wellness import options and current data status
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

    // Get current wellness data statistics
    const { data: existingWellness, error: queryError } = await supabase
      .from('wellness_data')
      .select('wellness_id, date, data_type, source_type, metadata')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: false })
      .limit(20)

    if (queryError) {
      console.warn('Failed to query existing wellness data:', queryError)
    }

    // Aggregate statistics
    const stats = {
      total_records: existingWellness?.length || 0,
      sleep_records: existingWellness?.filter(w => w.data_type === 'sleep').length || 0,
      rhr_records: existingWellness?.filter(w => w.data_type === 'rhr').length || 0,
      weight_records: existingWellness?.filter(w => w.data_type === 'weight').length || 0,
      latest_date: existingWellness?.[0]?.date || null,
      oldest_date: existingWellness?.[existingWellness.length - 1]?.date || null,
      sources: [...new Set(existingWellness?.map(w => w.source_type) || [])]
    }

    const dbPaths = getGarminWellnessDbPaths()
    
    const responseData = {
      status: 'ready',
      expected_db_paths: dbPaths,
      supported_data_types: ['sleep', 'rhr', 'weight'],
      current_data: stats,
      recent_records: existingWellness?.slice(0, 10).map(w => ({
        date: w.date,
        data_type: w.data_type,
        source_type: w.source_type
      })) || [],
      limits: {
        max_records_per_import: 2000,
        max_date_range_days: 365,
        timeout_minutes: 5
      },
      import_options: {
        dry_run: 'Test import without saving data',
        date_range: 'Filter by start and end date (YYYY-MM-DD)',
        data_types: 'Filter by wellness data types: sleep, rhr, weight'
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
    console.error('Wellness import info error:', error)
    
    return NextResponse.json(
      { 
        error: 'info_failed', 
        message: 'Failed to get wellness import information'
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
 * Imports wellness data to the database with duplicate handling
 */
async function importWellnessData(
  supabase: any,
  wellnessRecords: MomentomWellnessData[],
  athleteId: string
): Promise<{
  importedIds: string[]
  duplicateCount: number
  errors: string[]
}> {
  const importedIds: string[] = []
  const errors: string[] = []
  let duplicateCount = 0

  for (const record of wellnessRecords) {
    try {
      // Check for existing record (athlete_id, date, data_type is unique)
      const { data: existing } = await supabase
        .from('wellness_data')
        .select('wellness_id')
        .eq('athlete_id', athleteId)
        .eq('date', record.date)
        .eq('data_type', record.data_type)
        .limit(1)

      if (existing && existing.length > 0) {
        duplicateCount++
        continue
      }

      // Insert new record
      const { data, error } = await supabase
        .from('wellness_data')
        .insert({
          wellness_id: record.wellness_id,
          athlete_id: record.athlete_id,
          date: record.date,
          data_type: record.data_type,
          value_json: record.value_json,
          source_type: record.source_type,
          metadata: record.metadata || {}
        })
        .select('wellness_id')

      if (error) {
        errors.push(`Failed to insert ${record.data_type} record for ${record.date}: ${error.message}`)
      } else {
        importedIds.push(record.wellness_id)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Import error for ${record.data_type} record ${record.date}: ${errorMessage}`)
    }
  }

  return {
    importedIds,
    duplicateCount,
    errors
  }
}
