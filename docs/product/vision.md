# Vision

## Why

Athletes don’t live in lab conditions. Momentom adapts plans to **life**, **readiness**, and
**constraints**, with clarity and fairness.

## Vision Statement

Build the **adaptive, athlete-first coaching** platform that merges **sports science** and **AI**
to help athletes train consistently, recover better, and perform with confidence.

## Differentiators (USP)

- **Transparent Adaptation**: Clear *reason codes* and guardrails (not a black box)
- **Holistic**: Training + Readiness + Fuel + (later) Mindset in one place
- **Evidence-Led**: Bands/thresholds grounded in consensus research
- **Athlete-first UX** — clean, mobile-first, science without jargon

## Core Pillars

1. **Workout & Plan Builder**
   - Phase structuring (base/build/peak/taper), race priorities (A/B/C)
   - MVP: library-backed sessions (time-based segments), deterministic mapping
2. **Adaptations Engine**
   - Inputs: readiness (HRV/RHR/sleep), compliance, blockers
   - Actions: trim intensity/volume, swap, or rest; protect taper & A-races
3. **Coach Tom (AI)**
   - Explains *why* changes happen, answers questions, motivates with a human tone.

## MVP Scope (Cycle-2 focus)
- Auth & onboarding (preferences, races; **Supabase JWT** in prod)
- Readiness surface (manual inputs allowed; partial-data hygiene)
- **Workout Library v0** (run/bike/swim/strength; time-based segments)
- Plan view + **adaptations preview/decision** (reason codes, guardrails)
- **Manual workout upload** (.TCX/.GPX) → staging → normalized session
- **Workout export** (.TCX and **.ZWO** for bike) *(Sprint-2 item)*
- Caching & perf: **strong ETag** on GETs; **keyset pagination**; **RLS**-scoped reads

## Success Signals (definition of “on track”)
- **D1:** ≥80% of testers complete 4+ weeks with ≥85% session compliance  
- **D2:** ≥70% of adaptation decisions marked “I understand why” (self-report)  
- **D3:** <2% weekly API contract breaks (CI-gated)

## Architectural Guardrails
- **Contracts frozen** per OpenAPI 1.0.1 (no unreviewed field changes)
- **RLS** on all athlete data
- **Strong ETags** from canonical JSON; **keyset** pagination
- **Idempotent** POSTs on preview/decision flows

## Out of Scope (for MVP)
- Wearable integrations (Garmin/Apple/Strava) → staged later
- Advanced ML personalization (beyond rules) → after MVP