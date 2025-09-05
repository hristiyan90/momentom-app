"use client"

import { PageHeader } from "@/components/page-header"
import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Trophy,
  Target,
  Activity,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle,
  Circle,
} from "lucide-react"

const mockData = {
  weeklySummary: {
    hours: { actual: 10.8, planned: 14 },
    tss: { actual: 420, planned: 560 },
    intensityMix: [
      { zone: "Z1", percentage: 45, color: "bg-cyan-400" },
      { zone: "Z2", percentage: 30, color: "bg-blue-400" },
      { zone: "Z3", percentage: 15, color: "bg-purple-400" },
      { zone: "Z4", percentage: 8, color: "bg-pink-400" },
      { zone: "Z5", percentage: 2, color: "bg-red-400" },
    ],
    compliance: 78,
  },
  sportLoad: {
    swim: { actual: 2.5, planned: 3.5 },
    bike: { actual: 5.8, planned: 7.0 },
    run: { actual: 2.5, planned: 3.5 },
  },
  weeklyCompliance: [
    { day: "Mon", status: "completed" },
    { day: "Tue", status: "completed" },
    { day: "Wed", status: "partial" },
    { day: "Thu", status: "missed" },
    { day: "Fri", status: "completed" },
    { day: "Sat", status: "upcoming" },
    { day: "Sun", status: "upcoming" },
  ],
  upcomingRace: {
    name: "Ironman Barcelona",
    priority: "A",
    date: "2024-10-06",
    daysUntil: 28,
    planProgress: 65,
    currentWeek: 10,
    totalWeeks: 16,
  },
  loadAndForm: {
    data: [
      { date: "Week 7", ctl: 65, atl: 58, form: 7, readiness: 85, projected: false },
      { date: "Week 8", ctl: 68, atl: 62, form: 6, readiness: 82, projected: false },
      { date: "Week 9", ctl: 72, atl: 65, form: 7, readiness: 87, projected: false },
      { date: "Week 10", ctl: 75, atl: 68, form: 7, readiness: 88, projected: false },
      { date: "Week 11", ctl: 78, atl: 72, form: 6, readiness: 84, projected: false },
      { date: "Week 12", ctl: 82, atl: 75, form: 7, readiness: 89, projected: false },
      { date: "Week 13", ctl: 85, atl: 78, form: 7, readiness: 90, projected: true },
      { date: "Week 14", ctl: 88, atl: 82, form: 6, readiness: 88, projected: true },
      { date: "Week 15", ctl: 85, atl: 75, form: 10, readiness: 92, projected: true },
      { date: "Week 16", ctl: 82, atl: 68, form: 14, readiness: 95, projected: true },
    ],
  },
  momentumSnapshot: {
    swim: {
      threshold: "CSS 85s/100m",
      trend: "up" as const,
      change: "+2s",
    },
    bike: {
      threshold: "FTP 285W",
      trend: "up" as const,
      change: "+12W",
    },
    run: {
      threshold: "Threshold 4:15/km",
      trend: "stable" as const,
      change: "0s",
    },
  },
  personalRecords: {
    swim: [
      { distance: "400m", time: "5:42", improvement: "+8s", date: "2024-08-15" },
      { distance: "1500m", time: "22:15", improvement: "+45s", date: "2024-07-22" },
      { distance: "3800m", time: "58:30", improvement: "+2:15", date: "2024-06-10" },
    ],
    bike: [
      { distance: "20km TT", time: "28:45", improvement: "+1:20", date: "2024-08-20" },
      { distance: "40km TT", time: "1:02:30", improvement: "+2:45", date: "2024-07-15" },
      { distance: "180km", time: "5:15:20", improvement: "+8:30", date: "2024-06-25" },
    ],
    run: [
      { distance: "5km", time: "19:45", improvement: "+25s", date: "2024-08-18" },
      { distance: "10km", time: "42:15", improvement: "+1:10", date: "2024-07-28" },
      { distance: "21.1km", time: "1:35:20", improvement: "+3:45", date: "2024-06-30" },
    ],
  },
  blockSummaries: [
    {
      phase: "Base Building",
      weeks: "1-8",
      status: "completed",
      hours: { actual: 112, planned: 120 },
      tss: { actual: 4480, planned: 4800 },
      compliance: 93,
      focus: "Aerobic development",
    },
    {
      phase: "Build Phase 1",
      weeks: "9-12",
      status: "in-progress",
      hours: { actual: 45, planned: 56 },
      tss: { actual: 1890, planned: 2240 },
      compliance: 84,
      focus: "Threshold & VO2max",
    },
    {
      phase: "Build Phase 2",
      weeks: "13-16",
      status: "upcoming",
      hours: { actual: 0, planned: 60 },
      tss: { actual: 0, planned: 2400 },
      compliance: 0,
      focus: "Race-specific intensity",
    },
    {
      phase: "Peak Phase",
      weeks: "17-18",
      status: "scheduled",
      hours: { actual: 0, planned: 24 },
      tss: { actual: 0, planned: 960 },
      compliance: 0,
      focus: "Race simulation & sharpening",
    },
    {
      phase: "Taper",
      weeks: "19-20",
      status: "scheduled",
      hours: { actual: 0, planned: 16 },
      tss: { actual: 0, planned: 480 },
      compliance: 0,
      focus: "Recovery & race preparation",
    },
    {
      phase: "Race Week",
      weeks: "21",
      status: "scheduled",
      hours: { actual: 0, planned: 6 },
      tss: { actual: 0, planned: 150 },
      compliance: 0,
      focus: "Activation & race day",
    },
  ],
}

