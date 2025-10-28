# Claude Code Multi-Agent Workflow

**Purpose:** Define the development workflow using Claude Code's multi-agent coordination system.

**Replaces:** `CURSOR_WORKFLOW.md` (archived to `/docs/archive/cursor/`)

**See Also:**
- `/CLAUDE.md` - Central reference and agent roster
- `docs/process/MULTI_AGENT_WORKFLOW.md` - Agent ecosystem overview
- `docs/process/STATUS.md` - Current sprint status
- `docs/process/AGENT_STATUS.md` - Active agent tracking

---

## Overview

The Claude Code workflow preserves the excellent C0→C1→C5 philosophy from the Cursor workflow but distributes work across specialized agents coordinated by Claude Code.

### Key Differences from Cursor Workflow

| Aspect | Cursor Workflow | Claude Code Workflow |
|--------|-----------------|----------------------|
| **Agent Model** | Single Full-Stack Dev Lead | Multiple specialized agents + orchestrator |
| **Context Loading** | Manual (read CURSOR_BOOT.md) | Automatic (agents receive context in prompts) |
| **Execution** | Sequential (plan → implement → verify) | Parallel when possible (Backend + Frontend simultaneously) |
| **Coordination** | Developer manages | Claude Code orchestrator manages |
| **Tool Switching** | Cursor IDE only | Claude Code + subagents (all in one environment) |

### Preserved from Cursor Workflow

✅ **Process Philosophy** - C0 (Planning) → C1 (Implementation) → C5 (Verification)
✅ **Quality Standards** - ETag, Auth, RLS policies, small commits, evidence-based verification
✅ **Documentation** - AUTO_LOG.md decisions, STATUS.md tracking, comprehensive PRs

---

## The Three-Phase Process

### Phase 0: Planning & Specification (Before Implementation)

**Goal:** Understand requirements, analyze dependencies, create comprehensive plan, get approval

#### Participants
- You (Product Owner)
- Claude Code (Orchestrator)
- Product Architect subagent (for complex features)

#### Process

**Step 1: Initial Discussion**

```
You: "I need to implement session management auto-refresh"

Claude Code: "Let me analyze the current state..."
[Reads lib/auth/session.ts, lib/auth/athlete.ts, auth-mapping.md policy]

"Context:
- Current: Session extraction works, but refresh_token not pulled from cookies
- Policy requirement: Auto-refresh 5 min before expiration, 3 retry attempts
- Dependencies: Auth system ✅, Cookie handling ✅
- Estimated effort: 1 day

Components needed:
1. Server: Fix getSession() to extract refresh_token from cookies
2. Client: Create useSession hook with auto-refresh timer
3. Tests: Session refresh flow, retry logic, expiration handling

Should I proceed with implementation, or launch Product Architect for
detailed specification first?"
```

**Step 2: Specification (if needed)**

For complex features:

```
Claude Code: [Launches Product Architect subagent]

Subagent Task:
"Acting as Product Architect for Momentum app, create detailed specification
for session management auto-refresh (Sprint 1.5 Task 4).

Context:
- Current implementation: lib/auth/session.ts has getSession() and refreshSession()
- Policy: docs/policy/auth-mapping.md lines 75-83 (refresh requirements)
- Gap: refresh_token not extracted from cookies (line 60 of session.ts)

Requirements:
- Auto-refresh 5 min before token expiration
- 3 retry attempts with exponential backoff
- Redirect to /login on final failure
- Update cookies after successful refresh

Output: Complete specification with:
- API changes needed
- Client hook design
- Error handling flows
- Test scenarios
- cURL verification examples"

[Product Architect returns specification]

Claude Code: "Specification complete. Key decisions:
- useSession hook polls every 30s when token < 5min until expiry
- Exponential backoff: 1s, 2s, 4s between retries
- Cookies updated via Set-Cookie headers from refresh endpoint
- Fallback: Clear session and redirect to /login

Ready to proceed with implementation?"
```

**Step 3: Approval**

