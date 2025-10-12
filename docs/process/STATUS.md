# Project Status

Update this file per merged task.

## Current
- Cycle: **2**
- Sprint: **1.5** (Foundation & User Lifecycle)
- Active focus: **Implementation Phase 1: Database Foundation ✅ → Auth Middleware (Next)**
- Planning Doc: [Sprint 1.5 Plan](sprints/cycle-2-sprint-1-5-plan.md)

## Recently completed
- A1–A4 infra, policies in place
- B1 — Workout Library v0 (seed + GET)
- B2 — Manual Workout Upload (TCX/GPX) ✅
- B3a — State Management Infrastructure ✅
- B3b — Cockpit UI wiring ✅
- B3c — Calendar UI wiring ✅
- B3e — GarminDB Data Integration (T1-T6) ✅

## Sprint 1.5 - Specifications Complete ✅

### Task 1.5-A: Complete Supabase Auth Integration
- *Agent: Product Architect ✅*
- *Status: Specification Complete - Ready for Implementation*
- *Deliverables:*
  - Complete RLS policies SQL migration
  - JWT verification middleware spec
  - Auth routes (signup, login, logout, reset)
  - Session management with auto-refresh
  - Newman/Postman test collection
  - Documentation: auth-flow.md, auth-modes.md
- *Decisions: 0005 (Email verification non-blocking)*

### Task 1.5-C: Athlete Data Schema Expansion
- *Agent: Product Architect ✅*
- *Status: Specification Complete - Ready for Implementation*
- *Deliverables:*
  - 4-table schema migration (profiles, preferences, races, constraints)
  - Complete validation rules (age ≥13, date ranges, thresholds)
  - Helper functions (age calc, active constraints, next race)
  - Onboarding data mapping documentation
  - Test data seed scripts
- *Decisions: 0006 (DOB not age), 0007 (table name), 0008 (optional thresholds), 0009 (experience mapping)*

### Task 1.5-E: Garmin Integration Strategy
- *Agent: Product Architect ✅*
- *Status: Specification Complete - Ready for Implementation*
- *Deliverables:*
  - Strategic ADR: Hybrid approach (GarminDB → API)
  - GarminDB sync script specification
  - Sport mapping table
  - Sprint 3 migration path (Garmin Connect API)
  - Documentation: 0010-garmin-integration.md, garmin-setup.md
- *Decisions: 0010 (Hybrid Garmin approach)*

### Task 1.5-D: Expand Workout Library (50-100 workouts)
- *Agent: Sports Science ✅*
- *Status: Complete - 101 Workouts Delivered*
- *Deliverables:*
  - expanded_workout_library.json (101 workouts)
  - workout-library-v1.md (Complete documentation)
  - qa-validation-report.md (100% pass rate)
  - friel-validation-addendum.md (Triathlon protocol alignment)
  - Breakdown: Run (26), Bike (26), Swim (21), Strength (18)
  - All phases covered: Base, Build, Peak, Taper, Recovery
- *Decisions: 0011 (Workout Library v1 Expansion)*

### Task 1.5-B: Wire Onboarding UI to Storage
- *Agent: M_PR (implementation) + UX/UI*
- *Status: Ready to Start*
- *Dependencies: All specifications delivered (1.5-A, 1.5-C, 1.5-D)*

### Task 1.5-F/G: GarminDB Daily Sync (Wellness + Workouts)
- *Agent: M_PR (implementation)*
- *Status: Ready to Start*
- *Dependencies: All specifications delivered (1.5-E, 1.5-D)*

## Sprint 1.5 - Implementation Phase (In Progress)

**Day 1-2: Foundation**
- ✅ RLS policies + Athlete schema migrations (1.5-C) - PR #30
- ⏳ Auth middleware (JWT verification) (1.5-A) - Next

**Day 3-4: Authentication**
- Auth routes (signup, login, logout) (1.5-A)
- Session management implementation

**Day 5-6: User Lifecycle**
- Onboarding UI wiring (1.5-B)
- Workout library database seeding (1.5-D)

**Day 7-8: Garmin Integration**
- GarminDB wellness sync (1.5-F)
- GarminDB workout sync (1.5-G)

## Sprint 2 - NEXT (Planned)
- Plan generation engine (deterministic, library-based)
- Live UI wiring (Cockpit, Calendar with real data)
- Data quality & session lifecycle
- See: [Sprint 1.5 Plan](sprints/cycle-2-sprint-1-5-plan.md)

## Sprint 3 - LATER (Planned)
- Readiness manual entry, workout export
- C2 Observability, C3 CI pipeline (basic)
- GTM alpha cohort prep
- Garmin Connect API migration
- See: [Sprint 1.5 Plan](sprints/cycle-2-sprint-1-5-plan.md)

## Parked Items
- C1: Coach Tom v0 (defer to Sprint 4)
- C4: Vercel env hygiene (defer to Sprint 4)
- B3d: Progress UI wiring (defer to Sprint 2)

---

## 📊 Sprint 1.5 Progress

**Specifications:** ✅ 4/4 Complete (PA: 3/3, Sports Science: 1/1)
**Implementation:** 🏗️ 1/6 Complete
  - ✅ Task 1: Database Foundation (Schema + RLS) - PR #30
  - ⏳ Task 2: Auth Middleware - Next
**Blockers:** None

**Next Action:** Implement Auth Middleware (JWT verification, session management)