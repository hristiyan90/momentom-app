# Auto-Log Process

This document defines two key processes for maintaining project documentation and tracking.

**See Also:**
- `docs/process/CURSOR_BOOT.md` - Main workflow process with C0-C5 stages
- `docs/process/TASK_FLOW.md` - Master task flow overview
- `docs/process/CURSOR_WORKFLOW.md` - High-level workflow reference
- `docs/decisions/DECISION_LOG.md` - Decision log entries

---

## Decision Log Process (ADR / RFC)

Run this **after your plan is approved**, before coding starts.

### When to create an RFC
If a task would change **OpenAPI**, **RLS**, **security policy**, or **caching semantics**, first:
1) Create `docs/rfcs/RFC_<slug>.md` (Status: Proposed, Summary, Motivation, Impact, Alternatives).
2) Add a row to `docs/decisions/DECISION_LOG.md` linking the RFC.
3) **Do not** change `/openapi/` or `/docs/policy/` until the RFC is marked **Accepted**.

### When to write an ADR
If you make a notable architectural/process decision that does **not** change contracts/policy:
1) Create `docs/decisions/ADR_<nnnn>_<slug>.md` (Status: Accepted/Rejected/Superseded).
2) Append a row to `docs/decisions/DECISION_LOG.md` with ID, title, date, owner, links.

### If no ADR/RFC is needed
Add a "Decisions" section in the PR description with a one-liner:
> No ADR/RFC needed. No contract/policy/RLS/caching changes.

Commit these records as `docs(decisions): ...` inside the same PR.

---

## Auto-Log Ritual (Task Tracking)

At the end of each task/PR, paste an "OPS DIGEST" comment into the PR and update STATUS where applicable.

## OPS DIGEST (template)
- Task: <e.g., B2 — Manual Workout Upload (TCX/GPX)>
- Branch/PR: <branch> → #<PR>
- Status: ✅ Ready for review | ⏳ Blocked: <why>
- Contract: <OpenAPI change? yes/no>
- Policies: <e.g., ETag on GET only; POST no-store>
- RLS: <e.g., staging rows scoped by athlete_id (policy added)>
- cURLs (paste the actual runs):
  - <example> POST /api/_internal/ingest/workout → 202 (multipart ok, <25MB enforced)
  - <example> GET /api/ingest/status → 200 (ETag present)
- CI: OpenAPI diff ✅ Newman ✅ Smoke H1–H7 ✅ (attach artifacts if failed)
- Follow-ups: <bullets>

## STATUS updates
For any status banner in README or docs/process/STATUS.md, reflect newly active tasks and sprint progress.

---

## Cycle 2 Sprint 1 Entries

### A1-A4: Infrastructure & Policies ✅ (Foundation)
Status: ✅ Completed - Infrastructure policies established
- A1: Project structure and initial setup
- A2: Authentication and RLS policies 
- A3: API contract definitions (OpenAPI)
- A4: CI/CD gates and quality checks
Impact: Foundation established for all subsequent development

### B1: Workout Library v0 ✅ (Seed + GET)
Status: ✅ Completed - Basic workout library with GET endpoint
Contract: OpenAPI endpoints for workout library access
Policies: ETag caching on GET requests
Core Functionality: Workout library seeding and read operations
Impact: Baseline workout data available for UI components

### B2: Manual Workout Upload (TCX/GPX) ✅
Branch: feat/b2-manual-upload-phase3 → PR #12
Status: ✅ Completed and Merged
Contract: OpenAPI endpoints added for file upload workflow
Policies: ETag on GET only; POST no-store; 25MB file size limit
RLS: ingest_staging rows scoped by athlete_id (policy added)
Core Functionality:
  - Multipart file upload for TCX/GPX files
  - File validation and parsing
  - Session creation from parsed data
  - Status tracking and error handling
Verification:
  - ✅ POST /api/ingest/workout → 201 (multipart ok, <25MB enforced)
  - ✅ GET /api/ingest/workout/{id} → 200 (ETag present)
  - ✅ Invalid file type → 415 (proper rejection)
  - ✅ Missing file → 400 (validation working)
  - ✅ ETag caching → 304 (If-None-Match working)
  - ✅ Malformed file → 500 (error handling working)
CI: OpenAPI diff ✅ Newman ✅ Smoke H1–H7 ✅ (test suite: 9/9 passing)
Impact: Athletes can upload historical training data

