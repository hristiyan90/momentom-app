# Cycle 2, Sprint 1.5: Foundation & User Lifecycle

**Status:** 🔵 In Planning  
**Start Date:** October 10, 2025  
**Expected Duration:** 2-3 weeks  
**Dependencies:** Sprint 1 (B3e) complete  

**Strategic Decision:** Reorganized from original Sprint 1 scope to focus on 
user lifecycle foundation before advancing to observability/AI features.

---

# Momentum App: NOW, NEXT, LATER Sprint Plan

**Cycle 2 Strategic Reorganization**  
*Updated: October 10, 2025*

---

## 📌 Strategic Recommendation

**Move C2 (Observability) and C3 (CI Pipeline - basic scope) to Sprint 3.**

### Rationale:
- You'll be generating your first real training plan and syncing daily Garmin data in Sprint 2
- Better logging = faster debugging when plan generation or data sync issues occur
- Contract tests = prevents accidentally breaking your own UI during rapid iteration
- These are **developer experience** improvements that accelerate the critical dogfooding phase
- Minimal scope (structured logs + basic smoke tests) doesn't significantly extend Sprint 3

---

## **NOW — Sprint 1.5 (Foundation & User Lifecycle)**

### Priority 1: User Authentication & Data Storage

**Task 1.5-A: Complete Supabase Auth integration**
- *Specialists: Product Architect + Full-Stack Dev*
- *Dependencies: Builds on A4 foundation*
- *Output: Working signup/login/session management, athlete_id mapping, RLS policies*

**Task 1.5-C: Athlete data schema expansion**
- *Specialists: Product Architect + Sports Science*
- *Dependencies: Must complete before data storage possible*
- *Output: Tables - `athlete_profiles`, `athlete_preferences`, `race_calendar`, `athlete_constraints` with full RLS*

**Task 1.5-B: Wire existing onboarding UI to storage**
- *Specialists: Full-Stack Dev + UX/UI*
- *Dependencies: Blocked by 1.5-A (auth) and 1.5-C (schema)*
- *Output: Both quick and advanced onboarding flows persist to DB correctly*

### Priority 2: Workout Library Expansion

**Task 1.5-D: Expand workout library to 50-100 workouts**
- *Specialists: Sports Science Lead*
- *Dependencies: None - runs in parallel*
- *Scope:*
  - **Run:** Base endurance, tempo, intervals, long run, recovery, hill work
  - **Bike:** Endurance, sweet-spot, threshold, VO2max, recovery, brick prep
  - **Swim:** Technique, threshold, intervals, recovery, open water prep
  - **Strength:** Foundation, power, maintenance, injury prevention
- *Output: Updated `workouts.json` + seed script, validated structure*

### Priority 3: Garmin Daily Sync Foundation

**Task 1.5-E: Garmin Connect API OR GarminDB export pipeline**
- *Specialists: Product Architect + Full-Stack Dev*
- *Dependencies: None - runs in parallel*
- *Approach: Start with manual GarminDB export (already have Fenix 8 data), evolve to API later*
- *Output: Daily sync script/job for wellness + workout data*

**Task 1.5-F: Wellness data ingestion pipeline**
- *Specialists: Full-Stack Dev*
- *Dependencies: Requires 1.5-E foundation*
- *Scope: HRV, RHR, sleep, stress, body battery*
- *Output: Data flowing to `readiness_daily` table with data quality flags*

**Task 1.5-G: Workout data ingestion pipeline**
- *Specialists: Full-Stack Dev*
- *Dependencies: Requires 1.5-E foundation*
- *Scope: Activities → sessions (FIT/TCX parsing)*
- *Output: Workout data in `sessions` table with normalized structure*

### Sprint 1.5 Exit Criteria
- ✅ Can create account, complete onboarding (quick & advanced), data persists correctly
- ✅ 50+ workouts in library with proper zone/duration/structure data
- ✅ Daily Garmin wellness data (HRV, RHR, sleep, stress) appears in `readiness_daily`
- ✅ Daily Garmin workouts appear in `sessions` table with normalized structure
- ✅ All schemas documented with RLS policies tested with your account

---

## **NEXT — Sprint 2 (Plan Generation & Live UI)**

### Priority 1: Plan Generation Engine

