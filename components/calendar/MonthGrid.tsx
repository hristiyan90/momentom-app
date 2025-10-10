"use client"

import type React from "react"

import { useState, useRef } from "react"
import { MonthCell, type DayAggregate } from "./MonthCell"

interface MonthGridProps {
  year: number
  month: number
  onDateSelect?: (date: Date) => void
  onMonthChange?: (year: number, month: number) => void
  onDragSelection?: (startDate: Date, endDate: Date) => void
  lifeBlockers?: Array<{
    id: string
    startDate: Date
    endDate: Date
    type: "illness" | "travel" | "work" | "family" | "other"
    title: string
    description?: string
  }>
  selectedDateRange?: { start: Date; end: Date } | null
  onLifeBlockerClick?: (date: Date) => void
  onRaceClick?: (race: Race) => void
  sessionsData?: Record<string, SessionData[]>
  loading?: boolean
}

interface SessionData {
  session_id: string
  date: string
  sport: string
  title: string
  planned_duration_min?: number
  actual_duration_min?: number
  planned_zone_primary?: string
  planned_load?: number
  status: string
}

// Helper function to convert sessions data to DayAggregate
const getDayDataFromSessions = (date: Date, sessionsData: Record<string, SessionData[]>): DayAggregate | undefined => {
  const dateStr = date.toISOString().split('T')[0]
  const daySessions = sessionsData[dateStr] || []
  
  if (daySessions.length === 0) return undefined
  
  const sessions = daySessions.map(session => ({
    id: session.session_id,
    dateISO: session.date,
    sport: session.sport,
    title: session.title,
    minutes: session.planned_duration_min || session.actual_duration_min || 60,
    intensity: session.planned_zone_primary || 'z2',
    load: session.planned_load || 50,
  }))
  
  const bySportMinutes = sessions.reduce((acc, session) => {
    acc[session.sport] = (acc[session.sport] || 0) + session.minutes
    return acc
  }, {} as Record<string, number>)
  
  return {
    dateISO: dateStr,
    bySportMinutes,
    sessions
  }
}

type MacroPhase = "base" | "build" | "peak" | "taper"
type RaceType = "A" | "B" | "C"

interface MacroBlock {
  phase: MacroPhase
  startDate: Date
  endDate: Date
  label: string
  description: string
}

interface Race {
  id: string
  name: string
  type: "A" | "B" | "C"
  date: Date
  location: string
  distance: string
  discipline: "triathlon" | "swim" | "bike" | "run"
  description?: string
}

const getMacroBlocks = (year: number, month: number): MacroBlock[] => {
  return [
    {
      phase: "base",
      startDate: new Date(year, month - 1, 1),
      endDate: new Date(year, month, 15),
      label: "Base Phase",
      description: "Building aerobic capacity and endurance foundation with high volume, low intensity training.",
    },
    {
      phase: "build",
      startDate: new Date(year, month, 16),
      endDate: new Date(year, month + 1, 10),
      label: "Build Phase",
      description: "Increasing training intensity and specificity to develop race-specific fitness and power.",
    },
    {
      phase: "peak",
      startDate: new Date(year, month + 1, 11),
      endDate: new Date(year, month + 1, 25),
      label: "Peak Phase",
      description: "Fine-tuning race fitness with high-intensity work while maintaining freshness for competition.",
    },
    {
      phase: "taper",
      startDate: new Date(year, month + 1, 26),
      endDate: new Date(year, month + 2, 5),
      label: "Taper Phase",
      description: "Reducing training volume while maintaining intensity to arrive at race day fresh and ready.",
    },
  ]
}

