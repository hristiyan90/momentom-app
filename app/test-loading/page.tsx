"use client"

import { useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { ErrorState, ErrorCard, NetworkError, ServerError, ErrorBoundary } from "@/components/ui/error"
import { EmptyWorkouts, EmptySessions, EmptyProgress, EmptyPlan, EmptyLibrary } from "@/components/ui/empty"

export default function TestLoadingPage() {
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayProgress, setOverlayProgress] = useState(0)
  const [showErrorState, setShowErrorState] = useState(false)
  const [showErrorCard, setShowErrorCard] = useState(false)
  const [showNetworkError, setShowNetworkError] = useState(false)
  const [showServerError, setShowServerError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const simulateProgress = () => {
    setShowOverlay(true)
    setOverlayProgress(0)
    
    const interval = setInterval(() => {
      setOverlayProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setShowOverlay(false), 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="min-h-screen bg-bg-app p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-1 mb-2">Loading, Error & Empty Components Test</h1>
          <p className="text-text-2">Testing all B3a loading, error, and empty state components</p>
        </div>

        {/* LoadingSpinner Tests */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-1">LoadingSpinner Component</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-surface border border-border-weak rounded-lg p-4 text-center">
              <h3 className="text-sm font-medium text-text-2 mb-2">Small</h3>
              <LoadingSpinner size="sm" />
            </div>
            <div className="bg-bg-surface border border-border-weak rounded-lg p-4 text-center">
              <h3 className="text-sm font-medium text-text-2 mb-2">Medium</h3>
              <LoadingSpinner size="md" />
            </div>
            <div className="bg-bg-surface border border-border-weak rounded-lg p-4 text-center">
              <h3 className="text-sm font-medium text-text-2 mb-2">Large</h3>
              <LoadingSpinner size="lg" />
            </div>
            <div className="bg-bg-surface border border-border-weak rounded-lg p-4 text-center">
              <h3 className="text-sm font-medium text-text-2 mb-2">With Text</h3>
              <LoadingSpinner size="md" text="Loading..." />
            </div>
          </div>
        </section>

        {/* SkeletonCard Tests */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-1">SkeletonCard Component</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Basic Card</h3>
              <SkeletonCard />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">With Avatar</h3>
              <SkeletonCard showAvatar />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">With Buttons</h3>
              <SkeletonCard showButtons buttonCount={2} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Custom Lines</h3>
              <SkeletonCard lines={4} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Full Featured</h3>
              <SkeletonCard showAvatar showButtons buttonCount={3} lines={5} />
            </div>
          </div>
        </section>

        {/* SkeletonTable Tests */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-1">SkeletonTable Component</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Basic Table</h3>
              <SkeletonTable />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Custom Columns/Rows</h3>
              <SkeletonTable columns={5} rows={4} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">With Header</h3>
              <SkeletonTable showHeader />
            </div>
          </div>
        </section>

        {/* LoadingOverlay Tests */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-1">LoadingOverlay Component</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setShowOverlay(true)}
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
              >
                Show Overlay
              </button>
              <button
                onClick={simulateProgress}
                className="px-4 py-2 bg-bg-raised text-text-1 rounded-lg hover:bg-bg-surface transition-colors"
              >
                Simulate Progress
              </button>
            </div>
            <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
              <h3 className="text-sm font-medium text-text-2 mb-2">Overlay Controls</h3>
              <p className="text-text-2 text-sm">
                Use the buttons above to test the loading overlay. The progress simulation will show a progress bar.
              </p>
            </div>
          </div>
        </section>

        {/* Error Components */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-1">Error Components</h2>
          
          {/* ErrorCard Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">ErrorCard Component</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-text-2 mb-2">Default Error</h4>
                  <ErrorCard
                    title="Validation Error"
                    message="Please check your input and try again."
                    onRetry={() => console.log("Retry clicked")}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-2 mb-2">With Icon</h4>
                  <ErrorCard
                    title="Network Error"
                    message="Unable to connect to the server."
                    variant="error"
                    onRetry={() => console.log("Retry clicked")}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-2 mb-2">Warning</h4>
                  <ErrorCard
                    title="Warning"
                    message="This action cannot be undone."
                    variant="warning"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-2 mb-2">Info</h4>
                  <ErrorCard
                    title="Information"
                    message="Please review the changes before proceeding."
                    variant="info"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* NetworkError Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">NetworkError Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-text-2 mb-2">Default</h4>
                <NetworkError onRetry={() => console.log("Network retry clicked")} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-2 mb-2">Custom Message</h4>
                <NetworkError 
                  message="Connection timeout. Please check your internet connection."
                  onRetry={() => console.log("Network retry clicked")}
                />
              </div>
            </div>
          </div>

          {/* ServerError Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">ServerError Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-text-2 mb-2">Default</h4>
                <ServerError onRetry={() => console.log("Server retry clicked")} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-2 mb-2">Custom Message</h4>
                <ServerError 
                  message="Internal server error. Our team has been notified."
                  onRetry={() => console.log("Server retry clicked")}
                />
              </div>
            </div>
          </div>

          {/* ErrorState Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">ErrorState Component</h3>
            <div className="space-y-4">
              <button
                onClick={() => setShowErrorState(!showErrorState)}
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
              >
                {showErrorState ? "Hide" : "Show"} Error State
              </button>
              {showErrorState && (
                <ErrorState
                  title="Something went wrong"
                  message="We encountered an unexpected error. Please try again."
                  onRetry={() => {
                    console.log("Error state retry clicked")
                    setShowErrorState(false)
                  }}
                />
              )}
            </div>
          </div>
        </section>

        {/* Empty Components */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-1">Empty State Components</h2>
          
          {/* EmptyWorkouts Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">EmptyWorkouts Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Default</h4>
                <EmptyWorkouts
                  onCreateWorkout={() => console.log("Create workout clicked")}
                  onViewCalendar={() => console.log("View calendar clicked")}
                />
              </div>
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Compact</h4>
                <EmptyWorkouts
                  variant="compact"
                  onCreateWorkout={() => console.log("Create workout clicked")}
                />
              </div>
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Detailed</h4>
                <EmptyWorkouts
                  variant="detailed"
                  onCreateWorkout={() => console.log("Create workout clicked")}
                  onViewCalendar={() => console.log("View calendar clicked")}
                />
              </div>
            </div>
          </div>

          {/* EmptySessions Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">EmptySessions Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Default</h4>
                <EmptySessions
                  dateRange="this week"
                  onRefresh={() => console.log("Refresh clicked")}
                  onAdjustFilters={() => console.log("Adjust filters clicked")}
                />
              </div>
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Detailed</h4>
                <EmptySessions
                  variant="detailed"
                  dateRange="last month"
                  onRefresh={() => console.log("Refresh clicked")}
                  onAdjustFilters={() => console.log("Adjust filters clicked")}
                  onViewCalendar={() => console.log("View calendar clicked")}
                />
              </div>
            </div>
          </div>

          {/* EmptyProgress Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">EmptyProgress Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Progress</h4>
                <EmptyProgress
                  dataType="progress"
                  onCreateSession={() => console.log("Create session clicked")}
                  onViewPlan={() => console.log("View plan clicked")}
                />
              </div>
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Analytics</h4>
                <EmptyProgress
                  dataType="analytics"
                  onCreateSession={() => console.log("Create session clicked")}
                  onImportData={() => console.log("Import data clicked")}
                />
              </div>
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Performance</h4>
                <EmptyProgress
                  dataType="performance"
                  variant="detailed"
                  onCreateSession={() => console.log("Create session clicked")}
                  onViewPlan={() => console.log("View plan clicked")}
                  onImportData={() => console.log("Import data clicked")}
                />
              </div>
            </div>
          </div>

          {/* EmptyPlan Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">EmptyPlan Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Training</h4>
                <EmptyPlan
                  planType="training"
                  onCreatePlan={() => console.log("Create plan clicked")}
                  onBrowseTemplates={() => console.log("Browse templates clicked")}
                />
              </div>
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Nutrition</h4>
                <EmptyPlan
                  planType="nutrition"
                  onCreatePlan={() => console.log("Create plan clicked")}
                  onConfigureGoals={() => console.log("Configure goals clicked")}
                />
              </div>
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Recovery</h4>
                <EmptyPlan
                  planType="recovery"
                  variant="detailed"
                  onCreatePlan={() => console.log("Create plan clicked")}
                  onBrowseTemplates={() => console.log("Browse templates clicked")}
                  onConfigureGoals={() => console.log("Configure goals clicked")}
                />
              </div>
            </div>
          </div>

          {/* EmptyLibrary Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">EmptyLibrary Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Workouts</h4>
                <EmptyLibrary
                  libraryType="workouts"
                  onCreateWorkout={() => console.log("Create workout clicked")}
                  onUploadWorkout={() => console.log("Upload workout clicked")}
                />
              </div>
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Templates</h4>
                <EmptyLibrary
                  libraryType="templates"
                  onCreateWorkout={() => console.log("Create template clicked")}
                  onBrowseTemplates={() => console.log("Browse templates clicked")}
                />
              </div>
              <div className="bg-bg-surface border border-border-weak rounded-lg">
                <h4 className="text-sm font-medium text-text-2 mb-2 p-4 pb-0">Exercises</h4>
                <EmptyLibrary
                  libraryType="exercises"
                  variant="detailed"
                  onCreateWorkout={() => console.log("Add exercise clicked")}
                  onUploadWorkout={() => console.log("Upload exercise clicked")}
                  onSearchWorkouts={() => console.log("Search exercises clicked")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Integration Test */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-1">Integration Test</h2>
          <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
            <h3 className="text-lg font-medium text-text-1 mb-4">Mock Dashboard Loading State</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard showAvatar lines={3} />
              <SkeletonCard showButtons buttonCount={2} lines={4} />
              <SkeletonCard lines={2} />
            </div>
            <div className="mt-6">
              <SkeletonTable columns={4} rows={3} />
            </div>
            <div className="mt-6 text-center">
              <LoadingSpinner text="Loading dashboard data..." />
            </div>
          </div>
        </section>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={showOverlay}
        text={overlayProgress > 0 ? "Processing data..." : "Loading..."}
        showProgress={overlayProgress > 0}
        progress={overlayProgress}
        spinnerVariant="primary"
      />
    </div>
  )
}