**Task 2-A: Plan generation rules engine**
- *Specialists: Sports Science + AI/ML + Product Architect*
- *Dependencies: Requires 1.5-C (athlete data) and 1.5-D (workout library)*
- *Scope: Deterministic algorithm maps (athlete profile + race goals + available hours + current fitness) → periodized weekly structure*
- *Output: Core logic that assembles plans from library workouts*

**Task 2-B: Plan schema & API endpoints**
- *Specialists: Product Architect + Full-Stack Dev*
- *Dependencies: Requires 2-A algorithm design*
- *Output:*
  - Tables: `training_plans`, `plan_phases`, `plan_weeks`, `plan_sessions`
  - Endpoints: `POST /api/plan/generate`, `GET /api/plan`, `PATCH /api/plan/sessions/:id`
  - Contract versioning to protect existing endpoints

**Task 2-C: Plan generation trigger & initial plan creation**
- *Specialists: Full-Stack Dev*
- *Dependencies: Requires 2-B*
- *Output: Post-onboarding plan generation, "Generate New Plan" UI action*

### Priority 2: Live Data UI Wiring (Revisit B3)

**Task 2-D: Cockpit UI with live readiness data**
- *Specialists: Full-Stack Dev + UX/UI*
- *Dependencies: Requires 1.5-F (wellness data flowing)*
- *Output: Cockpit shows YOUR actual HRV/RHR/sleep/readiness score with data quality indicators*

**Task 2-E: Calendar UI with generated plan + actual workouts**
- *Specialists: Full-Stack Dev + UX/UI*
- *Dependencies: Requires 2-C (plan generation) and 1.5-G (workout sync)*
- *Output:*
  - Calendar shows planned sessions from generated plan
  - Completed workouts from Garmin overlaid/compared
  - Visual indicators for compliance, missed sessions, adaptations needed

**Task 2-F: Training page with session detail & comparison**
- *Specialists: Full-Stack Dev + UX/UI*
- *Dependencies: Requires 2-E*
- *Output: Click session → see planned vs actual, load metrics, compliance status*

### Priority 3: Data Quality & Edge Cases

**Task 2-G: Partial data handling UI patterns**
- *Specialists: UX/UI + Full-Stack Dev*
- *Dependencies: Requires 2-D (live data flowing)*
- *Output: Warning indicators, manual entry prompts when wellness data missing*

**Task 2-H: Session status lifecycle**
- *Specialists: Product Architect + Full-Stack Dev*
- *Dependencies: Requires 2-E*
- *Output: State machine for session progression (planned → completed → analyzed), status updates from Garmin sync*

### Sprint 2 Exit Criteria
- ✅ Generated training plan visible in calendar (4-8 weeks with phase indicators)
- ✅ Daily Garmin workouts appear alongside planned sessions with compliance status
- ✅ Cockpit shows live readiness data from Garmin
- ✅ Can compare planned vs actual for any completed workout
- ✅ Data quality indicators show when wellness data incomplete
- ✅ Session status properly transitions through lifecycle

---

## **NEXT — Sprint 3 (Polish, Tooling & Beta Prep)**

### From Original Sprint 2 Scope

**Readiness manual entry UI**
- *Specialists: UX/UI + Full-Stack Dev*
- *Scope: HRV, RHR, sleep stages, soreness - fallback when Garmin data missing*

**Workout export (.TCX and .ZWO)**
- *Specialists: Full-Stack Dev + Sports Science*
- *Scope: Generate downloadable files from library items and planned sessions*

**Races & Life Blockers from DB**
- *Specialists: Full-Stack Dev + AI/ML*
- *Scope: Feed existing adaptation rules (no logic changes yet)*

**GTM alpha cohort prep (planning only)**
- *Specialists: Market Strategist + Ops Orchestrator*
- *Scope: Define 10-25 testers, consent forms, feedback loops - no launch yet*

### From Later (Moved to Sprint 3) ⭐ RECOMMENDED

**C2: Observability sink (basic scope)**
- *Specialists: Full-Stack Dev + Ops Orchestrator*
- *Scope:*
  - Structured JSON logs with `X-Request-Id` correlation
  - Basic redaction (tokens, athlete_id in logs)
  - `LOG_LEVEL` environment variable
- *Why now: Better debugging during dogfooding; catch issues faster*

