import { cn } from "@/lib/utils";
import React from "react";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";

interface NetworkErrorProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onCheckConnection?: () => void;
  className?: string;
  showConnectionCheck?: boolean;
  isOffline?: boolean;
}

export function NetworkError({
  title,
  message,
  error,
  onRetry,
  onCheckConnection,
  className,
  showConnectionCheck = true,
  isOffline = false,
}: NetworkErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  const defaultTitle = isOffline 
    ? "You're offline" 
    : "Network error";
    
  const defaultMessage = isOffline
    ? "Please check your internet connection and try again."
    : "There was a problem connecting to the server. Please check your connection and try again.";

  const Icon = isOffline ? WifiOff : Wifi;

  return (
    <div
      className={cn(
        "rounded-lg border p-6 text-center",
        "text-orange-600 bg-orange-50 border-orange-200",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex justify-center mb-4">
        <Icon className="h-12 w-12" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {title || defaultTitle}
      </h3>
      
      <p className="text-sm mb-4 text-text-2">
        {message || defaultMessage}
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
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
        
        {showConnectionCheck && onCheckConnection && (
          <button
            onClick={onCheckConnection}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
          >
            <Wifi className="h-4 w-4" />
            Check Connection
          </button>
        )}
      </div>
      
      {isOffline && (
        <div className="mt-4 p-3 bg-bg-raised rounded-lg">
          <div className="flex items-center gap-2 text-sm text-text-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Make sure you're connected to the internet</span>
          </div>
        </div>
      )}
    </div>
  );
}
