import { cn } from "@/lib/utils"

interface ZoneData {
  zone: string
  planned: number // minutes
  actual: number // minutes
  color: string
}

interface ZoneComparisonBarsProps {
  zones: ZoneData[]
  className?: string
}

export function ZoneComparisonBars({ zones, className }: ZoneComparisonBarsProps) {
  const maxTime = Math.max(...zones.flatMap((z) => [z.planned, z.actual]))

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-4 text-xs font-medium text-text-2 pb-2 border-b border-border-1">
        <span>Zone</span>
        <span>Planned</span>
        <span>Actual</span>
        <span>Difference</span>
      </div>

      {zones.map((zone) => (
        <div key={zone.zone} className="grid grid-cols-4 gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: zone.color }} />
            <span className="text-sm font-medium text-text-1">{zone.zone}</span>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-text-2">
              {Math.floor(zone.planned / 60)}:{(zone.planned % 60).toString().padStart(2, "0")}
            </div>
            <div className="h-1 bg-bg-2 rounded-full">
              <div
                className="h-full rounded-full opacity-70"
                style={{
                  backgroundColor: zone.color,
                  width: `${(zone.planned / maxTime) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-text-1 font-medium">
              {Math.floor(zone.actual / 60)}:{(zone.actual % 60).toString().padStart(2, "0")}
            </div>
            <div className="h-1 bg-bg-2 rounded-full">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: zone.color,
                  width: `${(zone.actual / maxTime) * 100}%`,
                }}
              />
            </div>
          </div>

          <div
            className={cn(
              "text-xs font-medium",
              zone.actual > zone.planned
                ? "text-emerald-300"
                : zone.actual < zone.planned
                  ? "text-red-300"
                  : "text-text-2",
            )}
          >
            {zone.actual > zone.planned ? "+" : ""}
            {Math.floor((zone.actual - zone.planned) / 60)}:
            {Math.abs((zone.actual - zone.planned) % 60)
              .toString()
              .padStart(2, "0")}
          </div>
        </div>
      ))}
    </div>
  )
}
