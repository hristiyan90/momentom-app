"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

type Sport = "swim" | "bike" | "run" | "strength"
type Intensity = "recovery" | "endurance" | "tempo" | "threshold" | "vo2"

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  defaultDate?: Date
}

export function QuickAddModal({ isOpen, onClose, defaultDate }: QuickAddModalProps) {
  const [sport, setSport] = useState<Sport>("run")
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("01:00")
  const [intensity, setIntensity] = useState<Intensity>("endurance")
  const [date, setDate] = useState(defaultDate || new Date())

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock submission - just close modal
    console.log("Adding session:", { sport, title, duration, intensity, date })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-surface border border-border-weak rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-text-1">Add Session</h2>
          <button onClick={onClose} className="text-text-dim hover:text-text-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sport selector */}
          <div>
            <label className="block text-sm text-text-2 mb-2">Sport</label>
            <div className="grid grid-cols-4 gap-2">
              {(["swim", "bike", "run", "strength"] as Sport[]).map((sportOption) => (
                <button
                  key={sportOption}
                  type="button"
                  onClick={() => setSport(sportOption)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors capitalize ${
                    sport === sportOption
                      ? `bg-sport-${sportOption} text-white border-sport-${sportOption}`
                      : "bg-bg-raised border-border-weak text-text-2 hover:bg-bg-surface"
                  }`}
                >
                  {sportOption}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-text-2 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-bg-raised border border-border-weak rounded-lg text-text-1 placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="e.g., Morning Run"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-text-2 mb-2">Duration</label>
            <input
              type="time"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 bg-bg-raised border border-border-weak rounded-lg text-text-1 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Intensity */}
          <div>
            <label className="block text-sm text-text-2 mb-2">Intensity</label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as Intensity)}
              className="w-full px-3 py-2 bg-bg-raised border border-border-weak rounded-lg text-text-1 focus:outline-none focus:ring-2 focus:ring-swim"
            >
              <option value="recovery">Recovery</option>
              <option value="endurance">Endurance</option>
              <option value="tempo">Tempo</option>
              <option value="threshold">Threshold</option>
              <option value="vo2">VO2</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-text-2 mb-2">Date</label>
            <input
              type="date"
              value={date.toISOString().split("T")[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
              className="w-full px-3 py-2 bg-bg-raised border border-border-weak rounded-lg text-text-1 focus:outline-none focus:ring-2 focus:ring-swim"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Add Session
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
