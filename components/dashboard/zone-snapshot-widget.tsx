"use client"

import { Info, TrendingUp, TrendingDown, Minus, Waves, Bike, Footprints, Heart } from "lucide-react"
import { useState } from "react"

interface ZoneSnapshotData {
  swim: {
    currentZone: number
    thresholds: { css: number; t100: number }
    lastTest: string
    status: "current" | "stale" | "needs-test"
    trend: "up" | "down" | "stable"
    performanceMomentum: number
    trendData: { month: number; value: number }[]
  }
  bike: {
    currentZone: number
    thresholds: { ftp: number; vo2max: number }
    lastTest: string
    status: "current" | "stale" | "needs-test"
    trend: "up" | "down" | "stable"
    performanceMomentum: number
    trendData: { month: number; value: number }[]
  }
  run: {
    currentZone: number
    thresholds: { lthr: number; vdot: number }
    lastTest: string
    status: "current" | "stale" | "needs-test"
    trend: "up" | "down" | "stable"
    performanceMomentum: number
    trendData: { month: number; value: number }[]
  }
  hr: {
    currentZone: number
    thresholds: { lthr: number; maxHr: number }
    lastTest: string
    status: "current" | "stale" | "needs-test"
    trend: "up" | "down" | "stable"
    performanceMomentum: number
    trendData: { month: number; value: number }[]
  }
}

interface ZoneSnapshotWidgetProps {
  data: ZoneSnapshotData
}

const sportColors = {
  swim: "var(--sport-swim)",
  bike: "var(--sport-bike)",
  run: "var(--sport-run)",
  hr: "var(--status-alert)",
}

const statusColors = {
  current: "var(--status-success)",
  stale: "var(--status-caution)",
  "needs-test": "var(--status-danger)",
}

const SportIcon = ({ sport }: { sport: "swim" | "bike" | "run" | "hr" }) => {
  const iconProps = { className: "w-4 h-4", style: { color: sportColors[sport] } }

  switch (sport) {
    case "swim":
      return <Waves {...iconProps} />
    case "bike":
      return <Bike {...iconProps} />
    case "run":
      return <Footprints {...iconProps} />
    case "hr":
      return <Heart {...iconProps} />
  }
}

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-green-500" />
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-red-500" />
  return <Minus className="w-3 h-3 text-text-dim" />
}

const MiniTrendGraph = ({ data, color }: { data: { month: number; value: number }[]; color: string }) => {
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  return (
    <div className="h-8 flex items-end gap-0.5">
      {data.map((point, index) => {
        const height = ((point.value - minValue) / range) * 24 + 4
        return (
          <div
            key={index}
            className="w-1 rounded-sm opacity-70"
            style={{
              height: `${height}px`,
              backgroundColor: color,
            }}
          />
        )
      })}
    </div>
  )
}

export function ZoneSnapshotWidget({ data }: ZoneSnapshotWidgetProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1m" | "3m" | "6m" | "1y" | "max">("3m")

  const timeframes = [
    { key: "1m" as const, label: "1M" },
    { key: "3m" as const, label: "3M" },
    { key: "6m" as const, label: "6M" },
    { key: "1y" as const, label: "1Y" },
    { key: "max" as const, label: "Max" },
  ]

  return (
    <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-text-1 font-medium">Zone Snapshot</h3>
          <Info
            className="w-4 h-4 text-text-2 cursor-help"
            title="Current zone status and threshold overview across all disciplines"
          />
        </div>

        <div className="flex gap-1 bg-bg-raised rounded-md p-1">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.key}
              onClick={() => setSelectedTimeframe(timeframe.key)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedTimeframe === timeframe.key ? "bg-bg-surface text-text-1" : "text-text-dim hover:text-text-2"
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Swim */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SportIcon sport="swim" />
            <span className="text-text-2 text-sm font-medium">Swim</span>
            <TrendIcon trend={data.swim.trend} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-dim">Momentum</span>
              <span className="text-text-2 font-medium">{data.swim.performanceMomentum}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-dim">CSS</span>
                <span className="text-text-2">{data.swim.thresholds.css}s/100m</span>
              </div>
            </div>

            <div className="pt-2">
              <MiniTrendGraph data={data.swim.trendData} color={sportColors.swim} />
            </div>

            <div className="pt-2 border-t border-border-weak">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim">Last Test</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[data.swim.status] }} />
                  <span className="text-xs text-text-2">{data.swim.lastTest}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bike */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SportIcon sport="bike" />
            <span className="text-text-2 text-sm font-medium">Bike</span>
            <TrendIcon trend={data.bike.trend} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-dim">Momentum</span>
              <span className="text-text-2 font-medium">{data.bike.performanceMomentum}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-dim">FTP</span>
                <span className="text-text-2">{data.bike.thresholds.ftp}W</span>
              </div>
            </div>

            <div className="pt-2">
              <MiniTrendGraph data={data.bike.trendData} color={sportColors.bike} />
            </div>

            <div className="pt-2 border-t border-border-weak">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim">Last Test</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[data.bike.status] }} />
                  <span className="text-xs text-text-2">{data.bike.lastTest}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Run */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SportIcon sport="run" />
            <span className="text-text-2 text-sm font-medium">Run</span>
            <TrendIcon trend={data.run.trend} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-dim">Momentum</span>
              <span className="text-text-2 font-medium">{data.run.performanceMomentum}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-dim">LTHR</span>
                <span className="text-text-2">{data.run.thresholds.lthr} bpm</span>
              </div>
            </div>

            <div className="pt-2">
              <MiniTrendGraph data={data.run.trendData} color={sportColors.run} />
            </div>

            <div className="pt-2 border-t border-border-weak">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim">Last Test</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[data.run.status] }} />
                  <span className="text-xs text-text-2">{data.run.lastTest}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SportIcon sport="hr" />
            <span className="text-text-2 text-sm font-medium">Heart Rate</span>
            <TrendIcon trend={data.hr.trend} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-dim">Momentum</span>
              <span className="text-text-2 font-medium">{data.hr.performanceMomentum}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-dim">LTHR</span>
                <span className="text-text-2">{data.hr.thresholds.lthr} bpm</span>
              </div>
            </div>

            <div className="pt-2">
              <MiniTrendGraph data={data.hr.trendData} color={sportColors.hr} />
            </div>

            <div className="pt-2 border-t border-border-weak">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim">Last Test</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[data.hr.status] }} />
                  <span className="text-xs text-text-2">{data.hr.lastTest}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-weak">
        <div className="flex gap-4 text-xs text-text-dim">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Stale &gt;8 weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Needs Test</span>
          </div>
        </div>

        <button className="text-xs text-text-2 hover:text-text-1 transition-colors">Manage Zones →</button>
      </div>
    </div>
  )
}
