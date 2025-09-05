"use client"

import type React from "react"

import { useState } from "react"
import { DayPopover } from "./DayPopover"
import { Waves, Bike, Footprints, Dumbbell, AlertTriangle, Plane, Briefcase, Users, MoreHorizontal } from "lucide-react"

type Intensity = "recovery" | "endurance" | "tempo" | "threshold" | "vo2"
type Sport = "swim" | "bike" | "run" | "strength"
type MacroPhase = "base" | "build" | "peak" | "taper"
type RaceType = "A" | "B" | "C"

export type SessionLite = {
  id: string
  dateISO: string
  sport: Sport
  title: string
  minutes: number
  intensity: Intensity
  load?: number
}

export type DayAggregate = {
  dateISO: string
  bySportMinutes: Partial<Record<Sport, number>>
  sessions: SessionLite[]
}

interface MonthCellProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  dayData?: DayAggregate
  macroPhase?: MacroPhase | null
  raceType?: RaceType | null
  macroBlock?: {
    phase: MacroPhase
    startDate: Date
    endDate: Date
    label: string
    description: string
  } | null
  activeMacroBlock?: {
    phase: MacroPhase
    startDate: Date
    endDate: Date
    label: string
    description: string
  } | null
  isFirstCellOfRow?: boolean
  onDateSelect?: (date: Date) => void
  onMouseDown?: (date: Date, event: React.MouseEvent) => void
  onMouseEnter?: (date: Date) => void
  isLifeBlocker?: boolean
  isDragSelection?: boolean
  isSelectedRange?: boolean
  lifeBlockerDetails?: {
    type: "illness" | "travel" | "work" | "family" | "other"
    title: string
    description?: string
  }
  onLifeBlockerClick?: (date: Date) => void
  onRaceClick?: (date: Date) => void
  raceDetails?: {
    id: string
    name: string
    type: "A" | "B" | "C"
    date: Date
    location: string
    distance: string
    discipline: "triathlon" | "swim" | "bike" | "run"
    description?: string
  }
  rowIndex?: number
}

const sportColors = {
  swim: "bg-sport-swim", // #3ba7ff (blue)
  bike: "bg-sport-bike", // #ff8a24 (orange)
  run: "bg-sport-run", // #8053ff (purple)
  strength: "bg-gray-500",
}

const sportIcons = {
  swim: Waves,
  bike: Bike,
  run: Footprints,
  strength: Dumbbell,
}

const loadColors = {
  low: "bg-green-500",
  moderate: "bg-yellow-500",
  high: "bg-orange-500",
  extreme: "bg-red-500",
}

const intensityColors = {
  recovery: "bg-teal-500",
  endurance: "bg-blue-500",
  tempo: "bg-purple-500",
  threshold: "bg-pink-500",
  vo2: "bg-red-500",
}

const macroPhaseColors = {
  base: "rgba(100, 116, 139, 0.1)", // #64748B with 10% opacity
  build: "rgba(251, 146, 60, 0.1)", // #FB923C with 10% opacity
  peak: "rgba(220, 38, 38, 0.1)", // #DC2626 with 10% opacity
  taper: "rgba(250, 204, 21, 0.1)", // #FACC15 with 10% opacity
}

const raceTypeColors = {
  A: "bg-red-500",
  B: "bg-amber-500",
  C: "bg-blue-500",
}

const blockerTypeLabels = {
  illness: "Illness",
  travel: "Travel",
  work: "Work",
  family: "Family",
  other: "Other",
}

const blockerTypeColors = {
  illness: "bg-red-600",
  travel: "bg-blue-600",
  work: "bg-orange-600",
  family: "bg-green-600",
  other: "bg-gray-600",
}

const blockerTypeIcons = {
  illness: AlertTriangle,
  travel: Plane,
  work: Briefcase,
  family: Users,
  other: MoreHorizontal,
}

const blockerTypeAccentColors = {
  illness: "border-l-red-500",
  travel: "border-l-blue-500",
  work: "border-l-orange-500",
  family: "border-l-green-500",
  other: "border-l-gray-500",
}

const blockerTypeIconColors = {
  illness: "text-red-500",
  travel: "text-blue-500",
  work: "text-orange-500",
  family: "text-green-500",
  other: "text-gray-500",
}

const getLoadSeverity = (load: number): keyof typeof loadColors => {
  if (load < 50) return "low"
  if (load < 75) return "moderate"
  if (load < 90) return "high"
  return "extreme"
}

