/**
 * Manual Sync Button Component
 * Button for triggering immediate sync with options
 * T6: Scheduled Sync and Automation
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Play, Loader2 } from 'lucide-react'
import { GarminSyncConfig } from '@/lib/garmin/types'

interface ManualSyncButtonProps {
  onSync: (dataTypes?: string[]) => Promise<void>
  isRunning: boolean
  config: GarminSyncConfig | null
}

export function ManualSyncButton({ onSync, isRunning, config }: ManualSyncButtonProps) {
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['activities', 'wellness'])
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    if (selectedDataTypes.length === 0) return

    setSyncing(true)
    try {
      await onSync(selectedDataTypes)
    } finally {
      setSyncing(false)
    }
  }

  const handleDataTypeChange = (dataType: string, checked: boolean) => {
    if (checked) {
      setSelectedDataTypes(prev => [...prev, dataType])
    } else {
      setSelectedDataTypes(prev => prev.filter(type => type !== dataType))
    }
  }

  const canSync = !isRunning && !syncing && selectedDataTypes.length > 0

  return (
    <div className="space-y-4">
      {/* Data Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Select data to sync:</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="manual-activities"
              checked={selectedDataTypes.includes('activities')}
              onCheckedChange={(checked) => handleDataTypeChange('activities', checked as boolean)}
              disabled={isRunning || syncing}
            />
            <Label htmlFor="manual-activities" className="text-sm font-normal">
              Activities (workouts, runs, rides, etc.)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="manual-wellness"
              checked={selectedDataTypes.includes('wellness')}
              onCheckedChange={(checked) => handleDataTypeChange('wellness', checked as boolean)}
              disabled={isRunning || syncing}
            />
            <Label htmlFor="manual-wellness" className="text-sm font-normal">
              Wellness Data (sleep, heart rate, weight)
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sync Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {isRunning ? 'Sync in Progress' : 'Ready to Sync'}
          </div>
          <div className="text-xs text-muted-foreground">
            {isRunning 
              ? 'A sync operation is currently running'
              : selectedDataTypes.length === 0
                ? 'Select at least one data type to sync'
                : `Will sync: ${selectedDataTypes.join(', ')}`
            }
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={!canSync}
          size="lg"
          className="min-w-32"
        >
          {syncing || isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isRunning ? 'Running' : 'Starting...'}
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>
      </div>

      {/* Configuration Info */}
      {config && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                <strong>Automated sync:</strong> {config.enabled ? 'Enabled' : 'Disabled'}
              </div>
              {config.enabled && (
                <div>
                  <strong>Frequency:</strong> {config.frequency}
                  {config.frequency !== 'manual_only' && (
                    <span> at {config.preferred_time} UTC</span>
                  )}
                </div>
              )}
              <div>
                <strong>Last sync:</strong> {config.last_sync_at 
                  ? new Date(config.last_sync_at).toLocaleString()
                  : 'Never'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
