"use client"
import { TrendingUp, TrendingDown, Plus, Target, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface SideWidgetsProps {
  readiness: {
    score: number
    status: "Poor" | "Good" | "Excellent"
    hrv: {
      current: number
      sevenDayAvg: number
      lastWeekTrend: "up" | "down"
      trendPercentage: number
    }
    sleep: {
      lastNight: {
        total: number
        deep: number
        rem: number
        light: number
      }
      sevenDayAvg: number
      lastWeekTrend: "up" | "down"
      trendPercentage: number
    }
    rhr: {
      current: number
      sevenDayAvg: number
      lastWeekTrend: "up" | "down"
      trendPercentage: number
    }
    strain: {
      current: number
      sevenDayAvg: number
      lastWeekTrend: "up" | "down"
      trendPercentage: number
    }
    soreness: {
      current: number
      sevenDayAvg: number
      lastWeekTrend: "up" | "down"
      trendPercentage: number
    }
    context: {
      current: number
      sevenDayAvg: number
      lastWeekTrend: "up" | "down"
      trendPercentage: number
    }
    advice: {
      message: string
      action: "back-off" | "take-easy" | "go-smash"
      showAdaptation: boolean
    }
    lastSync: {
      source: string
      time: string
      date: string
    }
  }
  constraints: string[]
  races: {
    id: string
    name: string
    date: string
    location: string
    distance: string
    days: number
  }[]
  status: {
    planProgress: number
    onTrack: boolean
    weeksCompleted: number
    totalWeeks: number
  }
  adaptationApplied?: boolean
  onPreviewAdaptation?: () => void
  onRevert?: () => void
}

export function SideWidgets({
  readiness,
  constraints,
  races,
  status,
  adaptationApplied = false,
  onPreviewAdaptation,
  onRevert,
}: SideWidgetsProps) {
  const [activeRaceIndex, setActiveRaceIndex] = useState(0)
  const [hoveredSleepBar, setHoveredSleepBar] = useState<string | null>(null)
  const [isAdviceExpanded, setIsAdviceExpanded] = useState(false)
  const currentRace = races && races.length > 0 ? races[activeRaceIndex] : null

  const createMetricBar = (value: number, maxValue: number, color: string, height = "h-2") => {
    const percentage = Math.min((value / maxValue) * 100, 100)
    return (
      <div className="flex items-center gap-3">
        <div className={`flex-1 ${height} bg-bg-weak rounded-full overflow-hidden`}>
          <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-text-1 text-sm font-medium min-w-[2rem] text-right">{value}</span>
      </div>
    )
  }

  const createSleepBar = () => {
    const { total, deep, rem, light } = readiness.sleep.lastNight
    const deepPercentage = (deep / total) * 100
    const remPercentage = (rem / total) * 100
    const lightPercentage = (light / total) * 100

    return (
      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-1.5 bg-bg-weak rounded-full overflow-hidden flex cursor-pointer"
          onMouseLeave={() => setHoveredSleepBar(null)}
        >
          <div
            className="bg-indigo-500 transition-all duration-300"
            style={{ width: `${deepPercentage}%` }}
            onMouseEnter={() => setHoveredSleepBar(`Deep: ${deep}h`)}
          />
          <div
            className="bg-purple-500 transition-all duration-300"
            style={{ width: `${remPercentage}%` }}
            onMouseEnter={() => setHoveredSleepBar(`REM: ${rem}h`)}
          />
          <div
            className="bg-blue-300 transition-all duration-300"
            style={{ width: `${lightPercentage}%` }}
            onMouseEnter={() => setHoveredSleepBar(`Light: ${light}h`)}
          />
        </div>
        <span className="text-text-1 text-sm font-medium min-w-[2rem] text-right">{total}h</span>
        {hoveredSleepBar && (
          <div className="absolute bg-bg-raised border border-border-weak rounded px-2 py-1 text-xs text-text-1 pointer-events-none z-10 transform -translate-y-8">
            {hoveredSleepBar}
          </div>
        )}
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "text-green-300"
      case "Good":
        return "text-yellow-300"
      case "Poor":
        return "text-red-300"
      default:
        return "text-text-2"
    }
  }

  const getAdviceColor = (action: string) => {
    switch (action) {
      case "go-smash":
        return "text-green-300"
      case "take-easy":
        return "text-yellow-300"
      case "back-off":
        return "text-red-300"
      default:
        return "text-text-2"
    }
  }

  const createStatusBar = (progress: number, onTrack: boolean) => {
    const percentage = Math.min(progress, 100)
    const color = onTrack ? "bg-green-500" : "bg-amber-500"

    return (
      <div className="h-2 bg-bg-weak rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${percentage}%` }} />
      </div>
    )
  }

  const getReadinessIndicator = (score: number) => {
    if (score >= 70) return { text: "Train", color: "text-green-400" }
    if (score >= 50) return { text: "Modify", color: "text-yellow-400" }
    return { text: "Recover", color: "text-red-400" }
  }

  const readinessIndicator = getReadinessIndicator(readiness.score)

  return (
    <div className="space-y-6">
      <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-text-1 font-medium">Capacity</h3>
          <div className="group relative">
            <div className="w-3 h-3 rounded-full bg-text-dim/20 flex items-center justify-center cursor-help">
              <span className="text-text-2 text-xs">?</span>
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-bg-raised border border-border-weak rounded-lg text-xs text-text-1 w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Capacity blends sleep, HRV, resting HR, and recent training load to estimate how much quality you can
              handle today.
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-br from-bg-weak to-bg-surface rounded-xl shadow-sm bg-slate-700 border-2 border-slate-600">
          <div className="text-center">
            <div className={`text-3xl font-bold ${readinessIndicator.color} mb-3`}>{readinessIndicator.text}</div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-text-2 text-sm font-medium">Capacity Score</span>
              <span className="text-2xl font-bold text-text-1">{readiness.score}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-bg-surface rounded-full overflow-hidden border border-border-weak shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300 shadow-sm"
                  style={{ width: `${Math.min(readiness.score, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Overall Status */}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-2 text-sm">HRV</span>
            <div className="flex items-center gap-1">
              {readiness.hrv.lastWeekTrend === "up" ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className="text-xs text-text-2">
                {readiness.hrv.trendPercentage > 0 ? "+" : ""}
                {readiness.hrv.trendPercentage}%
              </span>
            </div>
          </div>
          {createMetricBar(readiness.hrv.current, 100, "bg-blue-500", "h-1.5")}
        </div>

        {/* Sleep Data */}
        <div className="mb-4 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-2 text-sm">Sleep </span>
            <div className="flex items-center gap-1">
              {readiness.sleep.lastWeekTrend === "up" ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className="text-xs text-text-2">
                {readiness.sleep.trendPercentage > 0 ? "+" : ""}
                {readiness.sleep.trendPercentage}%
              </span>
            </div>
          </div>
          {createSleepBar()}
        </div>

        {/* RHR */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-2 text-sm">RHR</span>
            <div className="flex items-center gap-1">
              {readiness.rhr.lastWeekTrend === "up" ? (
                <TrendingUp className="w-3 h-3 text-red-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-green-400" />
              )}
              <span className="text-xs text-text-2">
                {readiness.rhr.trendPercentage > 0 ? "+" : ""}
                {readiness.rhr.trendPercentage}%
              </span>
            </div>
          </div>
          {createMetricBar(readiness.rhr.current, 100, "bg-red-500", "h-1.5")}
        </div>

        {/* Strain */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-2 text-sm">Strain</span>
            <div className="flex items-center gap-1">
              {readiness.strain.lastWeekTrend === "up" ? (
                <TrendingUp className="w-3 h-3 text-orange-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-orange-400" />
              )}
              <span className="text-xs text-text-2">
                {readiness.strain.trendPercentage > 0 ? "+" : ""}
                {readiness.strain.trendPercentage}%
              </span>
            </div>
          </div>
          {createMetricBar(readiness.strain.current, 100, "bg-orange-500", "h-1.5")}
        </div>

        {/* Soreness */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-2 text-sm">Soreness</span>
            <div className="flex items-center gap-1">
              {readiness.soreness.lastWeekTrend === "up" ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-green-400" />
              )}
              <span className="text-xs text-text-2">
                {readiness.soreness.trendPercentage > 0 ? "+" : ""}
                {readiness.soreness.trendPercentage}%
              </span>
            </div>
          </div>
          {createMetricBar(readiness.soreness.current, 100, "bg-purple-500", "h-1.5")}
        </div>

        {/* Context */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-2 text-sm">Context</span>
            <div className="flex items-center gap-1">
              {readiness.context.lastWeekTrend === "up" ? (
                <TrendingUp className="w-3 h-3 text-blue-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-blue-400" />
              )}
              <span className="text-xs text-text-2">
                {readiness.context.trendPercentage > 0 ? "+" : ""}
                {readiness.context.trendPercentage}%
              </span>
            </div>
          </div>
          {createMetricBar(readiness.context.current, 100, "bg-teal-500", "h-1.5")}
        </div>

        {/* Advice */}
        <div className="mb-4">
          <button
            onClick={() => setIsAdviceExpanded(!isAdviceExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className={`text-text-2 text-sm ${getAdviceColor(readiness.advice.action)}`}>Advice</span>
            {isAdviceExpanded ? (
              <ChevronUp className="w-4 h-4 text-text-2" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-2" />
            )}
          </button>

          {isAdviceExpanded && (
            <div className="mt-2 p-4 bg-bg-weak rounded-lg border-l-4 border-l-accent">
              <p className="text-text-1 text-sm">{readiness.advice.message}</p>
            </div>
          )}
        </div>

        {/* Last Sync */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-2 text-sm">Last Sync</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-text-2">{readiness.lastSync.source}</span>
              <span className="text-xs text-text-2">{readiness.lastSync.time}</span>
              <span className="text-xs text-text-2">{readiness.lastSync.date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Constraints Widget */}
      <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
        <h3 className="text-text-1 font-medium mb-4">Constraints</h3>
        <div className="space-y-2 mb-4">
          {constraints.map((constraint, index) => (
            <span key={index} className="inline-block badge badge-ok mr-2 mb-2">
              {constraint}
            </span>
          ))}
        </div>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-bg-raised border border-border-weak rounded hover:bg-bg-surface transition-colors">
            <Plus className="w-3 h-3" />
            Report constraint
          </button>
          <button className="w-full px-3 py-2 text-sm bg-bg-raised border border-border-weak rounded hover:bg-bg-surface transition-colors">
            Rebalance week
          </button>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-1 font-medium">Next Race</h3>
          {races.length > 1 && (
            <div className="flex gap-1">
              {races.map((race, index) => (
                <button
                  key={race.id}
                  onClick={() => setActiveRaceIndex(index)}
                  className={`px-2 py-1 text-xs rounded ${
                    index === activeRaceIndex ? "bg-accent text-text-1" : "text-text-2 hover:text-text-1"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </button>
              ))}
            </div>
          )}
        </div>

        {currentRace ? (
          <div className="text-center">
            <div className="text-text-1 text-2xl font-bold mb-1">{currentRace.days}</div>
            <div className="text-text-2 text-sm mb-2">days</div>
            <div className="text-text-1 font-medium mb-1">{currentRace.name}</div>
            <div className="text-text-2 text-xs mb-1">{currentRace.date}</div>
            <div className="text-text-2 text-xs mb-2">{currentRace.location}</div>
            <div className="mt-3">
              <span className="badge badge-good">{currentRace.distance}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-border-weak">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-2 text-xs">Training Plan</span>
                <Target className={`w-3 h-3 ${status.onTrack ? "text-green-400" : "text-amber-400"}`} />
              </div>
              <div className="text-text-1 text-sm font-medium mb-2">{status.planProgress}%</div>
              {createStatusBar(status.planProgress, status.onTrack)}
              <div className="text-xs text-text-2 mt-1">{status.onTrack ? "On track" : "Behind schedule"}</div>
              <div className="text-xs text-text-2">
                Week {status.weeksCompleted} of {status.totalWeeks}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-text-2">
            <div className="text-sm">No upcoming races</div>
          </div>
        )}
      </div>
    </div>
  )
}
