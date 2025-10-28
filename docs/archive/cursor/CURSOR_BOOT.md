# Cursor Boot (Momentom)

**Purpose**  
This file tells Cursor exactly what to read and how to operate before it proposes or changes anything.

**See Also:**
- `docs/process/TASK_FLOW.md` - Master task flow (C0-C5 stages)
- `docs/process/CURSOR_WORKFLOW.md` - High-level workflow overview
- `docs/process/AUTO_LOG.md` - Decision log and task tracking process
- `docs/process/CONTRIBUTING.md` - Setup and testing guide
- Multi-Agent Workflow: `docs/process/MULTI_AGENT_WORKFLOW.md` - understand the agent ecosystem

---

## Three-Phase Process Overview

**C0: Planning & Specification (before implementation)**
- Context gathering and task planning
- Create specifications and approach document
- Get approval before coding starts

**C1: Implementation & Development (after C0 approval)**
- Follow the approved plan from C0
- Keep commits small and test incrementally
- Stay within scope and respect policies

**C5: Verification & Completion (after C1 implementation)**
- Complete comprehensive verification and testing
- Update all documentation and status
- Create PR with evidence and wrap-up
- Add AUTO_LOG entries

**Run C0 → C1 → C5 for each T-task in multi-task features**

---

## Golden Rules

1) **Read before doing**: load the files in **Required Reading** every task.
2) **Stay inside the contract**: OpenAPI **1.0.1** is frozen; no schema changes without an RFC.
3) **Small, reversible steps**: ≤ 1 hour of change per PR; keep commits small; include rollbacks.
4) **Prove it**: every PR includes cURLs and logs/screens validating ETag/304, Auth/RLS, and acceptance.
5) **Auto-log**: append entries to `docs/process/AUTO_LOG.md` at C0, C1 (if needed), and C5.

---

## Required Reading (every task)

**Operations / Process**
- `docs/process/TASK_FLOW.md` (master map)
- `docs/process/CURSOR_WORKFLOW.md` (the ritual you must follow)
- `docs/process/CONTRIBUTING.md`
- `docs/process/TEAM.md` (roles & ownership)
- `docs/decisions/DECISION_LOG.md` (recent decisions)
- `docs/process/sprints/README.md` (sprint history)

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
- `/docs/cursor/templates/PULL_REQUEST_TEMPLATE.md`

**Feature Specs (current work)**
- `docs/specs/README.md` (spec index)
- `docs/specs/[CURRENT_FEATURE].md` (active spec only)

---

## C0 Kickoff (what you must do first)

### C0.1) Branch & Setup
- Confirm current branch; if not provided, propose one (e.g., `feat/<slug>` or `chore/<slug>`)
- Create PR draft with template from `/docs/cursor/templates/PULL_REQUEST_TEMPLATE.md`

### C0.2) Context Digest (A–J)
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

### C0.3) Policy Alignment Check
Confirm these apply to your changes:
- **ETag**: GET endpoints only; POST/PATCH = `no-store`; vary by `X-Client-Timezone`; dev vary by `X-Athlete-Id` only if env-gated
- **Auth**: JWT→`athlete_id` mapping; RLS on all data operations; dev header override gated by env
- **CI Gates**: OpenAPI diff, Newman, H1–H7 smoke must pass

### C0.4) Dependency Scan
Create table of inputs needed from other roles:

