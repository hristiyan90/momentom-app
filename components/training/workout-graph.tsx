"use client"

import { useState } from "react"
import { ZoomIn, ZoomOut, Hand, MousePointer, RotateCcw, Eye, EyeOff } from "lucide-react"

interface WorkoutGraphProps {
  className?: string
}

export function WorkoutGraph({ className }: WorkoutGraphProps) {
  const [selectedTool, setSelectedTool] = useState<"zoom" | "pan" | "select">("select")
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null)
  const [visibleMetrics, setVisibleMetrics] = useState({
    power: true,
    heartRate: true,
    cadence: true,
    speed: true,
  })

  // Mock data for the graph
  const mockMetrics = {
    avgPower: 115,
    maxPower: 202,
    avgHeartRate: 105,
    maxHeartRate: 122,
    selectedAvgPower: 128,
    selectedMaxPower: 185,
    selectedAvgHR: 108,
    selectedMaxHR: 115,
    avgCadence: 85,
    maxCadence: 95,
    avgSpeed: 32.5,
    maxSpeed: 45.2,
    selectedAvgCadence: 88,
    selectedMaxCadence: 92,
    selectedAvgSpeed: 34.1,
    selectedMaxSpeed: 42.8,
  }

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }))
  }

  return (
    <div className={className}>
      {/* Graph controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTool("select")}
            className={`p-2 rounded-lg border transition-colors ${
              selectedTool === "select"
                ? "bg-bg-2 border-border-2 text-text-1"
                : "border-border-1 text-text-3 hover:text-text-2"
            }`}
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool("pan")}
            className={`p-2 rounded-lg border transition-colors ${
              selectedTool === "pan"
                ? "bg-bg-2 border-border-2 text-text-1"
                : "border-border-1 text-text-3 hover:text-text-2"
            }`}
          >
            <Hand className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool("zoom")}
            className="p-2 rounded-lg border border-border-1 text-text-3 hover:text-text-2 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg border border-border-1 text-text-3 hover:text-text-2 transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg border border-border-1 text-text-3 hover:text-text-2 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 bg-bg-2 rounded-lg p-1 border border-border-weak">
          <button
            onClick={() => toggleMetric("power")}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors ${
              visibleMetrics.power
                ? "bg-zone-1/10 text-zone-1 border border-zone-1/20"
                : "text-text-3 hover:text-text-2"
            }`}
          >
            {visibleMetrics.power ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Power
          </button>
          <button
            onClick={() => toggleMetric("heartRate")}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors ${
              visibleMetrics.heartRate
                ? "bg-zone-4/10 text-zone-4 border border-zone-4/20"
                : "text-text-3 hover:text-text-2"
            }`}
          >
            {visibleMetrics.heartRate ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            HR
          </button>
          <button
            onClick={() => toggleMetric("cadence")}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors ${
              visibleMetrics.cadence
                ? "bg-zone-3/10 text-zone-3 border border-zone-3/20"
                : "text-text-3 hover:text-text-2"
            }`}
          >
            {visibleMetrics.cadence ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Cadence
          </button>
          <button
            onClick={() => toggleMetric("speed")}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors ${
              visibleMetrics.speed
                ? "bg-zone-2/10 text-zone-2 border border-zone-2/20"
                : "text-text-3 hover:text-text-2"
            }`}
          >
            {visibleMetrics.speed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Speed
          </button>
        </div>
      </div>

      {/* Graph area */}
      <div className="relative bg-bg-2 rounded-lg p-4 h-64 mb-4">
        {/* Mock graph visualization */}
        <div className="w-full h-full relative">
          {/* Time markers */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-text-3 pb-2">
            <span>0m</span>
            <span>12m</span>
            <span>24m</span>
            <span>36m</span>
            <span>47m</span>
          </div>

          {/* Mock graph lines */}
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {visibleMetrics.power && (
              <path d="M0,150 Q100,140 200,145 T400,150" stroke="var(--chart-1)" strokeWidth="2" fill="none" />
            )}
            {visibleMetrics.heartRate && (
              <path d="M0,120 Q100,110 200,115 T400,120" stroke="var(--chart-4)" strokeWidth="2" fill="none" />
            )}
            {visibleMetrics.cadence && (
              <path d="M0,100 Q100,95 200,98 T400,100" stroke="var(--chart-3)" strokeWidth="2" fill="none" />
            )}
            {visibleMetrics.speed && (
              <path d="M0,80 Q100,75 200,78 T400,80" stroke="var(--chart-5)" strokeWidth="2" fill="none" />
            )}

            {/* Selected range overlay */}
            {selectedRange && (
              <rect
                x={selectedRange.start}
                y="0"
                width={selectedRange.end - selectedRange.start}
                height="200"
                fill="rgba(34, 211, 238, 0.1)"
                stroke="rgba(34, 211, 238, 0.3)"
                strokeWidth="1"
              />
            )}
          </svg>

          <div className="absolute bottom-6 left-4 flex gap-4 text-xs">
            {visibleMetrics.power && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-zone-1"></div>
                <span className="text-text-3">Power</span>
              </div>
            )}
            {visibleMetrics.heartRate && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-zone-4"></div>
                <span className="text-text-3">Heart Rate</span>
              </div>
            )}
            {visibleMetrics.cadence && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-zone-3"></div>
                <span className="text-text-3">Cadence</span>
              </div>
            )}
            {visibleMetrics.speed && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-orange-400"></div>
                <span className="text-text-3">Speed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {visibleMetrics.power && (
            <>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">AVG Power</span>
                <span className="text-text-1 font-medium">
                  {selectedRange ? mockMetrics.selectedAvgPower : mockMetrics.avgPower} w
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max Power</span>
                <span className="text-text-1 font-medium">
                  {selectedRange ? mockMetrics.selectedMaxPower : mockMetrics.maxPower} w
                </span>
              </div>
            </>
          )}
          {visibleMetrics.cadence && (
            <>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">AVG Cadence</span>
                <span className="text-text-1 font-medium">
                  {selectedRange ? mockMetrics.selectedAvgCadence : mockMetrics.avgCadence} rpm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max Cadence</span>
                <span className="text-text-1 font-medium">
                  {selectedRange ? mockMetrics.selectedMaxCadence : mockMetrics.maxCadence} rpm
                </span>
              </div>
            </>
          )}
        </div>
        <div className="space-y-2">
          {visibleMetrics.heartRate && (
            <>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">AVG Heart Rate</span>
                <span className="text-text-1 font-medium">
                  {selectedRange ? mockMetrics.selectedAvgHR : mockMetrics.avgHeartRate} bpm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max Heart Rate</span>
                <span className="text-text-1 font-medium">
                  {selectedRange ? mockMetrics.selectedMaxHR : mockMetrics.maxHeartRate} bpm
                </span>
              </div>
            </>
          )}
          {visibleMetrics.speed && (
            <>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">AVG Speed</span>
                <span className="text-text-1 font-medium">
                  {selectedRange ? mockMetrics.selectedAvgSpeed : mockMetrics.avgSpeed} km/h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max Speed</span>
                <span className="text-text-1 font-medium">
                  {selectedRange ? mockMetrics.selectedMaxSpeed : mockMetrics.maxSpeed} km/h
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
