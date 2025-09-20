import { cn } from "@/lib/utils";
import React from "react";
import { Server, AlertTriangle, RefreshCw, Clock } from "lucide-react";

interface ServerErrorProps {
  title?: string;
  message?: string;
  error?: Error | string;
  statusCode?: number;
  onRetry?: () => void;
  onReportBug?: () => void;
  className?: string;
  showBugReport?: boolean;
  retryAfter?: number; // seconds
}

const getStatusMessage = (statusCode?: number): string => {
  switch (statusCode) {
    case 500:
      return "Internal server error. Our team has been notified.";
    case 502:
      return "Bad gateway. The server is temporarily unavailable.";
    case 503:
      return "Service unavailable. Please try again later.";
    case 504:
      return "Gateway timeout. The server took too long to respond.";
    case 429:
      return "Too many requests. Please wait before trying again.";
    default:
      return "Server error occurred. Please try again.";
  }
};

const getStatusTitle = (statusCode?: number): string => {
  switch (statusCode) {
    case 500:
      return "Server Error";
    case 502:
      return "Bad Gateway";
    case 503:
      return "Service Unavailable";
    case 504:
      return "Gateway Timeout";
    case 429:
      return "Rate Limited";
    default:
      return "Server Error";
  }
};

export function ServerError({
  title,
  message,
  error,
  statusCode,
  onRetry,
  onReportBug,
  className,
  showBugReport = true,
  retryAfter,
}: ServerErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error;
  const displayTitle = title || getStatusTitle(statusCode);
  const displayMessage = message || getStatusMessage(statusCode);

  return (
    <div
      className={cn(
        "rounded-lg border p-6 text-center",
        "text-red-600 bg-red-50 border-red-200",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex justify-center mb-4">
        <Server className="h-12 w-12" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {displayTitle}
        {statusCode && (
          <span className="ml-2 text-sm font-normal text-text-2">
            ({statusCode})
          </span>
        )}
      </h3>
      
      <p className="text-sm mb-4 text-text-2">
        {displayMessage}
      </p>
      
      {retryAfter && retryAfter > 0 && (
        <div className="mb-4 p-3 bg-bg-raised rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-text-2">
            <Clock className="h-4 w-4" />
            <span>Please try again in {retryAfter} seconds</span>
          </div>
        </div>
      )}
      
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
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
            disabled={retryAfter && retryAfter > 0}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
        
        {showBugReport && onReportBug && (
          <button
            onClick={onReportBug}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            Report Bug
          </button>
        )}
      </div>
      
      {statusCode && statusCode >= 500 && (
        <div className="mt-4 p-3 bg-bg-raised rounded-lg">
          <div className="flex items-center gap-2 text-sm text-text-2">
            <AlertTriangle className="h-4 w-4" />
            <span>This error has been automatically reported to our team</span>
          </div>
        </div>
      )}
    </div>
  );
}