```
You: "Yes, proceed"

Claude Code: "Implementation plan:
Phase 1: Backend (Backend Engineer) - 2 hours
- Fix getSession() to extract refresh_token from cookie
- Add retry logic to refreshSession()
- Update error handling

Phase 2: Frontend (Frontend Engineer) - 3 hours
- Create useSession hook with timer
- Add retry + backoff logic
- Handle redirect on failure

Phase 3: Verification (QA Engineer) - 1 hour
- Test auto-refresh flow
- Test retry attempts
- Test final failure redirect

Launching Backend Engineer..."
```

#### Outputs from Phase 0

- ✅ Clear scope and requirements
- ✅ Dependency analysis complete
- ✅ Specification document (for complex features)
- ✅ Task breakdown with estimates
- ✅ Acceptance criteria defined
- ✅ Your approval to proceed

---

### Phase 1: Implementation (After C0 Approval)

**Goal:** Implement the approved plan with high quality, policy compliance, and incremental testing

#### Participants
- Backend Engineer (API routes, business logic, server-side)
- Frontend Engineer (React components, hooks, UI)
- Database Engineer (schema changes, migrations, RLS)
- Claude Code (Orchestrator - manages handoffs)

#### Execution Model

**Sequential when dependencies exist:**
```
Database Engineer → Backend Engineer → Frontend Engineer
(Schema must exist before API can use it, API must exist before UI can call it)
```

**Parallel when independent:**
```
Backend Engineer (API routes)
     +
Frontend Engineer (UI components)
(Both can work simultaneously if API contract is defined)
```

#### Process

**Step 1: Launch Implementation Agents**

```
Claude Code: [Launches Backend Engineer subagent]

Subagent Task:
"Acting as Backend Engineer for Momentum app, implement session management
auto-refresh server-side logic (Sprint 1.5 Task 4 - Part 1).

Context:
- Specification: [Product Architect's spec]
- Current code: lib/auth/session.ts
- Policy: docs/policy/auth-mapping.md (auth requirements)
- Gap: Line 60 of session.ts - refresh_token is empty string

Implementation:
1. Update getSession() function:
   - Extract refresh_token from req.cookies.get('sb-refresh-token')
   - Include in returned Session object

2. Update refreshSession() function:
   - Add retry logic (3 attempts, exponential backoff)
   - Return detailed error on failure (for client logging)

3. Add tests:
   - lib/auth/__tests__/session.test.ts
   - Test: getSession extracts refresh token from cookie
   - Test: refreshSession retries 3 times on failure
   - Test: refreshSession returns error after 3 failures

Constraints:
- Must follow existing patterns in lib/auth/
- Use supabaseClient from lib/auth/client.ts
- Add TypeScript types for new error responses
- Include JSDoc comments

Output:
- Modified: lib/auth/session.ts
- New tests: lib/auth/__tests__/session.test.ts
- Verification: cURL example showing refresh token flow"

[Backend Engineer implements and returns results]
```

**Step 2: Handoff to Next Agent**

```
Claude Code: "Backend Engineer complete. Changes:
- lib/auth/session.ts: Updated getSession() and refreshSession()
- lib/auth/__tests__/session.test.ts: Added 4 new tests
- All tests passing ✅

Now launching Frontend Engineer for client-side implementation..."

[Launches Frontend Engineer subagent]

Subagent Task:
"Acting as Frontend Engineer for Momentum app, implement session management
auto-refresh client-side hook (Sprint 1.5 Task 4 - Part 2).

Context:
- Backend implementation complete (refresh logic in lib/auth/session.ts)
- Specification: [Product Architect's spec]
- Policy: Auto-refresh 5 min before expiration, redirect on failure

Implementation:
1. Create useSession hook (lib/hooks/useSession.ts):
   - Poll every 30s when token expires in < 5min
   - Call refreshSession() from lib/auth/session.ts
   - Retry 3x with exponential backoff (1s, 2s, 4s)
   - Redirect to /login on final failure
   - Return: { session, loading, error }

2. Update app layout (app/layout.tsx):
   - Wrap app with SessionProvider
   - useSession hook monitors session globally

3. Add tests (lib/hooks/__tests__/useSession.test.ts):
   - Test: Hook detects expiring token
   - Test: Auto-refresh triggered at 5min mark
   - Test: Retry logic works correctly
   - Test: Redirect happens on final failure

Output:
- New: lib/hooks/useSession.ts
- New: lib/hooks/__tests__/useSession.test.ts
- Modified: app/layout.tsx
- Documentation: How to use useSession in pages"

[Frontend Engineer implements and returns results]
```

