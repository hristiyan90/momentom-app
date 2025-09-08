"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import {
  Info,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Waves,
  Bike,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Footprints,
} from "lucide-react"

interface Zone {
  id: string
  name: string
  min: number
  max: number
  color: string
  description: string
}

interface SportZones {
  threshold: number
  unit: string
  zones: Zone[]
}

export default function ZonesPage() {
  const [activeTab, setActiveTab] = useState<"swim" | "bike" | "run" | "hr">("bike")
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const [isTestLogExpanded, setIsTestLogExpanded] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1M" | "3M" | "6M" | "1Y" | "MAX">("6M")

  const [zonesData, setZonesData] = useState<Record<string, SportZones>>({
    swim: {
      threshold: 75,
      unit: "CSS (s/100m)",
      zones: [
        { id: "1", name: "Z1 Recovery", min: 0, max: 65, color: "#22D3EE", description: "Active recovery pace" },
        { id: "2", name: "Z2 Aerobic", min: 65, max: 75, color: "#3B82F6", description: "Aerobic base building" },
        { id: "3", name: "Z3 Tempo", min: 75, max: 85, color: "#8B5CF6", description: "Tempo/threshold pace" },
        { id: "4", name: "Z4 Threshold", min: 85, max: 95, color: "#EC4899", description: "Lactate threshold" },
        { id: "5", name: "Z5 VO2Max", min: 95, max: 110, color: "#EF4444", description: "VO2 max intervals" },
      ],
    },
    bike: {
      threshold: 285,
      unit: "FTP (watts)",
      zones: [
        { id: "1", name: "Z1 Recovery", min: 0, max: 55, color: "#22D3EE", description: "Active recovery" },
        { id: "2", name: "Z2 Endurance", min: 55, max: 75, color: "#3B82F6", description: "Aerobic base" },
        { id: "3", name: "Z3 Tempo", min: 75, max: 90, color: "#8B5CF6", description: "Tempo efforts" },
        { id: "4", name: "Z4 Threshold", min: 90, max: 105, color: "#EC4899", description: "Lactate threshold" },
        { id: "5", name: "Z5 VO2Max", min: 105, max: 120, color: "#EF4444", description: "VO2 max power" },
      ],
    },
    run: {
      threshold: 255,
      unit: "Threshold (s/km)",
      zones: [
        { id: "1", name: "Z1 Recovery", min: 0, max: 85, color: "#22D3EE", description: "Easy recovery runs" },
        { id: "2", name: "Z2 Aerobic", min: 85, max: 95, color: "#3B82F6", description: "Aerobic base pace" },
        { id: "3", name: "Z3 Tempo", min: 95, max: 100, color: "#8B5CF6", description: "Tempo run pace" },
        { id: "4", name: "Z4 Threshold", min: 100, max: 110, color: "#EC4899", description: "Lactate threshold" },
        { id: "5", name: "Z5 VO2Max", min: 110, max: 125, color: "#EF4444", description: "VO2 max intervals" },
      ],
    },
    hr: {
      threshold: 175,
      unit: "LTHR (bpm)",
      zones: [
        { id: "1", name: "Z1 Recovery", min: 0, max: 68, color: "#22D3EE", description: "Active recovery HR" },
        { id: "2", name: "Z2 Aerobic", min: 68, max: 83, color: "#3B82F6", description: "Aerobic base HR" },
        { id: "3", name: "Z3 Tempo", min: 83, max: 94, color: "#8B5CF6", description: "Tempo HR range" },
        { id: "4", name: "Z4 Threshold", min: 94, max: 105, color: "#EC4899", description: "Lactate threshold HR" },
        { id: "5", name: "Z5 VO2Max", min: 105, max: 120, color: "#EF4444", description: "VO2 max HR" },
      ],
    },
  })

  const tabs = [
    { id: "swim" as const, label: "Swim", icon: Waves, color: "text-cyan-400" },
    { id: "bike" as const, label: "Bike", icon: Bike, color: "text-orange-400" },
    { id: "run" as const, label: "Run", icon: Footprints, color: "text-green-400" },
    { id: "hr" as const, label: "Heart Rate", icon: Footprints, color: "text-red-400" },
  ]

  const currentData = zonesData[activeTab]

  const getThresholdStatus = (threshold: number, sport: string) => {
    const now = new Date()
    const lastTest = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
    const daysSinceTest = Math.floor((now.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceTest > 60) return { status: "stale", color: "text-red-400", icon: AlertTriangle }
    if (daysSinceTest > 30) return { status: "warning", color: "text-yellow-400", icon: AlertTriangle }
    return { status: "current", color: "text-green-400", icon: CheckCircle }
  }

  const updateThreshold = (newThreshold: number) => {
    setZonesData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        threshold: newThreshold,
      },
    }))
  }

  const addZone = () => {
    const newZone: Zone = {
      id: Date.now().toString(),
      name: `Z${currentData.zones.length + 1} New Zone`,
      min: currentData.zones[currentData.zones.length - 1]?.max || 0,
      max: (currentData.zones[currentData.zones.length - 1]?.max || 0) + 10,
      color: "#6b7280",
      description: "New zone description",
    }

    setZonesData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        zones: [...prev[activeTab].zones, newZone],
      },
    }))
  }

  const deleteZone = (zoneId: string) => {
    setZonesData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        zones: prev[activeTab].zones.filter((zone) => zone.id !== zoneId),
      },
    }))
  }

  const testHistory = [
    {
      id: "1",
      date: "2024-01-15",
      time: "09:30",
      sport: "bike",
      testType: "20min FTP Test",
      thresholdValue: 285,
      unit: "watts",
      notes: "Felt strong, good conditions",
    },
    {
      id: "2",
      date: "2023-12-10",
      time: "07:45",
      sport: "run",
      testType: "30min Threshold Test",
      thresholdValue: 255,
      unit: "s/km",
      notes: "Slightly windy conditions",
    },
    {
      id: "3",
      date: "2023-11-22",
      time: "18:15",
      sport: "swim",
      testType: "CSS T30 Test",
      thresholdValue: 75,
      unit: "s/100m",
      notes: "Pool was busy, lane sharing",
    },
    {
      id: "4",
      date: "2023-10-28",
      time: "10:00",
      sport: "hr",
      testType: "LTHR 30min Test",
      thresholdValue: 175,
      unit: "bpm",
      notes: "Perfect weather conditions",
    },
    {
      id: "5",
      date: "2023-09-15",
      time: "08:20",
      sport: "bike",
      testType: "Ramp Test",
      thresholdValue: 278,
      unit: "watts",
      notes: "Previous test showed improvement",
    },
    {
      id: "6",
      date: "2023-08-10",
      time: "07:30",
      sport: "swim",
      testType: "CSS T30 Test",
      thresholdValue: 78,
      unit: "s/100m",
      notes: "Good pool conditions, felt strong",
    },
    {
      id: "7",
      date: "2023-07-20",
      time: "06:45",
      sport: "run",
      testType: "5K Time Trial",
      thresholdValue: 260,
      unit: "s/km",
      notes: "Hot weather, challenging conditions",
    },
    {
      id: "8",
      date: "2023-06-15",
      time: "09:15",
      sport: "hr",
      testType: "Step Test",
      thresholdValue: 172,
      unit: "bpm",
      notes: "Lab test, very accurate results",
    },
  ]

  const filteredTestHistory = testHistory.filter((test) => test.sport === activeTab)

  const thresholdTrendData = {
    swim: {
      "6M": [
        { date: "2023-08-01", value: 83 },
        { date: "2023-09-01", value: 81 },
        { date: "2023-10-01", value: 79 },
        { date: "2023-11-01", value: 78 },
        { date: "2023-12-01", value: 76 },
        { date: "2024-01-01", value: 75 },
        { date: "2024-01-29", value: 75 },
      ],
      "1M": [
        { date: "2024-01-01", value: 74 },
        { date: "2024-01-08", value: 74 },
        { date: "2024-01-15", value: 75 },
        { date: "2024-01-22", value: 75 },
        { date: "2024-01-29", value: 75 },
      ],
      "3M": [
        { date: "2023-11-01", value: 78 },
        { date: "2023-11-15", value: 77 },
        { date: "2023-12-01", value: 76 },
        { date: "2023-12-15", value: 76 },
        { date: "2024-01-01", value: 74 },
        { date: "2024-01-15", value: 75 },
        { date: "2024-01-29", value: 75 },
      ],
      "1Y": [
        { date: "2023-02-01", value: 88 },
        { date: "2023-04-01", value: 86 },
        { date: "2023-06-01", value: 84 },
        { date: "2023-08-01", value: 82 },
        { date: "2023-10-01", value: 79 },
        { date: "2023-12-01", value: 76 },
        { date: "2024-01-29", value: 75 },
      ],
      MAX: [
        { date: "2022-01-01", value: 95 },
        { date: "2022-06-01", value: 92 },
        { date: "2022-12-01", value: 90 },
        { date: "2023-06-01", value: 84 },
        { date: "2023-12-01", value: 76 },
        { date: "2024-01-29", value: 75 },
      ],
    },
    bike: {
      "6M": [
        { date: "2023-08-01", value: 263 },
        { date: "2023-09-01", value: 268 },
        { date: "2023-10-01", value: 275 },
        { date: "2023-11-01", value: 278 },
        { date: "2023-12-01", value: 282 },
        { date: "2024-01-01", value: 285 },
        { date: "2024-01-29", value: 287 },
      ],
      "1M": [
        { date: "2024-01-01", value: 280 },
        { date: "2024-01-08", value: 282 },
        { date: "2024-01-15", value: 285 },
        { date: "2024-01-22", value: 285 },
        { date: "2024-01-29", value: 285 },
      ],
      "3M": [
        { date: "2023-11-01", value: 275 },
        { date: "2023-11-15", value: 276 },
        { date: "2023-12-01", value: 278 },
        { date: "2023-12-15", value: 280 },
        { date: "2024-01-01", value: 280 },
        { date: "2024-01-15", value: 285 },
        { date: "2024-01-29", value: 285 },
      ],
      "1Y": [
        { date: "2023-02-01", value: 245 },
        { date: "2023-04-01", value: 252 },
        { date: "2023-06-01", value: 258 },
        { date: "2023-08-01", value: 265 },
        { date: "2023-10-01", value: 272 },
        { date: "2023-12-01", value: 278 },
        { date: "2024-01-29", value: 285 },
      ],
      MAX: [
        { date: "2022-01-01", value: 220 },
        { date: "2022-06-01", value: 235 },
        { date: "2022-12-01", value: 240 },
        { date: "2023-06-01", value: 258 },
        { date: "2023-12-01", value: 278 },
        { date: "2024-01-29", value: 285 },
      ],
    },
    run: {
      "1M": [
        { date: "2024-01-01", value: 258 },
        { date: "2024-01-08", value: 256 },
        { date: "2024-01-15", value: 255 },
        { date: "2024-01-22", value: 255 },
        { date: "2024-01-29", value: 255 },
      ],
      "3M": [
        { date: "2023-11-01", value: 265 },
        { date: "2023-11-15", value: 262 },
        { date: "2023-12-01", value: 260 },
        { date: "2023-12-15", value: 258 },
        { date: "2024-01-01", value: 258 },
        { date: "2024-01-15", value: 255 },
        { date: "2024-01-29", value: 255 },
      ],
      "6M": [
        { date: "2023-08-01", value: 275 },
        { date: "2023-09-01", value: 272 },
        { date: "2023-10-01", value: 268 },
        { date: "2023-11-01", value: 265 },
        { date: "2023-12-01", value: 260 },
        { date: "2024-01-01", value: 258 },
        { date: "2024-01-29", value: 255 },
      ],
      "1Y": [
        { date: "2023-02-01", value: 290 },
        { date: "2023-04-01", value: 285 },
        { date: "2023-06-01", value: 280 },
        { date: "2023-08-01", value: 275 },
        { date: "2023-10-01", value: 268 },
        { date: "2023-12-01", value: 260 },
        { date: "2024-01-29", value: 255 },
      ],
      MAX: [
        { date: "2022-01-01", value: 320 },
        { date: "2022-06-01", value: 310 },
        { date: "2022-12-01", value: 300 },
        { date: "2023-06-01", value: 280 },
        { date: "2023-12-01", value: 260 },
        { date: "2024-01-29", value: 255 },
      ],
    },
    hr: {
      "1M": [
        { date: "2024-01-01", value: 174 },
        { date: "2024-01-08", value: 174 },
        { date: "2024-01-15", value: 175 },
        { date: "2024-01-22", value: 175 },
        { date: "2024-01-29", value: 175 },
      ],
      "3M": [
        { date: "2023-11-01", value: 172 },
        { date: "2023-11-15", value: 173 },
        { date: "2023-12-01", value: 173 },
        { date: "2023-12-15", value: 174 },
        { date: "2024-01-01", value: 174 },
        { date: "2024-01-15", value: 175 },
        { date: "2024-01-29", value: 175 },
      ],
      "6M": [
        { date: "2023-08-01", value: 168 },
        { date: "2023-09-01", value: 169 },
        { date: "2023-10-01", value: 170 },
        { date: "2023-11-01", value: 172 },
        { date: "2023-12-01", value: 173 },
        { date: "2024-01-01", value: 174 },
        { date: "2024-01-29", value: 175 },
      ],
      "1Y": [
        { date: "2023-02-01", value: 162 },
        { date: "2023-04-01", value: 164 },
        { date: "2023-06-01", value: 166 },
        { date: "2023-08-01", value: 168 },
        { date: "2023-10-01", value: 170 },
        { date: "2023-12-01", value: 173 },
        { date: "2024-01-29", value: 175 },
      ],
      MAX: [
        { date: "2022-01-01", value: 155 },
        { date: "2022-06-01", value: 158 },
        { date: "2022-12-01", value: 160 },
        { date: "2023-06-01", value: 166 },
        { date: "2023-12-01", value: 173 },
        { date: "2024-01-29", value: 175 },
      ],
    },
  }

  const ThresholdTrendGraph = ({ data }: { data: { date: string; value: number }[] }) => {
    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data.map((d) => d.value))
    const minValue = Math.min(...data.map((d) => d.value))
    const range = maxValue - minValue || 1
    const padding = range * 0.1

    const adjustedMax = maxValue + padding
    const adjustedMin = minValue - padding

    const width = 800
    const height = 200
    const chartPadding = { top: 20, right: 40, bottom: 40, left: 60 }

    const chartWidth = width - chartPadding.left - chartPadding.right
    const chartHeight = height - chartPadding.top - chartPadding.bottom

    const points = data.map((d, i) => ({
      x: chartPadding.left + (i / (data.length - 1)) * chartWidth,
      y: chartPadding.top + ((adjustedMax - d.value) / (adjustedMax - adjustedMin)) * chartHeight,
      value: d.value,
      date: d.date,
    }))

    const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    const areaData = `M ${chartPadding.left} ${height - chartPadding.bottom} L ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${chartPadding.left + chartWidth} ${height - chartPadding.bottom} Z`

    const isImproving = data.length > 1 && data[data.length - 1].value !== data[0].value
    const trendColor = isImproving
      ? activeTab === "swim" || activeTab === "run"
        ? data[data.length - 1].value < data[0].value
          ? "#10b981" // green for improvement (faster times)
          : "#ef4444" // red for decline (slower times)
        : data[data.length - 1].value > data[0].value
          ? "#10b981" // green for improvement (higher power/hr)
          : "#ef4444" // red for decline (lower power/hr)
      : "#6b7280" // gray for no change

    return (
      <div className="w-full">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${activeTab}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={chartPadding.left}
              y1={chartPadding.top + ratio * chartHeight}
              x2={chartPadding.left + chartWidth}
              y2={chartPadding.top + ratio * chartHeight}
              stroke="#374151"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}

          {/* Area fill */}
          <path d={areaData} fill={`url(#gradient-${activeTab})`} />

          {/* Trend line */}
          <path
            d={pathData}
            fill="none"
            stroke={trendColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={trendColor}
                stroke="#1f2937"
                strokeWidth="2"
                className="hover:r-6 transition-all cursor-pointer"
              />
              <title>{`${new Date(point.date).toLocaleDateString()}: ${point.value}${currentData.unit.includes("s/") ? "s" : currentData.unit.includes("watts") ? "W" : "bpm"}`}</title>
            </g>
          ))}

          {/* Y-axis labels */}
          {[adjustedMax, (adjustedMax + adjustedMin) / 2, adjustedMin].map((value, i) => (
            <text
              key={i}
              x={chartPadding.left - 10}
              y={chartPadding.top + (i * chartHeight) / 2 + 4}
              textAnchor="end"
              className="text-xs fill-gray-400"
            >
              {Math.round(value)}
            </text>
          ))}

          {/* X-axis labels */}
          {points
            .filter((_, i) => i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1)
            .map((point) => (
              <text
                key={point.date}
                x={point.x}
                y={height - chartPadding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-gray-400"
              >
                {new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </text>
            ))}
        </svg>
      </div>
    )
  }

  const thresholdStatus = getThresholdStatus(currentData.threshold, activeTab)
  const StatusIcon = thresholdStatus.icon

  return (
    <div className="space-y-6">
      <PageHeader title="Zone Management" description="Configure training zones and thresholds for all disciplines" />

      <div className="bg-bg-surface border border-border-weak rounded-lg shadow-lg">
        {/* Tab Navigation */}
        <div className="border-b border-border-weak">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? `border-cyan-400 ${tab.color}`
                      : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ""}`} />
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">Input Threshold Value</h3>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${thresholdStatus.color}`} />
                <span className={`text-sm font-medium ${thresholdStatus.color}`}>
                  {thresholdStatus.status === "current"
                    ? "Test Soon"
                    : thresholdStatus.status === "warning"
                      ? "Test Soon"
                      : "Test Overdue"}
                </span>
              </div>
            </div>

            <div className="bg-bg-raised border border-border-weak rounded-lg p-6">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current {currentData.unit}</label>
                  <input
                    type="number"
                    value={currentData.threshold}
                    onChange={(e) => updateThreshold(Number(e.target.value))}
                    className="w-32 px-3 py-2 bg-bg-app border border-border-weak rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Last tested: 45 days ago</p>
                  <p>Next test recommended: In 15 days</p>
                </div>
                <button className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors font-medium">
                  Update Zones
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">Threshold Progression</h3>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </div>
              <div className="flex items-center gap-1 bg-bg-raised border border-border-weak rounded-lg p-1">
                {(["1M", "3M", "6M", "1Y", "MAX"] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      selectedTimeframe === timeframe
                        ? "bg-cyan-600 text-white"
                        : "text-gray-400 hover:text-gray-200 hover:bg-bg-surface"
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-bg-raised border border-border-weak rounded-lg p-6">
              <ThresholdTrendGraph data={thresholdTrendData[activeTab]?.[selectedTimeframe] || []} />
              <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="text-green-400">↗ Improving</span>
                </span>
                <span>
                  Latest: {currentData.threshold}{" "}
                  {currentData.unit.includes("s/") ? "s" : currentData.unit.includes("watts") ? "W" : "bpm"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">Current Zones</h3>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </div>
              <button
                onClick={addZone}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Test Session
              </button>
            </div>

            <div className="bg-bg-raised border border-border-weak rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-bg-surface border-b border-border-weak">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Zone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Range (%)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actual Values</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.zones.map((zone, index) => {
                    const actualMin = Math.round((zone.min / 100) * currentData.threshold)
                    const actualMax = Math.round((zone.max / 100) * currentData.threshold)

                    return (
                      <tr key={zone.id} className="border-b border-border-weak hover:bg-bg-surface/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color }} />
                            <span className="font-medium text-white">Z{index + 1}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white">{zone.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-300">
                            {zone.min}% - {zone.max}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-300">
                            {activeTab === "swim" || activeTab === "run"
                              ? `${Math.floor(actualMin / 60)}:${(actualMin % 60).toString().padStart(2, "0")} - ${Math.floor(actualMax / 60)}:${(actualMax % 60).toString().padStart(2, "0")}`
                              : `${actualMin} - ${actualMax}${activeTab === "bike" ? "W" : "bpm"}`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-400 text-sm">{zone.description}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingZone(zone.id)}
                              className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {currentData.zones.length > 1 && (
                              <button
                                onClick={() => deleteZone(zone.id)}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8 bg-bg-raised border border-border-weak rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Testing Recommendations</h4>
            <div className="text-sm text-gray-300 space-y-2">
              {activeTab === "swim" && (
                <>
                  <p>
                    • <strong>CSS Test:</strong> 400m time trial or T30 test
                  </p>
                  <p>
                    • <strong>Frequency:</strong> Every 6-8 weeks
                  </p>
                  <p>
                    • <strong>Best conditions:</strong> Rested, pool conditions
                  </p>
                </>
              )}
              {activeTab === "bike" && (
                <>
                  <p>
                    • <strong>FTP Test:</strong> 20min or ramp test
                  </p>
                  <p>
                    • <strong>Frequency:</strong> Every 6-8 weeks
                  </p>
                  <p>
                    • <strong>Best conditions:</strong> Rested, controlled environment
                  </p>
                </>
              )}
              {activeTab === "run" && (
                <>
                  <p>
                    • <strong>Threshold Test:</strong> 30min time trial
                  </p>
                  <p>
                    • <strong>Frequency:</strong> Every 6-8 weeks
                  </p>
                  <p>
                    • <strong>Best conditions:</strong> Flat course, good weather
                  </p>
                </>
              )}
              {activeTab === "hr" && (
                <>
                  <p>
                    • <strong>LTHR Test:</strong> 30min time trial average HR
                  </p>
                  <p>
                    • <strong>Frequency:</strong> Every 8-12 weeks
                  </p>
                  <p>
                    • <strong>Best conditions:</strong> Rested, consistent effort
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="bg-bg-raised border border-border-weak rounded-lg">
            <button
              onClick={() => setIsTestLogExpanded(!isTestLogExpanded)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-surface/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-white">Threshold Test History</h4>
                <span className="text-sm text-gray-400">(2 tests)</span>
              </div>
              {isTestLogExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {isTestLogExpanded && (
              <div className="border-t border-border-weak p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">15/01/2024</span>
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">09:30</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-300 text-sm">20min FTP Test</span>
                      <span className="text-white font-medium">285 watts</span>
                    </div>
                    <span className="text-gray-400 text-sm">Felt strong, good conditions</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">15/09/2023</span>
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">08:20</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-300 text-sm">Ramp Test</span>
                      <span className="text-white font-medium">278 watts</span>
                    </div>
                    <span className="text-gray-400 text-sm">Previous test showed improvement</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
