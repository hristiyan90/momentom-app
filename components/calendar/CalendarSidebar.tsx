"use client"

import { X, ExternalLink, Play, Edit, Send, ChevronDown, ChevronRight, Clock, Zap, Heart } from "lucide-react"
import { Waves, Bike, Footprints } from "lucide-react"
import type { DayAggregate } from "./MonthCell"
import { IntensityBar } from "@/components/training/intensity-bar"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface CalendarSidebarProps {
  date: Date | null
  dayData: DayAggregate | null
  onClose: () => void
}

const sportIcons = {
  swim: Waves,
  bike: Bike,
  run: Footprints,
}

const sportColors = {
  swim: "chip chip-sport-swim",
  bike: "chip chip-sport-bike",
  run: "chip chip-sport-run",
  strength: "chip text-gray-400 border-gray-400 bg-gray-400/10",
}

const intensityColors = {
  recovery: "badge badge-good",
  endurance: "badge badge-info",
  tempo: "badge badge-ok",
  threshold: "badge badge-low",
  vo2: "badge badge-critical",
}

export function CalendarSidebar({ date, dayData, onClose }: CalendarSidebarProps) {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  if (!date || !dayData) return null

  const toggleSessionExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions)
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId)
    } else {
      newExpanded.add(sessionId)
    }
    setExpandedSessions(newExpanded)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const totalMinutes = Object.values(dayData.bySportMinutes).reduce((sum, minutes) => sum + (minutes || 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-bg-surface border-l border-border-weak shadow-xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-bg-surface border-b border-border-weak p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-1">{formatDate(date)}</h2>
            <p className="text-sm text-text-2 mt-1">
              {dayData.sessions.length} session{dayData.sessions.length !== 1 ? "s" : ""} • {totalHours}h{" "}
              {remainingMinutes}m
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-raised rounded-lg transition-colors">
            <X className="w-4 h-4 text-text-2" />
          </button>
        </div>
      </div>

      {/* Sessions */}
      <div className="p-6 space-y-4">
        {dayData.sessions.map((session, index) => {
          const SportIcon = sportIcons[session.sport]
          const hours = Math.floor(session.minutes / 60)
          const mins = session.minutes % 60
          const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
          const isExpanded = expandedSessions.has(session.id)

          const mockIntensitySegments = [
            { label: "Zone 1", zone: "Z1" as const, minutes: Math.floor(session.minutes * 0.2) },
            { label: "Zone 2", zone: "Z2" as const, minutes: Math.floor(session.minutes * 0.3) },
            { label: "Zone 3", zone: "Z3" as const, minutes: Math.floor(session.minutes * 0.25) },
            { label: "Zone 4", zone: "Z4" as const, minutes: Math.floor(session.minutes * 0.15) },
            { label: "Zone 5", zone: "Z5" as const, minutes: Math.floor(session.minutes * 0.1) },
          ]

          const isCompleted = session.compliance !== undefined
          const isMissed = session.compliance === 0

          return (
            <div key={session.id} className="bg-bg-raised border border-border-weak rounded-lg overflow-hidden">
              {/* Session Header */}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg border ${sportColors[session.sport]}`}>
                    <SportIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-1">{session.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-text-2">{duration}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${intensityColors[session.intensity]}`}>
                        {session.intensity}
                      </span>
                      {session.load && (
                        <span className="badge badge-critical">
                          {session.load}
                        </span>
                      )}
                      {isCompleted && (
                        <span
                          className={`badge ${
                            isMissed
                              ? "badge-critical"
                              : session.compliance >= 85
                                ? "badge-good"
                                : "badge-ok"
                          }`}
                        >
                          {isMissed ? "Missed" : session.compliance >= 85 ? "Completed" : "Partial"}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSessionExpansion(session.id)}
                    className="p-1 hover:bg-bg-surface rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-text-3" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-3" />
                    )}
                  </button>
                </div>

                {!isCompleted && (
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={cn("w-1.5 h-1.5 rounded-full", sportColors[session.sport].replace("border-", "bg-"))}
                    />
                    <span className="text-xs text-text-2">60–90g carbs/h • 0.5L fluid/h • 300mg sodium/h</span>
                  </div>
                )}

                <div className="mb-4">
                  <IntensityBar segments={mockIntensitySegments} />
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border-weak/50 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  {isCompleted ? (
                    <div className="space-y-4">
                      {/* Four-column metrics layout for completed workouts */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Planned Time */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-text-2" />
                            <h5 className="text-text-1 font-medium text-xs">Planned Time</h5>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs">
                              <div className="font-semibold text-text-1">{duration}</div>
                              <div className="text-text-3">Planned</div>
                            </div>
                            <div className="text-xs">
                              <div className="font-semibold text-text-1">
                                {hours > 0 ? `${hours}h ${mins + 5}m` : `${mins + 5}m`}
                              </div>
                              <div className="text-text-3">Completed</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-teal-500">{session.compliance}%</span>
                              <div className="relative h-1.5 bg-gray-600/30 rounded overflow-hidden">
                                <div
                                  className="h-full bg-teal-500 rounded transition-all duration-500"
                                  style={{ width: `${session.compliance}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Load Metrics */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-text-2" />
                            <h5 className="text-text-1 font-medium text-xs">Load Metrics</h5>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs">
                              <div className="font-semibold text-text-1">{session.load} TSS</div>
                              <div className="text-text-3">Planned</div>
                            </div>
                            <div className="text-xs">
                              <div className="font-semibold text-green-400">{Math.round(session.load * 1.08)} TSS</div>
                              <div className="text-text-3">Actual</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-green-500">108%</span>
                              <div className="relative h-1.5 bg-gray-600/30 rounded overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded transition-all duration-500"
                                  style={{ width: "100%" }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Second row with Power/Pace and Performance metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Power/Pace Metrics */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-text-2" />
                            <h5 className="text-text-1 font-medium text-xs">
                              {session.sport === "bike"
                                ? "Power Metrics"
                                : session.sport === "run"
                                  ? "Pace Metrics"
                                  : "Stroke Metrics"}
                            </h5>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs">
                              <div className="font-semibold text-text-1">
                                {session.sport === "bike" ? "280W" : session.sport === "run" ? "4:30/km" : "1:45/100m"}
                              </div>
                              <div className="text-text-3">Target</div>
                            </div>
                            <div className="text-xs">
                              <div className="font-semibold text-amber-400">
                                {session.sport === "bike" ? "245W" : session.sport === "run" ? "4:35/km" : "1:48/100m"}
                              </div>
                              <div className="text-text-3">Average</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-amber-500">
                                {session.sport === "bike" ? "88%" : session.sport === "run" ? "98%" : "96%"}
                              </span>
                              <div className="relative h-1.5 bg-gray-600/30 rounded overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded transition-all duration-500"
                                  style={{ width: session.sport === "bike" ? "88%" : "96%" }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Heart className="w-3 h-3 text-text-2" />
                            <h5 className="text-text-1 font-medium text-xs">Performance</h5>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-text-3">Avg HR</span>
                              <span className="font-semibold text-text-1">142 bpm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-3">
                                {session.sport === "bike"
                                  ? "Cadence"
                                  : session.sport === "run"
                                    ? "Cadence"
                                    : "Stroke Rate"}
                              </span>
                              <span className="font-semibold text-text-1">
                                {session.sport === "bike" ? "87 rpm" : session.sport === "run" ? "180 spm" : "32 spm"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-3">Distance</span>
                              <span className="font-semibold text-text-1">
                                {session.sport === "bike" ? "42.5km" : session.sport === "run" ? "10.2km" : "2.4km"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-3">Calories</span>
                              <span className="font-semibold text-text-1">1,247</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!isMissed && (
                        <div className="p-3 bg-bg-surface rounded-lg border border-border-weak">
                          <h4 className="text-text-1 font-medium text-xs mb-2">Session Reflection</h4>
                          <p className="text-text-2 text-xs mb-2">
                            Great execution on the main intervals. Power was slightly below target but heart rate
                            response was excellent. Consider increasing recovery between intervals next time.
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                  key={star}
                                  className={`w-3 h-3 rounded-full ${star <= 4 ? "bg-yellow-500" : "bg-gray-600"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-text-3">Effort: 4/5</span>
                          </div>
                        </div>
                      )}

                      {isMissed && (
                        <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
                          <h4 className="text-red-400 font-medium text-xs mb-1">Workout Missed</h4>
                          <p className="text-text-2 text-xs">
                            This session was not completed. Consider rescheduling or adjusting your training plan.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Only show workout breakdown and "Why this today?" for upcoming sessions */
                    <div className="space-y-4">
                      <div className="p-3 bg-bg-surface rounded-lg border border-border-weak">
                        <h4 className="text-text-1 font-medium text-xs mb-2">Workout Breakdown</h4>
                        <div className="space-y-1 text-xs text-text-2">
                          <div className="flex justify-between">
                            <span>Warm up</span>
                            <span>10 min @ Z1-Z2</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Main Set</span>
                            <span>
                              {Math.floor(session.minutes * 0.6)} min @ Z
                              {session.intensity === "threshold" ? "4" : session.intensity === "vo2" ? "5" : "3"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cool Down</span>
                            <span>10 min @ Z1</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-bg-surface rounded-lg border border-border-weak">
                        <h4 className="text-text-1 font-medium text-xs mb-2">Why this today?</h4>
                        <p className="text-text-2 text-xs mb-2">
                          This {session.intensity} session builds{" "}
                          {session.intensity === "recovery"
                            ? "aerobic base"
                            : session.intensity === "endurance"
                              ? "aerobic capacity"
                              : "anaerobic power"}{" "}
                          while maintaining your current training progression.
                        </p>
                        <button className="text-brand text-xs hover:text-brand/80 transition-colors font-medium">
                          Ask Coach Tom →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-border-weak/50">
                {isCompleted ? (
                  <button
                    onClick={() => (window.location.href = "/training")}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-bg-surface border border-border-weak rounded text-sm hover:bg-bg-raised transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Completed Workout
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-swim text-bg-app rounded text-sm hover:bg-swim/90 transition-colors">
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                    <button className="px-3 py-2 bg-bg-surface border border-border-weak rounded text-sm hover:bg-bg-raised transition-colors">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button className="px-3 py-2 bg-bg-surface border border-border-weak rounded text-sm hover:bg-bg-raised transition-colors">
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
