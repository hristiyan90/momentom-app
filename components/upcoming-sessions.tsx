import { SessionChip } from "./session-chip"
import { InlineDrawer } from "./inline-drawer"

interface UpcomingSession {
  id: string
  sport: "swim" | "bike" | "run"
  title: string
  scheduledTime: string
  duration: string
  intensity: number
  description?: string
}

interface UpcomingSessionsProps {
  sessions: UpcomingSession[]
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  return (
    <div className="bg-bg-surface border border-border-weak rounded-lg p-6">
      <h3 className="text-text-1 font-medium mb-6">Upcoming Sessions</h3>

      {sessions.length === 0 ? (
        <p className="text-text-dim text-sm text-center py-8">No sessions scheduled</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <InlineDrawer
              key={session.id}
              trigger={
                <div className="flex items-center gap-3 w-full">
                  <SessionChip
                    sport={session.sport}
                    title={session.title}
                    duration={session.duration}
                    intensity={session.intensity}
                  />
                </div>
              }
            >
              <div className="bg-bg-raised rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-text-1 font-medium">{session.title}</p>
                    <p className="text-text-2 text-sm">{session.scheduledTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-1 text-sm">{session.duration}</p>
                    <p className="text-text-dim text-xs">Zone {session.intensity}</p>
                  </div>
                </div>

                {session.description && (
                  <div className="pt-2 border-t border-border-weak">
                    <p className="text-text-2 text-sm">{session.description}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button className="px-3 py-1 bg-swim/20 text-swim text-xs rounded-md hover:bg-swim/30 transition-colors duration-150">
                    Start Session
                  </button>
                  <button className="px-3 py-1 bg-bg-app text-text-2 text-xs rounded-md hover:bg-border-weak transition-colors duration-150">
                    Edit
                  </button>
                </div>
              </div>
            </InlineDrawer>
          ))}
        </div>
      )}
    </div>
  )
}