const getComplianceColor = (session: SessionLite, isPast: boolean) => {
  if (!isPast) {
    const sportColorMap = {
      swim: "border-l-sport-swim",
      bike: "border-l-sport-bike",
      run: "border-l-sport-run",
      strength: "border-l-gray-500",
    }
    return sportColorMap[session.sport]
  }

  // Past workouts use compliance colors
  const compliance = session.load ? (session.load > 50 ? 90 : 70) : 0
  const isMissed = !session.load || session.load === 0

  if (isMissed) return "border-l-red-500"
  if (compliance < 85) return "border-l-yellow-500"
  return "border-l-green-500"
}

const getIconAndDotColor = (session: SessionLite, isPast: boolean) => {
  if (!isPast) {
    const sportColorMap = {
      swim: "text-sport-swim",
      bike: "text-sport-bike",
      run: "text-sport-run",
      strength: "text-gray-500",
    }
    return sportColorMap[session.sport]
  }

  // Past workouts use compliance colors
  const compliance = session.load ? (session.load > 50 ? 90 : 70) : 0
  const isMissed = !session.load || session.load === 0

  if (isMissed) return "text-red-500"
  if (compliance < 85) return "text-yellow-500"
  return "text-green-500"
}

const getDisciplineName = (sport: Sport): string => {
  const disciplineMap = {
    swim: "Swim",
    bike: "Bike",
    run: "Run",
    strength: "Gym",
  }
  return disciplineMap[sport]
}

