"use client"
import { InlineDrawer } from "./inline-drawer"
import { IntensityBar } from "./training/intensity-bar"
import { useState, useEffect, useRef } from "react"
import { Play, Edit, X, ChevronLeft, Waves, Bike, Footprints, Clock, Zap, Heart } from "lucide-react"

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
  sessionsData?: Record<string, SessionData[]> // ADD THIS LINE
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

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Helper function to convert API sessions to WeekSession format
const convertApiSessionToWeekSession = (session: SessionData): WeekSession => {
  const duration = session.planned_duration_min || session.actual_duration_min || 60
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  const durationStr = `${hours}:${minutes.toString().padStart(2, '0')}`
  
  return {
    id: session.session_id,
    sport: session.sport as "swim" | "bike" | "run",
    title: session.title,
    duration: durationStr,
    intensity: session.planned_zone_primary ? parseInt(session.planned_zone_primary.replace('z', '')) : 3,
    time: "6:00 AM", // Default time since we don't have this in the API
    completed: session.status === 'completed',
    compliance: session.planned_load || 100
  }
}

// Unused function - removed to fix linting
// const generateWeekSessions = (date: Date): WeekSession[] => {
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

const getIntensityDots = (intensity: number) => {
  const intensityLevels = {
    1: 1, // recovery
    2: 1, // endurance  
    3: 2, // tempo
    4: 3, // threshold
    5: 3, // vo2
  }
  return intensityLevels[intensity as keyof typeof intensityLevels] || 1
}

const getWorkoutType = (intensity: number): { label: string; color: string } => {
  if (intensity <= 2) return { label: "Recovery", color: "badge badge-good" }
  if (intensity === 3) return { label: "Endurance", color: "badge badge-info" }
  if (intensity === 4) return { label: "Tempo", color: "badge badge-ok" }
  return { label: "VO2max", color: "badge badge-critical" }
}

const getStatusBadge = (session: WeekSession) => {
  if (session.missed) {
    return { label: "Missed", color: "badge badge-critical" }
  }
  if (session.completed) {
    if (session.compliance && session.compliance < 85) {
      return { label: "Completed", color: "badge badge-ok" }
    }
    return { label: "Completed", color: "badge badge-good" }
  }
  return null
}

const getSessionCardColor = (session: WeekSession): string => {
  if (session.missed) return "border-status-danger/30 bg-status-danger/5"
  if (session.completed) {
    if (session.compliance && session.compliance < 85) {
      return "border-status-caution/30 bg-status-caution/5"
    }
    return "border-status-success/30 bg-status-success/5"
  }
  return "border-border-weak bg-bg-raised"
}