**Step 3: Integration & Verification**

```
Claude Code: "Frontend Engineer complete. Changes:
- lib/hooks/useSession.ts: New hook with auto-refresh logic
- lib/hooks/__tests__/useSession.test.ts: 5 tests, all passing
- app/layout.tsx: Wrapped in SessionProvider

Implementation complete. Moving to Phase 5 for verification..."
```

#### Outputs from Phase 1

- ✅ Implemented code in all relevant files
- ✅ Unit tests for new functionality
- ✅ TypeScript types updated
- ✅ Policy compliance (ETag, Auth, RLS as applicable)
- ✅ All tests passing
- ✅ Small, incremental commits

---

### Phase 5: Verification & Completion (After C1 Implementation)

**Goal:** Comprehensive validation, documentation updates, PR creation with evidence

#### Participants
- QA Engineer (functional testing, acceptance criteria)
- Security Auditor (security-specific validation)
- Performance Engineer (performance verification, if needed)
- Claude Code (Orchestrator - compiles evidence, creates PR)

#### Process

**Step 1: Functional Verification**

```
Claude Code: [Launches QA Engineer subagent]

Subagent Task:
"Acting as QA Engineer for Momentum app, verify session management auto-refresh
implementation (Sprint 1.5 Task 4 - Verification).

Context:
- Implementation complete: lib/auth/session.ts, lib/hooks/useSession.ts
- Specification: [Product Architect's spec]
- Acceptance criteria:
  ✓ Auto-refresh triggers 5 min before expiration
  ✓ Retry logic: 3 attempts with exponential backoff
  ✓ Redirect to /login on final failure
  ✓ Cookies updated after successful refresh

Test Plan:
1. Unit tests (verify all passing):
   - lib/auth/__tests__/session.test.ts
   - lib/hooks/__tests__/useSession.test.ts

2. Integration tests:
   - Login with valid credentials
   - Wait until token has <5min remaining
   - Verify auto-refresh triggered
   - Verify cookie updated with new tokens
   - Check: No user interaction required

3. Edge cases:
   - Simulate refresh failure (invalid refresh token)
   - Verify: Retry 3 times with backoff
   - Verify: Redirect to /login after final failure
   - Simulate network error during refresh
   - Verify: Graceful error handling

4. Manual verification:
   - Start app, login
   - Set token expiration to 5 min (dev mode)
   - Observe console logs for refresh trigger
   - Verify: New token received
   - Verify: No logout occurred

Output:
- Test results (pass/fail for each scenario)
- Screenshots or logs as evidence
- Any bugs or issues found
- cURL examples demonstrating flow"

[QA Engineer runs tests and returns results]

Claude Code: "QA Verification complete:
✅ All unit tests passing (9/9)
✅ Integration test: Auto-refresh works correctly
✅ Edge case: Retry logic functions as expected
✅ Edge case: Redirect after 3 failures confirmed
✅ Manual verification: Observed successful refresh at 4:30 remaining

Evidence: [test outputs, screenshots, logs attached]

No issues found. Moving to security verification..."
```

**Step 2: Security Verification (if applicable)**

```
Claude Code: [Launches Security Auditor subagent]

Subagent Task:
"Acting as Security Auditor for Momentum app, verify security aspects of
session management auto-refresh implementation.

Context:
- Implementation: lib/auth/session.ts, lib/hooks/useSession.ts
- Policy: docs/policy/auth-mapping.md

Security Checklist:
1. Token handling:
   ✓ Refresh token stored in HttpOnly cookie (not accessible to JS)
   ✓ Access token not logged or exposed in client code
   ✓ Tokens cleared on logout/failure

2. Cookie security:
   ✓ Secure flag enabled in production
   ✓ SameSite=lax prevents CSRF
   ✓ MaxAge appropriate (access: 1hr, refresh: 7 days)

3. Error handling:
   ✓ Errors don't leak sensitive info
   ✓ Failed refresh attempts rate-limited (if applicable)
   ✓ No token exposure in error messages

4. Auth flow:
   ✓ Refresh endpoint requires valid refresh token
   ✓ Old tokens invalidated after refresh
   ✓ Redirect to login clears all session state

Output:
- Security assessment (pass/fail)
- Any vulnerabilities found
- Recommendations"

[Security Auditor reviews and returns results]

Claude Code: "Security Audit complete:
✅ Token handling: Secure (HttpOnly cookies, no logging)
✅ Cookie security: Correct flags in production
✅ Error handling: No information leakage
✅ Auth flow: Refresh token properly validated

No vulnerabilities found. Implementation is secure."
```

