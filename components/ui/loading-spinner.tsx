import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const loadingSpinnerVariants = cva(
  "animate-spin rounded-full border-solid",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2", 
        lg: "h-8 w-8 border-2",
        xl: "h-12 w-12 border-3",
      },
      variant: {
        default: "border-text-3 border-t-brand",
        primary: "border-text-3 border-t-brand",
        secondary: "border-text-3 border-t-text-2",
        success: "border-text-3 border-t-status-success",
        warning: "border-text-3 border-t-status-caution",
        danger: "border-text-3 border-t-status-danger",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingSpinnerVariants> {
  /**
   * Optional text to display below the spinner
   */
  text?: string
  /**
   * Whether to center the spinner and text
   */
  centered?: boolean
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, text, centered = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center gap-2",
          centered && "justify-center",
          className
        )}
        {...props}
      >
        <div className={cn(loadingSpinnerVariants({ size, variant }))} />
        {text && (
          <span className="text-text-2 text-sm animate-pulse">
            {text}
          </span>
        )}
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner, loadingSpinnerVariants }
