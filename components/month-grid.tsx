"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarSession {
  id: string
  sport: "swim" | "bike" | "run"
  title: string
  duration: string
  intensity: number
  completed?: boolean
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  sessions: CalendarSession[]
  totalLoad?: number
}

interface MonthGridProps {
  year: number
  month: number
  onDateSelect?: (date: Date) => void
  onMonthChange?: (year: number, month: number) => void
}

const sportColors = {
  swim: "bg-swim",
  bike: "bg-bike",
  run: "bg-run",
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Mock data generator
const generateMockSessions = (date: Date): CalendarSession[] => {
  const sessions: CalendarSession[] = []
  const dayOfWeek = date.getDay()
  const dateNum = date.getDate()

  // Add some variety based on day patterns
  if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
    // Mon, Wed, Fri
    if (dateNum % 3 === 0) {
      sessions.push({
        id: `swim-${dateNum}`,
        sport: "swim",
        title: "Pool Session",
        duration: "60:00",
        intensity: 3,
        completed: date < new Date(),
      })
    }
    if (dateNum % 4 === 0) {
      sessions.push({
        id: `bike-${dateNum}`,
        sport: "bike",
        title: "Bike Training",
        duration: "90:00",
        intensity: 4,
        completed: date < new Date(),
      })
    }
  }

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend
    if (dateNum % 2 === 0) {
      sessions.push({
        id: `run-${dateNum}`,
        sport: "run",
        title: "Long Run",
        duration: "120:00",
        intensity: 2,
        completed: date < new Date(),
      })
    }
  }

  return sessions
}

export function MonthGrid({ year, month, onDateSelect, onMonthChange }: MonthGridProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Generate calendar days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7))

  const days: CalendarDay[] = []
  const currentDate = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    // 6 weeks * 7 days
    const sessions = generateMockSessions(currentDate)
    const totalLoad = sessions.reduce((acc, session) => {
      const minutes =
        Number.parseInt(session.duration.split(":")[0]) * 60 + Number.parseInt(session.duration.split(":")[1])
      return acc + (minutes / 60) * session.intensity
    }, 0)

    days.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      sessions,
      totalLoad,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date)
    onDateSelect?.(day.date)
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

  const today = new Date()
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-1">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-bg-raised rounded-lg transition-colors duration-150"
          >
            <ChevronLeft className="w-4 h-4 text-text-2" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-bg-raised rounded-lg transition-colors duration-150"
          >
            <ChevronRight className="w-4 h-4 text-text-2" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center text-text-dim text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={`
              p-2 min-h-20 border border-border-weak rounded-lg hover:bg-bg-raised transition-colors duration-150 text-left
              ${!day.isCurrentMonth ? "opacity-40" : ""}
              ${isToday(day.date) ? "ring-1 ring-swim" : ""}
              ${selectedDate?.toDateString() === day.date.toDateString() ? "bg-bg-raised" : ""}
            `}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-medium ${isToday(day.date) ? "text-swim" : "text-text-1"}`}>
                {day.date.getDate()}
              </span>
              {day.totalLoad && day.totalLoad > 0 && <div className="w-2 h-2 bg-swim rounded-full" />}
            </div>

            {/* Session indicators */}
            <div className="space-y-1">
              {day.sessions.slice(0, 2).map((session) => (
                <div
                  key={session.id}
                  className={`w-full h-1 ${sportColors[session.sport]} rounded-full ${
                    session.completed ? "opacity-60" : ""
                  }`}
                />
              ))}
              {day.sessions.length > 2 && <div className="text-xs text-text-dim">+{day.sessions.length - 2}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
