"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Waves,
  Bike,
  User,
  Check,
  Clock,
  Zap,
  MapPin,
  Heart,
  X,
} from "lucide-react"
import { ZoneComparisonBars } from "@/components/training/zone-comparison-bars"
import { IntensityBar } from "@/components/training/intensity-bar"
import { WorkoutGraph } from "@/components/training/workout-graph"
import { WorkoutSplits } from "@/components/training/workout-splits"
import { WorkoutStats } from "@/components/training/workout-stats"
import { cn } from "@/lib/utils"

const thursdaySwimWorkout = {
  title: "Threshold 400s",
  sport: "swim" as const,
  stress: "High Stress",
  time: "6:00 AM",
  duration: "75min",
  load: 195,
  isCompleted: false,
  segments: [
    { label: "WU 15′ Z1", zone: "Z1" as const, minutes: 15 },
    {
      label: "4×400m Z4",
      zone: "Z4" as const,
      minutes: 35,
      intervals: [
        { distance: "400m", targetPace: "01:45-1:55", duration: "03:20" },
        { distance: "400m", targetPace: "01:45-1:55", duration: "03:20" },
        { distance: "400m", targetPace: "01:45-1:55", duration: "03:20" },
        { distance: "400m", targetPace: "01:45-1:55", duration: "03:20" },
      ],
    },
    { label: "4×50 Z2", zone: "Z2" as const, minutes: 15 },
    { label: "CD 10′ Z1", zone: "Z1" as const, minutes: 10 },
  ],
  phases: {
    workout: [
      "400m easy warm-up with 4×50 build",
      "4×400m threshold @ 1:45-1:55 pace (30s rest)",
      "4×50m easy recovery between sets",
      "300m easy cool-down",
    ],
  },
  sessionNote:
    "Focus on maintaining consistent pace across all 400m repeats. This is a key threshold session to build lactate tolerance. Keep stroke rate steady and breathing controlled throughout the main set.",
  targets: {
    pace: "1:45–1:55 /100m",
    hr: "160–175 bpm",
    distance: "3.2 km",
  },
  workoutOverview:
    "High-intensity threshold session designed to improve lactate buffering capacity and race pace sustainability. The main set of 4×400m repeats targets Zone 4 effort with controlled recovery periods.",
  fuelingGuidelines: {
    preworkout: "Light snack 30-60 minutes before: banana with honey or energy bar. Hydrate with 300-500ml water.",
    during: "For 75-minute session: sports drink or diluted electrolyte solution. Sip regularly throughout workout.",
    postworkout: "Within 30 minutes: protein shake with carbs (3:1 ratio). Follow with balanced meal within 2 hours.",
  },
}

const thursdayBikeWorkout = {
  title: "FTP Test",
  sport: "bike" as const,
  stress: "Very High Stress",
  time: "6:30 PM",
  duration: "90min",
  load: 285,
  isCompleted: true,
  completedAt: "7:45 PM",
  compliance: {
    duration: 100,
    power: 100,
  },
  tss: 285,
  actualZones: [
    { zone: "Z1", planned: 20 * 60, actual: 18 * 60 + 45, color: "#22D3EE" },
    { zone: "Z2", planned: 30 * 60, actual: 28 * 60 + 30, color: "#3B82F6" },
    { zone: "Z3", planned: 5 * 60, actual: 4 * 60 + 15, color: "#8B5CF6" },
    { zone: "Z4", planned: 15 * 60, actual: 16 * 60 + 20, color: "#EC4899" },
    { zone: "Z5", planned: 20 * 60, actual: 22 * 60 + 10, color: "#EF4444" },
  ],
  actualHRZones: [
    { zone: "Z1", planned: 20 * 60, actual: 15 * 60 + 30, color: "#22D3EE" },
    { zone: "Z2", planned: 25 * 60, actual: 22 * 60 + 45, color: "#3B82F6" },
    { zone: "Z3", planned: 15 * 60, actual: 18 * 60 + 15, color: "#8B5CF6" },
    { zone: "Z4", planned: 20 * 60, actual: 23 * 60 + 30, color: "#EC4899" },
    { zone: "Z5", planned: 10 * 60, actual: 10 * 60 + 0, color: "#EF4444" },
  ],
  segments: [
    { label: "WU 20′ Z1-Z2", zone: "Z1" as const, minutes: 20 },
    {
      label: "FTP 20′ Z5",
      zone: "Z5" as const,
      minutes: 20,
      intervals: [
        {
          distance: "5min",
          targetPace: "Z5 effort",
          duration: "5:00",
          compliance: 85,
          averagePower: 285,
          targetPower: 320,
        },
        {
          distance: "5min",
          targetPace: "Z5 effort",
          duration: "5:00",
          compliance: 70,
          averagePower: 275,
          targetPower: 320,
        },
        {
          distance: "5min",
          targetPace: "Z5 effort",
          duration: "5:00",
          compliance: 60,
          averagePower: 265,
          targetPower: 320,
        },
        {
          distance: "5min",
          targetPace: "Z5 effort",
          duration: "5:00",
          compliance: 45,
          averagePower: 245,
          targetPower: 320,
        },
      ],
    },
    { label: "Recovery 30′ Z2", zone: "Z2" as const, minutes: 30 },
    { label: "CD 20′ Z1", zone: "Z1" as const, minutes: 20 },
  ],
  phases: {
    workout: [
      "20min progressive warm-up building to Z2",
      "5min at Z3 to prepare for test",
      "20min all-out FTP test effort",
      "30min easy recovery spin",
      "20min easy cool-down",
    ],
  },
  sessionNote:
    "Excellent FTP test completed! Maintained strong power output throughout the 20-minute test segment. New FTP established at 295W, representing a 5% improvement from previous test. Recovery periods were well-executed with appropriate power zones.",
}

