import { cn } from "@/lib/utils"

interface ComplianceBarProps {
  durationCompliance: number // 0-100 percentage
  powerCompliance: number // 0-100 percentage
  className?: string
}

export function ComplianceBar({ durationCompliance, powerCompliance, className }: ComplianceBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Duration Compliance */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-text-2">
          <span>Duration Compliance</span>
          <span>{durationCompliance}%</span>
        </div>
        <div className="h-2 bg-bg-2 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              durationCompliance >= 90 ? "bg-emerald-600" : durationCompliance >= 70 ? "bg-yellow-600" : "bg-red-600",
            )}
            style={{ width: `${durationCompliance}%` }}
          />
        </div>
      </div>

      {/* Power/Pace Compliance */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-text-2">
          <span>Power/Pace Compliance</span>
          <span>{powerCompliance}%</span>
        </div>
        <div className="h-2 bg-bg-2 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              powerCompliance >= 90 ? "bg-emerald-600" : powerCompliance >= 70 ? "bg-yellow-600" : "bg-red-600",
            )}
            style={{ width: `${powerCompliance}%` }}
          />
        </div>
      </div>
    </div>
  )
}
