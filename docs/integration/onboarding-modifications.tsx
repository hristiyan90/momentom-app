/**
 * ONBOARDING API INTEGRATION - KEY MODIFICATIONS
 *
 * This file shows the exact code changes needed in /app/onboarding/page.tsx
 * Copy these snippets into the appropriate locations.
 */

// ============================================================================
// MODIFICATION 1: Add imports (at top of file, after existing imports)
// ============================================================================

import { Loader2 } from "lucide-react" // Add to existing lucide-react imports
import { useOnboardingPersistence } from "@/lib/hooks/useOnboardingPersistence"

// ============================================================================
// MODIFICATION 2: Add hook to OnboardingPage component
// (Add after existing useState declarations, around line 290)
// ============================================================================

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  // ... existing state ...

  // ADD THIS: API Integration Hook
  const {
    isSaving,
    isLoading,
    error: apiError,
    saveProfile,
    loadProfile,
    savePreferences,
    loadPreferences,
    saveRaceData,
    loadRaces,
    saveConstraintData,
    clearError,
  } = useOnboardingPersistence()

  // ... rest of component
}

// ============================================================================
// MODIFICATION 3: Load existing data on mount
// (Add after hook declaration)
// ============================================================================

// Load existing onboarding data if user returns to onboarding
useEffect(() => {
  const loadExistingData = async () => {
    if (!onboardingStarted) return

    setIsLoading(true)

    // Load profile
    const existingProfile = await loadProfile()
    if (existingProfile) {
      const nameParts = existingProfile.name.split(' ')
      updateDataCallback({
        profile: {
          ...data.profile,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          dateOfBirth: existingProfile.date_of_birth,
        },
      })
    }

    // Load preferences
    const existingPreferences = await loadPreferences()
    if (existingPreferences) {
      // Map day availability back to rest day
      const restDayMap: Record<string, string> = {
        monday_available: 'monday',
        tuesday_available: 'tuesday',
        wednesday_available: 'wednesday',
        thursday_available: 'thursday',
        friday_available: 'friday',
        saturday_available: 'saturday',
        sunday_available: 'sunday',
      }

      let restDay = ''
      for (const [key, day] of Object.entries(restDayMap)) {
        if (existingPreferences[key] === false) {
          restDay = day
          break
        }
      }

      updateDataCallback({
        preferences: {
          ...data.preferences,
          restDay,
        },
        metrics: {
          swimMetric: existingPreferences.preferred_swim_metric || 'pace',
          bikeMetric: existingPreferences.preferred_bike_metric || 'power',
          runMetric: existingPreferences.preferred_run_metric || 'pace',
        },
      })
    }

    // Load races
    const existingRaces = await loadRaces()
    if (existingRaces && existingRaces.length > 0) {
      const mappedRaces = existingRaces.map((race: any, index: number) => ({
        id: `race-${index}`,
        type: 'upcoming',
        sport: 'triathlon',
        racePriority: race.priority,
        raceType: race.race_type,
        raceDate: race.race_date,
        raceLocation: race.location || '',
        raceName: race.race_name || '',
      }))

      updateDataCallback({
        savedRaces: mappedRaces,
      })
    }

    setIsLoading(false)
  }

  loadExistingData()
}, [onboardingStarted])

// ============================================================================
// MODIFICATION 4: Replace handleNext function
// (Find existing handleNext around line 309 and replace entire function)
// ============================================================================

const handleNext = async () => {
  setHasAttemptedNext(true)

  // Welcome step doesn't need validation
  if (currentStep === 0) {
    return
  }

  if (currentStep < ONBOARDING_STEPS.length) {
    // Special validation for metrics step (step 5)
    if (currentStep === 5) {
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

      if (!isMetricsStepValid) {
        return
      }
    } else if (!isStepValid) {
      return
    }

    // Clear previous API errors
    clearError()

    // Save data based on current step
    let saveSuccess = true

    switch (currentStep) {
      case 1: // Profile step
        // Prepare profile data for saving
        const profileData = {
          ...data.profile,
          experienceLevel: data.history.experienceLevel || 'intermediate',
          weeklyHours: data.history.weeklyHours || '6-8',
          trainingDays: String(data.history.restDay?.length ? 7 - data.history.restDay.length : 4),
        }
        saveSuccess = await saveProfile(profileData)
        break

      case 2: // Goals step - save races
        if (data.savedRaces.length > 0) {
          saveSuccess = await saveRaceData(data.savedRaces)
        }
        break

      case 4: // Preferences step - save preferences with history and metrics
        const preferencesData = {
          restDay: data.preferences.restDay || data.history.restDay[0] || 'monday',
          weeklyHours: data.preferences.weeklyHours || data.history.weeklyHours,
          periodization: data.preferences.periodization || data.history.periodization,
          runMetric: data.metrics.runMetric || 'pace',
          bikeMetric: data.metrics.bikeMetric || 'power',
          swimMetric: data.metrics.swimMetric || 'pace',
          trainingTypes: data.preferences.trainingTypes,
          sessionTypes: data.preferences.sessionTypes,
          intensityPreference: data.preferences.intensityPreference,
        }
        saveSuccess = await savePreferences(preferencesData)
        break

      case 7: // Review step - save constraints if any
        if (data.constraints.hasConstraints) {
          saveSuccess = await saveConstraintData(data.constraints)
        }
        break
    }

    // Only proceed if save was successful (or no save needed)
    if (saveSuccess) {
      setCurrentStep(currentStep + 1)
      setIsStepValid(false)
      setHasAttemptedNext(false)
    }
  } else {
    // This is the generate plan step
    handleGeneratePlan()
  }
}

