import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CapacityRing } from "@/components/readiness-ring"
import { Heart, Moon, Activity, TrendingUp, Info } from "lucide-react"

interface ReadinessInfoCardProps {
  className?: string
}

export function ReadinessInfoCard({ className }: ReadinessInfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand" />
          Understanding Your Readiness Score
        </CardTitle>
        <CardDescription>
          Learn how we calculate your daily training capacity to optimize your performance
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visual Example */}
        <div className="flex items-center justify-center p-6 bg-bg-raised rounded-lg">
          <CapacityRing value={75} size="lg" />
        </div>

        {/* Key Factors */}
        <div className="space-y-4">
          <h4 className="font-semibold text-text-primary mb-3">Key Factors We Monitor:</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-bg-raised rounded-lg">
              <Heart className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-text-primary text-sm">Heart Rate Variability</h5>
                <p className="text-xs text-text-secondary mt-1">
                  Measures your autonomic nervous system recovery and stress levels
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-raised rounded-lg">
              <Moon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-text-primary text-sm">Sleep Quality</h5>
                <p className="text-xs text-text-secondary mt-1">
                  Tracks deep, REM, and light sleep phases for optimal recovery
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-raised rounded-lg">
              <Activity className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-text-primary text-sm">Resting Heart Rate</h5>
                <p className="text-xs text-text-secondary mt-1">
                  Monitors cardiovascular stress and adaptation patterns
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-raised rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-text-primary text-sm">Training Load</h5>
                <p className="text-xs text-text-secondary mt-1">
                  Considers recent workout intensity and accumulated fatigue
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-3">
          <h4 className="font-semibold text-text-primary">How Your Score Works:</h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800/30">
              <div className="h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold w-20">
                &lt;40
              </div>
              <div>
                <span className="font-medium text-red-700 dark:text-red-400">Go Easy</span>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Focus on recovery, light movement, or complete rest
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
              <div className="h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold w-20">
                40-79
              </div>
              <div>
                <span className="font-medium text-yellow-700 dark:text-yellow-300">On Plan</span>
                <p className="text-xs text-yellow-600 dark:text-yellow-200 mt-1">
                  Perfect for your scheduled training as planned
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
              <div className="h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold w-20">
                80+
              </div>
              <div>
                <span className="font-medium text-green-700 dark:text-green-400">Smash It</span>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                  Great day for high-intensity or breakthrough workouts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Adaptive Training */}
        <div className="p-4 bg-brand/10 rounded-lg border border-brand/20">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-brand text-sm">Adaptive Training</h5>
              <p className="text-xs text-text-secondary mt-1">
                Your training plan automatically adjusts based on your daily readiness score, ensuring optimal
                progression while preventing overtraining and injury.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
