"use client"

import { TodayWorkoutHero } from "@/components/dashboard/today-workout-hero"
import { SideWidgets } from "@/components/dashboard/side-widgets"
import { Coffee, Zap, TrendingUp, Calendar, Target, Wifi, WifiOff, RefreshCw, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useCockpitData } from "@/lib/hooks/useCockpitData"
import { mapSessionsToWorkouts, mapReadinessToCapacity, mapPlanToWeekFocus } from "@/lib/utils/cockpitMappers"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyWorkouts } from "@/components/ui/empty-workouts"

// Mock data for sections not covered by live APIs
const mockHeaderData = {
  nextRace: {
    name: "Ironman 70.3 World Championship",
    date: new Date("2024-12-15"),
    priority: "A" as const,
  },
  syncStatus: {
    garmin: { connected: true, lastSync: "2 hours ago" },
    whoop: { connected: false, lastSync: "3 days ago" },
    appleHealth: { connected: true, lastSync: "1 hour ago" },
  },
}

const mockAdaptationData = {
  hasAdaptations: false, // Would come from adaptation API
  editCount: 3,
  focus: "Recovery Focus" as const,
  status: "recovery" as const,
  cause: "Low readiness + missed session",
  changeSummary: "Intervals reduced, intensity lowered, duration shortened",
  accepted: false,
  reason: "Low readiness and missed session",
  changes: [
    {
      type: "intervals",
      original: "6×",
      modified: "5×",
      description: "Reduced interval count",
      changeType: "negative" as const,
    },
    {
      type: "intensity",
      original: "Z4",
      modified: "Z3",
      description: "Lowered intensity zone",
      changeType: "negative" as const,
    },
    {
      type: "duration",
      original: "90 min",
      modified: "80 min",
      description: "Shortened workout duration",
      changeType: "negative" as const,
    },
  ],
}

const mockAlertData = {
  hasActiveAlerts: true,
  alerts: [
    {
      id: "heat-warning",
      type: "weather" as const,
      severity: "warning" as const,
      message: "High heat forecast: consider moving your run to the morning.",
      dismissible: true,
    },
    {
      id: "travel-blocker",
      type: "life-blocker" as const,
      severity: "warning" as const,
      message: "Travel scheduled: workouts adjusted for limited equipment access.",
      dismissible: true,
    },
    {
      id: "illness-flag",
      type: "readiness" as const,
      severity: "warning" as const,
      message: "Elevated resting heart rate detected: consider reducing intensity today.",
      dismissible: true,
    },
    {
      id: "pool-maintenance",
      type: "facility" as const,
      severity: "info" as const,
      message: "Pool maintenance scheduled 2-4 PM: swim session moved to morning.",
      dismissible: true,
    },
    {
      id: "equipment-reminder",
      type: "equipment" as const,
      severity: "info" as const,
      message: "Remember to charge your power meter before tomorrow's bike session.",
      dismissible: true,
    },
  ],
}

const mockConditionsData = {
  city: "Boulder, CO",
  temperature: 22,
  wind: "5 mph NW",
  humidity: 65,
  heat: "Low" as const,
  windStatus: "OK" as const,
  aqi: null,
}

const mockFuellingData = {
  preWorkout: "Banana + Coffee (30min before)",
  duringWorkout: "60g carbs/hour via sports drink",
  postWorkout: "Protein shake within 30min",
  hydration: "500ml/hour + electrolytes",
}

const mockStatusData = {
  planProgress: 65,
  onTrack: true,
  weeksCompleted: 10,
  totalWeeks: 16,
}

// Dev athlete ID for testing - in production this would come from auth
const DEV_ATHLETE_ID = "123e4567-e89b-12d3-a456-426614174000";

