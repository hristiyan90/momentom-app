"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { MonthGrid } from "@/components/calendar/MonthGrid"
import { WeekLane } from "@/components/week-lane"
import { WeekSummary } from "@/components/calendar/WeekSummary"
import { QuickAddModal } from "@/components/calendar/QuickAddModal"
import { CalendarSidebar } from "@/components/calendar/CalendarSidebar"
import { LifeBlockerSidebar } from "@/components/calendar/LifeBlockerSidebar"
import { RaceDetailsSidebar } from "@/components/calendar/RaceDetailsSidebar"
import type { DayAggregate } from "@/components/calendar/MonthCell"

type ViewMode = "month" | "week"

interface LifeBlocker {
  id: string
  startDate: Date
  endDate: Date
  type: "illness" | "travel" | "work" | "family" | "other"
  title: string
  description?: string
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

// Add a deterministic random number generator
const deterministicRandom = (seed: string): number => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647 // Normalize to 0-1
}

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDayData, setSelectedDayData] = useState<DayAggregate | null>(null)

  const [lifeBlockers, setLifeBlockers] = useState<LifeBlocker[]>([])
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date; end: Date } | null>(null)
  const [lifeBlockerSidebarOpen, setLifeBlockerSidebarOpen] = useState(false)

  const [editingBlocker, setEditingBlocker] = useState<LifeBlocker | null>(null)

  const [raceDetailsSidebarOpen, setRaceDetailsSidebarOpen] = useState(false)
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const getWeekStart = (date: Date) => {
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - ((date.getDay() + 6) % 7))
    return weekStart
  }

  const handleMonthChange = (year: number, month: number) => {
    setCurrentDate(new Date(year, month, 1))
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const dayData = generateMockData(date)
    if (dayData) {
      setSelectedDayData(dayData)
      setSidebarOpen(true)
    }
  }

  const handleDragSelection = (startDate: Date, endDate: Date) => {
    setSelectedDateRange({ start: startDate, end: endDate })
    setLifeBlockerSidebarOpen(true)
  }

  const handleLifeBlockerCreate = (blocker: Omit<LifeBlocker, "id">) => {
    const newBlocker: LifeBlocker = {
      ...blocker,
      id: `blocker-${Date.now()}`,
    }
    setLifeBlockers((prev) => [...prev, newBlocker])
    setLifeBlockerSidebarOpen(false)
    setSelectedDateRange(null)
  }

  const handleLifeBlockerClick = (date: Date) => {
    const blocker = lifeBlockers.find((b) => date >= b.startDate && date <= b.endDate)
    if (blocker) {
      setEditingBlocker(blocker)
      setSelectedDateRange({ start: blocker.startDate, end: blocker.endDate })
      setLifeBlockerSidebarOpen(true)
    }
  }

  const handleLifeBlockerUpdate = (blockerId: string, updatedBlocker: Omit<LifeBlocker, "id">) => {
    setLifeBlockers((prev) =>
      prev.map((blocker) => (blocker.id === blockerId ? { ...updatedBlocker, id: blockerId } : blocker)),
    )
    setLifeBlockerSidebarOpen(false)
    setSelectedDateRange(null)
    setEditingBlocker(null)
  }

  const handleLifeBlockerDelete = (blockerId: string) => {
    setLifeBlockers((prev) => prev.filter((blocker) => blocker.id !== blockerId))
    setLifeBlockerSidebarOpen(false)
    setSelectedDateRange(null)
    setEditingBlocker(null)
  }

  const handleLifeBlockerSidebarClose = () => {
    setLifeBlockerSidebarOpen(false)
    setSelectedDateRange(null)
    setEditingBlocker(null)
  }

  const handleWeekChange = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
    setSelectedDayData(null)
  }

  const generateMockData = (date: Date): DayAggregate | undefined => {
    const dayOfWeek = (date.getDay() + 6) % 7 // 0=Monday, 1=Tuesday, etc.
    const today = new Date()
    const isThisWeek = Math.abs(date.getTime() - today.getTime()) < 7 * 24 * 60 * 60 * 1000

    if (dayOfWeek === 0) return undefined // Monday rest day

    const sessions = []
    const bySportMinutes: Partial<Record<"swim" | "bike" | "run" | "strength", number>> = {}

    if (isThisWeek) {
      switch (dayOfWeek) {
        case 1: // Tuesday
          if (date < today) {
            sessions.push({
              id: `${date.toISOString()}-missed`,
              dateISO: date.toISOString().split("T")[0],
              sport: "bike" as const,
              title: "Sweet Spot Intervals",
              minutes: 75,
              intensity: "tempo" as const,
              load: 0, // Missed workout - no load
            })
            bySportMinutes.bike = 75
          }
          break
        case 2: // Wednesday
          if (date <= today) {
            sessions.push(
              {
                id: `${date.toISOString()}-swim`,
                dateISO: date.toISOString().split("T")[0],
                sport: "swim" as const,
                title: "Easy Recovery",
                minutes: 45,
                intensity: "recovery" as const,
                load: 95, // Good compliance - green field
              },
              {
                id: `${date.toISOString()}-bike`,
                dateISO: date.toISOString().split("T")[0],
                sport: "bike" as const,
                title: "Tempo Intervals",
                minutes: 90,
                intensity: "tempo" as const,
                load: 45, // Low compliance - yellow field
              },
            )
            bySportMinutes.swim = 45
            bySportMinutes.bike = 90
          }
          break
        case 3: // Thursday
          sessions.push(
            {
              id: `${date.toISOString()}-swim`,
              dateISO: date.toISOString().split("T")[0],
              sport: "swim" as const,
              title: "Threshold 400s",
              minutes: 75,
              intensity: "threshold" as const,
              load: 195,
            },
            {
              id: `${date.toISOString()}-bike`,
              dateISO: date.toISOString().split("T")[0],
              sport: "bike" as const,
              title: "FTP Test",
              minutes: 90,
              intensity: "vo2" as const,
              load: 285,
            },
          )
          bySportMinutes.swim = 75
          bySportMinutes.bike = 90
          break
        case 4: // Friday
          sessions.push({
            id: `${date.toISOString()}-run`,
            dateISO: date.toISOString().split("T")[0],
            sport: "run" as const,
            title: "Recovery Run",
            minutes: 40,
            intensity: "recovery" as const,
            load: 45,
          })
          bySportMinutes.run = 40
          break
        case 5: // Saturday
          sessions.push(
            {
              id: `${date.toISOString()}-swim`,
              dateISO: date.toISOString().split("T")[0],
              sport: "swim" as const,
              title: "Open Water Prep",
              minutes: 90,
              intensity: "endurance" as const,
              load: 125,
            },
            {
              id: `${date.toISOString()}-strength`,
              dateISO: date.toISOString().split("T")[0],
              sport: "strength" as const,
              title: "Core & Stability",
              minutes: 45,
              intensity: "endurance" as const,
              load: 35,
            },
          )
          bySportMinutes.swim = 90
          bySportMinutes.strength = 45
          break
        case 6: // Sunday
          sessions.push(
            {
              id: `${date.toISOString()}-brick`,
              dateISO: date.toISOString().split("T")[0],
              sport: "bike" as const,
              title: "Brick Workout",
              minutes: 150,
              intensity: "tempo" as const,
              load: 225,
            },
            {
              id: `${date.toISOString()}-run`,
              dateISO: date.toISOString().split("T")[0],
              sport: "run" as const,
              title: "Transition Run",
              minutes: 30,
              intensity: "tempo" as const,
              load: 65,
            },
            {
              id: `${date.toISOString()}-strength`,
              dateISO: date.toISOString().split("T")[0],
              sport: "strength" as const,
              title: "Recovery Yoga",
              minutes: 30,
              intensity: "recovery" as const,
              load: 15,
            },
          )
          bySportMinutes.bike = 150
          bySportMinutes.run = 30
          bySportMinutes.strength = 30
          break
      }
    } else {
      const random = Math.random()
      if (random < 0.15) return undefined

      const sessionCount = Math.floor(Math.random() * 3) + 1
      const sports = ["swim", "bike", "run", "strength"] as const
      const intensities = ["recovery", "endurance", "tempo", "threshold", "vo2"] as const

      for (let i = 0; i < sessionCount; i++) {
        const sport = sports[Math.floor(deterministicRandom(`${date.toISOString()}-sport-${i}`) * sports.length)]
        const intensity = intensities[Math.floor(deterministicRandom(`${date.toISOString()}-intensity-${i}`) * intensities.length)]
        const minutes = sport === "strength" 
          ? Math.floor(deterministicRandom(`${date.toISOString()}-minutes-${i}`) * 60) + 30 
          : Math.floor(deterministicRandom(`${date.toISOString()}-minutes-${i}`) * 120) + 45

        sessions.push({
          id: `${date.toISOString()}-${i}`,
          dateISO: date.toISOString().split("T")[0],
          sport,
          title: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Session`,
          minutes,
          intensity,
          load: Math.floor(deterministicRandom(`${date.toISOString()}-load-${i}`) * 150) + 50,
        })

        bySportMinutes[sport] = (bySportMinutes[sport] || 0) + minutes
      }
    }

    return sessions.length > 0
      ? {
          dateISO: date.toISOString().split("T")[0],
          bySportMinutes,
          sessions,
        }
      : undefined
  }

  const weekSummaryData = {
    loadBySport: {
      swim: 180,
      bike: 360,
      run: 150,
      strength: 90,
    },
    intensityMix: {
      recovery: 20,
      endurance: 40,
      tempo: 25,
      threshold: 10,
      vo2: 5,
    },
    planned: 8,
    completed: 5,
  }

  // Race data is now handled by MonthGrid component

  const handleRaceClick = (race: Race) => {
    setSelectedRace(race)
    setRaceDetailsSidebarOpen(true)
  }

  const handleRaceDetailsSidebarClose = () => {
    setRaceDetailsSidebarOpen(false)
    setSelectedRace(null)
  }

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Training schedule and planning"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex bg-bg-raised rounded-lg p-1">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${
                  viewMode === "month" ? "bg-swim text-white" : "text-text-2 hover:text-text-1"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${
                  viewMode === "week" ? "bg-swim text-white" : "text-text-2 hover:text-text-1"
                }`}
              >
                Week
              </button>
            </div>

            <button
              onClick={() => setShowQuickAdd(true)}
              className="px-4 py-2 bg-swim text-white text-sm font-medium rounded-lg hover:bg-swim/90 transition-colors duration-150"
            >
              Add Session
            </button>
          </div>
        }
      />

      <div className="space-y-8">
        {viewMode === "month" ? (
          <MonthGrid
            year={currentYear}
            month={currentMonth}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
            onDragSelection={handleDragSelection}
            lifeBlockers={lifeBlockers}
            selectedDateRange={selectedDateRange}
            onLifeBlockerClick={handleLifeBlockerClick}
            onRaceClick={handleRaceClick}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleWeekChange("prev")}
                  className="btn focus-ring"
                >
                  Previous Week
                </button>
                <button
                  onClick={() => handleWeekChange("next")}
                  className="btn focus-ring"
                >
                  Next Week
                </button>
              </div>

              <WeekLane
                weekStart={getWeekStart(currentDate)}
                onSessionClick={(session) => console.log("Session clicked:", session)}
              />
            </div>

            <div className="lg:col-span-1">
              <WeekSummary {...weekSummaryData} />
            </div>
          </div>
        )}
      </div>

      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        defaultDate={selectedDate || currentDate}
      />

      {sidebarOpen && <CalendarSidebar date={selectedDate} dayData={selectedDayData} onClose={handleSidebarClose} />}

      {lifeBlockerSidebarOpen && selectedDateRange && (
        <LifeBlockerSidebar
          dateRange={selectedDateRange}
          onClose={handleLifeBlockerSidebarClose}
          onSave={handleLifeBlockerCreate}
          existingBlocker={editingBlocker || undefined}
          onUpdate={handleLifeBlockerUpdate}
          onDelete={handleLifeBlockerDelete}
        />
      )}

      {raceDetailsSidebarOpen && selectedRace && (
        <RaceDetailsSidebar race={selectedRace} onClose={handleRaceDetailsSidebarClose} />
      )}
    </>
  )
}
