"use client"

import type { SessionLite } from "./MonthCell"
import { Activity, Bike, Waves, Dumbbell } from "lucide-react"

interface DayPopoverProps {
  date: Date
  sessions: SessionLite[]
  onClose: () => void
  position?: "above" | "below"
}

const sportIcons = {
  swim: Waves,
  bike: Bike,
  run: Activity,
  strength: Dumbbell,
}

const intensityColors = {
  recovery: "bg-emerald-600/50 text-emerald-100",
  endurance: "bg-blue-600/50 text-blue-100",
  tempo: "bg-yellow-600/50 text-yellow-100",
  threshold: "bg-orange-600/50 text-orange-100",
  vo2: "bg-red-600/50 text-red-100",
}

export function DayPopover({ date, sessions, onClose, position = "below" }: DayPopoverProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h${mins > 0 ? mins.toString().padStart(2, "0") : ""}` : `${mins}m`
  }

  const positionClasses = position === "above" ? "bottom-full mb-2" : "top-full mt-2"

  return (
    <div
      className={`absolute ${positionClasses} left-0 z-50 w-80 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-4`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-1">
          {date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </h3>
        <button onClick={onClose} className="text-text-dim hover:text-text-1 text-sm">
          ×
        </button>
      </div>

      <div className="space-y-2">
        {sessions.map((session) => {
          const Icon = sportIcons[session.sport]
          return (
            <div key={session.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-raised">
              <Icon className="w-4 h-4 text-text-2" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-1 truncate">{session.title}</span>
                  <span className="text-xs text-text-dim">{formatDuration(session.minutes)}</span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${intensityColors[session.intensity]}`}>
                    {session.intensity}
                  </span>
                </div>
              </div>

              {session.load && <span className="text-xs text-text-dim">{session.load} TSS</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
