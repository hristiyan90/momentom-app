import { Info } from "lucide-react"

interface WeeklySummaryProps {
  weekData: {
    totalHours: number
    totalTSS: number
    avgCapacity: number
    load: {
      swim: number
      bike: number
      run: number
    }
  }
}

export function WeeklySummary({ weekData }: WeeklySummaryProps) {
  // Stub data as specified in requirements
  const stubData = {
    kpi: {
      totalHours: { completed: 10.8, planned: 14, lastWeek: 9.9 },
      trainingStress: { completed: 420, planned: 560, lastWeek: 480 },
    },
    loadBySport: {
      swim: { completed: 3.8, planned: 5.0 },
      bike: { completed: 6.5, planned: 7.5 },
      run: { completed: 3.5, planned: 4.0 },
    },
    intensityMix: {
      zones: { z1: 130, z2: 245, z3: 75, z4: 40, z5: 20 },
      targets: [30, 45, 15, 8, 2], // percentages
    },
    compliance: [
      { day: "Mon", sessions: [] },
      { day: "Tue", sessions: [{ sport: "bike", title: "Sweet Spot", completed: false, missed: true }] },
      {
        day: "Wed",
        sessions: [
          { sport: "swim", title: "Easy Recovery", completed: true },
          { sport: "bike", title: "Tempo", completed: true },
        ],
      },
      {
        day: "Thu",
        sessions: [
          { sport: "swim", title: "Threshold 400s", completed: false },
          { sport: "bike", title: "FTP Test", completed: true },
        ],
      },
      { day: "Fri", sessions: [{ sport: "run", title: "Recovery", completed: false }] },
      { day: "Sat", sessions: [{ sport: "swim", title: "Open Water", completed: false }] },
      { day: "Sun", sessions: [{ sport: "bike", title: "Brick", completed: false, adapted: true }] },
    ],
  }

  const totalMinutes = Object.values(stubData.intensityMix.zones).reduce((a, b) => a + b, 0)
  const hoursProgress = (stubData.kpi.totalHours.completed / stubData.kpi.totalHours.planned) * 100
  const tssProgress = (stubData.kpi.trainingStress.completed / stubData.kpi.trainingStress.planned) * 100
  const hoursDelta = stubData.kpi.totalHours.completed - stubData.kpi.totalHours.lastWeek
  const tssDelta =
    ((stubData.kpi.trainingStress.completed - stubData.kpi.trainingStress.lastWeek) /
      stubData.kpi.trainingStress.lastWeek) *
    100

  const dominantZone = Object.entries(stubData.intensityMix.zones).reduce(
    (max, [zone, minutes]) => (minutes > max.minutes ? { zone, minutes } : max),
    { zone: "z1", minutes: 0 },
  )
  const dominantZoneHours = dominantZone.minutes / 60

  const totalSessions = stubData.compliance.reduce((sum, day) => sum + day.sessions.length, 0)
  const completedSessions = stubData.compliance.reduce(
    (sum, day) => sum + day.sessions.filter((s) => s.completed).length,
    0,
  )
  const compliancePercent = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

  return (
    <div className="bg-bg-surface border border-border-weak rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-1 font-medium">This Week</h3>
      </div>

      <div className="space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Hours */}
          <div className="bg-bg-raised border border-border-weak rounded-lg p-4 h-32">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-text-2 text-sm font-medium">Total Hours</h3>
              <Info className="w-3 h-3 text-text-2 cursor-help" title="Completed vs planned training hours this week" />
            </div>
            <div className="text-text-1 text-2xl font-semibold mb-2">
              {stubData.kpi.totalHours.completed}h / {stubData.kpi.totalHours.planned}h
            </div>
            <div className="w-full bg-bg-raised rounded-full h-1 mb-2">
              <div
                className="h-1 rounded-full"
                style={{ backgroundColor: "var(--brand)", width: `${Math.min(hoursProgress, 100)}%` }}
              />
            </div>
            <div className="text-text-dim text-xs">
              {hoursDelta >= 0 ? "+" : ""}
              {hoursDelta.toFixed(1)}h vs last week
            </div>
          </div>

          {/* Training Stress */}
          <div className="bg-bg-raised border border-border-weak rounded-lg p-4 h-32">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-text-2 text-sm font-medium">Training Stress</h3>
              <Info className="w-3 h-3 text-text-2 cursor-help" title="Training Stress Score completed vs planned" />
            </div>
            <div className="text-text-1 text-2xl font-semibold mb-2">
              {stubData.kpi.trainingStress.completed} TSS / {stubData.kpi.trainingStress.planned}
            </div>
            <div className="relative w-full bg-bg-raised rounded-full h-1 mb-2">
              <div
                className="h-1 rounded-full"
                style={{ backgroundColor: "var(--muted)", width: `${Math.min(tssProgress, 100)}%` }}
              />
              <div
                className="absolute top-0 w-0.5 h-1 bg-text-dim"
                style={{
                  left: `${(stubData.kpi.trainingStress.lastWeek / stubData.kpi.trainingStress.planned) * 100}%`,
                }}
              />
            </div>
            <div className="text-text-dim text-xs">
              {tssDelta >= 0 ? "+" : ""}
              {tssDelta.toFixed(0)}% vs last week
            </div>
          </div>

          {/* Intensity Mix */}
          <div className="bg-bg-raised border border-border-weak rounded-lg p-4 h-32 md:col-span-2 lg:col-span-1 group relative">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-text-2 text-sm font-medium">Intensity Mix</h3>
              <Info className="w-3 h-3 text-text-2 cursor-help" title="Time distribution across training zones" />
            </div>
            <div className="text-text-1 text-2xl font-semibold mb-2">
              {dominantZone.zone.toUpperCase()} / {dominantZoneHours.toFixed(1)}h
            </div>
            <div className="flex w-full h-1 rounded-full overflow-hidden mb-2">
              {Object.entries(stubData.intensityMix.zones).map(([zone, minutes], i) => {
                const zoneColors = ["var(--zone-1)", "var(--zone-2)", "var(--zone-3)", "var(--zone-4)", "var(--zone-5)"]
                const width = (minutes / totalMinutes) * 100
                return <div key={zone} style={{ backgroundColor: zoneColors[i], width: `${width}%` }} />
              })}
            </div>
            <div className="text-text-dim text-xs">Most time in {dominantZone.zone.toUpperCase()}</div>

            <div className="absolute inset-0 bg-bg-raised border border-border-weak rounded-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-text-2 text-sm font-medium">Intensity Mix</h3>
                <Info className="w-3 h-3 text-text-2 cursor-help" title="Time distribution across training zones" />
              </div>
              <div className="flex w-full h-1 rounded-full overflow-hidden mb-3">
                {Object.entries(stubData.intensityMix.zones).map(([zone, minutes], i) => {
                  const zoneColors = [
                    "var(--zone-1)",
                    "var(--zone-2)",
                    "var(--zone-3)",
                    "var(--zone-4)",
                    "var(--zone-5)",
                  ]
                  const width = (minutes / totalMinutes) * 100
                  return <div key={zone} style={{ backgroundColor: zoneColors[i], width: `${width}%` }} />
                })}
              </div>
              <div className="text-xs text-text-dim space-y-1">
                <div className="flex justify-between">
                  {Object.entries(stubData.intensityMix.zones).map(([zone, minutes]) => (
                    <span key={zone}>
                      {zone.toUpperCase()} {Math.floor(minutes / 60)}h{String(minutes % 60).padStart(2, "0")}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between text-text-dim opacity-60">
                  {stubData.intensityMix.targets.map((target, i) => (
                    <span key={i}>{target}%</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Load by Sport */}
          <div className="lg:col-span-6 bg-bg-raised border border-border-weak rounded-lg p-4 w-auto">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-text-2 text-sm font-medium">Load by Sport</h3>
              <Info className="w-3 h-3 text-text-2 cursor-help" title="Completed vs planned hours by discipline" />
            </div>
            <div className="space-y-3">
              {Object.entries(stubData.loadBySport).map(([sport, data]) => {
                const progress = (data.completed / data.planned) * 100
                const behind = ((data.planned - data.completed) / data.planned) * 100
                const sportColors = {
                  swim: "var(--sport-swim)",
                  bike: "var(--sport-bike)",
                  run: "var(--sport-run)",
                }

                return (
                  <div key={sport} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-text-2 text-sm capitalize">{sport}</span>
                      <span className="text-text-1 text-sm">
                        {data.completed}h / {data.planned}h
                      </span>
                    </div>
                    <div className="relative w-full bg-bg-raised rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: sportColors[sport as keyof typeof sportColors],
                          width: `${Math.min(progress, 100)}%`,
                        }}
                      />
                      {behind > 10 && (
                        <div
                          className="absolute right-1 top-0.5 w-1 h-1 rounded-full"
                          style={{ backgroundColor: behind > 20 ? "var(--status-danger)" : "var(--status-caution)" }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Compliance */}
          <div className="lg:col-span-6 bg-bg-raised border border-border-weak rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-text-2 text-sm font-medium">Compliance</h3>
              <Info className="w-3 h-3 text-text-2 cursor-help" title="Session completion rate this week" />
            </div>
            <div className="text-text-1 text-2xl font-semibold mb-2">
              {completedSessions}/{totalSessions} ({Math.round(compliancePercent)}%)
            </div>
            <div className="w-full bg-bg-raised rounded-full h-1 mb-2">
              <div
                className="h-1 rounded-full"
                style={{ backgroundColor: "var(--status-success)", width: `${Math.min(compliancePercent, 100)}%` }}
              />
            </div>
            <div className="space-y-1">
              {/* Day labels */}
              <div className="flex gap-2">
                {stubData.compliance.map((day) => (
                  <div key={day.day} className="flex-1 text-center">
                    <span className="text-xs text-text-dim">{day.day}</span>
                  </div>
                ))}
              </div>
              {/* Compliance bars with spacing */}
              <div className="flex gap-2">
                {stubData.compliance.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col gap-1">
                    {day.sessions.length === 0 ? (
                      <div className="h-2 bg-bg-raised rounded-full" />
                    ) : (
                      day.sessions.slice(0, 2).map((session, i) => (
                        <div
                          key={i}
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: session.completed
                              ? "var(--status-success)"
                              : session.missed
                                ? "var(--status-danger)"
                                : "var(--status-caution)",
                          }}
                        />
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