**C3: CI pipeline (basic scope)**
- *Specialists: Ops Orchestrator + Full-Stack Dev*
- *Scope:*
  - OpenAPI contract diff tests (block on undeclared changes)
  - Basic Newman/Postman smoke tests (auth, plan GET, readiness GET)
  - H1-H4 smoke suite (core happy paths)
- *Why now: Protects against breaking changes during rapid iteration*

### Sprint 3 Exit Criteria
- ✅ Can manually enter readiness data when Garmin sync unavailable
- ✅ Can export planned workouts as .TCX (all sports) and .ZWO (bike only)
- ✅ Race calendar and life blockers stored in DB, accessible to rules engine
- ✅ Alpha cohort defined with consent/feedback process documented
- ✅ Structured logs with request correlation working
- ✅ CI catches contract violations and basic smoke test failures

---

## **LATER — Sprint 4+ (Adaptations, Beta, Scale)**

### Sprint 4: Adaptations & AI Coach

**Advanced Adaptations Engine**
- *Specialists: AI/ML*
- *Scope: Rule-based plan adjustments (trim intensity/volume based on readiness, swap sessions, protect taper/A-races)*
- *Dependencies: Need 2-4 weeks of YOUR training data + compliance patterns*

**C1: Coach Tom v0 (light)**
- *Specialists: AI/ML + UX/UI*
- *Scope: Chat surface that reads readiness/plan/sessions and explains adaptation outcomes*
- *Dependencies: Requires adaptations engine to have something to explain*

**C4: Vercel env hygiene (full scope)**
- *Specialists: Ops Orchestrator*
- *Scope: Confirm Preview vs Prod secrets, document team workflow (Preview checks, Prod gates)*

**Advanced Plan Builder UI**
- *Specialists: Full-Stack Dev + UX/UI + Sports Science*
- *Scope: Manual plan editing, drag-drop sessions, custom workout creation*

---

### Sprint 5: Beta Preparation

**Privacy/GDPR compliance**
- *Specialists: Ops Orchestrator + Full-Stack Dev*
- *Scope: Data deletion, retention policies, user-initiated export*

**Analytics & telemetry**
- *Specialists: Ops Orchestrator + Full-Stack Dev*
- *Scope: Request/trace IDs, opt-in tracking, usage metrics*

**Advanced CI suite**
- *Specialists: Ops Orchestrator + Full-Stack Dev*
- *Scope: H5-H7 edge cases, comprehensive E2E tests, status badges*

**Additional wearables integrations**
- *Specialists: Full-Stack Dev*
- *Scope: Apple Health, Strava, Wahoo, COROS*

---

### Sprint 6: Closed Beta Launch

**Closed beta execution**
- *Specialists: Product Architect + Market Strategist + Ops Orchestrator*
- *Scope: 10-25 tester cohort, bug triage, feedback loops*

**Performance optimization**
- *Specialists: Full-Stack Dev*
- *Scope: Based on multi-user load patterns*

**Mobile-first enhancements**
- *Specialists: UX/UI + Full-Stack Dev*
- *Scope: Based on beta tester feedback and usage analytics*

---

### Sprint 7+: ML & Scale

**ML-assisted plan personalization**
- *Specialists: AI/ML*
- *Scope: Progressive disclosure beyond rule-based system*

**Native mobile app decision**
- *Specialists: Ops Orchestrator + UX/UI + Full-Stack Dev*
- *Scope: PWA vs native based on beta feedback*

**Open beta expansion**
- *Specialists: Product Architect + Market Strategist*
- *Scope: Broader user cohort, scaling infrastructure*

---

## 🔄 Dependency Flow

### Sprint 1.5 → Sprint 2
```
Auth + Schema (1.5-A, 1.5-C) ──→ Plan Generation (2-A, 2-B, 2-C)
Workout Library (1.5-D) ──────────┘

Wellness Pipeline (1.5-F) ───────→ Cockpit UI (2-D)

Workout Pipeline (1.5-G) ────┐
                             ├──→ Calendar UI (2-E)
Plan Generation (2-C) ───────┘
```

### Sprint 2 → Sprint 3
```
Live UI (2-D, 2-E, 2-F) ──→ Manual Entry Fallbacks
Session Lifecycle (2-H) ───→ Export Workflows
Plan Generation (2-C) ─────→ Races & Blockers Integration
```

