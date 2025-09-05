"use client"

import type { ReactNode } from "react"

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  footer?: ReactNode
  trend?: "up" | "down" | "neutral"
}

export function KpiCard({ title, value, subtitle, footer, trend }: KpiCardProps) {
  return (
    <div className="bg-bg-surface border border-border-weak rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm text-text-2 mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-text-1">{value}</span>
            {trend && (
              <span
                className={`text-xs ${
                  trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-text-dim"
                }`}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-text-dim mt-1">{subtitle}</p>}
        </div>
      </div>

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  )
}
