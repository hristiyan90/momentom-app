"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/page-header"
import { MonthGrid } from "@/components/calendar/MonthGrid"
import { WeekLane } from "@/components/week-lane"
import { WeekSummary } from "@/components/calendar/WeekSummary"
import { QuickAddModal } from "@/components/calendar/QuickAddModal"
import { CalendarSidebar } from "@/components/calendar/CalendarSidebar"
import { LifeBlockerSidebar } from "@/components/calendar/LifeBlockerSidebar"
import { RaceDetailsSidebar } from "@/components/calendar/RaceDetailsSidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorState } from "@/components/ui/error-state"
import { EmptySessions } from "@/components/ui/empty-sessions"
import { useMonthData, useWeekData } from "@/lib/hooks/useCalendarData"
import { getDayDataForDate, mapApiSessionToWeekSession } from "@/lib/utils/calendarMappers"
import type { DayAggregate } from "@/components/calendar/MonthCell"

// Development athlete ID - in production this would come from auth
const DEV_ATHLETE_ID = "00000000-0000-0000-0000-000000000001";

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

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 6)) // September 2025 where test data exists
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

  // Memoize week start calculation to prevent unnecessary re-renders
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate])

  // Use live data hooks based on view mode
  const monthData = useMonthData(DEV_ATHLETE_ID, currentYear, currentMonth)
  const weekData = useWeekData(DEV_ATHLETE_ID, weekStart)

  // Choose data source based on view mode
  const activeData = viewMode === "month" ? monthData : weekData
  
  // Log current state for debugging
  console.log(`📊 Calendar view: ${viewMode}, Current: ${currentDate.toISOString().split('T')[0]}, Sessions: ${activeData.sessions.data?.length || 0}, Loading: ${activeData.loading}, Error: ${activeData.hasError}`)
  console.log(`💡 Tip: Test data exists for 2025-09-06, 2025-09-07, 2025-09-08 only`)

  const handleMonthChange = (year: number, month: number) => {
    setCurrentDate(new Date(year, month, 1))
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    
    // Get live data for selected date
    if (activeData.sessions.data) {
      const dayData = getDayDataForDate(activeData.sessions.data, date)
      if (dayData) {
        setSelectedDayData(dayData)
        setSidebarOpen(true)
      }
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

  // Manual refresh function for debugging
  const handleManualRefresh = () => {
    activeData.refetchAll();
  };

  // Generate week summary data from live sessions
  const getWeekSummaryData = () => {
    if (!weekData.sessions.data || weekData.sessions.data.length === 0) {
      return {
        loadBySport: { swim: 0, bike: 0, run: 0, strength: 0 },
        intensityMix: { recovery: 0, endurance: 0, tempo: 0, threshold: 0, vo2: 0 },
        planned: 0,
        completed: 0,
      }
    }

    const weekSessions = weekData.sessions.data.map(mapApiSessionToWeekSession)
    
    const loadBySport = { swim: 0, bike: 0, run: 0, strength: 0 }
    const intensityMix = { recovery: 0, endurance: 0, tempo: 0, threshold: 0, vo2: 0 }
    let planned = 0
    let completed = 0

    weekSessions.forEach(session => {
      planned++
      if (session.completed) completed++
      
      // Calculate load by sport (rough approximation)
      const duration = session.duration.split(':').map(Number)
      const minutes = duration[0] * 60 + duration[1]
      const load = minutes * session.intensity
      
      if (session.sport === 'swim') loadBySport.swim += load
      else if (session.sport === 'bike') loadBySport.bike += load
      else if (session.sport === 'run') loadBySport.run += load
      
      // Map intensity
      const intensityMap = ['recovery', 'endurance', 'tempo', 'threshold', 'vo2'] as const
      const intensityName = intensityMap[session.intensity - 1] || 'endurance'
      intensityMix[intensityName] += 10 // rough percentage
    })

    return { loadBySport, intensityMix, planned, completed }
  }

  const weekSummaryData = getWeekSummaryData()

  // Race data is now handled by MonthGrid component
  const handleRaceClick = (race: Race) => {
    setSelectedRace(race)
    setRaceDetailsSidebarOpen(true)
  }

  const handleRaceDetailsSidebarClose = () => {
    setRaceDetailsSidebarOpen(false)
    setSelectedRace(null)
  }

  // Loading state
  if (activeData.loading) {
    return (
      <>
        <PageHeader
          title="Calendar"
          subtitle="Training schedule and planning"
        />
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner 
            size="lg" 
            text="Loading calendar data..."
            centered
          />
        </div>
      </>
    )
  }

  // Error state
  if (activeData.hasError) {
    return (
      <>
        <PageHeader
          title="Calendar"
          subtitle="Training schedule and planning"
        />
        <div className="flex items-center justify-center min-h-96">
          <ErrorState
            title="Failed to load calendar"
            message="We couldn't load your training calendar. Please check your connection and try again."
            error={activeData.errors.sessions || activeData.errors.plan}
            onRetry={handleManualRefresh}
            showGoBack={false}
            showHome={false}
            className="min-h-0"
          />
        </div>
      </>
    )
  }

  // Note: Removed empty state handling - always render calendar grid
  // Empty sessions (no data) should show empty calendar, not error message
  // Only actual API errors should show error state above

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
            // Pass live session data for calendar rendering
            sessionsData={activeData.sessions.data || []}
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
                // Pass live session data for week rendering
                sessionsData={activeData.sessions.data || []}
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