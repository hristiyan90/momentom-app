"use client"

import { Info } from "lucide-react"
import { useState } from "react"

interface WeekSummaryProps {
  loadBySport: Record<string, number>
  intensityMix: Record<string, number>
  planned: number
  completed: number
}

const sportColors = {
  swim: "bg-sport-swim",
  bike: "bg-sport-bike",
  run: "bg-sport-run",
  strength: "bg-gray-500",
}

const intensityColors = {
  recovery: "bg-status-success",
  endurance: "bg-status-info",
  tempo: "bg-status-caution",
  threshold: "bg-status-alert",
  vo2: "bg-status-danger",
}


export function WeekSummary({ loadBySport, intensityMix, planned, completed }: WeekSummaryProps) {
  const [showPhaseDetails, setShowPhaseDetails] = useState(false)

  const maxLoad = Math.max(...Object.values(loadBySport))
  const totalIntensity = Object.values(intensityMix).reduce((sum, val) => sum + val, 0)
  const compliancePercent = planned > 0 ? (completed / planned) * 100 : 0

  const totalHours = Object.values(loadBySport).reduce((sum, minutes) => sum + minutes, 0) / 60
  const totalTSS = planned * 85 // Estimated TSS per session (can be made dynamic)
  const completedTSS = (totalTSS * completed) / planned

  const trainingMetrics = {
    ctl: 45.2, // Chronic Training Load (fitness)
    atl: 52.8, // Acute Training Load (fatigue)
    form: -7.6, // Training Stress Balance (CTL - ATL)
    readiness: 78, // Readiness score (0-100)
  }

  const getFormStatus = (form: number) => {
    if (form > 5) return { status: "Fresh", color: "text-green-500" }
    if (form > -10) return { status: "Neutral", color: "text-yellow-500" }
    return { status: "Fatigued", color: "text-red-500" }
  }

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const currentPhase = {
    name: "Base",
    currentWeek: 3,
    totalWeeks: 6,
    startDate: "Jan 8, 2025",
    endDate: "Feb 18, 2025",
    objective: "Build aerobic base and establish consistent training rhythm. Focus on volume over intensity.",
  }

  const generateSessionData = () => {
    const sessions = []
    for (let i = 0; i < planned; i++) {
      if (i < completed) {
        sessions.push("completed")
      } else if (i < completed + 1) {
        sessions.push("partial") // One partially completed session
      } else if (i < planned - 2) {
        sessions.push("missed")
      } else {
        sessions.push("upcoming")
      }
    }
    return sessions
  }

  const sessionData = generateSessionData()
  const isAtRisk = compliancePercent < 70

  const getTrainingWarning = () => {
    if (compliancePercent < 50) {
      return { message: "Compliance is critically low", severity: "high" }
    }
    if (compliancePercent < 70) {
      return { message: "Compliance is low", severity: "medium" }
    }
    if (trainingMetrics.form < -15) {
      return { message: "Fatigue is very high", severity: "high" }
    }
    if (trainingMetrics.form < -10) {
      return { message: "Fatigue is elevated", severity: "medium" }
    }

    // Check for monotony (simplified - could be more sophisticated)
    const intensityVariation = Object.values(intensityMix).filter((v) => v > 0).length
    if (intensityVariation <= 2) {
      return { message: "Monotony is high", severity: "medium" }
    }

    return null
  }

  const trainingWarning = getTrainingWarning()
  const needsRebalancing = trainingWarning !== null

  return (
    <div className="bg-bg-surface border border-border-weak rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-medium text-text-1">Week Summary</h3>

      <div className="bg-bg-raised rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-text-1">{totalHours.toFixed(1)}h</div>
            <div className="text-xs text-text-dim uppercase tracking-wider">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-text-1">{totalTSS}</div>
            <div className="text-xs text-text-dim uppercase tracking-wider">Total TSS</div>
          </div>
        </div>
      </div>

      <div className="bg-bg-raised rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim">CTL (Fitness)</span>
              <span className="text-sm font-medium text-text-1">{trainingMetrics.ctl}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim">ATL (Fatigue)</span>
              <span className="text-sm font-medium text-text-1">{trainingMetrics.atl}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim">Form</span>
              <span className={`text-sm font-medium ${getFormStatus(trainingMetrics.form).color}`}>
                {trainingMetrics.form > 0 ? "+" : ""}
                {trainingMetrics.form}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim">Readiness</span>
              <span className={`text-sm font-medium ${getReadinessColor(trainingMetrics.readiness)}`}>
                {trainingMetrics.readiness}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          className="flex items-center gap-3 p-3 rounded-lg border border-border-weak cursor-pointer hover:bg-bg-raised transition-colors"
          style={{
            borderLeftColor: `var(--phase-${currentPhase.name.toLowerCase()})`,
            borderLeftWidth: "4px",
          }}
          onMouseEnter={() => setShowPhaseDetails(true)}
          onMouseLeave={() => setShowPhaseDetails(false)}
        >
          <div className="flex-1">
            <div className="text-sm font-medium text-text-1">
              {currentPhase.name} Week {currentPhase.currentWeek} of {currentPhase.totalWeeks}
            </div>
            <div className="text-xs text-text-dim mt-1">Training Phase Context</div>
          </div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: `var(--phase-${currentPhase.name.toLowerCase()})` }}
          />
        </div>

        {showPhaseDetails && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-bg-app border border-border-weak rounded-lg shadow-lg z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: `var(--phase-${currentPhase.name.toLowerCase()})` }}
                />
                <span className="font-medium text-text-1">{currentPhase.name} Phase</span>
              </div>
              <div className="text-sm text-text-2">
                {currentPhase.startDate} - {currentPhase.endDate}
              </div>
              <div className="text-sm text-text-dim">{currentPhase.objective}</div>
            </div>
          </div>
        )}
      </div>

      {/* Load by sport */}
      <div>
        <h4 className="text-sm text-text-2 mb-3">Load by Sport</h4>
        <div className="space-y-2">
          {Object.entries(loadBySport).map(([sport, minutes]) => (
            <div key={sport} className="flex items-center gap-3">
              <div className="w-12 text-xs text-text-2 capitalize">{sport}</div>
              <div className="flex-1 bg-bg-raised rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${sportColors[sport as keyof typeof sportColors]}`}
                  style={{ width: `${maxLoad > 0 ? (minutes / maxLoad) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs text-text-dim w-12 text-right">{Math.round(minutes / 60)}h</div>
            </div>
          ))}
        </div>
      </div>

      {/* Intensity mix */}
      <div>
        <h4 className="text-sm text-text-2 mb-3">Intensity Mix</h4>
        <div className="flex rounded-full h-3 overflow-hidden bg-bg-raised">
          {Object.entries(intensityMix).map(([intensity, value]) => (
            <div
              key={intensity}
              className={intensityColors[intensity as keyof typeof intensityColors]}
              style={{ width: `${totalIntensity > 0 ? (value / totalIntensity) * 100 : 0}%` }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(intensityMix).map(([intensity, value]) => (
            <div key={intensity} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${intensityColors[intensity as keyof typeof intensityColors]}`} />
              <span className="text-xs text-text-1 capitalize">{intensity}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="text-xs font-medium text-text-dim uppercase tracking-wider">Plan Adherence</h4>
          <Info className="w-3 h-3 text-text-2" />
        </div>

        <div className="space-y-4">
          {/* Sessions count */}
          <div className="text-2xl font-semibold text-text-1">
            {completed}/{planned} sessions
          </div>

          {/* Vertical session bars */}
          <div className="flex items-end gap-1">
            {sessionData.map((status, index) => (
              <div
                key={index}
                className={`w-2 h-6 rounded-sm ${
                  status === "completed"
                    ? "bg-green-500"
                    : status === "partial"
                      ? "bg-yellow-500"
                      : status === "missed"
                        ? "bg-red-500"
                        : "bg-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Hours and compliance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-dim">
              {((totalHours * completed) / planned).toFixed(1)}/{totalHours.toFixed(1)}h • {Math.round(completedTSS)}/
              {totalTSS} TSS
            </span>
            <span className="text-text-1">Compliance {Math.round(compliancePercent)}%</span>
          </div>

          {/* Progress bar */}
          <div className="flex rounded-full h-2 overflow-hidden bg-bg-raised">
            <div className="bg-teal-500" style={{ width: "30%" }} />
            <div className="bg-purple-500" style={{ width: "40%" }} />
            <div className="bg-green-500" style={{ width: "30%" }} />
          </div>

          {/* Status and actions */}
        </div>
      </div>

      {/* Week actions */}
      <div className="space-y-2 pt-4 border-t border-border-weak">
        {needsRebalancing && (
          <div className="flex items-center justify-between w-full px-4 py-3 bg-amber-950/50 border-l-4 border-amber-500 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-amber-200 text-sm font-medium">{trainingWarning?.message}</span>
            </div>
            <button className="px-3 py-1.5 bg-amber-900/30 border border-amber-500/30 text-amber-200 text-xs font-medium rounded-md hover:bg-amber-900/50 transition-colors">
              Rebalance Week
            </button>
          </div>
        )}

        <button className="w-full px-4 py-2 text-text-dim text-sm rounded-lg hover:text-text-2 transition-colors">
          Add Constraint
        </button>
      </div>
    </div>
  )
}
