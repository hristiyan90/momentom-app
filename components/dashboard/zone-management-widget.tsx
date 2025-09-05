"use client"

import { useState } from "react"
import { Waves, Bike, Footprints, Heart, Plus, Edit2, Trash2, Info, Save, X } from "lucide-react"

interface Zone {
  id: string
  name: string
  min: number
  max: number
  description: string
  color: string
}

interface Threshold {
  value: number
  unit: string
  label: string
  lastUpdated: string
}

interface ZoneData {
  threshold: Threshold
  zones: Zone[]
}

const sportIcons = {
  swim: Waves,
  bike: Bike,
  run: Footprints,
  hr: Heart,
}

const sportColors = {
  swim: "var(--sport-swim)",
  bike: "var(--sport-bike)",
  run: "var(--sport-run)",
  hr: "var(--status-alert)",
}

const defaultZoneColors = [
  "var(--zone-1)", // Z1 - Cyan
  "var(--zone-2)", // Z2 - Blue
  "var(--zone-3)", // Z3 - Indigo
  "var(--zone-4)", // Z4 - Purple
  "var(--zone-5)", // Z5 - Pink
]

const mockZoneData: Record<string, ZoneData> = {
  swim: {
    threshold: {
      value: 1.45,
      unit: "/100m",
      label: "CSS (Critical Swim Speed)",
      lastUpdated: "2 weeks ago",
    },
    zones: [
      { id: "z1", name: "Z1", min: 1.55, max: 1.65, description: "Active Recovery", color: defaultZoneColors[0] },
      { id: "z2", name: "Z2", min: 1.48, max: 1.54, description: "Aerobic Base", color: defaultZoneColors[1] },
      { id: "z3", name: "Z3", min: 1.42, max: 1.47, description: "Tempo", color: defaultZoneColors[2] },
      { id: "z4", name: "Z4", min: 1.38, max: 1.41, description: "Threshold", color: defaultZoneColors[3] },
      { id: "z5", name: "Z5", min: 1.3, max: 1.37, description: "VO2 Max", color: defaultZoneColors[4] },
    ],
  },
  bike: {
    threshold: {
      value: 285,
      unit: "W",
      label: "FTP (Functional Threshold Power)",
      lastUpdated: "1 week ago",
    },
    zones: [
      { id: "z1", name: "Z1", min: 0, max: 142, description: "Active Recovery", color: defaultZoneColors[0] },
      { id: "z2", name: "Z2", min: 143, max: 199, description: "Endurance", color: defaultZoneColors[1] },
      { id: "z3", name: "Z3", min: 200, max: 242, description: "Tempo", color: defaultZoneColors[2] },
      { id: "z4", name: "Z4", min: 243, max: 285, description: "Threshold", color: defaultZoneColors[3] },
      { id: "z5", name: "Z5", min: 286, max: 342, description: "VO2 Max", color: defaultZoneColors[4] },
    ],
  },
  run: {
    threshold: {
      value: 4.15,
      unit: "/km",
      label: "Threshold Pace",
      lastUpdated: "3 weeks ago",
    },
    zones: [
      { id: "z1", name: "Z1", min: 5.2, max: 6.0, description: "Active Recovery", color: defaultZoneColors[0] },
      { id: "z2", name: "Z2", min: 4.45, max: 5.19, description: "Aerobic Base", color: defaultZoneColors[1] },
      { id: "z3", name: "Z3", min: 4.25, max: 4.44, description: "Tempo", color: defaultZoneColors[2] },
      { id: "z4", name: "Z4", min: 4.05, max: 4.24, description: "Threshold", color: defaultZoneColors[3] },
      { id: "z5", name: "Z5", min: 3.3, max: 4.04, description: "VO2 Max", color: defaultZoneColors[4] },
    ],
  },
  hr: {
    threshold: {
      value: 185,
      unit: "bpm",
      label: "Max Heart Rate",
      lastUpdated: "1 month ago",
    },
    zones: [
      { id: "z1", name: "Z1", min: 111, max: 129, description: "Active Recovery", color: defaultZoneColors[0] },
      { id: "z2", name: "Z2", min: 130, max: 148, description: "Aerobic Base", color: defaultZoneColors[1] },
      { id: "z3", name: "Z3", min: 149, max: 166, description: "Tempo", color: defaultZoneColors[2] },
      { id: "z4", name: "Z4", min: 167, max: 175, description: "Threshold", color: defaultZoneColors[3] },
      { id: "z5", name: "Z5", min: 176, max: 185, description: "VO2 Max", color: defaultZoneColors[4] },
    ],
  },
}