const completedBikeWorkout = {
  title: "Sample Bike Session",
  sport: "bike" as const,
  load: 842,
  completedAt: "4:33 pm",
  duration: "1h",
  isCompleted: true,
  compliance: {
    duration: 95,
    power: 88,
  },
  tss: 142,
  actualZones: [
    { zone: "Z1", planned: 20 * 60, actual: 58 * 60 + 36, color: "#22D3EE" },
    { zone: "Z2", planned: 35 * 60, actual: 1 * 60 + 4, color: "#3B82F6" },
    { zone: "Z3", planned: 5 * 60, actual: 30, color: "#8B5CF6" },
    { zone: "Z4", planned: 0, actual: 30, color: "#EC4899" },
    { zone: "Z5", planned: 0, actual: 30, color: "#EF4444" },
  ],
  actualHRZones: [
    { zone: "Z1", planned: 15 * 60, actual: 42 * 60 + 18, color: "#22D3EE" },
    { zone: "Z2", planned: 30 * 60, actual: 15 * 60 + 22, color: "#3B82F6" },
    { zone: "Z3", planned: 10 * 60, actual: 2 * 60 + 15, color: "#8B5CF6" },
    { zone: "Z4", planned: 5 * 60, actual: 5, color: "#EC4899" },
    { zone: "Z5", planned: 0, actual: 0, color: "#EF4444" },
  ],
  segments: [
    { label: "WU 10′ Z1", zone: "Z1" as const, minutes: 10 },
    { label: "MS 40′ Z2", zone: "Z2" as const, minutes: 40 },
    { label: "CD 10′ Z1", zone: "Z1" as const, minutes: 10 },
  ],
  phases: {
    workout: ["10 min easy warm-up in Z1", "40 min steady effort in Z2", "10 min easy cool-down in Z1"],
  },
  sessionNote:
    "Solid endurance ride completed. Good power consistency throughout the main set. Heart rate stayed well within target zones.",
}

const runningWorkout = {
  title: "Tempo Run 5K",
  sport: "run" as const,
  stress: "Moderate Stress",
  time: "6:00 AM",
  duration: "45min",
  isCompleted: false,
  isMissed: true,
  distance: "5.2 km",
  pace: "4:15-4:30 /km",
  segments: [
    { label: "WU 10′ Z1", zone: "Z1" as const, minutes: 10 },
    { label: "MS 20′ Z3", zone: "Z3" as const, minutes: 20 },
    { label: "3×2′ Z4", zone: "Z4" as const, minutes: 6 },
    { label: "CD 9′ Z1", zone: "Z1" as const, minutes: 9 },
  ],
  phases: {
    workout: [
      "10 min easy warm-up jog in Z1",
      "20 min tempo run in Z3 (comfortably hard)",
      "3 × 2 min intervals in Z4 with 1 min recovery",
      "9 min easy cool-down jog in Z1",
    ],
  },
  sessionNote:
    "Focus on maintaining consistent pace during the tempo portion. The intervals should feel challenging but controlled. Use the recovery periods to prepare for the next effort.",
  targets: {
    pace: "4:15–4:30 /km",
    hr: "155–170 bpm",
    distance: "5.2 km",
  },
  workoutOverview:
    "Mixed-intensity running session combining tempo work with short intervals. Designed to improve lactate threshold and VO2 max while maintaining aerobic base.",
  fuelingGuidelines: {
    preworkout: "Easy to digest carbs 1-2 hours before: toast with jam or oatmeal. Avoid high fiber/fat foods.",
    during: "For 45-minute session: water sufficient. Consider electrolyte drink if hot conditions or high sweat rate.",
    postworkout:
      "Chocolate milk or recovery drink within 15-30 minutes. Follow with protein-rich meal within 1-2 hours.",
  },
}

