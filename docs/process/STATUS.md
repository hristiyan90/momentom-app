# Project Status

Update this file per merged task.

## Current
- Cycle: **2**
- Sprint: **1.5** (Foundation & User Lifecycle)
- Active focus: **Sprint 1.5 Planning & Specification Phase**
- Planning Doc: [Sprint 1.5 Plan](sprints/cycle-2-sprint-1-5-plan.md)

## Recently completed
- A1–A4 infra, policies in place
- B1 — Workout Library v0 (seed + GET)
- B2 — Manual Workout Upload (TCX/GPX) ✅
- B3a — State Management Infrastructure ✅
- B3b — Cockpit UI wiring ✅
- B3c — Calendar UI wiring ✅
- B3e — GarminDB Data Integration (T1-T6) ✅

## Sprint 1.5 - NOW (In Planning)
- **Task 1.5-A**: Complete Supabase Auth integration
  - *Agent: Product Architect (spec) → M_PR (implementation)*
  - *Status: Awaiting PA specification*
  
- **Task 1.5-C**: Athlete data schema expansion
  - *Agent: Product Architect (spec) → M_PR (implementation)*
  - *Status: Awaiting PA specification*
  
- **Task 1.5-B**: Wire onboarding UI to storage
  - *Agent: M_PR (implementation) + UX/UI*
  - *Status: Blocked by 1.5-A and 1.5-C*
  
- **Task 1.5-D**: Expand workout library (50-100 workouts)
  - *Agent: Sports Science (spec) → M_PR (seeding)*
  - *Status: Awaiting Sports Science deliverable*
  
- **Task 1.5-E/F/G**: Garmin daily sync (wellness + workouts)
  - *Agent: Product Architect (strategy) → M_PR (implementation)*
  - *Status: Awaiting PA decision*

## Sprint 2 - NEXT (Planned)
- Plan generation engine (deterministic, library-based)
- Live UI wiring (Cockpit, Calendar with real data)
- Data quality & session lifecycle
- See: [Sprint 1.5 Plan](sprints/cycle-2-sprint-1-5-plan.md)

## Sprint 3 - LATER (Planned)
- Readiness manual entry, workout export
- C2 Observability, C3 CI pipeline (basic)
- GTM alpha cohort prep
- See: [Sprint 1.5 Plan](sprints/cycle-2-sprint-1-5-plan.md)

## Parked Items
- C1: Coach Tom v0 (defer to Sprint 4)
- C4: Vercel env hygiene (defer to Sprint 4)
- B3d: Progress UI wiring (defer to Sprint 2)