### Sprint 3 → Sprint 4
```
Races & Blockers ────────────→ Adaptations Engine (4)
Your Training Data (Sprint 2-3) ┘

Adaptations Engine ──────────→ Coach Tom (4)
```

### Sprint 4 → Sprint 5 → Sprint 6
```
Adaptations Working ──→ GDPR + Analytics ──→ Closed Beta
Observability (Sprint 3) ┘              └──→ Multi-user Testing
```

---

## ⚠️ Critical Notes

1. **Time is not a constraint** - focus on correct sequencing of dependencies
2. **Historic data not needed** - only forward-looking Garmin sync from Fenix 8
3. **Onboarding UI exists** - both quick and advanced versions already developed
4. **Workout library exists** - Sports Science has initial set, needs expansion to 50-100
5. **Single user focus** - optimize for your dogfooding experience through Sprint 4

---

# Momentum App: NOW, NEXT, LATER Sprint Plan

**Cycle 2 Strategic Reorganization**  
**Updated: October 10, 2025**

---

## 📌 Strategic Recommendation

**Move C2 (Observability) and C3 (CI Pipeline - basic scope) to Sprint 3.**

### Rationale:
- You'll be generating your first real training plan and syncing daily Garmin data in Sprint 2
- Better logging = faster debugging when plan generation or data sync issues occur
- Contract tests = prevents accidentally breaking your own UI during rapid iteration
- These are **developer experience** improvements that accelerate the critical dogfooding phase
- Minimal scope (structured logs + basic smoke tests) doesn't significantly extend Sprint 3

---

## 🔄 Implementation Approach

**This sprint plan works with your existing Cursor workflow:**
- Specialists (PA, Sports Science) create specifications
- YOU consolidate specifications
- M_PR briefs Cursor with consolidated specs
- Cursor follows **CURSOR_BOOT.md** (C0→C1→C5 process) for implementation
- Each task goes through: Context Digest → Plan Approval → Implementation → Verification

**Reference your workflow docs:**
- `docs/process/CURSOR_BOOT.md` - Complete C0→C1→C5 process
- `docs/process/TASK_FLOW.md` - Master task stages
- `docs/process/MULTI_AGENT_WORKFLOW.md` - Agent coordination
- `docs/process/AUTO_LOG.md` - Decision log and tracking

---

## **NOW — Sprint 1.5 (Foundation & User Lifecycle)**

### Priority 1: User Authentication & Data Storage

**Task 1.5-A: Complete Supabase Auth integration**
- *Specialists: Product Architect + M_PR (via Cursor)*
- *Dependencies: Builds on A4 foundation*
- *Cursor Process: C0 (plan) → C1 (implement) → C5 (verify)*
- *Output: Working signup/login/session management, athlete_id mapping, RLS policies*

**Task 1.5-C: Athlete data schema expansion**
- *Specialists: Product Architect + Sports Science*
- *Dependencies: Must complete before data storage possible*
- *Cursor Process: C0 → C1 → C5*
- *Output: Tables - `athlete_profiles`, `athlete_preferences`, `race_calendar`, `athlete_constraints` with full RLS*

**Task 1.5-B: Wire existing onboarding UI to storage**
- *Specialists: M_PR (via Cursor) + UX/UI*
- *Dependencies: Blocked by 1.5-A (auth) and 1.5-C (schema)*
- *Cursor Process: C0 → C1 → C5*
- *Output: Both quick and advanced onboarding flows persist to DB correctly*

### Priority 2: Workout Library Expansion

**Task 1.5-D: Expand workout library to 50-100 workouts**
- *Specialists: Sports Science Lead*
- *Dependencies: None - runs in parallel*
- *Implementation: Sports Science creates, M_PR seeds via Cursor*
- *Scope:*
  - **Run:** Base endurance, tempo, intervals, long run, recovery, hill work
  - **Bike:** Endurance, sweet-spot, threshold, VO2max, recovery, brick prep
  - **Swim:** Technique, threshold, intervals, recovery, open water prep
  - **Strength:** Foundation, power, maintenance, injury prevention
- *Output: Updated `workouts.json` + seed script, validated structure*

### Priority 3: Garmin Daily Sync Foundation

