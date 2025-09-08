import { cn } from "@/lib/utils"

interface IntensitySegment {
  label: string
  zone: "Z1" | "Z2" | "Z3" | "Z4" | "Z5"
  minutes: number
  intervals?: Array<{
    distance: string
    targetPace: string
    duration: string
    compliance?: number // Percentage of interval completed (0-100)
    averagePower?: number // Average power achieved
    targetPower?: number // Target power for the interval
  }>
}

interface IntensityBarProps {
  segments: IntensitySegment[]
  compact?: boolean
  className?: string
  isCompleted?: boolean
}

const zoneColors = {
  Z1: "#22D3EE", // Cyan
  Z2: "#3B82F6", // Blue
  Z3: "#8B5CF6", // Indigo
  Z4: "#EC4899", // Purple
  Z5: "#EF4444", // Pink
}

const zoneHeights = {
  Z1: "20px",
  Z2: "28px",
  Z3: "36px",
  Z4: "44px",
  Z5: "52px",
}

const zoneLabels = {
  Z1: "Active Recovery",
  Z2: "Endurance",
  Z3: "Tempo",
  Z4: "Threshold",
  Z5: "VO2 Max",
}

const isHighIntensity = (zone: string) => {
  return zone === "Z3" || zone === "Z4" || zone === "Z5"
}

export function IntensityBar({ segments, compact = false, className, isCompleted = false }: IntensityBarProps) {
  const totalMinutes = segments.reduce((sum, segment) => sum + segment.minutes, 0)

  const lowIntensityPercent = 70
  const highIntensityPercent = 30

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between mb-2"></div>

      <div className="flex gap-1 h-14 items-end">
        {segments.map((segment, segmentIndex) => {
          const widthPercent = (segment.minutes / totalMinutes) * 100

          if (segment.intervals && segment.intervals.length > 0) {
            return segment.intervals.map((interval, intervalIndex) => (
              <div
                key={`${segmentIndex}-${intervalIndex}`}
                className="group relative"
                style={{
                  width: `${widthPercent / segment.intervals!.length}%`,
                  height: zoneHeights[segment.zone],
                }}
              >
                {isCompleted && interval.compliance !== undefined ? (
                  <div className="w-full h-full rounded-sm relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full transition-all duration-200 hover:brightness-110"
                      style={{
                        backgroundColor: zoneColors[segment.zone],
                        width: `${interval.compliance}%`,
                      }}
                    />
                    <div
                      className="absolute top-0 h-full transition-all duration-200"
                      style={{
                        backgroundColor: "var(--muted)",
                        left: `${interval.compliance}%`,
                        width: `${100 - interval.compliance}%`,
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full rounded-sm transition-all duration-200 hover:brightness-110"
                    style={{ backgroundColor: zoneColors[segment.zone] }}
                  />
                )}

                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-950 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                  <span className="text-white">
                    {interval.distance} @ {interval.targetPace}
                  </span>
                  <div className="text-xs text-gray-100">{interval.duration}</div>
                  {isCompleted && interval.averagePower && interval.targetPower && (
                    <div className="text-xs text-gray-100 mt-1 border-t border-gray-700 pt-1">
                      Power: {interval.averagePower}W / {interval.targetPower}W
                      <div className="text-xs text-gray-100">
                        ({Math.round((interval.averagePower / interval.targetPower) * 100)}% of target)
                      </div>
                    </div>
                  )}
                  {isCompleted && interval.compliance !== undefined && (
                    <div className="text-xs text-gray-100">Completion: {interval.compliance}%</div>
                  )}
                  <div className="text-xs text-gray-100">
                    {segment.zone} - {zoneLabels[segment.zone]}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-950"></div>
                </div>
              </div>
            )) // Added missing closing parenthesis for intervals.map()
          }

          return (
            <div
              key={segmentIndex}
              className="group relative"
              style={{
                width: `${widthPercent}%`,
                height: zoneHeights[segment.zone],
              }}
            >
              <div
                className="w-full h-full rounded-sm transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: zoneColors[segment.zone] }}
              />

              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-950 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                <span className="text-white">{segment.label}</span>
                <div className="text-xs text-gray-100">
                  {segment.zone} - {zoneLabels[segment.zone]}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-950"></div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative">
        <div className="group flex h-4 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 cursor-pointer">
          <div
            className="transition-all duration-200 hover:brightness-110"
            style={{
              width: `${lowIntensityPercent}%`,
              backgroundColor: "#3B82F6",
            }}
          />
          <div
            className="transition-all duration-200 hover:brightness-110"
            style={{
              width: `${highIntensityPercent}%`,
              backgroundColor: "#EF4444",
            }}
          />

          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-950 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            <div className="font-medium mb-1 text-white">Intensity Distribution</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#3B82F6" }}></div>
                <span className="text-gray-100">Low Intensity: {lowIntensityPercent}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#EF4444" }}></div>
                <span className="text-gray-100">High Intensity: {highIntensityPercent}%</span>
              </div>
            </div>
            <div className="text-xs text-gray-200 mt-1">Z1-Z2 vs Z3-Z5</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-950"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