const getIntensityDots = (intensity: Intensity) => {
  const intensityLevels = {
    recovery: 1,
    endurance: 1,
    tempo: 2,
    threshold: 3,
    vo2: 3,
  }
  return intensityLevels[intensity]
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h${remainingMinutes.toString().padStart(2, "0")}min`
}

const getOverlayStyle = (props: MonthCellProps) => {
  if (props.isLifeBlocker) {
    return { backgroundColor: "rgba(107, 114, 128, 0.7)" } // Gray overlay for life blockers
  }
  if (props.isDragSelection || props.isSelectedRange) {
    return { backgroundColor: "rgba(107, 114, 128, 0.4)" } // Lighter gray for selection
  }
  return {}
}

const macroPhaseLineColors = {
  base: "#64748B",
  build: "#FB923C",
  peak: "#DC2626",
  taper: "#FACC15",
}

export function MonthCell({
  date,
  isCurrentMonth,
  isToday,
  dayData,
  macroPhase,
  raceType,
  macroBlock,
  activeMacroBlock,
  isFirstCellOfRow = false,
  onDateSelect,
  onMouseDown,
  onMouseEnter,
  isLifeBlocker,
  isDragSelection,
  isSelectedRange,
  lifeBlockerDetails,
  onLifeBlockerClick,
  onRaceClick,
  raceDetails,
  rowIndex,
}: MonthCellProps & { rowIndex?: number }) {
  const [showPopover, setShowPopover] = useState(false)
  const [showMacroTooltip, setShowMacroTooltip] = useState(false)

  const dayNumber = date.getDate()
  const hasData = dayData && dayData.sessions.length > 0
  const isRestDay = !hasData
  const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0))

  const displaySessions = dayData?.sessions.slice(0, 2) || []
  const excessSessions = dayData && dayData.sessions.length > 2 ? dayData.sessions.length - 2 : 0

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault()
      return
    }

    if (isLifeBlocker && onLifeBlockerClick) {
      onLifeBlockerClick(date)
      return
    }

    onDateSelect?.(date)
    setShowPopover(true)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    onMouseDown?.(date, e)
  }

  const handleMouseEnter = () => {
    onMouseEnter?.(date)
    if (!isDragSelection && !isSelectedRange) {
      setShowPopover(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isDragSelection && !isSelectedRange) {
      setShowPopover(false)
    }
    setShowMacroTooltip(false)
  }

  const handleRaceClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRaceClick) {
      onRaceClick(date)
    }
  }

  const handleMacroLineEnter = () => {
    setShowMacroTooltip(true)
  }

  const handleMacroLineLeave = () => {
    setShowMacroTooltip(false)
  }

  const getSportAccentColor = (sport: Sport) => {
    const colorMap = {
      swim: "bg-swim",
      bike: "bg-bike",
      run: "bg-run",
      strength: "bg-gray-500",
    }
    return colorMap[sport]
  }

  const getHoverPosition = () => {
    if (rowIndex === undefined) return "below"
    // First three rows (0, 1, 2) show below, bottom three rows (3, 4, 5) show above
    return rowIndex < 3 ? "below" : "above"
  }

  return (
    <div className="relative">
      {activeMacroBlock && isFirstCellOfRow && (
        <div
          className="absolute left-0 top-0 bottom-0 z-10 cursor-pointer w-0.5"
          style={{ backgroundColor: macroPhaseLineColors[activeMacroBlock.phase] }}
          onMouseEnter={handleMacroLineEnter}
          onMouseLeave={handleMacroLineLeave}
        />
      )}

      {showMacroTooltip && activeMacroBlock && isFirstCellOfRow && (
        <div className="absolute left-2 top-0 z-20 bg-bg-raised border border-border-weak rounded-lg p-3 shadow-lg min-w-64 max-w-80">
          <div className="text-sm font-semibold text-text-1 mb-1">{activeMacroBlock.label}</div>
          <div className="text-xs text-text-2 mb-2">
            {activeMacroBlock.startDate.toLocaleDateString()} - {activeMacroBlock.endDate.toLocaleDateString()}
          </div>
          <div className="text-xs text-text-dim">{activeMacroBlock.description}</div>
        </div>
      )}

      <div
        className={`
          h-40 p-3 border border-border-weak rounded-lg cursor-pointer transition-all duration-150
          ${isCurrentMonth ? "bg-bg-surface hover:bg-bg-raised" : "bg-bg-app opacity-50"}
          ${isToday ? "ring-2 ring-cyan-500" : ""}
          ${isDragSelection ? "ring-2 ring-gray-400" : ""}
          ${isSelectedRange ? "ring-2 ring-gray-500" : ""}
        `}
        style={getOverlayStyle({ isLifeBlocker, isDragSelection, isSelectedRange })}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-start justify-between mb-3">
          <span className={`text-sm font-medium ${isCurrentMonth ? "text-text-1" : "text-text-dim"}`}>{dayNumber}</span>
          <div className="flex items-center gap-1">
            {isToday && <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>}
            {raceType && (
              <div
                className={`w-4 h-4 ${raceTypeColors[raceType]} text-white text-xs font-bold rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={handleRaceClick}
              >
                {raceType}
              </div>
            )}
          </div>
        </div>

        {isLifeBlocker && lifeBlockerDetails && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`flex items-center bg-gray-800 ${blockerTypeAccentColors[lifeBlockerDetails.type]} border-l-4 rounded-md p-2 cursor-pointer hover:opacity-90 transition-opacity`}
            >
              {(() => {
                const Icon = blockerTypeIcons[lifeBlockerDetails.type]
                return (
                  <Icon className={`w-4 h-4 ${blockerTypeIconColors[lifeBlockerDetails.type]} mr-2 flex-shrink-0`} />
                )
              })()}
              <div className="text-xs font-medium text-white">{blockerTypeLabels[lifeBlockerDetails.type]}</div>
            </div>
          </div>
        )}

        {isLifeBlocker && !lifeBlockerDetails && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center bg-gray-800 border-l-gray-500 border-l-4 rounded-md p-2">
              <MoreHorizontal className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
              <div className="text-xs font-medium text-white">Life Blocker</div>
            </div>
          </div>
        )}

        {!isLifeBlocker && (
          <div className="space-y-2">
            {displaySessions.map((session, index) => {
              const Icon = sportIcons[session.sport]
              const disciplineName = getDisciplineName(session.sport)
              const intensityDots = getIntensityDots(session.intensity)
              const formattedDuration = formatDuration(session.minutes)
              const complianceColor = getComplianceColor(session, isPastDate)
              const iconColor = getIconAndDotColor(session, isPastDate)

              return (
                <div
                  key={session.id}
                  className={`border-l-4 ${complianceColor} rounded-r-md p-2 transition-colors hover:bg-bg-raised/50 bg-gray-700 ${
                    !isCurrentMonth ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-text-1 truncate">{disciplineName}</div>
                        <div className="text-xs text-text-2">{formattedDuration}</div>
                      </div>

                      <div className="flex items-center space-x-0.5">
                        {Array.from({ length: intensityDots }).map((_, dotIndex) => (
                          <div
                            key={dotIndex}
                            className={`w-1.5 h-1.5 rounded-full ${iconColor.replace("text-", "bg-")}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {excessSessions > 0 && !isLifeBlocker && (
          <div className="absolute bottom-1 right-1 bg-text-dim text-bg-app text-xs px-1.5 py-0.5 rounded-full font-medium">
            +{excessSessions}
          </div>
        )}

        {isRestDay && !isLifeBlocker && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-text-dim">Rest</span>
          </div>
        )}
      </div>

      {showPopover && hasData && !isLifeBlocker && (
        <DayPopover
          date={date}
          sessions={dayData.sessions}
          onClose={() => setShowPopover(false)}
          position={getHoverPosition()}
        />
      )}
    </div>
  )
}
