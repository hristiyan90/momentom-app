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
- `docs/decisions/DECISION_LOG.md` (recent decisions)

**Policies (hard requirements)**
- `docs/policy/etag-policy.md`
- `docs/policy/auth-mapping.md`
- `docs/policy/ci-gates.md`

**Product / Architecture**
- `docs/product/overview.md`
- `docs/product/vision.md`
- `docs/product/feature-map.md`
- `docs/architecture/overview.md`

**Workout Library (if relevant to the task)**
- `docs/library/README.md`
- `docs/library/template.workout.json`
- `docs/library/coverage-checklist.md`
- `docs/library/evidence-brief.md`
- `library/workouts.json`

**Cursor system files**
- `/docs/cursor/rules.md`
- `/docs/cursor/context.md`
- `/docs/cursor/operating-agreement.md`
- `/docs/cursor/templates/pr.md`

---

## C0 Kickoff (what you must do first)

### 1) Branch & Setup
- Confirm current branch; if not provided, propose one (e.g., `feat/<slug>` or `chore/<slug>`)
- Create PR draft with template from `/docs/cursor/templates/pr.md`

### 2) Context Digest (A–J)
Read the required files above and produce a concise digest:

**A) Scope:** Task summary (one line)  
**B) In/Out:** What's included vs excluded  
**C) Contracts:** APIs/schemas touched  
**D) Data/RLS:** Database changes and athlete_id scoping  
**E) Storage/Limits:** File sizes, env vars, resource constraints  
**F) Non-functionals:** Performance, caching, headers  
**G) UX Notes:** UI changes, user flows affected  
**H) Acceptance:** Pass/fail criteria (cURLs, screenshots)  
**I) Risks:** What could go wrong + rollback plan  
**J) Open Questions:** Explicit asks for clarification  

### 3) Policy Alignment Check
Confirm these apply to your changes:
- **ETag**: GET endpoints only; POST/PATCH = `no-store`; vary by `X-Client-Timezone`; dev vary by `X-Athlete-Id` only if env-gated
- **Auth**: JWT→`athlete_id` mapping; RLS on all data operations; dev header override gated by env
- **CI Gates**: OpenAPI diff, Newman, H1–H7 smoke must pass

### 4) Dependency Scan
Create table of inputs needed from other roles:

| Role | Needed Item | Path/Link | Blocking? | Due | Notes |
|------|-------------|-----------|-----------|-----|-------|
| Product Architect | Confirm ETag/Auth policy for new routes | docs/policy/* | No | — | Call out exceptions |
| Sports Science | Data shape/content (if library related) | docs/library/* | No | — | — |
| UX | Microcopy & error states (if UI) | docs/ux/* | No | — | Defaults allowed |
| Ops | Env values (limits/buckets/flags) | .env.local.example | **Yes** | — | Provide defaults if unknown |

### 5) Implementation Plan
- **Files to touch:** Exact paths
- **Functions/endpoints:** What you'll create/modify
- **Database changes:** Tables, RLS policies, migrations
- **Tests:** cURL commands, UI screenshots needed
- **Rollback strategy:** How to undo if needed

**Include in PR description:**
> This plan follows: CURSOR_WORKFLOW.md (ritual), etag-policy.md, auth-mapping.md, ci-gates.md.  
> No schema changes. Changes are ≤1 hour and reversible.

**STOP AFTER C0** and wait for approval before implementing.

---

## Implementation Guardrails

- Don't rename or move policy docs
- Don't modify OpenAPI unless an RFC is approved
- All new endpoints must set headers per `etag-policy.md` and auth per `auth-mapping.md`
- Respect RLS: any DB write/read must be scoped by `athlete_id`
- Keep commits small and atomic
- Include rollback instructions in PR

---

## Verification Requirements (must be in PR)

**cURLs proving:**
- Success path with expected status/headers
- Conditional GET (ETag/304) for GET endpoints
- Auth pass/fail scenarios per policy
- Error handling (401, 404, 422)

**Evidence:**
- Screenshots or log snippets showing expected headers (`ETag`, `Cache-Control`, `Vary`)
- UI screenshots if interface affected
- CI green badges (OpenAPI diff ✅, Newman ✅, Smoke ✅)

---

## Auto-Log Entries

**At C0 (planning):**
```
C0: [Task ID] - [Brief description]
Branch: [branch-name] → PR #[number]
Plan: [1-2 line summary of approach]
```

**At C5 (completion):**
```
C5: [Task ID] - [Brief description] 
Status: ✅ Merged / ⚠️ Blocked: [reason]
Evidence: [cURL summary + CI status]
Follow-ups: [next steps if any]
```

Update `docs/process/AUTO_LOG.md` with both entries.

---

## Escalation Points

**STOP and create RFC if:**
- OpenAPI schema changes needed
- New policy requirements
- Breaking changes to existing contracts
- Security model changes

**STOP and ask for inputs if:**
- Any dependency marked "Blocking? = Yes"
- Missing env vars or configuration
- Unclear acceptance criteria
- Cross-team coordination needed

**Tag owners in PR comments using CODEOWNERS file.**

---

## Definition of Done

- [ ] C0 context digest completed and approved
- [ ] Implementation follows all policies
- [ ] Verification cURLs prove acceptance criteria
- [ ] CI gates pass (OpenAPI, Newman, Smoke)
- [ ] Auto-log entries added (C0 + C5)
- [ ] PR description complete with evidence
- [ ] Changes are ≤1 hour and reversible