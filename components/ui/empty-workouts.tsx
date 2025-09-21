import { cn } from "@/lib/utils";
import React from "react";
import { Calendar, Plus, Clock, Target } from "lucide-react";

interface EmptyWorkoutsProps {
  title?: string;
  message?: string;
  showCreateButton?: boolean;
  onCreateWorkout?: () => void;
  onViewCalendar?: () => void;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

const variantStyles = {
  default: "p-8",
  compact: "p-4",
  detailed: "p-12",
};

export function EmptyWorkouts({
  title = "No workouts scheduled",
  message = "You don't have any workouts planned for this period. Create your first workout to get started!",
  showCreateButton = true,
  onCreateWorkout,
  onViewCalendar,
  className,
  variant = "default",
}: EmptyWorkoutsProps) {
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
          <Calendar className="h-8 w-8 text-text-2" />
        </div>
        <h3 className="text-lg font-semibold text-text-1 mb-2">{title}</h3>
        <p className="text-text-2 max-w-md">{message}</p>
      </div>

      <div className="space-y-3">
        {showCreateButton && onCreateWorkout && (
          <button
            onClick={onCreateWorkout}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Workout
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          <div className="flex flex-col items-center p-4 bg-bg-raised rounded-lg">
            <Clock className="h-6 w-6 text-brand mb-2" />
            <h4 className="font-medium text-text-1 mb-1">Plan Your Training</h4>
            <p className="text-sm text-text-2">Schedule workouts based on your goals</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-bg-raised rounded-lg">
            <Target className="h-6 w-6 text-brand mb-2" />
            <h4 className="font-medium text-text-1 mb-1">Track Progress</h4>
            <p className="text-sm text-text-2">Monitor your performance over time</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-bg-raised rounded-lg">
            <Calendar className="h-6 w-6 text-brand mb-2" />
            <h4 className="font-medium text-text-1 mb-1">Stay Consistent</h4>
            <p className="text-sm text-text-2">Build a regular training routine</p>
          </div>
        </div>
      )}
    </div>
  );
}
