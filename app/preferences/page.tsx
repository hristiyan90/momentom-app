"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Info,
  Download,
  Trash2,
  RefreshCw,
  Settings,
  Bell,
  Target,
  Utensils,
  Activity,
  Link,
  MessageSquare,
  Shield,
  Code,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PreferencesData {
  // General & Units
  "units.system": "metric" | "imperial"
  "units.run_display": "pace" | "speed"
  "units.bike_display": "power" | "heart_rate" | "speed"
  "units.pool_length": "25m" | "50m" | "25yd"
  "units.time_format": "24h" | "12h"
  "calendar.week_start": "monday" | "sunday"
  "general.timezone": string

  // Notifications & Summaries
  "notify.email_frequency": "off" | "important" | "daily" | "weekly"
  "notify.push_frequency": "off" | "important" | "daily"
  "notify.train_reminder_time": "evening" | "morning" | "both"
  "notify.adaptations_enabled": boolean
  "notify.sync_failures": boolean
  "notify.race_checklist": boolean

  // Plan Engine Preferences
  "plan.periodisation_split": "2:1" | "3:1" | "auto"
  "plan.hours_band": "low" | "medium" | "high" | "auto"
  "plan.long_day": "saturday" | "sunday" | "midweek" | "auto"
  "plan.max_session_duration": number
  "plan.strength_sessions": number
  "plan.bricks_allowed": boolean
  "plan.run_terrain": "road" | "trail" | "mixed"
  "plan.indoor_bias": "indoor" | "outdoor" | "auto"
  "plan.max_ramp_pct": number
  "plan.monotony_target": number
  "plan.auto_downgrade.enabled": boolean
  "plan.auto_downgrade.threshold": number
  "plan.illness_rule.days": number

  // Fuelling Defaults
  "fuel.carb_strategy": "low" | "moderate" | "high" | "auto"
  "fuel.caffeine": "none" | "low" | "moderate" | "high"
  "fuel.hydration_band": "0.4-0.6" | "0.6-0.8" | "auto"
  "fuel.sodium_band": "300-500" | "500-800" | "auto"
  "fuel.show_cues": boolean
  "fuel.gi_notes": string

  // Readiness & Data Priorities
  "readiness.hrv_source": string
  "readiness.sleep_source": string
  "readiness.missing_fallback": "subjective" | "unknown"
  "readiness.checkin_time": "off" | "06:00" | "07:00" | "08:00"

  // Integrations
  "integrations.garmin.status": "connected" | "disconnected"
  "integrations.strava.status": "connected" | "disconnected"
  "integrations.apple_health.status": "connected" | "disconnected"
  "integrations.polar.status": "connected" | "disconnected"
  "integrations.coros.status": "connected" | "disconnected"

  // Coach Tom (AI) Behaviour
  "coach.nudges_level": "off" | "important" | "all"
  "coach.tone": "concise" | "balanced" | "detailed"
  "coach.explain_level": "short" | "full"
  "coach.show_microfaqs": boolean

  // Privacy & Sharing
  "privacy.share_with_coach": boolean
  "privacy.anon_model": boolean
  "privacy.leaderboard": "private" | "friends" | "public"

  // Developer / Debug
  "debug.show_drivers": boolean
  "debug.log_adaptations": boolean
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<PreferencesData>({
    // Default values
    "units.system": "metric",
    "units.run_display": "pace",
    "units.bike_display": "power",
    "units.pool_length": "25m",
    "units.time_format": "24h",
    "calendar.week_start": "monday",
    "general.timezone": "UTC",
    "notify.email_frequency": "important",
    "notify.push_frequency": "important",
    "notify.train_reminder_time": "evening",
    "notify.adaptations_enabled": true,
    "notify.sync_failures": true,
    "notify.race_checklist": true,
    "plan.periodisation_split": "auto",
    "plan.hours_band": "auto",
    "plan.long_day": "auto",
    "plan.max_session_duration": 180,
    "plan.strength_sessions": 2,
    "plan.bricks_allowed": true,
    "plan.run_terrain": "mixed",
    "plan.indoor_bias": "auto",
    "plan.max_ramp_pct": 6,
    "plan.monotony_target": 2.0,
    "plan.auto_downgrade.enabled": true,
    "plan.auto_downgrade.threshold": 70,
    "plan.illness_rule.days": 3,
    "fuel.carb_strategy": "auto",
    "fuel.caffeine": "moderate",
    "fuel.hydration_band": "auto",
    "fuel.sodium_band": "auto",
    "fuel.show_cues": true,
    "fuel.gi_notes": "",
    "readiness.hrv_source": "auto",
    "readiness.sleep_source": "auto",
    "readiness.missing_fallback": "subjective",
    "readiness.checkin_time": "07:00",
    "integrations.garmin.status": "disconnected",
    "integrations.strava.status": "connected",
    "integrations.apple_health.status": "disconnected",
    "integrations.polar.status": "disconnected",
    "integrations.coros.status": "disconnected",
    "coach.nudges_level": "important",
    "coach.tone": "balanced",
    "coach.explain_level": "short",
    "coach.show_microfaqs": true,
    "privacy.share_with_coach": true,
    "privacy.anon_model": true,
    "privacy.leaderboard": "friends",
    "debug.show_drivers": false,
    "debug.log_adaptations": false,
  })

  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set(["general"]))
  const [showAdvanced, setShowAdvanced] = useState(false)

  const togglePanel = (panelId: string) => {
    const newExpanded = new Set(expandedPanels)
    if (newExpanded.has(panelId)) {
      newExpanded.delete(panelId)
    } else {
      newExpanded.add(panelId)
    }
    setExpandedPanels(newExpanded)
  }

  const updatePreference = <K extends keyof PreferencesData>(key: K, value: PreferencesData[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    console.log("Saving preferences:", preferences)
    // TODO: Save to backend
  }

  const handleCancel = () => {
    console.log("Cancelling changes")
    // TODO: Revert to saved state
  }

  const handleRestoreDefaults = () => {
    console.log("Restoring defaults")
    // TODO: Reset to default values
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(preferences, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "preferences-export.json"
    link.click()
  }

  const handleForceRecompute = () => {
    console.log("Forcing plan recompute")
    // TODO: Trigger plan recomputation
  }

  const panels = [
    {
      id: "general",
      title: "General & Units",
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="units-system">Units</Label>
              <Select
                value={preferences["units.system"]}
                onValueChange={(value: "metric" | "imperial") => updatePreference("units.system", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="imperial">Imperial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="run-display">Run pacing display</Label>
              <Select
                value={preferences["units.run_display"]}
                onValueChange={(value: "pace" | "speed") => updatePreference("units.run_display", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pace">Pace</SelectItem>
                  <SelectItem value="speed">Speed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bike-display">Bike pacing display</Label>
              <Select
                value={preferences["units.bike_display"]}
                onValueChange={(value: "power" | "heart_rate" | "speed") =>
                  updatePreference("units.bike_display", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="power">Power</SelectItem>
                  <SelectItem value="heart_rate">Heart Rate</SelectItem>
                  <SelectItem value="speed">Speed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pool-length">Swim pool length</Label>
              <Select
                value={preferences["units.pool_length"]}
                onValueChange={(value: "25m" | "50m" | "25yd") => updatePreference("units.pool_length", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25m">25 m</SelectItem>
                  <SelectItem value="50m">50 m</SelectItem>
                  <SelectItem value="25yd">25 yd</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time-format">Time format</Label>
              <Select
                value={preferences["units.time_format"]}
                onValueChange={(value: "24h" | "12h") => updatePreference("units.time_format", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 h</SelectItem>
                  <SelectItem value="12h">12 h</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="week-start">Week start</Label>
              <Select
                value={preferences["calendar.week_start"]}
                onValueChange={(value: "monday" | "sunday") => updatePreference("calendar.week_start", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="timezone">Default timezone</Label>
            <Select
              value={preferences["general.timezone"]}
              onValueChange={(value) => updatePreference("general.timezone", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: "notifications",
      title: "Notifications & Summaries",
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email-frequency">Email notifications</Label>
              <Select
                value={preferences["notify.email_frequency"]}
                onValueChange={(value: "off" | "important" | "daily" | "weekly") =>
                  updatePreference("notify.email_frequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="important">Important only</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="push-frequency">Push notifications</Label>
              <Select
                value={preferences["notify.push_frequency"]}
                onValueChange={(value: "off" | "important" | "daily") =>
                  updatePreference("notify.push_frequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="important">Important only</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="train-reminder">Training day reminders</Label>
            <Select
              value={preferences["notify.train_reminder_time"]}
              onValueChange={(value: "evening" | "morning" | "both") =>
                updatePreference("notify.train_reminder_time", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="evening">Evening prior</SelectItem>
                <SelectItem value="morning">Morning of</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="adaptations">Adaptation alerts</Label>
              <Switch
                checked={preferences["notify.adaptations_enabled"]}
                onCheckedChange={(checked) => updatePreference("notify.adaptations_enabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sync-failures">Data sync failures</Label>
              <Switch
                checked={preferences["notify.sync_failures"]}
                onCheckedChange={(checked) => updatePreference("notify.sync_failures", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="race-checklist">Race-week checklist reminders</Label>
              <Switch
                checked={preferences["notify.race_checklist"]}
                onCheckedChange={(checked) => updatePreference("notify.race_checklist", checked)}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "plan-engine",
      title: "Plan Engine Preferences",
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="periodisation">
                Periodisation split
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline w-4 h-4 ml-1 text-text-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        2:1 = 2 weeks build, 1 week recovery
                        <br />
                        3:1 = 3 weeks build, 1 week recovery
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Select
                value={preferences["plan.periodisation_split"]}
                onValueChange={(value: "2:1" | "3:1" | "auto") => updatePreference("plan.periodisation_split", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2:1">2:1</SelectItem>
                  <SelectItem value="3:1">3:1</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hours-band">Target weekly hours band</Label>
              <Select
                value={preferences["plan.hours_band"]}
                onValueChange={(value: "low" | "medium" | "high" | "auto") =>
                  updatePreference("plan.hours_band", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="long-day">Long-day preference</Label>
              <Select
                value={preferences["plan.long_day"]}
                onValueChange={(value: "saturday" | "sunday" | "midweek" | "auto") =>
                  updatePreference("plan.long_day", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="midweek">Mid-week</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="max-session">Max single session cap (minutes)</Label>
              <Input
                type="number"
                value={preferences["plan.max_session_duration"]}
                onChange={(e) => updatePreference("plan.max_session_duration", Number.parseInt(e.target.value) || 0)}
                min="30"
                max="480"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="strength-sessions">Strength sessions per week</Label>
              <Select
                value={preferences["plan.strength_sessions"].toString()}
                onValueChange={(value) => updatePreference("plan.strength_sessions", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="run-terrain">Terrain preference for run</Label>
              <Select
                value={preferences["plan.run_terrain"]}
                onValueChange={(value: "road" | "trail" | "mixed") => updatePreference("plan.run_terrain", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">Road</SelectItem>
                  <SelectItem value="trail">Trail</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="bricks">Bricks allowed</Label>
              <Switch
                checked={preferences["plan.bricks_allowed"]}
                onCheckedChange={(checked) => updatePreference("plan.bricks_allowed", checked)}
              />
            </div>
            <div>
              <Label htmlFor="indoor-bias">Indoor vs outdoor bias</Label>
              <Select
                value={preferences["plan.indoor_bias"]}
                onValueChange={(value: "indoor" | "outdoor" | "auto") => updatePreference("plan.indoor_bias", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-border-weak pt-4">
            <h4 className="text-sm font-medium text-text-1 mb-3">Safety rails (advanced)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-ramp">
                  Max weekly ramp rate %
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="inline w-4 h-4 ml-1 text-text-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum weekly training load increase</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  type="number"
                  value={preferences["plan.max_ramp_pct"]}
                  onChange={(e) => updatePreference("plan.max_ramp_pct", Number.parseFloat(e.target.value) || 0)}
                  min="1"
                  max="20"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="monotony">
                  Monotony target
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="inline w-4 h-4 ml-1 text-text-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Target monotony score (≤ 2.0 recommended)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  type="number"
                  value={preferences["plan.monotony_target"]}
                  onChange={(e) => updatePreference("plan.monotony_target", Number.parseFloat(e.target.value) || 0)}
                  min="1.0"
                  max="3.0"
                  step="0.1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="auto-downgrade">Auto-downgrade intensity when readiness low</Label>
                  <Switch
                    checked={preferences["plan.auto_downgrade.enabled"]}
                    onCheckedChange={(checked) => updatePreference("plan.auto_downgrade.enabled", checked)}
                  />
                </div>
                {preferences["plan.auto_downgrade.enabled"] && (
                  <div>
                    <Label htmlFor="downgrade-threshold">Threshold (0-100)</Label>
                    <Input
                      type="number"
                      value={preferences["plan.auto_downgrade.threshold"]}
                      onChange={(e) =>
                        updatePreference("plan.auto_downgrade.threshold", Number.parseInt(e.target.value) || 0)
                      }
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="illness-days">Illness rule: replace high-intensity for N days</Label>
                <Input
                  type="number"
                  value={preferences["plan.illness_rule.days"]}
                  onChange={(e) => updatePreference("plan.illness_rule.days", Number.parseInt(e.target.value) || 0)}
                  min="1"
                  max="14"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "fuelling",
      title: "Fuelling Defaults",
      icon: Utensils,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="carb-strategy">During-training carb strategy</Label>
              <Select
                value={preferences["fuel.carb_strategy"]}
                onValueChange={(value: "low" | "moderate" | "high" | "auto") =>
                  updatePreference("fuel.carb_strategy", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (20-40 g/h)</SelectItem>
                  <SelectItem value="moderate">Moderate (40-60 g/h)</SelectItem>
                  <SelectItem value="high">High (60-90 g/h)</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="caffeine">Caffeine strategy</Label>
              <Select
                value={preferences["fuel.caffeine"]}
                onValueChange={(value: "none" | "low" | "moderate" | "high") =>
                  updatePreference("fuel.caffeine", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hydration">Hydration preference</Label>
              <Select
                value={preferences["fuel.hydration_band"]}
                onValueChange={(value: "0.4-0.6" | "0.6-0.8" | "auto") =>
                  updatePreference("fuel.hydration_band", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.4-0.6">0.4-0.6 L/h</SelectItem>
                  <SelectItem value="0.6-0.8">0.6-0.8 L/h</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sodium">Sodium target</Label>
              <Select
                value={preferences["fuel.sodium_band"]}
                onValueChange={(value: "300-500" | "500-800" | "auto") => updatePreference("fuel.sodium_band", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300-500">300-500 mg/h</SelectItem>
                  <SelectItem value="500-800">500-800 mg/h</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-cues">Show fuelling cues in workout cards</Label>
            <Switch
              checked={preferences["fuel.show_cues"]}
              onCheckedChange={(checked) => updatePreference("fuel.show_cues", checked)}
            />
          </div>
          <div>
            <Label htmlFor="gi-notes">GI sensitivity notes</Label>
            <Textarea
              value={preferences["fuel.gi_notes"]}
              onChange={(e) => updatePreference("fuel.gi_notes", e.target.value)}
              placeholder="Any digestive sensitivities or notes..."
              rows={3}
            />
          </div>
        </div>
      ),
    },
    {
      id: "readiness",
      title: "Readiness & Data Priorities",
      icon: Activity,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hrv-source">Primary HRV source</Label>
              <Select
                value={preferences["readiness.hrv_source"]}
                onValueChange={(value) => updatePreference("readiness.hrv_source", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="garmin">Garmin</SelectItem>
                  <SelectItem value="polar">Polar</SelectItem>
                  <SelectItem value="whoop">Whoop</SelectItem>
                  <SelectItem value="oura">Oura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sleep-source">Primary Sleep source</Label>
              <Select
                value={preferences["readiness.sleep_source"]}
                onValueChange={(value) => updatePreference("readiness.sleep_source", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="garmin">Garmin</SelectItem>
                  <SelectItem value="apple_health">Apple Health</SelectItem>
                  <SelectItem value="fitbit">Fitbit</SelectItem>
                  <SelectItem value="oura">Oura</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="missing-fallback">
              Missing-data fallback
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="inline w-4 h-4 ml-1 text-text-2" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How to handle missing readiness data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={preferences["readiness.missing_fallback"]}
              onValueChange={(value: "subjective" | "unknown") => updatePreference("readiness.missing_fallback", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subjective">Use subjective baselines</SelectItem>
                <SelectItem value="unknown">Leave unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="checkin-time">Morning check-in prompt time</Label>
            <Select
              value={preferences["readiness.checkin_time"]}
              onValueChange={(value: "off" | "06:00" | "07:00" | "08:00") =>
                updatePreference("readiness.checkin_time", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="06:00">06:00</SelectItem>
                <SelectItem value="07:00">07:00</SelectItem>
                <SelectItem value="08:00">08:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: "integrations",
      title: "Integrations",
      icon: Link,
      content: (
        <div className="space-y-4">
          {[
            { key: "garmin", name: "Garmin", lastSync: "2 hours ago" },
            { key: "strava", name: "Strava", lastSync: "1 hour ago" },
            { key: "apple_health", name: "Apple Health", lastSync: "Never" },
            { key: "polar", name: "Polar", lastSync: "Never" },
            { key: "coros", name: "Coros", lastSync: "Never" },
          ].map((integration) => {
            const statusKey = `integrations.${integration.key}.status` as keyof PreferencesData
            const isConnected = preferences[statusKey] === "connected"

            return (
              <div
                key={integration.key}
                className="flex items-center justify-between p-4 bg-bg-raised rounded-lg border border-border-weak"
              >
                <div>
                  <h4 className="font-medium text-text-1">{integration.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isConnected
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {isConnected ? "Connected" : "Not connected"}
                    </span>
                    {isConnected && <span className="text-xs text-text-2">Last sync: {integration.lastSync}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {isConnected ? (
                    <>
                      <Button variant="outline" size="sm">
                        Sync now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePreference(statusKey, "disconnected" as any)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => updatePreference(statusKey, "connected" as any)}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ),
    },
    {
      id: "coach",
      title: "Coach Tom (AI) Behaviour",
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nudges-level">Proactive nudges</Label>
              <Select
                value={preferences["coach.nudges_level"]}
                onValueChange={(value: "off" | "important" | "all") => updatePreference("coach.nudges_level", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="important">Important only</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={preferences["coach.tone"]}
                onValueChange={(value: "concise" | "balanced" | "detailed") => updatePreference("coach.tone", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="explain-level">Explainability level</Label>
            <Select
              value={preferences["coach.explain_level"]}
              onValueChange={(value: "short" | "full") => updatePreference("coach.explain_level", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short reasons</SelectItem>
                <SelectItem value="full">Full rationale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="microfaqs">Micro-FAQ surfacing in cockpit</Label>
            <Switch
              checked={preferences["coach.show_microfaqs"]}
              onCheckedChange={(checked) => updatePreference("coach.show_microfaqs", checked)}
            />
          </div>
        </div>
      ),
    },
    {
      id: "privacy",
      title: "Privacy & Sharing",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="share-coach">Share data with assigned coach/club</Label>
            <Switch
              checked={preferences["privacy.share_with_coach"]}
              onCheckedChange={(checked) => updatePreference("privacy.share_with_coach", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="anon-model">Anonymised data for model improvement</Label>
            <Switch
              checked={preferences["privacy.anon_model"]}
              onCheckedChange={(checked) => updatePreference("privacy.anon_model", checked)}
            />
          </div>
          <div>
            <Label htmlFor="leaderboard">Leaderboard/PR visibility</Label>
            <Select
              value={preferences["privacy.leaderboard"]}
              onValueChange={(value: "private" | "friends" | "public") =>
                updatePreference("privacy.leaderboard", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button variant="outline" onClick={handleExportData} className="w-full bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Data (JSON)
            </Button>
          </div>
          <div>
            <Button variant="outline" disabled className="w-full opacity-50 bg-transparent">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account (Disabled for MVP)
            </Button>
          </div>
        </div>
      ),
    },
  ]

  const advancedPanel = {
    id: "developer",
    title: "Developer / Debug",
    icon: Code,
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-drivers">Show raw readiness drivers</Label>
          <Switch
            checked={preferences["debug.show_drivers"]}
            onCheckedChange={(checked) => updatePreference("debug.show_drivers", checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="log-adaptations">Log adaptation decisions</Label>
          <Switch
            checked={preferences["debug.log_adaptations"]}
            onCheckedChange={(checked) => updatePreference("debug.log_adaptations", checked)}
          />
        </div>
        <div>
          <Button variant="outline" onClick={handleForceRecompute} className="w-full bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Plan Recompute
          </Button>
        </div>
      </div>
    ),
  }

  return (
    <div className="min-h-screen bg-bg-app">
      <div className="max-w-4xl mx-auto p-6 pb-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-1 mb-2">Preferences</h1>
          <p className="text-text-2">Customize your training experience and app behavior</p>
        </div>

        <div className="space-y-4">
          {panels.map((panel) => {
            const isExpanded = expandedPanels.has(panel.id)
            const Icon = panel.icon

            return (
              <div key={panel.id} className="bg-bg-surface rounded-lg border border-border-weak">
                <button
                  onClick={() => togglePanel(panel.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-raised transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-text-2" />
                    <h3 className="font-medium text-text-1">{panel.title}</h3>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-text-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-text-2" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border-weak">
                    <div className="pt-4">{panel.content}</div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Advanced Section Toggle */}
          <div className="pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-text-2 hover:text-text-1 transition-colors"
            >
              {showAdvanced ? "Hide" : "Show"} Advanced Options
            </button>
          </div>

          {/* Advanced Panel */}
          {showAdvanced && (
            <div className="bg-bg-surface rounded-lg border border-border-weak">
              <button
                onClick={() => togglePanel(advancedPanel.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-raised transition-colors"
              >
                <div className="flex items-center gap-3">
                  <advancedPanel.icon className="w-5 h-5 text-text-2" />
                  <h3 className="font-medium text-text-1">{advancedPanel.title}</h3>
                </div>
                {expandedPanels.has(advancedPanel.id) ? (
                  <ChevronDown className="w-5 h-5 text-text-2" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-text-2" />
                )}
              </button>
              {expandedPanels.has(advancedPanel.id) && (
                <div className="px-4 pb-4 border-t border-border-weak">
                  <div className="pt-4">{advancedPanel.content}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border-weak p-4">
        <div className="max-w-4xl mx-auto flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleRestoreDefaults}>
            Restore Defaults
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
