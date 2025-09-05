"use client"

import { useState } from "react"

interface LoadBarsProps {
  data: {
    swim: number
    bike: number
    run: number
  }
  maxValue?: number
}

// Mock zone distribution data
const zoneData = {
  swim: { Z1: 20, Z2: 30, Z3: 25, Z4: 15, Z5a: 7, Z5b: 2, Z5c: 1 },
  bike: { Z1: 25, Z2: 35, Z3: 20, Z4: 12, Z5a: 5, Z5b: 2, Z5c: 1 },
  run: { Z1: 30, Z2: 25, Z3: 20, Z4: 15, Z5a: 7, Z5b: 2, Z5c: 1 },
}

export function LoadBars({ data, maxValue = 100 }: LoadBarsProps) {
  const [hoveredSport, setHoveredSport] = useState<string | null>(null)

  const sports = [
    { key: "swim", label: "Swim", color: "bg-swim" },
    { key: "bike", label: "Bike", color: "bg-bike" },
    { key: "run", label: "Run", color: "bg-run" },
  ] as const

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {sports.map((sport) => {
          const value = data[sport.key]
          const percentage = (value / maxValue) * 100

          return (
            <div
              key={sport.key}
              className="relative"
              onMouseEnter={() => setHoveredSport(sport.key)}
              onMouseLeave={() => setHoveredSport(null)}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-3 h-3 ${sport.color} rounded-full`} />
                <span className="text-text-2 text-sm font-medium">{sport.label}</span>
                <span className="text-text-dim text-sm ml-auto">{value}h</span>
              </div>

              <div className="bg-bg-raised h-2 rounded-full overflow-hidden">
                <div
                  className={`${sport.color} h-full rounded-full transition-all duration-200`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Zone breakdown tooltip */}
              {hoveredSport === sport.key && (
                <div className="absolute top-full left-0 mt-2 bg-bg-raised border border-border-mid rounded-lg p-3 z-10 min-w-48">
                  <p className="text-text-1 text-sm font-medium mb-2">Zone Distribution</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(zoneData[sport.key]).map(([zone, percent]) => (
                      <div key={zone} className="flex justify-between">
                        <span className="text-text-2">{zone}:</span>
                        <span className="text-text-1">{percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
