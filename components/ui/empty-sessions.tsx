import { cn } from "@/lib/utils";
import React from "react";
import { Activity, Calendar, Filter, RefreshCw } from "lucide-react";

interface EmptySessionsProps {
  title?: string;
  message?: string;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
  onAdjustFilters?: () => void;
  onViewCalendar?: () => void;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  dateRange?: string;
}

const variantStyles = {
  default: "p-8",
  compact: "p-4",
  detailed: "p-12",
};

export function EmptySessions({
  title = "No sessions found",
  message,
  showRefreshButton = true,
  onRefresh,
  onAdjustFilters,
  onViewCalendar,
  className,
  variant = "default",
  dateRange,
}: EmptySessionsProps) {
  const defaultMessage = dateRange
    ? `No training sessions found for ${dateRange}. Try adjusting your filters or selecting a different date range.`
    : "No training sessions found for the selected period. Try adjusting your filters or selecting a different date range.";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variantStyles[variant],
        className
      )}
    >
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-bg-raised rounded-full flex items-center justify-center mb-4">
          <Activity className="h-8 w-8 text-text-2" />
        </div>
        <h3 className="text-lg font-semibold text-text-1 mb-2">{title}</h3>
        <p className="text-text-2 max-w-md">{message || defaultMessage}</p>
      </div>

      <div className="space-y-3">
        {showRefreshButton && onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        )}

        {onAdjustFilters && (
          <button
            onClick={onAdjustFilters}
            className="flex items-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
          >
            <Filter className="h-4 w-4" />
            Adjust Filters
          </button>
        )}

        {onViewCalendar && (
          <button
            onClick={onViewCalendar}
            className="flex items-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
          >
            <Calendar className="h-4 w-4" />
            View Calendar
          </button>
        )}
      </div>

      {variant === "detailed" && (
        <div className="mt-8 p-4 bg-bg-raised rounded-lg max-w-md">
          <h4 className="font-medium text-text-1 mb-2">Tips for finding sessions:</h4>
          <ul className="text-sm text-text-2 space-y-1 text-left">
            <li>• Check if you have sessions in a different date range</li>
            <li>• Try adjusting your sport or activity filters</li>
            <li>• Make sure you're looking at the right time period</li>
            <li>• Check if sessions are marked as completed or planned</li>
          </ul>
        </div>
      )}
    </div>
  );
}
