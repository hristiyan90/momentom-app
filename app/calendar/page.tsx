"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { MonthGrid } from "@/components/calendar/MonthGrid"
import { WeekLane } from "@/components/week-lane"
import { WeekSummary } from "@/components/calendar/WeekSummary"
import { QuickAddModal } from "@/components/calendar/QuickAddModal"
import { CalendarSidebar } from "@/components/calendar/CalendarSidebar"
import { LifeBlockerSidebar } from "@/components/calendar/LifeBlockerSidebar"
import { RaceDetailsSidebar } from "@/components/calendar/RaceDetailsSidebar"
import type { DayAggregate } from "@/components/calendar/MonthCell"
import { apiClient } from "@/lib/api/client"

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

  // NEW: State for real sessions data
  const [sessionsData, setSessionsData] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(false)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // NEW: Function to fetch sessions for a month
  const fetchSessionsForMonth = async (year: number, month: number) => {
    setLoading(true)
    try {
      // Set athlete ID for dev mode
      apiClient.setAthleteId('00000000-0000-0000-0000-000000000001')
      
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
      
      const response = await apiClient.getSessions({
        start: startDate,
        end: endDate,
        limit: 1000 // Get all sessions for the month
      })
      
      if (response.data?.items) {
        // Group sessions by date
        const groupedSessions: Record<string, any[]> = {}
        response.data.items.forEach(session => {
          if (!groupedSessions[session.date]) {
            groupedSessions[session.date] = []
          }
          groupedSessions[session.date].push(session)
        })
        setSessionsData(groupedSessions)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  // NEW: Fetch data when month changes
  useEffect(() => {
    fetchSessionsForMonth(currentYear, currentMonth)
  }, [currentYear, currentMonth])

  const getWeekStart = (date: Date) => {
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - ((date.getDay() + 6) % 7))
    return weekStart
  }

  const handleMonthChange = (year: number, month: number) => {
    setCurrentDate(new Date(year, month, 1))
  }

  // UPDATED: Use real data instead of mock data
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const dateStr = date.toISOString().split('T')[0]
    const daySessions = sessionsData[dateStr] || []
    
    if (daySessions.length > 0) {
      // Convert API sessions to DayAggregate format
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
      
      const dayData: DayAggregate = {
        dateISO: dateStr,
        bySportMinutes,
        sessions
      }
      
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
            sessionsData={sessionsData}
            loading={loading}
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
                sessionsData={sessionsData}
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