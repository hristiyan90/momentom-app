import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const skeletonTableVariants = cva(
  "w-full animate-pulse",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      variant: {
        default: "bg-bg-surface border border-border-weak rounded-lg",
        minimal: "bg-transparent",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface SkeletonTableProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonTableVariants> {
  /**
   * Number of columns in the table
   */
  columns?: number
  /**
   * Number of rows in the table
   */
  rows?: number
  /**
   * Whether to show table header skeleton
   */
  showHeader?: boolean
  /**
   * Whether to show alternating row colors
   */
  striped?: boolean
}

const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ 
    className, 
    size, 
    variant, 
    columns = 4, 
    rows = 5, 
    showHeader = true,
    striped = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonTableVariants({ size, variant }), className)}
        {...props}
      >
        <div className="overflow-hidden">
          {/* Table Header */}
          {showHeader && (
            <div className="border-b border-border-weak bg-bg-raised">
              <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, i) => (
                  <div key={i} className="h-4 bg-text-3/20 rounded w-3/4" />
                ))}
              </div>
            </div>
          )}

          {/* Table Body */}
          <div className="divide-y divide-border-weak">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className={cn(
                  "grid gap-4 p-4",
                  striped && rowIndex % 2 === 1 && "bg-bg-raised/50"
                )}
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={cn(
                      "h-4 bg-text-3/20 rounded",
                      colIndex === columns - 1 && "w-1/2", // Last column is shorter
                      colIndex === 0 && "w-3/4" // First column is longer
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)
SkeletonTable.displayName = "SkeletonTable"

export { SkeletonTable, skeletonTableVariants }
