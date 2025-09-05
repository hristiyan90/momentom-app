"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  ChevronLeft,
  Calendar,
  Target,
  Droplets,
  Thermometer,
  MoreHorizontal,
  TrendingUp,
  Waves,
  Bike,
  Footprints,
  Trophy,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

const raceDetails = {
  "1": {
    id: "1",
    priority: "A" as const,
    type: "Ironman" as const,
    name: "Ironman Barcelona",
    location: "Barcelona, Spain",
    dateISO: "2025-10-05",
    startTime: "07:00",
    status: "On track" as const,
    predicted: {
      total: "10:45:30",
      swim: { split: "1:15:30", targetPace: "1:35/100m", zone: "Z2" as const },
      bike: { split: "5:45:20", targetNP: 245, IF: 0.72, zone: "Z2" },
      run: { split: "3:35:40", targetPace: "5:08/km", hrCap: 165, zone: "Z2" },
      t1: "3:30",
      t2: "5:30",
    },
    confidence: 78,
    course: {
      notes: "Flat swim course in Mediterranean. Rolling bike course with coastal winds. Flat run along beachfront.",
      elevation: "1,200m total gain",
      conditions: "Typical: 18–24°C, wind 8–15 km/h, water 18–20°C",
    },
    nutrition: {
      swim: { carbs: 0, hydration: 0 },
      bike: { carbs: 60, hydration: 750 },
      run: { carbs: 45, hydration: 500 },
    },
    checklist: [
      { id: 1, category: "T-7 to T-1", task: "Race packet pickup", completed: false },
      { id: 2, category: "T-7 to T-1", task: "Finalize carb loading plan", completed: false },
      { id: 3, category: "T-7 to T-1", task: "Bike mechanical check", completed: true },
      { id: 4, category: "T-7 to T-1", task: "Gear bag organization", completed: false },
      { id: 5, category: "Race Day", task: "Check tire pressure", completed: false },
      { id: 6, category: "Race Day", task: "Sort nutrition/gels", completed: false },
      { id: 7, category: "Race Day", task: "Warm-up routine", completed: false },
    ],
  },
  "4": {
    id: "4",
    priority: "A" as const,
    type: "70.3" as const,
    name: "Ironman 70.3 Nice",
    location: "Nice, France",
    dateISO: "2024-09-08",
    startTime: "07:15",
    actual: {
      total: "5:08:42",
      swim: { split: "32:15", pace: "1:42/100m", avgHR: 152 },
      bike: { split: "2:28:30", avgPower: 245, NP: 252, IF: 0.82 },
      run: { split: "1:58:45", pace: "5:38/km", avgHR: 165 },
      t1: "3:12",
      t2: "6:00",
      placement: { overall: 127, ageGroup: 23, totalParticipants: 1850 },
    },
    course: {
      notes:
        "Challenging swim in Mediterranean bay. Hilly bike course with 1,100m elevation. Rolling run course through Nice.",
      elevation: "1,100m total gain",
      conditions: "Race day: 22°C, light winds 5-8 km/h, water 19°C",
    },
    nutrition: {
      swim: { carbs: 0, hydration: 0 },
      bike: { carbs: 55, hydration: 700 },
      run: { carbs: 40, hydration: 450 },
    },
    raceReport: {
      highlights: [
        "Strong swim performance - 2min faster than predicted",
        "Maintained target power on bike despite hills",
        "Negative split run - felt strong throughout",
      ],
      learnings: [
        "Nutrition strategy worked well",
        "Could have pushed harder on the run",
        "Transition times need improvement",
      ],
    },
  },
  "5": {
    id: "5",
    priority: "B" as const,
    type: "Marathon" as const,
    name: "Berlin Marathon",
    location: "Berlin, Germany",
    dateISO: "2024-09-29",
    startTime: "09:00",
    actual: {
      total: "3:42:18",
      run: { split: "3:42:18", pace: "5:16/km", avgHR: 158 },
      placement: { overall: 8420, ageGroup: 1205, totalParticipants: 45000 },
    },
    course: {
      notes: "Fast, flat course through Berlin. Excellent crowd support throughout.",
      elevation: "Minimal elevation gain",
      conditions: "Perfect conditions: 12°C, no wind, overcast",
    },
    nutrition: {
      run: { carbs: 30, hydration: 400 },
    },
    raceReport: {
      highlights: [
        "Perfect pacing - even splits throughout",
        "Felt strong until km 35",
        "Great crowd support kept motivation high",
      ],
      learnings: [
        "Need more long runs at race pace",
        "Fueling strategy was adequate",
        "Weather was ideal for performance",
      ],
    },
  },
}