const completedRunWorkout = {
  title: "Long Run 10K",
  sport: "run" as const,
  stress: "Moderate Stress",
  time: "7:00 AM",
  duration: "60min",
  isCompleted: true,
  isMissed: false,
  completedAt: "8:15 AM",
  compliance: {
    duration: 95,
    pace: 92,
  },
  distance: "10.5 km",
  pace: "5:45 /km",
  load: 180,
  actualZones: [
    { zone: "Z1", planned: 10 * 60, actual: 10 * 60 + 30, color: "#22D3EE" },
    { zone: "Z2", planned: 40 * 60, actual: 38 * 60 + 45, color: "#3B82F6" },
    { zone: "Z3", planned: 0, actual: 5 * 60, color: "#8B5CF6" },
    { zone: "Z4", planned: 0, actual: 0, color: "#EC4899" },
    { zone: "Z5", planned: 0, actual: 0, color: "#EF4444" },
  ],
  actualHRZones: [
    { zone: "Z1", planned: 10 * 60, actual: 10 * 60 + 15, color: "#22D3EE" },
    { zone: "Z2", planned: 40 * 60, actual: 39 * 60 + 30, color: "#3B82F6" },
    { zone: "Z3", planned: 0, actual: 0, color: "#8B5CF6" },
    { zone: "Z4", planned: 0, actual: 0, color: "#EC4899" },
    { zone: "Z5", planned: 0, actual: 0, color: "#EF4444" },
  ],
  segments: [
    { label: "WU 10′ Z1", zone: "Z1" as const, minutes: 10 },
    { label: "MS 40′ Z2", zone: "Z2" as const, minutes: 40 },
    { label: "CD 10′ Z1", zone: "Z1" as const, minutes: 10 },
  ],
  phases: {
    workout: [
      "10 min easy warm-up jog in Z1",
      "40 min steady aerobic run in Z2",
      "10 min easy cool-down jog in Z1",
    ],
  },
  sessionNote:
    "Excellent execution of the long run. Maintained consistent pace throughout the aerobic portion. Felt strong and controlled.",
  targets: {
    pace: "5:45–6:00 /km",
    hr: "140–155 bpm",
    distance: "10.0 km",
  },
  workoutOverview:
    "Aerobic base building session designed to improve endurance and fat oxidation. The steady pace in Zone 2 helps develop aerobic capacity.",
  fuelingGuidelines: {
    preworkout: "Light breakfast 2 hours before: banana with toast. Hydrate well.",
    during: "For 60-minute session: water every 15-20 minutes. Consider electrolyte drink if hot conditions.",
    postworkout:
      "Recovery drink within 30 minutes. Follow with balanced meal within 2 hours.",
  },
}

const sportIcons = {
  swim: Waves,
  bike: Bike,
  run: User,
}

const sportColors = {
  swim: "border-sport-swim",
  bike: "border-sport-bike",
  run: "border-sport-run",
}

const sportBackgrounds = {
  swim: "bg-swim/20",
  bike: "bg-bike/20",
  run: "bg-run/20",
}

const sportTextColors = {
  swim: "text-swim",
  bike: "text-bike",
  run: "text-run",
}

const brand = "#34D399"
const brandDark = "#22C55E"