**Step 3: Documentation & PR Creation**

```
Claude Code: "All verification complete. Updating documentation..."

[Updates the following files:]

1. docs/process/STATUS.md:
   - Mark Sprint 1.5 Task 4 as "Completed"
   - Update completion percentage (60% → 65%)

2. docs/process/AGENT_STATUS.md:
   - Log agent handoffs: PA → Backend → Frontend → QA → Security
   - Mark task as complete

3. docs/process/AUTO_LOG.md (if decision made):
   - Add entry for architectural decision (if any)

4. Create PR from template:
```

**Pull Request Template Used:**

```markdown
# Session Management Auto-Refresh Implementation

**Sprint:** 1.5
**Task:** Task 4 - Session Management (Sprint 1.5-A)
**Type:** Feature
**Estimated Effort:** 1 day
**Actual Effort:** 6 hours

## Summary

Implements automatic session token refresh to prevent user logouts during active sessions.

## Changes

### Backend (lib/auth/session.ts)
- ✅ Updated `getSession()` to extract refresh_token from cookies
- ✅ Added retry logic to `refreshSession()` (3 attempts, exponential backoff)
- ✅ Improved error handling and logging

### Frontend (lib/hooks/useSession.ts)
- ✅ Created `useSession` hook with auto-refresh timer
- ✅ Polls every 30s when token expires in <5min
- ✅ Redirects to /login after 3 failed refresh attempts

### Tests
- ✅ Backend: lib/auth/__tests__/session.test.ts (4 new tests)
- ✅ Frontend: lib/hooks/__tests__/useSession.test.ts (5 new tests)
- ✅ All tests passing (9/9)

## Acceptance Criteria

✅ Auto-refresh triggers 5 min before token expiration
✅ 3 retry attempts with exponential backoff (1s, 2s, 4s)
✅ Cookies updated after successful refresh
✅ Redirect to /login on final failure
✅ No user interaction required for refresh

## Policy Compliance

✅ **Auth Mapping Policy:** JWT refresh flow follows policy (lines 75-83)
✅ **Security:** HttpOnly cookies, secure flags in production
✅ **Testing:** Unit + integration tests with evidence

## Verification Evidence

### Unit Tests
```
npm test -- session.test.ts
PASS lib/auth/__tests__/session.test.ts
  ✓ getSession extracts refresh token from cookie (12ms)
  ✓ refreshSession retries 3 times on failure (45ms)
  ✓ refreshSession returns error after 3 failures (38ms)
  ✓ getSession handles missing cookie gracefully (8ms)

npm test -- useSession.test.ts
PASS lib/hooks/__tests__/useSession.test.ts
  ✓ Hook detects expiring token (15ms)
  ✓ Auto-refresh triggered at 5min mark (52ms)
  ✓ Retry logic works correctly (41ms)
  ✓ Redirect happens on final failure (22ms)
  ✓ Hook returns session state correctly (10ms)

Test Suites: 2 passed, 2 total
Tests:       9 passed, 9 total
```

### Integration Test (cURL)
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# 2. Get session (extract refresh token)
curl -X GET http://localhost:3000/api/auth/session \
  -b cookies.txt

# Response:
{
  "user": { "id": "...", "email": "test@example.com" },
  "expires_at": 1730000000
}

# 3. Simulate expired access token, refresh using refresh token
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt

# Response:
{
  "access_token": "<new_token>",
  "refresh_token": "<new_refresh>",
  "expires_in": 3600
}
```

