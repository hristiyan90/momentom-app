"use client"

import type React from "react"

import { useState } from "react"
import {
  Plus,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Trophy,
  MapPin,
  Clock,
  Waves,
  Bike,
  Footprints,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

// Sample data types
type Race = {
  id: string
  priority: "A" | "B" | "C"
  type: "Sprint" | "Olympic" | "70.3" | "Ironman" | "Marathon" | "Custom"
  name: string
  location: string
  dateISO: string
  startTime?: string
  status?: "On track" | "At risk" | "Off track" // Only for future races
  predicted?: {
    total: string
    swim?: { split: string; targetPace: string; zone: "Z1" | "Z2" | "Z3" | "Z4" | "Z5" }
    bike?: { split: string; targetNP: number; IF: number; zone: string }
    run?: { split: string; targetPace: string; hrCap?: number; zone: string }
    t1?: string
    t2?: string
  }
  actual?: {
    total: string
    swim?: { split: string; pace: string; avgHR?: number }
    bike?: { split: string; avgPower: number; NP: number; IF: number }
    run?: { split: string; pace: string; avgHR?: number }
    t1?: string
    t2?: string
    placement?: { overall: number; ageGroup: number; totalParticipants: number }
  }
  confidence?: number
}

// Sample data
const futureRaces: Race[] = [
  {
    id: "1",
    priority: "A",
    type: "Ironman",
    name: "Ironman Barcelona",
    location: "Barcelona, Spain",
    dateISO: "2025-10-05",
    startTime: "07:00",
    status: "On track",
    predicted: { total: "10:45:30" },
    confidence: 78,
  },
  {
    id: "2",
    priority: "B",
    type: "Olympic",
    name: "London Triathlon",
    location: "London, UK",
    dateISO: "2025-07-20",
    startTime: "08:30",
    status: "At risk",
    predicted: { total: "2:15:45" },
    confidence: 65,
  },
  {
    id: "3",
    priority: "C",
    type: "Sprint",
    name: "Local Sprint Series",
    location: "Manchester, UK",
    dateISO: "2025-06-15",
    status: "On track",
    predicted: { total: "1:08:20" },
    confidence: 82,
  },
]

const pastRaces: Race[] = [
  {
    id: "4",
    priority: "A",
    type: "70.3",
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
  },
  {
    id: "5",
    priority: "B",
    type: "Marathon",
    name: "Berlin Marathon",
    location: "Berlin, Germany",
    dateISO: "2024-09-29",
    startTime: "09:00",
    actual: {
      total: "3:42:18",
      run: { split: "3:42:18", pace: "5:16/km", avgHR: 158 },
      placement: { overall: 8420, ageGroup: 1205, totalParticipants: 45000 },
    },
  },
]

// Helper functions
const formatDate = (dateISO: string) => {
  const date = new Date(dateISO)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 0) {
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `In ${diffDays} days`
    if (diffDays < 14) return `In ${Math.ceil(diffDays / 7)} week`
    return `In ${Math.ceil(diffDays / 7)} weeks`
  } else {
    const absDays = Math.abs(diffDays)
    if (absDays < 7) return `${absDays} days ago`
    if (absDays < 30) return `${Math.ceil(absDays / 7)} weeks ago`
    return `${Math.ceil(absDays / 30)} months ago`
  }
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
      return "bg-green-500"
    case "At risk":
      return "bg-orange-500"
    case "Off track":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getRaceTypeColor = (type: string) => {
  switch (type) {
    case "Sprint":
    case "Olympic":
    case "70.3":
    case "Ironman":
      return "bg-blue-500"
    case "Marathon":
      return "bg-purple-500"
    default:
      return "bg-gray-500"
  }
}

function AddRaceModal({ onAddRace }: { onAddRace: (race: Partial<Race>) => void }) {
  const [formData, setFormData] = useState({
    priority: "B" as const,
    sport: "triathlon" as const,
    distance: "Olympic" as const,
    name: "",
    location: "",
    date: "",
    startTime: "",
    // Target fields (for future races)
    swimTarget: "",
    bikeTarget: "",
    runTarget: "",
    // Actual result fields (for past races)
    actualTotal: "",
    actualSwimSplit: "",
    actualSwimPace: "",
    actualBikeSplit: "",
    actualBikePower: "",
    actualRunSplit: "",
    actualRunPace: "",
    actualT1: "",
    actualT2: "",
    placement: "",
    totalParticipants: "",
  })
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"future" | "past">("future")

  const isPastRace = activeTab === "past"

  const sportOptions = [
    { value: "triathlon", label: "Triathlon", icon: [Waves, Bike, Footprints] },
    { value: "cycling", label: "Cycling", icon: [Bike] },
    { value: "running", label: "Running", icon: [Footprints] },
  ]

  const getDistanceOptions = (sport: string) => {
    switch (sport) {
      case "triathlon":
        return ["Sprint", "Olympic", "70.3", "Ironman"]
      case "cycling":
        return ["40km TT", "100km", "160km", "180km", "Custom"]
      case "running":
        return ["5K", "10K", "Half Marathon", "Marathon", "Ultra", "Custom"]
      default:
        return ["Custom"]
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newRace: Partial<Race> = {
      id: Date.now().toString(),
      priority: formData.priority,
      type: formData.distance as any,
      name: formData.name,
      location: formData.location,
      dateISO: formData.date,
      startTime: formData.startTime || undefined,
    }

    if (isPastRace) {
      // For past races, add actual results
      newRace.actual = {
        total: formData.actualTotal || "0:00:00",
        ...(formData.sport !== "running" && {
          swim: formData.actualSwimSplit
            ? {
                split: formData.actualSwimSplit,
                pace: formData.actualSwimPace || "0:00/100m",
              }
            : undefined,
          bike: formData.actualBikeSplit
            ? {
                split: formData.actualBikeSplit,
                avgPower: Number.parseInt(formData.actualBikePower) || 0,
                NP: Number.parseInt(formData.actualBikePower) || 0,
                IF: 0.8,
              }
            : undefined,
          t1: formData.actualT1 || undefined,
          t2: formData.actualT2 || undefined,
        }),
        run: formData.actualRunSplit
          ? {
              split: formData.actualRunSplit,
              pace: formData.actualRunPace || "0:00/km",
            }
          : undefined,
        ...(formData.placement &&
          formData.totalParticipants && {
            placement: {
              overall: Number.parseInt(formData.placement),
              ageGroup: Math.ceil(Number.parseInt(formData.placement) / 10),
              totalParticipants: Number.parseInt(formData.totalParticipants),
            },
          }),
      }
    } else {
      // For future races, add predictions and status
      newRace.status = "On track"
      newRace.predicted = { total: "0:00:00" }
      newRace.confidence = 75
    }

    onAddRace(newRace)

    // Show success toast
    toast({
      title: "Race Added Successfully",
      description: `${formData.name} has been added to your race ${isPastRace ? "history" : "calendar"}.`,
      duration: 3000,
    })

    // Reset form and close modal
    setFormData({
      priority: "B",
      sport: "triathlon",
      distance: "Olympic",
      name: "",
      location: "",
      date: "",
      startTime: "",
      swimTarget: "",
      bikeTarget: "",
      runTarget: "",
      actualTotal: "",
      actualSwimSplit: "",
      actualSwimPace: "",
      actualBikeSplit: "",
      actualBikePower: "",
      actualRunSplit: "",
      actualRunPace: "",
      actualT1: "",
      actualT2: "",
      placement: "",
      totalParticipants: "",
    })
    setActiveTab("future")
    setIsOpen(false)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#5B8CFF] hover:bg-[#4A7AEF] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Race
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0F151D] border-[#1E293B] text-slate-200 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Race</DialogTitle>
          <p className="text-sm text-slate-400">
            Record past race results or plan future races to optimize your training
          </p>
        </DialogHeader>

        <div className="bg-[#0B0F14] border border-[#1E293B] rounded-lg p-1 flex mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("future")}
            className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "future" ? "bg-[#5B8CFF] text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Future Race
            <span className="block text-xs mt-1 opacity-75">Plan upcoming events</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "past" ? "bg-[#5B8CFF] text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Past Race
            <span className="block text-xs mt-1 opacity-75">Record completed events</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">Race Priority</Label>
            <div className="flex gap-3">
              {[
                { value: "A", label: "A Race", desc: "Peak performance goal" },
                { value: "B", label: "B Race", desc: "Important but not peak" },
                { value: "C", label: "C Race", desc: "Training or fun race" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, priority: option.value as any }))}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    formData.priority === option.value
                      ? "border-[#5B8CFF] bg-[#5B8CFF]/10 text-[#5B8CFF]"
                      : "border-[#1E293B] bg-[#0B0F14] text-slate-400 hover:border-[#334155]"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs mt-1 opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Sport</Label>
            <div className="grid grid-cols-3 gap-3">
              {sportOptions.map((sport) => (
                <button
                  key={sport.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      sport: sport.value as any,
                      distance: getDistanceOptions(sport.value)[0],
                    }))
                  }
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    formData.sport === sport.value
                      ? "border-[#5B8CFF] bg-[#5B8CFF]/10 text-[#5B8CFF]"
                      : "border-[#1E293B] bg-[#0B0F14] text-slate-400 hover:border-[#334155]"
                  }`}
                >
                  <div className="flex justify-center gap-1 mb-2">
                    {sport.icon.map((Icon, index) => (
                      <Icon key={index} className="w-5 h-5" />
                    ))}
                  </div>
                  <div className="font-medium text-sm">{sport.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Distance</Label>
            <div className="grid grid-cols-4 gap-3">
              {getDistanceOptions(formData.sport).map((distance) => (
                <button
                  key={distance}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, distance }))}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    formData.distance === distance
                      ? "border-[#5B8CFF] bg-[#5B8CFF]/10 text-[#5B8CFF]"
                      : "border-[#1E293B] bg-[#0B0F14] text-slate-400 hover:border-[#334155]"
                  }`}
                >
                  <div className="font-medium text-sm">{distance}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-[#0B0F14] border-[#1E293B]"
                placeholder="e.g., Ironman Barcelona"
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="bg-[#0B0F14] border-[#1E293B]"
                placeholder="City, Country"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="bg-[#0B0F14] border-[#1E293B]"
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time (Optional)</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                className="bg-[#0B0F14] border-[#1E293B]"
              />
            </div>
          </div>

          <div className="border-t border-[#1E293B] pt-6">
            {isPastRace ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <Label className="text-base font-medium text-amber-200">Race Results</Label>
                </div>

                <div>
                  <Label htmlFor="actualTotal" className="text-sm text-slate-400">
                    Total Finish Time (required)
                  </Label>
                  <Input
                    id="actualTotal"
                    value={formData.actualTotal}
                    onChange={(e) => setFormData((prev) => ({ ...prev, actualTotal: e.target.value }))}
                    className="bg-[#0B0F14] border-[#1E293B]"
                    placeholder="5:08:42"
                    required
                  />
                </div>

                {formData.sport !== "running" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="actualSwimSplit" className="text-sm text-slate-400">
                          Swim Split
                        </Label>
                        <Input
                          id="actualSwimSplit"
                          value={formData.actualSwimSplit}
                          onChange={(e) => setFormData((prev) => ({ ...prev, actualSwimSplit: e.target.value }))}
                          className="bg-[#0B0F14] border-[#1E293B]"
                          placeholder="32:15"
                        />
                      </div>
                      <div>
                        <Label htmlFor="actualSwimPace" className="text-sm text-slate-400">
                          Swim Pace (min/100m)
                        </Label>
                        <Input
                          id="actualSwimPace"
                          value={formData.actualSwimPace}
                          onChange={(e) => setFormData((prev) => ({ ...prev, actualSwimPace: e.target.value }))}
                          className="bg-[#0B0F14] border-[#1E293B]"
                          placeholder="1:42"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="actualBikeSplit" className="text-sm text-slate-400">
                          Bike Split
                        </Label>
                        <Input
                          id="actualBikeSplit"
                          value={formData.actualBikeSplit}
                          onChange={(e) => setFormData((prev) => ({ ...prev, actualBikeSplit: e.target.value }))}
                          className="bg-[#0B0F14] border-[#1E293B]"
                          placeholder="2:28:30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="actualBikePower" className="text-sm text-slate-400">
                          Avg Power (W)
                        </Label>
                        <Input
                          id="actualBikePower"
                          value={formData.actualBikePower}
                          onChange={(e) => setFormData((prev) => ({ ...prev, actualBikePower: e.target.value }))}
                          className="bg-[#0B0F14] border-[#1E293B]"
                          placeholder="245"
                        />
                      </div>
                    </div>

                    {formData.sport === "triathlon" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="actualT1" className="text-sm text-slate-400">
                            T1 Time
                          </Label>
                          <Input
                            id="actualT1"
                            value={formData.actualT1}
                            onChange={(e) => setFormData((prev) => ({ ...prev, actualT1: e.target.value }))}
                            className="bg-[#0B0F14] border-[#1E293B]"
                            placeholder="3:12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="actualT2" className="text-sm text-slate-400">
                            T2 Time
                          </Label>
                          <Input
                            id="actualT2"
                            value={formData.actualT2}
                            onChange={(e) => setFormData((prev) => ({ ...prev, actualT2: e.target.value }))}
                            className="bg-[#0B0F14] border-[#1E293B]"
                            placeholder="6:00"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="actualRunSplit" className="text-sm text-slate-400">
                      Run Split
                    </Label>
                    <Input
                      id="actualRunSplit"
                      value={formData.actualRunSplit}
                      onChange={(e) => setFormData((prev) => ({ ...prev, actualRunSplit: e.target.value }))}
                      className="bg-[#0B0F14] border-[#1E293B]"
                      placeholder="1:58:45"
                    />
                  </div>
                  <div>
                    <Label htmlFor="actualRunPace" className="text-sm text-slate-400">
                      Run Pace (min/km)
                    </Label>
                    <Input
                      id="actualRunPace"
                      value={formData.actualRunPace}
                      onChange={(e) => setFormData((prev) => ({ ...prev, actualRunPace: e.target.value }))}
                      className="bg-[#0B0F14] border-[#1E293B]"
                      placeholder="5:38"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="placement" className="text-sm text-slate-400">
                      Overall Placement
                    </Label>
                    <Input
                      id="placement"
                      value={formData.placement}
                      onChange={(e) => setFormData((prev) => ({ ...prev, placement: e.target.value }))}
                      className="bg-[#0B0F14] border-[#1E293B]"
                      placeholder="127"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalParticipants" className="text-sm text-slate-400">
                      Total Participants
                    </Label>
                    <Input
                      id="totalParticipants"
                      value={formData.totalParticipants}
                      onChange={(e) => setFormData((prev) => ({ ...prev, totalParticipants: e.target.value }))}
                      className="bg-[#0B0F14] border-[#1E293B]"
                      placeholder="1850"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <Label className="text-base font-medium text-blue-200">Performance Targets</Label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {formData.sport !== "running" && (
                    <div>
                      <Label htmlFor="swimTarget" className="text-sm text-slate-400">
                        Swim Pace (min/100m)
                      </Label>
                      <Input
                        id="swimTarget"
                        value={formData.swimTarget}
                        onChange={(e) => setFormData((prev) => ({ ...prev, swimTarget: e.target.value }))}
                        className="bg-[#0B0F14] border-[#1E293B]"
                        placeholder="1:30"
                      />
                    </div>
                  )}
                  {formData.sport !== "running" && (
                    <div>
                      <Label htmlFor="bikeTarget" className="text-sm text-slate-400">
                        Bike Power (W)
                      </Label>
                      <Input
                        id="bikeTarget"
                        value={formData.bikeTarget}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bikeTarget: e.target.value }))}
                        className="bg-[#0B0F14] border-[#1E293B]"
                        placeholder="250"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="runTarget" className="text-sm text-slate-400">
                      Run Pace (min/km)
                    </Label>
                    <Input
                      id="runTarget"
                      value={formData.runTarget}
                      onChange={(e) => setFormData((prev) => ({ ...prev, runTarget: e.target.value }))}
                      className="bg-[#0B0F14] border-[#1E293B]"
                      placeholder="4:30"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-[#1E293B] text-slate-400 hover:bg-[#1E293B] bg-transparent"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#5B8CFF] hover:bg-[#4A7AEF] text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                `Save ${isPastRace ? "Result" : "Race"}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Race Card Component
function RaceCard({ race, onView }: { race: Race; onView: (id: string) => void }) {
  const isPastRace = new Date(race.dateISO) < new Date()

  return (
    <div className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Badge className={`${getPriorityColor(race.priority)} text-white text-xs px-2 py-1`}>{race.priority}</Badge>
            <Badge className={`${getRaceTypeColor(race.type)} text-white text-xs px-2 py-1`}>{race.type}</Badge>
          </div>

          <h3 className="text-lg font-semibold text-slate-200 mb-1">{race.name}</h3>

          <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {race.location}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(race.dateISO)}
            </div>
            {race.startTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {race.startTime}
              </div>
            )}
          </div>

          {!isPastRace && race.status && (
            <div className="flex items-center gap-3 mb-3">
              <Badge className={`${getStatusColor(race.status)} text-white text-xs px-2 py-1`}>{race.status}</Badge>
            </div>
          )}

          {isPastRace && race.actual ? (
            <div className="text-sm text-slate-400">
              <span>Finish time: {race.actual.total}</span>
              {race.actual.placement && (
                <span className="ml-3">
                  Placed {race.actual.placement.overall}/{race.actual.placement.totalParticipants} overall
                </span>
              )}
            </div>
          ) : (
            race.predicted && (
              <div className="text-sm text-slate-400">
                <span>Predicted finish: {race.predicted.total}</span>
                {race.confidence && <span className="ml-3">Confidence: {race.confidence}%</span>}
              </div>
            )
          )}
        </div>

        <Button
          onClick={() => onView(race.id)}
          variant="outline"
          size="sm"
          className="border-[#1E293B] text-[#5B8CFF] hover:bg-[#1E293B] ml-4"
        >
          View
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ type, onAddRace }: { type: "future" | "past"; onAddRace?: () => void }) {
  if (type === "future") {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-300 mb-2">No upcoming races yet</h3>
        <p className="text-slate-400 mb-6">Add your first race to start tracking your training goals</p>
        <AddRaceModal onAddRace={() => {}} />
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-slate-300 mb-2">No race history yet</h3>
      <p className="text-slate-400">Logging race results improves predictions</p>
    </div>
  )
}

export default function RacesPage() {
  const [activeTab, setActiveTab] = useState<"future" | "past">("future")
  const [races, setRaces] = useState({ future: futureRaces, past: pastRaces })
  const [loading, setLoading] = useState(false)

  const handleAddRace = (newRace: Partial<Race>) => {
    const race = newRace as Race
    const isPastRace = new Date(race.dateISO) < new Date()

    setRaces((prev) => ({
      ...prev,
      [isPastRace ? "past" : "future"]: [...prev[isPastRace ? "past" : "future"], race],
    }))
  }

  const handleViewRace = (id: string) => {
    // Show loading toast
    toast({
      title: "Loading Race Details",
      description: "Opening race details...",
      duration: 2000,
    })

    // Navigate to race detail page
    setTimeout(() => {
      window.location.href = `/races/${id}`
    }, 500)
  }

  const handleRegeneratePlan = () => {
    toast({
      title: "Plan Regeneration Started",
      description: "Your training plan is being updated to align with your race schedule.",
      duration: 4000,
    })
  }

  const handleOpenCalendar = () => {
    toast({
      title: "Opening Calendar",
      description: "Navigating to race week in calendar...",
      duration: 2000,
    })
    setTimeout(() => {
      window.location.href = "/calendar"
    }, 500)
  }

  const currentRaces = races[activeTab]
  const showMisalignmentBanner =
    activeTab === "future" &&
    races.future.some((race) => {
      const raceDate = new Date(race.dateISO)
      const now = new Date()
      const diffWeeks = (raceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)
      return diffWeeks <= 8 && diffWeeks > 0
    })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#1E293B] rounded w-32"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#0F151D] border border-[#1E293B] rounded-2xl p-6">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="h-6 bg-[#1E293B] rounded w-8"></div>
                    <div className="h-6 bg-[#1E293B] rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-[#1E293B] rounded w-48"></div>
                  <div className="h-4 bg-[#1E293B] rounded w-64"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-200">Races</h1>
        <div className="flex items-center gap-4">
          {/* Tab Segmented Control */}
          <div className="bg-[#0F151D] border border-[#1E293B] rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab("future")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "future" ? "bg-[#5B8CFF] text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Future
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "past" ? "bg-[#5B8CFF] text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Past
            </button>
          </div>

          <AddRaceModal onAddRace={handleAddRace} />
        </div>
      </div>

      {showMisalignmentBanner && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-amber-200 font-medium">Race in 7 weeks. Plan not aligned.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/20 text-amber-200 hover:bg-amber-500/10 bg-transparent"
              onClick={handleRegeneratePlan}
            >
              Regenerate Plan
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/20 text-amber-200 hover:bg-amber-500/10 bg-transparent"
              onClick={handleOpenCalendar}
            >
              Open Calendar
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {currentRaces.length === 0 ? (
          <EmptyState type={activeTab} onAddRace={() => handleAddRace} />
        ) : (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            {currentRaces.map((race) => (
              <RaceCard key={race.id} race={race} onView={handleViewRace} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