export default function TrainingPage() {
  const [isIndoor, setIsIndoor] = useState(true)
  const [showApply, setShowApply] = useState(true)
  const [showZoneTable, setShowZoneTable] = useState(true)
  const [activeSessionIndex, setActiveSessionIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<"graphs" | "splits" | "stats" | "notes">("graphs")
  const [zoneAnalysisTab, setZoneAnalysisTab] = useState<"power" | "hr">("power")
  const [sessionNotesTab, setSessionNotesTab] = useState<"auto" | string>("auto")
  const [userNotes, setUserNotes] = useState<string[]>([])
  const [newNote, setNewNote] = useState("")
  const [reflections, setReflections] = useState<
    Array<{
      id: string
      rpe: number | null
      feeling: string
      notes: string
      issues: string
      actualFuel: string
      date: string
    }>
  >([])
  const [showReflectionForm, setShowReflectionForm] = useState(false)
  const [reflectionData, setReflectionData] = useState({
    rpe: null as number | null,
    feeling: "",
    notes: "",
    issues: "",
    actualFuel: "",
  })
  const [showFuelingDetails, setShowFuelingDetails] = useState(false)

  const sessions = [
    { sport: "swim" as const, active: activeSessionIndex === 0, completed: false },
    { sport: "bike" as const, active: activeSessionIndex === 1, completed: true },
    { sport: "run" as const, active: activeSessionIndex === 2, completed: false, missed: true },
    { sport: "run" as const, active: activeSessionIndex === 3, completed: true, missed: false },
  ]

  const activeSession = sessions.find((s) => s.active)
  const currentWorkout =
    activeSession?.sport === "swim"
      ? thursdaySwimWorkout
      : activeSession?.sport === "bike"
        ? thursdayBikeWorkout
        : activeSessionIndex === 3
          ? completedRunWorkout
          : runningWorkout

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 85) return "status-success"
    if (compliance >= 70) return "status-caution"
    if (compliance >= 55) return "status-alert"
    return "status-danger"
  }

  const overallCompliance = currentWorkout.isCompleted
    ? Math.min(currentWorkout.compliance.duration, currentWorkout.compliance.power)
    : 100

  const handleApplyChange = () => {
    setShowApply(false)
  }

  const handleSessionClick = (index: number) => {
    setActiveSessionIndex(index)
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      const noteIndex = userNotes.length
      setUserNotes([...userNotes, newNote.trim()])
      setSessionNotesTab(`note-${noteIndex}`)
      setNewNote("")
    }
  }

  const handleSaveReflection = () => {
    if (reflectionData.rpe || reflectionData.feeling || reflectionData.notes) {
      const newReflection = {
        id: `reflection-${Date.now()}`,
        ...reflectionData,
        date: new Date().toLocaleDateString(),
      }
      setReflections([...reflections, newReflection])
      setReflectionData({
        rpe: null,
        feeling: "",
        notes: "",
        issues: "",
        actualFuel: "",
      })
      setShowReflectionForm(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-text-1">Training</h1>
        <p className="text-text-2">Daily workout sessions and performance tracking</p>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 text-text-2 hover:text-text-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Calendar</span>
        </button>

        <div className="flex items-center gap-4">
          <button className="p-1 text-text-3 hover:text-text-2 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-text-1 font-medium">Thu, Sep 5</span>
          <button className="p-1 text-text-3 hover:text-text-2 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          {sessions.map((session, index) => {
            const IconComponent = sportIcons[session.sport]
            return (
              <button
                key={index}
                onClick={() => handleSessionClick(index)}
                className={cn(
                  "w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm transition-colors relative",
                  session.active
                    ? `${sportColors[session.sport]} bg-bg-2`
                    : "border-border-1 text-text-3 hover:text-text-2",
                )}
              >
                <IconComponent className="w-4 h-4" />
                {session.completed && (
                  <div
                    className={cn(
                      "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-bg-app shadow-lg",
                      session.missed
                        ? "border-status-danger bg-status-danger text-white"
                        : session.compliance && session.compliance.duration >= 85
                          ? "border-status-success bg-status-success text-white"
                          : session.compliance && session.compliance.duration < 85
                            ? "border-status-caution bg-status-caution text-white"
                            : "border-status-success bg-status-success text-white"
                    )}
                  >
                    {session.missed ? (
                      <X className="w-2.5 h-2.5" />
                    ) : (
                      <Check className="w-2.5 h-2.5" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main workout card */}
      <div
        className={cn(
          "bg-bg-surface border rounded-lg overflow-hidden",
          currentWorkout.isMissed
            ? "border-status-danger"
            : currentWorkout.isCompleted
              ? overallCompliance >= 85
                ? "border-status-success"
                : "border-status-caution"
              : "border-border-weak",
        )}
      >
        {/* Card header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-lg border-2 transition-colors",
                  currentWorkout.sport === "swim" && "bg-sport-swim/10 border-sport-swim text-sport-swim",
                  currentWorkout.sport === "bike" && "bg-sport-bike/10 border-sport-bike text-sport-bike",
                  currentWorkout.sport === "run" && "bg-sport-run/10 border-sport-run text-sport-run",
                )}
              >
                {(() => {
                  const IconComponent = sportIcons[currentWorkout.sport]
                  return <IconComponent className="w-6 h-6" />
                })()}
              </div>
              <div>
                <h2 className="text-text-1 text-xl font-semibold">{currentWorkout.title}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-text-2 text-sm">
                    {currentWorkout.isCompleted
                      ? currentWorkout.completedAt
                      : currentWorkout.sport === "run"
                        ? `${currentWorkout.distance} • ${currentWorkout.pace}`
                        : `Duration ${currentWorkout.duration}`}
                  </span>
                  <div className="flex items-center gap-2">
                    {currentWorkout.isCompleted && currentWorkout.tss && (
                      <span className="badge badge-critical">
                        {currentWorkout.load || currentWorkout.tss}
                      </span>
                    )}
                    {!currentWorkout.isCompleted && (
                      <span className="badge badge-critical">285</span>
                    )}
                    <span className="badge">
                      {currentWorkout.isCompleted ? "Completed" : currentWorkout.isMissed ? "Missed" : "Threshold"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {!currentWorkout.isCompleted && (
              <button className="btn focus-ring">
                <Send className="w-4 h-4 text-text-2" />
              </button>
            )}
          </div>

          <div className="mb-6">
            <IntensityBar segments={currentWorkout.segments} isCompleted={currentWorkout.isCompleted} />
          </div>

          {currentWorkout.isCompleted && (
            <div className="mb-8">
              {/* Workout Details section */}
              <div className="mb-8">
                <div className="grid grid-cols-4 gap-6 bg-bg-surface border border-border-weak rounded-lg p-6">
                  {/* Planned Time Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-dim" />
                      <h5 className="text-text-1 font-medium text-sm">Time</h5>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-lg font-semibold text-text-1">90:00</div>
                        <div className="text-xs text-text-3">Planned</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-text-1">1:35:42</div>
                        <div className="text-xs text-text-3">Completed</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-status-success">95%</span>
                        </div>
                        <div className="relative h-2 bg-gray-600/30 rounded overflow-hidden">
                          <div className="absolute inset-0 bg-gray-600/10 rounded" />
                          <div
                            className="relative h-full transition-all duration-500 bg-status-success rounded"
                            style={{ width: "95%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Power Metrics Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-text-dim" />
                      <h5 className="text-text-1 font-medium text-sm">Power</h5>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-lg font-semibold text-text-1">280W</div>
                        <div className="text-xs text-text-3">Target</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-text-1">245W</div>
                        <div className="text-xs text-text-3">Average</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-status-caution">65%</span>
                        </div>
                        <div className="relative h-2 bg-gray-600/30 rounded overflow-hidden">
                          <div className="absolute inset-0 bg-gray-600/10 rounded" />
                          <div
                            className="relative h-full transition-all duration-500 bg-status-caution rounded"
                            style={{ width: "65%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Distance Metrics Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-text-dim" />
                      <h5 className="text-text-1 font-medium text-sm">Distance</h5>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-lg font-semibold text-text-1">42.5km</div>
                        <div className="text-xs text-text-3">Distance</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-text-1">26.7 km/h</div>
                        <div className="text-xs text-text-3">Avg Speed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-text-1">425m</div>
                        <div className="text-xs text-text-3">Elevation</div>
                      </div>
                    </div>
                  </div>

                  {/* Heart Rate and Cadence Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-text-dim" />
                      <h5 className="text-text-1 font-medium text-sm">HR &amp; Cadence</h5>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-lg font-semibold text-text-1">142 bpm</div>
                        <div className="text-xs text-text-3">Avg HR</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-text-1">87 rpm</div>
                        <div className="text-xs text-text-3">Cadence</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-text-1">1,247</div>
                        <div className="text-xs text-text-3">Calories</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone Analysis section */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-text-1 font-medium text-lg">Zone Analysis</h3>
                <div className="flex bg-bg-2 rounded-lg p-1 border border-border-weak">
                  <button
                    onClick={() => setZoneAnalysisTab("power")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
                      zoneAnalysisTab === "power"
                        ? "text-text-1 bg-bg-surface border-2 border-brand"
                        : "text-text-3 hover:text-text-2 bg-bg-surface hover:bg-bg-1 border border-transparent",
                    )}
                  >
                    Power
                  </button>
                  <button
                    onClick={() => setZoneAnalysisTab("hr")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
                      zoneAnalysisTab === "hr"
                        ? "text-text-1 bg-bg-surface border-2 border-brand"
                        : "text-text-3 hover:text-text-2 bg-bg-surface hover:bg-bg-1 border border-transparent",
                    )}
                  >
                    HR
                  </button>
                </div>
              </div>
              <div className="border border-border-weak rounded-lg p-6 bg-bg-surface">
                {zoneAnalysisTab === "power" ? (
                  <ZoneComparisonBars zones={currentWorkout.actualZones} />
                ) : (
                  <ZoneComparisonBars zones={currentWorkout.actualHRZones} />
                )}
              </div>
            </div>
          )}

          {!currentWorkout.isCompleted && showApply && (
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between p-4 bg-bg-2 rounded-lg border border-border-1">
                <div className="flex items-center gap-2 text-status-danger">
                  <div className="w-2 h-2 rounded-full bg-status-danger" />
                  <span className="text-sm">Capacity suggests downgrade</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn text-sm">
                    Preview change
                  </button>
                  <button
                    onClick={handleApplyChange}
                    className="btn btn-primary text-sm"
                  >
                    Apply change
                  </button>
                </div>
              </div>
            </div>
          )}

          {!currentWorkout.isCompleted && (
            <div className="space-y-6">
              <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Workout Overview */}
                  <div className="space-y-4">
                    <h3 className="text-text-1 font-medium text-lg">Workout Overview</h3>
                    <div className="bg-bg-raised border border-border-weak rounded-lg p-4">
                      <div className="space-y-3 text-text-2 text-sm leading-relaxed">
                        {currentWorkout.workoutOverview.split("\n").map((line, index) => (
                          <div key={index} className="flex items-start">
                            <span className="text-text-3 mr-2">•</span>
                            <span>{line.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Session Notes & Fueling Guidelines */}
                  <div className="space-y-4">
                    {/* Session Notes */}
                    <div>
                      <h3 className="text-text-1 font-medium text-lg mb-3">Session Notes</h3>
                      <div className="bg-bg-raised border border-border-weak rounded-lg p-4">
                        <p className="text-text-2 text-sm leading-relaxed">{currentWorkout.sessionNote}</p>
                      </div>
                    </div>

                    {/* Fueling Guidelines */}
                    <div>
                      <h3 className="text-text-1 font-medium text-lg mb-3">Fueling Guidelines</h3>
                      <div className="bg-bg-raised border border-border-weak rounded-lg p-4 space-y-4">
                        {/* Quick Guide */}
                        <div className="space-y-3">
                          <div className="text-text-2 text-sm">
                            <span className="font-medium">During:</span>{" "}
                            {currentWorkout.sport === "swim"
                              ? "Sports drink or diluted electrolyte solution"
                              : currentWorkout.sport === "run"
                                ? "Water sufficient for 45min session"
                                : "30-60 g carbs/h, 500-800 mg Na/L"}
                          </div>

                          {/* Quick action buttons */}
                          <div className="flex flex-wrap gap-2">
                            <span className="chip chip-zone-z4">
                              60-90g carbs/h
                            </span>
                            <span className="chip chip-zone-z2">
                              500-800ml fluid/h
                            </span>
                            <span className="chip chip-zone-z3">
                              300-700mg sodium/h
                            </span>
                          </div>

                          <div className="text-xs text-text-3">Guidance adapts to your zones when connected.</div>
                        </div>

                        {/* Expandable Details */}
                        <div className="border-t border-border-weak pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-text-1 font-medium text-sm">Detailed Guidelines</h4>
                            <button
                              onClick={() => setShowFuelingDetails(!showFuelingDetails)}
                              className="text-text-3 hover:text-text-2 transition-colors"
                            >
                              <ChevronRight
                                className={cn("w-4 h-4 transition-transform", showFuelingDetails && "rotate-90")}
                              />
                            </button>
                          </div>

                          {showFuelingDetails && (
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-text-1 font-medium text-xs mb-1">Pre-Workout</h5>
                                <p className="text-text-2 text-xs leading-relaxed">
                                  {currentWorkout.fuelingGuidelines?.preworkout}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-text-1 font-medium text-xs mb-1">During Workout</h5>
                                <p className="text-text-2 text-xs leading-relaxed">
                                  {currentWorkout.fuelingGuidelines?.during}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-text-1 font-medium text-xs mb-1">Post-Workout</h5>
                                <p className="text-text-2 text-xs leading-relaxed">
                                  {currentWorkout.fuelingGuidelines?.postworkout}
                                </p>
                              </div>
                            </div>
                          )}

                          {!showFuelingDetails && (
                            <p className="text-text-3 text-xs">
                              Click to view detailed pre, during, and post-workout nutrition guidance.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone Targets section */}
              <div className="px-6 pb-6 border-t border-border-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-text-1 font-medium">Zone Targets</h3>
                  <button
                    onClick={() => setShowZoneTable(!showZoneTable)}
                    className="text-text-3 hover:text-text-2 transition-colors"
                  >
                    <ChevronRight className={cn("w-4 h-4 transition-transform", showZoneTable && "rotate-90")} />
                  </button>
                </div>
                {showZoneTable && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border-1">
                          <th className="text-left py-3 text-text-2 text-sm font-medium">Zone</th>
                          <th className="text-left py-3 text-text-2 text-sm font-medium">Target Pace</th>
                          <th className="text-left py-3 text-text-2 text-sm font-medium">Target Power</th>
                          <th className="text-right py-3 text-text-2 text-sm font-medium">Planned Minutes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border-1">
                          <td className="py-3 text-text-1 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-zone-1" />
                              Z1
                            </div>
                          </td>
                          <td className="py-3 text-text-2 text-sm">
                            {currentWorkout.sport === "swim" ? "2:10-2:20" : "Easy"}
                          </td>
                          <td className="py-3 text-text-2 text-sm">
                            {currentWorkout.sport === "bike" ? "200-250W" : "N/A"}
                          </td>
                          <td className="py-3 text-text-2 text-sm text-right">
                            {currentWorkout.sport === "swim"
                              ? "25:00"
                              : currentWorkout.sport === "bike"
                                ? "40:00"
                                : "19:00"}
                          </td>
                        </tr>
                        <tr className="border-b border-border-1">
                          <td className="py-3 text-text-1 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-zone-2" />
                              Z2
                            </div>
                          </td>
                          <td className="py-3 text-text-2 text-sm">
                            {currentWorkout.sport === "swim" ? "2:00-2:10" : "Aerobic"}
                          </td>
                          <td className="py-3 text-text-2 text-sm">
                            {currentWorkout.sport === "bike" ? "250-285W" : "N/A"}
                          </td>
                          <td className="py-3 text-text-2 text-sm text-right">
                            {currentWorkout.sport === "swim"
                              ? "15:00"
                              : currentWorkout.sport === "bike"
                                ? "30:00"
                                : "0:00"}
                          </td>
                        </tr>
                        <tr className="border-b border-border-1">
                          <td className="py-3 text-text-1 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-zone-3" />
                              Z3
                            </div>
                          </td>
                          <td className="py-3 text-text-2 text-sm">
                            {currentWorkout.sport === "swim"
                              ? "1:50-2:00"
                              : currentWorkout.sport === "run"
                                ? "4:30-4:45"
                                : "Tempo"}
                          </td>
                          <td className="py-3 text-text-2 text-sm">
                            {currentWorkout.sport === "bike" ? "285-320W" : "N/A"}
                          </td>
                          <td className="py-3 text-text-2 text-sm text-right">
                            {currentWorkout.sport === "run"
                              ? "20:00"
                              : currentWorkout.sport === "bike"
                                ? "0:00"
                                : "0:00"}
                          </td>
                        </tr>
                        <tr className="border-b border-border-1">
                          <td className="py-3 text-text-1 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-zone-4" />
                              Z4
                            </div>
                          </td>
                          <td className="py-3 text-text-2 text-sm">
                            {currentWorkout.sport === "swim"
                              ? "1:45-1:55"
                              : currentWorkout.sport === "run"
                                ? "4:15-4:30"
                                : "Threshold"}
                          </td>
                          <td className="py-3 text-text-2 text-sm">
                            {currentWorkout.sport === "bike" ? "320-360W" : "N/A"}
                          </td>
                          <td className="py-3 text-text-2 text-sm text-right">
                            {currentWorkout.sport === "swim"
                              ? "35:00"
                              : currentWorkout.sport === "run"
                                ? "6:00"
                                : "0:00"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 text-text-1 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-zone-5" />
                              Z5
                            </div>
                          </td>
                          <td className="py-3 text-text-2 text-sm">
                            {currentWorkout.sport === "swim"
                              ? "1:40-1:50"
                              : currentWorkout.sport === "bike"
                                ? "Max"
                                : "VO2 Max"}
                          </td>
                          <td className="py-3 text-text-2 text-sm">
                            {currentWorkout.sport === "bike" ? "360W+" : "N/A"}
                          </td>
                          <td className="py-3 text-text-2 text-sm text-right">
                            {currentWorkout.sport === "bike" ? "20:00" : "0:00"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab navigation for completed workouts */}
          {currentWorkout.isCompleted && (
            <div className="bg-bg-1 rounded-2xl border border-border-1">
              <div className="border-b border-border-1">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("graphs")}
                    className={cn(
                      "flex-1 px-6 py-4 text-sm font-medium transition-colors relative",
                      activeTab === "graphs" ? "text-text-1 bg-bg-1" : "text-text-3 hover:text-text-2 bg-bg-surface",
                    )}
                  >
                    Performance
                    {activeTab === "graphs" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-status-success" />}
                  </button>
                  <button
                    onClick={() => setActiveTab("splits")}
                    className={cn(
                      "flex-1 px-6 py-4 text-sm font-medium transition-colors relative",
                      activeTab === "splits" ? "text-text-1 bg-bg-1" : "text-text-3 hover:text-text-2 bg-bg-surface",
                    )}
                  >
                    Splits
                    {activeTab === "splits" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-status-success" />}
                  </button>
                  <button
                    onClick={() => setActiveTab("stats")}
                    className={cn(
                      "flex-1 px-6 py-4 text-sm font-medium transition-colors relative",
                      activeTab === "stats" ? "text-text-1 bg-bg-1" : "text-text-3 hover:text-text-2 bg-bg-surface",
                    )}
                  >
                    Stats
                    {activeTab === "stats" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-status-success" />}
                  </button>
                  <button
                    onClick={() => setActiveTab("notes")}
                    className={cn(
                      "flex-1 px-6 py-4 text-sm font-medium transition-colors relative",
                      activeTab === "notes" ? "text-text-1 bg-bg-1" : "text-text-3 hover:text-text-2 bg-bg-surface",
                    )}
                  >
                    Reflection
                    {activeTab === "notes" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-status-success" />}
                  </button>
                </div>
              </div>

              {/* Tab content */}
              <div className="p-6">
                {activeTab === "graphs" && <WorkoutGraph />}
                {activeTab === "splits" && <WorkoutSplits />}
                {activeTab === "stats" && <WorkoutStats />}
                {activeTab === "notes" && (
                  <div className="space-y-6">
                    {/* Notes navigation */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setSessionNotesTab("auto")}
                        className={cn(
                          "px-3 py-2 text-sm rounded-lg transition-colors",
                          sessionNotesTab === "auto"
                            ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                            : "bg-bg-2 text-text-2 hover:text-text-1 border border-border-1",
                        )}
                      >
                        Auto Summary
                      </button>
                      {userNotes.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSessionNotesTab(`note-${index}`)}
                          className={cn(
                            "px-3 py-2 text-sm rounded-lg transition-colors",
                            sessionNotesTab === `note-${index}`
                              ? "bg-zone-1/20 text-zone-1 border border-zone-1/30"
                              : "bg-bg-2 text-text-2 hover:text-text-1 border border-border-1",
                          )}
                        >
                          Note {index + 1}
                        </button>
                      ))}
                      {reflections.map((reflection, index) => (
                        <button
                          key={reflection.id}
                          onClick={() => setSessionNotesTab(reflection.id)}
                          className={cn(
                            "px-3 py-2 text-sm rounded-lg transition-colors",
                            sessionNotesTab === reflection.id
                              ? "bg-zone-3/20 text-zone-3 border border-zone-3/30"
                              : "bg-bg-2 text-text-2 hover:text-text-1 border border-border-1",
                          )}
                        >
                          Reflection {index + 1}
                        </button>
                      ))}
                    </div>

                    {/* Notes content */}
                    <div className="space-y-4">
                      {sessionNotesTab === "auto" ? (
                        <div className="bg-bg-2 rounded-lg p-4 border border-border-1">
                          <h4 className="text-text-1 font-medium mb-3">Workout Summary</h4>
                          <p className="text-text-2 text-sm leading-relaxed">
                            Excellent bike session completed with strong duration compliance (95%) and fair power
                            compliance (65%). The workout consisted of a solid endurance ride with good power
                            consistency throughout the main set. Heart rate remained well within target zones,
                            indicating proper pacing and effort distribution. Total training stress score of 142
                            reflects a moderate to high intensity session that will contribute positively to fitness
                            adaptations.
                          </p>
                        </div>
                      ) : sessionNotesTab.startsWith("note-") ? (
                        <div className="bg-bg-2 rounded-lg p-4 border border-border-1">
                          <h4 className="text-text-1 font-medium mb-3">
                            User Note {Number.parseInt(sessionNotesTab.split("-")[1]) + 1}
                          </h4>
                          <p className="text-text-2 text-sm leading-relaxed">
                            {userNotes[Number.parseInt(sessionNotesTab.split("-")[1])]}
                          </p>
                        </div>
                      ) : (
                        (() => {
                          const reflection = reflections.find((r) => r.id === sessionNotesTab)
                          return reflection ? (
                            <div className="bg-bg-2 rounded-lg p-4 border border-border-1">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-text-1 font-medium">Workout Reflection</h4>
                                <span className="text-text-3 text-xs">{reflection.date}</span>
                              </div>
                              <div className="space-y-3">
                                {reflection.rpe && (
                                  <div>
                                    <span className="text-text-2 text-sm font-medium">RPE: </span>
                                    <span className="inline-flex items-center justify-center w-6 h-6 text-zone-3 text-xs rounded-full font-medium border border-zone-3/40" style={{ backgroundColor: 'rgba(var(--zone-3) r g b / 0.2)' }}>
                                      {reflection.rpe}
                                    </span>
                                  </div>
                                )}
                                {reflection.feeling && (
                                  <div>
                                    <span className="text-text-2 text-sm font-medium">Feeling: </span>
                                    <span className="text-text-1 text-sm">{reflection.feeling}</span>
                                  </div>
                                )}
                                {reflection.notes && (
                                  <div>
                                    <span className="text-text-2 text-sm font-medium">Notes: </span>
                                    <p className="text-text-1 text-sm leading-relaxed mt-1">{reflection.notes}</p>
                                  </div>
                                )}
                                {reflection.issues && (
                                  <div>
                                    <span className="text-text-2 text-sm font-medium">Issues: </span>
                                    <p className="text-text-1 text-sm leading-relaxed mt-1">{reflection.issues}</p>
                                  </div>
                                )}
                                {reflection.actualFuel && (
                                  <div>
                                    <span className="text-text-2 text-sm font-medium">Fuel Used: </span>
                                    <span className="text-text-1 text-sm">{reflection.actualFuel}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null
                        })()
                      )}
                    </div>

                    {!showReflectionForm ? (
                      <div className="border-t border-border-1 pt-6">
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowReflectionForm(true)}
                            className="btn btn-primary text-sm"
                          >
                            Add Reflection
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-border-1 pt-6">
                        <h4 className="text-text-1 font-medium mb-4">Workout Reflection</h4>
                        <div className="space-y-4">
                          {/* RPE Pills */}
                          <div>
                            <label className="block text-sm font-medium text-text-1 mb-2">
                              Rate of Perceived Exertion (RPE)
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                                <button
                                  key={rpe}
                                  onClick={() => setReflectionData((prev) => ({ ...prev, rpe }))}
                                  className={cn(
                                    "w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors",
                                    reflectionData.rpe === rpe
                                      ? "border-zone-3 bg-zone-3 text-white"
                                      : "border-border-weak text-text-2 hover:border-zone-3 hover:text-zone-3",
                                  )}
                                >
                                  {rpe}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Feelings */}
                          <div>
                            <label className="block text-sm font-medium text-text-1 mb-2">How did you feel?</label>
                            <div className="flex gap-2">
                              {["Great", "Good", "Tough"].map((feeling) => (
                                <button
                                  key={feeling}
                                  onClick={() => setReflectionData((prev) => ({ ...prev, feeling }))}
                                  className={cn(
                                    "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                                    reflectionData.feeling === feeling
                                      ? "border-zone-3 bg-zone-3 text-white"
                                      : "border-border-weak text-text-2 hover:border-zone-3 hover:text-zone-3",
                                  )}
                                >
                                  {feeling}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="block text-sm font-medium text-text-1 mb-2">Notes</label>
                            <textarea
                              value={reflectionData.notes}
                              onChange={(e) => setReflectionData((prev) => ({ ...prev, notes: e.target.value }))}
                              placeholder="How did the workout go? Any observations..."
                              className="w-full p-3 bg-bg-2 border border-border-1 rounded-lg text-text-1 placeholder-text-3 resize-none focus:outline-none focus:border-zone-3"
                              rows={3}
                            />
                          </div>

                          {/* Issues */}
                          <div>
                            <label className="block text-sm font-medium text-text-1 mb-2">Issues Encountered</label>
                            <textarea
                              value={reflectionData.issues}
                              onChange={(e) => setReflectionData((prev) => ({ ...prev, issues: e.target.value }))}
                              placeholder="Any problems, equipment issues, or concerns..."
                              className="w-full p-3 bg-bg-2 border border-border-1 rounded-lg text-text-1 placeholder-text-3 resize-none focus:outline-none focus:border-zone-3"
                              rows={2}
                            />
                          </div>

                          {/* Actual Fuel Used */}
                          <div>
                            <label className="block text-sm font-medium text-text-1 mb-2">Actual Fuel Used</label>
                            <input
                              type="text"
                              value={reflectionData.actualFuel}
                              onChange={(e) => setReflectionData((prev) => ({ ...prev, actualFuel: e.target.value }))}
                              placeholder="e.g., 2 gels, 500ml sports drink..."
                              className="w-full p-3 bg-bg-2 border border-border-1 rounded-lg text-text-1 placeholder-text-3 focus:outline-none focus:border-zone-3"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={handleSaveReflection}
                              className="btn btn-primary"
                            >
                              Save Reflection
                            </button>
                            <button
                              onClick={() => setShowReflectionForm(false)}
                              className="btn"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add new note */}
                    <div className="border-t border-border-1 pt-6">
                      <h4 className="text-text-1 font-medium mb-3">Add Note</h4>
                      <div className="flex gap-3">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add your thoughts about this workout..."
                          className="flex-1 bg-bg-2 border border-border-1 rounded-lg px-3 py-2 text-text-1 text-sm placeholder:text-text-3 resize-none focus:outline-none focus:ring-2 focus:ring-zone-1/50 focus:border-zone-1"
                          rows={3}
                        />
                        <button
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed self-start"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