### Manual Verification
- Started dev server, logged in as test user
- Modified token to expire in 5 minutes (dev mode)
- Observed console logs: "Token expiring in 4:30, triggering refresh"
- Verified: New tokens received, cookies updated
- Verified: No logout occurred, session continued seamlessly

## Security Audit Results

✅ Token handling: Refresh token in HttpOnly cookie (not accessible to JS)
✅ Cookie security: Secure flag enabled (production), SameSite=lax
✅ Error handling: No sensitive information leaked
✅ Auth flow: Refresh endpoint requires valid token

**Auditor:** Security Auditor subagent
**Result:** No vulnerabilities found

## Agent Coordination

- Product Architect: Created specification
- Backend Engineer: Implemented server-side refresh logic
- Frontend Engineer: Implemented client-side hook
- QA Engineer: Verified functionality and edge cases
- Security Auditor: Verified security properties

## Next Steps

- Merge to main after review
- Continue with Sprint 1.5 Task 1.5-B (Onboarding Persistence)

## Rollback Plan

If issues arise:
```bash
git revert <commit-hash>
```

Session management will fall back to previous behavior (manual refresh or re-login required).

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
Claude Code: "PR created: #XX
URL: [GitHub PR link]

Summary:
- Files changed: 5 (+487, -23)
- Tests: 9 new, all passing
- Policy compliance: Verified
- Security audit: Passed
- Ready for review

Next Sprint 1.5 task: Onboarding Persistence (Task 1.5-B)
Estimated: 2-3 days
Should I start planning that now, or wait for this PR to merge?"
```

#### Outputs from Phase 5

- ✅ Comprehensive test results with evidence
- ✅ Security audit report (if applicable)
- ✅ Performance benchmarks (if applicable)
- ✅ STATUS.md updated
- ✅ AGENT_STATUS.md updated
- ✅ AUTO_LOG.md entry (if decision made)
- ✅ Pull request created with complete evidence
- ✅ Ready for code review and merge

---

## Special Workflows

### Parallel Agent Execution

When tasks are independent, launch agents in parallel:

```
You: "I need both backend API and frontend UI for race management"

Claude Code: "Both components are independent once we have the API contract.
I'll launch Backend and Frontend engineers in parallel."

[Single message with TWO Task tool calls:]

Task 1: Backend Engineer - Create CRUD routes for /api/races
Task 2: Frontend Engineer - Create race management UI components

[Both agents run simultaneously]

Claude Code: "Both complete:
Backend: app/api/races/route.ts + app/api/races/[id]/route.ts
Frontend: components/races/RaceManager.tsx + hooks/useRaces.ts

Integration verified. Ready for QA..."
```

### Handling Blockers Mid-Implementation

If an agent encounters a blocker:

```
Backend Engineer: "Cannot implement athlete profile API - missing unique
constraint on athlete_profiles.email (policy requirement line 43)"

Claude Code: [Recognizes database blocker]
"Blocker identified. This is a database change.
Launching Database Engineer to add constraint..."

[Launches Database Engineer]

Database Engineer: [Creates migration for unique constraint]

Claude Code: "Constraint added via migration 20251027_athlete_email_unique.sql
Blocker resolved. Resuming Backend Engineer..."

[Backend Engineer continues]
```

### Making Architectural Decisions During Implementation

If a decision point arises:

```
Frontend Engineer: "Should athlete profile use React Context or per-page fetching?"

Claude Code: [Recognizes architectural decision]
"This is an architectural decision that needs your input.

Current: Per-page apiClient calls
Proposed: React Context for global athlete state

Trade-offs:
- Context: Fewer fetches, but adds complexity
- Per-page: Simple, but potential redundant fetches

Current usage patterns: 3 pages need athlete profile
Recommendation: Add Context (benefit outweighs cost)

Should I:
1. Proceed with Context (create ADR, continue)
2. Keep per-page approach (simpler)
3. Pause for your decision

Your call?"

You: "Proceed with Context"

