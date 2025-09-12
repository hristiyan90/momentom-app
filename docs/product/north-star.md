# Momentom — Product North Star

## Vision
Build the next-gen endurance training platform that adapts to an athlete’s life, body, and goals—combining adaptive planning, readiness, fuelling, and a clear AI coach—so athletes train consistently, recover better, and perform with confidence.

## Unique Selling Points (USP)
- **Adaptive + Transparent**: Real-time plan updates with visible reason codes (not a black box).
- **Holistic by Design**: Training + readiness + fuelling in one timeline.
- **Evidence-based**: Guardrails and guidance grounded in consensus sports science.
- **Athlete-first UX**: Clean, humane, jargon-lite.
- **Privacy-aware**: Minimal, necessary data; export controls; clear caching/security posture.

## Who We Serve (initial)
- Self-coached triathletes (sprint → Ironman) and runners/cyclists who want structure without a coach.
- Comfortable with manual file uploads (TCX/GPX) pre-integrations.

## Problems We Solve
- Static plans that don’t adjust to missed sessions/fatigue.
- Opaque recommendations with no “why”.
- Fragmented tools for training, readiness, and fuelling.

## Product Pillars
1) **Workout & Plan Builder** — periodised plans (base/build/peak/taper), later fully automated.
2) **Adaptations Engine** — readiness, compliance, and constraints drive clear, bounded changes.
3) **Coach Tom (AI)** — explains what changed and why; answers training questions.

## MVP Value (what a new athlete gets)
- A periodised plan scaffold with **predefined workouts** (Library v0).
- Daily **readiness view** with reason codes and safe guardrails.
- **Adaptations preview + decision** with audit trail and headers hardening (H1–H7).
- **Manual data path**: upload completed workout files (TCX/GPX) and manual AM markers (HRV/RHR/sleep/soreness).
- **Fuelling guidance** (pre/during/post) consistent with bands in the app.

## MVP Non-Goals (explicitly out for now)
- Wearable/vendor integrations (Garmin/Apple/Coros/Polar/Wahoo).
- ML personalisation beyond current rules/guardrails.
- Native mobile app (PWA responsiveness only).
- Editable schema changes (OpenAPI 1.0.1 is frozen through Cycle-2).

## Quality Bar (engineering)
- **Contract-first**: OpenAPI 1.0.1; conformance tests + CI gates (OpenAPI diff, Postman, H1–H7).
- **Caching policy**: strong ETags on GET; POSTs no-store; `Vary: X-Client-Timezone` (+ `X-Athlete-Id` in dev override).
- **Auth**: Supabase JWT → `athlete_id`; RLS on all reads/writes; no header overrides in prod.
- **Observability**: correlation/explainability headers; structured logs with redaction.

## Success Criteria (MVP)
- Onboard 10–25 alpha athletes; ≥75% weekly engagement.
- ≥80% “understood why my plan changed” responses.
- ≥90% API contract stability (no diffs triggering CI failures).
- File-based ingest success ≥95% (valid TCX/GPX parsed).

## Glossary (snippets)
- **Readiness**: 0–100 with driver weights that renormalise when data is missing.
- **Monotony/Ramp**: thresholds guarding against over-use and >20% weekly volume jumps.
- **Taper-safe**: short, sharp exposures without load spikes.