"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Activity, BarChart3, Settings, User } from "lucide-react"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const mockCommands = [
  { id: "progress", label: "Go to Progress", icon: BarChart3, shortcut: "⌘D" },
  { id: "calendar", label: "Open Calendar", icon: Calendar, shortcut: "⌘C" },
  { id: "training", label: "View Training", icon: Activity, shortcut: "⌘T" },
  { id: "profile", label: "Edit Profile", icon: User, shortcut: "⌘P" },
  { id: "settings", label: "Open Settings", icon: Settings, shortcut: "⌘," },
  { id: "new-workout", label: "Create New Workout", icon: Activity, shortcut: "⌘N" },
]

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = mockCommands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    if (!isOpen) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === "Enter") {
        e.preventDefault()
        // Handle command execution here
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, filteredCommands.length, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start justify-center pt-32 z-50">
      <div className="bg-bg-surface border border-border-mid rounded-lg shadow-2xl w-full max-w-lg mx-4">
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-border-weak">
          <Search className="w-5 h-5 text-text-dim" />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-text-1 placeholder-text-dim outline-none"
            autoFocus
          />
        </div>

        {/* Commands list */}
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-text-dim">No commands found</div>
          ) : (
            filteredCommands.map((command, index) => {
              const Icon = command.icon
              return (
                <button
                  key={command.id}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-bg-raised transition-colors duration-150 ${
                    index === selectedIndex ? "bg-bg-raised" : ""
                  }`}
                  onClick={onClose}
                >
                  <Icon className="w-4 h-4 text-text-dim" />
                  <span className="flex-1 text-text-1 text-sm">{command.label}</span>
                  <span className="text-text-dim text-xs">{command.shortcut}</span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