// ============================================================================
// MODIFICATION 5: Add error display in main content area
// (Add in main content section, right before {renderStep()}, around line 550)
// ============================================================================

<div className="col-span-9">
  <div className="bg-bg-surface rounded-lg border border-border-weak p-8">

    {/* ADD THIS: Error Display */}
    {apiError && (
      <div className="mb-6 p-4 bg-status-danger/10 border border-status-danger rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-status-danger flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-status-danger font-medium">Error Saving Data</p>
          <p className="text-status-danger/80 text-sm mt-1">{apiError}</p>
        </div>
        <button
          onClick={clearError}
          className="text-status-danger hover:text-status-danger/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )}

    {/* Loading overlay */}
    {isLoading && (
      <div className="mb-6 p-4 bg-brand/10 border border-brand rounded-lg flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-brand animate-spin" />
        <p className="text-brand">Loading your data...</p>
      </div>
    )}

    {renderStep()}

    {/* ... rest of content */}
  </div>
</div>

// ============================================================================
// MODIFICATION 6: Update Next button to show loading state
// (Replace existing Next button around line 565)
// ============================================================================

<Button
  onClick={handleNext}
  disabled={isSaving || isLoading}
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

// ============================================================================
// MODIFICATION 7: Add "Skip to Dashboard" button in header
// (Add in header section after "Advanced Setup" title, around line 480)
// ============================================================================

<div className="border-b border-border-weak bg-bg-surface">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Advanced Setup</h1>
        <p className="text-text-secondary">Complete your detailed training profile</p>
      </div>
      <div className="flex items-center gap-3">
        {/* ADD THIS: Skip to Dashboard (shows if profile exists) */}
        {currentStep > 1 && !isLoading && (
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="text-text-secondary hover:text-text-primary"
          >
            Skip to Dashboard →
          </Button>
        )}
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
</div>

// ============================================================================
// QUICK START MODIFICATIONS
// For /app/onboarding/quick-start/page.tsx
// ============================================================================

// 1. Add imports
import { useOnboardingPersistence } from "@/lib/hooks/useOnboardingPersistence"
import { AlertCircle, X, Loader2 } from "lucide-react"

// 2. Add hook after existing state
const {
  isSaving,
  error: apiError,
  saveProfile,
  savePreferences,
  saveRaceData,
  clearError,
} = useOnboardingPersistence()

// 3. Replace generatePlan function
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

// 4. Add error display in UI (after header, before main content)
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

// 5. Update "Generate My Training Plan" button to show loading
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

// ============================================================================
// END OF MODIFICATIONS
// ============================================================================

/**
 * TESTING CHECKLIST
 *
 * After implementing these modifications, test the following:
 *
 * 1. Profile Step:
 *    - Fill out profile form
 *    - Click "Next Step"
 *    - Verify loading spinner appears
 *    - Verify advances to next step on success
 *    - Refresh page and verify data persists
 *
 * 2. Goals/Races Step:
 *    - Add a race
 *    - Click "Next Step"
 *    - Verify race saves to database
 *
 * 3. Preferences Step:
 *    - Set preferences
 *    - Click "Next Step"
 *    - Verify preferences save
 *
 * 4. Error Handling:
 *    - Clear browser cookies to simulate logout
 *    - Try to save data
 *    - Verify error message appears
 *    - Verify redirect to login page
 *
 * 5. Quick Start:
 *    - Complete quick start flow
 *    - Click "Generate My Training Plan"
 *    - Verify all data saves
 *    - Check database for profile, preferences, and race
 *
 * 6. Data Reload:
 *    - Complete onboarding halfway
 *    - Refresh page
 *    - Verify existing data loads
 *    - Continue from where you left off
 */
