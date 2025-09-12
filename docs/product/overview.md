# Product Overview (MVP)

## Target Users

- Time-starved triathletes and runners who want adaptive plans without a coach
- Early adopters comfortable with manual file ingest (TCX/GPX) during beta

## MVP Capabilities

- **Onboarding & Auth**
  - Supabase JWT prod auth; map JWT → `athlete_id`
  - Preferences + race calendar captured (A/B/C)
- **Readiness**
  - Drivers, weights, and bands; partial-data handling with renormalised weights
- **Workout Library v0**
  - Pre-defined **run/bike/swim/strength** sessions; time-based segments
  - Coverage across base/build/peak/taper; taper-safe options
- **Training Plan & Sessions**
  - Render from library; show session cards; keyset pagination on lists
- **Adaptations (preview/decision)**
  - Reason codes, triggers, replace-only changes, taper/A-race protection
- **Fuel Guidance**
  - Pre/during/post bands; sodium **mg/h** derived as (mg/L × L/h)
- **Manual Ingest**
  - Upload completed **.TCX/.GPX**; server parses → staging → normalized sessions
- **Manual Morning Metrics**
  - HRV, RHR, sleep (REM/deep/light/awake), soreness (until device integrations)

## Non-Goals (MVP)

- Direct device APIs (Garmin/Apple/Strava) — future milestone
- ML personalization beyond rule-based guardrails
- Native apps (mobile-web is fine first)

## Flows (Happy Paths)

1. **Onboard → Plan**  
   User authenticates → sets goals & races → receives phased plan from library.
2. **Daily**  
   Morning metrics (manual now) → readiness shown → today’s session visible.
3. **After Training**  
   Export to device manually (interim) → complete workout → upload **.TCX** → session appears with stats.
4. **Adaptation**  
   Low readiness or missed session → preview recommendation → user accepts → plan updates (versioned).

## Content Model (Library Item)

- `workout_id (uuid)`, `sport`, `phase`, `title`, `description`, `focus_tags[]`,
  `primary_zone`, `duration_min`, `load_hint?`,
  `structure_json.segments[]` with `{type, target, duration_min|distance_km, notes}`

See `docs/library/README.md` and template in `docs/library/template.workout.json`.