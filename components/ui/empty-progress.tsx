import { cn } from "@/lib/utils";
import React from "react";
import { TrendingUp, BarChart3, Target, Activity } from "lucide-react";

interface EmptyProgressProps {
  title?: string;
  message?: string;
  showCreateSession?: boolean;
  onCreateSession?: () => void;
  onViewPlan?: () => void;
  onImportData?: () => void;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  dataType?: "progress" | "analytics" | "performance";
}

const variantStyles = {
  default: "p-8",
  compact: "p-4",
  detailed: "p-12",
};

const dataTypeConfig = {
  progress: {
    icon: TrendingUp,
    title: "No progress data",
    message: "Start tracking your workouts to see your progress over time.",
    cta: "Start Training",
  },
  analytics: {
    icon: BarChart3,
    title: "No analytics available",
    message: "Complete some workouts to see detailed analytics and insights.",
    cta: "View Workouts",
  },
  performance: {
    icon: Target,
    title: "No performance data",
    message: "Record your training sessions to track your performance metrics.",
    cta: "Record Session",
  },
};

export function EmptyProgress({
  title,
  message,
  showCreateSession = true,
  onCreateSession,
  onViewPlan,
  onImportData,
  className,
  variant = "default",
  dataType = "progress",
}: EmptyProgressProps) {
  const config = dataTypeConfig[dataType];
  const Icon = config.icon;

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
          <Icon className="h-8 w-8 text-text-2" />
        </div>
        <h3 className="text-lg font-semibold text-text-1 mb-2">
          {title || config.title}
        </h3>
        <p className="text-text-2 max-w-md">
          {message || config.message}
        </p>
      </div>

      <div className="space-y-3">
        {showCreateSession && onCreateSession && (
          <button
            onClick={onCreateSession}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
          >
            <Activity className="h-4 w-4" />
            {config.cta}
          </button>
        )}

        {onViewPlan && (
          <button
            onClick={onViewPlan}
            className="flex items-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
          >
            <Target className="h-4 w-4" />
            View Training Plan
          </button>
        )}

        {onImportData && (
          <button
            onClick={onImportData}
            className="flex items-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Import Data
          </button>
        )}
      </div>

      {variant === "detailed" && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="flex flex-col items-center p-4 bg-bg-raised rounded-lg">
            <Activity className="h-6 w-6 text-brand mb-2" />
            <h4 className="font-medium text-text-1 mb-1">Complete Workouts</h4>
            <p className="text-sm text-text-2">Finish your planned training sessions</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-bg-raised rounded-lg">
            <TrendingUp className="h-6 w-6 text-brand mb-2" />
            <h4 className="font-medium text-text-1 mb-1">Track Metrics</h4>
            <p className="text-sm text-text-2">Record your performance data</p>
          </div>
        </div>
      )}
    </div>
  );
}
