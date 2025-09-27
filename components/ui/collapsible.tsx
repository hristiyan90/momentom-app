/**
 * Simple Collapsible Components
 * Replacement for missing collapsible components
 */

'use client'

import { cn } from '@/lib/utils'
import { createContext, useContext, useState, forwardRef } from 'react'

interface CollapsibleContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const CollapsibleContext = createContext<CollapsibleContextType | null>(null)

const Collapsible = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    asChild?: boolean
  }
>(({ className, open: openProp, onOpenChange, asChild, children, ...props }, ref) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp !== undefined ? openProp : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const contextValue = { open, setOpen }

  if (asChild) {
    return (
      <CollapsibleContext.Provider value={contextValue}>
        {children}
      </CollapsibleContext.Provider>
    )
  }

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
})
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
  }
>(({ className, asChild, children, ...props }, ref) => {
  const context = useContext(CollapsibleContext)
  
  const handleClick = () => {
    context?.setOpen(!context.open)
  }

  if (asChild) {
    return <>{children}</>
  }

  return (
    <button
      ref={ref}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean
  }
>(({ className, asChild, children, ...props }, ref) => {
  const context = useContext(CollapsibleContext)
  
  if (!context?.open) {
    return null
  }

  if (asChild) {
    return <>{children}</>
  }

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
