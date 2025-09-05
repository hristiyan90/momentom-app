"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface InlineDrawerProps {
  trigger: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export function InlineDrawer({ trigger, children, defaultOpen = false }: InlineDrawerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left hover:bg-bg-raised rounded-lg transition-colors duration-150 p-2 group"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-text-dim group-hover:text-text-2 transition-colors duration-150" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-text-2 transition-colors duration-150" />
        )}
        <div className="flex-1">{trigger}</div>
      </button>

      {isOpen && (
        <div className="ml-6 pl-4 border-l border-border-weak animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
