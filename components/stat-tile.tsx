interface StatTileProps {
  label: string
  value: string | number
  sublabel?: string
  trend?: "up" | "down" | "neutral"
  color?: "default" | "swim" | "bike" | "run" | "success" | "warn" | "danger"
}

const colorConfig = {
  default: "text-text-1",
  swim: "text-swim",
  bike: "text-bike",
  run: "text-run",
  success: "text-success",
  warn: "text-warn",
  danger: "text-danger",
}

export function StatTile({ label, value, sublabel, trend, color = "default" }: StatTileProps) {
  const trendIcon = trend === "up" ? "↗" : trend === "down" ? "↘" : ""
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-text-dim"

  return (
    <div className="bg-bg-surface border border-border-weak rounded-lg p-6 hover:bg-bg-raised transition-colors duration-150">
      <div className="space-y-2">
        <p className="text-text-2 text-sm font-medium">{label}</p>
        <p className={`text-3xl font-semibold ${colorConfig[color]} tabular-nums`}>{value}</p>
        {sublabel && (
          <div className="flex items-center gap-2">
            <p className="text-text-dim text-sm">{sublabel}</p>
            {trend && <span className={`text-sm ${trendColor}`}>{trendIcon}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