const getRaceDays = (year: number, month: number): Race[] => {
  return [
    {
      id: "race-1",
      date: new Date(year, month, 8),
      type: "C",
      name: "Local Sprint Triathlon",
      location: "City Park Lake",
      distance: "750m swim, 20km bike, 5km run",
      discipline: "triathlon",
      description: "A great tune-up race to test your current fitness and race tactics.",
    },
    {
      id: "race-2",
      date: new Date(year, month, 22),
      type: "B",
      name: "Olympic Distance Championship",
      location: "Riverside Sports Complex",
      distance: "1.5km swim, 40km bike, 10km run",
      discipline: "triathlon",
      description: "Regional championship race with competitive field. Good preparation for A race.",
    },
    {
      id: "race-3",
      date: new Date(year, month + 1, 15),
      type: "A",
      name: "Ironman 70.3 Regional",
      location: "Coastal Resort",
      distance: "1.9km swim, 90km bike, 21.1km run",
      discipline: "triathlon",
      description: "Your main goal race for the season. All training has been building toward this event.",
    },
  ]
}

const getMacroPhaseForDate = (date: Date, macroBlocks: MacroBlock[]): MacroPhase | null => {
  for (const block of macroBlocks) {
    if (date >= block.startDate && date <= block.endDate) {
      return block.phase
    }
  }
  return null
}

const getRaceTypeForDate = (date: Date, raceDays: Race[]): RaceType | null => {
  const raceDay = raceDays.find((race) => race.date.toDateString() === date.toDateString())
  return raceDay?.type || null
}

const getRaceForDate = (date: Date, raceDays: Race[]): Race | undefined => {
  if (!raceDays || !Array.isArray(raceDays)) {
    return undefined
  }
  return raceDays.find((race) => race.date.toDateString() === date.toDateString())
}

const getMacroBlockForDate = (date: Date, macroBlocks: MacroBlock[]): MacroBlock | null => {
  for (const block of macroBlocks) {
    if (date >= block.startDate && date <= block.endDate) {
      return block
    }
  }
  return null
}

// Function to determine if a date should show the macro phase line
const shouldShowMacroLine = (date: Date, macroBlocks: MacroBlock[]): MacroBlock | null => {
  // Show line for all days within an active macro phase
  for (const block of macroBlocks) {
    if (date >= block.startDate && date <= block.endDate) {
      return block
    }
  }
  return null
}