### B3a: State Management Infrastructure ✅
Branch: feat/b3a-loading-components (T-1), feat/b3a-error-components (T-2), feat/b3a-empty-components (T-3)
Status: ✅ Completed (T-1, T-2, T-3)
Contract: No API changes - UI component infrastructure only
Scope: Reusable state management components (LoadingSpinner, ErrorState, EmptyWorkouts)
Dependencies: Design system patterns, TypeScript interfaces, accessibility requirements
Constraints: Components work in isolation, no API integration at this stage
Core Components:
  - LoadingSpinner: Configurable loading states with messaging
  - ErrorState: Error handling with retry functionality  
  - EmptyWorkouts: Empty states with helpful CTAs
Testing: Test page at /test-loading, TypeScript compilation, accessibility compliance
Impact: Shared infrastructure for consistent UX across all pages

### B3b: Cockpit UI Wiring ✅
Branch: feat/b3b-cockpit-wiring → PR #18
Status: ✅ Completed and Merged
Contract: No new APIs - using existing endpoints
Policies: X-Athlete-Id header authentication for dev mode
API Integration: GET /api/plan, GET /api/sessions, GET /api/readiness
State Management: Integrated B3a components (LoadingSpinner, ErrorState, EmptyWorkouts)
Core Functionality:
  - Live data integration replacing mock data
  - Loading states during API calls
  - Error handling with retry capabilities
  - Empty state management for no-data scenarios
