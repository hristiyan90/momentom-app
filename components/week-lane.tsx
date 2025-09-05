"use client"
import { InlineDrawer } from "./inline-drawer"
import { IntensityBar } from "./training/intensity-bar"
import { useState } from "react"
import { Play, Edit, X, Waves, Bike, Footprints, Clock, Zap, Heart } from "lucide-react"

interface WeekSession {
  id: string
  sport: "swim" | "bike" | "run"
  title: string
  duration: string
  intensity: number
  time?: string
  completed?: boolean
  missed?: boolean
  compliance?: number
}

interface WeekDay {
  date: Date
  sessions: WeekSession[]
  totalLoad: number
}

interface WeekLaneProps {
  weekStart: Date
  onSessionClick?: (session: WeekSession) => void
  adaptations?: { [key: string]: boolean } // Date string -> has adaptation
}

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const generateWeekSessions = (date: Date): WeekSession[] => {
  const sessions: WeekSession[] = []
  const dayOfWeek = (date.getDay() + 6) % 7 // 0=Monday, 1=Tuesday, etc.
  const today = new Date()
  const isThisWeek = Math.abs(date.getTime() - today.getTime()) < 7 * 24 * 60 * 60 * 1000

  if (isThisWeek) {
    // This week's specific schedule (14 hours, 11 sessions)
    switch (dayOfWeek) {
      case 0: // Monday - Rest day
        break
      case 1: // Tuesday - Missed workout
        sessions.push({
          id: `tue-bike-missed`,
          sport: "bike",
          title: "Sweet Spot Intervals",
          duration: "1:15", // Fixed from 75:00 to realistic 1h 15min
          intensity: 3,
          time: "6:30 PM",
          completed: false,
          missed: true,
        })
        break
      case 2: // Wednesday - Lower compliance
        sessions.push(
          {
            id: `wed-swim`,
            sport: "swim",
            title: "Easy Recovery",
            duration: "0:45", // Fixed from 45:00 to 45min
            intensity: 1,
            time: "6:00 AM",
            completed: true,
            compliance: 98,
          },
          {
            id: `wed-bike`,
            sport: "bike",
            title: "Tempo Intervals",
            duration: "1:30", // Fixed from 90:00 to 1h 30min
            intensity: 4,
            time: "6:00 PM",
            completed: true,
            compliance: 72,
          },
        )
        break
      case 3: // Thursday - Today
        sessions.push(
          {
            id: `thu-swim`,
            sport: "swim",
            title: "Threshold 400s",
            duration: "1:15", // Fixed from 75:00 to 1h 15min
            intensity: 4,
            time: "6:00 AM",
            completed: false,
          },
          {
            id: `thu-bike`,
            sport: "bike",
            title: "FTP Test",
            duration: "1:30", // Fixed from 90:00 to 1h 30min
            intensity: 5,
            time: "6:30 PM",
            completed: false,
          },
        )
        break
      case 4: // Friday
        sessions.push({
          id: `fri-run`,
          sport: "run",
          title: "Recovery Run",
          duration: "0:40", // Fixed from 40:00 to 40min
          intensity: 1,
          time: "7:00 AM",
          completed: false,
        })
        break
      case 5: // Saturday
        sessions.push(
          {
            id: `sat-swim`,
            sport: "swim",
            title: "Open Water Prep",
            duration: "1:30", // Fixed from 90:00 to 1h 30min
            intensity: 3,
            time: "8:00 AM",
            completed: false,
          },
          {
            id: `sat-strength`,
            sport: "run", // Using run icon for strength
            title: "Core & Stability",
            duration: "0:45", // Fixed from 45:00 to 45min
            intensity: 2,
            time: "10:00 AM",
            completed: false,
          },
        )
        break
      case 6: // Sunday - Brick workout
        sessions.push(
          {
            id: `sun-brick`,
            sport: "bike",
            title: "Brick Workout",
            duration: "2:30", // Fixed from 150:00 to 2h 30min
            intensity: 4,
            time: "9:00 AM",
            completed: date < today,
          },
          {
            id: `sun-run`,
            sport: "run",
            title: "Transition Run",
            duration: "0:30", // Fixed from 30:00 to 30min
            intensity: 3,
            time: "11:30 AM",
            completed: date < today,
          },
          {
            id: `sun-strength`,
            sport: "run", // Using run icon for strength
            title: "Recovery Yoga",
            duration: "0:30", // Fixed from 30:00 to 30min
            intensity: 1,
            time: "1:00 PM",
            completed: date < today,
          },
        )
        break
    }
  } else {
    // Generate varied sessions for other weeks
    if (dayOfWeek === 0) return sessions // Monday rest

    const sessionTypes = [
      {
        sport: "swim" as const,
        titles: ["Technique Focus", "Endurance Set", "Sprint Work"],
        durations: ["1:00", "1:15", "0:45"], // Fixed unrealistic durations
      },
      {
        sport: "bike" as const,
        titles: ["Interval Training", "Endurance Ride", "Recovery Spin"],
        durations: ["1:30", "2:00", "1:00"], // Fixed unrealistic durations
      },
      {
        sport: "run" as const,
        titles: ["Tempo Run", "Long Run", "Track Work"],
        durations: ["0:45", "1:45", "1:00"], // Fixed unrealistic durations
      },
    ]

    const sessionCount = Math.random() < 0.3 ? 1 : Math.random() < 0.7 ? 2 : 3
    for (let i = 0; i < sessionCount; i++) {
      const type = sessionTypes[Math.floor(Math.random() * sessionTypes.length)]
      const titleIndex = Math.floor(Math.random() * type.titles.length)

      sessions.push({
        id: `${dayOfWeek}-${i}-${date.getTime()}`,
        sport: type.sport,
        title: type.titles[titleIndex],
        duration: type.durations[titleIndex],
        intensity: Math.floor(Math.random() * 5) + 1,
        time: i === 0 ? "6:00 AM" : "6:00 PM",
        completed: date < today,
      })
    }
  }

  return sessions
}

