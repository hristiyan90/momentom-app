import { cn } from "@/lib/utils";
import React from "react";
import { BookOpen, Calendar, Target, Plus, Settings } from "lucide-react";

interface EmptyPlanProps {
  title?: string;
  message?: string;
  showCreatePlan?: boolean;
  onCreatePlan?: () => void;
  onBrowseTemplates?: () => void;
  onConfigureGoals?: () => void;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  planType?: "training" | "nutrition" | "recovery";
}

const variantStyles = {
  default: "p-8",
  compact: "p-4",
  detailed: "p-12",
};

const planTypeConfig = {
  training: {
    title: "No training plan",
    message: "Create a personalized training plan to reach your fitness goals.",
    cta: "Create Plan",
  },
  nutrition: {
    title: "No nutrition plan",
    message: "Set up your nutrition plan to support your training and recovery.",
    cta: "Set Up Nutrition",
  },
  recovery: {
    title: "No recovery plan",
    message: "Plan your recovery strategies to optimize your performance.",
    cta: "Plan Recovery",
  },
};

export function EmptyPlan({
  title,
  message,
  showCreatePlan = true,
  onCreatePlan,
  onBrowseTemplates,
  onConfigureGoals,
  className,
  variant = "default",
  planType = "training",
}: EmptyPlanProps) {
  const config = planTypeConfig[planType];

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
          <BookOpen className="h-8 w-8 text-text-2" />
        </div>
        <h3 className="text-lg font-semibold text-text-1 mb-2">
          {title || config.title}
        </h3>
        <p className="text-text-2 max-w-md">
          {message || config.message}
        </p>
      </div>

      <div className="space-y-3">
        {showCreatePlan && onCreatePlan && (
          <button
            onClick={onCreatePlan}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            {config.cta}
          </button>
        )}

        {onBrowseTemplates && (
          <button
            onClick={onBrowseTemplates}
            className="flex items-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Browse Templates
          </button>
        )}

        {onConfigureGoals && (
          <button
            onClick={onConfigureGoals}
            className="flex items-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
          >
            <Settings className="h-4 w-4" />
            Configure Goals
          </button>
        )}
      </div>

      {variant === "detailed" && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          <div className="flex flex-col items-center p-4 bg-bg-raised rounded-lg">
            <Target className="h-6 w-6 text-brand mb-2" />
            <h4 className="font-medium text-text-1 mb-1">Set Goals</h4>
            <p className="text-sm text-text-2">Define what you want to achieve</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-bg-raised rounded-lg">
            <Calendar className="h-6 w-6 text-brand mb-2" />
            <h4 className="font-medium text-text-1 mb-1">Plan Schedule</h4>
            <p className="text-sm text-text-2">Structure your training timeline</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-bg-raised rounded-lg">
            <BookOpen className="h-6 w-6 text-brand mb-2" />
            <h4 className="font-medium text-text-1 mb-1">Track Progress</h4>
            <p className="text-sm text-text-2">Monitor your plan's effectiveness</p>
          </div>
        </div>
      )}
    </div>
  );
}