export function WeekLane({ weekStart, onSessionClick, adaptations = {}, sessionsData = {} }: WeekLaneProps) {
  // Generate week days
  const weekDays: WeekDay[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)

    const dateStr = date.toISOString().split('T')[0]
    const daySessions = sessionsData[dateStr] || []
    const sessions = daySessions.map(convertApiSessionToWeekSession)
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

  const [swapDrawerOpen, setSwapDrawerOpen] = useState(false)
  const [selectedSessionForSwap, setSelectedSessionForSwap] = useState<WeekSession | null>(null)
  const [showAdaptationModal, setShowAdaptationModal] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Handle keyboard navigation and focus management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSwapDrawerOpen(false)
        setSelectedSessionForSwap(null)
      }
    }

    if (swapDrawerOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [swapDrawerOpen])

  const handleSwapSession = (session: WeekSession) => {
    setSelectedSessionForSwap(session)
    setSwapDrawerOpen(true)
  }

  const handleViewSession = (session: WeekSession) => {
    // Navigate to training page with selected workout
    window.location.href = `/training?session=${session.id}`
  }

  const SwapSessionDrawer = () => {
    if (!selectedSessionForSwap) return null

    const drawerRef = useRef<HTMLDivElement>(null)

    // Handle keyboard navigation and focus management
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSwapDrawerOpen(false)
          setSelectedSessionForSwap(null)
        }
      }

      // Focus the drawer when it opens
      if (drawerRef.current) {
        drawerRef.current.focus()
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const swapOptions = [
      {
        id: "rest",
        title: "Rest Day",
        description: "Take a complete rest day",
        icon: "😴",
        duration: "0:00",
        intensity: 0,
        sport: "rest" as const,
      },
      {
        id: "recovery-swim",
        title: "Easy Recovery Swim",
        description: "Low intensity technique work",
        icon: "🏊",
        duration: "0:45",
        intensity: 1,
        sport: "swim" as const,
      },
      {
        id: "recovery-bike",
        title: "Easy Recovery Ride",
        description: "Light spinning to promote recovery",
        icon: "🚴",
        duration: "1:00",
        intensity: 1,
        sport: "bike" as const,
      },
      {
        id: "recovery-run",
        title: "Easy Recovery Run",
        description: "Gentle jog to maintain fitness",
        icon: "🏃",
        duration: "0:30",
        intensity: 1,
        sport: "run" as const,
      },
      {
        id: "endurance-swim",
        title: "Endurance Swim",
        description: "Steady aerobic swimming",
        icon: "🏊",
        duration: "1:15",
        intensity: 2,
        sport: "swim" as const,
      },
      {
        id: "endurance-bike",
        title: "Endurance Ride",
        description: "Steady aerobic cycling",
        icon: "🚴",
        duration: "1:30",
        intensity: 2,
        sport: "bike" as const,
      },
      {
        id: "endurance-run",
        title: "Endurance Run",
        description: "Steady aerobic running",
        icon: "🏃",
        duration: "1:00",
        intensity: 2,
        sport: "run" as const,
      },
      {
        id: "tempo-swim",
        title: "Tempo Swim",
        description: "Moderate intensity intervals",
        icon: "🏊",
        duration: "1:00",
        intensity: 3,
        sport: "swim" as const,
      },
      {
        id: "tempo-bike",
        title: "Tempo Ride",
        description: "Moderate intensity intervals",
        icon: "🚴",
        duration: "1:15",
        intensity: 3,
        sport: "bike" as const,
      },
      {
        id: "tempo-run",
        title: "Tempo Run",
        description: "Moderate intensity intervals",
        icon: "🏃",
        duration: "0:45",
        intensity: 3,
        sport: "run" as const,
      },
    ]

    const handleSwapConfirm = (option: typeof swapOptions[0]) => {
      console.log("Session swapped:", {
        from: selectedSessionForSwap,
        to: option,
        timestamp: new Date().toISOString(),
      })
      setSwapDrawerOpen(false)
      setSelectedSessionForSwap(null)
    }

    return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSwapDrawerOpen(false)}
        />
        
        {/* Side Drawer */}
        <div 
          ref={drawerRef}
          className="fixed inset-y-0 right-0 w-96 bg-bg-surface border-l border-border-weak shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-out focus:outline-none animate-in slide-in-from-right"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="sticky top-0 bg-bg-surface border-b border-border-weak p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSwapDrawerOpen(false)}
                  className="p-1 hover:bg-bg-raised rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-text-2" />
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-text-1">Swap Session</h3>
                  <p className="text-sm text-text-2 mt-1">
                    Replace "{selectedSessionForSwap.title}" with an alternative
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSwapDrawerOpen(false)}
                className="p-2 hover:bg-bg-raised rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-2" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Current session info */}
              <div className="p-4 bg-bg-raised rounded-lg border border-border-weak">
                <div className="text-sm text-text-2 mb-2">Replacing current session:</div>
                <div className="flex items-center gap-3">
                  {selectedSessionForSwap.sport === "swim" && <Waves className="w-5 h-5 text-sport-swim" />}
                  {selectedSessionForSwap.sport === "bike" && <Bike className="w-5 h-5 text-sport-bike" />}
                  {selectedSessionForSwap.sport === "run" && <Footprints className="w-5 h-5 text-sport-run" />}
                  <div>
                    <div className="font-medium text-text-1">{selectedSessionForSwap.title}</div>
                    <div className="text-sm text-text-2">{formatDuration(selectedSessionForSwap.duration)}</div>
                  </div>
                </div>
              </div>

              {/* Loading state */}
              <div className="p-4 bg-bg-raised rounded-lg border border-border-weak">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent"></div>
                  <span className="text-sm text-text-2">Loading alternative workouts...</span>
                </div>
              </div>

              {/* Swap options */}
              <div className="space-y-4">
                <h4 className="text-text-1 font-medium">Alternative workouts for {selectedSessionForSwap.title}</h4>
                <div className="space-y-3">
                  {swapOptions.map((option) => {
                    const workoutType = getWorkoutType(option.intensity)
                    const isRest = option.sport === "rest"
                    const Icon = isRest ? Heart : (
                      option.sport === "swim" ? Waves :
                      option.sport === "bike" ? Bike : Footprints
                    )
                    const disciplineName = isRest ? "Rest" : (
                      option.sport === "swim" ? "Swim" :
                      option.sport === "bike" ? "Bike" : "Run"
                    )
                    const intensityDots = isRest ? 0 : getIntensityDots(option.intensity)
                    const formattedDuration = formatDuration(option.duration)
                    
                    return (
                      <div
                        key={option.id}
                        className="p-4 bg-bg-raised rounded-lg border border-border-weak hover:border-brand/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${isRest ? "text-gray-400" : `text-sport-${option.sport}`}`} />
                            <div>
                              <h5 className="font-medium text-text-1">{option.title}</h5>
                              <div className="text-sm text-text-2">{formattedDuration}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, dotIndex) => (
                              <div
                                key={dotIndex}
                                className={`w-2 h-2 rounded-full ${
                                  dotIndex < intensityDots 
                                    ? `bg-sport-${option.sport}` 
                                    : "bg-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-text-2 mb-4">{option.description}</p>
                        <button
                          onClick={() => handleSwapConfirm(option)}
                          className="w-full btn btn-primary-outline"
                        >
                          Select This Workout
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Additional options */}
              <div className="pt-4 border-t border-border-weak">
                <div className="space-y-3">
                  <h4 className="text-text-1 font-medium">Other Options</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-bg-raised rounded-lg border border-border-weak hover:border-brand/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs">⚙</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-text-1">Custom Session</h5>
                          <div className="text-sm text-text-2">Create a custom workout</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          console.log("Custom session requested")
                          setSwapDrawerOpen(false)
                        }}
                        className="w-full btn btn-primary-outline"
                      >
                        Create Custom Workout
                      </button>
                    </div>
                    
                    <div className="p-4 bg-bg-raised rounded-lg border border-border-weak hover:border-brand/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs">📅</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-text-1">Move Session</h5>
                          <div className="text-sm text-text-2">Reschedule to another day</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          console.log("Move session requested")
                          setSwapDrawerOpen(false)
                        }}
                        className="w-full btn btn-primary-outline"
                      >
                        Move to Another Day
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const AdaptationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowAdaptationModal(false)} />
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
                                session.sport === "swim" ? "bg-sport-swim" : session.sport === "bike" ? "bg-sport-bike" : "bg-sport-run"
                              }`}
                            />

                            <div className="flex items-center justify-between w-full p-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Sport icon */}
                                <div className="flex-shrink-0">
                                  {session.sport === "swim" && <Waves className="w-4 h-4 text-sport-swim" />}
                                  {session.sport === "bike" && <Bike className="w-4 h-4 text-sport-bike" />}
                                  {session.sport === "run" && <Footprints className="w-4 h-4 text-sport-run" />}
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
                                    zone: `Z${session.intensity}` as "Z1" | "Z2" | "Z3" | "Z4" | "Z5",
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
                                    className="btn btn-primary flex items-center gap-2"
                                  >
                                    <Play className="w-4 h-4" />
                                    View Session
                                  </button>
                                  <button
                                    onClick={() => handleSwapSession(session)}
                                    className="btn flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Swap Session
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleViewSession(session)}
                                  className="btn btn-primary"
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
      {swapDrawerOpen && <SwapSessionDrawer />}
    </div>
  )
}

