interface ZoneTableProps {
  sport: "swim" | "bike" | "run"
  threshold: {
    value: number
    unit: string
    label: string
  }
  zones: {
    Z1: { min: number; max: number; description: string }
    Z2: { min: number; max: number; description: string }
    Z3: { min: number; max: number; description: string }
    Z4: { min: number; max: number; description: string }
    Z5a: { min: number; max: number; description: string }
    Z5b: { min: number; max: number; description: string }
    Z5c: { min: number; max: number; description: string }
  }
}

const sportColors = {
  swim: "text-swim",
  bike: "text-bike",
  run: "text-run",
}

const zoneColors = {
  Z1: "bg-emerald-600/50 text-emerald-100",
  Z2: "bg-blue-600/50 text-blue-100",
  Z3: "bg-yellow-600/50 text-yellow-100",
  Z4: "bg-orange-600/50 text-orange-100",
  Z5a: "bg-red-600/50 text-red-100",
  Z5b: "bg-red-700/60 text-red-100",
  Z5c: "bg-red-800/70 text-red-100",
}

export function ZoneTable({ sport, threshold, zones }: ZoneTableProps) {
  return (
    <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-3 h-3 bg-${sport} rounded-full`} />
        <h3 className="text-text-1 font-medium capitalize">{sport} Training Zones</h3>
      </div>

      {/* Threshold */}
      <div className="mb-6 p-4 bg-bg-raised rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-text-2 font-medium">{threshold.label}</span>
          <span className={`text-lg font-semibold ${sportColors[sport]} tabular-nums`}>
            {threshold.value} {threshold.unit}
          </span>
        </div>
      </div>

      {/* Zones table */}
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-4 pb-2 border-b border-border-weak text-text-dim text-sm font-medium">
          <span>Zone</span>
          <span>Range</span>
          <span>% of Threshold</span>
          <span>Description</span>
        </div>

        {Object.entries(zones).map(([zone, data]) => {
          const minPercent = Math.round((data.min / threshold.value) * 100)
          const maxPercent = Math.round((data.max / threshold.value) * 100)

          return (
            <div key={zone} className="grid grid-cols-4 gap-4 py-3 border-b border-border-weak last:border-b-0">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${zoneColors[zone as keyof typeof zoneColors]}`}
                >
                  {zone}
                </span>
              </div>

              <span className="text-text-1 tabular-nums">
                {data.min} - {data.max} {threshold.unit}
              </span>

              <span className="text-text-2 tabular-nums">
                {minPercent}% - {maxPercent}%
              </span>

              <span className="text-text-dim text-sm">{data.description}</span>
            </div>
          )
        })}
      </div>

      {/* Last updated */}
      <div className="mt-6 pt-4 border-t border-border-weak">
        <p className="text-text-dim text-xs">Last updated: 2 weeks ago</p>
      </div>
    </div>
  )
}
