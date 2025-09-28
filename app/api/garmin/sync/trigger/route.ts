/**
 * Manual Sync Trigger API
 * POST /api/garmin/sync/trigger - Trigger immediate sync
 * T6: Scheduled Sync and Automation
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase/server'
import { addStandardHeaders, setCacheHint, getAthleteId } from '@/lib/auth/athlete'
import { generateCorrelationId } from '@/lib/utils'
import { SyncRequest, GarminSyncConfig } from '@/lib/garmin/types'
import { BackgroundSyncService } from '@/lib/garmin/backgroundSync'

/**
 * POST /api/garmin/sync/trigger
 * Triggers a manual sync operation
 */
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    const supabase = serverClient()
    
    // Get authenticated athlete ID (supports dev mode)
    const athleteId = await getAthleteId(request)
    if (!athleteId) {
      return NextResponse.json(
        { error: 'authentication_required', message: 'Valid JWT token required' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer error="invalid_token"',
            'Cache-Control': 'no-store',
            'X-Request-Id': correlationId
          }
        }
      )
    }

    // Parse request body
    const syncRequest: SyncRequest = await request.json()

    // Validate request
    const validationError = validateSyncRequest(syncRequest)
    if (validationError) {
      return NextResponse.json(
        { error: 'validation_error', message: validationError },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
            'X-Request-Id': correlationId
          }
        }
      )
    }

    // Check if user already has a running sync
    const { data: runningSyncs } = await supabase
      .from('garmin_sync_history')
      .select('sync_id, started_at')
      .eq('athlete_id', athleteId)
      .eq('status', 'running')
      .limit(1)

    if (runningSyncs && runningSyncs.length > 0) {
      return NextResponse.json(
        { 
          error: 'sync_already_running', 
          message: 'A sync operation is already in progress',
          running_sync_id: runningSyncs[0].sync_id,
          started_at: runningSyncs[0].started_at
        },
        { 
          status: 409,
          headers: {
            'Cache-Control': 'no-store',
            'X-Request-Id': correlationId
          }
        }
      )
    }

    // Get user's sync configuration
    const { data: config } = await supabase
      .from('garmin_sync_config')
      .select('*')
      .eq('athlete_id', athleteId)
      .single()

    // Use default data types if not specified in request
    const dataTypes = syncRequest.data_types || (config as GarminSyncConfig)?.data_types || ['activities', 'wellness']

    // Trigger background sync
    const backgroundSyncService = new BackgroundSyncService()
    const syncResult = await backgroundSyncService.syncUserData({
      athlete_id: athleteId,
      sync_type: 'manual',
      data_types: dataTypes as ('activities' | 'wellness')[],
      force_refresh: syncRequest.force_refresh || false,
      dry_run: syncRequest.dry_run || false,
      config: config as GarminSyncConfig || undefined
    })

    // Return sync result
    const res = NextResponse.json({
      success: true,
      message: 'Manual sync initiated',
      sync_result: syncResult
    }, { status: 202 }) // 202 Accepted for async operation
    
    addStandardHeaders(res, correlationId)
    setCacheHint(res, 'no-store')
    return res

  } catch (error) {
    console.error('Manual sync trigger error:', error)
    const res = NextResponse.json(
      {
        error: 'sync_trigger_failed',
        message: error instanceof Error ? error.message : 'Failed to trigger sync',
        correlationId
      },
      { status: 500 }
    )
    addStandardHeaders(res, correlationId)
    setCacheHint(res, 'no-store')
    return res
  }
}

/**
 * Validate sync request input
 */
function validateSyncRequest(request: SyncRequest): string | null {
  if (request.data_types) {
    const validTypes = ['activities', 'wellness']
    const invalidTypes = request.data_types.filter(type => !validTypes.includes(type))
    if (invalidTypes.length > 0) {
      return `Invalid data_types: ${invalidTypes.join(', ')}. Must be activities and/or wellness`
    }
    if (request.data_types.length === 0) {
      return 'data_types cannot be empty'
    }
  }

  return null
}