**Task 1.5-E: Garmin Connect API OR GarminDB export pipeline**
- *Specialists: Product Architect + M_PR (via Cursor)*
- *Dependencies: None - runs in parallel*
- *Approach: Start with manual GarminDB export (already have Fenix 8 data), evolve to API later*
- *Cursor Process: C0 → C1 → C5*
- *Output: Daily sync script/job for wellness + workout data*

**Task 1.5-F: Wellness data ingestion pipeline**
- *Specialists: M_PR (via Cursor)*
- *Dependencies: Requires 1.5-E foundation*
- *Scope: HRV, RHR, sleep, stress, body battery*
- *Cursor Process: C0 → C1 → C5*
- *Output: Data flowing to `readiness_daily` table with data quality flags*

**Task 1.5-G: Workout data ingestion pipeline**
- *Specialists: M_PR (via Cursor)*
- *Dependencies: Requires 1.5-E foundation*
- *Scope: Activities → sessions (FIT/TCX parsing)*
- *Cursor Process: C0 → C1 → C5*
- *Output: Workout data in `sessions` table with normalized structure*

### Sprint 1.5 Exit Criteria
- ✅ Can create account, complete onboarding (quick & advanced), data persists correctly
- ✅ 50+ workouts in library with proper zone/duration/structure data
- ✅ Daily Garmin wellness data (HRV, RHR, sleep, stress) appears in `readiness_daily`
- ✅ Daily Garmin workouts appear in `sessions` table with normalized structure
- ✅ All schemas documented with RLS policies tested with your account

---

## **NEXT — Sprint 2 (Plan Generation & Live UI)**

### Priority 1: Plan Generation Engine

**Task 2-A: Plan generation rules engine**
- *Specialists: Sports Science + AI/ML + Product Architect*
- *Dependencies: Requires 1.5-C (athlete data) and 1.5-D (workout library)*
- *Cursor Process: C0 → C1 → C5*
- *Scope: Deterministic algorithm maps (athlete profile + race goals + available hours + current fitness) → periodized weekly structure*
- *Output: Core logic that assembles plans from library workouts*

**Task 2-B: Plan schema & API endpoints**
- *Specialists: Product Architect + M_PR (via Cursor)*
- *Dependencies: Requires 2-A algorithm design*
- *Cursor Process: C0 → C1 → C5*
- *Output:*
  - Tables: `training_plans`, `plan_phases`, `plan_weeks`, `plan_sessions`
  - Endpoints: `POST /api/plan/generate`, `GET /api/plan`, `PATCH /api/plan/sessions/:id`
  - Contract versioning to protect existing endpoints

**Task 2-C: Plan generation trigger & initial plan creation**
- *Specialists: M_PR (via Cursor)*
- *Dependencies: Requires 2-B*
- *Cursor Process: C0 → C1 → C5*
- *Output: Post-onboarding plan generation, "Generate New Plan" UI action*

### Priority 2: Live Data UI Wiring (Revisit B3)

**Task 2-D: Cockpit UI with live readiness data**
- *Specialists: M_PR (via Cursor) + UX/UI*
- *Dependencies: Requires 1.5-F (wellness data flowing)*
- *Cursor Process: C0 → C1 → C5*
- *Output: Cockpit shows YOUR actual HRV/RHR/sleep/readiness score with data quality indicators*

**Task 2-E: Calendar UI with generated plan + actual workouts**
- *Specialists: M_PR (via Cursor) + UX/UI*
- *Dependencies: Requires 2-C (plan generation) and 1.5-G (workout sync)*
- *Cursor Process: C0 → C1 → C5*
- *Output:*
  - Calendar shows planned sessions from generated plan
  - Completed workouts from Garmin overlaid/compared
  - Visual indicators for compliance, missed sessions, adaptations needed

**Task 2-F: Training page with session detail & comparison**
- *Specialists: M_PR (via Cursor) + UX/UI*
- *Dependencies: Requires 2-E*
- *Cursor Process: C0 → C1 → C5*
- *Output: Click session → see planned vs actual, load metrics, compliance status*

### Priority 3: Data Quality & Edge Cases

**Task 2-G: Partial data handling UI patterns**
- *Specialists: UX/UI + M_PR (via Cursor)*
- *Dependencies: Requires 2-D (live data flowing)*
- *Cursor Process: C0 → C1 → C5*
- *Output: Warning indicators, manual entry prompts when wellness data missing*

