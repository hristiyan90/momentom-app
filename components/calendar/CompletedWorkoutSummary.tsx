import { Clock, Zap, Heart, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SessionLite } from "./MonthCell"

interface CompletedWorkoutSummaryProps {
  session: SessionLite
  className?: string
}

export function CompletedWorkoutSummary({ session, className }: CompletedWorkoutSummaryProps) {
  const actualMinutes = session.actualMinutes || session.minutes
  const actualHours = Math.floor(actualMinutes / 60)
  const actualMins = actualMinutes % 60
  const actualDuration = actualHours > 0 ? `${actualHours}h ${actualMins}m` : `${actualMins}m`
  
  const plannedHours = Math.floor(session.minutes / 60)
  const plannedMins = session.minutes % 60
  const plannedDuration = plannedHours > 0 ? `${plannedHours}h ${plannedMins}m` : `${plannedMins}m`
  
  const compliance = session.compliance || 0
  const isGoodCompliance = compliance >= 85
  const isOkCompliance = compliance >= 70
  
  // Mock realistic metrics based on sport and session data
  const mockMetrics = {
    bike: {
      targetPower: 280,
      actualPower: Math.round(280 * (compliance / 100) * (0.9 + Math.random() * 0.2)),
      avgHR: 142 + Math.round(Math.random() * 20),
      cadence: 85 + Math.round(Math.random() * 10),
      distance: Math.round((actualMinutes / 60) * 35 * (0.8 + Math.random() * 0.4))
    },
    run: {
      targetPace: "4:30",
      actualPace: compliance >= 85 ? "4:32" : compliance >= 70 ? "4:40" : "4:50",
      avgHR: 152 + Math.round(Math.random() * 25),
      cadence: 178 + Math.round(Math.random() * 15),
      distance: Math.round((actualMinutes / 60) * 12 * (0.8 + Math.random() * 0.4))
    },
    swim: {
      targetPace: "1:45",
      actualPace: compliance >= 85 ? "1:46" : compliance >= 70 ? "1:50" : "1:55",
      avgHR: 135 + Math.round(Math.random() * 20),
      strokeRate: 30 + Math.round(Math.random() * 8),
      distance: Math.round((actualMinutes / 60) * 2.5 * (0.7 + Math.random() * 0.6))
    },
    strength: {
      avgHR: 120 + Math.round(Math.random() * 25),
      sets: Math.round(actualMinutes / 8),
      reps: 12 + Math.round(Math.random() * 8)
    }
  }
  
  const metrics = mockMetrics[session.sport]
  const actualLoad = session.load ? Math.round(session.load * (compliance / 100) * (0.95 + Math.random() * 0.15)) : 0
  const loadCompliance = session.load ? Math.round((actualLoad / session.load) * 100) : 0
  
  const getComplianceColor = (percent: number) => {
    if (percent >= 85) return "text-green-500"
    if (percent >= 70) return "text-amber-500" 
    return "text-red-500"
  }
  
  const getProgressBarColor = (percent: number) => {
    if (percent >= 85) return "bg-green-500"
    if (percent >= 70) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className={cn("bg-bg-surface border border-border-weak rounded-lg p-4 space-y-3", className)}>
      {/* Header with completion status */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-text-1">Workout Summary</h4>
        <span className={`text-xs font-medium ${getComplianceColor(compliance)}`}>
          {compliance}% completed
        </span>
      </div>
      
      {/* Key metrics grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Duration */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-text-2" />
            <span className="text-xs text-text-2">Duration</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-3">Target</span>
              <span className="text-xs font-medium text-text-1">{plannedDuration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-3">Actual</span>
              <span className="text-xs font-medium text-text-1">{actualDuration}</span>
            </div>
            <div className="space-y-1">
              <div className="relative h-1 bg-gray-600/30 rounded overflow-hidden">
                <div
                  className={cn("h-full rounded transition-all duration-300", getProgressBarColor(compliance))}
                  style={{ width: `${Math.min(compliance, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Load/Power/Pace */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-text-2" />
            <span className="text-xs text-text-2">
              {session.sport === "bike" ? "Power" : 
               session.sport === "run" ? "Pace" : 
               session.sport === "swim" ? "Pace" : "Load"}
            </span>
          </div>
          <div className="space-y-1">
            {session.sport === "bike" && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-3">Target</span>
                  <span className="text-xs font-medium text-text-1">{metrics.targetPower}W</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-3">Actual</span>
                  <span className="text-xs font-medium text-text-1">{metrics.actualPower}W</span>
                </div>
                <div className="relative h-1 bg-gray-600/30 rounded overflow-hidden">
                  <div
                    className={cn("h-full rounded transition-all duration-300", 
                      getProgressBarColor(Math.round((metrics.actualPower / metrics.targetPower) * 100)))}
                    style={{ width: `${Math.min((metrics.actualPower / metrics.targetPower) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
            
            {(session.sport === "run" || session.sport === "swim") && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-3">Target</span>
                  <span className="text-xs font-medium text-text-1">{metrics.targetPace}/km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-3">Actual</span>
                  <span className="text-xs font-medium text-text-1">{metrics.actualPace}/km</span>
                </div>
                <div className="relative h-1 bg-gray-600/30 rounded overflow-hidden">
                  <div
                    className={cn("h-full rounded transition-all duration-300", getProgressBarColor(compliance))}
                    style={{ width: `${Math.min(compliance, 100)}%` }}
                  />
                </div>
              </>
            )}
            
            {session.sport === "strength" && session.load && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-3">Target</span>
                  <span className="text-xs font-medium text-text-1">{session.load} TSS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-3">Actual</span>
                  <span className="text-xs font-medium text-text-1">{actualLoad} TSS</span>
                </div>
                <div className="relative h-1 bg-gray-600/30 rounded overflow-hidden">
                  <div
                    className={cn("h-full rounded transition-all duration-300", getProgressBarColor(loadCompliance))}
                    style={{ width: `${Math.min(loadCompliance, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Performance indicators */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-border-weak/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-text-2" />
            <span className="text-text-2">HR</span>
            <span className="font-medium text-text-1">{metrics.avgHR}</span>
          </div>
          
          {session.sport !== "strength" && (
            <>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-text-2" />
                <span className="text-text-2">
                  {session.sport === "swim" ? "SR" : "Cad"}
                </span>
                <span className="font-medium text-text-1">
                  {session.sport === "swim" ? metrics.strokeRate : metrics.cadence}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-text-2">Dist</span>
                <span className="font-medium text-text-1">
                  {session.sport === "bike" ? `${metrics.distance}km` : 
                   session.sport === "run" ? `${metrics.distance}km` : 
                   `${metrics.distance}km`}
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className={cn("text-xs font-medium", 
          isGoodCompliance ? "text-green-500" : 
          isOkCompliance ? "text-amber-500" : "text-red-500"
        )}>
          {isGoodCompliance ? "Excellent" : isOkCompliance ? "Good" : "Below Target"}
        </div>
      </div>
    </div>
  )
}
