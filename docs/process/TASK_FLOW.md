# Master Task Flow (Momentom)

A repeatable flow for every dev task. Use with `docs/process/CURSOR_WORKFLOW.md` and `docs/process/CURSOR_BOOT.md`.

**See Also:**
- `docs/process/CURSOR_BOOT.md` - Detailed required reading and context digest process
- `docs/process/CURSOR_WORKFLOW.md` - High-level workflow overview
- `docs/process/AUTO_LOG.md` - Decision log and task tracking process
- `docs/cursor/templates/PULL_REQUEST_TEMPLATE.md` - PR template format

---

## Roles (shortcut)
- **Ops Orchestrator** — kicks off tasks, approves plans, merges.
- **Full-Stack Dev (Cursor)** — implements, tests, opens PRs.
- **Product Architect** — owns policies and contracts (no code).
- **Sports Science Specialist** — owns workouts + briefs.
- **AI/ML** — future personalization work (not in scope unless noted).
- **UX/UI** — component layout & copy.

---

## Pre-C0 — Dependency Scan (if needed)
- Run dependency scan per `docs/process/CURSOR_BOOT.md` Step D
- Identify cross-role inputs and blockers
- Only proceed to C0 if no blocking dependencies

---

## Stages: C0 → C5

### C0 — Kickoff
- You paste a **small brief** (title + 3–6 bullets of acceptance).
- Cursor runs `CURSOR_BOOT.md` required reading.
- Cursor opens/updates a PR with a **plan** (files, functions, tests, risks, rollback) using the PR template.
- Cursor appends a line to `docs/process/AUTO_LOG.md` (C0 entry).

### C1 — Plan approval
- You trim scope if needed; confirm “no schema changes”.
- If contract/policy risk exists → **RFC** (docs/rfcs) and ADR stub (docs/decisions).

### C2 — Implement (small chunks)
- Cursor makes small changes (≤ 1 hour), each commit reversible.
- Follow **policies** (`etag-policy.md`, `auth-mapping.md`, `ci-gates.md`).
- If the task involves workouts, use `docs/library/*` and `library/workouts.json`.

### C3 — Prove
- Cursor posts cURLs and logs/screens verifying:
  - **Auth/RLS** behavior (prod/dev gating)
  - **ETag/304** correctness
  - Acceptance steps (happy path + 1 failure path)
- Update PR description’s **Tests** section.

### C4 — CI
- OpenAPI diff (no changes expected)  
- Newman (Postman collection)  
- H1–H7 smoke
- PR stays small and green; fix gates if anything fails.

### C5 — Review & merge
- You review diff + headers + cURLs.
- Merge with squash. Tag if it closes a sprint item.
- Cursor appends **C5** entry in `docs/process/AUTO_LOG.md`.

### Phase 6 — Documentation & Wrap-up
- Update status in `docs/config/status.yml` (ONLY place needed)
- Add Decision Log entry if applicable
- Add implementation notes to spec
- Archive temporary files and clean up development artifacts
- Update next steps and follow-ups

---

## Branching, commits, PRs
- Branches: `feat/<slug>`, `chore/<slug>`, `fix/<slug>`
- Commit style: `feat: …`, `chore: …`, `fix: …`, `docs: …`
- PR template: `/docs/cursor/templates/PULL_REQUEST_TEMPLATE.md`

---

## Docs-driven development
- Product: `docs/product/{vision,overview,feature-map,north-star}.md`
- Policies: `docs/policy/{etag-policy,auth-mapping,ci-gates}.md`
- Decisions: `docs/decisions/decision-log.md` (+ `docs/decisions/*`)
- Library: `docs/library/*` + `library/workouts.json`

---

## Quality gates (must pass)
- **CI**: OpenAPI diff, Newman, H1–H7 smoke
- **Headers**: ETag/Cache-Control/Vary per policy
- **Auth/RLS**: per `auth-mapping.md`
- **Size**: ≤ 1 hour of change; reversible

---

## Release train
- Every merged PR → Preview
- Sprint done → squash merge to `main` → Production
- Tag `v0.x.y-cycleN-sprintM`
- Release notes: PRs, policy diffs, endpoints, acceptance cURLs