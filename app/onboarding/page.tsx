"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  Zap,
  Target,
  TrendingUp,
  Heart,
  Settings,
  Info,
  User,
  Trophy,
  AlertCircle,
  Calendar,
  Waves,
  Bike,
  Footprints,
  Clock,
  CalendarDays,
  X,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ReadinessInfoCard } from "@/components/readiness-info-card"
import {
  saveAthleteProfile,
  getAthleteProfile,
  saveAthletePreferences,
  getAthletePreferences,
  saveRaces,
  getRaces,
  saveConstraints,
  getErrorMessage,
  isAuthError,
  type ApiError,
} from "@/lib/api/onboarding"

const ONBOARDING_STEPS = [
  { id: "profile", title: "Basic Profile", description: "Tell us about yourself" },
  { id: "goals", title: "Goals & Races", description: "Set your training targets" },
  { id: "history", title: "Training History", description: "Your experience level" },
  { id: "preferences", title: "Training Preferences", description: "Training schedule setup" },
  { id: "metrics", title: "Primary Metrics", description: "Choose your key metrics" },
  { id: "readiness", title: "Understanding Readiness", description: "Learn about daily capacity" },
  { id: "review", title: "Review & Confirm", description: "Check your settings" },
  { id: "generate", title: "Generate Plan", description: "Create your training plan" },
]

interface OnboardingData {
  profile: {
    firstName: string
    lastName: string
    age: string
    sexAtBirth: string
    height: string
    weight: string
    units: string
    dateOfBirth: string
    timeZone: string
  }
  goals: {
    isMaintenanceMode: boolean
    sport: string
    racePriority: string
    raceType: string
    raceDate: string
    raceLocation: string
    hasFinishTimeGoal: boolean
    swimTime: string
    bikeTime: string
    runTime: string
    focusArea: string
    // Most recent race fields
    hasMostRecentRace: boolean
    recentRaceSport: string
    recentRaceDistance: string
    recentRaceResult: string
    recentRaceSwimTime: string
    recentRaceBikeTime: string
    recentRaceRunTime: string
  }
  savedRaces: Array<{
    id: string
    type: "upcoming" | "past"
    sport: string
    racePriority?: string
    raceType?: string
    raceDate?: string
    raceLocation?: string
    hasFinishTimeGoal?: boolean
    swimTime?: string
    bikeTime?: string
    runTime?: string
    distance?: string
    result?: string
    swimResult?: string
    bikeResult?: string
    runResult?: string
  }>
  history: {
    weeklyHours: string
    experienceLevel: string
    currentVolume: string
    periodization: string
    restDay: string[]
    startDate: string
  }
  preferences: {
    trainingTypes: string[]
    sessionTypes: string[]
    intensityPreference: string
    timeConstraints: string[]
    restDay: string
    weeklyHours: string
    periodization: string
    startDate: string
  }
  metrics: {
    swimMetric: string
    bikeMetric: string
    runMetric: string
  }
  thresholds: {
    css: string
    ftp: string
    lthr: string
    ltp: string
    estimateForMe: boolean
    skipForNow: boolean
  }
  constraints: {
    hasConstraints: boolean
    constraintType: string
    startDate: string
    endDate: string
    description: string
  }
}

interface StepProps {
  updateData: (data: Partial<OnboardingData>) => void
  setIsValid: (valid: boolean) => void
  hasAttemptedNext: boolean
  isGeneratingPlan: boolean
  handleGeneratePlan: () => void
  setData: (data: OnboardingData) => void
  data: OnboardingData
}

interface WelcomeStepProps {
  startOnboarding: (path: "fast" | "advanced") => void
}

interface ProfileStepProps extends StepProps {
  profile: OnboardingData["profile"]
}

interface GoalsStepProps extends StepProps {
  goals: OnboardingData["goals"]
}

interface TrainingHistoryStepProps extends StepProps {
  history: OnboardingData["history"]
}

interface TrainingPreferencesStepProps extends StepProps {
  preferences: OnboardingData["preferences"]
}

interface PrimaryMetricsStepProps extends StepProps {
  metrics: OnboardingData["metrics"]
  thresholds: OnboardingData["thresholds"]
  updateData: (data: Partial<OnboardingData>) => void
  setIsValid: (valid: boolean) => void
  hasAttemptedNext: boolean
}

interface ReviewStepProps {
  data: OnboardingData
}

interface PlanSummaryStepProps {
  data: OnboardingData
  completeSetup: () => void
}

interface GeneratePlanStepProps {
  isGeneratingPlan: boolean
  handleGeneratePlan: () => void
}

