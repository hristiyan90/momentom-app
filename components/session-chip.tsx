"use client"

import { Waves, Bike, Footprints } from "lucide-react"

interface SessionChipProps {
  sport: "swim" | "bike" | "run"
  title: string
  duration: string
  intensity: number // 1-5 scale
  missed?: boolean
  onClick?: () => void
}

const sportConfig = {
  swim: { icon: Waves, color: "bg-swim", rail: "border-l-swim" },
  bike: { icon: Bike, color: "bg-bike", rail: "border-l-bike" },
  run: { icon: Footprints, color: "bg-run", rail: "border-l-run" },
}

const missedSportConfig = {
  swim: { icon: Waves, color: "bg-red-500", rail: "border-l-red-500" },
  bike: { icon: Bike, color: "bg-red-500", rail: "border-l-red-500" },
  run: { icon: Footprints, color: "bg-red-500", rail: "border-l-red-500" },
}

export function SessionChip({ sport, title, duration, intensity, missed, onClick }: SessionChipProps) {
  const config = missed ? missedSportConfig[sport] : sportConfig[sport]
  const Icon = config.icon

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${config.color} hover:opacity-80`}
      onClick={onClick}
    >
      <Icon className="w-4 h-4 text-white" />
      {title && <span className="text-white text-sm font-medium">{title}</span>}
      {duration && <span className="text-white/80 text-xs">{duration}</span>}
    </div>
  )
}