**Task 2-H: Session status lifecycle**
- *Specialists: Product Architect + M_PR (via Cursor)*
- *Dependencies: Requires 2-E*
- *Cursor Process: C0 → C1 → C5*
- *Output: State machine for session progression (planned → completed → analyzed), status updates from Garmin sync*

### Sprint 2 Exit Criteria
- ✅ Generated training plan visible in calendar (4-8 weeks with phase indicators)
- ✅ Daily Garmin workouts appear alongside planned sessions with compliance status
- ✅ Cockpit shows live readiness data from Garmin
- ✅ Can compare planned vs actual for any completed workout
- ✅ Data quality indicators show when wellness data incomplete
- ✅ Session status properly transitions through lifecycle

---

## **NEXT — Sprint 3 (Polish, Tooling & Beta Prep)**

### From Original Sprint 2 Scope

**Readiness manual entry UI**
- *Specialists: UX/UI + M_PR (via Cursor)*
- *Cursor Process: C0 → C1 → C5*
- *Scope: HRV, RHR, sleep stages, soreness - fallback when Garmin data missing*

**Workout export (.TCX and .ZWO)**
- *Specialists: M_PR (via Cursor) + Sports Science*
- *Cursor Process: C0 → C1 → C5*
- *Scope: Generate downloadable files from library items and planned sessions*

**Races & Life Blockers from DB**
- *Specialists: M_PR (via Cursor) + AI/ML*
- *Cursor Process: C0 → C1 → C5*
- *Scope: Feed existing adaptation rules (no logic changes yet)*

**GTM alpha cohort prep (planning only)**
- *Specialists: Market Strategist + Ops Orchestrator*
- *Scope: Define 10-25 testers, consent forms, feedback loops - no launch yet*

### From Later (Moved to Sprint 3) ⭐ RECOMMENDED

**C2: Observability sink (basic scope)**
- *Specialists: M_PR (via Cursor) + Ops Orchestrator*
- *Cursor Process: C0 → C1 → C5*
- *Scope:*
  - Structured JSON logs with `X-Request-Id` correlation
  - Basic redaction (tokens, athlete_id in logs)
  - `LOG_LEVEL` environment variable
- *Why now: Better debugging during dogfooding; catch issues faster*

**C3: CI pipeline (basic scope)**
- *Specialists: Ops Orchestrator + M_PR (via Cursor)*
- *Cursor Process: C0 → C1 → C5*
- *Scope:*
  - OpenAPI contract diff tests (block on undeclared changes)
  - Basic Newman/Postman smoke tests (auth, plan GET, readiness GET)
  - H1-H4 smoke suite (core happy paths)
- *Why now: Protects against breaking changes during rapid iteration*

### Sprint 3 Exit Criteria
- ✅ Can manually enter readiness data when Garmin sync unavailable
- ✅ Can export planned workouts as .TCX (all sports) and .ZWO (bike only)
- ✅ Race calendar and life blockers stored in DB, accessible to rules engine
- ✅ Alpha cohort defined with consent/feedback process documented
- ✅ Structured logs with request correlation working
- ✅ CI catches contract violations and basic smoke test failures

---

## **LATER — Sprint 4+ (Adaptations, Beta, Scale)**

### Sprint 4: Adaptations & AI Coach

**Advanced Adaptations Engine**
- *Specialists: AI/ML*
- *Scope: Rule-based plan adjustments (trim intensity/volume based on readiness, swap sessions, protect taper/A-races)*
- *Dependencies: Need 2-4 weeks of YOUR training data + compliance patterns*

**C1: Coach Tom v0 (light)**
- *Specialists: AI/ML + UX/UI*
- *Scope: Chat surface that reads readiness/plan/sessions and explains adaptation outcomes*
- *Dependencies: Requires adaptations engine to have something to explain*

**C4: Vercel env hygiene (full scope)**
- *Specialists: Ops Orchestrator*
- *Scope: Confirm Preview vs Prod secrets, document team workflow (Preview checks, Prod gates)*

**Advanced Plan Builder UI**
- *Specialists: M_PR (via Cursor) + UX/UI + Sports Science*
- *Scope: Manual plan editing, drag-drop sessions, custom workout creation*

---

### Sprint 5: Beta Preparation

**Privacy/GDPR compliance**
- *Specialists: Ops Orchestrator + M_PR (via Cursor)*
- *Scope: Data deletion, retention policies, user-initiated export*

