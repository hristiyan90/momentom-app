"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Target, Heart, Waves, Bike, Footprints, AlertCircle, Check, Calendar, Clock, Info, Loader2, X } from "lucide-react"
import { useOnboardingPersistence } from "@/lib/hooks/useOnboardingPersistence"

const QUICK_START_STEPS = [
  { id: "goals", title: "Goals & Races", description: "Tell us about your training goals" },
  { id: "preferences", title: "Training Preferences", description: "Configure your training schedule and approach" },
  { id: "metrics", title: "Primary Metrics", description: "Choose how you want to target your workouts" },
  { id: "preview", title: "Plan Preview", description: "Here's how your first week looks" },
]

interface QuickStartData {
  goals: {
    isMaintenanceMode: boolean
    racePriority: string
    raceType: string
    raceDate: string
    raceLocation: string
    focusArea: string
    hasFinishTimeGoal: boolean
    swimTime: string
    bikeTime: string
    runTime: string
  }
  preferences: {
    restDay: string
    weeklyHours: string
    periodization: string
    startDate: string
  }
  metrics: {
    useDefaults: boolean
    swimMetric: string
    bikeMetric: string
    runMetric: string
  }
}

interface StepProps {
  updateData: (data: Partial<QuickStartData>) => void
  setIsValid: (valid: boolean) => void
  hasAttemptedNext: boolean
  data: QuickStartData
}

interface GoalsStepProps {
  updateData: (data: Partial<QuickStartData>) => void
  setIsValid: (valid: boolean) => void
  hasAttemptedNext: boolean
  goals: QuickStartData["goals"]
}

interface PreferencesStepProps {
  updateData: (data: Partial<QuickStartData>) => void
  setIsValid: (valid: boolean) => void
  hasAttemptedNext: boolean
  preferences: QuickStartData["preferences"]
}

