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
- **Accessible UX**: Clean, mobile-first flows; fair pricing

## Core Pillars

1. **Workout & Plan Builder**
   - Phase structuring (base/build/peak/taper), race priorities (A/B/C)
   - MVP: library-backed sessions (time-based segments), deterministic mapping
2. **Adaptations Engine**
   - Inputs: readiness (HRV/RHR/sleep), compliance, blockers
   - Actions: trim intensity/volume, swap, or rest; protect taper & A-races
3. **Coach Tom (AI)**
   - Explains changes; answers “why” and “what now”; human-tone coach layer

## Success Signals

- D1: 80%+ of testers complete 4+ weeks with ≥85% session compliance
- D2: ≥70% of adaptation decisions understood (self-reported “clear why”)
- D3: <2% weekly API contract breaks (CI-gated)

## Guardrails

- **Contracts frozen** per OpenAPI 1.0.1
- **RLS** on all athlete data
- **Strong ETags**; **keyset** pagination; **idempotent** POSTs