**Analytics & telemetry**
- *Specialists: Ops Orchestrator + M_PR (via Cursor)*
- *Scope: Request/trace IDs, opt-in tracking, usage metrics*

**Advanced CI suite**
- *Specialists: Ops Orchestrator + M_PR (via Cursor)*
- *Scope: H5-H7 edge cases, comprehensive E2E tests, status badges*

**Additional wearables integrations**
- *Specialists: M_PR (via Cursor)*
- *Scope: Apple Health, Strava, Wahoo, COROS*

---

### Sprint 6: Closed Beta Launch

**Closed beta execution**
- *Specialists: Product Architect + Market Strategist + Ops Orchestrator*
- *Scope: 10-25 tester cohort, bug triage, feedback loops*

**Performance optimization**
- *Specialists: M_PR (via Cursor)*
- *Scope: Based on multi-user load patterns*

**Mobile-first enhancements**
- *Specialists: UX/UI + M_PR (via Cursor)*
- *Scope: Based on beta tester feedback and usage analytics*

---

### Sprint 7+: ML & Scale

**ML-assisted plan personalization**
- *Specialists: AI/ML*
- *Scope: Progressive disclosure beyond rule-based system*

**Native mobile app decision**
- *Specialists: Ops Orchestrator + UX/UI + M_PR (via Cursor)*
- *Scope: PWA vs native based on beta feedback*

**Open beta expansion**
- *Specialists: Product Architect + Market Strategist*
- *Scope: Broader user cohort, scaling infrastructure*

---

## 🔄 Dependency Flow

### Sprint 1.5 → Sprint 2
```
Auth + Schema (1.5-A, 1.5-C) ──→ Plan Generation (2-A, 2-B, 2-C)
Workout Library (1.5-D) ──────────┘

Wellness Pipeline (1.5-F) ───────→ Cockpit UI (2-D)

Workout Pipeline (1.5-G) ────┐
                             ├──→ Calendar UI (2-E)
Plan Generation (2-C) ───────┘
```

### Sprint 2 → Sprint 3
```
Live UI (2-D, 2-E, 2-F) ──→ Manual Entry Fallbacks
Session Lifecycle (2-H) ───→ Export Workflows
Plan Generation (2-C) ─────→ Races & Blockers Integration
```

### Sprint 3 → Sprint 4
```
Races & Blockers ────────────→ Adaptations Engine (4)
Your Training Data (Sprint 2-3) ┘

Adaptations Engine ──────────→ Coach Tom (4)
```

### Sprint 4 → Sprint 5 → Sprint 6
```
Adaptations Working ──→ GDPR + Analytics ──→ Closed Beta
Observability (Sprint 3) ┘              └──→ Multi-user Testing
```

---

## ⚠️ Critical Notes

1. **Time is not a constraint** - focus on correct sequencing of dependencies
2. **Historic data not needed** - only forward-looking Garmin sync from Fenix 8
3. **Onboarding UI exists** - both quick and advanced versions already developed
4. **Workout library exists** - Sports Science has initial set, needs expansion to 50-100
5. **Single user focus** - optimize for your dogfooding experience through Sprint 4
6. **Use your existing Cursor workflow** - CURSOR_BOOT.md (C0→C1→C5) for all implementation
7. **Agent coordination via YOU** - All specifications flow through you as central coordinator

---

## 🎯 Immediate Next Steps

### Sprint 1.5 Kickoff (This Week)

**Product Architect Tasks:**
1. Auth integration spec (review A4, complete RLS)
2. Athlete schema design (profile, preferences, races, constraints)
3. Garmin integration decision (recommend GarminDB export → API later)

**Sports Science Tasks:**
1. Audit existing workout library structure
2. Identify gaps by discipline and training phase
3. Begin expansion to 50+ workouts (prioritize base/build phases)

**Implementation (Cursor via M_PR):**
- Wait for consolidated specifications from YOU
- Follow CURSOR_BOOT.md process (C0→C1→C5) for each task
- Update STATUS.md and AUTO_LOG.md per task completion

---

*This sprint plan integrates with your existing multi-agent workflow documented in CURSOR_BOOT.md, TASK_FLOW.md, and MULTI_AGENT_WORKFLOW.md. All implementation follows the established C0→C1→C5 process.*