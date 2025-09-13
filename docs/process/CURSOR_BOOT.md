# Cursor Boot (Momentom)

**Purpose**  
This file tells Cursor exactly what to read and how to operate before it proposes or changes anything.

---

## Golden Rules

1) **Read before doing**: load the files in **Required Reading** every task.
2) **Stay inside the contract**: OpenAPI **1.0.1** is frozen; no schema changes without an RFC.
3) **Small, reversible steps**: ≤ 1 hour of change per PR; keep commits small; include rollbacks.
4) **Prove it**: every PR includes cURLs and logs/screens validating ETag/304, Auth/RLS, and acceptance.
5) **Auto-log**: append a short entry to `docs/process/AUTO_LOG.md` at C0 and C5.

---

## Required Reading (every task)

**Operations / Process**
- `docs/process/TASK_FLOW.md` (master map)
- `docs/process/CURSOR_WORKFLOW.md` (the ritual you must follow)
- `docs/process/CONTRIBUTING.md`
- `docs/process/TEAM.md` (roles & ownership)
- `docs/decisions/decision-log.md` (DECISION_LOG)

**Policies (hard requirements)**
- `docs/policy/etag-policy.md`
- `docs/policy/auth-mapping.md`
- `docs/policy/ci-gates.md`

**Product / Architecture**
- `docs/product/overview.md`
- `docs/product/vision.md`
- `docs/product/feature-map.md`
- `docs/product/north-star.md`
- `docs/architecture/overview.md`

**Workout Library (if relevant to the task)**
- `docs/library/README.md`
- `docs/library/template.workout.json`
- `docs/library/coverage-checklist.md`
- `docs/library/coverage-note.md`
- `docs/library/evidence-brief.md`
- `docs/library/mapping-note.md`
- `library/workouts.json`

**Cursor system files**
- `/.cursor/rules.md`
- `/.cursor/CURSOR_OPERATING_AGREEMENT.md`
- `/.cursor/context.md`
- `/.cursor/templates/design.md`
- `/.cursor/templates/pr.md`
- `/.cursor/templates/task.md`

---

## C0 Kickoff (what you must do first)

1. Confirm current branch; if not provided, propose one (e.g., `feat/<slug>` or `chore/<slug>`).
2. Post a **plan in the PR description** using `/.cursor/templates/pr.md`:
   - **What / Why / How (files & functions) / Tests (cURLs) / Risks & Rollback / Follow-ups**
3. List **exact files to touch**. If any policy or contract would be impacted, **STOP** and create an **RFC** draft.

**Kickoff blurb to include in PR description**
> This plan follows: CURSOR_WORKFLOW.md (ritual), etag-policy.md, auth-mapping.md, ci-gates.md.  
> No schema changes. Changes are ≤1 hour and reversible.

---

## Implementation guardrails

- Don’t rename or move policy docs.
- Don’t modify OpenAPI unless an RFC is approved.
- All new endpoints must set headers per `etag-policy.md` and auth per `auth-mapping.md`.
- Respect RLS: any DB write/read must be scoped by `athlete_id`.

---

## Verification (must be in the PR)

- cURLs for success + conditional GET (ETag/304) + auth pass/fail per policy.
- Screenshots or log snippets showing expected headers (`ETag`, `Cache-Control`, `Vary`).
- If UI affected: a screenshot of the flow.

---

## Auto-Log (append on C0 and C5)

Update `docs/process/AUTO_LOG.md` with:
- Task ID / Branch
- "What changed" (1–2 lines)
- Links to PR, key files
- Validation summary (1–2 lines)

---

## D) Dependency Scan & Requests to Other Roles (run before proposing plan)

Produce a short table of inputs you need from other roles and flag blockers.

**Output format (paste in PR description under "Inputs from other roles"):**

| Role                   | Needed Item                                  | Path / Link                                  | Blocking? | Due | Notes |
|------------------------|-----------------------------------------------|----------------------------------------------|-----------|-----|-------|
| Product Architect      | Confirm ETag/Auth policy applies to new routes | docs/policy/etag-policy.md, auth-mapping.md  | No        | —   | Call out exceptions if any |
| Sports Science         | N/A for this task                              | —                                            | —         | —   | —     |
| UX                     | Dropzone microcopy & error states              | docs/ux/content.md (or PR comment)           | No        | —   | Defaults allowed |
| Ops Orchestrator       | Max upload size, storage bucket name           | .env.local / README-dev.md                   | Yes       | —   | Provide defaults if unknown |

If anything is **Blocking? = Yes**, STOP and ask in the PR with @-mentions (per CODEOWNERS), then proceed once resolved.