"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Command, PanelLeft } from "lucide-react"
import { NAV, NAV_ICONS } from "./navigation-config"
import { CommandPalette } from "./command-palette"
import { Button } from "./ui/button"

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  const isOnboarding = pathname.startsWith("/onboarding")

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Default collapsed on mobile/tablet, expanded on desktop
      if (mobile) {
        setIsCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "k") {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        setIsCollapsed(!isCollapsed)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isCollapsed])

  if (isOnboarding) {
    return (
      <div className="flex h-screen bg-bg-app">
        <main className="flex-1 overflow-auto">
          <div className="max-w-screen-xl mx-auto">{children}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-bg-app">
      <aside
        data-testid="sidebar"
        className={`
          ${isCollapsed ? "w-16" : "w-64"} 
          bg-bg-surface border-r border-border-weak flex flex-col transition-all duration-300 ease-in-out
          ${isMobile && isCollapsed ? "absolute -translate-x-full z-50" : ""}
          ${isMobile && !isCollapsed ? "absolute z-50 shadow-lg" : ""}
        `}
      >
        {/* Logo/Brand */}
        <div className={`p-6 border-b border-border-weak ${isCollapsed ? "px-4" : ""}`}>
          {isCollapsed ? (
            <div className="w-8 h-8 bg-swim rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
          ) : (
            <h1 className="text-xl font-semibold text-text-1">Endurance</h1>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 p-4 space-y-2 ${isCollapsed ? "px-2" : ""}`}>
          {NAV.map((item) => {
            const Icon = NAV_ICONS[item.icon]
            const isActive = pathname === item.href
            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 group relative ${
                  isActive
                    ? "bg-bg-raised text-text-1 border border-border-weak"
                    : "text-text-2 hover:text-text-1 hover:bg-bg-raised"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-150 ${
                    isActive ? "text-swim" : "group-hover:text-swim"
                  } ${isCollapsed ? "mx-auto" : ""}`}
                />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-bg-surface border border-border-weak rounded text-xs text-text-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </a>
            )
          })}
        </nav>

        {/* Command palette trigger */}
        <div className={`p-4 border-t border-border-weak ${isCollapsed ? "px-2" : ""}`}>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className={`flex items-center gap-3 w-full px-3 py-2 text-text-dim hover:text-text-2 hover:bg-bg-raised rounded-lg transition-colors duration-150 ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
            title={isCollapsed ? "Command Palette (⌘K)" : undefined}
          >
            <Command className="w-4 h-4" />
            {!isCollapsed && <span className="text-sm">⌘K</span>}
          </button>
        </div>
      </aside>

      {isMobile && !isCollapsed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsCollapsed(true)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-bg-surface border-b border-border-weak px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
            <PanelLeft className="h-4 w-4" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
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
