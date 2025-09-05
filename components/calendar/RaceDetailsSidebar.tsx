"use client"

import { X, Calendar, MapPin, Trophy, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface Race {
  id: string
  name: string
  type: "A" | "B" | "C"
  date: Date
  location: string
  distance: string
  discipline: "triathlon" | "swim" | "bike" | "run"
  description?: string
}

interface RaceDetailsSidebarProps {
  race: Race
  onClose: () => void
}

const raceTypeColors = {
  A: "bg-red-500",
  B: "bg-amber-500",
  C: "bg-blue-500",
}

const raceTypeLabels = {
  A: "A Race - Priority Event",
  B: "B Race - Tune-up Event",
  C: "C Race - Training Race",
}

const disciplineIcons = {
  triathlon: "🏊‍♂️🚴‍♂️🏃‍♂️",
  swim: "🏊‍♂️",
  bike: "🚴‍♂️",
  run: "🏃‍♂️",
}

export function RaceDetailsSidebar({ race, onClose }: RaceDetailsSidebarProps) {
  const router = useRouter()

  const handleViewRaces = () => {
    router.push("/races")
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 ml-auto w-96 bg-bg-app border-l border-border-weak shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-border-weak">
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 ${raceTypeColors[race.type]} text-white text-sm font-bold rounded flex items-center justify-center`}
              >
                {race.type}
              </div>
              <h2 className="text-lg font-semibold text-text-1">Race Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-2 hover:text-text-1 hover:bg-bg-surface rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-6">
            {/* Race Type Badge */}
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 ${raceTypeColors[race.type]} text-white text-sm font-medium rounded-full`}>
                {raceTypeLabels[race.type]}
              </div>
            </div>

            {/* Race Name */}
            <div>
              <h3 className="text-xl font-bold text-text-1 mb-2">{race.name}</h3>
              <div className="text-2xl">{disciplineIcons[race.discipline]}</div>
            </div>

            {/* Race Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-text-2 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-1">Date</div>
                  <div className="text-sm text-text-2">{formatDate(race.date)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-text-2 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-1">Location</div>
                  <div className="text-sm text-text-2">{race.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-text-2 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-1">Distance</div>
                  <div className="text-sm text-text-2">{race.distance}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            {race.description && (
              <div>
                <div className="text-sm font-medium text-text-1 mb-2">Description</div>
                <div className="text-sm text-text-2 leading-relaxed">{race.description}</div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border-weak">
            <button
              onClick={handleViewRaces}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sport-swim text-white font-medium rounded-lg hover:bg-sport-swim/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View All Races
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
