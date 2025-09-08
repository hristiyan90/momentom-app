import { Info } from "lucide-react"

interface WorkoutStatsProps {
  className?: string
}

export function WorkoutStats({ className }: WorkoutStatsProps) {
  const mockStats = {
    distance: {
      total: "95.01 km",
      totalDistance: "95.01 km",
    },
    stamina: {
      beginningPotential: "97%",
      endingPotential: "46%",
      minStamina: "34%",
    },
    power: {
      avgPower: "197 W",
      maxPower: "814 W",
      maxAvgPower20min: "199 W",
      lrTorqueEffectiveness: "76% L / 0% R",
      lrPedalSmoothness: "38% L / 0% R",
      normalizedPower: "197 W",
      intensityFactor: "0.821",
      trainingStressScore: "206.1",
      ftpSetting: "240 W",
      work: "2,044 kJ",
    },
    cadence: {
      avgCadence: "84 rpm",
      maxCadence: "119 rpm",
      totalStrokes: "14,379",
    },
    nutrition: {
      restingCalories: "260",
      activeCalories: "2,044",
      totalCaloriesBurned: "2,304",
      caloriesConsumed: "--",
      caloriesNet: "-2,304",
      estSweatLoss: "2254 ml",
      fluidConsumed: "-- ml",
      fluidNet: "-2254 ml",
    },
    trainingEffect: {
      aerobic: "4.2 Highly Impacting",
      anaerobic: "0.6 No Benefit",
      primaryBenefit: "Base",
      exerciseLoad: "226",
    },
    heartRate: {
      avgHR: "130 bpm",
      maxHR: "166 bpm",
    },
    temperature: {
      avgTemp: "25.4 °C",
      minTemp: "22.0 °C",
      maxTemp: "31.0 °C",
    },
    timing: {
      time: "3:03:40",
      movingTime: "3:03:22",
      elapsedTime: "3:25:17",
    },
    elevation: {
      totalAscent: "477.0 m",
      totalDescent: "477.0 m",
      minElev: "10.0 m",
      maxElev: "93.6 m",
    },
    speed: {
      avgSpeed: "31.0 kph",
      avgMovingSpeed: "31.1 kph",
      maxSpeed: "55.0 kph",
    },
    intensityMinutes: {
      moderate: "48 min",
      vigorous: "147 min",
      total: "342 min",
    },
    workoutIntervals: {
      bikeTime: "2:00:00",
      bikeDistance: "62.95 km",
      bikeSpeed: "31.5 /km",
    },
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: Distance & Nutrition */}
        <div className="space-y-6">
          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3 flex items-center gap-2">Distance</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Distance</span>
                <span className="text-text-1 font-medium">{mockStats.distance.total}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3 flex items-center gap-2">
              Nutrition & Hydration
              <Info className="w-3 h-3 text-text-2" />
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Resting Calories</span>
                <span className="text-text-1">{mockStats.nutrition.restingCalories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Active Calories</span>
                <span className="text-text-1">{mockStats.nutrition.activeCalories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Total Calories Burned</span>
                <span className="text-text-1 font-medium">{mockStats.nutrition.totalCaloriesBurned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Calories Consumed</span>
                <span className="text-text-1">{mockStats.nutrition.caloriesConsumed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Calories Net</span>
                <span className="text-text-1">{mockStats.nutrition.caloriesNet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Est. Sweat Loss</span>
                <span className="text-text-1">{mockStats.nutrition.estSweatLoss}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Fluid Consumed</span>
                <span className="text-text-1">{mockStats.nutrition.fluidConsumed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Fluid Net</span>
                <span className="text-text-1">{mockStats.nutrition.fluidNet}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Stamina, Training Effect, Heart Rate, Timing */}
        <div className="space-y-6">
          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3">Stamina</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Beginning Potential</span>
                <span className="text-text-1 font-medium">{mockStats.stamina.beginningPotential}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Ending Potential</span>
                <span className="text-text-1">{mockStats.stamina.endingPotential}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Min Stamina</span>
                <span className="text-text-1">{mockStats.stamina.minStamina}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3 flex items-center gap-2">
              Training Effect
              <Info className="w-3 h-3 text-text-2" />
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Aerobic</span>
                <span className="text-text-1">{mockStats.trainingEffect.aerobic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Anaerobic</span>
                <span className="text-text-1">{mockStats.trainingEffect.anaerobic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Primary Benefit</span>
                <span className="text-text-1 font-medium">{mockStats.trainingEffect.primaryBenefit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Exercise Load</span>
                <span className="text-text-1">{mockStats.trainingEffect.exerciseLoad}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3 flex items-center gap-2">
              Heart Rate
              <Info className="w-3 h-3 text-text-2" />
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Avg HR</span>
                <span className="text-text-1">{mockStats.heartRate.avgHR}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max HR</span>
                <span className="text-text-1">{mockStats.heartRate.maxHR}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3">Timing</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Time</span>
                <span className="text-text-1 font-medium">{mockStats.timing.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Moving Time</span>
                <span className="text-text-1">{mockStats.timing.movingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Elapsed Time</span>
                <span className="text-text-1">{mockStats.timing.elapsedTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Power & Elevation */}
        <div className="space-y-6">
          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3 flex items-center gap-2">
              Power
              <div className="flex gap-1 ml-auto">
                <button className="chip chip-sport-swim">Watts</button>
                <button className="chip">W/kg</button>
                <button className="chip">Zones</button>
              </div>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Avg Power</span>
                <span className="text-text-1 font-medium">{mockStats.power.avgPower}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max Power</span>
                <span className="text-text-1">{mockStats.power.maxPower}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max Avg Power (20 min)</span>
                <span className="text-text-1">{mockStats.power.maxAvgPower20min}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">L/R Torque Effectiveness</span>
                <span className="text-text-1">{mockStats.power.lrTorqueEffectiveness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">L/R Pedal Smoothness</span>
                <span className="text-text-1">{mockStats.power.lrPedalSmoothness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Normalized Power® (NP®)</span>
                <span className="text-text-1">{mockStats.power.normalizedPower}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Intensity Factor® (IF®)</span>
                <span className="text-text-1">{mockStats.power.intensityFactor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Training Stress Score®</span>
                <span className="text-text-1">{mockStats.power.trainingStressScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">FTP Setting</span>
                <span className="text-text-1">{mockStats.power.ftpSetting}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Work</span>
                <span className="text-text-1">{mockStats.power.work}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3">Elevation</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Total Ascent</span>
                <span className="text-text-1">{mockStats.elevation.totalAscent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Total Descent</span>
                <span className="text-text-1">{mockStats.elevation.totalDescent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Min Elev</span>
                <span className="text-text-1">{mockStats.elevation.minElev}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max Elev</span>
                <span className="text-text-1">{mockStats.elevation.maxElev}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Cadence, Temperature, Intensity Minutes, Speed, Workout Intervals */}
        <div className="space-y-6">
          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3">Bike Cadence</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Avg Bike Cadence</span>
                <span className="text-text-1 font-medium">{mockStats.cadence.avgCadence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max Bike Cadence</span>
                <span className="text-text-1">{mockStats.cadence.maxCadence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Total Strokes</span>
                <span className="text-text-1">{mockStats.cadence.totalStrokes}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3">Temperature</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Avg Temp</span>
                <span className="text-text-1">{mockStats.temperature.avgTemp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Min Temp</span>
                <span className="text-text-1">{mockStats.temperature.minTemp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max Temp</span>
                <span className="text-text-1">{mockStats.temperature.maxTemp}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3">Intensity Minutes</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Moderate</span>
                <span className="text-text-1">{mockStats.intensityMinutes.moderate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm flex items-center gap-1">
                  Vigorous
                  <Info className="w-3 h-3 text-text-2" />
                </span>
                <span className="text-text-1">{mockStats.intensityMinutes.vigorous}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Total</span>
                <span className="text-text-1 font-medium">{mockStats.intensityMinutes.total}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3 flex items-center gap-2">
              Pace/Speed
              <Info className="w-3 h-3 text-text-2" />
              <div className="flex gap-1 ml-auto">
                <button className="chip">Pace</button>
                <button className="chip chip-sport-swim">Speed</button>
              </div>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Avg Speed</span>
                <span className="text-text-1">{mockStats.speed.avgSpeed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Avg Moving Speed</span>
                <span className="text-text-1">{mockStats.speed.avgMovingSpeed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Max Speed</span>
                <span className="text-text-1 font-medium">{mockStats.speed.maxSpeed}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4">
            <h4 className="text-text-1 font-medium mb-3">Workout Intervals</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Bike Time</span>
                <span className="text-text-1">{mockStats.workoutIntervals.bikeTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Bike Distance</span>
                <span className="text-text-1">{mockStats.workoutIntervals.bikeDistance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-2 text-sm">Bike Speed</span>
                <span className="text-text-1">{mockStats.workoutIntervals.bikeSpeed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
