"use client"

import { useState, useEffect } from "react"

export default function ThemePage() {
  const [currentTheme, setCurrentTheme] = useState("theme-default")

  useEffect(() => {
    // Apply theme to the body element
    document.body.className = document.body.className.replace(/theme-\w+/g, '') + ` ${currentTheme}`
  }, [currentTheme])

  const themes = [
    { id: "theme-default", name: "Default", description: "Original cyan/blue theme" },
    { id: "theme-contrast", name: "High Contrast", description: "Vibrant, high-contrast colors" },
    { id: "theme-alt", name: "Alternative", description: "Warm orange/blue theme" },
  ]

  return (
    <div className="min-h-screen bg-bg text-text-primary p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Color System Sandbox</h1>
          <p className="text-text-secondary text-lg">Visual verification of design tokens and UI components</p>
          
          {/* Theme Preview Controls */}
          <div className="mt-8 p-6 bg-bg-surface border border-border rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Theme Preview (Dev Only)</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setCurrentTheme(theme.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    currentTheme === theme.id
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border text-text-secondary hover:border-brand/50 hover:text-brand"
                  }`}
                >
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-xs opacity-75">{theme.description}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-text-dim mt-3 text-center">
              Click buttons above to preview different theme variations. Changes are temporary and only affect this page.
            </p>
          </div>
        </div>

        {/* Brand Colors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">Brand / Accent</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-brand"></div>
              <p className="text-sm text-text-secondary">--brand</p>
              <p className="text-xs text-muted">#22D3EE</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-brand-hover"></div>
              <p className="text-sm text-text-secondary">--brand-hover</p>
              <p className="text-xs text-muted">#0EA5B7</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-brand-pressed"></div>
              <p className="text-sm text-text-secondary">--brand-pressed</p>
              <p className="text-xs text-muted">#0891B2</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-focus"></div>
              <p className="text-sm text-text-secondary">--focus</p>
              <p className="text-xs text-muted">#38BDF8</p>
            </div>
          </div>
        </section>

        {/* Neutrals */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">Neutrals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-bg border border-border"></div>
              <p className="text-sm text-text-secondary">--bg</p>
              <p className="text-xs text-muted">#0B0F14</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-surface border border-border"></div>
              <p className="text-sm text-text-secondary">--surface</p>
              <p className="text-xs text-muted">#10151C</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-surface-2 border border-border"></div>
              <p className="text-sm text-text-secondary">--surface-2</p>
              <p className="text-xs text-muted">#161C24</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-border"></div>
              <p className="text-sm text-text-secondary">--border</p>
              <p className="text-xs text-muted">#1F2937</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-text-primary"></div>
              <p className="text-sm text-text-secondary">--text-primary</p>
              <p className="text-xs text-muted">#E6EAF2</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-text-secondary"></div>
              <p className="text-sm text-text-secondary">--text-secondary</p>
              <p className="text-xs text-muted">#9AA6B2</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-muted"></div>
              <p className="text-sm text-text-secondary">--muted</p>
              <p className="text-xs text-muted">#64748B</p>
            </div>
          </div>
        </section>

        {/* Sports */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">Sports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-sport-swim"></div>
              <p className="text-sm text-text-secondary">--sport-swim</p>
              <p className="text-xs text-muted">#1E40AF</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-sport-bike"></div>
              <p className="text-sm text-text-secondary">--sport-bike</p>
              <p className="text-xs text-muted">#FF3EB5</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-sport-run"></div>
              <p className="text-sm text-text-secondary">--sport-run</p>
              <p className="text-xs text-muted">#00E6B8</p>
            </div>
          </div>
        </section>

        {/* Zones */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">Training Zones</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-zone-1"></div>
              <p className="text-sm text-text-secondary">--zone-1</p>
              <p className="text-xs text-muted">#22D3EE</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-zone-2"></div>
              <p className="text-sm text-text-secondary">--zone-2</p>
              <p className="text-xs text-muted">#3B82F6</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-zone-3"></div>
              <p className="text-sm text-text-secondary">--zone-3</p>
              <p className="text-xs text-muted">#8B5CF6</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-zone-4"></div>
              <p className="text-sm text-text-secondary">--zone-4</p>
              <p className="text-xs text-muted">#EC4899</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-zone-5"></div>
              <p className="text-sm text-text-secondary">--zone-5</p>
              <p className="text-xs text-muted">#EF4444</p>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">Status Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-status-success"></div>
              <p className="text-sm text-text-secondary">--status-success</p>
              <p className="text-xs text-muted">#22C55E</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-status-caution"></div>
              <p className="text-sm text-text-secondary">--status-caution</p>
              <p className="text-xs text-muted">#FACC15</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-status-alert"></div>
              <p className="text-sm text-text-secondary">--status-alert</p>
              <p className="text-xs text-muted">#FB923C</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-status-danger"></div>
              <p className="text-sm text-text-secondary">--status-danger</p>
              <p className="text-xs text-muted">#DC2626</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-status-info"></div>
              <p className="text-sm text-text-secondary">--status-info</p>
              <p className="text-xs text-muted">#38BDF8</p>
            </div>
          </div>
        </section>

        {/* Load */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">Load Severity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-load-low"></div>
              <p className="text-sm text-text-secondary">--load-low</p>
              <p className="text-xs text-muted">#64748B</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-load-elevated"></div>
              <p className="text-sm text-text-secondary">--load-elevated</p>
              <p className="text-xs text-muted">#FACC15</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-load-high"></div>
              <p className="text-sm text-text-secondary">--load-high</p>
              <p className="text-xs text-muted">#FB923C</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-load-extreme"></div>
              <p className="text-sm text-text-secondary">--load-extreme</p>
              <p className="text-xs text-muted">#DC2626</p>
            </div>
          </div>
        </section>

        {/* UI Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">UI Components</h2>
          
          {/* Chips */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Chips</h3>
            <div className="flex flex-wrap gap-3">
              <div className="chip chip-sport-swim">Swim</div>
              <div className="chip chip-sport-bike">Bike</div>
              <div className="chip chip-sport-run">Run</div>
            </div>
          </div>

          {/* Zone Chips */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Zone Chips</h3>
            <div className="flex flex-wrap gap-3">
              <div className="chip chip-zone-z1">Z1</div>
              <div className="chip chip-zone-z2">Z2</div>
              <div className="chip chip-zone-z3">Z3</div>
              <div className="chip chip-zone-z4">Z4</div>
              <div className="chip chip-zone-z5">Z5</div>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Badges</h3>
            <div className="flex flex-wrap gap-3">
              <div className="badge badge-good">Good</div>
              <div className="badge badge-ok">OK</div>
              <div className="badge badge-low">Low</div>
              <div className="badge badge-critical">Critical</div>
              <div className="badge badge-info">Info</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn">Secondary</button>
              <button className="btn btn-primary">Primary</button>
            </div>
          </div>

          {/* Intensity Bar */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Intensity Bar</h3>
            <div className="intensity-bar">
              <div className="intensity-segment" data-zone="1" style={{width: '20%'}}></div>
              <div className="intensity-segment" data-zone="2" style={{width: '25%'}}></div>
              <div className="intensity-segment" data-zone="3" style={{width: '20%'}}></div>
              <div className="intensity-segment" data-zone="4" style={{width: '20%'}}></div>
              <div className="intensity-segment" data-zone="5" style={{width: '15%'}}></div>
            </div>
          </div>

          {/* Calendar Dots */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Calendar Dots</h3>
            <div className="flex gap-2">
              <div className="calendar-dot bg-sport-swim"></div>
              <div className="calendar-dot bg-sport-bike"></div>
              <div className="calendar-dot bg-sport-run"></div>
              <div className="calendar-dot bg-status-success"></div>
              <div className="calendar-dot bg-status-caution"></div>
              <div className="calendar-dot bg-status-danger"></div>
            </div>
          </div>
        </section>

        {/* Chart Colors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">Chart Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-chart-1"></div>
              <p className="text-sm text-text-secondary">--chart-1</p>
              <p className="text-xs text-muted">#22D3EE</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-chart-2"></div>
              <p className="text-sm text-text-secondary">--chart-2</p>
              <p className="text-xs text-muted">#60A5FA</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-chart-3"></div>
              <p className="text-sm text-text-secondary">--chart-3</p>
              <p className="text-xs text-muted">#A78BFA</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-chart-4"></div>
              <p className="text-sm text-text-secondary">--chart-4</p>
              <p className="text-xs text-muted">#34D399</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-chart-5"></div>
              <p className="text-sm text-text-secondary">--chart-5</p>
              <p className="text-xs text-muted">#F59E0B</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-lg bg-chart-6"></div>
              <p className="text-sm text-text-secondary">--chart-6</p>
              <p className="text-xs text-muted">#F43F5E</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
