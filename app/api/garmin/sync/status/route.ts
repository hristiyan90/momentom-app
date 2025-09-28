/**
 * Sync Status API
 * GET /api/garmin/sync/status - Get current sync status
 * T6: Scheduled Sync and Automation
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase/server'
import { addStandardHeaders, setCacheHint, getAthleteId } from '@/lib/auth/athlete'
import { etagFor } from '@/lib/http/etag'
import { generateCorrelationId } from '@/lib/utils'
import { SyncStatus, GarminSyncConfig, GarminSyncHistory } from '@/lib/garmin/types'

/**
 * GET /api/garmin/sync/status
 * Returns current sync status with ETag caching
 */
export async function GET(request: NextRequest) {
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

    // Fetch sync configuration
    const { data: config, error: configError } = await supabase
      .from('garmin_sync_config')
      .select('*')
      .eq('athlete_id', athleteId)
      .single()

    if (configError && configError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'config_fetch_failed', message: configError.message },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store',
            'X-Request-Id': correlationId
          }
        }
      )
    }

    // Fetch current running sync
    const { data: currentSync } = await supabase
      .from('garmin_sync_history')
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('status', 'running')
      .order('started_at', { ascending: false })
      .limit(1)

    // Fetch last completed sync
    const { data: lastCompletedSync } = await supabase
      .from('garmin_sync_history')
      .select('*')
      .eq('athlete_id', athleteId)
      .in('status', ['completed', 'failed'])
      .order('started_at', { ascending: false })
      .limit(1)

    // Build sync status response
    const syncStatus: SyncStatus = {
      sync_id: currentSync?.[0]?.sync_id,
      is_running: currentSync ? currentSync.length > 0 : false,
      current_sync: currentSync?.[0] as GarminSyncHistory || undefined,
      last_completed_sync: lastCompletedSync?.[0] as GarminSyncHistory || undefined,
      next_scheduled_sync: (config as GarminSyncConfig)?.next_sync_at || null,
      config: config as GarminSyncConfig || {
        config_id: '',
        athlete_id: athleteId,
        enabled: false,
        frequency: 'manual_only',
        preferred_time: '06:00:00',
        data_types: ['activities', 'wellness'],
        garmin_db_path: null,
        garmin_monitoring_db_path: null,
        last_sync_at: null,
        next_sync_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    // Generate ETag and check for conditional request
    const { etag } = etagFor(syncStatus)
    const ifNoneMatch = request.headers.get('if-none-match')
    
    if (ifNoneMatch && ifNoneMatch === etag) {
      const res = new NextResponse(null, { status: 304 })
      addStandardHeaders(res, correlationId)
      setCacheHint(res, 'private, max-age=30, stale-while-revalidate=30') // Shorter cache for status
      res.headers.set('ETag', etag)
      res.headers.set('Vary', 'X-Client-Timezone')
      return res
    }

    // Return status with ETag
    const res = NextResponse.json(syncStatus, { status: 200 })
    addStandardHeaders(res, correlationId)
    setCacheHint(res, 'private, max-age=30, stale-while-revalidate=30')
    res.headers.set('ETag', etag)
    res.headers.set('Vary', 'X-Client-Timezone')
    return res

  } catch (error) {
    console.error('Sync status GET error:', error)
    const res = NextResponse.json(
      {
        error: 'internal_error',
        message: 'Failed to fetch sync status',
        correlationId
      },
      { status: 500 }
    )
    addStandardHeaders(res, correlationId)
    setCacheHint(res, 'no-store')
    return res
  }
}
