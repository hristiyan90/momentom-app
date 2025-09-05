"use client"

import { Droplets, Thermometer, Wind, Info, RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface KpiStripProps {
  data: {
    planAdherence: {
      sessions: { completed: number; total: number }
      hours: { completed: number; total: number }
      sparklineData: number[] // 7-day data points (1 = completed, 0 = missed)
      compliance: number
      bySport: { swim: number; bike: number; run: number } // completion percentages
    }
    stressBalance: {
      form: number
      ctl: number
      atl: number
      sparklineData: number[] // 14-day form values
      safeBand: { min: number; max: number }
      aRaceDays?: number
    }
    performanceMomentum: {
      swim: { value: number; trend: "up" | "down" | "stable" }
      bike: { value: number; trend: "up" | "down" | "stable" }
      run: { value: number; trend: "up" | "down" | "stable" }
      pmi: { value: number; change: number; period: string }
      sparklineData: number[] // 6-month PMI values
      testDates: boolean[] // true if test occurred that month
      staleTest: boolean
    }
    conditions: {
      city: string
      temperature: number
      wind: string
      humidity: number
      heat: "Low" | "Med" | "High"
      windStatus: "OK" | "Tricky"
      aqi?: "Poor" | null
    }
  }
}

export function KpiStrip({ data }: KpiStripProps) {
  const getStatusBadge = (percentage: number, type: "sessions" | "general" = "general") => {
    if (type === "sessions" && percentage < 80) {
      return { color: "bg-amber-500", text: "At risk" }
    }
    if (percentage >= 90) return { color: "bg-green-500", text: "Good" }
    if (percentage >= 70) return { color: "bg-amber-500", text: "Watch" }
    return { color: "bg-red-500", text: "Poor" }
  }

  const getFormColor = (form: number) => {
    if (form >= -10 && form <= 10) return "text-green-500"
    if (form >= -20 && form <= 20) return "text-amber-500"
    return "text-red-500"
  }

  const createSessionSparkline = (data: number[]) => (
    <div className="flex items-end gap-px h-3 mt-1">
      {data.map((completed, index) => (
        <div key={index} className={`w-1 h-3 rounded-sm ${completed ? "bg-green-500" : "bg-gray-600"}`} />
      ))}
    </div>
  )

  const createFormSparkline = (data: number[], safeBand: { min: number; max: number }) => {
    const max = Math.max(...data, safeBand.max)
    const min = Math.min(...data, safeBand.min)
    const range = max - min || 1

    return (
      <div className="relative h-8 mt-2">
        {/* Safe band background */}
        <div
          className="absolute bg-green-500/30 rounded-sm border border-green-500/20"
          style={{
            left: 0,
            right: 0,
            top: `${100 - ((safeBand.max - min) / range) * 100}%`,
            bottom: `${((safeBand.min - min) / range) * 100}%`,
          }}
        />
        {/* Sparkline */}
        <div className="flex items-end gap-px h-8">
          {data.map((value, index) => {
            const height = ((value - min) / range) * 100
            const isLatest = index === data.length - 1
            return (
              <div
                key={index}
                className={`w-1 rounded-sm transition-all ${isLatest ? "bg-text-1 shadow-sm" : "bg-text-dim/60"}`}
                style={{ height: `${Math.max(height, 15)}%` }}
              />
            )
          })}
        </div>
      </div>
    )
  }

  const createPMISparkline = (data: number[], testDates: boolean[]) => <div className="relative h-4 mt-1"></div>

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "↑"
      case "down":
        return "↓"
      default:
        return "→"
    }
  }

  const sessionAdherence = (data.planAdherence.sessions.completed / data.planAdherence.sessions.total) * 100

  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-end">
        <button className="text-text-dim hover:text-text-1 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TooltipProvider>
          {/* Plan Adherence Tile */}
          <div className="bg-bg-surface border border-border-weak rounded-lg p-4 h-48 flex flex-col">
            <div className="flex items-center gap-1 mb-3">
              <span className="text-text-dim text-xs uppercase tracking-wide font-medium">Plan Adherence</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-text-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Sessions & hours completed vs planned; compliance counts reschedules within same week.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="text-xl font-bold text-text-1 mb-1">
              {data.planAdherence.sessions.completed}/{data.planAdherence.sessions.total} sessions
            </div>

            {createSessionSparkline(data.planAdherence.sparklineData)}

            <div className="flex justify-between items-center text-xs text-text-dim mt-2 mb-2">
              <span>
                {data.planAdherence.hours.completed}/{data.planAdherence.hours.total}h
              </span>
              <span>Compliance {data.planAdherence.compliance}%</span>
            </div>

            {/* Mini by-sport bars */}
            <div className="flex gap-1 mb-2">
              <div className="h-0.5 bg-cyan-500 flex-1" style={{ opacity: data.planAdherence.bySport.swim / 100 }} />
              <div className="h-0.5 bg-fuchsia-500 flex-1" style={{ opacity: data.planAdherence.bySport.bike / 100 }} />
              <div className="h-0.5 bg-emerald-400 flex-1" style={{ opacity: data.planAdherence.bySport.run / 100 }} />
            </div>

            <div className="flex justify-between items-end mt-auto pt-2">
              <div>
                {sessionAdherence < 80 && (
                  <span className="px-2 py-1 bg-amber-500 text-black text-xs rounded-md font-medium">At risk</span>
                )}
              </div>
              <button className="text-text-dim hover:text-text-1 text-xs">View misses</button>
            </div>
          </div>

          {/* Stress Balance Tile */}
          <div className="bg-bg-surface border border-border-weak rounded-lg p-4 h-48 flex flex-col">
            <div className="flex items-center gap-1 mb-3">
              <span className="text-text-dim text-xs uppercase tracking-wide font-medium">Stress Balance</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-text-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Form (TSB) = CTL − ATL. Band is your personal safe range.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className={`text-xl font-bold mb-1 ${getFormColor(data.stressBalance.form)}`}>
              Form: {data.stressBalance.form}
            </div>

            <div className="text-xs text-text-dim mb-1">
              CTL {data.stressBalance.ctl} • ATL {data.stressBalance.atl}
            </div>

            {createFormSparkline(data.stressBalance.sparklineData, data.stressBalance.safeBand)}

            <div className="flex justify-between items-end mt-auto pt-2">
              <div>
                {data.stressBalance.aRaceDays && data.stressBalance.aRaceDays <= 14 && (
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md font-medium">Taper guard</span>
                )}
              </div>
              <button className="text-text-dim hover:text-text-1 text-xs">See load trend</button>
            </div>
          </div>

          {/* Performance Momentum Tile */}
          <div className="bg-bg-surface border border-border-weak rounded-lg p-4 h-48 flex flex-col">
            <div className="flex items-center gap-1 mb-3">
              <span className="text-text-dim text-xs uppercase tracking-wide font-medium">Performance Momentum</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-text-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">PMI blends last tests + execution quality + volume quality.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex flex-col gap-1 text-sm mb-2">
              <div className="flex items-center justify-between">
                <span className="text-cyan-500">
                  Swim {data.performanceMomentum.swim.value} {getTrendIcon(data.performanceMomentum.swim.trend)}
                </span>
                <span className="text-text-dim text-xs">CSS 1:15</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fuchsia-500">
                  Bike {data.performanceMomentum.bike.value} {getTrendIcon(data.performanceMomentum.bike.trend)}
                </span>
                <span className="text-text-dim text-xs">FTP 285W</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400">
                  Run {data.performanceMomentum.run.value} {getTrendIcon(data.performanceMomentum.run.trend)}
                </span>
                <span className="text-text-dim text-xs">FTP 4:15/km</span>
              </div>
            </div>

            <div className="text-xs text-text-dim mb-1">
              PMI {data.performanceMomentum.pmi.value} ▲ +{data.performanceMomentum.pmi.change} (
              {data.performanceMomentum.pmi.period})
            </div>

            {createPMISparkline(data.performanceMomentum.sparklineData, data.performanceMomentum.testDates)}

            <div className="flex justify-between items-end mt-auto pt-2 mb-2">
              <div>
                {data.performanceMomentum.staleTest && (
                  <span className="px-2 py-1 bg-black text-white text-xs rounded-md font-medium">Test stale</span>
                )}
              </div>
              <button className="text-text-dim hover:text-text-1 text-xs">Plan next test</button>
            </div>
          </div>

          {/* Today's Conditions Tile */}
          <div className="bg-bg-surface border border-border-weak rounded-lg p-4 h-48 flex flex-col">
            <div className="flex items-center gap-1 mb-3">
              <span className="text-text-dim text-xs uppercase tracking-wide font-medium">Today's Conditions</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-text-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Outdoor-friendliness from heat, wind, and air quality.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="text-lg font-bold text-text-1 mb-2">{data.conditions.city}</div>

            <div className="flex items-center gap-3 text-xs text-text-dim mb-3">
              <div className="flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                {data.conditions.temperature}°C
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                {data.conditions.wind}
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                {data.conditions.humidity}%
              </div>
            </div>

            <div className="flex gap-1 mb-3">
              <span
                className={`px-2 py-1 text-xs rounded-md font-medium ${
                  data.conditions.heat === "Low"
                    ? "bg-green-600 text-white"
                    : data.conditions.heat === "Med"
                      ? "bg-amber-600 text-white"
                      : "bg-red-600 text-white"
                }`}
              >
                Heat {data.conditions.heat}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-md font-medium ${
                  data.conditions.windStatus === "OK" ? "bg-green-600 text-white" : "bg-amber-600 text-white"
                }`}
              >
                Wind {data.conditions.windStatus}
              </span>
              {data.conditions.aqi && (
                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-md font-medium">
                  AQI {data.conditions.aqi}
                </span>
              )}
            </div>

            <div className="flex justify-end mt-auto pt-2">
              <button className="text-text-2 hover:text-text-1 text-xs">Outside OK?</button>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
