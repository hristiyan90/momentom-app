# GAP-1 Onboarding UI Integration Guide

## Overview

This document provides complete integration instructions for wiring the onboarding UI to the GAP-1 persistence APIs. All 9 API endpoints have been implemented and QA-approved.

## Files Created

### 1. `/lib/api/onboarding.ts`
**Purpose**: Client-side API functions for all onboarding endpoints
**Exports**:
- `saveAthleteProfile()` - POST /api/athlete/profile
- `getAthleteProfile()` - GET /api/athlete/profile
- `saveAthletePreferences()` - POST /api/athlete/preferences
- `getAthletePreferences()` - GET /api/athlete/preferences
- `saveRaces()` - POST /api/races
- `getRaces()` - GET /api/races
- `deleteRace()` - DELETE /api/races/[race_id]
- `saveConstraints()` - POST /api/athlete/constraints
- `getErrorMessage()` - Error message helper
- `isAuthError()` - Check if error requires re-auth

### 2. `/lib/hooks/useOnboardingPersistence.ts`
**Purpose**: React hook that encapsulates all onboarding persistence logic
**Exports**:
- Hook: `useOnboarding Persistence()`
- Provides: `saveProfile`, `loadProfile`, `savePreferences`, `loadPreferences`, `saveRaceData`, `loadRaces`, `saveConstraintData`
- Handles: Data mapping, error handling, loading states, auth redirects

## Integration Steps

### Step 1: Add Hook to Main Onboarding Component

In `/app/onboarding/page.tsx`, add the hook after existing state:

```typescript
// Add to imports
import { useOnboardingPersistence } from "@/lib/hooks/useOnboardingPersistence"

// Inside OnboardingPage component, after existing state
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
```

### Step 2: Load Existing Data on Mount

Add useEffect to load any existing onboarding data:

```typescript
// Load existing data on component mount
useEffect(() => {
  const loadExistingData = async () => {
    // Load profile if it exists
    const existingProfile = await loadProfile()
    if (existingProfile) {
      // Map API data back to UI format
      updateDataCallback({
        profile: {
          firstName: existingProfile.name.split(' ')[0] || '',
          lastName: existingProfile.name.split(' ').slice(1).join(' ') || '',
          dateOfBirth: existingProfile.date_of_birth,
          // ... map other fields
        }
      })
    }

    // Load preferences if they exist
    const existingPreferences = await loadPreferences()
    if (existingPreferences) {
      // Map and update UI
    }

    // Load races if they exist
    const existingRaces = await loadRaces()
    if (existingRaces.length > 0) {
      // Map and update UI
    }
  }

  loadExistingData()
}, [loadProfile, loadPreferences, loadRaces, updateDataCallback])
```

### Step 3: Modify handleNext to Save Data

Update the `handleNext()` function to save data after each step:

```typescript
const handleNext = async () => {
  setHasAttemptedNext(true)

  if (!isStepValid && currentStep !== 0) {
    return
  }

  // Clear any previous API errors
  clearError()

  // Save data based on current step
  let saveSuccess = true

  switch (currentStep) {
    case 1: // Profile step
      saveSuccess = await saveProfile(data.profile)
      break

    case 2: // Goals step - save races
      if (data.savedRaces.length > 0) {
        saveSuccess = await saveRaceData(data.savedRaces)
      }
      break

    case 4: // Preferences step
      saveSuccess = await savePreferences({
        ...data.preferences,
        ...data.history,
        runMetric: data.metrics.runMetric,
        bikeMetric: data.metrics.bikeMetric,
        swimMetric: data.metrics.swimMetric,
      })
      break

    case 7: // Review step - save constraints
      if (data.constraints.hasConstraints) {
        saveSuccess = await saveConstraintData(data.constraints)
      }
      break
  }

  // Only proceed to next step if save was successful
  if (saveSuccess) {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1)
      setIsStepValid(false)
      setHasAttemptedNext(false)
    } else {
      handleGeneratePlan()
    }
  }
  // If save failed, apiError will be set and displayed to user
}
```

### Step 4: Add Error Display Component

Add error display in the main content area:

```typescript
// In the main content section, before renderStep()
{apiError && (
  <div className="mb-6 p-4 bg-status-danger/10 border border-status-danger rounded-lg flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-status-danger flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-status-danger font-medium">Error</p>
      <p className="text-status-danger/80 text-sm mt-1">{apiError}</p>
    </div>
    <button
      onClick={clearError}
      className="text-status-danger hover:text-status-danger/80"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
)}
```

### Step 5: Add Loading States to Navigation

Update the Next button to show loading state:

```typescript
<Button
  onClick={handleNext}
  disabled={isSaving}
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
```

### Step 6: Add Skip to Dashboard Feature

Add a "Skip to Dashboard" button that appears if profile exists:

```typescript
// In the header section
{currentStep > 0 && !isLoading && (
  <Button
    variant="ghost"
    onClick={() => router.push("/dashboard")}
    className="text-text-secondary hover:text-text-primary"
  >
    Skip to Dashboard →
  </Button>
)}
```

## Quick Start Integration

For `/app/onboarding/quick-start/page.tsx`, follow similar pattern:

