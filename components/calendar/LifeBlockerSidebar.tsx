"use client"

import { useState } from "react"
import { X, AlertTriangle, Plane, Briefcase, Users, MoreHorizontal } from "lucide-react"

interface LifeBlockerSidebarProps {
  dateRange: { start: Date; end: Date }
  onClose: () => void
  onSave: (blocker: {
    startDate: Date
    endDate: Date
    type: "illness" | "travel" | "work" | "family" | "other"
    title: string
    description?: string
  }) => void
  existingBlocker?: {
    id: string
    type: "illness" | "travel" | "work" | "family" | "other"
    title: string
    description?: string
  }
  onUpdate?: (
    blockerId: string,
    blocker: {
      startDate: Date
      endDate: Date
      type: "illness" | "travel" | "work" | "family" | "other"
      title: string
      description?: string
    },
  ) => void
  onDelete?: (blockerId: string) => void
}

const blockerTypes = [
  { value: "illness" as const, label: "Illness", icon: AlertTriangle, color: "text-red-500" },
  { value: "travel" as const, label: "Travel", icon: Plane, color: "text-blue-500" },
  { value: "work" as const, label: "Work", icon: Briefcase, color: "text-orange-500" },
  { value: "family" as const, label: "Family", icon: Users, color: "text-green-500" },
  { value: "other" as const, label: "Other", icon: MoreHorizontal, color: "text-gray-500" },
]

export function LifeBlockerSidebar({
  dateRange,
  onClose,
  onSave,
  existingBlocker,
  onUpdate,
  onDelete,
}: LifeBlockerSidebarProps) {
  const [type, setType] = useState<"illness" | "travel" | "work" | "family" | "other">(
    existingBlocker?.type || "travel",
  )
  const [title, setTitle] = useState(existingBlocker?.title || "")
  const [description, setDescription] = useState(existingBlocker?.description || "")

  const formatDateRange = () => {
    const start = dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const end = dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    if (dateRange.start.toDateString() === dateRange.end.toDateString()) {
      return start
    }

    return `${start} - ${end}`
  }

  const handleSave = () => {
    if (!title.trim()) return

    const blockerData = {
      startDate: dateRange.start,
      endDate: dateRange.end,
      type,
      title: title.trim(),
      description: description.trim() || undefined,
    }

    if (existingBlocker && onUpdate) {
      onUpdate(existingBlocker.id, blockerData)
    } else {
      onSave(blockerData)
    }
  }

  const handleDelete = () => {
    if (existingBlocker && onDelete) {
      onDelete(existingBlocker.id)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="ml-auto w-96 bg-bg-app border-l border-border-weak h-full flex flex-col relative z-10 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-weak bg-bg-surface">
          <div>
            <h2 className="text-lg font-semibold text-text-1">
              {existingBlocker ? "Edit Life Blocker" : "Create Life Blocker"}
            </h2>
            <p className="text-sm text-text-2 mt-1">{formatDateRange()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-2 hover:text-text-1 hover:bg-bg-raised rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 p-6 space-y-6 bg-bg-app overflow-y-auto">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-text-1 mb-3">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {blockerTypes.map((blockerType) => {
                const Icon = blockerType.icon
                return (
                  <button
                    key={blockerType.value}
                    onClick={() => setType(blockerType.value)}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border transition-colors
                      ${
                        type === blockerType.value
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                          : "border-border-weak bg-bg-raised text-text-2 hover:bg-bg-surface"
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${type === blockerType.value ? "text-cyan-400" : blockerType.color}`} />
                    <span className="text-sm font-medium">{blockerType.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-1 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Business trip to NYC"
              className="w-full px-3 py-2 bg-bg-raised border border-border-weak rounded-lg text-text-1 placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-1 mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about this blocker..."
              rows={3}
              className="w-full px-3 py-2 bg-bg-raised border border-border-weak rounded-lg text-text-1 placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Impact Notice */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-400 mb-1">Plan Adaptation</h4>
                <p className="text-xs text-amber-300/80">
                  Your training plan will be automatically adjusted to accommodate this life blocker. Workouts may be
                  rescheduled or modified to maintain your fitness goals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-weak bg-bg-surface">
          <div className="flex gap-3">
            {existingBlocker && onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-text-2 bg-bg-raised border border-border-weak rounded-lg hover:bg-bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {existingBlocker ? "Update Blocker" : "Create Blocker"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