const formatDuration = (duration: string): string => {
  const [hours, minutes] = duration.split(":").map(Number)
  if (hours === 0) {
    return `${minutes}min`
  } else if (minutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${minutes}min`
  }
}

const getWorkoutType = (intensity: number): { label: string; color: string } => {
  if (intensity <= 2) return { label: "Recovery", color: "bg-emerald-600/50 text-emerald-100" }
  if (intensity === 3) return { label: "Endurance", color: "bg-blue-600/50 text-blue-100" }
  if (intensity === 4) return { label: "Tempo", color: "bg-yellow-600/50 text-yellow-100" }
  return { label: "VO2max", color: "bg-red-600/50 text-red-100" }
}

const getStatusBadge = (session: WeekSession) => {
  if (session.missed) {
    return { label: "Missed", color: "bg-red-600/50 text-red-100" }
  }
  if (session.completed) {
    if (session.compliance && session.compliance < 85) {
      return { label: "Completed", color: "bg-yellow-600/50 text-yellow-100" }
    }
    return { label: "Completed", color: "bg-emerald-600/50 text-emerald-100" }
  }
  return null
}

const getSessionCardColor = (session: WeekSession): string => {
  if (session.missed) return "border-red-500/30 bg-red-500/5"
  if (session.completed) {
    if (session.compliance && session.compliance < 85) {
      return "border-yellow-500/30 bg-yellow-500/5"
    }
    return "border-emerald-500/30 bg-emerald-500/5"
  }
  return "border-border-weak bg-bg-raised"
}

export function WeekLane({ weekStart, onSessionClick, adaptations = {} }: WeekLaneProps) {
  // Generate week days
  const weekDays: WeekDay[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)

    const sessions = generateWeekSessions(date)
    const totalLoad = sessions.reduce((acc, session) => {
      const minutes =
        Number.parseInt(session.duration.split(":")[0]) * 60 + Number.parseInt(session.duration.split(":")[1])
      return acc + (minutes / 60) * session.intensity
    }, 0)

    weekDays.push({
      date,
      sessions,
      totalLoad,
    })
  }

  const today = new Date()
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getTotalWeekLoad = () => {
    return weekDays.reduce((acc, day) => acc + day.totalLoad, 0)
  }

  const [swapDrawerOpen, setSwapDrawerOpen] = useState(false)
  const [selectedSessionForSwap, setSelectedSessionForSwap] = useState<WeekSession | null>(null)
  const [showAdaptationModal, setShowAdaptationModal] = useState(false)

  const handleSwapSession = (session: WeekSession) => {
    setSelectedSessionForSwap(session)
    setSwapDrawerOpen(true)
  }

  const handleViewSession = (session: WeekSession) => {
    // Navigate to training page with selected workout
    window.location.href = `/training?session=${session.id}`
  }

  const AdaptationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdaptationModal(false)} />
      <div className="relative bg-bg-surface border border-border-weak rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-1">Training Adaptation</h3>
            <button
              onClick={() => setShowAdaptationModal(false)}
              className="p-1 hover:bg-bg-raised rounded transition-colors"
            >
              <X className="w-4 h-4 text-text-2" />
            </button>
          </div>

          {/* Trigger chips */}
          <div className="mb-4">
            <span className="text-text-2 text-sm mb-2 block">Adaptation Triggers:</span>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full font-medium">Low readiness</span>
              <span className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full font-medium">Missed session</span>
            </div>
          </div>

          {/* Changes list */}
          <div className="mb-6">
            <span className="text-text-2 text-sm mb-2 block">Changes Made:</span>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-bg-raised rounded">
                <span className="text-text-1 text-sm">Reduced interval count</span>
                <span className="text-sm font-medium text-red-400">6×→5×</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-bg-raised rounded">
                <span className="text-text-1 text-sm">Lowered intensity zone</span>
                <span className="text-sm font-medium text-red-400">Z4→Z3</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log("Telemetry:", {
                  decision: "accept",
                  triggers: ["Low readiness", "Missed session"],
                  timestamp: new Date().toISOString(),
                })
                setShowAdaptationModal(false)
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Accept
            </button>
            <button
              onClick={() => {
                console.log("Telemetry:", {
                  decision: "modify",
                  triggers: ["Low readiness", "Missed session"],
                  timestamp: new Date().toISOString(),
                })
                setShowAdaptationModal(false)
              }}
              className="flex-1 px-4 py-2 bg-bg-raised border border-border-weak rounded-lg hover:bg-bg-surface transition-colors text-text-1 font-medium"
            >
              Modify Further
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {weekDays.map((day, index) => {
        const dateKey = day.date.toISOString().split("T")[0]
        const hasAdaptation = adaptations[dateKey]

        return (
          <div
            key={index}
            className={`border border-border-weak rounded-lg p-4 bg-bg-raised ${isToday(day.date) ? "ring-1 ring-swim" : ""}`}
          >
            {hasAdaptation && (
              <div
                className="mb-3 p-2 bg-amber-950/30 border border-amber-500/30 rounded cursor-pointer hover:bg-amber-950/50 transition-colors"
                onClick={() => setShowAdaptationModal(true)}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-amber-200 text-xs font-medium">Adaptation applied</span>
                  <span className="text-amber-400 text-xs ml-auto">Click to view →</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className={`font-medium ${isToday(day.date) ? "text-swim" : "text-text-1"}`}>
                  {dayNames[(day.date.getDay() + 6) % 7]}
                </h4>
                <span className="text-text-dim text-sm">{formatDate(day.date)}</span>
              </div>

              {day.totalLoad > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-text-dim text-sm">Load:</span>
                  <span className="text-text-1 text-sm font-medium tabular-nums">{day.totalLoad.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Sessions */}
            {day.sessions.length === 0 ? (
              <div className="text-text-dim text-sm py-2">Rest day</div>
            ) : (
              <div className="space-y-2">
                {day.sessions.map((session) => {
                  const statusBadge = getStatusBadge(session)
                  const workoutType = getWorkoutType(session.intensity)
                  const tssValue = Math.round(session.intensity * 50)

                  return (
                    <InlineDrawer
                      key={session.id}
                      trigger={
                        <div
                          className={`w-full border rounded-lg bg-bg-surface transition-colors hover:bg-bg-raised cursor-pointer ${getSessionCardColor(session)}`}
                        >
                          <div className="flex">
                            <div
                              className={`w-1 rounded-l-lg ${
                                session.sport === "swim" ? "bg-swim" : session.sport === "bike" ? "bg-bike" : "bg-run"
                              }`}
                            />

                            <div className="flex items-center justify-between w-full p-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Sport icon */}
                                <div className="flex-shrink-0">
                                  {session.sport === "swim" && <Waves className="w-4 h-4 text-swim" />}
                                  {session.sport === "bike" && <Bike className="w-4 h-4 text-bike" />}
                                  {session.sport === "run" && <Footprints className="w-4 h-4 text-run" />}
                                </div>

                                {/* Session title */}
                                <h4 className="font-medium text-text-1 flex-shrink-0 min-w-0 truncate">
                                  {session.title}
                                </h4>

                                {/* Duration */}
                                <span className="text-text-2 text-sm flex-shrink-0">
                                  {formatDuration(session.duration)}
                                </span>

                                {/* Workout type badge */}
                                <span
                                  className={`px-2 py-0.5 text-xs rounded font-medium flex-shrink-0 ${workoutType.color}`}
                                >
                                  {workoutType.label}
                                </span>

                                {/* TSS badge */}
                                <span className="px-2 py-0.5 bg-black text-white text-xs rounded font-medium flex-shrink-0">
                                  {tssValue}
                                </span>
                              </div>

                              {/* Status badge */}
                              {statusBadge && (
                                <span
                                  className={`px-2 py-1 text-xs rounded font-medium flex-shrink-0 ml-2 ${statusBadge.color}`}
                                >
                                  {statusBadge.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <div className="bg-bg-surface rounded-lg border border-border-weak shadow-sm">
                        <div className="p-6 space-y-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold text-text-1">{session.title}</h3>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-text-2 text-sm">{formatDuration(session.duration)}</span>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-red-500/30 text-red-200 text-xs rounded font-medium">
                                    {tssValue} TSS
                                  </span>
                                </div>
                              </div>
                            </div>

                            {session.completed && (
                              <>
                                <div className="border-t border-border-weak/50 pt-4">
                                  <div className="bg-bg-raised rounded-lg p-4 border border-border-weak/50">
                                    <div className="grid grid-cols-4 gap-6">
                                      {/* Planned Time Column */}
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-3 h-3 text-text-dim" />
                                          <h4 className="text-text-1 font-medium text-sm">Planned Time</h4>
                                        </div>
                                        <div className="space-y-2">
                                          <div>
                                            <div className="text-lg font-semibold text-text-1">
                                              {formatDuration(session.duration)}
                                            </div>
                                            <div className="text-xs text-text-2">Planned</div>
                                          </div>
                                          <div>
                                            <div className="text-lg font-semibold text-text-1">
                                              {session.compliance && session.compliance > 90
                                                ? formatDuration(
                                                    `${Math.floor(Number.parseInt(session.duration.split(":")[0]) * 1.1)}:${Math.floor(Number.parseInt(session.duration.split(":")[1]) * 1.1)}`,
                                                  )
                                                : formatDuration(
                                                    `${Math.floor(Number.parseInt(session.duration.split(":")[0]) * 0.9)}:${Math.floor(Number.parseInt(session.duration.split(":")[1]) * 0.9)}`,
                                                  )}
                                            </div>
                                            <div className="text-xs text-text-2">Completed</div>
                                          </div>
                                          <div className="space-y-1">
                                            <div
                                              className={`text-xs font-medium ${session.compliance && session.compliance > 90 ? "text-emerald-400" : "text-red-400"}`}
                                            >
                                              {session.compliance || 95}%
                                            </div>
                                            <div className="w-full bg-bg-app rounded-full h-2">
                                              <div
                                                className={`h-2 rounded-full ${session.compliance && session.compliance > 90 ? "bg-emerald-500" : "bg-red-500"}`}
                                                style={{ width: `${Math.min(session.compliance || 95, 100)}%` }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Power/Pace Metrics Column */}
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <Zap className="w-3 h-3 text-text-dim" />
                                          <h4 className="text-text-1 font-medium text-sm">
                                            {session.sport === "swim"
                                              ? "Pace Metrics"
                                              : session.sport === "bike"
                                                ? "Power Metrics"
                                                : "Pace Metrics"}
                                          </h4>
                                        </div>
                                        <div className="space-y-2">
                                          <div>
                                            <div className="text-lg font-semibold text-text-1">
                                              {session.sport === "swim"
                                                ? "1:45/100m"
                                                : session.sport === "bike"
                                                  ? "280W"
                                                  : "4:30/km"}
                                            </div>
                                            <div className="text-xs text-text-2">Target</div>
                                          </div>
                                          <div>
                                            <div className="text-lg font-semibold text-text-1">
                                              {session.sport === "swim"
                                                ? "1:42/100m"
                                                : session.sport === "bike"
                                                  ? "245W"
                                                  : "4:25/km"}
                                            </div>
                                            <div className="text-xs text-text-2">Average</div>
                                          </div>
                                          <div className="space-y-1">
                                            <div className="text-xs font-medium text-amber-400">
                                              {session.sport === "bike" ? "87%" : "103%"}
                                            </div>
                                            <div className="w-full bg-bg-app rounded-full h-2">
                                              <div
                                                className={`h-2 rounded-full ${session.sport === "bike" ? "bg-amber-500" : "bg-emerald-500"}`}
                                                style={{ width: `${session.sport === "bike" ? "87%" : "100%"}` }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Load Metrics Column */}
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <Zap className="text-text-dim w-[12x] h-3" />
                                          <h4 className="text-text-1 font-medium text-sm">Load Metrics</h4>
                                        </div>
                                        <div className="space-y-2">
                                          <div>
                                            <div className="text-lg font-semibold text-text-1">{tssValue}</div>
                                            <div className="text-xs text-text-2">Planned TSS</div>
                                          </div>
                                          <div>
                                            <div className="text-lg font-semibold text-text-1">
                                              {session.compliance && session.compliance > 90
                                                ? Math.round(tssValue * 1.15)
                                                : Math.round(tssValue * 0.85)}
                                            </div>
                                            <div className="text-xs text-text-2">Actual TSS</div>
                                          </div>
                                          <div className="space-y-1">
                                            <div
                                              className={`text-xs font-medium ${
                                                session.compliance && session.compliance > 90
                                                  ? "text-emerald-400"
                                                  : session.compliance && session.compliance < 85
                                                    ? "text-red-400"
                                                    : "text-amber-400"
                                              }`}
                                            >
                                              {session.compliance && session.compliance > 90
                                                ? "115%"
                                                : session.compliance && session.compliance < 85
                                                  ? "85%"
                                                  : "95%"}
                                            </div>
                                            <div className="w-full bg-bg-app rounded-full h-2">
                                              <div
                                                className={`h-2 rounded-full ${
                                                  session.compliance && session.compliance > 90
                                                    ? "bg-emerald-500"
                                                    : session.compliance && session.compliance < 85
                                                      ? "bg-red-500"
                                                      : "bg-amber-500"
                                                }`}
                                                style={{
                                                  width: `${
                                                    session.compliance && session.compliance > 90
                                                      ? "100%"
                                                      : session.compliance && session.compliance < 85
                                                        ? "85%"
                                                        : "95%"
                                                  }`,
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Performance Column */}
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <Heart className="w-3 h-3 text-text-dim" />
                                          <h4 className="text-text-1 font-medium text-sm">Other</h4>
                                        </div>
                                        <div className="space-y-2">
                                          <div>
                                            <div className="text-lg font-semibold text-text-1">
                                              {session.intensity >= 4
                                                ? "165 bpm"
                                                : session.intensity >= 3
                                                  ? "142 bpm"
                                                  : "125 bpm"}
                                            </div>
                                            <div className="text-xs text-text-2">Avg HR</div>
                                          </div>
                                          <div>
                                            <div className="text-lg font-semibold text-text-1">
                                              {session.sport === "swim"
                                                ? "32 spm"
                                                : session.sport === "bike"
                                                  ? "87 rpm"
                                                  : "180 spm"}
                                            </div>
                                            <div className="text-xs text-text-2">
                                              {session.sport === "swim" ? "Stroke Rate" : "Cadence"}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-lg font-semibold text-text-1">
                                              {session.sport === "swim"
                                                ? "3.2km"
                                                : session.sport === "bike"
                                                  ? "42.5km"
                                                  : "12.5km"}
                                            </div>
                                            <div className="text-xs text-text-2">Distance</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="border-t border-border-weak/50 pt-4">
                              <IntensityBar
                                segments={[
                                  { label: "WU 10′ Z1", zone: "Z1" as const, minutes: 10 },
                                  {
                                    label: `MS ${Math.round(Number.parseInt(session.duration) * 0.6)}′ Z${session.intensity}`,
                                    zone: `Z${session.intensity}` as const,
                                    minutes: Math.round(Number.parseInt(session.duration) * 0.6),
                                  },
                                  { label: "CD 10′ Z1", zone: "Z1" as const, minutes: 10 },
                                ]}
                                isCompleted={session.completed || false}
                              />
                            </div>

                            {!session.completed && session.intensity >= 3 && (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-orange-600 text-white border border-orange-700 text-xs rounded font-medium">
                                    60-90g carbs/h
                                  </span>
                                  <span className="px-2 py-1 bg-blue-600 text-white border border-blue-700 text-xs rounded font-medium">
                                    500-800ml/h
                                  </span>
                                  <span className="px-2 py-1 bg-purple-600 text-white border border-purple-700 text-xs rounded font-medium">
                                    300-700mg sodium/h
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {!session.completed && (
                            <>
                              <div className="border-t border-border-weak/50 pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-bg-surface rounded-lg border border-border-weak">
                                    <h4 className="text-text-1 font-medium text-sm mb-3">Workout Breakdown</h4>
                                    <div className="space-y-2 text-xs text-text-2">
                                      <div className="flex justify-between">
                                        <span>Warm up</span>
                                        <span>10 min @ Z1-Z2</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Main Set</span>
                                        <span>
                                          {Math.round(Number.parseInt(session.duration) * 0.6)} min @ Z
                                          {session.intensity}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Cool Down</span>
                                        <span>10 min @ Z1</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-4 bg-bg-surface rounded-lg border border-border-weak">
                                    <h4 className="text-text-1 font-medium text-sm mb-3">Why this today?</h4>
                                    <div className="space-y-3">
                                      <p className="text-text-2 text-sm">
                                        This{" "}
                                        {session.intensity >= 4
                                          ? "high-intensity"
                                          : session.intensity >= 3
                                            ? "moderate"
                                            : "recovery"}{" "}
                                        session builds{" "}
                                        {session.sport === "swim"
                                          ? "swimming endurance"
                                          : session.sport === "bike"
                                            ? "cycling power"
                                            : "running fitness"}
                                        while maintaining your current training progression.
                                      </p>
                                      <button className="text-brand text-sm hover:text-brand/80 transition-colors font-medium">
                                        Ask Coach Tom →
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="border-t border-border-weak/50 pt-6">
                            <div className="flex gap-3">
                              {!session.completed ? (
                                <>
                                  <button
                                    onClick={() => handleViewSession(session)}
                                    className="flex items-center gap-2 px-6 py-2 bg-swim text-bg-app rounded-lg hover:bg-swim/90 transition-colors font-medium"
                                  >
                                    <Play className="w-4 h-4" />
                                    View Session
                                  </button>
                                  <button
                                    onClick={() => handleSwapSession(session)}
                                    className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-weak rounded-lg hover:bg-bg-raised transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Swap Session
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleViewSession(session)}
                                  className="px-6 py-2 bg-success/20 text-success rounded-lg font-medium"
                                >
                                  View Completed Session
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </InlineDrawer>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {showAdaptationModal && <AdaptationModal />}
    </div>
  )
}
