/**
 * Garmin Sync Configuration API
 * GET /api/garmin/sync-config - Get user's sync configuration
 * PUT /api/garmin/sync-config - Update sync preferences
 * T6: Scheduled Sync and Automation
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase/server'
import { addStandardHeaders, setCacheHint } from '@/lib/auth/athlete'
import { etagFor } from '@/lib/http/etag'
import { generateCorrelationId } from '@/lib/utils'
import { GarminSyncConfig, SyncConfigInput } from '@/lib/garmin/types'

/**
 * GET /api/garmin/sync-config
 * Returns the user's sync configuration with ETag caching
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

    // Fetch sync configuration
    const { data: config, error } = await supabase
      .from('garmin_sync_config')
      .select('*')
      .eq('athlete_id', athleteId)
      .single()

    let syncConfig: GarminSyncConfig

    if (error && error.code === 'PGRST116') {
      // No config exists, create default
      const defaultConfig = {
        athlete_id: athleteId,
        enabled: false, // Start disabled by default
        frequency: 'daily' as const,
        preferred_time: '06:00:00',
        data_types: ['activities', 'wellness']
      }

      const { data: newConfig, error: createError } = await supabase
        .from('garmin_sync_config')
        .insert(defaultConfig)
        .select()
        .single()

      if (createError || !newConfig) {
        return NextResponse.json(
          { error: 'config_creation_failed', message: 'Failed to create default sync configuration' },
          { 
            status: 500,
            headers: {
              'Cache-Control': 'no-store',
              'X-Request-Id': correlationId
            }
          }
        )
      }

      syncConfig = newConfig as GarminSyncConfig
    } else if (error) {
      return NextResponse.json(
        { error: 'config_fetch_failed', message: error.message },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store',
            'X-Request-Id': correlationId
          }
        }
      )
    } else {
      syncConfig = config as GarminSyncConfig
    }

    // Generate ETag and check for conditional request
    const { etag } = etagFor(syncConfig)
    const ifNoneMatch = request.headers.get('if-none-match')
    
    if (ifNoneMatch && ifNoneMatch === etag) {
      const res = new NextResponse(null, { status: 304 })
      addStandardHeaders(res, correlationId)
      setCacheHint(res, 'private, max-age=60, stale-while-revalidate=60')
      res.headers.set('ETag', etag)
      res.headers.set('Vary', 'X-Client-Timezone')
      return res
    }

    // Return configuration with ETag
    const res = NextResponse.json(syncConfig, { status: 200 })
    addStandardHeaders(res, correlationId)
    setCacheHint(res, 'private, max-age=60, stale-while-revalidate=60')
    res.headers.set('ETag', etag)
    res.headers.set('Vary', 'X-Client-Timezone')
    return res

  } catch (error) {
    console.error('Sync config GET error:', error)
    const res = NextResponse.json(
      {
        error: 'internal_error',
        message: 'Failed to fetch sync configuration',
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
 * PUT /api/garmin/sync-config
 * Updates the user's sync configuration
 */
export async function PUT(request: NextRequest) {
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

    // Parse request body
    const updates: SyncConfigInput = await request.json()

    // Validate input
    const validationError = validateSyncConfigInput(updates)
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

    // Calculate next sync time if frequency or time changed
    let nextSyncAt: string | undefined
    if (updates.frequency && updates.frequency !== 'manual_only') {
      const now = new Date()
      const preferredTime = updates.preferred_time || '06:00:00'
      const [hours, minutes] = preferredTime.split(':').map(Number)
      
      if (updates.frequency === 'daily') {
        const nextSync = new Date(now)
        nextSync.setDate(nextSync.getDate() + 1)
        nextSync.setUTCHours(hours, minutes, 0, 0)
        nextSyncAt = nextSync.toISOString()
      } else if (updates.frequency === 'weekly') {
        const nextSync = new Date(now)
        nextSync.setDate(nextSync.getDate() + 7)
        nextSync.setUTCHours(hours, minutes, 0, 0)
        nextSyncAt = nextSync.toISOString()
      }
    }

    // Update configuration
    const updateData = {
      ...updates,
      ...(nextSyncAt && { next_sync_at: nextSyncAt })
    }

    const { data: updatedConfig, error } = await supabase
      .from('garmin_sync_config')
      .update(updateData)
      .eq('athlete_id', athleteId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'update_failed', message: error.message },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store',
            'X-Request-Id': correlationId
          }
        }
      )
    }

    // Return updated configuration
    const res = NextResponse.json(updatedConfig, { status: 200 })
    addStandardHeaders(res, correlationId)
    setCacheHint(res, 'no-store') // PUT responses are not cached
    return res

  } catch (error) {
    console.error('Sync config PUT error:', error)
    const res = NextResponse.json(
      {
        error: 'internal_error',
        message: 'Failed to update sync configuration',
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
 * Validate sync configuration input
 */
function validateSyncConfigInput(input: SyncConfigInput): string | null {
  if (input.frequency && !['daily', 'weekly', 'manual_only'].includes(input.frequency)) {
    return 'Invalid frequency. Must be daily, weekly, or manual_only'
  }

  if (input.preferred_time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(input.preferred_time)) {
    return 'Invalid preferred_time format. Must be HH:MM:SS'
  }

  if (input.data_types) {
    const validTypes = ['activities', 'wellness']
    const invalidTypes = input.data_types.filter(type => !validTypes.includes(type))
    if (invalidTypes.length > 0) {
      return `Invalid data_types: ${invalidTypes.join(', ')}. Must be activities and/or wellness`
    }
    if (input.data_types.length === 0) {
      return 'data_types cannot be empty'
    }
  }

  return null
}
