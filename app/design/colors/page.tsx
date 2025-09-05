"use client"

import { useState } from "react"
import { Copy, Check, Waves, Bike, Footprints, ChevronDown, ChevronRight } from "lucide-react"

const colorGroups = {
  neutrals: {
    title: "Neutrals",
    colors: [
      { name: "--bg", value: "#0B0F14", description: "Main background" },
      { name: "--surface", value: "#10151C", description: "Card backgrounds" },
      { name: "--surface-2", value: "#161C24", description: "Secondary surfaces" },
      { name: "--border", value: "#1F2937", description: "Subtle borders" },
      { name: "--text-primary", value: "#E6EAF2", description: "Primary text" },
      { name: "--text-secondary", value: "#9AA6B2", description: "Secondary text" },
      { name: "--muted", value: "#64748B", description: "Muted text" },
      { name: "--overlay", value: "rgba(0,0,0,0.6)", description: "Modal overlays" },
    ],
  },
  brand: {
    title: "Brand / Accent",
    colors: [
      { name: "--brand", value: "#22D3EE", description: "Primary brand color" },
      { name: "--brand-hover", value: "#0EA5B7", description: "Brand hover state" },
      { name: "--brand-pressed", value: "#0891B2", description: "Brand pressed state" },
      { name: "--focus", value: "#38BDF8", description: "Focus rings" },
    ],
  },
  sports: {
    title: "Sport Identity",
    colors: [
      { name: "--sport-swim", value: "#4F46E5", description: "Swimming activities" },
      { name: "--sport-bike", value: "#EC4899", description: "Cycling activities" },
      { name: "--sport-run", value: "#10B981", description: "Running activities" },
    ],
  },
  zones: {
    title: "Training Zones",
    colors: [
      { name: "--zone-1", value: "#22D3EE", description: "Zone 1 - Recovery" },
      { name: "--zone-2", value: "#3B82F6", description: "Zone 2 - Aerobic" },
      { name: "--zone-3", value: "#8B5CF6", description: "Zone 3 - Tempo" },
      { name: "--zone-4", value: "#EC4899", description: "Zone 4 - Threshold" },
      { name: "--zone-5", value: "#EF4444", description: "Zone 5 - VO2 Max" },
    ],
  },
  status: {
    title: "Status Indicators",
    colors: [
      { name: "--status-success", value: "#22C55E", description: "Success states" },
      { name: "--status-caution", value: "#FACC15", description: "Caution states" },
      { name: "--status-alert", value: "#FB923C", description: "Alert states" },
      { name: "--status-danger", value: "#DC2626", description: "Danger states" },
      { name: "--status-info", value: "#38BDF8", description: "Info states" },
    ],
  },
  load: {
    title: "Load Severity",
    colors: [
      { name: "--load-low", value: "#64748B", description: "Low load" },
      { name: "--load-elevated", value: "#FACC15", description: "Elevated load" },
      { name: "--load-high", value: "#FB923C", description: "High load" },
      { name: "--load-extreme", value: "#DC2626", description: "Extreme load" },
    ],
  },
  charts: {
    title: "Chart Palette",
    colors: [
      { name: "--chart-1", value: "#22D3EE", description: "Chart series 1" },
      { name: "--chart-2", value: "#60A5FA", description: "Chart series 2" },
      { name: "--chart-3", value: "#A78BFA", description: "Chart series 3" },
      { name: "--chart-4", value: "#34D399", description: "Chart series 4" },
      { name: "--chart-5", value: "#F59E0B", description: "Chart series 5" },
      { name: "--chart-6", value: "#F43F5E", description: "Chart series 6" },
      { name: "--chart-grid", value: "#223041", description: "Chart grid lines" },
      { name: "--chart-axis", value: "#7C8A9A", description: "Chart axis labels" },
    ],
  },
}

const usageRules = [
  { category: "Brand", usage: "CTAs, selected states, focus rings. NOT for charts or data visualization." },
  { category: "Sports", usage: "Sport icons, activity chips, calendar dots. Distinct from training zones." },
  { category: "Zones", usage: "Intensity bars, workout-type chips, zone analysis. Cool spectrum progression." },
  { category: "Status", usage: "Readiness indicators, compliance states, alerts only. Not for general UI." },
  { category: "Load", usage: "Load badges and severity indicators only. Separate from zones." },
  { category: "Charts", usage: "Data visualizations, graphs, analytics only. Distinct from UI colors." },
  { category: "Neutrals", usage: "Backgrounds, cards, borders, text. Foundation of the interface." },
]