function getDaysUntilRace(raceDate: Date): number {
  const today = new Date()
  const diffTime = raceDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default function CockpitPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const daysUntilRace = getDaysUntilRace(mockHeaderData.nextRace.date)

  // Load live data using our hooks
  const cockpitData = useCockpitData(DEV_ATHLETE_ID);

  const getPrimaryDevice = () => {
    const { syncStatus } = mockHeaderData
    if (syncStatus.garmin.connected) return { name: "Garmin", ...syncStatus.garmin }
    if (syncStatus.appleHealth.connected) return { name: "Apple Health", ...syncStatus.appleHealth }
    if (syncStatus.whoop.connected) return { name: "Whoop", ...syncStatus.whoop }
    return null
  }

  const primaryDevice = getPrimaryDevice()

  const [showAdaptationDiff, setShowAdaptationDiff] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [showAdaptationModal, setShowAdaptationModal] = useState(false)

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => [...prev, alertId])
    if (currentAlertIndex >= activeAlerts.length - 1) {
      setCurrentAlertIndex(Math.max(0, currentAlertIndex - 1))
    }
  }

  const activeAlerts = mockAlertData.hasActiveAlerts
    ? mockAlertData.alerts.filter((alert) => !dismissedAlerts.includes(alert.id))
    : []

  const visibleAlerts = showAllAlerts ? activeAlerts : activeAlerts.slice(0, 3)
  const hasMoreAlerts = activeAlerts.length > 3

  const nextAlert = () => {
    setCurrentAlertIndex((prev) => (prev + 1) % Math.min(activeAlerts.length, 3))
  }

  const prevAlert = () => {
    setCurrentAlertIndex((prev) => (prev - 1 + Math.min(activeAlerts.length, 3)) % Math.min(activeAlerts.length, 3))
  }

  const handleAcceptChanges = () => {
    console.log("Changes accepted")
  }

  const handleModifyFurther = () => {
    console.log("Modify further requested")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "recovery":
        return "green"
      case "build":
        return "amber"
      case "rest":
        return "red"
      default:
        return "green"
    }
  }

  const getWeekFocusColor = (weekType: string) => {
    switch (weekType) {
      case "Push Week":
      case "Build Week":
        return "orange"
      case "Recovery Week":
      case "Taper Week":
        return "green"
      case "Peak Week":
        return "red"
      default:
        return "orange"
    }
  }

  const AdaptationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowAdaptationModal(false)} />
      <div className="relative bg-bg-surface border border-border-weak rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-1">Training Adaptation</h3>
            <button
              onClick={() => setShowAdaptationModal(false)}
              className="p-1 hover:bg-bg-raised rounded transition-colors"
            >
              <X className="w-4 h-4 text-text-2" />
            </button>
          </div>

          <div className="mb-4">
            <span className="text-text-2 text-sm mb-2 block">Adaptation Triggers:</span>
            <div className="flex flex-wrap gap-2">
              {mockAdaptationData.changes.map((_, index) => (
                <span key={index} className="badge badge-ok">
                  {index === 0 ? "Low readiness" : "Missed session"}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <span className="text-text-2 text-sm mb-2 block">Changes Made:</span>
            <div className="space-y-2">
              {mockAdaptationData.changes.map((change, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-bg-raised rounded">
                  <span className="text-text-1 text-sm">{change.description}</span>
                  <span
                    className={`text-sm font-medium ${change.changeType === "negative" ? "text-status-danger" : "text-status-success"}`}
                  >
                    {change.original}→{change.modified}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log("Telemetry:", {
                  decision: "accept",
                  triggers: ["Low readiness", "Missed session"],
                  timestamp: new Date().toISOString(),
                })
                setShowAdaptationModal(false)
              }}
              className="flex-1 btn btn-primary"
            >
              Accept
            </button>
            <button
              onClick={() => {
                console.log("Telemetry:", {
                  decision: "modify",
                  triggers: ["Low readiness", "Missed session"],
                  timestamp: new Date().toISOString(),
                })
                setShowAdaptationModal(false)
              }}
              className="flex-1 px-4 py-2 bg-bg-raised border border-border-weak rounded-lg hover:bg-bg-surface transition-colors text-text-1 font-medium"
            >
              Modify Further
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Handle loading state
  if (cockpitData.loading) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading cockpit data..." />
          <p className="text-text-2 mt-4">Fetching your training information</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (cockpitData.hasError) {
    return (
      <div className="min-h-screen bg-bg-app p-8">
        <ErrorState
          title="Unable to load cockpit data"
          message={`Failed to load: ${Object.values(cockpitData.errors).filter(Boolean).join(', ')}`}
          onRetry={cockpitData.refetchAll}
        />
      </div>
    );
  }

  // Map live data to cockpit format
  const todayWorkouts = cockpitData.sessions.data?.items ? mapSessionsToWorkouts(cockpitData.sessions.data.items) : [];
  const capacity = cockpitData.readiness.data ? mapReadinessToCapacity(cockpitData.readiness.data) : null;
  const weekFocusData = cockpitData.plan.data ? mapPlanToWeekFocus(cockpitData.plan.data) : null;

  return (
    <>
      {activeAlerts.length > 0 && (
        <div className="w-full mb-6">
          {showAllAlerts ? (
            <div className="space-y-2">
              {activeAlerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className="alert-strip alert-strip-warning"
                >
                  <div className="alert-content">
                    <div className="alert-indicator"></div>
                    <span className="alert-message">{alert.message}</span>
                  </div>
                  {alert.dismissible && (
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="alert-button"
                      aria-label="Dismiss alert"
                    >
                      <X className="alert-icon" />
                    </button>
                  )}
                </div>
              ))}
              {hasMoreAlerts && (
                <button
                  onClick={() => setShowAllAlerts(false)}
                  className="w-full px-6 py-2 alert-dismiss text-sm text-center"
                >
                  Show less
                </button>
              )}
            </div>
          ) : (
            <div className="alert-strip alert-strip-warning">
              <div className="alert-content flex-1">
                <div className="alert-indicator"></div>
                <span className="alert-message">{visibleAlerts[currentAlertIndex]?.message}</span>
              </div>
              <div className="alert-actions">
                {visibleAlerts.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevAlert}
                      className="alert-button"
                      aria-label="Previous alert"
                    >
                      <svg className="w-3 h-3 alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="alert-counter">
                      {currentAlertIndex + 1}/{Math.min(activeAlerts.length, 3)}
                    </span>
                    <button
                      onClick={nextAlert}
                      className="alert-button"
                      aria-label="Next alert"
                    >
                      <svg className="w-3 h-3 alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                {hasMoreAlerts && !showAllAlerts && (
                  <button
                    onClick={() => setShowAllAlerts(true)}
                    className="alert-more"
                  >
                    +{activeAlerts.length - 3} more
                  </button>
                )}
                {visibleAlerts[currentAlertIndex]?.dismissible && (
                  <button
                    onClick={() => dismissAlert(visibleAlerts[currentAlertIndex].id)}
                    className="alert-button"
                    aria-label="Dismiss alert"
                  >
                    <X className="alert-icon" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {mockAdaptationData.hasAdaptations && (
        <div className="w-full mb-6">
          <div
            className="alert-strip alert-strip-warning cursor-pointer"
            onClick={() => setShowAdaptationModal(true)}
          >
            <div className="alert-content">
              <Zap className="w-4 h-4 alert-icon" />
              <span className="alert-message">Training adaptation applied today</span>
            </div>
            <span className="alert-dismiss">Click to view details</span>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-1">Cockpit</h1>
            <p className="text-text-2 mt-1">Your daily training command center</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-surface border border-border-weak rounded-xl shadow-sm">
              <Calendar className="w-4 h-4 text-brand" />
              <span className="text-text-1 text-sm font-medium">{today}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-surface border border-border-weak rounded-xl shadow-sm">
              <Target className="w-4 h-4 text-brand" />
              <div className="text-sm">
                <span className="text-brand font-bold text-sm">{daysUntilRace}</span>
                <span className="text-text-2 ml-1">days to race</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-surface border border-border-weak rounded-xl shadow-sm">
              {primaryDevice ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-text-1 text-sm font-medium">{primaryDevice.name}</span>
                    <button
                      className="p-1 hover:bg-bg-weak rounded transition-colors group"
                      onClick={() => console.log("Sync triggered")}
                      title="Sync now"
                    >
                      <RefreshCw className="w-3 h-3 text-text-2 group-hover:text-brand transition-colors" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-text-2 text-sm">No devices</span>
                  <button
                    className="p-1 hover:bg-bg-weak rounded transition-colors group"
                    onClick={() => console.log("Sync triggered")}
                    title="Sync now"
                  >
                    <RefreshCw className="w-3 h-3 text-text-2 group-hover:text-brand transition-colors" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-8">
          {/* Today's Workouts with live data */}
          {todayWorkouts.length === 0 ? (
            <EmptyWorkouts
              title="No workouts scheduled for today"
              message="You don't have any workouts planned for today. Your training plan might have a rest day or you may need to create today's workout."
              onCreateWorkout={() => console.log("Navigate to workout creation")}
              onViewCalendar={() => console.log("Navigate to calendar")}
            />
          ) : (
            <TodayWorkoutHero 
              workouts={todayWorkouts} 
              readinessLow={capacity?.band === 'red'} 
              adaptationApplied={mockAdaptationData.hasAdaptations} 
            />
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
              <h3 className="text-text-1 font-medium mb-4 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-500" />
                Today's Fuelling Strategy
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-bg-raised rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-text-1 text-sm font-medium">Pre-Workout</span>
                  </div>
                  <p className="text-text-2 text-sm">{mockFuellingData.preWorkout}</p>
                </div>
                <div className="p-3 bg-bg-raised rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-text-1 text-sm font-medium">During Workout</span>
                  </div>
                  <p className="text-text-2 text-sm">{mockFuellingData.duringWorkout}</p>
                </div>
                <div className="p-3 bg-bg-raised rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-text-1 text-sm font-medium">Post-Workout</span>
                  </div>
                  <p className="text-text-2 text-sm">{mockFuellingData.postWorkout}</p>
                </div>
                <div className="p-3 bg-brand/10 border border-brand/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-brand rounded-full"></div>
                    <span className="text-brand text-sm font-medium">Hydration</span>
                  </div>
                  <p className="text-text-2 text-sm">{mockFuellingData.hydration}</p>
                </div>
              </div>
            </div>
            
            {/* Week Focus with live plan data */}
            <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
              {weekFocusData && !weekFocusData.hasAdaptations ? (
                <>
                  <h3 className="text-text-1 font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand" />
                    Week Focus
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="chip chip-zone-z3">
                        {weekFocusData.weekType}
                      </span>
                    </div>
                    <p className="text-text-2 text-sm leading-relaxed">{weekFocusData.description}</p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-text-1 font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Adaptation Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-text-1">
                        {mockAdaptationData.focus}
                      </span>
                      <span className="badge badge-ok">
                        Low readiness + Missed session
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-text-1 text-sm font-medium">Plan Changes:</span>
                      <div className="flex flex-wrap gap-1">
                        {mockAdaptationData.changes.map((change, index) => (
                          <span
                            key={index}
                            className={`badge ${change.changeType === "negative" ? "badge-critical" : "badge-good"}`}
                          >
                            {change.original}→{change.modified}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-text-2 text-sm leading-relaxed">
                      Training adapted based on your current readiness and recent session data.
                    </p>

                    <div className="space-y-3 pt-2 border-t border-border-weak">
                      <button
                        onClick={() => setShowAdaptationModal(true)}
                        className="w-full btn btn-primary"
                      >
                        View Plan Diff
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            console.log("Telemetry:", {
                              decision: "accept",
                              triggers: ["Low readiness", "Missed session"],
                              timestamp: new Date().toISOString(),
                            })
                          }}
                          className="flex-1 btn btn-primary"
                        >
                          Accept Changes
                        </button>
                        <button
                          onClick={() => {
                            console.log("Telemetry:", {
                              decision: "modify",
                              triggers: ["Low readiness", "Missed session"],
                              timestamp: new Date().toISOString(),
                            })
                          }}
                          className="flex-1 px-3 py-2 bg-bg-raised border border-border-weak rounded-lg hover:bg-bg-surface transition-colors text-text-1 text-sm font-medium"
                        >
                          Modify Further
                        </button>
                      </div>

                      <div
                        className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg cursor-pointer hover:bg-amber-950/50 transition-colors"
                        onClick={() => setShowAdaptationModal(true)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-amber-200 text-sm font-medium">Adaptation</span>
                          </div>
                          <span className="text-amber-400 text-xs">View details →</span>
                        </div>
                      </div>

                      <Link
                        href="/coach"
                        className="block text-center text-brand text-sm hover:text-brand-hover transition-colors"
                      >
                        Ask Coach Tom
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-span-4">
          <div className="space-y-6">
            <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
              <div className="flex items-center gap-1 mb-3">
                <span className="text-text-dim text-xs uppercase tracking-wide font-medium">Today's Conditions</span>
              </div>

              <div className="text-lg font-bold text-text-1 mb-2">{mockConditionsData.city}</div>

              <div className="flex items-center gap-3 text-xs text-text-dim mb-3">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  {mockConditionsData.temperature}°C
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4V2a1 1 0 011-1h8a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                  {mockConditionsData.wind}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                  {mockConditionsData.humidity}%
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                <span className="badge badge-good">
                  Heat {mockConditionsData.heat}
                </span>
                <span className="badge badge-good">
                  Wind {mockConditionsData.windStatus}
                </span>
                {mockConditionsData.aqi && (
                  <span className="badge badge-critical">
                    AQI {mockConditionsData.aqi}
                  </span>
                )}
              </div>

              <div className="flex justify-end">
                <button className="text-text-2 hover:text-text-1 text-xs transition-colors">Outside OK?</button>
              </div>
            </div>

            {/* Side widgets with live readiness data */}
            {capacity && (
              <SideWidgets
                readiness={capacity}
                constraints={[]} // Mock - would come from blockers API
                races={[{
                  id: "race-a",
                  name: "Ironman 70.3 World Championship",
                  date: "Dec 15, 2024",
                  location: "Lake Placid, NY",
                  distance: "1.9k/90k/21k",
                  days: 28,
                }]}
                status={mockStatusData}
                adaptationApplied={false}
                onPreviewAdaptation={() => console.log("Preview adaptation")}
                onRevert={() => console.log("Revert adaptation")}
                syncStatus={mockHeaderData.syncStatus}
              />
            )}
          </div>
        </div>
      </div>

      {showAdaptationModal && <AdaptationModal />}
    </>
  )
}