Claude Code: [Adds AUTO_LOG.md entry]
[Instructs Frontend Engineer to use Context approach]
```

---

## Quality Gates (Preserved from Cursor Workflow)

Every implementation must pass these gates before merge:

### Code Quality
- ✅ TypeScript strict mode (no `any` types)
- ✅ ESLint passing (no warnings)
- ✅ All tests passing
- ✅ Test coverage ≥80% for new code

### Policy Compliance
- ✅ **ETag Policy:** All GET endpoints have canonical JSON + SHA-256 ETags, 304 support
- ✅ **Auth Mapping:** All athlete-scoped routes use `getAthleteId()`, JWT verified
- ✅ **RLS Policy:** All athlete data protected, tested with 3-account isolation

### Evidence Requirements
- ✅ cURL examples demonstrating acceptance criteria
- ✅ Test output (unit + integration)
- ✅ Security audit (for auth/data access changes)
- ✅ Screenshots/logs for UI changes

### Size & Reversibility
- ✅ ≤1 hour of change per commit (small, incremental)
- ✅ Migrations include rollback scripts
- ✅ Clear rollback plan in PR

---

## Workflow Quick Reference

### Starting a New Feature
```
1. Discuss scope with Claude Code (Orchestrator)
2. Claude Code analyzes dependencies, proposes approach
3. [Optional] Launch Product Architect for complex spec
4. You approve plan
5. Claude Code launches implementation agents
6. Claude Code launches verification agents
7. Claude Code creates PR with evidence
8. You review and merge
```

### Fixing a Bug
```
1. Describe bug to Claude Code
2. Claude Code identifies affected component
3. Launch appropriate specialist (QA/Backend/Frontend)
4. Agent diagnoses and fixes
5. Launch QA for regression testing
6. Create PR with fix + tests
```

### Making a Decision
```
1. Present decision to Claude Code
2. Claude Code analyzes trade-offs
3. Claude Code recommends approach
4. You decide
5. Claude Code documents in AUTO_LOG.md
6. Proceed with implementation
```

---

## Success Indicators

You'll know the workflow is working well when:

- ✅ Features delivered with high quality, low defects
- ✅ Policy compliance is automatic (agents enforce)
- ✅ PRs have comprehensive evidence (no guesswork)
- ✅ Coordination is seamless (you don't manage handoffs)
- ✅ You spend time on decisions, not mechanics
- ✅ Code review is straightforward (evidence provided)

---

## Troubleshooting

### "Agent returned incorrect implementation"

**Solution:** Re-launch agent with more specific prompt
```
Claude Code: "Backend Engineer returned code that doesn't follow ETag policy.
Re-launching with explicit policy requirements..."
```

### "Agents working on conflicting changes"

**Solution:** Sequential execution for dependent tasks
```
Claude Code: "Frontend needs Backend API first. Switching to sequential:
1. Backend Engineer → 2. Frontend Engineer"
```

### "Not sure which agent to use"

**Solution:** Ask Claude Code
```
You: "Who should handle caching optimization?"
Claude Code: "That's Performance Engineer. Launching with context..."
```

---

## Comparison: Cursor vs Claude Code Workflow

| Phase | Cursor | Claude Code |
|-------|--------|-------------|
| **C0 Planning** | Read CURSOR_BOOT.md manually | Claude Code analyzes automatically |
| | Create context digest A-J | Claude Code maintains context |
| | Propose plan in text | Claude Code proposes with agent assignments |
| **C1 Implementation** | Single agent does all | Multiple specialists (Backend, Frontend, DB) |
| | Sequential only | Parallel when possible |
| | Developer switches contexts | Claude Code manages handoffs |
| **C5 Verification** | Single agent verifies | Multiple specialists (QA, Security, Performance) |
| | Developer compiles evidence | Claude Code compiles automatically |
| | Manual PR creation | Claude Code creates PR with evidence |

**Both preserve:** Quality standards, policy compliance, evidence-based verification, decision tracking

---

## Next Steps

1. **Familiarize yourself with CLAUDE.md** - Central reference for all agents
2. **Try the workflow** - Pick a Sprint 1.5 gap and let Claude Code coordinate
3. **Provide feedback** - Improve agent prompts and coordination based on results
4. **Iterate** - Refine process as you learn what works best

---

**For current project status and active tasks:**
- `docs/process/STATUS.md` - Sprint progress
- `docs/process/AGENT_STATUS.md` - Active agent assignments
- `/CLAUDE.md` - Agent roster and capabilities
