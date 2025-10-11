# Project Status

Update this file per merged task.

## Current
- Cycle: **2**
- Sprint: **1.5** (Foundation & User Lifecycle)
- Active focus: **Specification Phase Complete → Ready for Implementation**
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

### Task 1.5-B: Wire Onboarding UI to Storage
- *Agent: M_PR (implementation) + UX/UI*
- *Status: Ready to Start (blocked on 1.5-A and 1.5-C implementation)*
- *Dependencies: Requires auth middleware + athlete schema deployed*

### Task 1.5-D: Expand Workout Library (50-100 workouts)
- *Agent: Sports Science*
- *Status: ⏳ In Progress - Awaiting Deliverable*
- *Expected: Expanded workouts.json (50-100 workouts across disciplines)*

## Sprint 1.5 - Implementation Phase (Next)

**Ready to Start:**
- Day 1: RLS policies + Athlete schema migrations
- Day 2: Auth middleware (JWT verification)
- Day 3: Auth routes (signup, login, logout)
- Day 4-5: Onboarding UI wiring (after Sports Science delivers)
- Day 6: Session management
- Day 7-8: GarminDB sync

**Blocked Until Sports Science Completes:**
- Workout library seeding (Task 1.5-D)
- Full onboarding flow testing

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

**Specifications:** ✅ 3/3 Complete (PA delivered all tasks)
**Implementation:** ⏳ 0/6 Started (awaiting Sports Science + kickoff)
**Blockers:** Sports Science Task 1.5-D (workout library expansion)

**Next Action:** Review Sports Science deliverable, then start implementation Phase 1