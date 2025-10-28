# Sprint 1.5 Foundation Fix - Option A

**Started:** October 27, 2025
**Status:** In Progress - Day 1
**Current Task:** GAP-2 (Session Management Auto-Refresh)

---

## Overview

Systematic fix of Sprint 1.5 gaps to achieve solid foundation before Sprint 2.

**Goal:** Complete Sprint 1.5 to 100%, with fully functional UI for dogfooding.

**Timeline:** ~2 weeks (8-9 days of work)

**Approach:** Multi-agent coordination via Claude Code

---

## Task Breakdown

### Week 1: Critical Path (4-5 days)

#### ✅ Day 0: Setup Complete
- [x] Project onboarding and analysis
- [x] Multi-agent system created
- [x] Option A selected and planned
- [x] Task breakdown documented

#### 🔄 Day 1: Session Management (GAP-2) - IN PROGRESS
**Status:** Backend Engineer launched, awaiting completion

**Subtasks:**
- [ ] Backend: Fix `lib/auth/session.ts` refresh token extraction (2 hours)
  - Fix `getSession()` to extract from `sb-refresh-token` cookie
  - Add retry logic to `refreshSession()` (3 attempts, exponential backoff)
  - Create unit tests
- [ ] Frontend: Create `lib/hooks/useSession.ts` (3 hours)
  - Auto-refresh hook with 5-min advance warning
  - Retry logic with exponential backoff
  - Redirect to /login on final failure
- [ ] QA: Verification (1 hour)
  - Test auto-refresh flow
  - Test retry attempts
  - Test edge cases

**Blocked by:** Task invocation limit (resets 10pm)

**Next Steps When Resumed:**
1. Backend Engineer completes session.ts changes
2. Frontend Engineer creates useSession hook
3. QA Engineer verifies functionality
4. Create PR with evidence

#### ⏳ Days 2-4: Onboarding Persistence (GAP-1)
**Estimated:** 2-3 days

**Agents Needed:**
- Product Architect (review spec)
- Backend Engineer (API routes)
- Frontend Engineer (UI wiring)
- QA Engineer (end-to-end testing)
- Security Auditor (RLS verification)

**Subtasks:**
- [ ] Review existing spec (Task 1.5-B)
- [ ] Create POST /api/athlete/profile
- [ ] Create POST /api/athlete/preferences
- [ ] Create POST /api/races
- [ ] Wire onboarding UI to APIs
- [ ] Test with 3 accounts (RLS isolation)

#### ⏳ Day 5: RLS & Security (GAP-6, GAP-7)
**Estimated:** 0.75 day

**Agents Needed:**
- Database Engineer
- Security Auditor

**Subtasks:**
- [ ] Add RLS policies for wellness_data table
- [ ] Execute 3-account isolation test
- [ ] Document results
- [ ] Fix any issues found

### Week 2: UI & Integration (3-4 days)

#### ⏳ Day 6: Cockpit Real Data (GAP-4)
**Estimated:** 0.5-1 day

**Agents Needed:**
- Frontend Engineer
- QA Engineer

**Subtasks:**
- [ ] Replace mockCockpitData with useCockpitData hook
- [ ] Add loading/error states
- [ ] Verify real data rendering
- [ ] Test with multiple athlete profiles

#### ⏳ Days 7-8: Calendar Backend & Integration (GAP-5)
**Estimated:** 2 days

**Agents Needed:**
- Backend Engineer
- Frontend Engineer
- QA Engineer

**Subtasks:**
- [ ] Create CRUD routes for athlete_constraints (life blockers)
- [ ] Create CRUD routes for race_calendar
- [ ] Wire calendar UI to real APIs
- [ ] Test calendar interactions
- [ ] Verify RLS on new routes

#### ⏳ Day 9: Workout Library Seeding (GAP-3)
**Estimated:** 0.5 day

**Agents Needed:**
- Database Engineer
- DevOps Engineer
- QA Engineer

**Subtasks:**
- [ ] Verify workout_library table exists (or create)
- [ ] Create seed script for library/workouts.json (101 workouts)
- [ ] Run migration/seed
- [ ] Verify: SELECT COUNT(*) = 101

---

## Progress Tracking

### Completed Tasks
- ✅ Project onboarding and comprehensive analysis
- ✅ Multi-agent system setup
- ✅ Cursor workflow archived
- ✅ CLAUDE.md and workflow docs created
- ✅ GAP-2 specification complete
- ✅ GAP-2 Backend Engineer launched

### In Progress
- 🔄 GAP-2: Session Management Auto-Refresh (Backend phase)

### Blocked
- ⛔ Awaiting task invocation limit reset (10pm)

### Pending
- ⏳ GAP-2: Frontend + QA phases
- ⏳ GAP-1: Onboarding Persistence (entire task)
- ⏳ GAP-6/7: RLS policies and testing
- ⏳ GAP-4: Cockpit wiring
- ⏳ GAP-5: Calendar backend
- ⏳ GAP-3: Library seeding

---

## Agent Coordination Log

### Session 1 (Oct 27, 2025)

