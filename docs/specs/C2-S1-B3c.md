# C2-S1-B3c — Calendar UI Wiring to Live GETs

**ID:** C2-S1-B3c  
**Title:** Calendar UI Wiring to Live GETs  
**Owner:** Full-Stack (Cursor) • **Status:** Implementing

## 1) User story & outcomes
- As an athlete, I see real-time training session data in the calendar view with date filtering
- As a developer, the Calendar page uses live API data and B3a state management components
- Success metrics: Calendar loads live session data; date filtering works; loading/error/empty states functional; responsive design maintained

## 2) Scope
- **In:** Wire Calendar page (`app/calendar/page.tsx`) to `/api/sessions` with date filtering and `/api/plan` for context
- Use B3a loading (`LoadingSpinner`), error (`ErrorState`), and empty (`EmptySessions`) components
- Replace `generateMockData` function with live API calls
- Implement date range filtering for session queries
- Handle both month and week view modes with proper data loading
- **Out:** `/api/workout-library` integration (returns 404), `/api/readiness` (not needed for calendar), Cockpit page (B3b complete), Progress page (B3d scope), new UI components

## 3) Contracts (authoritative)
- **OpenAPI:** No new endpoints; wire existing GET endpoints to calendar UI components
  - `GET /api/sessions?start&end&sport&cursor&limit` — sessions with date filtering and keyset pagination
  - `GET /api/plan` — athlete plan view for training context
- **Data model:** Use existing Supabase tables with RLS policies
- **Headers/Cache:** Align with ETag/Auth policies, use `X-Athlete-Id` header for dev
- **UI States:** Loading, Empty, Error, Success (using B3a components)

## 4) Non-functionals
- Loading states: `LoadingSpinner` during data fetch for calendar views
- Error handling: `ErrorState` with retry mechanisms, user-friendly messages
- Responsive: All states work on mobile and desktop calendar layouts
- Authentication: `X-Athlete-Id` header for dev, JWT for prod
- Performance: Efficient date-range queries, proper caching with ETags
- Date filtering: Precise start/end date filtering for month/week views

## 5) UX flow (1–2 images max)
1. User navigates to `/calendar` → `LoadingSpinner` shows in calendar grid
2. Sessions load from live endpoints → Calendar displays real workout data with proper date filtering
3. If API error occurs → `ErrorState` overlay with retry option
4. If no sessions in date range → `EmptySessions` message with helpful CTAs
5. Month/Week view switches trigger new date-filtered API calls

## 6) Acceptance checks (verifiable)
- Calendar page displays live session data from `/api/sessions` with date filtering
- Month view loads sessions for current month date range
- Week view loads sessions for current week date range
- `LoadingSpinner` shows during session data fetch
- `ErrorState` displays on API failure with retry functionality
- `EmptySessions` displays when no sessions in date range
- Date navigation triggers new API calls with proper date ranges
- `X-Athlete-Id` header correctly authenticates requests
- Responsive design maintained across calendar views

## 7) Open questions / needs clarification
- [ ] How to handle session drag-and-drop with live data? (Out of scope for B3c)
- [ ] Race data integration with `/api/plan`? (Future enhancement)
- Blocking? No

## 8) Tasks (numbered)
T-1 Create calendar-specific data hook (`lib/hooks/useCalendarData.ts`) ✅
T-2 Create calendar data mappers (`lib/utils/calendarMappers.ts`) ✅  
T-3 Replace `generateMockData` with live API calls in calendar page ✅
T-4 Integrate B3a LoadingSpinner for calendar loading states ✅
T-5 Integrate B3a ErrorState for error handling ✅
T-6 Integrate B3a EmptySessions for empty states ✅
T-7 Implement date range filtering for month/week views ✅
T-8 Test calendar with live data and verify all states ✅
T-9 Update `docs/config/status.yml` (B3c: "implemented") ✅
T-10 Add C5 entry to `docs/process/AUTO_LOG.md` ✅
T-11 Add implementation notes to this spec ✅
T-12 Update `docs/process/STATUS.md` and cross-references ✅
T-13 Add B3c entry to `docs/decisions/DECISION_LOG.md` ✅

## 9) Implementation Notes (Added 2025-09-25)
- **Current State:** ✅ COMPLETED - All tasks completed, Phase 6 documentation complete
- **Key Achievement:** Successful live data integration with calendar components for month/week views
- **API Endpoints:** Sessions and plan endpoints verified working with date filtering (200 OK responses)
- **Authentication:** X-Athlete-Id header pattern implemented and tested with dev athlete ID
- **State Management:** All B3a components properly integrated across calendar loading/error/empty states
- **Date Filtering:** Precise date range queries implemented for month/week view optimization
- **Component Integration:** MonthGrid and WeekLane components successfully updated for live data
- **Data Mapping:** Custom calendar mappers transform API responses to DayAggregate and WeekSession formats
- **Phase 6 Completion:** C5 entry added to AUTO_LOG.md, STATUS.md updated, DECISION_LOG.md entry added
- **Final Verification:** All documentation cross-references updated and aligned with implementation

## 10) Technical Architecture
### Calendar Data Flow
- **Calendar Hooks** (`lib/hooks/useCalendarData.ts`): Date-range specific data fetching for month/week views
- **Data Mappers** (`lib/utils/calendarMappers.ts`): Transform API sessions to calendar display format
- **Component Integration**: MonthGrid and WeekLane accept sessionsData prop for live rendering
- **State Management**: Loading spinner during fetch, error states with retry, empty states with date context
