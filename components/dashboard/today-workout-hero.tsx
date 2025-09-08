"use client"

import {
  Send,
  Play,
  Edit,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Zap,
  Heart,
  Calculator,
  Copy,
  X,
  Coffee,
  User,
} from "lucide-react"
import { Waves, Bike } from "lucide-react"
import { IntensityBar } from "@/components/training/intensity-bar"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface TodayWorkoutHeroProps {
  workouts: Array<{
    title: string
    sport: "swim" | "bike" | "run"
    stress: string
    time: string
    duration: string
    load: number
    workoutType: string
    segments: Array<{ zone: number; duration: number }>
    targets: {
      power?: { min: number; max: number }
      pace?: { min: string; max: string }
      hr?: { min: number; max: number }
    }
    fueling: string[]
    completed?: boolean
    missed?: boolean
  }>
  readinessLow?: boolean
  adaptationApplied?: boolean
  onPreviewAdaptation?: () => void
  onApplyAdaptation?: () => void
  onRevert?: () => void
}

export function TodayWorkoutHero({
  workouts = [], // Added default empty array to prevent undefined access
  readinessLow = false,
  adaptationApplied = false,
  onPreviewAdaptation,
  onApplyAdaptation,
  onRevert,
}: TodayWorkoutHeroProps) {
  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(0) // Changed default to 0 instead of 1
  const [isWorkoutDataExpanded, setIsWorkoutDataExpanded] = useState(false)
  const [isComplianceExpanded, setIsComplianceExpanded] = useState(false)
  const [isWhyTodayExpanded, setIsWhyTodayExpanded] = useState(false) // Added state for collapsible "Why this today?" section
  const [showReflectionForm, setShowReflectionForm] = useState(false)
  const [showQuickCalc, setShowQuickCalc] = useState(false)
  const [showCoachTomPanel, setShowCoachTomPanel] = useState(false) // Added state for Coach Tom panel
  const [calcInputs, setCalcInputs] = useState({
    weight: "",
    duration: "",
  })
  const [reflectionData, setReflectionData] = useState({
    rpe: null as number | null,
    feeling: "",
    notes: "",
    issues: "",
    actualFuel: "",
  })

  const sportIcons = {
    swim: Waves,
    bike: Bike,
    run: User,
  }

  const sportColors = {
    swim: "border-swim",
    bike: "border-bike",
    run: "border-sport-run",
  }

  const sportAccentColors = {
    swim: "text-swim",
    bike: "text-bike",
    run: "text-sport-run",
  }

  if (!workouts || workouts.length === 0 || !Array.isArray(workouts)) {
    return (
      <div className="bg-bg-surface border border-border-weak rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-1 font-medium">Today</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-text-3">No workouts scheduled for today</p>
        </div>
      </div>
    )
  }

  const safeActiveIndex = Math.max(0, Math.min(activeWorkoutIndex, workouts.length - 1))
  const currentWorkout = workouts[safeActiveIndex]

  if (!currentWorkout || !currentWorkout.sport || !currentWorkout.title) {
    return (
      <div className="bg-bg-surface border border-border-weak rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-1 font-medium">Today</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-text-3">Unable to load workout data</p>
        </div>
      </div>
    )
  }

  const SportIcon = sportIcons[currentWorkout.sport] || User

  const getComplianceColor = (workout: any) => {
    if (!workout?.completed) return ""
    const compliance = 85
    if (compliance >= 85) return "teal-500"
    if (compliance >= 70) return "yellow-500"
    if (compliance >= 55) return "amber-500"
    return "amber-700"
  }

  const intensitySegments =
    currentWorkout.segments?.map((segment, index) => ({
      label: `Zone ${segment?.zone || 1}`,
      zone: `Z${segment?.zone || 1}` as "Z1" | "Z2" | "Z3" | "Z4" | "Z5",
      minutes: segment?.duration || 0,
      intervals:
        (segment?.zone || 0) >= 4
          ? [
              {
                distance: "400m",
                targetPace: "01:45 - 1:55",
                duration: "03:20",
              },
            ]
          : undefined,
    })) || []

  const calculateFueling = () => {
    const weight = Number.parseFloat(calcInputs.weight) || 70
    const duration = Number.parseFloat(calcInputs.duration) || 60

    // Default bands for calculations
    const carbsPerHour = Math.round(30 + (duration > 60 ? 30 : 0)) // 30-60g/h base, +30 for longer sessions
    const fluidPerHour = Math.round(0.5 * weight * 10) / 10 // 0.4-0.8 L/h based on weight
    const sodiumPerHour = Math.round(300 + (duration > 90 ? 200 : 0)) // 300-500mg/h base

    const bottlesPerHour = Math.round(fluidPerHour * 2 * 10) / 10 // Assuming 500ml bottles
    const gelsPerHour = Math.round((carbsPerHour / 25) * 10) / 10 // Assuming 25g carbs per gel

    return {
      carbsPerHour,
      fluidPerHour,
      sodiumPerHour,
      bottlesPerHour,
      gelsPerHour,
    }
  }

  const copyToNotes = () => {
    const calc = calculateFueling()
    const noteText = `Fueling calc: ${calc.carbsPerHour}g carbs/h, ${calc.fluidPerHour}L fluid/h, ${calc.sodiumPerHour}mg sodium/h (${calc.gelsPerHour} gels/h, ${calc.bottlesPerHour} bottles/h)`

    navigator.clipboard.writeText(noteText)

    // Log telemetry event
    console.log("Telemetry:", {
      event: "copied",
      data: calc,
      timestamp: new Date().toISOString(),
    })

    setShowQuickCalc(false)
  }

  const openQuickCalc = () => {
    setShowQuickCalc(true)
    console.log("Telemetry:", {
      event: "opened",
      timestamp: new Date().toISOString(),
    })
  }

  const QuickCalcDrawer = () => (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowQuickCalc(false)} />
      <div className="ml-auto w-96 bg-bg-surface h-full shadow-2xl animate-in slide-in-from-right duration-300 border-l-2 border-brand/50 relative z-10">
        <div className="p-6 border-b border-border-weak bg-bg-raised">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-1 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand" />
              Quick Fueling Calculator
            </h3>
            <button
              onClick={() => setShowQuickCalc(false)}
              className="p-2 hover:bg-bg-surface rounded-lg transition-colors border border-transparent hover:border-border-weak"
            >
              <X className="w-4 h-4 text-text-2 hover:text-text-1" />
            </button>
          </div>
          <p className="text-text-2 text-sm mt-2">Calculate personalized fueling recommendations</p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-full pb-24">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-1 mb-2">Body Weight (kg)</label>
              <input
                type="number"
                value={calcInputs.weight}
                onChange={(e) => setCalcInputs((prev) => ({ ...prev, weight: e.target.value }))}
                placeholder="70"
                className="w-full p-4 bg-bg-app border-2 border-border-weak rounded-lg text-text-1 placeholder-text-3 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all hover:border-border-strong"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-1 mb-2">Planned Duration (minutes)</label>
              <input
                type="number"
                value={calcInputs.duration}
                onChange={(e) => setCalcInputs((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="90"
                className="w-full p-4 bg-bg-app border-2 border-border-weak rounded-lg text-text-1 placeholder-text-3 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all hover:border-border-strong"
              />
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-4">
            <h4 className="text-text-1 font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand" />
              Recommended Intake
            </h4>

            {(() => {
              const calc = calculateFueling()
              return (
                <div className="space-y-3">
                  <div className="p-4 bg-status-caution/20 border border-status-caution/40 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Carbohydrates</span>
                      <span className="text-white font-bold text-lg">{calc.carbsPerHour}g/h</span>
                    </div>
                  </div>

                  <div className="p-4 bg-sport-swim/20 border border-sport-swim/40 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Fluids</span>
                      <span className="text-white font-bold text-lg">{calc.fluidPerHour}L/h</span>
                    </div>
                  </div>

                  <div className="p-4 bg-sport-run/20 border border-sport-run/40 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Sodium</span>
                      <span className="text-white font-bold text-lg">{calc.sodiumPerHour}mg/h</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-weak">
                    <h5 className="text-text-1 font-medium mb-3 flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-text-2" />
                      Example Products
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-bg-raised border-2 border-border-weak rounded-lg hover:border-border-strong transition-colors">
                        <span className="text-text-2">Energy gels</span>
                        <span className="text-text-1 font-medium">{calc.gelsPerHour}/h</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-bg-raised border-2 border-border-weak rounded-lg hover:border-border-strong transition-colors">
                        <span className="text-text-2">Water bottles (500ml)</span>
                        <span className="text-text-1 font-medium">{calc.bottlesPerHour}/h</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          <button
            onClick={copyToNotes}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 transition-all font-medium shadow-lg hover:shadow-xl border-2 border-cyan-500 hover:border-cyan-400"
          >
            <Copy className="w-4 h-4" />
            Copy to Notes
          </button>
        </div>
      </div>
    </div>
  )

  const CoachTomPanel = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCoachTomPanel(false)} />
      <div className="relative bg-bg-surface border border-border-weak rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-1">Coach Tom (Coming Soon)</h3>
            <button
              onClick={() => setShowCoachTomPanel(false)}
              className="p-1 hover:bg-bg-raised rounded transition-colors"
            >
              <X className="w-4 h-4 text-text-2" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-text-2 text-sm mb-4">
              Coach Tom will be able to answer questions about your training. Here are some examples of what you'll be
              able to ask:
            </p>

            <div className="space-y-2">
              <div className="p-3 bg-bg-raised rounded-lg border border-border-weak">
                <span className="text-text-1 text-sm">"Why this intensity today?"</span>
              </div>
              <div className="p-3 bg-bg-raised rounded-lg border border-border-weak">
                <span className="text-text-1 text-sm">"Can I swap with tomorrow?"</span>
              </div>
              <div className="p-3 bg-bg-raised rounded-lg border border-border-weak">
                <span className="text-text-1 text-sm">"What if I feel tired?"</span>
              </div>
              <div className="p-3 bg-bg-raised rounded-lg border border-border-weak">
                <span className="text-text-1 text-sm">"How does this fit my race plan?"</span>
              </div>
              <div className="p-3 bg-bg-raised rounded-lg border border-border-weak">
                <span className="text-text-1 text-sm">"Should I adjust for weather?"</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCoachTomPanel(false)}
            className="w-full px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="bg-bg-surface border border-border-weak rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-1 font-medium">Session in Focus </h3>

          <div className="flex gap-2">
            {workouts.map((workout, index) => {
              if (!workout || !workout.sport) return null

              const IconComponent = sportIcons[workout.sport] || User
              const complianceColor = getComplianceColor(workout)
              return (
                <button
                  key={index}
                  onClick={() => setActiveWorkoutIndex(index)}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors relative",
                    index === safeActiveIndex
                      ? `${sportColors[workout.sport] || "border-border-1"} bg-bg-2 ${sportAccentColors[workout.sport] || "text-text-1"}`
                      : "border-border-1 text-text-3 hover:text-text-2",
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  {workout.completed && (
                    <div
                      className={cn(
                        "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-bg-app shadow-lg",
                        workout.missed
                          ? "border-status-danger bg-status-danger text-white"
                          : workout.completed
                            ? "border-status-success bg-status-success text-white"
                            : "border-status-caution bg-status-caution text-white"
                      )}
                    >
                      {workout.missed ? (
                        <X className="w-2.5 h-2.5" />
                      ) : (
                        <Check className="w-2.5 h-2.5" />
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Readiness Banner */}
        {readinessLow && (
          <div className="mb-6 p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-red-400 text-sm">Capacity suggests adaptation</span>
              <div className="flex gap-2">
                {!adaptationApplied ? (
                  <>
                    <button
                      onClick={onPreviewAdaptation}
                      className="px-3 py-1 text-xs bg-bg-surface border border-border-weak rounded hover:bg-bg-raised transition-colors"
                    >
                      Preview adaptation
                    </button>
                    <button
                      onClick={onApplyAdaptation}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Apply once
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onRevert}
                    className="px-3 py-1 text-xs bg-bg-surface border border-border-weak rounded hover:bg-bg-raised transition-colors"
                  >
                    Revert
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "p-3 rounded-lg border-2 transition-colors relative",
                currentWorkout.sport === "swim" && "bg-sport-swim/10 border-sport-swim text-sport-swim",
                currentWorkout.sport === "bike" && !currentWorkout.completed && "bg-sport-bike/10 border-sport-bike text-sport-bike",
                currentWorkout.sport === "bike" && currentWorkout.completed && "bg-sport-bike/10 border-amber-500 text-sport-bike",
                currentWorkout.sport === "run" && "bg-sport-run/10 border-sport-run text-sport-run",
                currentWorkout.missed && "bg-status-danger/10 border-status-danger text-status-danger",
              )}
            >
              <SportIcon className="w-6 h-6" />
              {currentWorkout.completed && currentWorkout.sport === "bike" && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full border-2 border-bg-app flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-text-1 text-xl font-semibold">{currentWorkout.title || "Untitled Workout"}</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-text-2 text-sm">
                  {currentWorkout.completed ? currentWorkout.time || "0:00" : currentWorkout.duration || "0:00"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-status-danger/40 text-status-danger/80 border border-status-danger/50 text-xs rounded font-medium">
                    {currentWorkout.load || 0}
                  </span>
                  <span className="px-2 py-1 bg-bg-raised border border-border-weak text-text-2 text-xs rounded">
                    {currentWorkout.workoutType || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <IntensityBar segments={intensitySegments} />
        </div>

        {/* Today's Fuelling Strategy tile */}
        {!currentWorkout.completed && (
          <div className="mb-6 p-6 bg-bg-raised rounded-lg border border-border-weak">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-text-1 font-semibold flex items-center gap-2">
                <Coffee className="w-5 h-5 text-sport-bike" />
                Today's Fuelling Strategy
              </h4>
              <button
                onClick={openQuickCalc}
                className="flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium"
              >
                <Calculator className="w-4 h-4" />
                Quick Calc
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-bg-surface/50 rounded-lg hover:bg-bg-surface/70 transition-colors" style={{ borderColor: 'rgba(31, 41, 55, 0.4)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-text-secondary rounded-full"></div>
                  <span className="text-white text-sm font-semibold">Pre-Workout</span>
                </div>
                <p className="text-white/90 text-sm">
                  1–4 g/kg carbs
                  <br />
                  5–10 mL/kg fluid
                </p>
              </div>

              <div className="p-4 bg-bg-surface/50 rounded-lg hover:bg-bg-surface/70 transition-colors" style={{ borderColor: 'rgba(31, 41, 55, 0.4)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-text-secondary rounded-full"></div>
                  <span className="text-white text-sm font-semibold">During Workout</span>
                </div>
                <p className="text-white/90 text-sm">
                  30–90 g/h carbs
                  <br />
                  0.4–0.8 L/h fluid
                  <br />
                  300–800 mg Na/h
                </p>
              </div>

              <div className="p-4 bg-bg-surface/50 rounded-lg hover:bg-bg-surface/70 transition-colors" style={{ borderColor: 'rgba(31, 41, 55, 0.4)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-text-secondary rounded-full"></div>
                  <span className="text-white text-sm font-semibold">Post-Workout</span>
                </div>
                <p className="text-white/90 text-sm">
                  1–1.2 g/kg carbs
                  <br />
                  20–40 g protein
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-text-3 text-xs">Personalized recommendations available with Quick Calc</p>
            </div>
          </div>
        )}

        {!currentWorkout.completed && (
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Left Column: Workout Breakdown */}
            <div className="p-4 bg-bg-raised rounded-lg border border-border-weak">
              <h4 className="text-text-1 font-medium text-sm mb-3">Workout Breakdown</h4>
              <div className="space-y-2 text-xs text-text-2">
                <div className="flex justify-between">
                  <span>Warm up</span>
                  <span>5 min @ 120-168 W </span>
                </div>
                <div className="flex justify-between">
                  <span>Warm up</span>
                  <span>15 min @ 168-199 W</span>
                </div>
                <div className="flex justify-between">
                  <span>Active</span>
                  <span>20 min @ 218-240 W</span>
                </div>
                <div className="flex justify-between">
                  <span>Cool Down</span>
                  <span>15 min @ 168-199 W</span>
                </div>
                <div className="flex justify-between">
                  <span>Cool Down</span>
                  <span>5 min @ 120-168 W </span>
                </div>
              </div>
            </div>

            {/* Right Column: Why this today? */}
            <div className="p-4 bg-bg-raised rounded-lg border border-border-weak">
              <h4 className="text-text-1 font-medium text-sm mb-3">Why this today?</h4>
              <div className="space-y-3">
                <p className="text-text-2 text-sm">
                  This endurance session builds aerobic capacity while your readiness score of 78 indicates optimal
                  adaptation potential. The moderate intensity aligns with your current macro block focus.
                </p>
                <button
                  onClick={() => setShowCoachTomPanel(true)}
                  className="text-brand text-sm hover:text-brand/80 transition-colors font-medium"
                >
                  Coach Tom (coming soon) →
                </button>
              </div>
            </div>
          </div>
        )}

        {currentWorkout.completed ? (
          <div className="mb-6 space-y-4">
            <button
              onClick={() => setIsWorkoutDataExpanded(!isWorkoutDataExpanded)}
              className="flex items-center gap-2 w-full text-left hover:text-text-1 transition-colors mb-3"
            >
              {isWorkoutDataExpanded ? (
                <ChevronDown className="w-4 h-4 text-text-3" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-3" />
              )}
              <h4 className="text-text-1 font-medium">Workout Details</h4>
            </button>

            {isWorkoutDataExpanded && (
              <div className="grid grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                {/* Planned Time Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-text-dim" />
                    <h5 className="text-text-1 font-medium text-xs text-left">Planned Time</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="text-left">
                      <div className="text-sm font-semibold text-text-1">90:00</div>
                      <div className="text-xs text-text-3">Planned</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-text-1">1:35:42</div>
                      <div className="text-xs text-text-3">Completed</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-status-success">95%</span>
                      </div>
                      <div className="relative h-2 bg-gray-600/30 rounded overflow-hidden">
                        <div className="absolute inset-0 bg-gray-600/10 rounded" />
                        <div
                          className="relative h-full transition-all duration-500 bg-status-success rounded"
                          style={{ width: "95%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-text-dim" />
                    <h5 className="text-text-1 font-medium text-xs text-left">
                      {currentWorkout.sport === "swim"
                        ? "Pace Metrics"
                        : currentWorkout.sport === "run"
                          ? "Pace Metrics"
                          : "Power Metrics"}
                    </h5>
                  </div>
                  <div className="space-y-2">
                    <div className="text-left">
                      <div className="text-sm font-semibold text-text-1">
                        {currentWorkout.sport === "swim"
                          ? "1:45/100m"
                          : currentWorkout.sport === "run"
                            ? "4:30/km"
                            : "280W"}
                      </div>
                      <div className="text-xs text-text-3">Target</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-text-1">
                        {currentWorkout.sport === "swim"
                          ? "1:52/100m"
                          : currentWorkout.sport === "run"
                            ? "4:45/km"
                            : "245W"}
                      </div>
                      <div className="text-xs text-text-3">Average</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-status-caution">87%</span>
                      </div>
                      <div className="relative h-2 bg-gray-600/30 rounded overflow-hidden">
                        <div className="absolute inset-0 bg-gray-600/10 rounded" />
                        <div
                          className="relative h-full transition-all duration-500 bg-status-caution rounded"
                          style={{ width: "87%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-text-dim" />
                    <h5 className="text-text-1 font-medium text-xs text-left">Load Metrics</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="text-left">
                      <div className="text-sm font-semibold text-text-1">85 TSS</div>
                      <div className="text-xs text-text-3">Planned</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-status-success">92 TSS</div>
                      <div className="text-xs text-text-3">Actual</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-status-success">108%</span>
                      </div>
                      <div className="relative h-2 bg-gray-600/30 rounded overflow-hidden">
                        <div className="absolute inset-0 bg-gray-600/10 rounded" />
                        <div
                          className="relative h-full transition-all duration-500 bg-status-success rounded"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-text-dim" />
                    <h5 className="text-text-1 font-medium text-xs text-left">Performance</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="text-left">
                      <div className="text-sm font-semibold text-text-1">142 bpm</div>
                      <div className="text-xs text-text-3">Avg HR</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-text-1">
                        {currentWorkout.sport === "swim"
                          ? "28 spm"
                          : currentWorkout.sport === "run"
                            ? "180 spm"
                            : "87 rpm"}
                      </div>
                      <div className="text-xs text-text-3">
                        {currentWorkout.sport === "swim"
                          ? "Stroke Rate"
                          : currentWorkout.sport === "run"
                            ? "Cadence"
                            : "Cadence"}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-text-1">
                        {currentWorkout.sport === "swim"
                          ? "2.1km"
                          : currentWorkout.sport === "run"
                            ? "12.5km"
                            : "42.5km"}
                      </div>
                      <div className="text-xs text-text-3">Distance</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentWorkout.sport === "swim" && (
              <div className="mt-6 p-4 bg-bg-raised rounded-lg border border-border-weak">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-text-1 font-medium">Workout Reflection</h4>
                  {!showReflectionForm && (
                    <button
                      onClick={() => setShowReflectionForm(true)}
                      className="btn btn-primary text-sm"
                    >
                      Add Reflection
                    </button>
                  )}
                </div>

                {showReflectionForm && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* RPE Pills */}
                    <div>
                      <label className="block text-sm font-medium text-text-1 mb-2">
                        Rate of Perceived Exertion (RPE)
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                          <button
                            key={rpe}
                            onClick={() => setReflectionData((prev) => ({ ...prev, rpe }))}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors",
                              reflectionData.rpe === rpe
                                ? "border-sport-swim bg-sport-swim text-white"
                                : "border-border-weak text-text-2 hover:border-swim hover:text-swim",
                            )}
                          >
                            {rpe}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feelings */}
                    <div>
                      <label className="block text-sm font-medium text-text-1 mb-2">How did you feel?</label>
                      <div className="flex gap-2">
                        {["Great", "Good", "Tough"].map((feeling) => (
                          <button
                            key={feeling}
                            onClick={() => setReflectionData((prev) => ({ ...prev, feeling }))}
                            className={cn(
                              "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                              reflectionData.feeling === feeling
                                ? "border-sport-swim bg-sport-swim text-white"
                                : "border-border-weak text-text-2 hover:border-swim hover:text-swim",
                            )}
                          >
                            {feeling}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-text-1 mb-2">Notes</label>
                      <textarea
                        value={reflectionData.notes}
                        onChange={(e) => setReflectionData((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="How did the workout go? Any observations..."
                        className="w-full p-3 bg-bg-surface border border-border-weak rounded-lg text-text-1 placeholder-text-3 resize-none focus:outline-none focus:border-swim"
                        rows={3}
                      />
                    </div>

                    {/* Issues */}
                    <div>
                      <label className="block text-sm font-medium text-text-1 mb-2">Issues Encountered</label>
                      <textarea
                        value={reflectionData.issues}
                        onChange={(e) => setReflectionData((prev) => ({ ...prev, issues: e.target.value }))}
                        placeholder="Any problems, equipment issues, or concerns..."
                        className="w-full p-3 bg-bg-surface border border-border-weak rounded-lg text-text-1 placeholder-text-3 resize-none focus:outline-none focus:border-swim"
                        rows={2}
                      />
                    </div>

                    {/* Actual Fuel Used */}
                    <div>
                      <label className="block text-sm font-medium text-text-1 mb-2">Actual Fuel Used</label>
                      <input
                        type="text"
                        value={reflectionData.actualFuel}
                        onChange={(e) => setReflectionData((prev) => ({ ...prev, actualFuel: e.target.value }))}
                        placeholder="e.g., 2 gels, 500ml sports drink..."
                        className="w-full p-3 bg-bg-surface border border-border-weak rounded-lg text-text-1 placeholder-text-3 focus:outline-none focus:border-swim"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          // Handle save reflection
                          setShowReflectionForm(false)
                        }}
                        className="btn btn-primary"
                      >
                        Save Reflection
                      </button>
                      <button
                        onClick={() => setShowReflectionForm(false)}
                        className="px-4 py-2 bg-bg-surface border border-border-weak rounded-lg hover:bg-bg-raised transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 pt-4 border-t border-border-weak">
            <div className="flex gap-3 justify-center">
              <button className="btn btn-primary flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start
              </button>
              <button className="btn flex items-center gap-2">
                <Send className="w-4 h-4" />
                Push to Device
              </button>
              <button className="btn flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit/Swap
              </button>
            </div>
          </div>
        )}

        {currentWorkout.completed ? (
          <div className="flex justify-center">
            <button className="px-6 py-2 bg-bg-raised border border-border-weak rounded-lg hover:bg-bg-surface transition-colors text-text-1">
              View Completed Workout
            </button>
          </div>
        ) : null}
      </div>

      {showQuickCalc && <QuickCalcDrawer />}
      {showCoachTomPanel && <CoachTomPanel />}
    </>
  )
}
