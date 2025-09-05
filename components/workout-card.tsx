import { Clock, Target, Coffee, FileText } from "lucide-react"

interface WorkoutPhase {
  name: string
  duration: string
  intensity: number
  description: string
}

interface WorkoutCardProps {
  title: string
  sport: "swim" | "bike" | "run"
  totalDuration: string
  phases: {
    warmup: WorkoutPhase[]
    main: WorkoutPhase[]
    cooldown: WorkoutPhase[]
  }
  targets?: {
    power?: string
    heartRate?: string
    pace?: string
  }
  fueling?: string[]
  notes?: string
  completed?: boolean
}

const sportColors = {
  swim: "bg-swim",
  bike: "bg-bike",
  run: "bg-run",
}

export function WorkoutCard({
  title,
  sport,
  totalDuration,
  phases,
  targets,
  fueling,
  notes,
  completed = false,
}: WorkoutCardProps) {
  const allPhases = [...phases.warmup, ...phases.main, ...phases.cooldown]
  const totalMinutes = allPhases.reduce((acc, phase) => {
    const minutes = Number.parseInt(phase.duration.split(":")[0]) * 60 + Number.parseInt(phase.duration.split(":")[1])
    return acc + minutes
  }, 0)

  const getPhaseWidth = (phase: WorkoutPhase) => {
    const minutes = Number.parseInt(phase.duration.split(":")[0]) * 60 + Number.parseInt(phase.duration.split(":")[1])
    return (minutes / totalMinutes) * 100
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 2) return "bg-success/60"
    if (intensity <= 3) return "bg-warn/60"
    if (intensity <= 4) return "bg-bike/60"
    return "bg-danger/60"
  }

  return (
    <div className={`bg-bg-surface border border-border-weak rounded-lg p-6 ${completed ? "opacity-75" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 ${sportColors[sport]} rounded-full`} />
            <h3 className="text-text-1 font-medium">{title}</h3>
            {completed && <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-md">Completed</span>}
          </div>
          <div className="flex items-center gap-4 text-text-dim text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{totalDuration}</span>
            </div>
            <span className="capitalize">{sport}</span>
          </div>
        </div>
      </div>

      {/* Workout phases visualization */}
      <div className="mb-6">
        <div className="flex mb-2">
          {/* Warmup phases */}
          {phases.warmup.map((phase, index) => (
            <div
              key={`wu-${index}`}
              className={`h-8 ${getIntensityColor(phase.intensity)} border-r border-bg-app first:rounded-l-md`}
              style={{ width: `${getPhaseWidth(phase)}%` }}
              title={`${phase.name} - ${phase.duration} - Z${phase.intensity}`}
            />
          ))}

          {/* Main phases */}
          {phases.main.map((phase, index) => (
            <div
              key={`main-${index}`}
              className={`h-8 ${getIntensityColor(phase.intensity)} border-r border-bg-app`}
              style={{ width: `${getPhaseWidth(phase)}%` }}
              title={`${phase.name} - ${phase.duration} - Z${phase.intensity}`}
            />
          ))}

          {/* Cooldown phases */}
          {phases.cooldown.map((phase, index) => (
            <div
              key={`cd-${index}`}
              className={`h-8 ${getIntensityColor(phase.intensity)} border-r border-bg-app last:rounded-r-md last:border-r-0`}
              style={{ width: `${getPhaseWidth(phase)}%` }}
              title={`${phase.name} - ${phase.duration} - Z${phase.intensity}`}
            />
          ))}
        </div>

        {/* Phase labels */}
        <div className="flex justify-between text-xs text-text-dim">
          <span>Warmup</span>
          <span>Main Set</span>
          <span>Cooldown</span>
        </div>
      </div>

      {/* Targets */}
      {targets && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-text-dim" />
            <span className="text-text-2 text-sm font-medium">Targets</span>
          </div>
          <div className="flex gap-4 text-sm">
            {targets.power && (
              <span className="text-text-dim">
                Power: <span className="text-text-1">{targets.power}</span>
              </span>
            )}
            {targets.heartRate && (
              <span className="text-text-dim">
                HR: <span className="text-text-1">{targets.heartRate}</span>
              </span>
            )}
            {targets.pace && (
              <span className="text-text-dim">
                Pace: <span className="text-text-1">{targets.pace}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Fueling */}
      {fueling && fueling.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Coffee className="w-4 h-4 text-text-dim" />
            <span className="text-text-2 text-sm font-medium">Fueling</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {fueling.map((item, index) => (
              <span key={index} className="px-2 py-1 bg-bg-raised text-text-2 text-xs rounded-md">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-text-dim" />
            <span className="text-text-2 text-sm font-medium">Notes</span>
          </div>
          <p className="text-text-dim text-sm">{notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-border-weak">
        {!completed ? (
          <>
            <button className="px-4 py-2 bg-swim text-bg-app text-sm font-medium rounded-lg hover:bg-swim/90 transition-colors duration-150">
              Start Workout
            </button>
            <button className="px-4 py-2 bg-bg-raised text-text-2 text-sm font-medium rounded-lg hover:bg-border-weak transition-colors duration-150">
              Edit
            </button>
          </>
        ) : (
          <button className="px-4 py-2 bg-bg-raised text-text-2 text-sm font-medium rounded-lg hover:bg-border-weak transition-colors duration-150">
            View Results
          </button>
        )}
      </div>
    </div>
  )
}
