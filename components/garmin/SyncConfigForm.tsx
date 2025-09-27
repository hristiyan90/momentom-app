/**
 * Sync Configuration Form Component
 * Form for updating GarminDB sync preferences
 * T6: Scheduled Sync and Automation
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GarminSyncConfig } from '@/lib/garmin/types'

interface SyncConfigFormProps {
  config: GarminSyncConfig
  onUpdate: (updates: Partial<GarminSyncConfig>) => Promise<void>
}

export function SyncConfigForm({ config, onUpdate }: SyncConfigFormProps) {
  const [formData, setFormData] = useState({
    enabled: config.enabled,
    frequency: config.frequency,
    preferred_time: config.preferred_time.substring(0, 5), // HH:MM format for input
    data_types: config.data_types,
    garmin_db_path: config.garmin_db_path || '',
    garmin_monitoring_db_path: config.garmin_monitoring_db_path || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onUpdate({
        enabled: formData.enabled,
        frequency: formData.frequency,
        preferred_time: `${formData.preferred_time}:00`, // Add seconds
        data_types: formData.data_types,
        garmin_db_path: formData.garmin_db_path || null,
        garmin_monitoring_db_path: formData.garmin_monitoring_db_path || null
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDataTypeChange = (dataType: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        data_types: [...prev.data_types, dataType]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        data_types: prev.data_types.filter(type => type !== dataType)
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enable/Disable Sync */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">Enable Automated Sync</Label>
          <div className="text-sm text-muted-foreground">
            Automatically sync your Garmin data on a schedule
          </div>
        </div>
        <Switch
          checked={formData.enabled}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
        />
      </div>

      <Separator />

      {/* Sync Frequency */}
      <div className="space-y-2">
        <Label htmlFor="frequency">Sync Frequency</Label>
        <Select
          value={formData.frequency}
          onValueChange={(value: 'daily' | 'weekly' | 'manual_only') => 
            setFormData(prev => ({ ...prev, frequency: value }))
          }
          disabled={!formData.enabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="manual_only">Manual Only</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {formData.frequency === 'daily' && 'Sync every day at the preferred time'}
          {formData.frequency === 'weekly' && 'Sync once per week at the preferred time'}
          {formData.frequency === 'manual_only' && 'Only sync when manually triggered'}
        </div>
      </div>

      {/* Preferred Time */}
      {formData.frequency !== 'manual_only' && (
        <div className="space-y-2">
          <Label htmlFor="preferred_time">Preferred Sync Time (UTC)</Label>
          <Input
            id="preferred_time"
            type="time"
            value={formData.preferred_time}
            onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
            disabled={!formData.enabled}
            className="w-32"
          />
          <div className="text-sm text-muted-foreground">
            Time is in UTC. Your local time: {' '}
            {new Date(`2000-01-01T${formData.preferred_time}:00Z`).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Data Types */}
      <div className="space-y-3">
        <Label>Data Types to Sync</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="activities"
              checked={formData.data_types.includes('activities')}
              onCheckedChange={(checked) => handleDataTypeChange('activities', checked as boolean)}
            />
            <Label htmlFor="activities" className="text-sm font-normal">
              Activities (workouts, runs, rides, etc.)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wellness"
              checked={formData.data_types.includes('wellness')}
              onCheckedChange={(checked) => handleDataTypeChange('wellness', checked as boolean)}
            />
            <Label htmlFor="wellness" className="text-sm font-normal">
              Wellness Data (sleep, heart rate, weight)
            </Label>
          </div>
        </div>
        {formData.data_types.length === 0 && (
          <div className="text-sm text-red-500">
            At least one data type must be selected
          </div>
        )}
      </div>

      <Separator />

      {/* Advanced Settings */}
      <div className="space-y-4">
        <Label className="text-base">Advanced Settings</Label>
        
        <div className="space-y-2">
          <Label htmlFor="garmin_db_path" className="text-sm">
            Custom Garmin DB Path (optional)
          </Label>
          <Input
            id="garmin_db_path"
            value={formData.garmin_db_path}
            onChange={(e) => setFormData(prev => ({ ...prev, garmin_db_path: e.target.value }))}
            placeholder="/path/to/garmin_activities.db"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground">
            Leave empty to use default GarminDB path
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="garmin_monitoring_db_path" className="text-sm">
            Custom Monitoring DB Path (optional)
          </Label>
          <Input
            id="garmin_monitoring_db_path"
            value={formData.garmin_monitoring_db_path}
            onChange={(e) => setFormData(prev => ({ ...prev, garmin_monitoring_db_path: e.target.value }))}
            placeholder="/path/to/garmin_monitoring.db"
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground">
            Leave empty to use default GarminDB path
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={saving || formData.data_types.length === 0}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </form>
  )
}