export function MonthGrid({
  year,
  month,
  onDateSelect,
  onMonthChange,
  onDragSelection,
  lifeBlockers = [],
  selectedDateRange,
  onLifeBlockerClick,
  onRaceClick,
  sessionsData = {},
  loading = false,
}: MonthGridProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Date | null>(null)
  const [dragEnd, setDragEnd] = useState<Date | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7))

  const macroBlocks = getMacroBlocks(year, month)
  const raceDays = getRaceDays(year, month)

  const handleMouseDown = (date: Date, event: React.MouseEvent) => {
    if (event.shiftKey) {
      event.preventDefault()
      setIsDragging(true)
      setDragStart(date)
      setDragEnd(date)
    }
  }

  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStart) {
      setDragEnd(date)
    }
  }

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd && onDragSelection) {
      const start = dragStart < dragEnd ? dragStart : dragEnd
      const end = dragStart < dragEnd ? dragEnd : dragStart
      onDragSelection(start, end)
    }
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  const isDateInLifeBlocker = (date: Date) => {
    return lifeBlockers.some((blocker) => date >= blocker.startDate && date <= blocker.endDate)
  }

  const getLifeBlockerForDate = (date: Date) => {
    return lifeBlockers.find((blocker) => date >= blocker.startDate && date <= blocker.endDate) || null
  }

  const isDateInDragSelection = (date: Date) => {
    if (!isDragging || !dragStart || !dragEnd) return false
    const start = dragStart < dragEnd ? dragStart : dragEnd
    const end = dragStart < dragEnd ? dragEnd : dragStart
    return date >= start && date <= end
  }

  const isDateInSelectedRange = (date: Date) => {
    if (!selectedDateRange) return false
    return date >= selectedDateRange.start && date <= selectedDateRange.end
  }

  const days = []
  const currentDate = new Date(startDate)

  // Generate 6 weeks of days
  for (let week = 0; week < 6; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(currentDate)
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.toDateString() === today.toDateString()
      const dayData = sessionsData ? getDayDataFromSessions(date, sessionsData) : undefined

      const macroPhase = getMacroPhaseForDate(date, macroBlocks)
      const raceType = getRaceTypeForDate(date, raceDays)
      const macroBlock = getMacroBlockForDate(date, macroBlocks)
      const activeMacroBlock = shouldShowMacroLine(date, macroBlocks)

      const lifeBlockerDetails = getLifeBlockerForDate(date)
      const raceDetails = getRaceForDate(date, raceDays)

      const isFirstCellOfRow = day === 0

      days.push(
        <MonthCell
          key={date.toISOString()}
          date={date}
          isCurrentMonth={isCurrentMonth}
          isToday={isToday}
          dayData={dayData}
          macroPhase={macroPhase}
          raceType={raceType}
          macroBlock={macroBlock}
          activeMacroBlock={activeMacroBlock}
          isFirstCellOfRow={isFirstCellOfRow}
          onDateSelect={onDateSelect}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          isLifeBlocker={isDateInLifeBlocker(date)}
          isDragSelection={isDateInDragSelection(date)}
          isSelectedRange={isDateInSelectedRange(date)}
          lifeBlockerDetails={
            lifeBlockerDetails
              ? {
                  type: lifeBlockerDetails.type,
                  title: lifeBlockerDetails.title,
                  description: lifeBlockerDetails.description,
                }
              : undefined
          }
          onLifeBlockerClick={onLifeBlockerClick}
          onRaceClick={(race) => onRaceClick?.(race)}
          raceDetails={raceDetails}
          rowIndex={week}
        />,
      )

      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  const handlePrevMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1
    const newYear = month === 0 ? year - 1 : year
    onMonthChange?.(newYear, newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1
    const newYear = month === 11 ? year + 1 : year
    onMonthChange?.(newYear, newMonth)
  }

  return (
    <div className="bg-bg-surface border border-border-weak rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-phase-base"></div>
            <span className="text-text-dim">Base</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-phase-build"></div>
            <span className="text-text-dim">Build</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-phase-peak"></div>
            <span className="text-text-dim">Peak</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-phase-taper"></div>
            <span className="text-text-dim">Taper</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-400"></div>
            <span className="text-text-dim">Life Blocker</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-text-dim">Hold Shift + drag to create life blockers</span>
          <div className="flex items-center gap-1">
            <div className="px-2 py-1 rounded text-xs font-medium border" style={{ 
              backgroundColor: 'rgba(from var(--race-a) r g b / 0.2)', 
              borderColor: 'var(--race-a)', 
              color: 'var(--race-a)' 
            }}>
              A Race
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="px-2 py-1 rounded text-xs font-medium border" style={{ 
              backgroundColor: 'rgba(from var(--race-b) r g b / 0.2)', 
              borderColor: 'var(--race-b)', 
              color: 'var(--race-b)' 
            }}>
              B Race
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="px-2 py-1 rounded text-xs font-medium border" style={{ 
              backgroundColor: 'rgba(from var(--race-c) r g b / 0.2)', 
              borderColor: 'var(--race-c)', 
              color: 'var(--race-c)' 
            }}>
              C Race
            </div>
          </div>
        </div>
      </div>

      {/* Month header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-1">
          {new Date(year, month).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="px-3 py-1 bg-bg-raised border border-border-weak text-text-2 rounded-lg hover:bg-bg-surface transition-colors"
          >
            ←
          </button>
          <button
            onClick={handleNextMonth}
            className="px-3 py-1 bg-bg-raised border border-border-weak text-text-2 rounded-lg hover:bg-bg-surface transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-center text-sm text-text-dim font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-7 gap-2 md:grid-cols-7 select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {days}
      </div>
    </div>
  )
}
