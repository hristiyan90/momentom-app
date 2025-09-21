import { cn } from "@/lib/utils";
import React from "react";
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  showRetry?: boolean;
  showRefresh?: boolean;
  showGoBack?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  className?: string;
  variant?: "default" | "network" | "server" | "validation" | "permission";
}

const variantStyles = {
  default: "text-red-600 bg-red-50 border-red-200",
  network: "text-orange-600 bg-orange-50 border-orange-200",
  server: "text-red-600 bg-red-50 border-red-200",
  validation: "text-yellow-600 bg-yellow-50 border-yellow-200",
  permission: "text-purple-600 bg-purple-50 border-purple-200",
};

const variantIcons = {
  default: AlertTriangle,
  network: AlertTriangle,
  server: AlertTriangle,
  validation: AlertTriangle,
  permission: AlertTriangle,
};

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  error,
  showRetry = true,
  showRefresh = true,
  showGoBack = true,
  showHome = true,
  onRetry,
  onRefresh,
  onGoBack,
  onGoHome,
  className,
  variant = "default",
}: ErrorStateProps) {
  const Icon = variantIcons[variant];
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        className
      )}
    >
      <div
        className={cn(
          "max-w-md w-full rounded-lg border p-6 text-center",
          variantStyles[variant]
        )}
      >
        <div className="flex justify-center mb-4">
          <Icon className="h-12 w-12" />
        </div>
        
        <h1 className="text-xl font-semibold mb-2">{title}</h1>
        
        <p className="text-sm mb-4 text-text-2">
          {message}
        </p>
        
        {errorMessage && (
          <details className="mb-4 text-left">
            <summary className="text-xs cursor-pointer hover:text-text-1">
              Error details
            </summary>
            <pre className="mt-2 text-xs bg-bg-raised p-2 rounded overflow-auto">
              {errorMessage}
            </pre>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
          
          {showRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </button>
          )}
          
          {showGoBack && onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          )}
          
          {showHome && onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
            >
              <Home className="h-4 w-4" />
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