| Role | Needed Item | Path/Link | Blocking? | Due | Notes |
|------|-------------|-----------|-----------|-----|-------|
| Product Architect | Confirm ETag/Auth policy for new routes | docs/policy/* | No | — | Call out exceptions |
| Sports Science | Data shape/content (if library related) | docs/library/* | No | — | — |
| UX | Microcopy & error states (if UI) | docs/ux/* | No | — | Defaults allowed |
| Ops | Env values (limits/buckets/flags) | .env.local.example | **Yes** | — | Provide defaults if unknown |

### C0.5) Implementation Plan
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

## C1: Implementation & Development Phase

Run **after C0 approval** and **before C5**.

### C1.1 Implementation Execution
- [ ] Follow the plan created in C0.5 Implementation Plan
- [ ] Keep commits small and atomic (≤1 hour changes)
- [ ] Stay within scope defined in C0.2 Context Digest
- [ ] Test incrementally as you build

### C1.2 Development Guidelines
- [ ] Respect all policies from C0.3 (ETag, Auth, CI Gates)
- [ ] Follow dependency requirements from C0.4
- [ ] Implement rollback strategy from C0.5
- [ ] Document any deviations or discoveries

### C1.3 Progress Checkpoints
- [ ] Ping for help if blocked or scope changes needed
- [ ] Validate against acceptance criteria from C0.2-H
- [ ] Run basic tests to ensure functionality
- [ ] Prepare for C5 verification phase

### C1.4 Scope Change Protocol
**If implementation reveals issues with C0 plan:**
1. [ ] Document the discovery and proposed change
2. [ ] Create mini-C0 update (don't restart full C0)
3. [ ] Get approval for plan adjustment
4. [ ] Update C0.5 Implementation Plan accordingly
5. [ ] Continue C1 with updated approach

**Ready for C5 when:**
- ✅ All acceptance criteria met (from C0.2-H)
- ✅ Implementation matches plan (from C0.5)
- ✅ No blocking issues or unresolved scope changes
- ✅ Code compiles and basic functionality works
- ✅ Basic testing passes
- ✅ Ready for comprehensive verification

---

## C5: Implementation & Completion Phase

Run **after implementation** is complete.

### 5.1 Implementation Verification
- [ ] Complete all acceptance criteria
- [ ] Run comprehensive testing (cURLs, UI, edge cases)
- [ ] Verify API contracts and headers
- [ ] Confirm CI gates pass (OpenAPI, Newman, Smoke)

### 5.2 Documentation Updates
- [ ] Update status in `docs/process/STATUS.md`
- [ ] Update status in `docs/config/status.yml`
- [ ] Add Decision Log entry to `docs/decisions/DECISION_LOG.md`
- [ ] Update spec with implementation notes
- [ ] **CRITICAL**: Run `npm run status:update` to sync README.md (prevents CI failures)
- [ ] Verify CI status-check will pass by running `npm run status:check`

### 5.3 PR Creation & Evidence
- [ ] **BEFORE PUSHING**: Ensure `npm run status:update` was run if STATUS.md changed
- [ ] Create PR with descriptive title following [template](../cursor/templates/PULL_REQUEST_TEMPLATE.md)
- [ ] Include comprehensive evidence (cURLs, screenshots, CI results)
- [ ] Reference relevant specs and decisions
- [ ] Add OPS DIGEST following template in AUTO_LOG.md

### 5.4 Archive & Cleanup
- [ ] Archive temporary files and development artifacts
- [ ] Clean up debug code and test utilities
- [ ] Document next steps and follow-ups
- [ ] Update project status and planning

### 5.5 AUTO_LOG Entries
- [ ] Add C0 entry (planning summary)
- [ ] Add C5 entry (completion summary with evidence)
- [ ] Update `docs/process/AUTO_LOG.md` with both entries

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
Branch: [branch-name] → PR #[planned]
Plan: [1-2 line summary of approach]
```

**At C1 (implementation checkpoint - optional for complex tasks):**
```
C1: [Task ID] - Implementation progress
Status: [% complete] / Blocked: [issue] / On track
Key discoveries: [any scope/approach changes]
Next: [immediate next steps]
```

**At C5 (completion):**
```
[Task ID]: [Brief description] ✅
Branch: [branch-name] → PR #[number]
Status: ✅ Completed and Merged / ⚠️ Blocked: [reason]
Contract: [API changes? yes/no]
Policies: [ETag, RLS, caching changes]
Core Functionality: [key features delivered]
Verification: [cURL results and testing evidence]
CI: [OpenAPI diff ✅ Newman ✅ Smoke ✅]
Impact: [what this enables for users/system]
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
- [ ] C1 implementation executed per plan
- [ ] Implementation follows all policies
- [ ] Verification cURLs prove acceptance criteria
- [ ] CI gates pass (OpenAPI, Newman, Smoke)
- [ ] C5 verification and documentation complete
- [ ] AUTO_LOG entries complete (C0, C1 if used, C5)
- [ ] PR description complete with evidence
- [ ] Changes are ≤1 hour and reversible

---

## Multi-Task Feature Guidelines

**For features with multiple T-tasks (like B3e-T1, B3e-T2, etc.):**

1. **Run C0 → C1 → C5 for each T-task**
   - Each T-task gets its own planning, implementation, and completion cycle
   - Clear progress tracking and focused reviews
   - Lower risk with smaller changes

2. **T-task Dependencies**
   - T2 waits for T1 completion
   - T3 waits for T2 completion
   - Each task builds on previous deliverables

3. **Documentation Strategy**
   - Main feature spec (e.g., `C2-S1-B3e.md`) covers all T-tasks
   - Individual T-task details included as sections in main spec
   - AUTO_LOG.md tracks each T-task completion separately

4. **PR Strategy**
   - One PR per T-task for focused reviews
   - Clear naming: `B3e-T2: Database Schema Analysis`
   - Each PR references main feature spec

This approach balances thorough documentation with manageable review cycles and clear progress tracking.

---

## Workflow Example

**B3e-T2: Database Schema Analysis**

```
Prompt 1: "Run C0 for B3e-T2"
├── C0.1: Branch & Setup
├── C0.2: Context Digest (scope, contracts, acceptance criteria)
├── C0.3: Policy Alignment Check
├── C0.4: Dependency Scan
├── C0.5: Implementation Plan
└── ✋ STOP - Wait for approval

Prompt 2: "Run C1 for B3e-T2" (after C0 approval)
├── C1.1: Implementation Execution (follow C0.5 plan)
├── C1.2: Development Guidelines (respect policies)
├── C1.3: Progress Checkpoints (test incrementally)
├── C1.4: Scope Change Protocol (if needed)
└── ✋ STOP - When ready for verification
    (Optional: Add C1 checkpoint entry for complex tasks)

Prompt 3: "Run C5 for B3e-T2" (after C1 complete)
├── 5.1: Implementation Verification
├── 5.2: Documentation Updates
├── 5.3: PR Creation & Evidence
├── 5.4: Archive & Cleanup
├── 5.5: AUTO_LOG Entries
└── ✅ COMPLETE - T2 officially done
```

**Key Benefits:**
- **Clear handoff points** between phases
- **Focused work** in each phase
- **Approval gates** prevent scope creep
- **Complete documentation** of decisions and outcomes