export function ZoneManagementWidget() {
  const [activeTab, setActiveTab] = useState<string>("swim")
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const [editingThreshold, setEditingThreshold] = useState<boolean>(false)
  const [zoneData, setZoneData] = useState(mockZoneData)

  const currentData = zoneData[activeTab]
  const Icon = sportIcons[activeTab as keyof typeof sportIcons]
  const sportColor = sportColors[activeTab as keyof typeof sportColors]

  const handleThresholdSave = (newValue: number) => {
    setZoneData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        threshold: {
          ...prev[activeTab].threshold,
          value: newValue,
          lastUpdated: "Just now",
        },
      },
    }))
    setEditingThreshold(false)
  }

  const handleZoneSave = (zoneId: string, updates: Partial<Zone>) => {
    setZoneData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        zones: prev[activeTab].zones.map((zone) => (zone.id === zoneId ? { ...zone, ...updates } : zone)),
      },
    }))
    setEditingZone(null)
  }

  const handleAddZone = () => {
    const newZone: Zone = {
      id: `z${currentData.zones.length + 1}`,
      name: `Z${currentData.zones.length + 1}`,
      min: 0,
      max: 100,
      description: "New Zone",
      color: defaultZoneColors[currentData.zones.length % defaultZoneColors.length],
    }

    setZoneData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        zones: [...prev[activeTab].zones, newZone],
      },
    }))
  }

  const handleDeleteZone = (zoneId: string) => {
    setZoneData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        zones: prev[activeTab].zones.filter((zone) => zone.id !== zoneId),
      },
    }))
  }

  const getThresholdPercentage = (value: number) => {
    return Math.round((value / currentData.threshold.value) * 100)
  }

  return (
    <div className="bg-bg-surface border border-border-weak rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border-weak">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-1">Zone Management</h2>
            <p className="text-text-2 text-sm mt-1">Configure training zones and thresholds for all disciplines</p>
          </div>
          <div className="flex items-center gap-2">
            <Info
              className="w-4 h-4 text-text-2 cursor-help"
              title="Zones are automatically calculated from your threshold values"
            />
            <button
              onClick={handleAddZone}
              className="flex items-center gap-2 px-3 py-2 bg-bg-raised border border-border-weak rounded-lg text-text-2 hover:text-text-1 hover:border-border transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Zone
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-weak">
        {Object.entries(sportIcons).map(([sport, SportIcon]) => (
          <button
            key={sport}
            onClick={() => setActiveTab(sport)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === sport ? "text-text-1 bg-bg-raised" : "text-text-2 hover:text-text-1 hover:bg-bg-raised/50"
            }`}
          >
            <SportIcon
              className="w-4 h-4"
              style={{ color: activeTab === sport ? sportColors[sport as keyof typeof sportColors] : undefined }}
            />
            <span className="capitalize">{sport === "hr" ? "Heart Rate" : sport}</span>
            {activeTab === sport && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: sportColors[sport as keyof typeof sportColors] }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Threshold Section */}
        <div className="mb-8 p-4 bg-bg-raised rounded-lg border border-border-weak">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" style={{ color: sportColor }} />
              <h3 className="text-lg font-medium text-text-1">{currentData.threshold.label}</h3>
              <Info
                className="w-4 h-4 text-text-2 cursor-help"
                title="This value is used to calculate all zone ranges"
              />
            </div>
            <button
              onClick={() => setEditingThreshold(!editingThreshold)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-text-2 hover:text-text-1 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>

          {editingThreshold ? (
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.01"
                defaultValue={currentData.threshold.value}
                className="px-3 py-2 bg-bg-surface border border-border-weak rounded text-text-1 text-lg font-semibold w-32"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleThresholdSave(Number.parseFloat((e.target as HTMLInputElement).value))
                  }
                }}
              />
              <span className="text-text-2">{currentData.threshold.unit}</span>
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="number"]') as HTMLInputElement
                  handleThresholdSave(Number.parseFloat(input.value))
                }}
                className="p-1 text-green-500 hover:bg-green-500/10 rounded"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingThreshold(false)}
                className="p-1 text-red-500 hover:bg-red-500/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-text-1" style={{ color: sportColor }}>
                  {currentData.threshold.value}
                </span>
                <span className="text-text-2">{currentData.threshold.unit}</span>
              </div>
              <span className="text-xs text-text-dim">Last updated: {currentData.threshold.lastUpdated}</span>
            </div>
          )}
        </div>

        {/* Zones Table */}
        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-4 pb-3 border-b border-border-weak text-text-2 text-sm font-medium">
            <span>Zone</span>
            <span>Range</span>
            <span>% of Threshold</span>
            <span>Description</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {currentData.zones.map((zone) => (
            <div
              key={zone.id}
              className="grid grid-cols-6 gap-4 py-4 border-b border-border-weak last:border-b-0 items-center"
            >
              {/* Zone Badge */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: zone.color }} />
                <span className="font-medium text-text-1">{zone.name}</span>
              </div>

              {/* Range */}
              {editingZone === zone.id ? (
                <div className="flex items-center gap-1 text-sm">
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={zone.min}
                    className="w-16 px-2 py-1 bg-bg-surface border border-border-weak rounded text-xs"
                    id={`min-${zone.id}`}
                  />
                  <span className="text-text-dim">-</span>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={zone.max}
                    className="w-16 px-2 py-1 bg-bg-surface border border-border-weak rounded text-xs"
                    id={`max-${zone.id}`}
                  />
                  <span className="text-text-dim text-xs">{currentData.threshold.unit}</span>
                </div>
              ) : (
                <span className="text-text-1 text-sm tabular-nums">
                  {zone.min} - {zone.max} {currentData.threshold.unit}
                </span>
              )}

              {/* Percentage */}
              <span className="text-text-2 text-sm tabular-nums">
                {getThresholdPercentage(zone.min)}% - {getThresholdPercentage(zone.max)}%
              </span>

              {/* Description */}
              {editingZone === zone.id ? (
                <input
                  type="text"
                  defaultValue={zone.description}
                  className="px-2 py-1 bg-bg-surface border border-border-weak rounded text-sm"
                  id={`desc-${zone.id}`}
                />
              ) : (
                <span className="text-text-2 text-sm">{zone.description}</span>
              )}

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" title="Zone configured correctly" />
                <span className="text-xs text-text-dim">Active</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {editingZone === zone.id ? (
                  <>
                    <button
                      onClick={() => {
                        const minInput = document.getElementById(`min-${zone.id}`) as HTMLInputElement
                        const maxInput = document.getElementById(`max-${zone.id}`) as HTMLInputElement
                        const descInput = document.getElementById(`desc-${zone.id}`) as HTMLInputElement

                        handleZoneSave(zone.id, {
                          min: Number.parseFloat(minInput.value),
                          max: Number.parseFloat(maxInput.value),
                          description: descInput.value,
                        })
                      }}
                      className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingZone(null)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingZone(zone.id)}
                      className="p-1 text-text-dim hover:text-text-1 hover:bg-bg-raised rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-1 text-text-dim hover:text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Zone Visualization */}
        <div className="mt-8 p-4 bg-bg-raised rounded-lg">
          <h4 className="text-sm font-medium text-text-1 mb-3">Zone Distribution</h4>
          <div className="flex h-8 rounded-lg overflow-hidden">
            {currentData.zones.map((zone, index) => (
              <div
                key={zone.id}
                className="flex-1 relative group cursor-pointer"
                style={{ backgroundColor: zone.color }}
                title={`${zone.name}: ${zone.min}-${zone.max} ${currentData.threshold.unit}`}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {zone.name}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-text-dim mt-2">
            <span>Lower Intensity</span>
            <span>Higher Intensity</span>
          </div>
        </div>
      </div>
    </div>
  )
}
