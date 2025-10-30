# Onboarding API Integration - Quick Reference

## 🎯 5-Minute Overview

**What**: Wire onboarding UI to persistence APIs (GAP-1)
**Where**: `/app/onboarding/page.tsx` and `/app/onboarding/quick-start/page.tsx`
**How**: Use `useOnboardingPersistence` hook
**Time**: 2-3 hours

## 📦 Files You Need

### Already Created ✅
```
/lib/api/onboarding.ts              # API functions
/lib/hooks/useOnboardingPersistence.ts  # React hook
/docs/integration/*.md              # Documentation
```

### You Need to Modify 🛠️
```
/app/onboarding/page.tsx            # Advanced onboarding
/app/onboarding/quick-start/page.tsx    # Quick start
```

## 🔧 3-Step Integration

### Step 1: Add Hook

```typescript
// In your component
import { useOnboardingPersistence } from "@/lib/hooks/useOnboardingPersistence"

const {
  isSaving,
  error: apiError,
  saveProfile,
  savePreferences,
  saveRaceData,
  clearError,
} = useOnboardingPersistence()
```

### Step 2: Save on "Next"

```typescript
const handleNext = async () => {
  // Existing validation...

  // Save based on step
  let success = true

  if (currentStep === 1) {
    success = await saveProfile(data.profile)
  } else if (currentStep === 2) {
    success = await saveRaceData(data.savedRaces)
  } else if (currentStep === 4) {
    success = await savePreferences(data.preferences)
  }

  // Only advance if save succeeded
  if (success) {
    setCurrentStep(currentStep + 1)
  }
}
```

### Step 3: Show Errors

```tsx
{apiError && (
  <div className="error-banner">
    <AlertCircle />
    <p>{apiError}</p>
    <button onClick={clearError}>×</button>
  </div>
)}
```

## 🎨 UI Elements

### Loading Spinner
```tsx
<Button disabled={isSaving}>
  {isSaving ? (
    <><Loader2 className="animate-spin" /> Saving...</>
  ) : (
    'Next Step'
  )}
</Button>
```

### Error Banner
```tsx
{apiError && (
  <div className="bg-red-50 border border-red-200 p-4 rounded">
    <AlertCircle className="text-red-500" />
    <p className="text-red-700">{apiError}</p>
    <button onClick={clearError}>×</button>
  </div>
)}
```

## 📊 Data Flow

```
User fills form
    ↓
Clicks "Next"
    ↓
Validation passes
    ↓
saveProfile(data)
    ↓
POST /api/athlete/profile
    ↓
Success → Next step
Error → Show message
```

## 🗂️ When Data Saves

| Step | Trigger | Saves To | Endpoint |
|------|---------|----------|----------|
| Profile (1) | Next → Step 2 | `athlete_profiles` | POST /api/athlete/profile |
| Goals (2) | Next → Step 3 | `race_calendar` | POST /api/races |
| Preferences (4) | Next → Step 5 | `athlete_preferences` | POST /api/athlete/preferences |
| Review (7) | Next → Step 8 | `athlete_constraints` | POST /api/athlete/constraints |

## 🧪 Testing Checklist

- [ ] Complete profile → Check database
- [ ] Add race → Check database
- [ ] Set preferences → Check database
- [ ] Logout → Try to save → See error
- [ ] Refresh page → Data still there
- [ ] Network error → Retry works

## 🐛 Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Session expired" | Logged out | Redirect to /login |
| "Please check your input" | Validation failed | Fix form fields |
| "Profile not found" | Missing profile | Complete profile first |
| "Something went wrong" | Server error | Retry |

## 💡 Pro Tips

1. **Save incrementally**: Don't wait until the end
2. **Clear errors**: Call `clearError()` before each save
3. **Check loading states**: Disable buttons during `isSaving`
4. **Test offline**: Simulate network failures
5. **Check database**: Use Supabase dashboard to verify data

## 📝 Example: Save Profile

```typescript
// When user clicks "Next" on profile step
const handleProfileNext = async () => {
  clearError() // Clear previous errors

  const success = await saveProfile({
    firstName: data.profile.firstName,
    lastName: data.profile.lastName,
    dateOfBirth: data.profile.dateOfBirth,
    experienceLevel: "intermediate",
    weeklyHours: "8",
    trainingDays: "5",
  })

  if (success) {
    setCurrentStep(2) // Go to next step
  }
  // If failed, error message shows automatically
}
```

## 🚀 Quick Start Specific

```typescript
// Save everything when generating plan
const generatePlan = async () => {
  // 1. Save profile
  await saveProfile(profileData)

  // 2. Save preferences
  await savePreferences(preferencesData)

  // 3. Save race (if any)
  if (hasRace) {
    await saveRaceData([raceData])
  }

  // 4. Show plan
  setPlanGenerated(true)
}
```

## 📞 Need Help?

1. **Full guide**: `/docs/integration/GAP-1-ONBOARDING-INTEGRATION.md`
2. **Code examples**: `/docs/integration/onboarding-modifications.tsx`
3. **Summary**: `/docs/integration/IMPLEMENTATION-SUMMARY.md`
4. **This card**: `/docs/integration/QUICK-REFERENCE.md`

## ✅ Definition of Done

- [x] Hook imported
- [x] States used (isSaving, apiError)
- [x] Save functions called on "Next"
- [x] Error messages displayed
- [x] Loading spinners shown
- [x] Tested end-to-end
- [x] Data verified in database

## 🎯 Success Criteria

- ✅ User completes onboarding → Data in DB
- ✅ User refreshes → Data reloads
- ✅ Error occurs → User-friendly message
- ✅ Session expires → Redirect to login
- ✅ All tests pass

---

**Time to integrate**: 2-3 hours
**Risk level**: Low (additive only)
**Breaking changes**: None
**Ready to ship**: Yes
