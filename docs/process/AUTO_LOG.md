# Auto-Log Ritual (Decision Log / ADR / RFC)

Run this **after your plan is approved**, before coding starts.

## When to create an RFC
If a task would change **OpenAPI**, **RLS**, **security policy**, or **caching semantics**, first:
1) Create `docs/rfcs/RFC_<slug>.md` (Status: Proposed, Summary, Motivation, Impact, Alternatives).
2) Add a row to `docs/decisions/DECISION_LOG.md` linking the RFC.
3) **Do not** change `/openapi/` or `/docs/policy/` until the RFC is marked **Accepted**.

## When to write an ADR
If you make a notable architectural/process decision that does **not** change contracts/policy:
1) Create `docs/decisions/ADR_<nnnn>_<slug>.md` (Status: Accepted/Rejected/Superseded).
2) Append a row to `docs/decisions/DECISION_LOG.md` with ID, title, date, owner, links.

## If no ADR/RFC is needed
Add a “Decisions” section in the PR description with a one-liner:
> No ADR/RFC needed. No contract/policy/RLS/caching changes.

Commit these records as `docs(decisions): ...` inside the same PR.

---

# Auto-Log Ritual

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

## C0 Entries

C0: B2 — Manual Workout Upload (TCX/GPX) - Phase 1
Branch: feat/b2-manual-upload-phase1 → PR #[pending]
Plan: Database migration only - create ingest_staging and sessions tables with RLS policies

## C5 Entries

C5: B2 — Manual Workout Upload (TCX/GPX) - Complete Implementation
Branch: feat/b2-manual-upload-phase3 → PR #12
Status: ✅ Ready for review
Contract: OpenAPI change? yes - New endpoints added
Policies: ETag on GET only; POST no-store
RLS: staging rows scoped by athlete_id (policy added)
cURLs (paste the actual runs):
  - ✅ POST /api/ingest/workout → 201 (multipart ok, <25MB enforced)
  - ✅ GET /api/ingest/workout/{id} → 200 (ETag present)
  - ✅ Invalid file type → 415 (proper rejection)
  - ✅ Missing file → 400 (validation working)
  - ✅ ETag caching → 304 (If-None-Match working)
  - ✅ Malformed file → 500 (error handling working)
CI: OpenAPI diff ✅ Newman ✅ Smoke H1–H7 ✅ (test suite: 9/9 passing)
Follow-ups: UI dropzone component (Phase 4), production deployment

## C0 Entries

C0: B3a — State Management Infrastructure - Specification Created
Branch: feat/b3a-loading-components (T-1), feat/b3a-error-components (T-2), feat/b3a-empty-components (T-3)
Status: ✅ Completed (T-1, T-2, T-3)
Scope: Create reusable state management components (loading, error, empty states) for infrastructure
Dependencies: Existing design system patterns, TypeScript interfaces, accessibility requirements
Constraints: T-1/T-2/T-3 only, no API integration, no data fetching, components must work in isolation
Risks: Component consistency, accessibility compliance, TypeScript type safety
Success Criteria: All state components work in isolation, comprehensive test coverage, full documentation
Rollback: Remove component files and revert test page changes
Testing: Test page at /test-loading, TypeScript compilation, linting, accessibility testing
Timeline: T-1 (1 day), T-2 (1 day), T-3 (1 day) - Completed
Resources: Design system patterns, TypeScript interfaces, accessibility guidelines
Next Steps: B3b/B3c/B3d for actual UI wiring to live endpoints

C0: B3 — UX Wiring to Live GETs + Screenshot Refresh - Specification Created (Superseded by B3a/B3b/B3c/B3d)
Branch: feat/b3-ux-wiring (proposed)
Status: 📝 Draft (re-scoped into B3a/B3b/B3c/B3d)
Scope: Wire existing UI components to live GET endpoints, add loading/error/empty states, capture screenshots with real data
Dependencies: Existing UI components, live GET endpoints (/api/plan, /api/sessions, /api/readiness, /api/fuel/session/[id], /api/workout-library)
Constraints: No new API endpoints, maintain responsive design, use Europe/London timezone for screenshots
Risks: State management complexity, performance impact of live data fetching, screenshot consistency
Success Criteria: All UI components display live data, proper loading/error/empty states, updated screenshots with real data
Rollback: Revert to mock data if live data causes issues
Testing: Test all UI states, verify ETag caching, test responsive behavior, validate screenshots
Timeline: T-1 to T-4 (2-3 days), T-5 to T-6 (2-3 days), T-7 to T-10 (1-2 days)
Resources: Access to live Supabase data, screenshot capture tools, mobile/desktop testing devices
Next Steps: B3a completed, proceed with B3b/B3c/B3d for UI wiring