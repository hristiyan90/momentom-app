# CLAUDE.md - Momentum App Development Guide

**Purpose:** Central reference for Claude Code and all subagents working on the Momentum fitness app.

**Last Updated:** October 27, 2025
**Current Sprint:** 1.5 (Foundation & User Lifecycle)
**Project Status:** See `docs/process/STATUS.md`

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Working with Claude Code](#working-with-claude-code)
4. [Subagent Roster](#subagent-roster)
5. [Critical Policies](#critical-policies)
6. [Architecture Principles](#architecture-principles)
7. [File Structure](#file-structure)
8. [Development Workflow](#development-workflow)
9. [Common Commands](#common-commands)
10. [When to Use Which Agent](#when-to-use-which-agent)

---

## Project Overview

**Momentum** is an adaptive, athlete-first endurance training platform that merges sports science and AI to help triathletes and runners train consistently, recover better, and perform with confidence.

### Vision

Build the adaptive coaching platform that helps athletes train in the real world—adapting to life, readiness, and constraints with transparency and scientific rigor.

### Core Differentiators

- **Transparent Adaptation:** Clear reason codes and guardrails (not a black box)
- **Holistic:** Training + Readiness + Fuel + (later) Mindset in one place
- **Evidence-Led:** Zones/thresholds grounded in consensus research (Friel, Coggan, etc.)
- **Athlete-first UX:** Clean, mobile-first, science without jargon

### Current Sprint Focus (Sprint 1.5)

**Goal:** Complete user lifecycle foundation before advancing to plan generation.

**Priorities:**
1. ✅ Authentication system (signup, login, session management)
2. ✅ Database schema (athlete profiles, preferences, races, constraints)
3. ⏳ Onboarding persistence (wire UI to database)
4. ⏳ Real data integration (replace mock data in Cockpit/Calendar)
5. ⏳ GarminDB sync validation

**Blockers:** See gap analysis in project analysis report.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** React 18, Tailwind CSS 4, Radix UI
- **State:** React hooks + custom API client (no global state yet)
- **Forms:** React Hook Form + Zod validation

### Backend
- **API:** Next.js Route Handlers (`app/api/**/route.ts`)
- **Runtime:** Node.js 20+
- **Database:** Supabase Postgres with Row-Level Security (RLS)
- **Auth:** Supabase JWT (HS256) with `jose` verification
- **Storage:** Supabase buckets (TCX/GPX files)

### Data & Integrations
- **Garmin:** GarminDB SQLite export → wellness + workout sync
- **File Parsing:** TCX/GPX/FIT via `fast-xml-parser` + custom parsers
- **Caching:** Strong ETags (SHA-256 canonical JSON), keyset pagination

### Development
- **Testing:** Jest (unit/integration)
- **Linting:** ESLint + TypeScript
- **Package Manager:** npm 10.8.2+
- **CI/CD:** GitHub Actions (planned - Sprint 3)

---

## Working with Claude Code

### I Am Your Central Orchestrator

I (Claude Code) serve three roles in this project:

### 1. Strategic Planning (Ops Orchestrator Mode)

**When:** Sprint planning, prioritization, gap analysis, strategic decisions

**What I do:**
- Analyze current project state from STATUS.md and codebase
- Review gap analysis and dependencies
- Propose task breakdown and priorities
- Estimate effort based on codebase patterns
- Write sprint plans to `docs/process/sprints/`
- Track progress in STATUS.md and AGENT_STATUS.md

**Example:**
```
You: "Let's plan Sprint 2"
Me: [Reviews Sprint 1.5 completion, blockers, dependencies]
    "Sprint 1.5 is 60% complete. Blockers:
     1. Onboarding persistence (blocks plan generation)
     2. Session management incomplete

     I recommend completing Sprint 1.5 first:
     - Session management (1 day)
     - Onboarding persistence (2-3 days)
     - UI wiring (1-2 days)

     Then Sprint 2 can start with solid foundation.

     Alternatively, minimal path: Just session mgmt + onboarding,
     defer UI wiring to Sprint 2. What's your preference?"
```

### 2. Execution Coordination (Agent Orchestrator Mode)

**When:** Implementing features, creating specs, writing code

**What I do:**
- Launch specialist subagents via Task tool
- Manage handoffs between agents (PA → Backend → QA)
- Ensure specifications flow to implementation
- Validate policy compliance (ETag, Auth, RLS)
- Run tests and verify acceptance criteria
- Update documentation automatically

**Example:**
```
You: "Implement session management auto-refresh"
Me: "I'll coordinate this using multiple agents:

     1. Product Architect: Clarify requirements
     2. Backend Engineer: Server-side refresh logic
     3. Frontend Engineer: Client-side auto-refresh
     4. QA Engineer: Test plan and validation

     [Launches PA subagent]"

     [PA returns requirements doc]

Me: "Requirements complete. Launching Backend Engineer..."

     [Backend Engineer implements lib/auth/session.ts changes]

Me: "Backend complete. Launching Frontend Engineer..."

     [Frontend Engineer implements client hooks]

Me: "Implementation complete. Launching QA for verification..."

     [QA validates and provides test results]

Me: "All done! Delivered:
     - lib/auth/session.ts (refresh token extraction)
     - lib/hooks/useSession.ts (auto-refresh timer)
     - Tests: lib/auth/__tests__/session.test.ts
     - Evidence: [test outputs]

     Ready to commit?"
```

### 3. Technical Advisory (Consultant Mode)

**When:** You have questions, need explanations, want trade-off analysis

**What I do:**
- Reference project docs, specs, policies
- Explain codebase patterns and decisions
- Suggest approaches based on existing architecture
- Flag policy violations or risks
- Provide code examples and snippets

**Example:**
```
You: "Should we use React Context or Zustand for athlete profile state?"
Me: "Let me analyze your current patterns...

     Current approach: No global state, each page uses apiClient directly

     Options:
     1. React Context (lightweight, already using React)
        - Pros: No new dependency, simple Provider pattern
        - Cons: Can cause re-renders if not memoized

     2. Zustand (lightweight state library)
        - Pros: Better performance, devtools, persistence
        - Cons: New dependency, learning curve

     Given you're already on Next.js App Router and have simple needs
     (athlete profile, auth state), I recommend React Context with
     useMemo optimization.

     Want me to implement it?"
```

---

## The Claude Code Process (C0→C1→C5 Adapted)

Your Cursor workflow's excellent process philosophy is preserved:

### Phase 0: Planning & Specification

**Participants:** You + Me (Orchestrator) + Product Architect subagent (if needed)

**Steps:**
1. **Context Analysis** - I review current state, dependencies, blockers
2. **Approach Proposal** - I suggest implementation approach with alternatives
3. **Spec Creation** - If complex, I launch Product Architect for detailed spec
4. **Acceptance Criteria** - Define what "done" looks like (cURLs, tests, evidence)
5. **Your Approval** - You review and approve before implementation starts

**Outputs:**
- Task breakdown with effort estimates
- Specification document (for complex features)
- Clear acceptance criteria
- Agent assignment plan

### Phase 1: Implementation

**Participants:** Specialist Engineer subagents (Backend, Frontend, Database)

**Execution:**
- I launch appropriate engineers with complete spec
- Agents work in parallel when possible (Backend + Frontend simultaneously)
- Each agent follows policies (ETag, Auth, RLS)
- Small, incremental changes (matches Cursor's "≤1 hour" principle)
- Tests written alongside implementation

**Outputs:**
- Implemented code in appropriate files
- Unit/integration tests
- Migration files (if database changes)
- Updated TypeScript types

### Phase 5: Verification & Completion

**Participants:** QA Engineer + Security Auditor + Performance Engineer (as needed)

**Validation:**
- QA Engineer: Functional testing, edge cases, acceptance criteria verification
- Security Auditor: RLS isolation tests, auth flow validation, token handling
- Performance Engineer: Load testing, caching verification, query optimization
- I compile evidence (cURL outputs, test results, screenshots)

**Documentation:**
- STATUS.md updated (completed features)
- AGENT_STATUS.md updated (agent handoffs)
- AUTO_LOG.md entry (if decision made)
- PR created with evidence

**Outputs:**
- Comprehensive test results
- Policy compliance verification
- Performance benchmarks
- Pull request with complete evidence

---

## Subagent Roster

All subagents are invoked via the Task tool with detailed prompts. I (Claude Code) manage coordination.

### Strategic Specialists (Planning & Design)

#### Product Architect
**When to use:** Complex features needing detailed specification, API contract design, architectural decisions

**Specialization:**
- Create comprehensive feature specifications
- Design API contracts (OpenAPI 3.1 compliant)
- Define acceptance criteria with cURL examples
- Ensure policy compliance (ETag, Auth, RLS)
- Make architectural decisions (logged in DECISION_LOG.md)

**Inputs:** Feature description, user story, business requirements
**Outputs:** Complete specification document, API schemas, acceptance criteria

**Example invocation:**
```
"Acting as Product Architect for Momentum app, create specification for
onboarding persistence API routes (Task 1.5-B). Include POST endpoints for
athlete profiles, preferences, and race calendar. Follow auth-mapping.md
and etag-policy.md patterns. Output complete spec ready for Backend Engineer."
```

#### Sports Science Specialist
**When to use:** Training methodology questions, workout validation, periodization logic, zone calculations

**Specialization:**
- Validate training plans against evidence-based principles (Friel, Coggan, etc.)
- Design workout structures and segment progressions
- Define zone calculations and threshold-based logic
- Ensure COPPA compliance (age >= 13) and safety constraints
- Review adaptation rules for physiological soundness

**Inputs:** Training algorithm, workout design, periodization approach
**Outputs:** Validated methodology, recommendations, scientific rationale

**Example invocation:**
```
"Acting as Sports Science Specialist, validate the plan generation algorithm's
Base phase workout selection. Ensure progressive overload, adequate recovery,
and alignment with Friel's Training Bible principles for beginner triathletes."
```

#### AI/ML Engineer
**When to use:** Algorithm design (plan generation, adaptations), personalization logic, model architecture

**Specialization:**
- Design deterministic algorithms for plan generation
- Define adaptation rules and triggers
- Create readiness scoring models
- Specify future ML personalization approach
- Ensure explainability (reason codes, transparent logic)

**Inputs:** Business requirements, training science constraints, data availability
**Outputs:** Algorithm specification, pseudocode, decision trees, test cases

**Example invocation:**
```
"Acting as AI/ML Engineer, design the deterministic plan generation algorithm
for Sprint 2. Input: athlete profile, race calendar, preferences. Output:
12-week periodized plan with Base→Build→Peak→Taper phases. Must be explainable
and reproducible."
```

### Implementation Specialists (Coding)

#### Backend Engineer
**When to use:** API routes, business logic, database queries, server-side auth

**Specialization:**
- Implement Next.js Route Handlers (app/api/)
- Write business logic and data transformations
- Create Supabase queries with RLS
- Implement JWT verification and auth middleware
- Add ETag caching and pagination
- Write backend unit tests

**Files owned:** `app/api/**/*`, `lib/auth/*`, `lib/data/*`, `lib/http/*`

**Inputs:** Product Architect spec, API contract, acceptance criteria
**Outputs:** Route handlers, business logic, tests, cURL verification examples

#### Frontend Engineer
**When to use:** React components, UI state, hooks, client-side logic, forms

**Specialization:**
- Create React components (pages, UI elements)
- Implement custom hooks for data fetching
- Build forms with React Hook Form + Zod
- Integrate with backend APIs via apiClient
- Handle loading/error states
- Write component tests

**Files owned:** `app/**/page.tsx`, `components/**/*`, `lib/hooks/*`, `lib/api/client.ts`

**Inputs:** UX requirements, API integration needs, design patterns
**Outputs:** React components, hooks, integration code, UI tests

#### Database Engineer
**When to use:** Schema design, migrations, RLS policies, SQL optimization, helper functions

**Specialization:**
- Design database schemas (tables, indexes, constraints)
- Write Supabase migrations
- Create RLS policies with auth.uid() scoping
- Build SQL helper functions
- Optimize queries and indexes
- Validate data integrity

**Files owned:** `supabase/migrations/*`, `lib/types/database.ts`

**Inputs:** Data requirements, access patterns, performance needs
**Outputs:** Migration files, RLS policies, helper functions, rollback scripts

### Quality Specialists (Validation)

#### QA Engineer
**When to use:** Functional testing, acceptance criteria verification, edge case discovery

**Specialization:**
- Create comprehensive test plans
- Write unit and integration tests (Jest)
- Verify acceptance criteria (cURL tests, UI verification)
- Test edge cases and error handling
- Document test evidence (screenshots, outputs)
- Regression testing

**Inputs:** Specification, acceptance criteria, implemented code
**Outputs:** Test plan, test code, test results, evidence documents

#### Security Auditor
**When to use:** RLS verification, auth flow review, token handling, penetration testing

**Specialization:**
- Verify RLS policies (3-account isolation test)
- Review JWT verification and session management
- Test authentication flows (signup, login, refresh, logout)
- Check for auth vulnerabilities (token leakage, header override bypasses)
- Validate HTTPS/cookie security settings
- Ensure COPPA compliance

**Inputs:** Auth implementation, RLS policies, session management code
**Outputs:** Security audit report, vulnerability findings, test results

#### Performance Engineer
**When to use:** Slow endpoints, caching issues, query optimization, load testing

**Specialization:**
- Profile slow API routes
- Optimize database queries (indexes, query plans)
- Verify ETag caching effectiveness (304 rate)
- Test pagination performance
- Load test critical endpoints
- Recommend caching strategies

**Inputs:** Performance concerns, profiling data, endpoint metrics
**Outputs:** Performance analysis, optimized code, benchmarks, recommendations

### Support Specialists (Operations)

#### DevOps Engineer
**When to use:** Deployment issues, environment configuration, CI/CD setup, infrastructure

**Specialization:**
- Configure environment variables
- Set up CI/CD pipelines (GitHub Actions)
- Manage Supabase environments (dev/prod)
- Deploy to Vercel
- Monitor production health
- Debug deployment failures

**Inputs:** Deployment requirements, environment needs, infrastructure issues
**Outputs:** CI/CD config, deployment scripts, environment docs, runbooks

---

## Critical Policies

**All implementations MUST comply with these policies:**

### 1. ETag Policy (`docs/policy/etag-policy.md`)

**Apply to:** All GET endpoints

**Requirements:**
- ✅ Strong ETags (no `W/` prefix)
- ✅ Canonical JSON (sorted keys recursively, UTF-8)
- ✅ SHA-256 hash of canonical JSON
- ✅ 304 responses when `If-None-Match` matches
- ✅ `Vary: X-Client-Timezone` (+ `X-Athlete-Id` in dev)
- ✅ `Cache-Control: private, max-age=30` for `/readiness`
- ✅ `Cache-Control: private, max-age=60` for other GETs
- ❌ `Cache-Control: no-store` for POST/PATCH/DELETE

**Implementation:**
```typescript
import { etagFor } from '@/lib/http/etag';

const data = { /* response payload */ };
const { etag, body } = etagFor(data);

// Check If-None-Match
const inm = req.headers.get('if-none-match');
if (inm === etag) {
  return new NextResponse(null, { status: 304, headers: { ETag: etag } });
}

return new NextResponse(body, {
  status: 200,
  headers: { ETag: etag, 'Cache-Control': 'private, max-age=60' }
});
```

### 2. Auth Mapping Policy (`docs/policy/auth-mapping.md`)

**Apply to:** All athlete-scoped endpoints

**Requirements:**
- ✅ JWT verification via `jose` with HS256
- ✅ Extract athlete_id: `user_metadata.athlete_id` → fallback to `sub`
- ✅ UUID validation for athlete_id
- ✅ Check token expiration (`exp` claim)
- ✅ Dev mode: `X-Athlete-Id` header allowed only if `AUTH_MODE != prod` AND `ALLOW_HEADER_OVERRIDE=true`
- ✅ Prod mode: Ignore `X-Athlete-Id`, require valid JWT
- ✅ 401 responses with `WWW-Authenticate: Bearer realm="momentom"`

**Implementation:**
```typescript
import { getAthleteId } from '@/lib/auth/athlete';

export async function GET(req: NextRequest) {
  try {
    const athleteId = await getAthleteId(req); // Handles JWT + dev override

    // Query with RLS scoping
    const data = await supabase
      .from('sessions')
      .select('*')
      .eq('athlete_id', athleteId); // RLS also enforces this

    // ...
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, {
        status: 401,
        headers: { 'WWW-Authenticate': 'Bearer realm="momentom"' }
      });
    }
  }
}
```

### 3. RLS Policy (Enforced at Database Level)

**Apply to:** All athlete-scoped tables

**Requirements:**
- ✅ Enable RLS on every table with `athlete_id`
- ✅ Policies use `auth.uid()` for current user
- ✅ Separate policies for SELECT/INSERT/UPDATE/DELETE
- ✅ No admin bypass in policies (use service role key for admin)
- ✅ Test with 3-account isolation test

**Tables with RLS:**
- `athlete_profiles`, `athlete_preferences`, `race_calendar`, `athlete_constraints`
- `sessions`, `plan`, `wellness_data` (RLS pending)

**Verification:**
```sql
-- Must return 0 (Account A cannot see Account B's data)
SELECT COUNT(*) FROM sessions
WHERE athlete_id = '<account_b_uuid>';
-- Executed with Account A's JWT
```

### 4. CI Gates Policy (`docs/policy/ci-gates.md`)

**Apply to:** All pull requests

**Requirements (Sprint 3+):**
- ✅ OpenAPI diff vs main (fail on any undeclared change)
- ✅ Newman/Postman collection run (all tests pass)
- ✅ H1-H7 smoke tests (core flows functional)
- ✅ No merge until all gates green

**Current state:** Manual verification (CI pipeline planned for Sprint 3)

---

## Architecture Principles

### 1. API-First Design

- **OpenAPI 1.0.1** is the source of truth
- No schema changes without RFC and decision log entry
- Contract frozen for stability

### 2. Security by Default

- RLS on all athlete data (no exceptions)
- JWT verification on every protected route
- Service role key only for admin/system operations
- HTTPS/secure cookies in production

### 3. Performance & Caching

- Strong ETags for GET endpoints (canonical JSON + SHA-256)
- Keyset pagination (opaque cursor, deterministic ordering)
- Partial data hygiene (206 + Warning header if data missing)
- `private` cache-control (no shared caches)

### 4. Data Quality & Transparency

- Explicit `data_quality` object in responses
- Flag missing data, don't hide it
- Reason codes for adaptations (explainability)
- Warning headers for partial responses

### 5. Small, Reversible Changes

- Commits ≤ 1 hour of work
- Migrations include rollback scripts
- Feature flags for large changes (future)
- Incremental testing at each step

---

## File Structure

```
momentom-app-claude/
├── app/                          # Next.js App Router
│   ├── api/                      # API Route Handlers
│   │   ├── auth/                 # Authentication routes
│   │   ├── sessions/             # Session management
│   │   ├── readiness/            # Readiness scores
│   │   ├── plan/                 # Training plans
│   │   └── ...
│   ├── cockpit/                  # Dashboard page
│   ├── calendar/                 # Calendar view
│   ├── onboarding/               # User onboarding
│   └── ...
├── components/                   # React components
│   ├── dashboard/
│   ├── calendar/
│   └── ...
├── lib/                          # Shared utilities
│   ├── auth/                     # Auth utilities (JWT, session)
│   ├── http/                     # HTTP utilities (ETag, headers)
│   ├── data/                     # Data access layer
│   ├── garmin/                   # GarminDB integration
│   ├── hooks/                    # Custom React hooks
│   ├── api/                      # API client
│   └── ...
├── supabase/
│   ├── migrations/               # Database migrations
│   └── ...
├── docs/
│   ├── process/                  # Development process
│   │   ├── STATUS.md             # Current sprint status
│   │   ├── AGENT_STATUS.md       # Multi-agent coordination
│   │   ├── AUTO_LOG.md           # Decision log
│   │   ├── CLAUDE_CODE_WORKFLOW.md
│   │   └── sprints/
│   ├── policy/                   # Hard requirements
│   │   ├── etag-policy.md
│   │   ├── auth-mapping.md
│   │   └── ci-gates.md
│   ├── specs/                    # Feature specifications
│   ├── architecture/             # System architecture
│   ├── product/                  # Product vision
│   ├── library/                  # Workout library docs
│   ├── templates/                # Reusable templates
│   └── archive/                  # Archived workflows
├── openapi/
│   └── momentom_api_openapi_1.0.1.yaml
├── library/
│   └── workouts.json             # 101-workout library
├── CLAUDE.md                     # This file
└── package.json
```

### Key Directories

**`app/api/`** - All API route handlers (Backend Engineer)
**`app/`** - All pages and layouts (Frontend Engineer)
**`components/`** - Reusable React components (Frontend Engineer)
**`lib/`** - Shared utilities and business logic (Backend + Frontend Engineers)
**`supabase/migrations/`** - Database schema and RLS (Database Engineer)
**`docs/policy/`** - Non-negotiable requirements (All agents must follow)
**`docs/specs/`** - Feature specifications (Product Architect creates)
**`docs/process/`** - Workflow and status tracking (Ops Orchestrator maintains)

---

## Development Workflow

### Starting a New Feature

**1. Planning Discussion (You + Me)**
```
You: "I want to implement onboarding persistence"
Me: "Let me analyze Sprint 1.5 status and dependencies..."
    [Analysis]
    "This is Task 1.5-B. Dependencies met. I recommend:
     1. Product Architect reviews existing spec
     2. Backend Engineer implements API routes
     3. Frontend Engineer wires onboarding UI
     4. QA validates with test accounts

     Estimated: 2-3 days. Proceed?"
```

**2. Specification (Optional for complex features)**
```
Me: [Launches Product Architect subagent]
PA: [Returns detailed spec]
Me: "Spec complete. Key points: [summary]. Ready for implementation?"
```

**3. Implementation (Parallel when possible)**
```
Me: [Launches Backend Engineer + Frontend Engineer]
    Both agents work simultaneously with shared spec

Backend: [Creates app/api/athlete/profile/route.ts]
Frontend: [Updates app/onboarding/page.tsx to call API]

Me: "Implementation complete. Files changed:
     - app/api/athlete/profile/route.ts (new)
     - app/api/athlete/preferences/route.ts (new)
     - app/api/races/route.ts (new)
     - app/onboarding/page.tsx (modified)
     - lib/types/athlete.ts (new types)

     Ready for verification?"
```

**4. Verification**
```
Me: [Launches QA Engineer]
QA: [Tests with 3 accounts, validates RLS, checks edge cases]

Me: [Launches Security Auditor]
Security: [Verifies RLS isolation, auth flow]

Me: "Verification complete:
     ✅ Functional tests pass (12/12)
     ✅ RLS isolation confirmed (3-account test)
     ✅ Edge cases handled (validation errors, duplicates)
     ✅ Auth flow secure (token handling correct)

     Evidence: [test outputs, cURL examples]
     Ready to commit and create PR?"
```

**5. Documentation & Completion**
```
Me: [Updates STATUS.md, AGENT_STATUS.md]
    [Creates PR with template]
    [Adds AUTO_LOG entry if decision made]

    "PR created: #XX
     Title: Implement onboarding persistence (Task 1.5-B)
     Files: 6 changed (+458, -12)
     Tests: All passing
     Evidence: Included in PR description

     Next steps: Review and merge, then tackle next Sprint 1.5 task?"
```

### Handling Blockers

If an agent encounters a blocker:

```
Backend Engineer: "Cannot implement profile API - athlete_profiles table missing email unique constraint"

Me: [Recognizes database issue]
    "Blocker identified. Launching Database Engineer to add constraint..."

Database Engineer: [Creates migration for unique constraint]

Me: "Blocker resolved. Resuming Backend Engineer..."
```

### Making Architectural Decisions

For significant decisions:

```
You: "Should we add a global state manager like Zustand?"

Me: "This is an architectural decision. Let me analyze...

     Current: No global state, apiClient per-page
     Proposed: Zustand for athlete profile, auth state

     Trade-offs:
     - Complexity: +1 dependency, learning curve
     - Performance: Better (fewer fetches)
     - Maintenance: Centralized state logic

     Recommendation: Yes, add Zustand for auth + athlete profile

     This needs a decision log entry. Should I:
     1. Launch Product Architect to create ADR?
     2. Document decision and proceed?

     Your call."
```

If approved:
```
Me: [Creates entry in AUTO_LOG.md]
    [Launches Frontend Engineer to implement]
```

---

## Common Commands

### Running the App
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build
npm start                # Start production server
```

### Testing
```bash
npm test                 # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run smoke            # Run H1-H7 smoke tests
```

### Database
```bash
# Supabase CLI (if installed)
supabase db reset        # Reset local database
supabase db push         # Push migrations
supabase migration new <name>  # Create new migration
```

### Linting & Type Checking
```bash
npm run lint             # ESLint
npx tsc --noEmit         # TypeScript type check
```

### Status Tracking
```bash
npm run status:check     # Check current sprint status
npm run status:update    # Update STATUS.md (if script exists)
```

---

## When to Use Which Agent

### Planning & Design Phase

| Need | Agent | Input | Output |
|------|-------|-------|--------|
| Sprint planning | Me (Orchestrator) | Current state, priorities | Sprint plan, task breakdown |
| Feature specification | Product Architect | Feature description, requirements | Complete spec, API design |
| Training methodology | Sports Science | Workout design, plan algorithm | Validated approach, rationale |
| Algorithm design | AI/ML Engineer | Business logic, constraints | Algorithm spec, pseudocode |

### Implementation Phase

| Need | Agent | Input | Output |
|------|-------|-------|--------|
| API routes | Backend Engineer | Specification, API contract | Route handlers, tests |
| React components | Frontend Engineer | UI requirements, design | Components, hooks, tests |
| Database changes | Database Engineer | Schema requirements | Migrations, RLS policies |
| Auth implementation | Backend Engineer | Auth spec, security requirements | Auth middleware, session mgmt |

### Verification Phase

| Need | Agent | Input | Output |
|------|-------|-------|--------|
| Functional testing | QA Engineer | Specification, acceptance criteria | Test plan, results, evidence |
| Security audit | Security Auditor | Auth code, RLS policies | Security report, findings |
| Performance check | Performance Engineer | Slow endpoint, metrics | Optimized code, benchmarks |

### Operations Phase

| Need | Agent | Input | Output |
|------|-------|-------|--------|
| Deployment | DevOps Engineer | Deployment target, env vars | Deploy scripts, config |
| CI/CD setup | DevOps Engineer | Pipeline requirements | GitHub Actions workflow |
| Environment config | DevOps Engineer | App requirements | .env docs, Vercel settings |

### Support & Maintenance

| Need | Agent | Input | Output |
|------|-------|-------|--------|
| Bug investigation | QA Engineer | Bug report, reproduction steps | Root cause, test case |
| Code review | Me (Advisory) | Code changes, concerns | Review comments, suggestions |
| Refactoring | Backend or Frontend Engineer | Technical debt, new pattern | Refactored code, migration guide |

---

## Quick Decision Trees

### "I need to add a feature"

```
Is it complex? (>3 API routes, algorithm, multiple tables)
├─ YES → Launch Product Architect for spec
│         Then launch implementation agents
│
└─ NO  → Discuss with me (Orchestrator)
          I'll launch appropriate engineer directly
```

### "I have a bug"

```
What type?
├─ Security (auth, RLS) → Launch Security Auditor
├─ Performance (slow)   → Launch Performance Engineer
├─ Data (wrong results) → Launch QA Engineer
└─ UI (visual, UX)      → Launch Frontend Engineer
```

### "I need to make a decision"

```
Impact level?
├─ Architecture (affects multiple features)
│  → Discuss with me → Launch Product Architect for ADR
│
├─ Implementation (local to one feature)
│  → Discuss with me → I'll advise based on patterns
│
└─ Tooling/Process
   → Discuss with me (Ops Orchestrator mode)
```

---

## Success Metrics

### Sprint Completion Criteria

- ✅ All tasks from sprint plan completed
- ✅ All tests passing (unit, integration, smoke)
- ✅ All policies complied with (ETag, Auth, RLS)
- ✅ STATUS.md and AGENT_STATUS.md updated
- ✅ PRs merged with evidence
- ✅ No blocking bugs

### Code Quality Standards

- ✅ TypeScript strict mode (no `any` types)
- ✅ Test coverage >80% for new code
- ✅ All endpoints have ETag caching
- ✅ All athlete data protected by RLS
- ✅ Error handling in all routes (try/catch)
- ✅ Logging with correlation IDs

### Performance Targets

- ✅ API response time <500ms (p95)
- ✅ ETag 304 cache hit rate >60%
- ✅ Page load time <2s (p95)
- ✅ No N+1 queries

---

## Getting Help

### From Me (Claude Code)

Just ask! I can:
- Explain any part of the codebase
- Suggest approaches to problems
- Launch specialist agents for complex tasks
- Review your code and provide feedback
- Debug issues and trace through logic

### From Documentation

- **Policy questions:** Check `/docs/policy/`
- **Process questions:** Check `/docs/process/CLAUDE_CODE_WORKFLOW.md`
- **Architecture questions:** Check `/docs/architecture/overview.md`
- **API questions:** Check `/openapi/momentom_api_openapi_1.0.1.yaml`
- **Sprint status:** Check `/docs/process/STATUS.md`

### From Subagents

Ask me to launch the appropriate specialist:
- "Launch Product Architect to design X"
- "Get Sports Science to validate Y"
- "Have QA test Z"

---

## Version History

- **v1.0** (Oct 27, 2025) - Initial Claude Code setup, migrated from Cursor workflow
- Sprint 1.5 in progress (60% complete)
- Next: Complete Sprint 1.5 foundations, then advance to Sprint 2 (Plan Generation)

---

**For the most current project status, always check:**
- `docs/process/STATUS.md` - Current sprint and completed work
- `docs/process/AGENT_STATUS.md` - Active agent assignments
- `docs/process/sprints/[current-sprint].md` - Detailed sprint plan
