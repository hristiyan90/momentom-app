import { cn } from "@/lib/utils";
import React from "react";
import { Library, Search, Plus, Upload, BookOpen } from "lucide-react";

interface EmptyLibraryProps {
  title?: string;
  message?: string;
  showCreateButton?: boolean;
  onCreateWorkout?: () => void;
  onUploadWorkout?: () => void;
  onBrowseTemplates?: () => void;
  onSearchWorkouts?: () => void;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  libraryType?: "workouts" | "templates" | "exercises";
}

const variantStyles = {
  default: "p-8",
  compact: "p-4",
  detailed: "p-12",
};

const libraryTypeConfig = {
  workouts: {
    title: "No workouts in library",
    message: "Build your workout library by creating or importing workouts.",
    cta: "Create Workout",
  },
  templates: {
    title: "No workout templates",
    message: "Create reusable workout templates to speed up your planning.",
    cta: "Create Template",
  },
  exercises: {
    title: "No exercises available",
    message: "Add exercises to your library to build comprehensive workouts.",
    cta: "Add Exercise",
  },
};

export function EmptyLibrary({
  title,
  message,
  showCreateButton = true,
  onCreateWorkout,
  onUploadWorkout,
  onBrowseTemplates,
  onSearchWorkouts,
  className,
  variant = "default",
  libraryType = "workouts",
}: EmptyLibraryProps) {
  const config = libraryTypeConfig[libraryType];

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
          <Library className="h-8 w-8 text-text-2" />
        </div>
        <h3 className="text-lg font-semibold text-text-1 mb-2">
          {title || config.title}
        </h3>
        <p className="text-text-2 max-w-md">
          {message || config.message}
        </p>
      </div>

      <div className="space-y-3">
        {showCreateButton && onCreateWorkout && (
          <button
            onClick={onCreateWorkout}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            {config.cta}
          </button>
        )}

        {onUploadWorkout && (
          <button
            onClick={onUploadWorkout}
            className="flex items-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Workout
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

        {onSearchWorkouts && (
          <button
            onClick={onSearchWorkouts}
            className="flex items-center gap-2 px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
          >
            <Search className="h-4 w-4" />
            Search Workouts
          </button>
        )}
      </div>

      {variant === "detailed" && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="flex flex-col items-center p-4 bg-bg-raised rounded-lg">
            <Plus className="h-6 w-6 text-brand mb-2" />
            <h4 className="font-medium text-text-1 mb-1">Create New</h4>
            <p className="text-sm text-text-2">Build custom workouts from scratch</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-bg-raised rounded-lg">
            <Upload className="h-6 w-6 text-brand mb-2" />
            <h4 className="font-medium text-text-1 mb-1">Import Existing</h4>
            <p className="text-sm text-text-2">Upload TCX/GPX files or templates</p>
          </div>
        </div>
      )}
    </div>
  );
}