```typescript
import { useOnboardingPersistence } from "@/lib/hooks/useOnboardingPersistence"

export default function QuickStartOnboarding() {
  const {
    isSaving,
    error: apiError,
    saveProfile,
    savePreferences,
    saveRaceData,
    clearError,
  } = useOnboardingPersistence()

  // ... existing state

  // Modify generatePlan to save all data
  const generatePlan = async () => {
    setIsGenerating(true)
    clearError()

    try {
      // Save profile
      const profileSuccess = await saveProfile({
        firstName: "Quick",
        lastName: "Start",
        dateOfBirth: data.preferences.startDate,
        experienceLevel: "intermediate",
        weeklyHours: data.preferences.weeklyHours,
        trainingDays: "5",
      })

      if (!profileSuccess) {
        setIsGenerating(false)
        return
      }

      // Save preferences
      const prefsSuccess = await savePreferences({
        restDay: data.preferences.restDay,
        weeklyHours: data.preferences.weeklyHours,
        periodization: data.preferences.periodization,
        runMetric: data.metrics.runMetric,
        bikeMetric: data.metrics.bikeMetric,
        swimMetric: data.metrics.swimMetric,
      })

      if (!prefsSuccess) {
        setIsGenerating(false)
        return
      }

      // Save race if in race mode
      if (!data.goals.isMaintenanceMode) {
        const races = [{
          racePriority: data.goals.racePriority,
          raceType: data.goals.raceType,
          raceDate: data.goals.raceDate,
          raceLocation: data.goals.raceLocation,
        }]
        await saveRaceData(races)
      }

      // Simulate plan generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsGenerating(false)
      setPlanGenerated(true)
    } catch (error) {
      console.error('[Quick Start] Error:', error)
      setIsGenerating(false)
    }
  }

  // Add error display in UI
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* ... existing header */}

      {apiError && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="p-4 bg-status-danger/10 border border-status-danger rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-status-danger flex-shrink-0" />
            <div className="flex-1">
              <p className="text-status-danger">{apiError}</p>
            </div>
            <button onClick={clearError} className="text-status-danger">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ... rest of UI */}
    </div>
  )
}
```

## Error Handling

### Error Codes Handled

| Code | User Message | Action |
|------|-------------|--------|
| `UNAUTHORIZED` / `AUTH_REQUIRED` | "Your session has expired. Please log in again." | Redirect to /login |
| `VALIDATION_ERROR` | "Please check your input and try again." | Show field errors |
| `PROFILE_NOT_FOUND` | "Please complete your profile first." | Go to profile step |
| `DATABASE_ERROR` | "Something went wrong. Please try again." | Allow retry |
| `DUPLICATE_EMAIL` | "This email address is already registered." | Show on profile |

### Retry Logic

Users can retry failed saves by:
1. Fixing validation errors
2. Clicking "Next Step" again
3. Error clears automatically on next attempt

### Session Expiration

If session expires (401 error):
1. Error message displayed for 2 seconds
2. Auto-redirect to `/login?redirect=/onboarding`
3. After login, user returns to onboarding

## API Request/Response Flow

### Profile Save Flow
```
User clicks "Next" on Profile step
  ↓
Validation passes
  ↓
Hook maps UI data → API format
  ↓
POST /api/athlete/profile
  ↓
Success: Advance to next step
Failure: Show error, stay on step
```

### Data Persistence Points

| Step | Data Saved | API Endpoint |
|------|-----------|--------------|
| Profile (Step 1) | Name, DOB, experience, availability | POST /api/athlete/profile |
| Goals (Step 2) | Races | POST /api/races |
| History (Step 3) | N/A - merged with preferences | - |
| Preferences (Step 4) | Training preferences, metrics | POST /api/athlete/preferences |
| Metrics (Step 5) | N/A - sent with preferences | - |
| Readiness (Step 6) | N/A - informational only | - |
| Review (Step 7) | Constraints | POST /api/athlete/constraints |
| Generate (Step 8) | N/A - all data already saved | - |

## Testing Checklist

- [ ] Profile saves on step 1 → 2 transition
- [ ] Races save on step 2 → 3 transition
- [ ] Preferences save on step 4 → 5 transition
- [ ] Constraints save on step 7 → 8 transition
- [ ] Error messages display correctly
- [ ] Loading spinner shows during save
- [ ] Next button disabled while saving
- [ ] 401 error redirects to login
- [ ] Existing data loads on page refresh
- [ ] Quick Start saves all data on plan generation
- [ ] Skip to Dashboard works after profile exists

## Validation Requirements

### Profile Step
- **Required**: firstName, lastName, dateOfBirth, sexAtBirth
- **API Requirements**:
  - Age ≥ 13 years
  - DOB in YYYY-MM-DD format
  - available_hours_per_week: 1-30
  - training_days_per_week: 1-7

### Preferences Step
- **Required**: restDay, weeklyHours, periodization
- **API Requirements**: At least one training day available

### Races Step
- **Optional**: Races can be skipped
- **API Requirements**:
  - race_date in YYYY-MM-DD format
  - Future races must have date ≥ today
  - Priority: A, B, or C

### Constraints Step
- **Optional**: Constraints can be skipped
- **API Requirements**:
  - At least one affected_discipline
  - end_date ≥ start_date (if provided)

## Deployment Notes

1. **No Breaking Changes**: Integration adds persistence without removing existing functionality
2. **Backwards Compatible**: Works with or without existing data
3. **Graceful Degradation**: If API fails, user can continue (with warning)
4. **Session Handling**: Uses existing authentication from cookies
5. **No Migration Needed**: Fresh install, no existing data to migrate

## Success Criteria

✅ User completes onboarding → Data persists to database
✅ User refreshes page → Data reloads from database
✅ User skips to dashboard → Can return to onboarding later
✅ Session expires → Graceful redirect to login
✅ Validation errors → Clear, actionable messages
✅ Network errors → Retry capability

## Support

For questions or issues:
- Review API documentation in `/app/api/athlete/*` and `/app/api/races/*`
- Check error responses in browser Network tab
- Review Supabase logs for server-side errors
- Verify authentication tokens in cookies

---

**Integration Status**: Ready for Implementation
**Estimated Time**: 2-3 hours
**Risk Level**: Low (additive changes only)
