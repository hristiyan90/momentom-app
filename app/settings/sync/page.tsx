/**
 * Garmin Sync Settings Page
 * Dashboard for managing GarminDB sync configuration and monitoring
 * T6: Scheduled Sync and Automation
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { GarminSyncConfig, SyncStatus, GarminSyncHistory } from '@/lib/garmin/types'
import { SyncConfigForm } from '@/components/garmin/SyncConfigForm'
import { SyncHistoryTable } from '@/components/garmin/SyncHistoryTable'
import { ManualSyncButton } from '@/components/garmin/ManualSyncButton'

export default function SyncSettingsPage() {
  const [config, setConfig] = useState<GarminSyncConfig | null>(null)
  const [status, setStatus] = useState<SyncStatus | null>(null)
  const [history, setHistory] = useState<GarminSyncHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to create fetch options with dev mode headers
  const createFetchOptions = (options: RequestInit = {}): RequestInit => {
    return {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Athlete-Id': '00000000-0000-0000-0000-000000000001', // Dev mode athlete ID
        ...options.headers,
      },
    }
  }

  // Fetch initial data
  useEffect(() => {
    fetchSyncData()
  }, [])

  // Poll for status updates when sync is running
  useEffect(() => {
    if (status?.is_running) {
      const interval = setInterval(() => {
        fetch('/api/garmin/sync/status', createFetchOptions())
          .then(response => response.ok ? response.json() : null)
          .then(statusData => {
            if (statusData) {
              setStatus(statusData)
              // If sync completed, refresh history
              if (!statusData.is_running && status?.is_running) {
                fetchSyncHistory()
              }
            }
          })
          .catch(err => console.error('Failed to fetch sync status:', err))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [status?.is_running])

  const fetchSyncData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch config, status, and recent history in parallel
      const [configRes, statusRes, historyRes] = await Promise.all([
        fetch('/api/garmin/sync-config', createFetchOptions()),
        fetch('/api/garmin/sync/status', createFetchOptions()),
        fetch('/api/garmin/sync/history?limit=10', createFetchOptions())
      ])

      // Handle authentication errors specifically
      if (configRes.status === 401 || statusRes.status === 401 || historyRes.status === 401) {
        setError('Authentication required. Please log in to access sync settings.')
        // Set default/empty state for UI
        setConfig({
          config_id: 'default',
          athlete_id: '',
          enabled: true,
          frequency: 'daily',
          preferred_time: '06:00:00',
          data_types: ['activities', 'wellness'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setStatus({
          is_running: false,
          config: {
            config_id: 'default',
            athlete_id: '',
            enabled: true,
            frequency: 'daily',
            preferred_time: '06:00:00',
            data_types: ['activities', 'wellness'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        })
        setHistory([])
        return
      }

      if (!configRes.ok || !statusRes.ok || !historyRes.ok) {
        throw new Error('Failed to fetch sync data')
      }

      const [configData, statusData, historyData] = await Promise.all([
        configRes.json(),
        statusRes.json(),
        historyRes.json()
      ])

      setConfig(configData)
      setStatus(statusData)
      setHistory(historyData.history || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sync data')
    } finally {
      setLoading(false)
    }
  }


  const fetchSyncHistory = async () => {
    try {
      const response = await fetch('/api/garmin/sync/history?limit=10', createFetchOptions())
      if (response.ok) {
        const historyData = await response.json()
        setHistory(historyData.history || [])
      }
    } catch (err) {
      console.error('Failed to fetch sync history:', err)
    }
  }

  const handleConfigUpdate = async (updates: Partial<GarminSyncConfig>) => {
    try {
      const response = await fetch('/api/garmin/sync-config', createFetchOptions({
        method: 'PUT',
        body: JSON.stringify(updates)
      }))

      if (!response.ok) {
        throw new Error('Failed to update configuration')
      }

      const updatedConfig = await response.json()
      setConfig(updatedConfig)
      
      // Refresh status to get updated next_sync_at
      fetch('/api/garmin/sync/status', createFetchOptions())
        .then(response => response.ok ? response.json() : null)
        .then(statusData => statusData && setStatus(statusData))
        .catch(err => console.error('Failed to refresh sync status:', err))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration')
    }
  }

  const handleManualSync = async (dataTypes?: string[]) => {
    try {
      const response = await fetch('/api/garmin/sync/trigger', createFetchOptions({
        method: 'POST',
        body: JSON.stringify({
          sync_type: 'manual',
          data_types: dataTypes
        })
      }))

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to trigger sync')
      }

      // Refresh status immediately
      fetch('/api/garmin/sync/status', createFetchOptions())
        .then(response => response.ok ? response.json() : null)
        .then(statusData => statusData && setStatus(statusData))
        .catch(err => console.error('Failed to refresh sync status:', err))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger sync')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading sync settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Garmin Sync Settings</h1>
          <p className="text-muted-foreground">
            Configure automated sync for your Garmin activities and wellness data
          </p>
        </div>
        <Button variant="outline" onClick={fetchSyncData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
              {error.includes('Authentication') && (
                <div className="text-sm text-muted-foreground">
                  <p>To test the sync functionality:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Log in to your account, or</li>
                    <li>Use dev mode by adding the header: <code className="bg-muted px-1 rounded">X-Athlete-Id: 00000000-0000-0000-0000-000000000001</code></li>
                  </ol>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Current Status</div>
              <div className="flex items-center gap-2">
                {status?.is_running ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <Badge variant="secondary">Running</Badge>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="outline">Idle</Badge>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Next Scheduled Sync</div>
              <div className="text-sm text-muted-foreground">
                {status?.next_scheduled_sync ? (
                  new Date(status.next_scheduled_sync).toLocaleString()
                ) : (
                  'No scheduled sync'
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Last Sync</div>
              <div className="text-sm text-muted-foreground">
                {status?.last_completed_sync ? (
                  <>
                    {new Date(status.last_completed_sync.started_at).toLocaleString()}
                    <Badge 
                      variant={status.last_completed_sync.status === 'completed' ? 'default' : 'destructive'}
                      className="ml-2"
                    >
                      {status.last_completed_sync.status}
                    </Badge>
                  </>
                ) : (
                  'Never'
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Sync */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Sync</CardTitle>
          <CardDescription>
            Trigger an immediate sync of your Garmin data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManualSyncButton 
            onSync={handleManualSync}
            isRunning={status?.is_running || false}
            config={config}
          />
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Configuration</CardTitle>
          <CardDescription>
            Configure automated sync schedule and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {config && (
            <SyncConfigForm 
              config={config}
              onUpdate={handleConfigUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync History</CardTitle>
          <CardDescription>
            View recent sync operations and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SyncHistoryTable 
            history={history}
            onRefresh={fetchSyncHistory}
          />
        </CardContent>
      </Card>
    </div>
  )
}
