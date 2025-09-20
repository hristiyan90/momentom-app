"use client"

import { useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { ErrorState, ErrorCard, NetworkError, ServerError, ErrorBoundary } from "@/components/ui/error"

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
          <h1 className="text-3xl font-bold text-text-1 mb-2">Loading & Error Components Test</h1>
          <p className="text-text-2">Testing all B3a loading and error state components</p>
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
              <h3 className="text-sm font-medium text-text-2 mb-2">Extra Large</h3>
              <LoadingSpinner size="xl" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-bg-surface border border-border-weak rounded-lg p-4 text-center">
              <h3 className="text-sm font-medium text-text-2 mb-2">With Text</h3>
              <LoadingSpinner text="Loading data..." />
            </div>
            <div className="bg-bg-surface border border-border-weak rounded-lg p-4 text-center">
              <h3 className="text-sm font-medium text-text-2 mb-2">Success Variant</h3>
              <LoadingSpinner variant="success" text="Saving..." />
            </div>
            <div className="bg-bg-surface border border-border-weak rounded-lg p-4 text-center">
              <h3 className="text-sm font-medium text-text-2 mb-2">Warning Variant</h3>
              <LoadingSpinner variant="warning" text="Processing..." />
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
              <SkeletonCard showAvatar lines={4} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">With Buttons</h3>
              <SkeletonCard showButtons buttonCount={3} lines={2} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Large Size</h3>
              <SkeletonCard size="lg" lines={5} showAvatar showButtons />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Surface Variant</h3>
              <SkeletonCard variant="surface" lines={3} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Small Size</h3>
              <SkeletonCard size="sm" lines={2} />
            </div>
          </div>
        </section>

        {/* SkeletonTable Tests */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-1">SkeletonTable Component</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Basic Table (4 columns, 5 rows)</h3>
              <SkeletonTable />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Large Table (6 columns, 8 rows)</h3>
              <SkeletonTable columns={6} rows={8} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Striped Table</h3>
              <SkeletonTable striped />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">No Header</h3>
              <SkeletonTable showHeader={false} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-2 mb-2">Minimal Variant</h3>
              <SkeletonTable variant="minimal" />
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
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
              >
                Show Basic Overlay
              </button>
              <button
                onClick={simulateProgress}
                className="px-4 py-2 bg-status-success text-white rounded-lg hover:bg-status-success/90 transition-colors"
              >
                Show Progress Overlay
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
                <h3 className="text-sm font-medium text-text-2 mb-2">Overlay Variants</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowOverlay(true)
                      setTimeout(() => setShowOverlay(false), 2000)
                    }}
                    className="w-full px-3 py-2 text-sm bg-bg-raised border border-border-weak rounded hover:bg-bg-surface transition-colors"
                  >
                    Default Overlay
                  </button>
                  <button
                    onClick={() => {
                      setShowOverlay(true)
                      setTimeout(() => setShowOverlay(false), 2000)
                    }}
                    className="w-full px-3 py-2 text-sm bg-bg-raised border border-border-weak rounded hover:bg-bg-surface transition-colors"
                  >
                    Opaque Overlay
                  </button>
                </div>
              </div>
              
              <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
                <h3 className="text-sm font-medium text-text-2 mb-2">Spinner Variants</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowOverlay(true)
                      setTimeout(() => setShowOverlay(false), 2000)
                    }}
                    className="w-full px-3 py-2 text-sm bg-bg-raised border border-border-weak rounded hover:bg-bg-surface transition-colors"
                  >
                    Success Spinner
                  </button>
                  <button
                    onClick={() => {
                      setShowOverlay(true)
                      setTimeout(() => setShowOverlay(false), 2000)
                    }}
                    className="w-full px-3 py-2 text-sm bg-bg-raised border border-border-weak rounded hover:bg-bg-surface transition-colors"
                  >
                    Warning Spinner
                  </button>
                </div>
              </div>
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
                    onDismiss={() => setShowErrorCard(false)}
                    onRetry={() => console.log("Retry clicked")}
                    showRetry={true}
                    variant="default"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-2 mb-2">Warning Error</h4>
                  <ErrorCard
                    title="Warning"
                    message="This action cannot be undone."
                    onDismiss={() => console.log("Dismissed")}
                    variant="warning"
                    size="sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-text-2 mb-2">Danger Error</h4>
                  <ErrorCard
                    title="Critical Error"
                    message="System failure detected."
                    onDismiss={() => console.log("Dismissed")}
                    variant="danger"
                    size="lg"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-2 mb-2">Info Error</h4>
                  <ErrorCard
                    title="Information"
                    message="Please review your settings."
                    onDismiss={() => console.log("Dismissed")}
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
                <h4 className="text-sm font-medium text-text-2 mb-2">Network Error</h4>
                <NetworkError
                  title="Connection Failed"
                  message="Unable to connect to the server."
                  onRetry={() => console.log("Retry network request")}
                  onCheckConnection={() => console.log("Check connection")}
                  showConnectionCheck={true}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-2 mb-2">Offline Error</h4>
                <NetworkError
                  isOffline={true}
                  onRetry={() => console.log("Retry when online")}
                  onCheckConnection={() => console.log("Check connection")}
                />
              </div>
            </div>
          </div>

          {/* ServerError Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">ServerError Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-text-2 mb-2">500 Server Error</h4>
                <ServerError
                  statusCode={500}
                  onRetry={() => console.log("Retry server request")}
                  onReportBug={() => console.log("Report bug")}
                  showBugReport={true}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-2 mb-2">429 Rate Limited</h4>
                <ServerError
                  statusCode={429}
                  retryAfter={60}
                  onRetry={() => console.log("Retry after rate limit")}
                  onReportBug={() => console.log("Report bug")}
                />
              </div>
            </div>
          </div>

          {/* Error State Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">ErrorState Component</h3>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowErrorState(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Show Error State
                </button>
                <button
                  onClick={() => setErrorMessage("Custom error message")}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Set Custom Error
                </button>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Error
                </button>
              </div>
              
              {showErrorState && (
                <div className="border border-border-weak rounded-lg overflow-hidden">
                  <ErrorState
                    title="Test Error State"
                    message="This is a test error state for demonstration."
                    error={errorMessage}
                    onRetry={() => {
                      setShowErrorState(false);
                      setErrorMessage(null);
                    }}
                    onRefresh={() => window.location.reload()}
                    onGoBack={() => window.history.back()}
                    onGoHome={() => window.location.href = "/"}
                    variant="default"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Error Boundary Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-1">ErrorBoundary Component</h3>
            <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
              <p className="text-sm text-text-2 mb-4">
                The ErrorBoundary component catches React errors and displays a fallback UI.
                In a real application, this would catch JavaScript errors in child components.
              </p>
              <ErrorBoundary
                onError={(error, errorInfo) => {
                  console.log("Error caught by boundary:", error, errorInfo);
                }}
                resetOnPropsChange={true}
                resetKeys={["test"]}
              >
                <div className="p-4 bg-bg-raised rounded-lg">
                  <p className="text-sm text-text-1">
                    This content is wrapped in an ErrorBoundary. If an error occurs here,
                    it will be caught and displayed with a fallback UI.
                  </p>
                </div>
              </ErrorBoundary>
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
