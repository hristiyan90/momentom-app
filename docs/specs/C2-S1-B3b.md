# C2-S1-B3b — Cockpit UI Wiring to Live APIs

**ID:** C2-S1-B3b  
**Title:** Cockpit UI Wiring to Live APIs  
**Owner:** Full-Stack (Cursor)  
**Status:** `{{status.features.C2-S1-B3b}}` (see docs/config/status.yml)

## 1) User story & outcomes
- As an athlete, I see real training data from live API endpoints in my cockpit dashboard instead of mock data.
- As a developer, the cockpit page demonstrates proper integration of B3a state management components with live data.
- Success metrics: Cockpit loads live data from all working endpoints; loading/error/empty states function correctly; responsive design maintained.

## 2) Scope
- **In:** Wire cockpit page to live GET endpoints (/api/plan, /api/sessions, /api/readiness); integrate B3a loading/error/empty components; maintain existing UI structure and responsive design.
- **Out:** Calendar page integration (B3c), Progress page integration (B3d), /api/workout-library endpoint (returns 404), new UI components creation.

## 3) Contracts (authoritative)
- **OpenAPI:** Use existing GET endpoints with no schema changes
  - `GET /api/plan` — athlete plan data (200 OK verified)
  - `GET /api/sessions?start&end&sport&cursor&limit` — sessions with keyset pagination (200 OK verified)
  - `GET /api/readiness?date` — readiness drivers and score (200 OK verified)
- **Authentication:** X-Athlete-Id header pattern for dev mode authentication
- **Data model:** Use existing Supabase tables with RLS policies, no database changes
- **Headers/Cache:** Align with existing ETag/Auth policies from endpoints
- **UI States:** Loading (B3a LoadingSpinner), Error (B3a ErrorState), Empty (B3a EmptyWorkouts), Success (live data)

## 4) Non-functionals
- **Loading states:** <2s initial load with B3a LoadingSpinner component
- **Error handling:** Graceful degradation with B3a ErrorState and retry mechanisms
- **Empty states:** B3a EmptyWorkouts component when no sessions available
- **Responsive:** All states work on mobile and desktop (existing layout preserved)
- **Authentication:** X-Athlete-Id header pattern working for dev athlete ID
- **Performance:** Efficient data fetching with proper error boundaries

## 5) UX flow (1–2 images max)
1. User navigates to /cockpit → B3a LoadingSpinner shows immediately
2. API calls execute in parallel → Plan, Sessions, Readiness data fetched
3. Success: Live data displays in existing cockpit UI structure
4. Error: B3a ErrorState shows with retry functionality
5. Empty: B3a EmptyWorkouts shows when no sessions with helpful CTAs

## 6) Acceptance checks (verifiable)
- Cockpit page loads with B3a LoadingSpinner during data fetch
- Live plan data displays in week focus section (mapped from /api/plan)
- Live session data displays in today's workouts section (mapped from /api/sessions)
- Live readiness data displays in capacity section (mapped from /api/readiness)
- B3a ErrorState handles API failures with retry functionality
- B3a EmptyWorkouts shows when no sessions available with helpful CTAs
- X-Athlete-Id authentication pattern works correctly
- Responsive design maintained on mobile and desktop
- Mock data preserved for non-API sections (weather, alerts, etc.)

## 7) Open questions / needs clarification
- [x] Which athlete ID to use for testing? (Using dev athlete ID: 123e4567-e89b-12d3-a456-426614174000)
- [x] How to handle /api/workout-library 404 errors? (Excluded from B3b scope)
- [x] Should we maintain existing UI structure? (Yes, preserve existing cockpit layout)
- [x] Which B3a components to use for states? (LoadingSpinner, ErrorState, EmptyWorkouts)
- Blocking? No

## 8) Tasks (numbered)
T-1 Create API client with X-Athlete-Id authentication pattern ✅
T-2 Create custom hooks for data fetching with loading/error states ✅
T-3 Create data mappers to transform API responses to cockpit UI format ✅
T-4 Wire /api/plan endpoint to cockpit week focus section ✅
T-5 Wire /api/sessions endpoint to cockpit today's workouts section ✅
T-6 Wire /api/readiness endpoint to cockpit capacity section ✅
T-7 Integrate B3a LoadingSpinner for loading states ✅
T-8 Integrate B3a ErrorState for error handling ✅
T-9 Integrate B3a EmptyWorkouts for empty states ✅
T-10 Test all states and verify responsive behavior ✅

## 9) Implementation Notes (Added 2025-09-25)
- **Current State:** ✅ COMPLETED - All tasks completed, Phase 6 documentation complete
- **Key Achievement:** Successful live data integration with B3a state management components
- **API Endpoints:** All three endpoints verified working (200 OK responses with proper data)
- **Authentication:** X-Athlete-Id header pattern implemented and tested with dev athlete ID
- **State Management:** All B3a components properly integrated and functional across all states
- **Phase 6 Completion:** C5 entry added to AUTO_LOG.md, STATUS.md updated, DECISION_LOG.md entry added
- **Final Verification:** All documentation cross-references updated and aligned

## 10) Technical Architecture
### API Integration Layer
- **API Client** (`lib/api/client.ts`): Authenticated requests with X-Athlete-Id header
- **Data Hooks** (`lib/hooks/useCockpitData.ts`): Loading/error/success state management
- **Data Mappers** (`lib/utils/cockpitMappers.ts`): Transform API responses to UI format

### State Management Integration
- **LoadingSpinner**: Shows during parallel API data fetching
- **ErrorState**: Handles network failures with retry functionality
- **EmptyWorkouts**: Displays when no sessions available with helpful CTAs

### Data Flow
1. **useCockpitData** hook triggers parallel API calls
2. **API Client** adds X-Athlete-Id header for authentication
3. **Data Mappers** transform responses to cockpit component format
4. **B3a Components** handle loading/error/empty states
5. **Cockpit UI** renders live data in existing structure

## 11) Verification Results
- ✅ GET /api/plan returns 200 OK with valid plan data
- ✅ GET /api/sessions returns 200 OK with valid session data
- ✅ GET /api/readiness returns 200 OK with valid readiness data
- ✅ Cockpit page loads correctly with LoadingSpinner
- ✅ Live data displays properly in existing UI structure
- ✅ Error handling works with retry functionality
- ✅ Empty states display with helpful messaging
- ✅ Responsive design maintained on all screen sizes
