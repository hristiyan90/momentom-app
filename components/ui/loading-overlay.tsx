import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./loading-spinner"

const loadingOverlayVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-black/20 backdrop-blur-sm",
        opaque: "bg-bg-app/95 backdrop-blur-sm",
        transparent: "bg-transparent",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingOverlayVariants> {
  /**
   * Whether the overlay is visible
   */
  isVisible?: boolean
  /**
   * Text to display below the spinner
   */
  text?: string
  /**
   * Size of the spinner
   */
  spinnerSize?: "sm" | "md" | "lg" | "xl"
  /**
   * Variant of the spinner
   */
  spinnerVariant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  /**
   * Whether to show a progress indicator
   */
  showProgress?: boolean
  /**
   * Progress value (0-100)
   */
  progress?: number
  /**
   * Custom content to display in the overlay
   */
  children?: React.ReactNode
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className, 
    variant, 
    size,
    isVisible = true,
    text,
    spinnerSize = "lg",
    spinnerVariant = "primary",
    showProgress = false,
    progress = 0,
    children,
    ...props 
  }, ref) => {
    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(loadingOverlayVariants({ variant, size }), className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {children || (
            <>
              <LoadingSpinner 
                size={spinnerSize} 
                variant={spinnerVariant}
              />
              {text && (
                <p className="text-text-1 text-sm font-medium animate-pulse">
                  {text}
                </p>
              )}
              {showProgress && (
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-xs text-text-2">
                    <span>Loading...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-bg-raised rounded-full h-2">
                    <div
                      className="bg-brand h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }
)
LoadingOverlay.displayName = "LoadingOverlay"

export { LoadingOverlay, loadingOverlayVariants }