export default function ProgressPage() {
  const [selectedWindow, setSelectedWindow] = useState<"3w" | "6w" | "12w">("6w")

  const getWindowData = () => {
    const windows = {
      "3w": mockData.loadAndForm.data.slice(-3),
      "6w": mockData.loadAndForm.data.slice(-6),
      "12w": mockData.loadAndForm.data,
    }
    return windows[selectedWindow]
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-400" />
      case "stable":
        return <Minus className="w-4 h-4 text-yellow-400" />
    }
  }

  const getSportColor = (sport: "swim" | "bike" | "run") => {
    const colors = {
      swim: "text-cyan-400 border-cyan-400",
      bike: "text-orange-400 border-orange-400",
      run: "text-pink-400 border-pink-400",
    }
    return colors[sport]
  }

  const getSportIcon = (sport: "swim" | "bike" | "run") => {
    const icons = {
      swim: "🏊‍♂️",
      bike: "🚴‍♂️",
      run: "🏃‍♂️",
    }
    return icons[sport]
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "partial":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case "missed":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "upcoming":
        return <Circle className="w-4 h-4 text-gray-400" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <>
      <PageHeader
        title="Progress"
        subtitle="High-level training analytics and performance tracking"
        actions={
          <button className="px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-150">
            Export Data
          </button>
        }
      />

      <div className="space-y-8">
        <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-text-1" />
            <h2 className="text-xl font-semibold text-text-1">Weekly Summary</h2>
            <span className="text-sm text-text-2">Current week vs plan</span>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {/* Total Hours */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-text-2">Total Hours</h3>
              <div className="text-2xl font-bold text-text-1">
                {mockData.weeklySummary.hours.actual}h / {mockData.weeklySummary.hours.planned}h
              </div>
              <div className="w-full bg-bg-raised rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{
                    width: `${(mockData.weeklySummary.hours.actual / mockData.weeklySummary.hours.planned) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Training Stress */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-text-2">Training Stress</h3>
              <div className="text-2xl font-bold text-text-1">
                {mockData.weeklySummary.tss.actual} / {mockData.weeklySummary.tss.planned} TSS
              </div>
              <div className="w-full bg-bg-raised rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{
                    width: `${(mockData.weeklySummary.tss.actual / mockData.weeklySummary.tss.planned) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Intensity Mix */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-text-2">Intensity Mix</h3>
              <div className="flex gap-1 h-6 rounded-full overflow-hidden">
                {mockData.weeklySummary.intensityMix.map((zone) => (
                  <div
                    key={zone.zone}
                    className={zone.color}
                    style={{ width: `${zone.percentage}%` }}
                    title={`${zone.zone}: ${zone.percentage}%`}
                  />
                ))}
              </div>
              <div className="flex gap-2 text-xs text-text-2">
                {mockData.weeklySummary.intensityMix.slice(0, 3).map((zone) => (
                  <span key={zone.zone}>
                    {zone.zone}: {zone.percentage}%
                  </span>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-text-2">Compliance</h3>
              <div className="text-2xl font-bold text-text-1">{mockData.weeklySummary.compliance}%</div>
              <div className="w-full bg-bg-raised rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    mockData.weeklySummary.compliance >= 90
                      ? "bg-green-500"
                      : mockData.weeklySummary.compliance >= 80
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${mockData.weeklySummary.compliance}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-text-1" />
              <h2 className="text-xl font-semibold text-text-1">6-Week Trend</h2>
              <div className="group relative">
                <Info className="w-4 h-4 text-text-2 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  CTL: Chronic Training Load (fitness) • ATL: Acute Training Load (fatigue) • Form: CTL - ATL
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {(["3w", "6w", "12w"] as const).map((window) => (
                <button
                  key={window}
                  onClick={() => setSelectedWindow(window)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedWindow === window
                      ? "bg-cyan-600 text-white"
                      : "bg-bg-raised text-text-2 hover:bg-bg-raised/80"
                  }`}
                >
                  {window.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Area with readiness markers */}
          <div className="h-64 bg-bg-raised rounded-lg p-4 relative">
            <svg className="w-full h-full">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgb(55, 65, 81)" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Readiness shaded band */}
              <polygon
                fill="rgba(34, 197, 94, 0.1)"
                points={getWindowData()
                  .map((d, i) => `${(i / (getWindowData().length - 1)) * 100}%,${100 - (d.readiness / 100) * 80}%`)
                  .concat(
                    getWindowData()
                      .reverse()
                      .map((d, i) => `${100 - (i / (getWindowData().length - 1)) * 100}%,100%`),
                  )
                  .join(" ")}
              />

              {/* CTL Line - Actual */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                points={getWindowData()
                  .filter((d) => !d.projected)
                  .map(
                    (d, i, arr) =>
                      `${(getWindowData().indexOf(d) / (getWindowData().length - 1)) * 100}%,${100 - (d.ctl / 100) * 80}%`,
                  )
                  .join(" ")}
              />

              {/* CTL Line - Projected */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
                points={getWindowData()
                  .filter((d) => d.projected)
                  .map(
                    (d, i, arr) =>
                      `${(getWindowData().indexOf(d) / (getWindowData().length - 1)) * 100}%,${100 - (d.ctl / 100) * 80}%`,
                  )
                  .join(" ")}
              />

              {/* ATL Line - Actual */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                points={getWindowData()
                  .filter((d) => !d.projected)
                  .map(
                    (d, i, arr) =>
                      `${(getWindowData().indexOf(d) / (getWindowData().length - 1)) * 100}%,${100 - (d.atl / 100) * 80}%`,
                  )
                  .join(" ")}
              />

              {/* ATL Line - Projected */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
                points={getWindowData()
                  .filter((d) => d.projected)
                  .map(
                    (d, i, arr) =>
                      `${(getWindowData().indexOf(d) / (getWindowData().length - 1)) * 100}%,${100 - (d.atl / 100) * 80}%`,
                  )
                  .join(" ")}
              />

              {/* Form Line - Actual */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                points={getWindowData()
                  .filter((d) => !d.projected)
                  .map(
                    (d, i, arr) =>
                      `${(getWindowData().indexOf(d) / (getWindowData().length - 1)) * 100}%,${100 - ((d.form + 20) / 40) * 80}%`,
                  )
                  .join(" ")}
              />

              {/* Form Line - Projected */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
                points={getWindowData()
                  .filter((d) => d.projected)
                  .map(
                    (d, i, arr) =>
                      `${(getWindowData().indexOf(d) / (getWindowData().length - 1)) * 100}%,${100 - ((d.form + 20) / 40) * 80}%`,
                  )
                  .join(" ")}
              />
            </svg>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-bg-app/90 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-0.5 bg-green-500"></div>
                <span className="text-text-2">CTL (Fitness)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-0.5 bg-yellow-500"></div>
                <span className="text-text-2">ATL (Fatigue)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-0.5 bg-cyan-500"></div>
                <span className="text-text-2">Form</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-2 bg-green-500/20 rounded"></div>
                <span className="text-text-2">Readiness</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-0.5 bg-gray-400"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, transparent, transparent 2px, #9ca3af 2px, #9ca3af 4px)",
                  }}
                ></div>
                <span className="text-text-2">Projected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-text-1" />
            <h2 className="text-xl font-semibold text-text-1">Load & Compliance by Sport</h2>
          </div>

          <div className="space-y-6">
            {/* Sport Load Bars */}
            <div className="space-y-4">
              {(["swim", "bike", "run"] as const).map((sport) => {
                const load = mockData.sportLoad[sport]
                const percentage = (load.actual / load.planned) * 100
                return (
                  <div key={sport} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSportIcon(sport)}</span>
                        <span className="font-medium text-text-1 capitalize">{sport}</span>
                      </div>
                      <span className="text-sm text-text-2">
                        {load.actual}h / {load.planned}h
                      </span>
                    </div>
                    <div className="w-full bg-bg-raised rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          sport === "swim" ? "bg-cyan-500" : sport === "bike" ? "bg-orange-500" : "bg-pink-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Weekly Compliance */}
            <div className="pt-4 border-t border-border-weak">
              <h3 className="text-sm font-medium text-text-2 mb-3">Weekly Compliance</h3>
              <div className="flex gap-2">
                {mockData.weeklyCompliance.map((day) => (
                  <div key={day.day} className="flex-1 text-center">
                    <div className="text-xs text-text-2 mb-1">{day.day}</div>
                    <div className="flex justify-center">{getComplianceIcon(day.status)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-text-1" />
              <h2 className="text-xl font-semibold text-text-1">Next Race</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text-1">{mockData.upcomingRace.name}</h3>
                <div className="flex items-center gap-2 text-sm text-text-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      mockData.upcomingRace.priority === "A"
                        ? "bg-red-600 text-white"
                        : mockData.upcomingRace.priority === "B"
                          ? "bg-yellow-600 text-white"
                          : "bg-green-600 text-white"
                    }`}
                  >
                    Priority {mockData.upcomingRace.priority}
                  </span>
                  <span>{mockData.upcomingRace.daysUntil} days</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-2">Plan Progress</span>
                  <span className="text-text-1">{mockData.upcomingRace.planProgress}% complete</span>
                </div>
                <div className="w-full bg-bg-raised rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full"
                    style={{ width: `${mockData.upcomingRace.planProgress}%` }}
                  />
                </div>
                <div className="text-xs text-text-2">
                  Week {mockData.upcomingRace.currentWeek} of {mockData.upcomingRace.totalWeeks}
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors">
                View Race Details
              </button>
            </div>
          </div>

          <div className="col-span-2 bg-bg-surface border border-border-weak rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-text-1" />
              <h2 className="text-xl font-semibold text-text-1">Momentum Snapshot</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {(["swim", "bike", "run"] as const).map((sport) => {
                const perf = mockData.momentumSnapshot[sport]
                return (
                  <div key={sport} className="text-center space-y-2">
                    <div className="text-2xl">{getSportIcon(sport)}</div>
                    <div className="text-sm text-text-2">{perf.threshold}</div>
                    <div className="flex items-center justify-center gap-2">
                      {getTrendIcon(perf.trend)}
                      <span
                        className={`text-sm font-medium ${
                          perf.trend === "up"
                            ? "text-green-400"
                            : perf.trend === "down"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {perf.change}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Personal Records section */}
        <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-text-1" />
            <h2 className="text-xl font-semibold text-text-1">Personal Records</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {(["swim", "bike", "run"] as const).map((sport) => (
              <div key={sport} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border-weak">
                  <span className="text-lg">{getSportIcon(sport)}</span>
                  <h3 className={`font-semibold capitalize ${getSportColor(sport)}`}>{sport}</h3>
                </div>
                <div className="space-y-3">
                  {mockData.personalRecords[sport].map((record, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-text-1">{record.distance}</span>
                        <span className="text-sm text-text-2">{record.time}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-green-400">{record.improvement}</span>
                        <span className="text-text-2">{record.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block Summaries section */}
        <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-text-1" />
            <h2 className="text-xl font-semibold text-text-1">Block Summaries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-weak">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-2">Phase</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-2">Weeks</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-2">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-2">Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-2">TSS</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-2">Compliance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-2">Focus</th>
                </tr>
              </thead>
              <tbody>
                {mockData.blockSummaries.map((block, index) => (
                  <tr key={index} className="border-b border-border-weak/50 hover:bg-bg-raised/50">
                    <td className="py-3 px-4 font-medium text-text-1">{block.phase}</td>
                    <td className="py-3 px-4 text-text-2">{block.weeks}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          block.status === "completed"
                            ? "bg-green-600 text-white"
                            : block.status === "in-progress"
                              ? "bg-yellow-600 text-white"
                              : block.status === "upcoming"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-600 text-white"
                        }`}
                      >
                        {block.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-2">
                      {block.hours.actual}h / {block.hours.planned}h
                    </td>
                    <td className="py-3 px-4 text-text-2">
                      {block.tss.actual} / {block.tss.planned}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            block.compliance >= 90
                              ? "text-green-400"
                              : block.compliance >= 80
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {block.compliance}%
                        </span>
                        <div className="w-16 bg-bg-raised rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              block.compliance >= 90
                                ? "bg-green-500"
                                : block.compliance >= 80
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${block.compliance}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-2">{block.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
