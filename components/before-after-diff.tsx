"use client"

import { RotateCcw } from "lucide-react"

interface DiffItem {
  label: string
  before: string | number
  after: string | number
  change: "increase" | "decrease" | "neutral"
}

interface BeforeAfterDiffProps {
  title: string
  subtitle?: string
  items: DiffItem[]
  onRevert?: () => void
  showRevert?: boolean
}

export function BeforeAfterDiff({ title, subtitle, items, onRevert, showRevert = true }: BeforeAfterDiffProps) {
  const getChangeColor = (change: DiffItem["change"]) => {
    switch (change) {
      case "increase":
        return "text-success"
      case "decrease":
        return "text-danger"
      default:
        return "text-text-dim"
    }
  }

  const getChangeIcon = (change: DiffItem["change"]) => {
    switch (change) {
      case "increase":
        return "↗"
      case "decrease":
        return "↘"
      default:
        return "→"
    }
  }

  return (
    <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-text-1 font-medium">{title}</h3>
          {subtitle && <p className="text-text-2 text-sm mt-1">{subtitle}</p>}
        </div>

        {showRevert && onRevert && (
          <button
            onClick={onRevert}
            className="flex items-center gap-2 px-3 py-2 bg-bg-raised text-text-2 text-sm rounded-lg hover:bg-border-weak transition-colors duration-150"
          >
            <RotateCcw className="w-4 h-4" />
            Revert
          </button>
        )}
      </div>

      {/* Before/After comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before card */}
        <div className="bg-bg-raised rounded-lg p-4">
          <h4 className="text-text-2 font-medium mb-4">Before</h4>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-text-dim text-sm">{item.label}</span>
                <span className="text-text-1 tabular-nums">{item.before}</span>
              </div>
            ))}
          </div>
        </div>

        {/* After card */}
        <div className="bg-bg-raised rounded-lg p-4">
          <h4 className="text-text-2 font-medium mb-4">After</h4>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-text-dim text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-1 tabular-nums">{item.after}</span>
                  <span className={`text-sm ${getChangeColor(item.change)}`}>{getChangeIcon(item.change)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border-weak">
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-dim">Changes applied</span>
          <span className="text-text-2">
            {items.filter((item) => item.change !== "neutral").length} of {items.length} values modified
          </span>
        </div>
      </div>
    </div>
  )
}