**Orchestrator (Claude Code):**
- Analyzed project (auth, database, frontend, backend)
- Identified 14 gaps, prioritized into 4 critical + 3 high + 4 medium + 3 low
- Archived Cursor workflow to /docs/archive/cursor/
- Created multi-agent system (CLAUDE.md + workflow docs)
- User selected Option A (fix foundation first)
- Planned 2-week roadmap
- Launched Backend Engineer for GAP-2

**Backend Engineer:**
- Task: Implement session refresh server-side logic
- Status: Launched, awaiting invocation limit reset
- Expected Deliverables:
  - Updated lib/auth/session.ts (refresh token extraction + retry logic)
  - New lib/auth/__tests__/session.test.ts (6 test cases)
  - Verification instructions (cURL examples)

**Next Session Actions:**
1. Complete Backend Engineer task for GAP-2
2. Launch Frontend Engineer for GAP-2
3. Launch QA Engineer for GAP-2
4. Create PR for session management
5. Move to GAP-1 (Onboarding Persistence)

---

## Session Management Specification (GAP-2)

### Current State
- ✅ `refreshSession()` exists in lib/auth/session.ts
- ❌ `getSession()` returns empty refresh_token (line 60)
- ❌ No retry logic (policy requires 3 attempts)
- ❌ No client-side auto-refresh hook

### Requirements (Policy: auth-mapping.md lines 75-83)
- Auto-refresh 5 minutes before JWT expiration
- 3 retry attempts with exponential backoff (1s, 2s, 4s)
- Redirect to /login after 3 failed attempts
- Update cookies after successful refresh

### Implementation Plan

**Backend (lib/auth/session.ts):**
1. Fix `getSession()`: Extract refresh_token from `sb-refresh-token` cookie
2. Update `refreshSession()`: Add retry logic (3 attempts, exponential backoff)
3. Tests: lib/auth/__tests__/session.test.ts (6 test cases)

**Frontend (lib/hooks/useSession.ts - NEW):**
1. Create React hook that monitors session
2. Poll every 30s when expires_at < 5 minutes
3. Call refreshSession() with retry logic
4. Redirect to /login on final failure
5. Return { session, loading, error }

**Integration (app/layout.tsx):**
1. Wrap app in SessionProvider
2. useSession hook monitors globally

**Testing:**
- Unit tests for both server and client
- Integration test: Login → wait → auto-refresh
- Edge cases: Network failures, invalid token

**Estimated Effort:** 6 hours
- Backend: 2 hours
- Frontend: 3 hours
- QA: 1 hour

---

## Quality Gates

Every task must pass before moving to next:

### Code Quality
- [ ] TypeScript strict mode (no `any`)
- [ ] ESLint passing
- [ ] All tests passing
- [ ] Coverage ≥80% for new code

### Policy Compliance
- [ ] ETag policy (if applicable)
- [ ] Auth mapping policy (session management)
- [ ] RLS policy (if data access)

### Evidence
- [ ] cURL examples (acceptance criteria)
- [ ] Test output (unit + integration)
- [ ] Security audit (if auth changes)
- [ ] Screenshots/logs (if UI changes)

### Documentation
- [ ] STATUS.md updated
- [ ] AGENT_STATUS.md updated
- [ ] AUTO_LOG.md (if decision made)
- [ ] PR created with evidence

---

## Communication Protocols

### Daily Status Updates
At end of each day, update:
1. This file (progress tracking)
2. docs/process/STATUS.md (sprint completion %)
3. docs/process/AGENT_STATUS.md (agent handoffs)

### Blockers
Document immediately:
- Technical blockers (missing dependencies, API issues)
- Process blockers (waiting for decisions, clarifications)
- Resource blockers (task limits, environment issues)

### Decisions
All architectural decisions logged in:
- docs/process/AUTO_LOG.md (ADR format)

---

## Success Metrics

### Sprint 1.5 Completion Target
- **Current:** 60%
- **Target:** 100%
- **Gap:** 40 percentage points across 14 gaps

### Timeline
- **Week 1:** Critical path (4-5 days) → 85% complete
- **Week 2:** UI integration (3-4 days) → 100% complete

### Quality
- All policies complied with
- All tests passing
- All PRs merged with evidence
- No blocking bugs

---

## Next Actions (After Session Limit Reset)

**Immediate (Tonight/Tomorrow):**
1. Resume Backend Engineer for GAP-2
2. Review and commit session.ts changes
3. Launch Frontend Engineer for useSession hook
4. Launch QA Engineer for verification
5. Create PR with complete evidence

**This Week:**
- Complete GAP-2 (Day 1)
- Complete GAP-1 (Days 2-4)
- Complete GAP-6/7 (Day 5)

**Next Week:**
- Complete GAP-4 (Day 6)
- Complete GAP-5 (Days 7-8)
- Complete GAP-3 (Day 9)

---

## Contact Points

**For Questions:**
- Architecture decisions → Claude Code (Orchestrator mode)
- Implementation issues → Relevant specialist agent
- Process clarifications → docs/process/CLAUDE_CODE_WORKFLOW.md

**For Updates:**
- Daily progress → This file + STATUS.md
- Agent coordination → AGENT_STATUS.md
- Decisions → AUTO_LOG.md

---

**Status:** Ready to resume after task invocation limit resets at 10pm.

**Next Agent:** Backend Engineer (resume GAP-2 session management)