Verification:
  - ✅ GET /api/plan → 200 (plan data displays in week focus section)
  - ✅ GET /api/sessions → 200 (session data displays in today's workouts)
  - ✅ GET /api/readiness → 200 (readiness data displays in capacity section)
  - ✅ LoadingSpinner → Shows during data fetch with proper messaging
  - ✅ ErrorState → Handles API failures with retry functionality
  - ✅ EmptyWorkouts → Shows when no sessions with helpful CTAs
  - ✅ Responsive design → Maintained across mobile/desktop
  - ✅ Authentication → X-Athlete-Id header pattern working
CI: All API endpoints verified working, comprehensive testing
Impact: Cockpit page now displays real training data with proper UX states

### B3c: Calendar UI Wiring ✅  
Status: ✅ Completed and Merged
Contract: No new APIs - using existing session endpoints
Scope: Wire calendar page to live data with proper state management
Dependencies: B3a state components, B3b authentication patterns
Core Functionality:
  - Calendar display with real session data
  - Month/week view navigation
  - Session detail sidebar integration
  - Loading and error states for calendar data
Impact: Calendar page displays real training schedule data

### B3e: GarminDB Data Integration 🚧 (T2: Schema Analysis)
Branch: feature/b3e-t2-garmin-schema-analysis → PR #19
Status: 🚧 In Progress (T2: Schema Analysis Complete)
Contract: No API changes in T2 - documentation and analysis only
Scope: Multi-task feature for integrating real Garmin workout and wellness data
Current Phase: T2 - Database schema analysis and data mapping
Core T2 Deliverables:
  - ✅ GarminDB SQLite database structure analysis (4 databases, 24 tables)
  - ✅ Field mappings from GarminDB to Momentom schema (1,000+ activities analyzed)
  - ✅ Data quality assessment (97% success rate, 970+ activities successfully parsed)
  - ✅ Sport mapping strategy (9 GarminDB sports → 5 Momentom categories)
  - ✅ Batch processing strategy for large dataset import
  - ✅ Sample transformation queries tested and validated
T2 Impact: Foundation established for importing 1,000+ historical Garmin activities
Next Phases: T3 (Data Transformation), T4 (Batch Import), T5 (Wellness), T6 (Testing)

### B3e-T3: Data Transformation Pipeline ✅
Branch: feat/b3e-t3-data-transformation → PR #20
Status: ✅ Completed and Merged
Contract: No API changes - transformation utilities only
Policies: Uses existing athlete_id RLS on sessions table
Core Functionality: 
  - Complete transformation pipeline (6 core utilities)
  - Sport mapping: 9 GarminDB sports → 5 Momentom categories with fuzzy matching
  - Performance metrics extraction (HR, power, pace, environmental data)
  - Data quality validation targeting 97% success rate
  - UTC timezone conversion and date normalization
  - Batch processing with progress tracking and error handling
Verification:
  - ✅ TypeScript compilation: lib/garmin/*.ts (no errors)
  - ✅ Unit tests: 60 test cases across 4 test suites (100% pass rate)
  - ✅ Sport mapping: All 9 GarminDB sports correctly mapped
  - ✅ Data validation: Business logic and range validation working
  - ✅ Transformation pipeline: Complete GarminDB → Momentom conversion
  - ✅ UUID generation: Proper session ID creation with metadata
  - ✅ Error handling: Comprehensive validation and transformation error handling
CI: TypeScript ✅ Jest ✅ (60/60 tests passing)
Impact: Enables T4 batch import implementation with reliable data transformation
Next: T4 (Batch Import Implementation) using these transformation utilities

**C0 Entry:**
```
C0: B3e-T3 - Data Transformation Pipeline Planning
Branch: feat/b3e-t3-data-transformation → PR #20
Plan: Build transformation utilities to convert GarminDB SQLite data to Momentom session format using T2 schema mappings. Core functions: sport mapping (9→5), metrics extraction, timezone handling, data validation.
```

**C5 Entry:** 
```
B3e-T3: Data Transformation Pipeline ✅ (as documented above)
```

### B3e-T5: Wellness Data Integration ✅
Branch: feat/b3e-t5-wellness-integration → PR #22
Status: ✅ Completed and Ready for Review
Contract: New wellness_data table and API endpoints - no existing schema changes
Policies: JWT → athlete_id with RLS enforcement, ETag caching on GET endpoints
Core Functionality:
  - Complete wellness data integration infrastructure with readiness API enhancement
  - API endpoints: POST /api/garmin/wellness-import (import), GET (status/config)
  - Enhanced readiness: GET /api/readiness with optional wellness context
  - Data processing: Sleep, RHR, weight transformation with quality scoring and trend analysis
  - Database schema: New wellness_data table with proper RLS policies and optimized indexes
  - Batch processing: Efficient handling of ~1,500 wellness records with progress tracking
Verification:
  - ✅ TypeScript compilation: Clean build with proper type safety
  - ✅ Unit tests: 56 test cases across 3 test suites (100% pass rate)
  - ✅ API endpoints: POST and GET routes with proper auth and error handling
  - ✅ Data transformation: Sleep, RHR, weight processing with validation
  - ✅ Build verification: Successful Next.js production build
  - ✅ Performance targets: <30 seconds for ~1,500 wellness records
CI: Jest ✅ (56/56 tests passing) Next.js Build ✅
Impact: Enables comprehensive wellness data integration, enhances readiness calculations with historical context
Next: T6 (Testing and Validation) with production GarminDB data

**C0 Entry:**
```
C0: B3e-T5 - Wellness Data Integration Planning
Branch: feat/b3e-t5-wellness-integration → PR #22
Plan: Import wellness data (sleep, RHR, weight) from GarminDB monitoring databases and integrate with readiness API. Core functions: wellness data transformation, monitoring database reader, readiness API enhancement, <30 second processing target for ~1,500 wellness records.
```

### B3e-T6: Scheduled Sync and Automation (C0 Planning)

**C0 Entry:**
```
C0: B3e-T6 - Scheduled Sync and Automation Planning
Branch: feat/b3e-t6-scheduled-sync → PR TBD
Plan: Add automated sync scheduling and manual sync UI controls to complete GarminDB integration. Core functions: cron job scheduler for daily/weekly sync, sync configuration management, sync history tracking, dashboard UI for manual triggers and monitoring. Database: garmin_sync_config and garmin_sync_history tables. APIs: sync config management, manual sync trigger, sync history. Dependencies: node-cron library, existing bulk-import/wellness-import APIs (T4/T5). Target: <5 minute setup time, reliable daily automation.
```

---

## Historical Entries (Superseded)

### B3: UX Wiring to Live GETs - Original Scope (Superseded)
Status: 📝 Draft (re-scoped into B3a/B3b/B3c/B3d)
Original Scope: Wire existing UI components to live GET endpoints, add loading/error/empty states, capture screenshots with real data
Superseded By: B3a (infrastructure), B3b (cockpit), B3c (calendar), B3d (progress), B3e (Garmin integration)
Reason: Scope too large for single task, better managed as separate focused tasks