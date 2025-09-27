/**
 * Sync History API
 * GET /api/garmin/sync/history - Get sync history with pagination
 * T6: Scheduled Sync and Automation
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase/server'
import { addStandardHeaders, setCacheHint } from '@/lib/auth/athlete'
import { etagFor } from '@/lib/http/etag'
import { generateCorrelationId } from '@/lib/utils'
import { GarminSyncHistory } from '@/lib/garmin/types'

interface SyncHistoryResponse {
  history: GarminSyncHistory[]
  pagination: {
    page: number
    limit: number
    total_count: number
    has_more: boolean
  }
}

/**
 * GET /api/garmin/sync/history
 * Returns paginated sync history with ETag caching
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    const supabase = serverClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
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

    const athleteId = user.id

    // Parse query parameters
    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
    const status = url.searchParams.get('status') // Optional status filter
    const syncType = url.searchParams.get('sync_type') // Optional sync type filter

    // Build query
    let query = supabase
      .from('garmin_sync_history')
      .select('*', { count: 'exact' })
      .eq('athlete_id', athleteId)
      .order('started_at', { ascending: false })

    // Apply filters
    if (status && ['running', 'completed', 'failed', 'cancelled'].includes(status)) {
      query = query.eq('status', status)
    }
    if (syncType && ['scheduled', 'manual'].includes(syncType)) {
      query = query.eq('sync_type', syncType)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: history, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'history_fetch_failed', message: error.message },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store',
            'X-Request-Id': correlationId
          }
        }
      )
    }

    // Build response
    const response: SyncHistoryResponse = {
      history: (history || []) as GarminSyncHistory[],
      pagination: {
        page,
        limit,
        total_count: count || 0,
        has_more: (count || 0) > offset + limit
      }
    }

    // Generate ETag and check for conditional request
    const { etag } = etagFor(response)
    const ifNoneMatch = request.headers.get('if-none-match')
    
    if (ifNoneMatch && ifNoneMatch === etag) {
      const res = new NextResponse(null, { status: 304 })
      addStandardHeaders(res, correlationId)
      setCacheHint(res, 'private, max-age=60, stale-while-revalidate=60')
      res.headers.set('ETag', etag)
      res.headers.set('Vary', 'X-Client-Timezone')
      return res
    }

    // Return history with ETag
    const res = NextResponse.json(response, { status: 200 })
    addStandardHeaders(res, correlationId)
    setCacheHint(res, 'private, max-age=60, stale-while-revalidate=60')
    res.headers.set('ETag', etag)
    res.headers.set('Vary', 'X-Client-Timezone')
    return res

  } catch (error) {
    console.error('Sync history GET error:', error)
    const res = NextResponse.json(
      {
        error: 'internal_error',
        message: 'Failed to fetch sync history',
        correlationId
      },
      { status: 500 }
    )
    addStandardHeaders(res, correlationId)
    setCacheHint(res, 'no-store')
    return res
  }
}
