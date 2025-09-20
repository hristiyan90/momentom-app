import { cn } from "@/lib/utils";
import React from "react";
import { AlertTriangle, X, RefreshCw } from "lucide-react";

interface ErrorCardProps {
  title?: string;
  message?: string;
  error?: Error | string;
  showDismiss?: boolean;
  showRetry?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  variant?: "default" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  default: "text-red-600 bg-red-50 border-red-200",
  warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
  danger: "text-red-600 bg-red-50 border-red-200",
  info: "text-blue-600 bg-blue-50 border-blue-200",
};

const sizeStyles = {
  sm: "p-3 text-sm",
  md: "p-4 text-base",
  lg: "p-6 text-lg",
};

export function ErrorCard({
  title = "Error",
  message,
  error,
  showDismiss = true,
  showRetry = false,
  onDismiss,
  onRetry,
  className,
  variant = "default",
  size = "md",
}: ErrorCardProps) {
  const errorMessage = error instanceof Error ? error.message : error;
  const displayMessage = message || errorMessage || "An error occurred";

  return (
    <div
      className={cn(
        "rounded-lg border flex items-start gap-3",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm opacity-90">{displayMessage}</p>
        
        {errorMessage && message && (
          <details className="mt-2">
            <summary className="text-xs cursor-pointer hover:opacity-75">
              Error details
            </summary>
            <pre className="mt-1 text-xs bg-bg-raised p-2 rounded overflow-auto">
              {errorMessage}
            </pre>
          </details>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="p-1 hover:bg-bg-raised rounded transition-colors"
            title="Retry"
            aria-label="Retry"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-bg-raised rounded transition-colors"
            title="Dismiss"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