export default function ColorsPage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [expandedUsage, setExpandedUsage] = useState(false)

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(item)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const copyAllVariables = () => {
    const cssVariables = `
:root {
  /* Neutrals */
  --bg: #0B0F14;
  --surface: #10151C;
  --surface-2: #161C24;
  --border: #1F2937;
  --text-primary: #E6EAF2;
  --text-secondary: #9AA6B2;
  --muted: #64748B;
  --overlay: rgba(0,0,0,0.6);

  /* Brand / Accent */
  --brand: #22D3EE;
  --brand-hover: #0EA5B7;
  --brand-pressed: #0891B2;
  --focus: #38BDF8;

  /* Sport identity */
  --sport-swim: #4F46E5;
  --sport-bike: #EC4899;
  --sport-run: #10B981;

  /* Zones */
  --zone-1: #22D3EE;
  --zone-2: #3B82F6;
  --zone-3: #8B5CF6;
  --zone-4: #EC4899;
  --zone-5: #EF4444;

  /* Status */
  --status-success: #22C55E;
  --status-caution: #FACC15;
  --status-alert: #FB923C;
  --status-danger: #DC2626;
  --status-info: #38BDF8;

  /* Load severity */
  --load-low: #64748B;
  --load-elevated: #FACC15;
  --load-high: #FB923C;
  --load-extreme: #DC2626;

  /* Charts */
  --chart-1: #22D3EE;
  --chart-2: #60A5FA;
  --chart-3: #A78BFA;
  --chart-4: #34D399;
  --chart-5: #F59E0B;
  --chart-6: #F43F5E;
  --chart-grid: #223041;
  --chart-axis: #7C8A9A;

  /* Calendar accents */
  --cal-dot-swim: var(--sport-swim);
  --cal-dot-bike: var(--sport-bike);
  --cal-dot-run: var(--sport-run);
  --cal-selected-outline: #38BDF8;
}`.trim()

    copyToClipboard(cssVariables, "all-variables")
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }} className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Color System</h1>
            <p style={{ color: "var(--text-secondary)" }} className="text-lg">
              Live palette reference, usage rules, and component preview.
            </p>
          </div>
          <button
            onClick={copyAllVariables}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {copiedItem === "all-variables" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy CSS Variables
          </button>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Color Swatches</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(colorGroups).map(([key, group]) => (
            <div
              key={key}
              className="p-6 rounded-lg border"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >
              <h3 className="text-lg font-medium mb-4">{group.title}</h3>
              <div className="space-y-3">
                {group.colors.map((color) => (
                  <div key={color.name} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border flex-shrink-0"
                      style={{ backgroundColor: color.value, borderColor: "var(--border)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{color.name}</code>
                        <button
                          onClick={() => copyToClipboard(color.value, color.name)}
                          className="p-1 rounded hover:bg-opacity-20 hover:bg-white transition-colors"
                        >
                          {copiedItem === color.name ? (
                            <Check className="w-3 h-3" style={{ color: "var(--status-success)" }} />
                          ) : (
                            <Copy className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
                          )}
                        </button>
                      </div>
                      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {color.value} • {color.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Rules */}
      <div className="mb-12">
        <button
          onClick={() => setExpandedUsage(!expandedUsage)}
          className="flex items-center gap-2 mb-4 text-2xl font-semibold hover:opacity-80 transition-opacity"
        >
          {expandedUsage ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          Usage Guidelines
        </button>
        {expandedUsage && (
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="space-y-4">
              {usageRules.map((rule) => (
                <div key={rule.category}>
                  <h4 className="font-medium mb-1">{rule.category}</h4>
                  <p style={{ color: "var(--text-secondary)" }} className="text-sm">
                    {rule.usage}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Component Gallery */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Component Gallery</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Onboarding Buttons */}
          <div
            className="p-6 rounded-lg border lg:col-span-2"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="text-lg font-medium mb-4">Buttons &amp; Selection Tiles</h3>
            <div className="space-y-6">
              {/* Large Selection Buttons */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Large Selection Buttons (Outline Style - Preferred)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    className="p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: "var(--brand)",
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="font-medium mb-1">Race Training</div>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Prepare for a specific event
                    </div>
                  </button>
                  <button
                    className="p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="font-medium mb-1">Fitness Maintenance</div>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Stay fit and healthy
                    </div>
                  </button>
                </div>
              </div>

              {/* Sport Selection Buttons */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Sport Selection Buttons
                </h4>
                <div className="flex gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: "var(--brand)",
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="flex gap-1">
                      <Waves className="w-4 h-4" style={{ color: "#4F46E5" }} />
                      <Bike className="w-4 h-4" style={{ color: "#EC4899" }} />
                      <Footprints className="w-4 h-4" style={{ color: "#10B981" }} />
                    </div>
                    <span className="font-medium">Triathlon</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    <Bike className="w-4 h-4" style={{ color: "#EC4899" }} />
                    <span className="font-medium">Cycling</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    <Footprints className="w-4 h-4" style={{ color: "#10B981" }} />
                    <span className="font-medium">Running</span>
                  </button>
                </div>
              </div>

              {/* Race Type Buttons */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Race Type Selection
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Sprint", "Olympic", "Ironman 70.3", "Ironman", "T100"].map((type, index) => (
                    <button
                      key={type}
                      className="px-4 py-2 rounded-lg border-2 font-medium transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: index === 0 ? "var(--brand)" : "var(--border)",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Buttons */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Priority Selection
                </h4>
                <div className="flex gap-3">
                  {[
                    { label: "A", desc: "Must achieve", color: "#EF4444" },
                    { label: "B", desc: "Important", color: "#F59E0B" },
                    { label: "C", desc: "Nice to have", color: "#22C55E" },
                  ].map((priority, index) => (
                    <button
                      key={priority.label}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: index === 0 ? "var(--brand)" : "var(--border)",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: priority.color, color: "white" }}
                      >
                        {priority.label}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Priority {priority.label}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {priority.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Hours Compact */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Weekly Hours (Compact Row)
                </h4>
                <div className="flex gap-2">
                  {[
                    { hours: "3-5", sessions: "3-4" },
                    { hours: "6-8", sessions: "5-6" },
                    { hours: "9-12", sessions: "9-10" },
                    { hours: "13-16", sessions: "10-12" },
                    { hours: "17+", sessions: "10-12" },
                  ].map((option, index) => (
                    <button
                      key={option.hours}
                      className="flex-1 px-3 py-2 rounded-lg border-2 font-medium transition-all hover:scale-[1.02] group relative"
                      style={{
                        borderColor: index === 1 ? "var(--brand)" : "var(--border)",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      <div className="text-sm">{option.hours}h</div>
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {option.sessions} sessions
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rest Day Selection */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Rest Day Selection (Multi-select)
                </h4>
                <div className="flex gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                    <button
                      key={day}
                      className="px-3 py-2 rounded-lg border-2 font-medium transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: index === 0 || index === 6 ? "var(--brand)" : "var(--border)",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level Cards */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Experience Level Cards
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { level: "Beginner", desc: "New to structured training", icon: "🌱" },
                    { level: "Intermediate", desc: "Some racing experience", icon: "📈" },
                    { level: "Competitive", desc: "Experienced athlete", icon: "🏆" },
                  ].map((exp, index) => (
                    <button
                      key={exp.level}
                      className="p-4 rounded-lg border-2 text-center transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: index === 1 ? "var(--brand)" : "var(--border)",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      <div className="text-2xl mb-2">{exp.icon}</div>
                      <div className="font-medium mb-1">{exp.level}</div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {exp.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric Selection */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Primary Metrics Selection
                </h4>
                <div className="space-y-3">
                  {[
                    { sport: "Swimming", metrics: ["Pace", "Heart Rate"] },
                    { sport: "Cycling", metrics: ["Power", "Heart Rate"] },
                    { sport: "Running", metrics: ["Power", "Pace", "Heart Rate"] },
                  ].map((sport) => (
                    <div key={sport.sport} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">{sport.sport}:</div>
                      <div className="flex gap-2">
                        {sport.metrics.map((metric, index) => (
                          <button
                            key={metric}
                            className="px-3 py-1 rounded border-2 text-sm font-medium transition-all hover:scale-[1.02]"
                            style={{
                              borderColor: index === 0 ? "var(--brand)" : "var(--border)",
                              backgroundColor: "transparent",
                              color: "var(--text-primary)",
                            }}
                          >
                            {metric}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Standard Buttons */}
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="text-lg font-medium mb-4">Standard Buttons</h3>
            <div className="space-y-4">
              {/* Filled Buttons */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Filled
                </h4>
                <div className="space-y-2">
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: "var(--brand)", color: "var(--bg)" }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
                  >
                    Secondary Button
                  </button>
                </div>
              </div>

              {/* Outline Buttons (Preferred) */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Outline (Preferred Style)
                </h4>
                <div className="space-y-2">
                  <button
                    className="px-4 py-2 rounded-lg border-2 font-medium transition-all hover:scale-[1.02]"
                    style={{ borderColor: "var(--brand)", backgroundColor: "transparent", color: "var(--brand)" }}
                  >
                    Primary Outline
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg border-2 font-medium transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    Secondary Outline
                  </button>
                </div>
              </div>

              {/* States */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  States
                </h4>
                <div className="space-y-2">
                  <button
                    className="px-4 py-2 rounded-lg border-2 font-medium transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: "var(--brand)",
                      backgroundColor: "rgba(34, 211, 238, 0.1)",
                      color: "var(--brand)",
                    }}
                  >
                    Hover State
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg border-2 font-medium opacity-50 cursor-not-allowed"
                    style={{ borderColor: "var(--border)", backgroundColor: "transparent", color: "var(--muted)" }}
                  >
                    Disabled State
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sport Chips */}
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="text-lg font-medium mb-4">Sport Chips</h3>
            <div className="space-y-4">
              {/* Filled */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Filled
                </h4>
                <div className="flex gap-3">
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "#4F46E5", color: "white" }}
                  >
                    <Waves className="w-4 h-4" />
                    <span className="text-sm font-medium">Swim</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "#EC4899", color: "white" }}
                  >
                    <Bike className="w-4 h-4" />
                    <span className="text-sm font-medium">Bike</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "#10B981", color: "var(--bg)" }}
                  >
                    <Footprints className="w-4 h-4" />
                    <span className="text-sm font-medium">Run</span>
                  </div>
                </div>
              </div>

              {/* Transparent */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Transparent
                </h4>
                <div className="flex gap-3">
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                    style={{ backgroundColor: "rgba(79, 70, 229, 0.4)", borderColor: "#4F46E5", color: "#4F46E5" }}
                  >
                    <Waves className="w-4 h-4" />
                    <span className="text-sm font-medium">Swim</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                    style={{ backgroundColor: "rgba(236, 72, 153, 0.4)", borderColor: "#EC4899", color: "#EC4899" }}
                  >
                    <Bike className="w-4 h-4" />
                    <span className="text-sm font-medium">Bike</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                    style={{ backgroundColor: "rgba(16, 185, 129, 0.4)", borderColor: "#10B981", color: "#10B981" }}
                  >
                    <Footprints className="w-4 h-4" />
                    <span className="text-sm font-medium">Run</span>
                  </div>
                </div>
              </div>

              {/* Logo Only - Filled */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Logo Only - Filled
                </h4>
                <div className="flex gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ backgroundColor: "#4F46E5", color: "white" }}
                  >
                    <Waves className="w-5 h-5" />
                  </div>
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ backgroundColor: "#EC4899", color: "white" }}
                  >
                    <Bike className="w-5 h-5" />
                  </div>
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ backgroundColor: "#10B981", color: "var(--bg)" }}
                  >
                    <Footprints className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Logo Only - Transparent */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Logo Only - Transparent
                </h4>
                <div className="flex gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: "rgba(79, 70, 229, 0.4)", borderColor: "#4F46E5", color: "#4F46E5" }}
                  >
                    <Waves className="w-5 h-5" />
                  </div>
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: "rgba(236, 72, 153, 0.4)", borderColor: "#EC4899", color: "#EC4899" }}
                  >
                    <Bike className="w-5 h-5" />
                  </div>
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: "rgba(16, 185, 129, 0.4)", borderColor: "#10B981", color: "#10B981" }}
                  >
                    <Footprints className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zone Chips */}
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="text-lg font-medium mb-4">Zone Chips</h3>
            <div className="space-y-4">
              {/* Filled */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Filled
                </h4>
                <div className="flex gap-2">
                  <div
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#22D3EE", color: "var(--bg)" }}
                  >
                    Z1
                  </div>
                  <div
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#3B82F6", color: "var(--bg)" }}
                  >
                    Z2
                  </div>
                  <div
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#8B5CF6", color: "var(--bg)" }}
                  >
                    Z3
                  </div>
                  <div
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#EC4899", color: "var(--bg)" }}
                  >
                    Z4
                  </div>
                  <div
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#EF4444", color: "var(--bg)" }}
                  >
                    Z5
                  </div>
                </div>
              </div>

              {/* Transparent */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Transparent
                </h4>
                <div className="flex gap-2">
                  <div
                    className="px-3 py-1 rounded text-sm font-medium border"
                    style={{ backgroundColor: "rgba(34, 211, 238, 0.4)", borderColor: "#22D3EE", color: "#22D3EE" }}
                  >
                    Z1
                  </div>
                  <div
                    className="px-3 py-1 rounded text-sm font-medium border"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.4)", borderColor: "#3B82F6", color: "#3B82F6" }}
                  >
                    Z2
                  </div>
                  <div
                    className="px-3 py-1 rounded text-sm font-medium border"
                    style={{ backgroundColor: "rgba(139, 92, 246, 0.4)", borderColor: "#8B5CF6", color: "#8B5CF6" }}
                  >
                    Z3
                  </div>
                  <div
                    className="px-3 py-1 rounded text-sm font-medium border"
                    style={{ backgroundColor: "rgba(236, 72, 153, 0.4)", borderColor: "#EC4899", color: "#EC4899" }}
                  >
                    Z4
                  </div>
                  <div
                    className="px-3 py-1 rounded text-sm font-medium border"
                    style={{ backgroundColor: "rgba(239, 68, 68, 0.4)", borderColor: "#EF4444", color: "#EF4444" }}
                  >
                    Z5
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="text-lg font-medium mb-4">Status Badges</h3>
            <div className="space-y-4">
              {/* Filled */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Filled
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: "#22C55E", color: "var(--bg)" }}
                  >
                    Success
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: "#FACC15", color: "var(--bg)" }}
                  >
                    Caution
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: "#FB923C", color: "var(--bg)" }}
                  >
                    Alert
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: "#DC2626", color: "var(--bg)" }}
                  >
                    Danger
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: "#38BDF8", color: "var(--bg)" }}
                  >
                    Info
                  </span>
                </div>
              </div>

              {/* Transparent */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Transparent
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium border"
                    style={{ backgroundColor: "rgba(34, 197, 94, 0.4)", borderColor: "#22C55E", color: "#22C55E" }}
                  >
                    Success
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium border"
                    style={{ backgroundColor: "rgba(250, 204, 21, 0.4)", borderColor: "#FACC15", color: "#FACC15" }}
                  >
                    Caution
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium border"
                    style={{ backgroundColor: "rgba(251, 146, 60, 0.4)", borderColor: "#FB923C", color: "#FB923C" }}
                  >
                    Alert
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium border"
                    style={{ backgroundColor: "rgba(220, 38, 38, 0.4)", borderColor: "#DC2626", color: "#DC2626" }}
                  >
                    Danger
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium border"
                    style={{ backgroundColor: "rgba(56, 189, 248, 0.4)", borderColor: "#38BDF8", color: "#38BDF8" }}
                  >
                    Info
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Load Badges */}
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="text-lg font-medium mb-4">Load Badges</h3>
            <div className="space-y-4">
              {/* Filled */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Filled
                </h4>
                <div className="flex gap-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: "#64748B", color: "var(--text-primary)" }}
                  >
                    Low
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: "#FACC15", color: "var(--bg)" }}
                  >
                    Elevated
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: "#FB923C", color: "var(--bg)" }}
                  >
                    High
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: "#DC2626", color: "var(--bg)" }}
                  >
                    Extreme
                  </span>
                </div>
              </div>

              {/* Transparent */}
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Transparent
                </h4>
                <div className="flex gap-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium border"
                    style={{ backgroundColor: "rgba(100, 116, 139, 0.4)", borderColor: "#64748B", color: "#64748B" }}
                  >
                    Low
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium border"
                    style={{ backgroundColor: "rgba(250, 204, 21, 0.4)", borderColor: "#FACC15", color: "#FACC15" }}
                  >
                    Elevated
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium border"
                    style={{ backgroundColor: "rgba(251, 146, 60, 0.4)", borderColor: "#FB923C", color: "#FB923C" }}
                  >
                    High
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium border"
                    style={{ backgroundColor: "rgba(220, 38, 38, 0.4)", borderColor: "#DC2626", color: "#DC2626" }}
                  >
                    Extreme
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Intensity Bar Mock */}
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="text-lg font-medium mb-4">Intensity Bar</h3>
            <div className="space-y-2">
              <div className="flex h-8 rounded overflow-hidden">
                <div className="flex-1" style={{ backgroundColor: "#22D3EE" }}></div>
                <div className="flex-1" style={{ backgroundColor: "#3B82F6" }}></div>
                <div className="flex-1" style={{ backgroundColor: "#8B5CF6" }}></div>
                <div className="flex-1" style={{ backgroundColor: "#EC4899" }}></div>
                <div className="flex-1" style={{ backgroundColor: "#EF4444" }}></div>
              </div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Zone distribution visualization
              </div>
            </div>
          </div>

          {/* Intensity Bars Collection */}
          <div
            className="p-6 rounded-lg border lg:col-span-2"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="text-lg font-medium mb-4">Intensity Bars</h3>
            <div className="space-y-6">
              {/* Variable Height Intensity Bar */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Variable Height (Training Structure)
                </h4>
                <div className="flex gap-1 h-14 items-end">
                  <div className="w-8 rounded-sm" style={{ backgroundColor: "#22D3EE", height: "20px" }}></div>
                  <div className="w-12 rounded-sm" style={{ backgroundColor: "#3B82F6", height: "28px" }}></div>
                  <div className="w-16 rounded-sm" style={{ backgroundColor: "#8B5CF6", height: "36px" }}></div>
                  <div className="w-12 rounded-sm" style={{ backgroundColor: "#EC4899", height: "44px" }}></div>
                  <div className="w-8 rounded-sm" style={{ backgroundColor: "#EF4444", height: "52px" }}></div>
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  Height represents intensity level
                </div>
              </div>

              {/* Zone Comparison Bars */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Zone Comparison (Planned vs Actual)
                </h4>
                <div className="space-y-2">
                  {[
                    { zone: "Z1", planned: 60, actual: 45, color: "#22D3EE" },
                    { zone: "Z2", planned: 80, actual: 85, color: "#3B82F6" },
                    { zone: "Z3", planned: 40, actual: 50, color: "#8B5CF6" },
                  ].map((item) => (
                    <div key={item.zone} className="grid grid-cols-4 gap-2 items-center text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }}></div>
                        <span>{item.zone}</span>
                      </div>
                      <div className="h-1 bg-gray-700 rounded-full">
                        <div
                          className="h-full rounded-full opacity-50"
                          style={{ backgroundColor: item.color, width: `${item.planned}%` }}
                        ></div>
                      </div>
                      <div className="h-1 bg-gray-700 rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color, width: `${item.actual}%` }}
                        ></div>
                      </div>
                      <span className={item.actual > item.planned ? "text-green-400" : "text-red-400"}>
                        {item.actual > item.planned ? "+" : ""}
                        {item.actual - item.planned}min
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Load Distribution Bars */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Load Distribution (By Sport)
                </h4>
                <div className="space-y-2">
                  {[
                    { sport: "Swim", value: 65, color: "#4F46E5" },
                    { sport: "Bike", value: 85, color: "#EC4899" },
                    { sport: "Run", value: 45, color: "#10B981" },
                  ].map((item) => (
                    <div key={item.sport} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm w-12">{item.sport}</span>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color, width: `${item.value}%` }}
                        ></div>
                      </div>
                      <span className="text-xs w-8">{item.value}h</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Bars */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Compliance Tracking
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Duration</span>
                    <span>95%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Power/Pace</span>
                    <span>65%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
              </div>

              {/* Mini Intensity Dots */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Mini Intensity Indicators
                </h4>
                <div className="flex gap-4">
                  {[
                    { intensity: 2, color: "#3B82F6" },
                    { intensity: 4, color: "#EC4899" },
                    { intensity: 5, color: "#EF4444" },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className="w-1 h-3 rounded-full"
                          style={{ backgroundColor: level <= item.intensity ? item.color : "#374151" }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  Used in session chips and compact views
                </div>
              </div>

              {/* Intensity Distribution */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Intensity Distribution (Low vs High)
                </h4>
                <div className="h-4 rounded-lg overflow-hidden flex">
                  <div className="flex-1" style={{ backgroundColor: "#3B82F6", width: "70%" }}></div>
                  <div className="flex-1" style={{ backgroundColor: "#EF4444", width: "30%" }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  <span>Low Intensity (Z1-Z2): 70%</span>
                  <span>High Intensity (Z3-Z5): 30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div
        className="p-6 rounded-lg border"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h2 className="text-2xl font-semibold mb-4">Accessibility Notes</h2>
        <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <p>• All text colors meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)</p>
          <p>• Color is never the only means of conveying information - labels and patterns are used alongside color</p>
          <p>• Focus states use high-contrast outlines for keyboard navigation</p>
          <p>• Status indicators include both color and text labels for clarity</p>
        </div>
      </div>
    </div>
  )
}
