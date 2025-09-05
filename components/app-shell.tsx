"use client"

import type { ReactNode } from "react"
import { Command } from "lucide-react"
import { useState } from "react"
import { CommandPalette } from "./command-palette"
import { NAV, NAV_ICONS } from "./navigation-config"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "k") {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  })

  return (
    <div className="flex h-screen bg-bg-app">
      {/* Sidebar */}
      <div className="w-64 bg-bg-surface border-r border-border-weak flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-border-weak">
          <h1 className="text-xl font-semibold text-text-1">Momentom</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {NAV.map((item) => {
            const Icon = NAV_ICONS[item.icon]
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-text-2 hover:text-text-1 hover:bg-bg-raised rounded-lg transition-colors duration-150 group"
              >
                <Icon className="w-5 h-5 group-hover:text-swim transition-colors duration-150" />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            )
          })}
        </nav>

        {/* Command palette trigger */}
        <div className="p-4 border-t border-border-weak">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-3 w-full px-3 py-2 text-text-dim hover:text-text-2 hover:bg-bg-raised rounded-lg transition-colors duration-150"
          >
            <Command className="w-4 h-4" />
            <span className="text-sm">⌘K</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-bg-surface border-b border-border-weak px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-bg-raised rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-screen-xl mx-auto p-6">{children}</div>
        </main>
      </div>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  )
}
