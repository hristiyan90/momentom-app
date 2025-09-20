"use client"

import { useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { LoadingOverlay } from "@/components/ui/loading-overlay"

export default function TestLoadingPage() {
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayProgress, setOverlayProgress] = useState(0)

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
          <h1 className="text-3xl font-bold text-text-1 mb-2">Loading Components Test</h1>
          <p className="text-text-2">Testing all B3a loading state components</p>
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