export default function QuickStartOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isValid, setIsValid] = useState(false)
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [planGenerated, setPlanGenerated] = useState(false)

  // API Integration Hook
  const {
    isSaving,
    error: apiError,
    saveProfile,
    savePreferences,
    saveRaceData,
    clearError,
  } = useOnboardingPersistence()

  const [data, setData] = useState<QuickStartData>({
    goals: {
      isMaintenanceMode: false,
      racePriority: "",
      raceType: "",
      raceDate: "",
      raceLocation: "",
      focusArea: "",
      hasFinishTimeGoal: false,
      swimTime: "",
      bikeTime: "",
      runTime: "",
    },
    preferences: {
      restDay: "",
      weeklyHours: "",
      periodization: "",
      startDate: new Date().toISOString().split("T")[0],
    },
    metrics: {
      useDefaults: true,
      swimMetric: "pace",
      bikeMetric: "power",
      runMetric: "pace",
    },
  })

  const updateData = useCallback((newData: Partial<QuickStartData>) => {
    setData((prev) => ({ ...prev, ...newData }))
  }, [])

  const handleNext = () => {
    setHasAttemptedNext(true)
    if (isValid) {
      if (currentStep < QUICK_START_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
        setHasAttemptedNext(false)
        setIsValid(false)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setHasAttemptedNext(false)
      setIsValid(true)
    }
  }

  const generatePlan = async () => {
    setIsGenerating(true)
    clearError()

    try {
      // Step 1: Save profile
      const profileData = {
        firstName: "Quick",
        lastName: "Start User",
        dateOfBirth: data.preferences.startDate,
        experienceLevel: "intermediate",
        weeklyHours: data.preferences.weeklyHours,
        trainingDays: "5",
      }

      const profileSuccess = await saveProfile(profileData)
      if (!profileSuccess) {
        setIsGenerating(false)
        return
      }

      // Step 2: Save preferences
      const preferencesData = {
        restDay: data.preferences.restDay,
        weeklyHours: data.preferences.weeklyHours,
        periodization: data.preferences.periodization,
        runMetric: data.metrics.runMetric || 'pace',
        bikeMetric: data.metrics.bikeMetric || 'power',
        swimMetric: data.metrics.swimMetric || 'pace',
      }

      const prefsSuccess = await savePreferences(preferencesData)
      if (!prefsSuccess) {
        setIsGenerating(false)
        return
      }

      // Step 3: Save race if in race training mode
      if (!data.goals.isMaintenanceMode && data.goals.raceDate && data.goals.raceType) {
        const races = [{
          racePriority: data.goals.racePriority,
          raceType: data.goals.raceType,
          raceDate: data.goals.raceDate,
          raceLocation: data.goals.raceLocation,
          raceName: `${data.goals.raceType} - ${data.goals.raceLocation || 'TBD'}`,
        }]

        await saveRaceData(races)
      }

      // Simulate plan generation delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsGenerating(false)
      setPlanGenerated(true)
    } catch (error) {
      console.error('[Quick Start] Error generating plan:', error)
      setIsGenerating(false)
    }
  }

  const completePlan = () => {
    router.push("/")
  }

  const renderStep = () => {
    switch (QUICK_START_STEPS[currentStep].id) {
      case "goals":
        return (
          <GoalsRacesStep
            updateData={updateData}
            setIsValid={setIsValid}
            hasAttemptedNext={hasAttemptedNext}
            goals={data.goals}
          />
        )
      case "preferences":
        return (
          <TrainingPreferencesStep
            updateData={updateData}
            setIsValid={setIsValid}
            hasAttemptedNext={hasAttemptedNext}
            preferences={data.preferences}
          />
        )
      case "metrics":
        return (
          <PrimaryMetricsStep
            updateData={updateData}
            setIsValid={setIsValid}
            hasAttemptedNext={hasAttemptedNext}
            data={data}
          />
        )
      case "preview":
        return (
          <PlanPreviewStep
            data={data}
            isGenerating={isGenerating}
            planGenerated={planGenerated}
            generatePlan={generatePlan}
            completePlan={completePlan}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Header */}
      <div className="border-b border-border-weak bg-bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Quick Start Setup</h1>
              <p className="text-text-secondary">Get training in 4 simple steps</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/onboarding")}
              className="text-brand hover:text-brand/80"
            >
              Switch to Advanced Setup →
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {apiError && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="p-4 bg-status-danger/10 border border-status-danger rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-status-danger flex-shrink-0" />
            <div className="flex-1">
              <p className="text-status-danger font-medium">Error</p>
              <p className="text-status-danger/80 text-sm mt-1">{apiError}</p>
            </div>
            <button onClick={clearError} className="text-status-danger hover:text-status-danger/80">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Steps */}
          <div className="col-span-3">
            <div className="space-y-4">
              {QUICK_START_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg transition-all",
                    index === currentStep
                      ? "bg-brand/10 border-l-4 border-brand"
                      : index < currentStep
                        ? "bg-bg-surface border-l-4 border-status-success"
                        : "bg-bg-surface border-l-4 border-transparent",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      index === currentStep
                        ? "bg-brand text-white"
                        : index < currentStep
                          ? "bg-status-success text-white"
                          : "bg-border text-text-secondary",
                    )}
                  >
                    {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <div>
                    <div
                      className={cn(
                        "font-medium",
                        index === currentStep
                          ? "text-brand"
                          : index < currentStep
                            ? "text-text-primary"
                            : "text-text-secondary",
                      )}
                    >
                      {step.title}
                    </div>
                    <div className="text-sm text-text-secondary">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-bg-surface rounded-lg border border-border-weak p-8">
              {renderStep()}

              {/* Navigation */}
              {currentStep < QUICK_START_STEPS.length - 1 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-border-weak">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="px-6 bg-transparent"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={(!isValid && hasAttemptedNext) || isSaving}
                    className="px-6"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Next Step'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoalsRacesStep({ updateData, setIsValid, hasAttemptedNext, goals }: GoalsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})

  const validateStep = useCallback(() => {
    const newErrors: Record<string, string> = {}
    const newWarnings: Record<string, string> = {}

    if (!goals.isMaintenanceMode) {
      if (!goals.racePriority) newErrors.racePriority = "Please select a race priority"
      if (!goals.raceType) newErrors.raceType = "Please select a race type"
      if (!goals.raceDate) {
        newErrors.raceDate = "Race date is required"
      } else {
        const raceDate = new Date(goals.raceDate)
        const today = new Date()
        if (raceDate <= today) {
          newErrors.raceDate = "Race date must be in the future"
        } else {
          const sixWeeksFromNow = new Date(today.getTime() + 6 * 7 * 24 * 60 * 60 * 1000)
          if (raceDate < sixWeeksFromNow) {
            newWarnings.raceDate = "Tight runway. We'll compress progression and emphasize readiness."
          }
        }
      }
    } else {
      if (!goals.focusArea) newErrors.focusArea = "Please select a focus area"
    }

    setErrors(newErrors)
    setWarnings(newWarnings)
    const isValid = Object.keys(newErrors).length === 0
    setIsValid(isValid)
    return isValid
  }, [goals, setIsValid])

  useEffect(() => {
    if (hasAttemptedNext) {
      const isValid = validateStep()
      if (isValid) {
        updateData({ goals })
      }
    }
  }, [hasAttemptedNext, validateStep, goals, updateData])

  const handleChange = (field: keyof typeof goals, value: any) => {
    updateData({
      goals: {
        ...goals,
        [field]: value,
      },
    })
  }

  const getTriathlonDistances = () => [
    { value: "Sprint", label: "Sprint" },
    { value: "Olympic", label: "Olympic" },
    { value: "70.3", label: "Ironman 70.3" },
    { value: "140.6", label: "Ironman" },
    { value: "T100", label: "T100" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Goals & Races
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>Tell us about your training goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleChange("isMaintenanceMode", false)}
          className="p-6 rounded-lg border-2 text-left transition-all hover:scale-[1.02]"
          style={{
            borderColor: !goals.isMaintenanceMode ? "var(--brand)" : "var(--border)",
            backgroundColor: "transparent",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5" />
            <span className="font-semibold">Race Training</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Prepare for a specific triathlon race
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleChange("isMaintenanceMode", true)}
          className="p-6 rounded-lg border-2 text-left transition-all hover:scale-[1.02]"
          style={{
            borderColor: goals.isMaintenanceMode ? "var(--brand)" : "var(--border)",
            backgroundColor: "transparent",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Fitness Maintenance</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Stay fit and healthy with general training
          </p>
        </button>
      </div>

      {goals.isMaintenanceMode && (
        <div className="space-y-6">
          <div>
            <Label style={{ color: "var(--text-primary)" }} className="flex items-center gap-2">
              Focus Area
              <div className="group relative">
                <Info className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 text-xs"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
                >
                  Determines training structure and intensity distribution
                </div>
              </div>
            </Label>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: "endurance", label: "Endurance Base", desc: "Build aerobic capacity" },
                { value: "strength", label: "Strength & Power", desc: "Improve force production" },
                { value: "speed", label: "Speed & Agility", desc: "Enhance neuromuscular power" },
              ].map((area) => (
                <button
                  key={area.value}
                  type="button"
                  onClick={() => handleChange("focusArea", area.value)}
                  className="p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: goals.focusArea === area.value ? "var(--brand)" : "var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--text-primary)",
                  }}
                >
                  <div className="font-medium mb-1">{area.label}</div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {area.desc}
                  </div>
                </button>
              ))}
            </div>
            {hasAttemptedNext && errors.focusArea && (
              <p className="text-sm mt-1" style={{ color: "var(--status-danger)" }}>
                {errors.focusArea}
              </p>
            )}
          </div>
        </div>
      )}

      {!goals.isMaintenanceMode && (
        <div className="space-y-6">
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Primary Race Goal
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Select your main triathlon race. You can add additional races later in the races section.
            </p>

            <div className="space-y-6">
              <div>
                <Label style={{ color: "var(--text-primary)" }} className="flex items-center gap-2">
                  Race Priority
                  <div className="group relative">
                    <Info className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    <div
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 text-xs"
                      style={{ backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
                    >
                      Influences training volume, intensity, and taper strategy
                    </div>
                  </div>
                </Label>
                <div className="mt-3 flex gap-3">
                  {[
                    { value: "A", label: "Priority A", desc: "Must achieve", color: "var(--status-danger)" },
                    { value: "B", label: "Priority B", desc: "Important", color: "var(--status-alert)" },
                    { value: "C", label: "Priority C", desc: "Nice to have", color: "var(--status-success)" },
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => handleChange("racePriority", priority.value)}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: goals.racePriority === priority.value ? "var(--brand)" : "var(--border)",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: priority.color }}
                      >
                        {priority.value}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{priority.label}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {priority.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {hasAttemptedNext && errors.racePriority && (
                  <p className="text-sm mt-1" style={{ color: "var(--status-danger)" }}>
                    {errors.racePriority}
                  </p>
                )}
              </div>

              <div>
                <Label style={{ color: "var(--text-primary)" }} className="flex items-center gap-2">
                  Triathlon Distance
                  <div className="group relative">
                    <Info className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    <div
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 text-xs"
                      style={{ backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
                    >
                      Determines race-specific training focus and periodization strategy
                    </div>
                  </div>
                </Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getTriathlonDistances().map((distance) => (
                    <button
                      key={distance.value}
                      type="button"
                      onClick={() => handleChange("raceType", distance.value)}
                      className="px-4 py-2 rounded-lg border-2 font-medium transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: goals.raceType === distance.value ? "var(--brand)" : "var(--border)",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      {distance.label}
                    </button>
                  ))}
                </div>
                {hasAttemptedNext && errors.raceType && (
                  <p className="text-sm mt-1" style={{ color: "var(--status-danger)" }}>
                    {errors.raceType}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="raceDate"
                    style={{ color: "var(--text-primary)" }}
                    className="flex items-center gap-2"
                  >
                    Race Date
                    <div className="group relative">
                      <Info className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                      <div
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 text-xs"
                        style={{ backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
                      >
                        Sets training timeline and periodization schedule
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="raceDate"
                    type="date"
                    value={goals.raceDate}
                    onChange={(e) => handleChange("raceDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-2"
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: hasAttemptedNext && errors.raceDate ? "var(--status-danger)" : "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  {hasAttemptedNext && errors.raceDate && (
                    <p className="text-sm mt-1" style={{ color: "var(--status-danger)" }}>
                      {errors.raceDate}
                    </p>
                  )}
                  {hasAttemptedNext && warnings.raceDate && (
                    <p className="text-sm mt-1" style={{ color: "var(--status-caution)" }}>
                      {warnings.raceDate}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="raceLocation"
                    style={{ color: "var(--text-primary)" }}
                    className="flex items-center gap-2"
                  >
                    Location
                    <div className="group relative">
                      <Info className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                      <div
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 text-xs"
                        style={{ backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
                      >
                        Helps plan travel logistics and environmental considerations
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="raceLocation"
                    type="text"
                    value={goals.raceLocation}
                    onChange={(e) => handleChange("raceLocation", e.target.value)}
                    placeholder="City, Country"
                    className="mt-2"
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: hasAttemptedNext && errors.raceLocation ? "var(--status-danger)" : "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  {hasAttemptedNext && errors.raceLocation && (
                    <p className="text-sm mt-1" style={{ color: "var(--status-danger)" }}>
                      {errors.raceLocation}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange("hasFinishTimeGoal", !goals.hasFinishTimeGoal)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2 border-2"
                    style={{
                      borderColor: goals.hasFinishTimeGoal ? "var(--brand)" : "var(--border)",
                      backgroundColor: goals.hasFinishTimeGoal ? "var(--brand)" : "transparent",
                      color: goals.hasFinishTimeGoal ? "var(--bg)" : "var(--text-secondary)",
                    }}
                  >
                    {goals.hasFinishTimeGoal && <Check className="w-3 h-3" />}I have a finish time goal
                  </button>
                </div>

                {goals.hasFinishTimeGoal && (
                  <div
                    className="grid grid-cols-3 gap-4 p-4 rounded-lg border"
                    style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <div>
                      <Label htmlFor="swimTime" className="text-sm" style={{ color: "var(--text-primary)" }}>
                        Swim Time
                      </Label>
                      <Input
                        id="swimTime"
                        type="text"
                        value={goals.swimTime}
                        onChange={(e) => handleChange("swimTime", e.target.value)}
                        placeholder="00:30:00"
                        className="mt-1"
                        style={{
                          backgroundColor: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bikeTime" className="text-sm" style={{ color: "var(--text-primary)" }}>
                        Bike Time
                      </Label>
                      <Input
                        id="bikeTime"
                        type="text"
                        value={goals.bikeTime}
                        onChange={(e) => handleChange("bikeTime", e.target.value)}
                        placeholder="02:30:00"
                        className="mt-1"
                        style={{
                          backgroundColor: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="runTime" className="text-sm" style={{ color: "var(--text-primary)" }}>
                        Run Time
                      </Label>
                      <Input
                        id="runTime"
                        type="text"
                        value={goals.runTime}
                        onChange={(e) => handleChange("runTime", e.target.value)}
                        placeholder="01:45:00"
                        className="mt-1"
                        style={{
                          backgroundColor: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5" style={{ color: "var(--status-info)" }} />
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  You can add more races later
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  This quick setup gets you started with a solid foundation. Add additional races and adjust goals
                  anytime in the races section.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TrainingPreferencesStep({ updateData, setIsValid, hasAttemptedNext, preferences }: PreferencesStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!preferences.restDay) newErrors.restDay = "Please select a rest day"
    if (!preferences.weeklyHours) newErrors.weeklyHours = "Please select weekly training hours"
    if (!preferences.periodization) newErrors.periodization = "Please select a periodization style"
    if (!preferences.startDate) newErrors.startDate = "Please select a start date"

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    setIsValid(isValid)
    return isValid
  }, [preferences.restDay, preferences.weeklyHours, preferences.periodization, preferences.startDate, setIsValid])

  useEffect(() => {
    if (hasAttemptedNext) {
      const isValid = validateStep()
      if (isValid) {
        updateData({ preferences })
      }
    }
  }, [hasAttemptedNext, validateStep, preferences, updateData])

  const restDayOptions = [
    { value: "monday", label: "Mon", description: "Most common after weekend long sessions" },
    { value: "tuesday", label: "Tue", description: "Alternative recovery day" },
    { value: "wednesday", label: "Wed", description: "Mid-week break" },
    { value: "thursday", label: "Thu", description: "Pre-weekend recovery" },
    { value: "friday", label: "Fri", description: "Weekend warrior prep" },
    { value: "saturday", label: "Sat", description: "Weekend rest day" },
    { value: "sunday", label: "Sun", description: "Traditional rest day" },
  ]

  const weeklyHoursOptions = [
    {
      value: "3-5",
      label: "Less than 5h",
      subtitle: "Minimal training, suitable for beginners or those maintaining fitness",
    },
    {
      value: "6-8",
      label: "5 to 8h",
      subtitle: "Light training, ideal for individuals participating in 1 to 2 sessions per discipline each week",
    },
    {
      value: "9-12",
      label: "8 to 12h",
      subtitle: "Moderate training, typically for age-group triathletes or competitive single-sport athletes",
    },
    {
      value: "13-16",
      label: "12 to 15h",
      subtitle: "High training, aimed at serious age-group competitors or semi-elite athletes",
    },
    {
      value: "17+",
      label: "15h and above",
      subtitle: "Elite training, designed for top age-groupers or professional athletes",
    },
  ]

  const periodizationOptions = [
    {
      value: "3:1",
      title: "3:1 Traditional",
      description: "3 weeks progressive + 1 recovery week",
      benefits: ["Proven method", "Steady progression", "Good for beginners"],
    },
    {
      value: "2:1",
      title: "2:1 Enhanced Recovery",
      description: "2 weeks training + 1 recovery week",
      benefits: ["Better adaptation", "Reduced burnout", "Faster recovery"],
    },
  ]

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="space-y-12">
        <div className="text-left">
          <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Training Preferences
          </h2>
          <p style={{ color: "var(--text-secondary)" }} className="text-lg mt-2">
            Configure your training schedule and approach
          </p>
        </div>

        {/* Rest Day Selection */}
        <div className="space-y-6">
          <div className="text-left">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Calendar className="w-6 h-6" style={{ color: "brand" }} />
              Rest Day Preference
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Choose your ideal recovery day, traditionally on Monday after long weekend training sessions, but choose
              based on your personal availability and schedule.
            </p>
          </div>
          <div className="grid grid-cols-7 gap-3 max-w-4xl">
            {restDayOptions.map((option) => {
              const isSelected = preferences.restDay === option.value
              const hasError = hasAttemptedNext && errors.restDay

              return (
                <div key={option.value} className="relative group">
                  <button
                    onClick={() => {
                      updateData({ preferences: { ...preferences, restDay: option.value } })
                    }}
                    className={`w-full p-4 rounded-xl text-center transition-all duration-200 border-2 ${
                      isSelected ? "shadow-lg" : hasError ? "" : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(var(--brand-rgb), 0.1)"
                        : hasError
                          ? "rgba(220, 38, 38, 0.1)"
                          : "var(--bg-surface)",
                      borderColor: isSelected ? "var(--brand)" : hasError ? "#DC2626" : "var(--border-weak)",
                      color: isSelected ? "var(--brand)" : hasError ? "#DC2626" : "var(--text-primary)",
                    }}
                  >
                    <div className="font-semibold text-sm">{option.label}</div>
                  </button>
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-weak)",
                    }}
                  >
                    {option.description}
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent"
                      style={{ borderTopColor: "var(--bg-surface)" }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
          {hasAttemptedNext && errors.restDay && (
            <p className="text-sm flex items-center gap-2" style={{ color: "#DC2626" }}>
              <AlertCircle className="w-4 h-4" />
              {errors.restDay}
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="text-left">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Clock className="w-6 h-6" style={{ color: "brand" }} />
              Weekly Training Volume
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>How much time can you dedicate to training?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl">
            {weeklyHoursOptions.map((option) => {
              const isSelected = preferences.weeklyHours === option.value
              const hasError = hasAttemptedNext && errors.weeklyHours

              return (
                <div key={option.value} className="relative group">
                  <button
                    onClick={() => {
                      updateData({ preferences: { ...preferences, weeklyHours: option.value } })
                    }}
                    className={`relative w-full p-6 rounded-xl text-center transition-all duration-200 border-2 ${
                      isSelected ? "shadow-lg" : hasError ? "" : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(var(--brand-rgb), 0.1)"
                        : hasError
                          ? "rgba(220, 38, 38, 0.1)"
                          : "var(--bg-surface)",
                      borderColor: isSelected ? "var(--brand)" : hasError ? "#DC2626" : "var(--border-weak)",
                      color: isSelected ? "var(--brand)" : hasError ? "#DC2626" : "var(--text-primary)",
                    }}
                  >
                    <div className="font-bold mb-2 text-base">{option.label}</div>
                  </button>
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-weak)",
                    }}
                  >
                    {option.subtitle}
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent"
                      style={{ borderTopColor: "var(--bg-surface)" }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
          {hasAttemptedNext && errors.weeklyHours && (
            <p className="text-sm flex items-center gap-2" style={{ color: "#DC2626" }}>
              <AlertCircle className="w-4 h-4" />
              {errors.weeklyHours}
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="text-left">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              Periodization Style
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>Choose your training cycle approach</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {periodizationOptions.map((option) => {
              const isSelected = preferences.periodization === option.value
              const hasError = hasAttemptedNext && errors.periodization

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    updateData({ preferences: { ...preferences, periodization: option.value } })
                  }}
                  className={`p-6 rounded-xl text-left transition-all duration-200 border-2 ${
                    isSelected ? "shadow-lg" : hasError ? "" : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(var(--brand-rgb), 0.1)"
                      : hasError
                        ? "rgba(220, 38, 38, 0.1)"
                        : "var(--bg-surface)",
                    borderColor: isSelected ? "var(--brand)" : hasError ? "#DC2626" : "var(--border-weak)",
                    color: isSelected ? "var(--brand)" : hasError ? "#DC2626" : "var(--text-primary)",
                  }}
                >
                  <div className="font-bold text-lg mb-2">{option.title}</div>
                  <div className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                    {option.description}
                  </div>
                  <div className="space-y-1">
                    {option.benefits.map((benefit, index) => (
                      <div key={index} className="text-xs flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--brand)" }}></div>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
          {hasAttemptedNext && errors.periodization && (
            <p className="text-sm flex items-center gap-2" style={{ color: "#DC2626" }}>
              <AlertCircle className="w-4 h-4" />
              {errors.periodization}
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="text-left">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              Plan Start Date
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>When would you like to begin your training plan?</p>
          </div>
          <div className="max-w-md">
            <Input
              id="startDate"
              type="date"
              value={preferences.startDate}
              min={today}
              onChange={(e) => updateData({ preferences: { ...preferences, startDate: e.target.value } })}
              className="text-center text-lg py-3 transition-colors"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor:
                  hasAttemptedNext && errors.startDate
                    ? "var(--status-danger)"
                    : preferences.startDate
                      ? "var(--brand)"
                      : "var(--border)",
                color: "var(--text-primary)",
              }}
            />
            {hasAttemptedNext && errors.startDate && (
              <p className="text-sm mt-1 flex items-center gap-2" style={{ color: "var(--status-danger)" }}>
                <AlertCircle className="w-4 h-4" />
                {errors.startDate}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PrimaryMetricsStep({ updateData, setIsValid, hasAttemptedNext, data }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsValid(true)
    updateData({ metrics: data.metrics })
  }, [data.metrics, updateData, setIsValid])

  const handleMetricChange = (discipline: keyof typeof data.metrics, value: string) => {
    updateData({
      metrics: {
        ...data.metrics,
        [discipline]: value,
      },
    })
  }

  const toggleDefaults = () => {
    const newUseDefaults = !data.metrics.useDefaults
    updateData({
      metrics: {
        ...data.metrics,
        useDefaults: newUseDefaults,
        swimMetric: newUseDefaults ? "pace" : data.metrics.swimMetric,
        bikeMetric: newUseDefaults ? "power" : data.metrics.bikeMetric,
        runMetric: newUseDefaults ? "pace" : data.metrics.runMetric,
      },
    })
  }

  const metricOptions = {
    swim: [
      { value: "pace", label: "Pace", description: "Time per 100m" },
    ],
    bike: [
      { value: "power", label: "Power", description: "Watts output" },
      { value: "heart-rate", label: "Heart Rate", description: "Average BPM" },
    ],
    run: [
      { value: "pace", label: "Pace", description: "Time per km" },
      { value: "power", label: "Power", description: "Watts output" },
      { value: "heart-rate", label: "Heart Rate", description: "Average BPM" },
    ],
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Primary Metrics</h2>
        <p className="text-text-secondary">Choose how you want to target your workouts</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-bg-surface rounded-lg border border-border-weak">
          <button
            type="button"
            onClick={toggleDefaults}
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
              data.metrics.useDefaults
                ? "bg-brand border-brand text-white"
                : "border-border hover:border-border-strong",
            )}
          >
            {data.metrics.useDefaults && <Check className="w-3 h-3" />}
          </button>
          <div>
            <div className="font-medium text-text-primary">Use recommended defaults</div>
            <div className="text-sm text-text-secondary">
              We'll set optimal metrics based on best practices: Pace for swim/run, Power for bike
            </div>
          </div>
        </div>

        {!data.metrics.useDefaults && (
          <div className="space-y-6">
            {/* Swim Metrics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Waves className="w-5 h-5 text-blue-500" />
                <Label className="text-text-primary font-medium">Swimming</Label>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {metricOptions.swim.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleMetricChange("swimMetric", option.value)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] shadow-sm",
                      data.metrics.swimMetric === option.value
                        ? "border-brand text-text-primary shadow-lg"
                        : "border-border-weak bg-surface text-text-secondary hover:border-border-strong",
                    )}
                  >
                    <div className="font-medium mb-1">{option.label}</div>
                    <div className="text-sm text-text-secondary">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bike Metrics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bike className="w-5 h-5 text-orange-500" />
                <Label className="text-text-primary font-medium">Cycling</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {metricOptions.bike.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleMetricChange("bikeMetric", option.value)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] shadow-sm",
                      data.metrics.bikeMetric === option.value
                        ? "border-brand text-text-primary shadow-lg"
                        : "border-border-weak bg-surface text-text-secondary hover:border-border-strong",
                    )}
                  >
                    <div className="font-medium mb-1">{option.label}</div>
                    <div className="text-sm text-text-secondary">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Run Metrics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Footprints className="w-5 h-5 text-green-500" />
                <Label className="text-text-primary font-medium">Running</Label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {metricOptions.run.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleMetricChange("runMetric", option.value)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] shadow-sm",
                      data.metrics.runMetric === option.value
                        ? "border-brand text-text-primary shadow-lg"
                        : "border-border-weak bg-surface text-text-secondary hover:border-border-strong",
                    )}
                  >
                    <div className="font-medium mb-1">{option.label}</div>
                    <div className="text-sm text-text-secondary">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-bg-surface/50 rounded-lg p-4 border border-border-weak">
          <p className="text-sm text-text-secondary">
            <strong>Note:</strong> You can change these metrics anytime in your settings. We recommend starting with
            defaults and adjusting based on your available equipment and preferences.
          </p>
        </div>
      </div>
    </div>
  )
}

function PlanPreviewStep({
  data,
  isGenerating,
  planGenerated,
  generatePlan,
  completePlan,
}: {
  data: QuickStartData
  isGenerating: boolean
  planGenerated: boolean
  generatePlan: () => void
  completePlan: () => void
}) {
  if (planGenerated) {
    return (
      <div className="space-y-8 text-center">
        <div className="w-16 h-16 bg-status-success rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-white" />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Plan Generated Successfully!</h2>
          <p className="text-text-secondary text-lg">Your personalized training plan is ready.</p>
        </div>

        <div className="bg-bg-surface rounded-lg p-6 border border-border-weak text-left max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-text-primary mb-4">Plan Overview</h3>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-text-secondary">Duration:</div>
              <div className="font-semibold text-text-primary">16 weeks</div>
            </div>
            <div>
              <div className="text-text-secondary">Weekly Hours:</div>
              <div className="font-semibold text-text-primary">{data.preferences.weeklyHours}</div>
            </div>
            <div>
              <div className="text-text-secondary">Sessions/Week:</div>
              <div className="font-semibold text-text-primary">5-6</div>
            </div>
            <div>
              <div className="text-text-secondary">Start Date:</div>
              <div className="font-semibold text-text-primary">
                {new Date(data.preferences.startDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-text-secondary text-sm mb-2">Focus Areas:</div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-brand/20 text-brand rounded-full text-sm">Base building</span>
              <span className="px-3 py-1 bg-brand/20 text-brand rounded-full text-sm">Threshold development</span>
              <span className="px-3 py-1 bg-brand/20 text-brand rounded-full text-sm">Race preparation</span>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface/50 rounded-lg p-4 border border-border-weak text-left max-w-2xl mx-auto">
          <p className="text-sm text-text-secondary">
            <strong>What's next:</strong> Click "Let's Do This" to view your training calendar and start your first
            workout. Your plan will automatically adapt as you log activities and provide feedback.
          </p>
        </div>

        <Button onClick={completePlan} size="lg" className="px-8 py-3 text-lg">
          Let's Do This! 🚀
        </Button>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="space-y-8 text-center">
        <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto animate-pulse">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Generating Your Training Plan</h2>
          <p className="text-text-secondary">Creating your personalized training plan based on your preferences...</p>
        </div>

        <div className="bg-bg-surface rounded-lg p-6 border border-border-weak text-left max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-status-success rounded-full"></div>
              <span className="text-sm">Analyzing your goals and timeline</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-status-success rounded-full"></div>
              <span className="text-sm">Calculating training zones and intensities</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
              <span className="text-sm">Building your personalized schedule</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-border rounded-full"></div>
              <span className="text-sm text-text-secondary">Optimizing for peak performance</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Plan Preview</h2>
        <p className="text-text-secondary">Here's how your first week looks</p>
      </div>

      <div className="bg-bg-surface rounded-lg p-6 border border-border-weak">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Week 1 Overview</h3>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
            const isRestDay = data.preferences.restDay === day.toLowerCase()
            return (
              <div
                key={day}
                className={cn(
                  "p-3 rounded text-center text-sm",
                  isRestDay ? "bg-status-caution/20 text-status-caution" : "bg-brand/20 text-brand",
                )}
              >
                <div className="font-medium">{day}</div>
                <div className="text-xs mt-1">{isRestDay ? "Rest" : "Training"}</div>
              </div>
            )
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded border border-blue-500/20">
            <Waves className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-medium text-text-primary">Swimming</div>
              <div className="text-sm text-text-secondary">2 sessions • Easy pace focus</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded border border-orange-500/20">
            <Bike className="w-5 h-5 text-orange-500" />
            <div>
              <div className="font-medium text-text-primary">Cycling</div>
              <div className="text-sm text-text-secondary">2 sessions • Base building</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded border border-green-500/20">
            <Footprints className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-medium text-text-primary">Running</div>
              <div className="text-sm text-text-secondary">2 sessions • Aerobic development</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={generatePlan}
          size="lg"
          className="px-8 py-3 text-lg"
          disabled={isSaving || isGenerating}
        >
          {isSaving || isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {isSaving ? 'Saving...' : 'Generating...'}
            </>
          ) : (
            'Generate My Training Plan'
          )}
        </Button>
        <p className="text-sm text-text-secondary mt-2">This will create your personalized 16-week training plan</p>
      </div>
    </div>
  )
}
