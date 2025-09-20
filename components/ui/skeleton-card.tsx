import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const skeletonCardVariants = cva(
  "animate-pulse bg-bg-raised rounded-lg border border-border-weak",
  {
    variants: {
      size: {
        sm: "p-3",
        md: "p-4", 
        lg: "p-6",
        xl: "p-8",
      },
      variant: {
        default: "bg-bg-raised",
        surface: "bg-bg-surface",
        raised: "bg-bg-raised",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface SkeletonCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonCardVariants> {
  /**
   * Number of skeleton lines to display
   */
  lines?: number
  /**
   * Whether to show a skeleton avatar/icon
   */
  showAvatar?: boolean
  /**
   * Whether to show skeleton buttons
   */
  showButtons?: boolean
  /**
   * Number of skeleton buttons to show
   */
  buttonCount?: number
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ 
    className, 
    size, 
    variant, 
    lines = 3, 
    showAvatar = false, 
    showButtons = false, 
    buttonCount = 2,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonCardVariants({ size, variant }), className)}
        {...props}
      >
        <div className="space-y-3">
          {/* Header with optional avatar */}
          <div className="flex items-center gap-3">
            {showAvatar && (
              <div className="h-8 w-8 rounded-full bg-text-3/20" />
            )}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-text-3/20 rounded w-3/4" />
              <div className="h-3 bg-text-3/10 rounded w-1/2" />
            </div>
          </div>

          {/* Content lines */}
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-3 bg-text-3/20 rounded",
                  i === lines - 1 && "w-2/3" // Last line is shorter
                )}
              />
            ))}
          </div>

          {/* Optional buttons */}
          {showButtons && (
            <div className="flex gap-2 pt-2">
              {Array.from({ length: buttonCount }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-text-3/20 rounded w-20"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)
SkeletonCard.displayName = "SkeletonCard"

export { SkeletonCard, skeletonCardVariants }