// Helper functions
const formatDate = (dateISO: string) => {
  const date = new Date(dateISO)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 0) {
    if (diffDays < 7) return `${diffDays} days`
    return `${Math.ceil(diffDays / 7)} weeks`
  }
  return "Past"
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "A":
      return "bg-red-500"
    case "B":
      return "bg-amber-500"
    case "C":
      return "bg-emerald-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "On track":
      return "text-green-400"
    case "At risk":
      return "text-orange-400"
    case "Off track":
      return "text-red-400"
    default:
      return "text-gray-400"
  }
}

const getZoneColor = (zone: string) => {
  switch (zone) {
    case "Z1":
      return "bg-[#00D1A7]"
    case "Z2":
      return "bg-[#5B8CFF]"
    case "Z3":
      return "bg-[#9B5DE5]"
    case "Z4":
      return "bg-[#FF5470]"
    case "Z5":
      return "bg-[#FF8A3E]"
    default:
      return "bg-gray-500"
  }
}

export default function RaceDetailPage() {
  const params = useParams()
  const raceId = params.id as string

  const race = raceDetails[raceId as keyof typeof raceDetails]
  const isPastRace = race ? new Date(race.dateISO) < new Date() : false

  const [checklist, setChecklist] = useState(race?.checklist || [])

  if (!race) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-200 mb-2">Race not found</h1>
          <Link href="/races">
            <Button className="bg-[#5B8CFF] hover:bg-[#4A7AEF] text-white">Back to Races</Button>
          </Link>
        </div>
      </div>
    )
  }

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const completedTasks = checklist.filter((item) => item.completed).length
  const totalTasks = checklist.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="min-h-screen bg-[#0B0F14]">
      {/* Header */}
      <div className="bg-[#0F151D] border-b border-[#1E293B] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/races">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 px-2 sm:px-3">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Races</span>
                </Button>
              </Link>
              <span className="text-slate-600 hidden sm:inline">›</span>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-200 truncate">{race.name}</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {!isPastRace && (
                <>
                  <Button size="sm" className="bg-[#5B8CFF] hover:bg-[#4A7AEF] text-white hidden sm:inline-flex">
                    Insert Taper
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#1E293B] text-slate-400 hover:bg-[#1E293B] bg-transparent hidden md:inline-flex"
                  >
                    Open Race Week in Calendar
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-[#5B8CFF]" />
              <span className="text-slate-400 text-sm sm:text-base">{isPastRace ? "Race Date" : "Countdown"}</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-200">
              {isPastRace ? `Completed ${formatDate(race.dateISO)} ago` : `Race in ${formatDate(race.dateISO)}`}
            </div>
            <div className="text-xs sm:text-sm text-slate-400">{new Date(race.dateISO).toLocaleDateString()}</div>
          </div>

          <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              {isPastRace ? (
                <Trophy className="w-5 h-5 text-[#5B8CFF]" />
              ) : (
                <Target className="w-5 h-5 text-[#5B8CFF]" />
              )}
              <span className="text-slate-400 text-sm sm:text-base">
                {isPastRace ? "Priority & Result" : "Priority & Status"}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <Badge className={`${getPriorityColor(race.priority)} text-white text-xs px-2 py-1`}>
                {race.priority} Race
              </Badge>
              {isPastRace
                ? race.actual?.placement && (
                    <span className="font-medium text-green-400 text-sm sm:text-base">
                      #{race.actual.placement.overall} Overall
                    </span>
                  )
                : race.status && (
                    <span className={`font-medium ${getStatusColor(race.status)} text-sm sm:text-base`}>
                      {race.status}
                    </span>
                  )}
            </div>
            <div className="text-xs sm:text-sm text-slate-400">
              {isPastRace
                ? race.actual?.placement
                  ? `${race.actual.placement.ageGroup}/${Math.ceil(race.actual.placement.totalParticipants * 0.1)} in age group`
                  : "Race completed"
                : "Training aligned"}
            </div>
          </div>

          <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              {isPastRace ? (
                <Award className="w-5 h-5 text-[#5B8CFF]" />
              ) : (
                <TrendingUp className="w-5 h-5 text-[#5B8CFF]" />
              )}
              <span className="text-slate-400 text-sm sm:text-base">
                {isPastRace ? "Final Time" : "Target Outcome"}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-200">
              {isPastRace ? race.actual?.total : `Goal: ${race.predicted?.total}`}
            </div>
            {!isPastRace && <div className="text-xs sm:text-sm text-green-400">▲2m vs last week</div>}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-200 mb-4">Overview</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-sm sm:text-base">Race Type:</span>
                    <span className="ml-2 text-slate-200 text-sm sm:text-base">{race.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm sm:text-base">Start Time:</span>
                    <span className="ml-2 text-slate-200 text-sm sm:text-base">{race.startTime}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm sm:text-base">Location:</span>
                  <span className="ml-2 text-slate-200 text-sm sm:text-base">{race.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-sm sm:text-base">Course Notes:</span>
                  <p className="text-slate-200 mt-1 text-sm sm:text-base">{race.course.notes}</p>
                </div>

                {isPastRace ? (
                  race.raceReport && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <span className="text-green-200 text-sm sm:text-base">Race completed successfully</span>
                    </div>
                  )
                ) : (
                  <div className="bg-green-600 border border-green-500 rounded-lg p-3 flex items-center justify-between flex-wrap gap-3">
                    <span className="text-white text-sm sm:text-base">Plan alignment: On track</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-400 text-white hover:bg-green-500 bg-transparent text-xs sm:text-sm"
                    >
                      View in Calendar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isPastRace && race.actual ? (
              /* Actual Results Section */
              <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-200 mb-6">Race Results</h2>

                <div className="space-y-6">
                  {/* Swim Results */}
                  {race.actual.swim && (
                    <div className="border border-[#1E293B] rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="w-8 h-8 bg-[#00C2C2] rounded-full flex items-center justify-center">
                          <Waves className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-slate-200">Swim</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Split Time</span>
                          <div className="text-lg sm:text-xl font-bold text-slate-200">{race.actual.swim.split}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Average Pace</span>
                          <div className="text-sm sm:text-lg text-slate-200">{race.actual.swim.pace}</div>
                        </div>
                        {race.actual.swim.avgHR && (
                          <div>
                            <span className="text-slate-400 text-xs sm:text-sm">Avg HR</span>
                            <div className="text-sm sm:text-lg text-slate-200">{race.actual.swim.avgHR} bpm</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bike Results */}
                  {race.actual.bike && (
                    <div className="border border-[#1E293B] rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="w-8 h-8 bg-[#FF9A3E] rounded-full flex items-center justify-center">
                          <Bike className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-slate-200">Bike</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Split Time</span>
                          <div className="text-lg sm:text-xl font-bold text-slate-200">{race.actual.bike.split}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Avg Power</span>
                          <div className="text-sm sm:text-lg text-slate-200">{race.actual.bike.avgPower}W</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">NP</span>
                          <div className="text-sm sm:text-lg text-slate-200">{race.actual.bike.NP}W</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">IF</span>
                          <div className="text-sm sm:text-lg text-slate-200">{race.actual.bike.IF}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Run Results */}
                  {race.actual.run && (
                    <div className="border border-[#1E293B] rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="w-8 h-8 bg-[#7C5CFF] rounded-full flex items-center justify-center">
                          <Footprints className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-slate-200">Run</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Split Time</span>
                          <div className="text-lg sm:text-xl font-bold text-slate-200">{race.actual.run.split}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Average Pace</span>
                          <div className="text-sm sm:text-lg text-slate-200">{race.actual.run.pace}</div>
                        </div>
                        {race.actual.run.avgHR && (
                          <div>
                            <span className="text-slate-400 text-xs sm:text-sm">Avg HR</span>
                            <div className="text-sm sm:text-lg text-slate-200">{race.actual.run.avgHR} bpm</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Transitions */}
                  {(race.actual.t1 || race.actual.t2) && (
                    <div className="grid grid-cols-2 gap-4">
                      {race.actual.t1 && (
                        <div className="border border-[#1E293B] rounded-lg p-3">
                          <span className="text-slate-400 text-xs sm:text-sm">T1</span>
                          <div className="text-sm sm:text-lg font-medium text-slate-200">{race.actual.t1}</div>
                        </div>
                      )}
                      {race.actual.t2 && (
                        <div className="border border-[#1E293B] rounded-lg p-3">
                          <span className="text-slate-400 text-xs sm:text-sm">T2</span>
                          <div className="text-sm sm:text-lg font-medium text-slate-200">{race.actual.t2}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Training State & Race Readiness section for upcoming races */}
                <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-200 mb-6">
                    Training State & Race Readiness
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Current Readiness Score */}
                    <div className="lg:col-span-1">
                      <div className="text-center p-4 bg-[#1E293B]/30 rounded-lg">
                        <div className="text-sm text-slate-400 mb-2">Current Readiness</div>
                        <div className="text-3xl font-bold text-green-400 mb-2">87%</div>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-slate-300">Race Ready</span>
                        </div>
                        {/* Warning indicators */}
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-amber-400">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>High Monotony</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Training Load Chart */}
                    <div className="lg:col-span-2">
                      <div className="text-sm text-slate-400 mb-3">6-Week Training Load Trend</div>
                      <div className="relative h-32 bg-[#1E293B]/30 rounded-lg p-4">
                        {/* Chart grid lines */}
                        <div className="absolute inset-4 grid grid-rows-4 opacity-20">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="border-t border-slate-600"></div>
                          ))}
                        </div>

                        {/* Chart lines */}
                        <svg
                          className="absolute inset-4 w-full h-full"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          {/* CTL (Fitness) - Blue line */}
                          <polyline
                            fill="none"
                            stroke="#5B8CFF"
                            strokeWidth="2"
                            points="0,60 16,58 32,55 48,52 64,50 80,48 100,45"
                          />
                          {/* ATL (Fatigue) - Orange line */}
                          <polyline
                            fill="none"
                            stroke="#FF9A3E"
                            strokeWidth="2"
                            points="0,70 16,72 32,68 48,65 64,70 80,75 100,78"
                          />
                          {/* Form - Green line */}
                          <polyline
                            fill="none"
                            stroke="#00D1A7"
                            strokeWidth="2"
                            points="0,40 16,38 32,42 48,45 64,35 80,25 100,15"
                          />
                          {/* Race week marker */}
                          <line
                            x1="100"
                            y1="0"
                            x2="100"
                            y2="100"
                            stroke="#FF5470"
                            strokeWidth="2"
                            strokeDasharray="4,2"
                          />
                        </svg>

                        {/* Legend */}
                        <div className="absolute bottom-1 left-4 flex gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-0.5 bg-[#5B8CFF]"></div>
                            <span className="text-slate-400">CTL (Fitness)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-0.5 bg-[#FF9A3E]"></div>
                            <span className="text-slate-400">ATL (Fatigue)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-0.5 bg-[#00D1A7]"></div>
                            <span className="text-slate-400">Form</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-0.5 bg-[#FF5470]"></div>
                            <span className="text-slate-400">Race Week</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-200 mb-6">Race Prediction Breakdown</h2>

                  {/* Split Visualization Bars */}
                  <div className="space-y-4 mb-8">
                    <div className="text-sm text-slate-400 mb-2">Predicted Race Timeline</div>

                    {/* Total race bar container */}
                    <div className="relative">
                      {/* Swim segment */}
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-[#1E293B] rounded-lg overflow-hidden h-8 relative">
                          <div
                            className="h-full bg-[#00C2C2] flex items-center justify-between px-3"
                            style={{ width: "11.6%" }} // 1:15:30 out of 10:45:30
                          >
                            <div className="flex items-center gap-2">
                              <Waves className="w-4 h-4 text-white" />
                              <span className="text-white text-sm font-medium">Swim</span>
                            </div>
                            <span className="text-white text-sm font-medium">1:15:30</span>
                          </div>
                        </div>
                      </div>

                      {/* T1 segment */}
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-[#1E293B] rounded-lg overflow-hidden h-6 relative">
                          <div
                            className="h-full bg-gray-500 flex items-center justify-between px-3"
                            style={{ width: "0.5%" }} // 3:30 out of 10:45:30
                          >
                            <span className="text-white text-xs">T1</span>
                            <span className="text-white text-xs">3:30</span>
                          </div>
                        </div>
                      </div>

                      {/* Bike segment */}
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-[#1E293B] rounded-lg overflow-hidden h-8 relative">
                          <div
                            className="h-full bg-[#FF9A3E] flex items-center justify-between px-3"
                            style={{ width: "53.4%" }} // 5:45:20 out of 10:45:30
                          >
                            <div className="flex items-center gap-2">
                              <Bike className="w-4 h-4 text-white" />
                              <span className="text-white text-sm font-medium">Bike</span>
                            </div>
                            <span className="text-white text-sm font-medium">5:45:20</span>
                          </div>
                        </div>
                      </div>

                      {/* T2 segment */}
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-[#1E293B] rounded-lg overflow-hidden h-6 relative">
                          <div
                            className="h-full bg-gray-500 flex items-center justify-between px-3"
                            style={{ width: "0.9%" }} // 5:30 out of 10:45:30
                          >
                            <span className="text-white text-xs">T2</span>
                            <span className="text-white text-xs">5:30</span>
                          </div>
                        </div>
                      </div>

                      {/* Run segment */}
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-[#1E293B] rounded-lg overflow-hidden h-8 relative">
                          <div
                            className="h-full bg-[#7C5CFF] flex items-center justify-between px-3"
                            style={{ width: "33.6%" }} // 3:35:40 out of 10:45:30
                          >
                            <div className="flex items-center gap-2">
                              <Footprints className="w-4 h-4 text-white" />
                              <span className="text-white text-sm font-medium">Run</span>
                            </div>
                            <span className="text-white text-sm font-medium">3:35:40</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Distance breakdown */}
                    <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-400 mt-4">
                      <div>3.8km swim</div>
                      <div>180km bike</div>
                      <div>42.2km run</div>
                    </div>
                  </div>

                  {/* Detailed splits section */}
                  <div className="space-y-6">
                    {/* Swim */}
                    <div className="border border-[#1E293B] rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="w-8 h-8 bg-[#00C2C2] rounded-full flex items-center justify-center">
                          <Waves className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-slate-200">Swim</h3>
                        <Badge
                          className={`${getZoneColor(race.predicted?.swim?.zone || "Z2")} text-white text-xs px-2 py-1`}
                        >
                          {race.predicted?.swim?.zone}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Predicted Split</span>
                          <div className="text-lg sm:text-xl font-bold text-slate-200">
                            {race.predicted?.swim?.split}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Target Pace</span>
                          <div className="text-sm sm:text-lg text-slate-200">{race.predicted?.swim?.targetPace}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">CSS Pace</span>
                          <div className="text-sm sm:text-lg text-slate-200">1:32/100m</div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00C2C2] rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>

                    {/* Bike */}
                    <div className="border border-[#1E293B] rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="w-8 h-8 bg-[#FF9A3E] rounded-full flex items-center justify-center">
                          <Bike className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-slate-200">Bike</h3>
                        <Badge
                          className={`${getZoneColor(race.predicted?.bike?.zone || "Z2")} text-white text-xs px-2 py-1`}
                        >
                          {race.predicted?.bike?.zone}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Predicted Split</span>
                          <div className="text-lg sm:text-xl font-bold text-slate-200">
                            {race.predicted?.bike?.split}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Target NP</span>
                          <div className="text-sm sm:text-lg text-slate-200">{race.predicted?.bike?.targetNP}W</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">IF</span>
                          <div className="text-sm sm:text-lg text-slate-200">{race.predicted?.bike?.IF}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Est. kJ</span>
                          <div className="text-sm sm:text-lg text-slate-200">2,850</div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF9A3E] rounded-full" style={{ width: "72%" }}></div>
                      </div>
                    </div>

                    {/* Run */}
                    <div className="border border-[#1E293B] rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="w-8 h-8 bg-[#7C5CFF] rounded-full flex items-center justify-center">
                          <Footprints className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-slate-200">Run</h3>
                        <Badge
                          className={`${getZoneColor(race.predicted?.run?.zone || "Z2")} text-white text-xs px-2 py-1`}
                        >
                          {race.predicted?.run?.zone}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Predicted Split</span>
                          <div className="text-lg sm:text-xl font-bold text-slate-200">
                            {race.predicted?.run?.split}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">Target Pace</span>
                          <div className="text-sm sm:text-lg text-slate-200">{race.predicted?.run?.targetPace}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs sm:text-sm">HR Cap</span>
                          <div className="text-sm sm:text-lg text-slate-200">{race.predicted?.run?.hrCap} bpm</div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                        <div className="h-full bg-[#7C5CFF] rounded-full" style={{ width: "68%" }}></div>
                      </div>
                    </div>

                    {/* Transitions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-[#1E293B] rounded-lg p-3">
                        <span className="text-slate-400 text-xs sm:text-sm">T1</span>
                        <div className="text-sm sm:text-lg font-medium text-slate-200">{race.predicted?.t1}</div>
                      </div>
                      <div className="border border-[#1E293B] rounded-lg p-3">
                        <span className="text-slate-400 text-xs sm:text-sm">T2</span>
                        <div className="text-sm sm:text-lg font-medium text-slate-200">{race.predicted?.t2}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isPastRace && race.raceReport ? (
              /* Race Report Section */
              <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-200 mb-6">Race Report</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-slate-200 mb-3">Race Highlights</h3>
                    <ul className="space-y-2">
                      {race.raceReport.highlights.map((highlight, index) => (
                        <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-slate-200 mb-3">Key Learnings</h3>
                    <ul className="space-y-2">
                      {race.raceReport.learnings.map((learning, index) => (
                        <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {learning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              /* Fuel Plan Section for future races */
              <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-200 mb-6">Fuel Plan</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#00C2C2] rounded-full flex items-center justify-center mx-auto mb-2">
                        <Waves className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400">Swim</div>
                      <div className="text-sm sm:text-lg font-medium text-slate-200">
                        {race.nutrition.swim.carbs}g/hr
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#FF9A3E] rounded-full flex items-center justify-center mx-auto mb-2">
                        <Bike className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400">Bike</div>
                      <div className="text-sm sm:text-lg font-medium text-slate-200">
                        {race.nutrition.bike.carbs}g/hr
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#7C5CFF] rounded-full flex items-center justify-center mx-auto mb-2">
                        <Footprints className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400">Run</div>
                      <div className="text-sm sm:text-lg font-medium text-slate-200">
                        {race.nutrition.run.carbs}g/hr
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#1E293B] pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="w-4 h-4 text-[#5B8CFF]" />
                          <span className="text-slate-400 text-sm sm:text-base">Hydration</span>
                        </div>
                        <div className="text-slate-200 text-sm sm:text-base">600-800 ml/hr</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-[#5B8CFF]" />
                          <span className="text-slate-400 text-sm sm:text-base">Sodium</span>
                        </div>
                        <div className="text-slate-200 text-sm sm:text-base">200-300 mg/hr</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-[#1E293B] text-slate-400 hover:bg-[#1E293B] bg-transparent text-sm"
                  >
                    Open full race nutrition (coming soon)
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Side Rail */}
          <div className="space-y-6">
            {/* Conditions */}
            <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4">
                {isPastRace ? "Race Conditions" : "Conditions"}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-[#5B8CFF]" />
                  <span className="text-slate-400 text-xs sm:text-sm">{isPastRace ? "Actual Weather" : "Weather"}</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm">{race.course.conditions}</p>
                <div className="text-slate-400 text-xs sm:text-sm">
                  <span>Elevation: {race.course.elevation}</span>
                </div>
                {!isPastRace && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-[#1E293B] text-slate-400 hover:bg-[#1E293B] bg-transparent text-xs sm:text-sm"
                    disabled
                  >
                    Enable weather service
                  </Button>
                )}
              </div>
            </div>

            {!isPastRace && checklist.length > 0 && (
              <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-200">Race Week Checklist</h3>
                  <div className="text-xs sm:text-sm text-slate-400">
                    {completedTasks}/{totalTasks}
                  </div>
                </div>

                <Progress value={progressPercentage} className="mb-4" />

                <div className="space-y-4">
                  {["T-7 to T-1", "Race Day"].map((category) => (
                    <div key={category}>
                      <h4 className="text-xs sm:text-sm font-medium text-slate-300 mb-2">{category}</h4>
                      <div className="space-y-2">
                        {checklist
                          .filter((item) => item.category === category)
                          .map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() => toggleChecklistItem(item.id)}
                                className="border-[#1E293B] flex-shrink-0"
                              />
                              <span
                                className={`text-xs sm:text-sm ${item.completed ? "text-slate-400 line-through" : "text-slate-200"}`}
                              >
                                {item.task}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-4 border-[#1E293B] text-slate-400 hover:bg-[#1E293B] bg-transparent text-xs sm:text-sm"
                  disabled
                >
                  Insert race week / taper template
                </Button>
              </div>
            )}

            {isPastRace ? (
              /* Performance Summary for past races */
              <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4">Performance Summary</h3>

                {race.actual?.placement && (
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-xs sm:text-sm">Overall Placement</span>
                      <span className="text-slate-200 text-xs sm:text-sm">
                        {race.actual.placement.overall} / {race.actual.placement.totalParticipants}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-xs sm:text-sm">Age Group</span>
                      <span className="text-slate-200 text-xs sm:text-sm">
                        {race.actual.placement.ageGroup} / {Math.ceil(race.actual.placement.totalParticipants * 0.1)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-[#1E293B] text-slate-400 hover:bg-[#1E293B] bg-transparent text-xs sm:text-sm"
                  >
                    View Full Analysis
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-[#1E293B] text-slate-400 hover:bg-[#1E293B] bg-transparent text-xs sm:text-sm"
                  >
                    Export Race Data
                  </Button>
                </div>
              </div>
            ) : (
              /* Risk Flags & Reminders for future races */
              <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4">Risk Flags</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-orange-500/20 text-orange-200 border border-orange-500/30 text-xs">Heat</Badge>
                  <Badge className="bg-yellow-600 text-white border border-yellow-500 text-xs">Hills</Badge>
                  <Badge className="bg-blue-500/20 text-blue-200 border border-blue-500/30 text-xs">Logistics</Badge>
                </div>

                <h4 className="text-xs sm:text-sm font-medium text-slate-300 mb-2">Key Reminders</h4>
                <ul className="text-xs sm:text-sm text-slate-400 space-y-1">
                  <li>• Arrive 2 hours early</li>
                  <li>• Practice fueling strategy</li>
                  <li>• Respect pacing caps</li>
                  <li>• Check weather updates</li>
                </ul>

                <div className="mt-4 space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-[#1E293B] text-slate-400 hover:bg-[#1E293B] bg-transparent text-xs sm:text-sm"
                  >
                    Open Calendar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-[#1E293B] text-slate-400 hover:bg-[#1E293B] bg-transparent text-xs sm:text-sm"
                  >
                    Export Race Week (ICS)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