interface ReadinessStepProps {
  onNext: () => void
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isStepValid, setIsStepValid] = useState(true)
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    profile: {
      firstName: "",
      lastName: "",
      age: "",
      sexAtBirth: "",
      height: "",
      weight: "",
      units: "",
      dateOfBirth: "",
      timeZone: "",
    },
    goals: {
      isMaintenanceMode: false,
      sport: "",
      racePriority: "",
      raceType: "",
      raceDate: "",
      raceLocation: "",
      hasFinishTimeGoal: false,
      swimTime: "",
      bikeTime: "",
      runTime: "",
      focusArea: "",
      hasMostRecentRace: false,
      recentRaceSport: "",
      recentRaceDistance: "",
      recentRaceResult: "",
      recentRaceSwimTime: "",
      recentRaceBikeTime: "",
      recentRaceRunTime: "",
    },
    savedRaces: [],
    history: {
      weeklyHours: "",
      experienceLevel: "",
      currentVolume: "",
      periodization: "",
      restDay: [],
      startDate: "",
    },
    preferences: {
      trainingTypes: [],
      sessionTypes: [],
      intensityPreference: "",
      timeConstraints: [],
      restDay: "",
      weeklyHours: "",
      periodization: "",
      startDate: "",
    },
    metrics: {
      swimMetric: "",
      bikeMetric: "",
      runMetric: "",
    },
    thresholds: {
      css: "",
      ftp: "",
      lthr: "",
      ltp: "",
      estimateForMe: false,
      skipForNow: false,
    },
    constraints: {
      hasConstraints: false,
      constraintType: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  })
  const [onboardingStarted, setOnboardingStarted] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [isPlanGenerated, setIsPlanGenerated] = useState(false)
  const [editingRace, setEditingRace] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})

  // API Integration State
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const updateDataCallback = useCallback((stepData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...stepData }))
  }, [])

  const setIsValidCallback = useCallback((valid: boolean) => {
    setIsStepValid(valid)
  }, [])

  const startOnboarding = useCallback(
    (path: "fast" | "advanced") => {
      console.log("[v0] Starting onboarding with path:", path)
      setOnboardingStarted(true)
      if (path === "fast") {
        console.log("[v0] Fast start selected - redirecting to Quick Start wizard")
        router.push("/onboarding/quick-start")
      } else {
        setCurrentStep(1) // Go to profile step for advanced setup
      }
    },
    [router],
  )

  const handleNext = () => {
    setHasAttemptedNext(true)

    if (currentStep < ONBOARDING_STEPS.length) {
      // Special validation for metrics step (step 5)
      if (currentStep === 5) {
        // Validate thresholds for metrics step
        const thresholdErrors: Record<string, string> = {}
        const showThresholds = data.thresholds.estimateForMe
        
        if (showThresholds) {
          if (data.metrics.swimMetric === "pace" && !data.thresholds.css) thresholdErrors.css = "Critical Swim Speed is required"
          if (data.metrics.bikeMetric === "power" && !data.thresholds.ftp) thresholdErrors.ftp = "Functional Threshold Power is required"
          if (
            (data.metrics.swimMetric === "hr" || data.metrics.bikeMetric === "hr" || data.metrics.runMetric === "hr") &&
            !data.thresholds.lthr
          ) {
            thresholdErrors.lthr = "Lactate Threshold Heart Rate is required"
          }
          if (data.metrics.runMetric === "pace" && !data.thresholds.ltp) thresholdErrors.ltp = "Lactate Threshold Pace is required"
        }
        
        const hasThresholdErrors = Object.keys(thresholdErrors).length > 0
        const isMetricsStepValid = isStepValid && !hasThresholdErrors
        
        if (isMetricsStepValid) {
          setCurrentStep(currentStep + 1)
          setIsStepValid(false) // Reset validation for next step
          setHasAttemptedNext(false)
        }
      } else if (isStepValid || currentStep === 0) {
        // Welcome step doesn't need validation
        setCurrentStep(currentStep + 1)
        setIsStepValid(false) // Reset validation for next step
        setHasAttemptedNext(false)
      }
    } else {
      // This is the generate plan step
      handleGeneratePlan()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setIsStepValid(true) // Previous steps are assumed valid
      setHasAttemptedNext(false)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex + 1)
    setIsStepValid(true) // Allow navigation without validation
    setHasAttemptedNext(false) // Reset attempt flag for new step
  }

  const renderStep = () => {
    const stepProps = {
      updateData: updateDataCallback,
      setIsValid: setIsValidCallback,
      hasAttemptedNext,
      isGeneratingPlan,
      handleGeneratePlan,
      setData,
      data,
    }

    switch (currentStep) {
      case 0:
        return <WelcomeStep startOnboarding={startOnboarding} />
      case 1:
        return <ProfileStep {...stepProps} profile={data.profile} />
      case 2:
        return <GoalsStep {...stepProps} goals={data.goals} />
      case 3:
        return <TrainingHistoryStep {...stepProps} history={data.history} />
      case 4:
        return <TrainingPreferencesStep {...stepProps} preferences={data.preferences} />
      case 5:
        return (
          <PrimaryMetricsStep
            metrics={data.metrics}
            thresholds={data.thresholds}
            updateData={updateDataCallback}
            setIsValid={setIsValidCallback}
            hasAttemptedNext={hasAttemptedNext}
          />
        )
      case 6:
        return <ReadinessStep onNext={() => setIsStepValid(true)} />
      case 7:
        return <ReviewStep data={data} />
      case 8:
        return isPlanGenerated ? (
          <PlanSummaryStep data={data} completeSetup={completeSetup} />
        ) : (
          <GeneratePlanStep isGeneratingPlan={isGeneratingPlan} handleGeneratePlan={handleGeneratePlan} />
        )
      default:
        return null
    }
  }

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true)
    console.log("[v0] Starting plan generation with data:", data)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log("[v0] Plan generation completed, showing summary")
    setIsGeneratingPlan(false)
    setIsPlanGenerated(true)
  }

  const completeSetup = () => {
    console.log("[v0] Completing setup, redirecting to cockpit")
    router.push("/")
  }

  const editRace = (raceId: string) => {
    const race = data.savedRaces.find((r) => r.id === raceId)
    if (!race) return

    setEditingRace(raceId)
    setEditFormData(race)
    setEditModalOpen(true)
  }

  const updateRace = () => {
    if (!editingRace) return

    setData((prev) => ({
      ...prev,
      savedRaces: prev.savedRaces.map((race) => (race.id === editingRace ? { ...editFormData } : race)),
    }))

    setEditModalOpen(false)
    setEditingRace(null)
    setEditFormData({})
  }

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  const getRaceTypesBySport = (sport: string) => {
    return [
      { value: "Sprint", label: "Sprint" },
      { value: "Olympic", label: "Olympic" },
      { value: "70.3", label: "Ironman 70.3" },
      { value: "140.6", label: "Ironman" },
      { value: "T100", label: "T100" },
    ]
  }

  const getDistancesBySport = (sport: string) => {
    return [
      { value: "Sprint", label: "Sprint" },
      { value: "Olympic", label: "Olympic" },
      { value: "70.3", label: "Ironman 70.3" },
      { value: "140.6", label: "Ironman" },
      { value: "T100", label: "T100" },
    ]
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Header */}
      <div className="border-b border-border-weak bg-bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Advanced Setup</h1>
              <p className="text-text-secondary">Complete your detailed training profile</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/onboarding/quick-start")}
              className="text-brand hover:text-brand/80"
            >
              Switch to Quick Start →
            </Button>
          </div>
        </div>
      </div>

      {onboardingStarted ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Steps */}
            <div className="col-span-3">
              <div className="space-y-4">
                {ONBOARDING_STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg transition-all cursor-pointer",
                      index + 1 === currentStep
                        ? "bg-brand/10 border-l-4 border-brand"
                        : index + 1 < currentStep
                          ? "bg-bg-surface border-l-4 border-status-success"
                          : "bg-bg-surface border-l-4 border-transparent hover:bg-bg-raised",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                        index + 1 === currentStep
                          ? "bg-brand text-white"
                          : index + 1 < currentStep
                            ? "bg-status-success text-white"
                            : "bg-border text-text-secondary",
                      )}
                    >
                      {index + 1 < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <div>
                      <div
                        className={cn(
                          "font-medium",
                          index + 1 === currentStep
                            ? "text-brand"
                            : index + 1 < currentStep
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
                {currentStep > 0 && currentStep < ONBOARDING_STEPS.length && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-border-weak">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep <= 1}
                      className="px-6 bg-transparent"
                    >
                      Previous
                    </Button>
                    <Button onClick={handleNext} className="px-6">
                      Next Step
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-16">{renderStep()}</div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">
                  Edit {editFormData.type === "upcoming" ? "Upcoming" : "Past"} Race
                </h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Sport Selection */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">Sport</label>
                  <div className="flex gap-3">
                    {[
                      { value: "triathlon", label: "Triathlon", icons: [Waves, Bike, Footprints] },
                      { value: "swim", label: "Swimming", icons: [Waves] },
                      { value: "running", label: "Running", icons: [Footprints] },
                    ].map((sport) => (
                      <button
                        key={sport.value}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, sport: sport.value })}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200",
                          editFormData.sport === sport.value
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-border hover:border-border-strong text-text-secondary hover:text-text-primary",
                        )}
                      >
                        <div className="flex items-center gap-1">
                          {sport.icons.map((Icon, index) => (
                            <Icon key={index} className="w-4 h-4" />
                          ))}
                        </div>
                        <span className="font-medium">{sport.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {editFormData.type === "upcoming" ? (
                  <>
                    {/* Race Priority */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3">Race Priority</label>
                      <div className="flex gap-3">
                        {[
                          { value: "A", label: "A - Most Important", color: "red" },
                          { value: "B", label: "B - Important", color: "yellow" },
                          { value: "C", label: "C - Fun/Training", color: "green" },
                        ].map((priority) => (
                          <button
                            key={priority.value}
                            type="button"
                            onClick={() => setEditFormData({ ...editFormData, racePriority: priority.value })}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200",
                              editFormData.racePriority === priority.value
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-border hover:border-border-strong text-text-secondary hover:text-text-primary",
                            )}
                          >
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold",
                                priority.color === "red"
                                  ? "bg-red-500"
                                  : priority.color === "yellow"
                                    ? "bg-yellow-500"
                                    : "bg-green-500",
                              )}
                            >
                              {priority.value}
                            </div>
                            <span className="font-medium">{priority.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Race Type */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3">Race Type</label>
                      <div className="flex flex-wrap gap-3">
                        {editFormData.sport === "triathlon" &&
                          ["Sprint", "Olympic", "Ironman 70.3", "Ironman", "T100"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setEditFormData({ ...editFormData, raceType: type })}
                              className={cn(
                                "px-4 py-2 rounded-xl border-2 transition-all duration-200",
                                editFormData.raceType === type
                                  ? "border-brand bg-brand/10 text-brand"
                                  : "border-border hover:border-border-strong text-text-secondary hover:text-text-primary",
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        {editFormData.sport === "cycling" &&
                          ["5K", "10K", "Half Marathon", "Marathon", "Ultra"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setEditFormData({ ...editFormData, raceType: type })}
                              className={cn(
                                "px-4 py-2 rounded-xl border-2 transition-all duration-200",
                                editFormData.raceType === type
                                  ? "border-brand bg-brand/10 text-brand"
                                  : "border-border hover:border-border-strong text-text-secondary hover:text-text-primary",
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        {editFormData.sport === "running" &&
                          ["Criterium", "Road Race", "Time Trial", "Gran Fondo", "Stage Race"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setEditFormData({ ...editFormData, raceType: type })}
                              className={cn(
                                "px-4 py-2 rounded-xl border-2 transition-all duration-200",
                                editFormData.raceType === type
                                  ? "border-brand bg-brand/10 text-brand"
                                  : "border-border hover:border-border-strong text-text-secondary hover:text-text-primary",
                              )}
                            >
                              {type}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3">Triathlon Distance</label>
                      <div className="flex flex-wrap gap-3">
                        {["Sprint", "Olympic", "Ironman 70.3", "Ironman", "T100"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setEditFormData({ ...editFormData, raceType: type })}
                            className={cn(
                              "px-4 py-2 rounded-xl border-2 transition-all duration-200",
                              editFormData.raceType === type
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-border hover:border-border-strong text-text-secondary hover:text-text-primary",
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Race Date - Future dates only */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Race Date</label>
                        <input
                          type="date"
                          min={getTodayDate()}
                          value={editFormData.raceDate || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, raceDate: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                        <input
                          type="text"
                          placeholder="City, Country"
                          value={editFormData.raceLocation || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, raceLocation: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                    </div>

                    {/* Finish Time Goal */}
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setEditFormData({ ...editFormData, hasFinishTimeGoal: !editFormData.hasFinishTimeGoal })
                        }
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200",
                          editFormData.hasFinishTimeGoal
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-border hover:border-border-strong text-text-secondary hover:text-text-primary",
                        )}
                      >
                        {editFormData.hasFinishTimeGoal && <Check className="w-4 h-4" />}
                        <span>I have a finish time goal</span>
                      </button>
                    </div>

                    {/* Time Goals */}
                    {editFormData.hasFinishTimeGoal && editFormData.sport === "triathlon" && (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Swim Time</label>
                          <input
                            type="text"
                            placeholder="00:30:00"
                            value={editFormData.swimTime || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, swimTime: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Bike Time</label>
                          <input
                            type="text"
                            placeholder="02:30:00"
                            value={editFormData.bikeTime || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, bikeTime: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Run Time</label>
                          <input
                            type="text"
                            placeholder="01:45:00"
                            value={editFormData.runTime || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, runTime: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Past Race Fields */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3">Distance</label>
                      <div className="flex flex-wrap gap-3">
                        {editFormData.sport === "triathlon" &&
                          ["Sprint", "Olympic", "Ironman 70.3", "Ironman", "T100"].map((distance) => (
                            <button
                              key={distance}
                              type="button"
                              onClick={() => setEditFormData({ ...editFormData, distance })}
                              className={cn(
                                "px-4 py-2 rounded-xl border-2 transition-all duration-200",
                                editFormData.distance === distance
                                  ? "border-brand bg-brand/10 text-brand"
                                  : "border-border hover:border-border-strong text-text-secondary hover:text-text-primary",
                              )}
                            >
                              {distance}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Race Date - Past dates only */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Race Date</label>
                      <input
                        type="date"
                        max={getTodayDate()}
                        value={editFormData.raceDate || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, raceDate: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>

                    {/* Results */}
                    {editFormData.sport === "triathlon" ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Swim Time</label>
                          <input
                            type="text"
                            placeholder="00:30:00"
                            value={editFormData.swimResult || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, swimResult: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Bike Time</label>
                          <input
                            type="text"
                            placeholder="02:30:00"
                            value={editFormData.bikeResult || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, bikeResult: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Run Time</label>
                          <input
                            type="text"
                            placeholder="01:45:00"
                            value={editFormData.runResult || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, runResult: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Total Time</label>
                        <input
                          type="text"
                          placeholder="02:30:00"
                          value={editFormData.result || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, result: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={updateRace}
                  className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
                >
                  Update Race
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function WelcomeStep({ startOnboarding }: WelcomeStepProps) {
    const [selectedOption, setSelectedOption] = useState<"fast" | "advanced" | null>(null)

    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-4">Let's personalize your training</h2>
          <p className="text-lg text-text-secondary max-w-lg mx-auto">
            Choose how you'd like to set up your training plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div
            className={`relative bg-bg-surface border-2 rounded-xl p-8 cursor-pointer transition-all duration-200 ${
              selectedOption === "fast"
                ? "border-brand bg-brand/5 shadow-lg"
                : "border-border-weak hover:border-border-strong"
            }`}
            onClick={() => setSelectedOption("fast")}
          >
            <div className="absolute -top-3 left-6"></div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">{"Fast Start"}</h3>
              <p className="text-text-secondary mb-6">You can refine later.</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  startOnboarding("fast")
                }}
                className="w-full py-3 px-6 rounded-lg font-medium bg-brand text-white hover:bg-brand-hover transition-colors"
              >
                Start Fast
              </button>
            </div>
          </div>

          <div
            className={`bg-bg-surface border-2 rounded-xl p-8 cursor-pointer transition-all duration-200 ${
              selectedOption === "advanced"
                ? "border-brand bg-brand/5 shadow-lg"
                : "border-border-weak hover:border-border-strong"
            }`}
            onClick={() => setSelectedOption("advanced")}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-text-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Advanced Setup</h3>
              <p className="text-text-secondary mb-6">Complete every detail now.</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  startOnboarding("advanced")
                }}
                className="w-full py-3 px-6 rounded-lg font-medium bg-brand text-white hover:bg-brand-hover transition-colors"
              >
                Go Advanced
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-bg-surface border border-border-weak rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-sport-swim/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-5 h-5 text-sport-swim" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2 text-sm">Smart Planning</h3>
            <p className="text-xs text-text-secondary">
              AI-powered training plans that adapt to your progress and constraints
            </p>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-sport-bike/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-5 h-5 text-sport-bike" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2 text-sm">Performance Tracking</h3>
            <p className="text-xs text-text-secondary">
              Monitor your progress with detailed analytics and zone-based training
            </p>
          </div>

          <div className="bg-bg-surface border border-border-weak rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-sport-run/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-sport-run" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2 text-sm">Adaptive Training</h3>
            <p className="text-xs text-text-secondary">
              Plans that adjust based on your readiness, recovery, and life constraints
            </p>
          </div>
        </div>
      </div>
    )
  }

  function ProfileStep({ profile, updateData, setIsValid, hasAttemptedNext }: ProfileStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateProfile = useCallback(() => {
      const newErrors: Record<string, string> = {}

      if (!profile.firstName.trim()) {
        newErrors.firstName = "First name is required"
      }

      if (!profile.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required"
      }

      if (!profile.sexAtBirth) {
        newErrors.sexAtBirth = "Sex at birth is required"
      }

      const heightValue = Number.parseFloat(profile.height)
      const weightValue = Number.parseFloat(profile.weight)

      if (profile.units === "Metric") {
        if (!profile.height || heightValue < 100 || heightValue > 250) {
          newErrors.height = "Height must be between 100-250 cm"
        }
        if (!profile.weight || weightValue < 30 || weightValue > 200) {
          newErrors.weight = "Weight must be between 30-200 kg"
        }
      } else {
        if (!profile.height || heightValue < 3 || heightValue > 8) {
          newErrors.height = "Height must be between 3-8 feet"
        }
        if (!profile.weight || weightValue < 66 || weightValue > 440) {
          newErrors.weight = "Weight must be between 66-440 lbs"
        }
      }

      if (!profile.timeZone) {
        newErrors.timezone = "Timezone is required"
      }

      setErrors(newErrors)
      const isValid = Object.keys(newErrors).length === 0
      setIsValid(isValid)

      return isValid
    }, [
      profile.firstName,
      profile.dateOfBirth,
      profile.sexAtBirth,
      profile.height,
      profile.weight,
      profile.units,
      profile.timeZone,
      setIsValid,
    ])

    useEffect(() => {
      validateProfile()
    }, [validateProfile])

    const handleChange = (field: keyof typeof profile, value: string) => {
      updateData({ profile: { ...profile, [field]: value } })
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-text-primary">Basic Profile</h2>
          <div className="group relative">
            <Info className="h-4 w-4 text-text-secondary cursor-help" />
            <div className="absolute left-0 top-6 w-64 p-3 bg-surface border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <p className="text-xs text-text-secondary">
                Your personal information is used to customize your training plan and is kept private and secure.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName" className="text-text-primary">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              value={profile.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Enter your first name"
              className={cn(
                "mt-2",
                hasAttemptedNext && errors.firstName && "border-status-danger focus:border-status-danger",
              )}
            />
            {hasAttemptedNext && errors.firstName && (
              <p className="text-sm text-status-danger mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName" className="text-text-primary">
              Last Name <span className="text-text-secondary text-sm">(optional)</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              value={profile.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Enter your last name"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="dateOfBirth" className="text-text-primary">
              Date of Birth
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              className={cn(
                "mt-2",
                hasAttemptedNext && errors.dateOfBirth && "border-status-danger focus:border-status-danger",
              )}
            />
            {hasAttemptedNext && errors.dateOfBirth && (
              <p className="text-sm text-status-danger mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <Label className="text-text-primary flex items-center gap-2">
              Sex at Birth
              <div className="group relative">
                <Info className="w-4 h-4 text-text-secondary cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Used for HR defaults and training zone calculations
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </Label>
            <div className="mt-2 flex gap-2">
              {["Female", "Male"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleChange("sexAtBirth", option)}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium hover:scale-[1.02] shadow-sm",
                    profile.sexAtBirth === option
                      ? "border-brand bg-transparent text-brand shadow-lg"
                      : "border-border bg-transparent text-text-primary hover:border-brand/50",
                    hasAttemptedNext && errors.sexAtBirth && profile.sexAtBirth !== option && "border-status-danger",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            {hasAttemptedNext && errors.sexAtBirth && (
              <p className="text-sm text-status-danger mt-1">{errors.sexAtBirth}</p>
            )}
          </div>

          <div>
            <Label className="text-text-primary flex items-center gap-2">
              Units
              <div className="group relative">
                <Info className="w-4 h-4 text-text-secondary cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Determines measurement units throughout the app
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </Label>
            <div className="mt-2 flex gap-2">
              {[
                { value: "Metric", label: "Metric" },
                { value: "Imperial", label: "Imperial" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange("units", option.value)}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium hover:scale-[1.02] shadow-sm",
                    profile.units === option.value
                      ? "border-brand bg-transparent text-brand shadow-lg"
                      : "border-border bg-transparent text-text-primary hover:border-brand/50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="height" className="text-text-primary">
              Height ({profile.units === "Metric" ? "cm" : "ft"})
            </Label>
            <Input
              id="height"
              type="number"
              value={profile.height}
              onChange={(e) => handleChange("height", e.target.value)}
              placeholder={profile.units === "Metric" ? "100–250 cm" : "3–8 ft"}
              className={cn(
                "mt-2",
                hasAttemptedNext && errors.height && "border-status-danger focus:border-status-danger",
              )}
            />
            {hasAttemptedNext && errors.height && <p className="text-sm text-status-danger mt-1">{errors.height}</p>}
          </div>

          <div>
            <Label htmlFor="weight" className="text-text-primary">
              Weight ({profile.units === "Metric" ? "kg" : "lbs"})
            </Label>
            <Input
              id="weight"
              type="number"
              value={profile.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              placeholder={profile.units === "Metric" ? "30–200 kg" : "66–440 lbs"}
              className={cn(
                "mt-2",
                hasAttemptedNext && errors.weight && "border-status-danger focus:border-status-danger",
              )}
            />
            {hasAttemptedNext && errors.weight && <p className="text-sm text-status-danger mt-1">{errors.weight}</p>}
          </div>

          <div className="col-span-2">
            <Label htmlFor="timezone" className="text-text-primary">
              Time Zone
            </Label>
            <Input
              id="timezone"
              type="text"
              value={profile.timeZone}
              onChange={(e) => handleChange("timeZone", e.target.value)}
              placeholder="Auto-detected timezone"
              className={cn(
                "mt-2",
                hasAttemptedNext && errors.timezone && "border-status-danger focus:border-status-danger",
              )}
            />
            {hasAttemptedNext && errors.timezone && (
              <p className="text-sm text-status-danger mt-1">{errors.timezone}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  function GoalsStep({ updateData, setIsValid, hasAttemptedNext, goals }: GoalsStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [warnings, setWarnings] = useState<Record<string, string>>({})

    const getTriathlonDistances = () => {
      return [
        { value: "Sprint", label: "Sprint" },
        { value: "Olympic", label: "Olympic" },
        { value: "70.3", label: "Ironman 70.3" },
        { value: "140.6", label: "Ironman" },
        { value: "T100", label: "T100" },
      ]
    }

    const validateGoals = useCallback(() => {
      const newErrors: Record<string, string> = {}
      const newWarnings: Record<string, string> = {}

      if (!goals.isMaintenanceMode) {
        if (!goals.raceType) {
          newErrors.raceType = "Please select a triathlon distance"
        }

        if (!goals.racePriority) {
          newErrors.racePriority = "Please select race priority"
        }

        if (!goals.raceDate) {
          newErrors.raceDate = "Race date is required"
        } else {
          const raceDate = new Date(goals.raceDate)
          const today = new Date()
          const sixWeeksFromNow = new Date(today.getTime() + 6 * 7 * 24 * 60 * 60 * 1000)

          if (raceDate <= today) {
            newErrors.raceDate = "Race date must be in the future"
          } else if (raceDate < sixWeeksFromNow) {
            newWarnings.raceDate = "Less than 6 weeks to prepare - consider adjusting your training plan"
          }
        }

        if (!goals.raceLocation.trim()) {
          newErrors.raceLocation = "Race location is required"
        }
      } else {
        if (!goals.focusArea) {
          newErrors.focusArea = "Please select a focus area"
        }
      }

      setErrors(newErrors)
      setWarnings(newWarnings)
      const isValid = Object.keys(newErrors).length === 0
      setIsValid(isValid)

      return isValid
    }, [
      goals.isMaintenanceMode,
      goals.raceType,
      goals.racePriority,
      goals.raceDate,
      goals.raceLocation,
      goals.focusArea,
      setIsValid,
    ])

    useEffect(() => {
      validateGoals()
    }, [validateGoals])

    const handleChange = (field: keyof typeof goals, value: any) => {
      updateData({ goals: { ...goals, [field]: value } })
    }

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
                    Focus on Your Primary Race
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    You can add additional races and adjust your training plan later in the races section.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  function TrainingHistoryStep({
    updateData,
    setIsValid,
    hasAttemptedNext,
    history,
    isGeneratingPlan,
    handleGeneratePlan,
    setData,
    data,
  }: TrainingHistoryStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateHistory = useCallback(() => {
      const newErrors: Record<string, string> = {}

      if (!history.weeklyHours) {
        newErrors.weeklyHours = "Please select your average training hours"
      }

      if (!history.experienceLevel) {
        newErrors.experienceLevel = "Please select your experience level"
      }

      setErrors(newErrors)
      const isValid = Object.keys(newErrors).length === 0
      setIsValid(isValid)

      return isValid
    }, [history.weeklyHours, history.experienceLevel, setIsValid])

    useEffect(() => {
      validateHistory()
    }, [validateHistory])

    const handleChange = (field: keyof typeof history, value: any) => {
      updateData({ history: { ...history, [field]: value } })
    }

    const weeklyHoursOptions = [
      { value: "0-3", label: "0–3" },
      { value: "3-6", label: "3–6" },
      { value: "6-10", label: "6–10" },
      { value: "10-14", label: "10–14" },
      { value: "14+", label: "14+" },
    ]

    const experienceLevels = [
      {
        value: "beginner",
        title: "Beginner",
        description: "New to structured training or returning after a long break",
        icon: User,
      },
      {
        value: "intermediate",
        title: "Intermediate",
        description: "1-3 years of consistent training with some race experience",
        icon: TrendingUp,
      },
      {
        value: "competitive",
        title: "Competitive",
        description: "3+ years of training with regular racing and performance goals",
        icon: Trophy,
      },
    ]

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Training History</h2>
          <p className="text-text-secondary">Help us understand your training background</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-text-primary font-medium flex items-center gap-2">
              Average training hours (last 6 months)
              <div className="group relative">
                <Info className="w-4 h-4 text-text-secondary cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Used to set appropriate training load progression
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </Label>
            <p className="text-sm text-text-secondary mt-1">
              Select the option that best describes your recent training volume
            </p>
          </div>
          <div className="flex gap-2">
            {weeklyHoursOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange("weeklyHours", option.value)}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-center transition-all font-medium border-2 hover:scale-[1.02] shadow-sm",
                  history.weeklyHours === option.value
                    ? "border-brand bg-transparent text-brand shadow-lg"
                    : "border-border bg-transparent text-text-secondary hover:border-brand/50",
                  hasAttemptedNext && errors.weeklyHours && !history.weeklyHours && "border-status-danger",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {hasAttemptedNext && errors.weeklyHours && <p className="text-sm text-status-danger">{errors.weeklyHours}</p>}
          <p className="text-xs text-text-secondary">
            Impact: Determines starting training load and weekly progression rate
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-text-primary font-medium flex items-center gap-2">
              Experience level
              <div className="group relative">
                <Info className="w-4 h-4 text-text-secondary cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Influences workout complexity and training methodology
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </Label>
            <p className="text-sm text-text-secondary mt-1">
              Choose the level that best matches your training background
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {experienceLevels.map((level) => {
              const IconComponent = level.icon
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleChange("experienceLevel", level.value)}
                  className={cn(
                    "p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] shadow-sm",
                    history.experienceLevel === level.value
                      ? "border-brand bg-transparent text-text-primary shadow-lg"
                      : "border-border bg-transparent text-text-secondary hover:border-brand/50",
                    hasAttemptedNext && errors.experienceLevel && !history.experienceLevel && "border-status-danger",
                  )}
                >
                  <IconComponent className="w-8 h-8 mb-3 text-brand" />
                  <div className="font-semibold text-lg mb-2">{level.title}</div>
                  <p className="text-sm">{level.description}</p>
                </button>
              )
            })}
          </div>
          {hasAttemptedNext && errors.experienceLevel && (
            <p className="text-sm text-status-danger">{errors.experienceLevel}</p>
          )}
          <p className="text-xs text-text-secondary">
            Impact: Sets workout structure complexity and training methodology approach
          </p>
        </div>
      </div>
    )
  }

  function TrainingPreferencesStep({
    updateData,
    setIsValid,
    hasAttemptedNext,
    preferences,
  }: TrainingPreferencesStepProps) {
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
      validateStep()
    }, [validateStep])

    const handleChange = (field: keyof typeof preferences, value: any) => {
      updateData({ preferences: { ...preferences, [field]: value } })
    }

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
      { value: "3-5", label: "3–5h", subtitle: "3-4 sessions" },
      { value: "6-8", label: "6–8h", subtitle: "4-5 sessions" },
      { value: "9-12", label: "9–12h", subtitle: "5-6 sessions" },
      { value: "13-16", label: "13–16h", subtitle: "6-7 sessions" },
      { value: "17+", label: "17+h", subtitle: "7+ sessions" },
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
              <h3
                className="text-xl font-semibold mb-2 flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <Calendar className="w-6 h-6" style={{ color: "brand" }} />
                Rest Day Preference
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Choose your ideal recovery day, traditionally on Monday after long weekend training sessions, but choose
                based on your personal availability and schedule.{" "}
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
              <h3
                className="text-xl font-semibold mb-2 flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <Clock className="w-6 h-6" style={{ color: "brand" }} />
                Weekly Training Volume
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>How much time can you dedicate to training? </p>
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
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
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
              <h3
                className="text-xl font-semibold mb-2 flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: "brand" }} />
                Training Periodization
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>Choose your training cycle structure</p>
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
                    className={`relative p-8 rounded-xl text-left transition-all duration-200 border-2 ${
                      isSelected ? "shadow-lg" : hasError ? "" : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(var(--brand-rgb), 0.1)"
                        : hasError
                          ? "rgba(220, 38, 38, 0.1)"
                          : "var(--bg-surface)",
                      borderColor: isSelected ? "var(--brand)" : hasError ? "#DC2626" : "var(--border-weak)",
                    }}
                  >
                    <div>
                      <h4 className="font-bold text-xl mb-2" style={{ color: "var(--text-primary)" }}>
                        {option.title}
                      </h4>
                      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                        {option.description}
                      </p>
                      <div className="space-y-2">
                        {option.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--brand)" }} />
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>
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
              <h3
                className="text-xl font-semibold mb-2 flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <CalendarDays className="w-6 h-6" style={{ color: "brand" }} />
                Plan Start Date
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>When would you like to begin your training plan?</p>
            </div>
            <div className="max-w-md">
              <input
                type="date"
                value={preferences.startDate}
                min={today}
                onChange={(e) => {
                  updateData({ preferences: { ...preferences, startDate: e.target.value } })
                }}
                className="w-full p-4 rounded-xl text-center text-lg border-2 transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor:
                    hasAttemptedNext && errors.startDate
                      ? "rgba(220, 38, 38, 0.1)"
                      : preferences.startDate
                        ? "rgba(var(--brand-rgb), 0.1)"
                        : "var(--bg-surface)",
                  borderColor:
                    hasAttemptedNext && errors.startDate
                      ? "#DC2626"
                      : preferences.startDate
                        ? "var(--brand)"
                        : "var(--border-weak)",
                  color: "var(--text-primary)",
                }}
              />
              {hasAttemptedNext && errors.startDate && (
                <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "#DC2626" }}>
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

  function PrimaryMetricsStep({
    metrics,
    thresholds,
    updateData,
    setIsValid,
    hasAttemptedNext,
  }: PrimaryMetricsStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const showThresholds = thresholds.estimateForMe

    const validateStep = useCallback(() => {
      const newErrors: Record<string, string> = {}

      if (!metrics.swimMetric) newErrors.swimMetric = "Please select a swimming metric"
      if (!metrics.bikeMetric) newErrors.bikeMetric = "Please select a biking metric"
      if (!metrics.runMetric) newErrors.runMetric = "Please select a running metric"

      setErrors(newErrors)
      const isValid = Object.keys(newErrors).length === 0
      setIsValid(isValid)
      return isValid
    }, [
      metrics.swimMetric,
      metrics.bikeMetric,
      metrics.runMetric,
      setIsValid,
    ])

    useEffect(() => {
      validateStep()
    }, [validateStep])

    // Separate validation for threshold fields that doesn't cause re-renders during typing
    const validateThresholds = useCallback(() => {
      const newErrors: Record<string, string> = {}
      
      if (showThresholds) {
        if (metrics.swimMetric === "pace" && !thresholds.css) newErrors.css = "Critical Swim Speed is required"
        if (metrics.bikeMetric === "power" && !thresholds.ftp) newErrors.ftp = "Functional Threshold Power is required"
        if (
          (metrics.swimMetric === "hr" || metrics.bikeMetric === "hr" || metrics.runMetric === "hr") &&
          !thresholds.lthr
        ) {
          newErrors.lthr = "Lactate Threshold Heart Rate is required"
        }
        if (metrics.runMetric === "pace" && !thresholds.ltp) newErrors.ltp = "Lactate Threshold Pace is required"
      }
      
      return newErrors
    }, [showThresholds, metrics.swimMetric, metrics.bikeMetric, metrics.runMetric, thresholds.css, thresholds.ftp, thresholds.lthr, thresholds.ltp])

    const swimOptions = [
      { value: "pace", label: "Pace", icon: Clock, recommended: true },
      { value: "hr", label: "Heart Rate", icon: Heart, recommended: false },
    ]

    const bikeOptions = [
      { value: "power", label: "Power", icon: Zap, recommended: true },
      { value: "hr", label: "Heart Rate", icon: Heart, recommended: false },
    ]

    const runOptions = [
      { value: "power", label: "Power", icon: Zap, recommended: false },
      { value: "pace", label: "Pace", icon: Clock, recommended: true },
      { value: "hr", label: "Heart Rate", icon: Heart, recommended: false },
    ]

    const getRequirementMessage = (metric: string) => {
      if (metric === "hr") {
        return "HR monitor required to collect HR data."
      }
      if (metric === "power") {
        return "Power meter required to collect power data."
      }
      return ""
    }

    const hasHRSelected = metrics.swimMetric === "hr" || metrics.bikeMetric === "hr" || metrics.runMetric === "hr"
    const hasPowerSelected =
      metrics.swimMetric === "power" || metrics.bikeMetric === "power" || metrics.runMetric === "power"

    // Get threshold errors for display
    const getThresholdErrors = () => {
      const thresholdErrors: Record<string, string> = {}
      
      if (showThresholds) {
        if (metrics.swimMetric === "pace" && !thresholds.css) thresholdErrors.css = "Critical Swim Speed is required"
        if (metrics.bikeMetric === "power" && !thresholds.ftp) thresholdErrors.ftp = "Functional Threshold Power is required"
        if (
          (metrics.swimMetric === "hr" || metrics.bikeMetric === "hr" || metrics.runMetric === "hr") &&
          !thresholds.lthr
        ) {
          thresholdErrors.lthr = "Lactate Threshold Heart Rate is required"
        }
        if (metrics.runMetric === "pace" && !thresholds.ltp) thresholdErrors.ltp = "Lactate Threshold Pace is required"
      }
      
      return thresholdErrors
    }

    const thresholdErrors = getThresholdErrors()

    const renderThresholdField = (discipline: "swim" | "bike" | "run", selectedMetric: string) => {
      if (!showThresholds) return null

      if (discipline === "swim" && selectedMetric === "pace") {
        return (
          <div
            className="mt-4 p-4 rounded-lg"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-weak)" }}
          >
            <label
              className="text-sm font-medium flex items-center gap-2 mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              <Waves className="w-4 h-4" style={{ color: "#0EA5E9" }} />
              Critical Swim Speed (CSS)
            </label>
            <input
              type="text"
              placeholder="1:30/100m"
              value={thresholds.css || ""}
              onChange={(e) => updateData({ thresholds: { ...thresholds, css: e.target.value } })}
              className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: hasAttemptedNext && thresholdErrors.css ? "#DC2626" : "var(--border-weak)",
                color: "var(--text-primary)",
              }}
            />
            {hasAttemptedNext && thresholdErrors.css && (
              <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "#DC2626" }}>
                <AlertCircle className="w-4 h-4" />
                {thresholdErrors.css}
              </p>
            )}
          </div>
        )
      }

      if (discipline === "bike" && selectedMetric === "power") {
        return (
          <div
            className="mt-4 p-4 rounded-lg"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-weak)" }}
          >
            <label
              className="text-sm font-medium flex items-center gap-2 mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              <Zap className="w-4 h-4" style={{ color: "#F97316" }} />
              Functional Threshold Power (FTP)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="250"
                value={thresholds.ftp || ""}
                onChange={(e) => updateData({ thresholds: { ...thresholds, ftp: e.target.value } })}
                className="flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: hasAttemptedNext && thresholdErrors.ftp ? "#DC2626" : "var(--border-weak)",
                  color: "var(--text-primary)",
                }}
              />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                watts
              </span>
            </div>
            {hasAttemptedNext && thresholdErrors.ftp && (
              <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "#DC2626" }}>
                <AlertCircle className="w-4 h-4" />
                {thresholdErrors.ftp}
              </p>
            )}
          </div>
        )
      }

      if (discipline === "run" && selectedMetric === "pace") {
        return (
          <div
            className="mt-4 p-4 rounded-lg"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-weak)" }}
          >
            <label
              className="text-sm font-medium flex items-center gap-2 mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              <Footprints className="w-4 h-4" style={{ color: "#10B981" }} />
              Lactate Threshold Pace (LTP)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="4:00/km"
                value={thresholds.ltp || ""}
                onChange={(e) => updateData({ thresholds: { ...thresholds, ltp: e.target.value } })}
                className="flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: hasAttemptedNext && thresholdErrors.ltp ? "#DC2626" : "var(--border-weak)",
                  color: "var(--text-primary)",
                }}
              />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                per km
              </span>
            </div>
            {hasAttemptedNext && thresholdErrors.ltp && (
              <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "#DC2626" }}>
                <AlertCircle className="w-4 h-4" />
                {thresholdErrors.ltp}
              </p>
            )}
          </div>
        )
      }

      return null
    }

    return (
      <div className="max-w-6xl mx-auto px-6">
        <div className="space-y-12">
          <div className="text-left">
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Primary Metrics & Training Thresholds
            </h2>
            <p style={{ color: "var(--text-secondary)" }} className="text-lg mt-2">
              Choose your preferred training metrics and optionally set your training thresholds
            </p>
          </div>

          <div className="space-y-4">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-weak)" }}
            >
              <p style={{ color: "var(--text-secondary)" }} className="text-sm mb-4">
                <strong>Don't know your thresholds?</strong> No problem! If you're unsure of your current values, they
                will be established during the initial weeks of training through testing protocols.
              </p>
              <button
                onClick={() => updateData({ thresholds: { ...thresholds, estimateForMe: !thresholds.estimateForMe } })}
                className="flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200"
                style={{
                  backgroundColor: showThresholds ? "rgba(var(--brand-rgb), 0.1)" : "var(--bg-surface)",
                  borderColor: showThresholds ? "var(--brand)" : "var(--border-weak)",
                  color: showThresholds ? "var(--brand)" : "var(--text-primary)",
                }}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${showThresholds ? "border-current" : "border-gray-400"}`}
                >
                  {showThresholds && <Check className="w-3 h-3" />}
                </div>
                <span className="font-medium">I know my thresholds</span>
              </button>
            </div>
          </div>

          {/* Swimming Metrics */}
          <div className="space-y-6">
            <div className="text-left">
              <h3
                className="text-xl font-semibold mb-2 flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <Waves className="w-6 h-6" style={{ color: "#0EA5E9" }} />
                Swimming
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>Select your preferred swimming training metric</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
              {swimOptions.map((option) => {
                const isSelected = metrics.swimMetric === option.value
                const hasError = hasAttemptedNext && errors.swimMetric

                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateData({ metrics: { ...metrics, swimMetric: option.value } })
                    }}
                    className={`relative p-6 rounded-xl text-left transition-all duration-200 border-2 ${
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
                    <div className="font-bold text-lg mb-2">{option.label}</div>
                  </button>
                )
              })}
            </div>
            {hasAttemptedNext && errors.swimMetric && (
              <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "#DC2626" }}>
                <AlertCircle className="w-4 h-4" />
                {errors.swimMetric}
              </p>
            )}
            {getRequirementMessage(metrics.swimMetric) && (
              <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "var(--text-secondary)" }}>
                <Info className="w-4 h-4" />
                {getRequirementMessage(metrics.swimMetric)}
              </p>
            )}
            {renderThresholdField("swim", metrics.swimMetric)}
          </div>

          {/* Cycling Metrics */}
          <div className="space-y-6">
            <div className="text-left">
              <h3
                className="text-xl font-semibold mb-2 flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <Bike className="w-6 h-6" style={{ color: "#F97316" }} />
                Cycling
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>Select your preferred cycling training metric</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
              {bikeOptions.map((option) => {
                const isSelected = metrics.bikeMetric === option.value
                const hasError = hasAttemptedNext && errors.bikeMetric

                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateData({ metrics: { ...metrics, bikeMetric: option.value } })
                    }}
                    className={`relative p-6 rounded-xl text-left transition-all duration-200 border-2 ${
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
                    <div className="font-bold text-lg mb-2">{option.label}</div>
                  </button>
                )
              })}
            </div>
            {hasAttemptedNext && errors.bikeMetric && (
              <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "#DC2626" }}>
                <AlertCircle className="w-4 h-4" />
                {errors.bikeMetric}
              </p>
            )}
            {getRequirementMessage(metrics.bikeMetric) && (
              <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "var(--text-secondary)" }}>
                <Info className="w-4 h-4" />
                {getRequirementMessage(metrics.bikeMetric)}
              </p>
            )}
            {renderThresholdField("bike", metrics.bikeMetric)}
          </div>

          {/* Running Metrics */}
          <div className="space-y-6">
            <div className="text-left">
              <h3
                className="text-xl font-semibold mb-2 flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <Footprints className="w-6 h-6" style={{ color: "#10B981" }} />
                Running
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>Select your preferred running training metric</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
              {runOptions.map((option) => {
                const isSelected = metrics.runMetric === option.value
                const hasError = hasAttemptedNext && errors.runMetric

                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateData({ metrics: { ...metrics, runMetric: option.value } })
                    }}
                    className={`relative p-6 rounded-xl text-left transition-all duration-200 border-2 ${
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
                    <div className="font-bold text-lg mb-2">{option.label}</div>
                  </button>
                )
              })}
            </div>
            {hasAttemptedNext && errors.runMetric && (
              <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "#DC2626" }}>
                <AlertCircle className="w-4 h-4" />
                {errors.runMetric}
              </p>
            )}
            {getRequirementMessage(metrics.runMetric) && (
              <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "var(--text-secondary)" }}>
                <Info className="w-4 h-4" />
                {getRequirementMessage(metrics.runMetric)}
              </p>
            )}
            {renderThresholdField("run", metrics.runMetric)}
          </div>

          {showThresholds && hasHRSelected && (
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-weak)" }}
            >
              <label
                className="text-sm font-medium flex items-center gap-2 mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                <Heart className="w-4 h-4" style={{ color: "#EF4444" }} />
                Lactate Threshold Heart Rate (LTHR)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="165"
                  value={thresholds.lthr || ""}
                  onChange={(e) => updateData({ thresholds: { ...thresholds, lthr: e.target.value } })}
                  className="flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: hasAttemptedNext && thresholdErrors.lthr ? "#DC2626" : "var(--border-weak)",
                    color: "var(--text-primary)",
                  }}
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  bpm
                </span>
              </div>
              {hasAttemptedNext && thresholdErrors.lthr && (
                <p className="text-sm flex items-center gap-2 mt-2" style={{ color: "#DC2626" }}>
                  <AlertCircle className="w-4 h-4" />
                  {thresholdErrors.lthr}
                </p>
              )}
            </div>
          )}

          {/* Important message at bottom */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "rgba(var(--brand-rgb), 0.1)", border: "1px solid var(--brand)" }}
          >
            <p style={{ color: "var(--text-primary)" }} className="text-sm">
              <strong>Important:</strong> Training within the correct zones is crucial for optimal performance and
              adaptation. Accurate thresholds ensure your training intensities are properly calibrated.
            </p>
          </div>
        </div>
      </div>
    )
  }

  function ReadinessStep({ onNext }: ReadinessStepProps) {
    useEffect(() => {
      // Auto-validate this step since it's informational
      onNext()
    }, [onNext])

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Daily Readiness Monitoring</h2>
          <p className="text-text-secondary">
            Learn how we help you train smarter with personalized readiness insights
          </p>
        </div>

        <ReadinessInfoCard />

        <div className="mt-8 p-4 bg-bg-raised rounded-lg border border-border-weak">
          <h4 className="font-semibold text-text-primary mb-2">Getting Started</h4>
          <p className="text-sm text-text-secondary">
            Connect your wearable device or manually log sleep and wellness data to start receiving personalized
            readiness scores. Your training plan will automatically adapt based on your daily capacity.
          </p>
        </div>
      </div>
    )
  }

  function ReviewStep({ data }: ReviewStepProps) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">Review & Confirm</h2>
        <p className="text-gray-400">Please review your settings before generating your training plan.</p>

        {/* Profile Information */}
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 space-y-2">
          <h3 className="text-lg font-medium text-white">Profile Information</h3>
          <p className="text-gray-400">
            Name: {data.profile.firstName} {data.profile.lastName}
          </p>
          <p className="text-gray-400">Date of Birth: {data.profile.dateOfBirth}</p>
          <p className="text-gray-400">Sex at Birth: {data.profile.sexAtBirth}</p>
        </div>

        {/* Goals Information */}
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 space-y-2">
          <h3 className="text-lg font-medium text-white">Goals Information</h3>
          <p className="text-gray-400">Sport: {data.goals.sport}</p>
          <p className="text-gray-400">Race Type: {data.goals.raceType}</p>
          <p className="text-gray-400">Race Date: {data.goals.raceDate}</p>
        </div>

        {/* Add more sections to review other data points */}
      </div>
    )
  }

  function PlanSummaryStep({ data, completeSetup }: PlanSummaryStepProps) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">Plan Summary</h2>
        <p className="text-gray-400">Here's a summary of your generated training plan.</p>

        {/* Display Plan Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 space-y-2">
          <h3 className="text-lg font-medium text-white">Plan Details</h3>
          <p className="text-gray-400">Sport: {data.goals.sport}</p>
          <p className="text-gray-400">Race Type: {data.goals.raceType}</p>
          {/* Add more plan details here */}
        </div>

        {/* Complete Setup Button */}
        <Button
          onClick={completeSetup}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Complete Setup
        </Button>
      </div>
    )
  }

  function GeneratePlanStep({ isGeneratingPlan, handleGeneratePlan }: GeneratePlanStepProps) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">Generate Plan</h2>
        <p className="text-gray-400">Click the button below to generate your personalized training plan.</p>

        {/* Generate Plan Button */}
        <Button
          onClick={handleGeneratePlan}
          disabled={isGeneratingPlan}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isGeneratingPlan ? "Generating Plan..." : "Generate Plan"}
        </Button>
      </div>
    )
  }
}
