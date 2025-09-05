interface ComplianceCirclesProps {
  durationCompliance: number
  powerCompliance: number
  className?: string
}

export function ComplianceCircles({ durationCompliance, powerCompliance, className }: ComplianceCirclesProps) {
  const getComplianceColor = (compliance: number) => {
    if (compliance >= 85) return "teal-500"
    if (compliance >= 70) return "yellow-500"
    if (compliance >= 55) return "amber-500"
    return "amber-700"
  }

  const getComplianceLabel = (compliance: number) => {
    if (compliance >= 85) return "Excellent"
    if (compliance >= 70) return "Good"
    return "Fair"
  }

  const StackedBar = ({ value, label, sublabel }: { value: number; label: string; sublabel: string }) => {
    const color = getComplianceColor(value)

    return (
      <div className="flex items-center gap-4">
        <div className="w-24 text-right">
          <div className="text-sm font-medium text-text-1">{sublabel}</div>
          <div className={`text-xs text-${color}`}>{label}</div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-end">
            <span className="text-sm font-semibold text-text-1">{value}%</span>
          </div>
          <div className="h-6 bg-bg-2 rounded overflow-hidden">
            <div className={`h-full transition-all duration-500 bg-${color}`} style={{ width: `${value}%` }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <StackedBar
        value={durationCompliance}
        label={getComplianceLabel(durationCompliance)}
        sublabel="Duration compliance"
      />
      <StackedBar value={powerCompliance} label={getComplianceLabel(powerCompliance)} sublabel="Power compliance" />
    </div>
  )
}
