"use client"

import { useState } from "react"
import { Filter, BarChart3 } from "lucide-react"

interface WorkoutSplitsProps {
  className?: string
}

export function WorkoutSplits({ className }: WorkoutSplitsProps) {
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "bars">("table")

  const mockSplits = [
    {
      lap: 1,
      time: "1:00:00",
      movingTime: "59:52",
      distance: "24.3 km",
      avgPower: 114,
      avgMovingPower: 114,
      maxPower: 202,
      avgHR: 105,
      avgCadence: 83,
      avgTemp: "25°",
    },
  ]

  return (
    <div className={className}>
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              viewMode === "table" ? "bg-bg-2 text-text-1" : "text-text-3 hover:text-text-2"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode("bars")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              viewMode === "bars" ? "bg-bg-2 text-text-1" : "text-text-3 hover:text-text-2"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border-1 rounded-lg text-text-2 hover:text-text-1 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Table view */}
      {viewMode === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-1">
                <th className="text-left py-2 text-text-2 font-medium">#</th>
                <th className="text-left py-2 text-text-2 font-medium">Time</th>
                <th className="text-left py-2 text-text-2 font-medium">Moving Time</th>
                <th className="text-left py-2 text-text-2 font-medium">Distance</th>
                <th className="text-left py-2 text-text-2 font-medium">Avg Power</th>
                <th className="text-left py-2 text-text-2 font-medium">Avg Moving Power</th>
                <th className="text-left py-2 text-text-2 font-medium">Max Power</th>
                <th className="text-left py-2 text-text-2 font-medium">Avg HR</th>
                <th className="text-left py-2 text-text-2 font-medium">Avg Cadence</th>
                <th className="text-left py-2 text-text-2 font-medium">Avg Temp</th>
              </tr>
            </thead>
            <tbody>
              {mockSplits.map((split) => (
                <tr key={split.lap} className="border-b border-border-weak">
                  <td className="py-2 text-text-1">{split.lap}</td>
                  <td className="py-2 text-text-1">{split.time}</td>
                  <td className="py-2 text-text-1">{split.movingTime}</td>
                  <td className="py-2 text-text-1">{split.distance}</td>
                  <td className="py-2 text-text-1">{split.avgPower}</td>
                  <td className="py-2 text-text-1">{split.avgMovingPower}</td>
                  <td className="py-2 text-text-1">{split.maxPower}</td>
                  <td className="py-2 text-text-1">{split.avgHR}</td>
                  <td className="py-2 text-text-1">{split.avgCadence}</td>
                  <td className="py-2 text-text-1">{split.avgTemp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bar view */}
      {viewMode === "bars" && (
        <div className="space-y-4">
          <div className="text-center text-text-3 text-sm py-8">Bar chart visualization would be implemented here</div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-bg-1 rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-text-1 font-medium mb-4">Filter Data</h3>
            <div className="space-y-3">
              {["Time", "Distance", "Power", "Heart Rate", "Cadence", "Temperature"].map((metric) => (
                <label key={metric} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-text-2 text-sm">{metric}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 bg-bg-2 text-text-2 rounded-lg hover:bg-bg-3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
