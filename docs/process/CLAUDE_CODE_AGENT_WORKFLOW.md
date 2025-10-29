# Claude Code Multi-Agent Workflow

**Date:** October 29, 2025
**Context:** How Claude Code (me) orchestrates specialist subagents for Momentum app development

---

## Overview

I (Claude Code) serve as the **central orchestrator** that launches and coordinates specialist subagents based on the task at hand. All agents are invoked via the **Task tool** with specialized prompts defined in `CLAUDE.md`.

---

## My Role as Orchestrator

### I Am Three Modes in One:

**1. Strategic Planning (Ops Orchestrator)**
- Analyze current project state
- Break down features into tasks
- Assign agents to tasks
- Track progress and dependencies

**2. Agent Coordination (Task Manager)**
- Launch appropriate specialist agents
- Manage handoffs between agents
- Consolidate outputs
- Ensure policy compliance

**3. Direct Implementation (When Appropriate)**
- Handle simple tasks directly
- Use direct tools (Read, Write, Edit, Bash)
- Quick bug fixes and minor changes

---

## Agent Invocation Workflow

### Decision Tree: When Do I Launch Agents?

```
New Task Arrives
    ↓
Am I equipped to handle this directly?
    ├─ YES (Simple/routine task)
    │   → Use direct tools (Read, Write, Edit, Bash)
    │   → Complete task
    │   → Report results
    │
    └─ NO (Complex/specialized task)
        ↓
        What type of complexity?
        ├─ Design/Architecture
        │   → Launch Product Architect
        │
        ├─ Domain Expertise (Sports Science)
        │   → Launch Sports Science Specialist
        │
        ├─ Algorithm/Logic Design
        │   → Launch AI/ML Engineer
        │
        ├─ Backend Implementation
        │   → Launch Backend Engineer
        │
        ├─ Frontend Implementation
        │   → Launch Frontend Engineer
        │
        ├─ Database/Schema
        │   → Launch Database Engineer
        │
        ├─ Testing/Validation
        │   → Launch QA Engineer
        │
        ├─ Security Review
        │   → Launch Security Auditor
        │
        ├─ Performance Issues
        │   → Launch Performance Engineer
        │
        └─ Deployment/Ops
            → Launch DevOps Engineer
```

---

## Standard Workflow Patterns

### Pattern 1: Simple Task (Direct Execution)

**Example:** "Fix a typo in README.md"

```
Me: [Reads file with Read tool]
    [Makes edit with Edit tool]
    [Verifies change]
    "Done! Fixed typo in README.md line 42."
```

**No agents launched** - I handle it directly.

---

### Pattern 2: Single-Agent Task

**Example:** "Create RLS policies for workout_library table"

```
Me: "This requires database security expertise. Launching Database Engineer..."

    [Invokes Task tool]
    subagent_type: "general-purpose"
    prompt: "Acting as Database Engineer for Momentum app, create RLS policies
            for the workout_library table. Requirements:
            - Read-only access for all authenticated users
            - No INSERT/UPDATE/DELETE allowed (managed via migrations)
            - Follow patterns in /docs/policy/ directory
            - Include verification queries
            Output: Complete migration file ready to deploy."

    [Database Engineer works autonomously]
    [Returns: migration file + verification queries]

Me: "Database Engineer completed the work. Created:
    - /supabase/migrations/20251029_workout_library_rls.sql

    Verification queries show policies work correctly.

    Ready to deploy?"
```

**One agent launched** - Clean handoff, focused work.

---

### Pattern 3: Sequential Multi-Agent Task

**Example:** "Implement onboarding persistence API"

```
Me: "This is a multi-step implementation. Here's my plan:

    Step 1: Product Architect - Review spec and create API contract
    Step 2: Database Engineer - Verify schema is ready
    Step 3: Backend Engineer - Implement API routes
    Step 4: QA Engineer - Test and validate

    Launching Product Architect first..."

────────────────────────────────────────────────────────────
STEP 1: Product Architect
────────────────────────────────────────────────────────────

    [Invokes Task tool with Product Architect prompt]

    [PA analyzes requirements, creates spec]

    PA Returns:
    ✅ API Specification for POST /api/athlete/profile
    ✅ Request/response schemas
    ✅ Validation rules
    ✅ Acceptance criteria with cURL examples

Me: "Step 1 complete. Product Architect delivered specification.

    Moving to Step 2: Database Engineer verification..."

────────────────────────────────────────────────────────────
STEP 2: Database Engineer
────────────────────────────────────────────────────────────

    [Invokes Task tool with Database Engineer prompt]

    [DB Engineer checks schema, confirms athlete_profiles table exists]

    DB Engineer Returns:
    ✅ Schema verified - athlete_profiles table ready
    ✅ RLS policies in place
    ✅ No migrations needed

Me: "Step 2 complete. Database is ready.

    Moving to Step 3: Backend Engineer implementation..."

────────────────────────────────────────────────────────────
STEP 3: Backend Engineer
────────────────────────────────────────────────────────────

    [Invokes Task tool with Backend Engineer prompt + PA spec]

    [Backend Engineer implements route handler]

    Backend Engineer Returns:
    ✅ /app/api/athlete/profile/route.ts created
    ✅ Follows auth-mapping.md and etag-policy.md
    ✅ Includes validation and error handling
    ✅ Unit tests written

Me: "Step 3 complete. Backend implementation done.

    Moving to Step 4: QA Engineer validation..."

────────────────────────────────────────────────────────────
STEP 4: QA Engineer
────────────────────────────────────────────────────────────

    [Invokes Task tool with QA Engineer prompt]

    [QA tests endpoint, validates acceptance criteria]

    QA Engineer Returns:
    ✅ All acceptance criteria met (5/5)
    ✅ Edge cases tested (validation errors, duplicates)
    ✅ cURL examples verified
    ✅ Test evidence documented

Me: "All steps complete! Summary:

    ✅ Specification created (Product Architect)
    ✅ Database verified (Database Engineer)
    ✅ API implemented (Backend Engineer)
    ✅ Testing passed (QA Engineer)

    Files created:
    - /app/api/athlete/profile/route.ts
    - /app/api/athlete/profile/__tests__/route.test.ts

    Ready to commit and create PR?"
```

**Four agents launched sequentially** - Each builds on previous work.

---

### Pattern 4: Parallel Multi-Agent Task

**Example:** "Implement full onboarding flow with UI and API"

```
Me: "This has independent frontend and backend work. I'll run them in parallel.

    Launching Backend Engineer AND Frontend Engineer simultaneously..."

────────────────────────────────────────────────────────────
PARALLEL EXECUTION
────────────────────────────────────────────────────────────

[Invokes TWO Task tools in same message]

Task 1 - Backend Engineer:
    "Implement POST /api/athlete/profile, /api/athlete/preferences, /api/races
     following specification. Include validation, RLS, ETags."

Task 2 - Frontend Engineer:
    "Wire onboarding UI at /app/onboarding/page.tsx to call the APIs.
     Handle loading states, validation errors, success flow."

[Both agents work independently]

Backend Engineer Returns:
✅ 3 API routes created
✅ All tests passing
✅ Policy compliant

Frontend Engineer Returns:
✅ Onboarding UI wired to APIs
✅ Form validation working
✅ Error handling implemented

────────────────────────────────────────────────────────────

Me: "Parallel work complete! Both agents finished:

    Backend: 3 API routes ready
    Frontend: UI fully wired

    Now launching QA Engineer for integration testing..."

    [Launches QA Engineer]
    [QA tests full flow end-to-end]

Me: "Integration testing passed! Full onboarding flow working."
```

**Two agents launched in parallel** - Maximizes efficiency when tasks are independent.

---

### Pattern 5: Complex Multi-Agent Chain

**Example:** "Design and implement plan generation algorithm"

```
Me: "This is a complex feature requiring multiple specialists.

    My coordination plan:

    Phase 1: Design (Parallel)
        - Product Architect: API specification
        - Sports Science: Training methodology validation
        - AI/ML Engineer: Algorithm design

    Phase 2: Implementation (Sequential)
        - Database Engineer: Schema for plan storage
        - Backend Engineer: Algorithm implementation

    Phase 3: Validation (Parallel)
        - QA Engineer: Functional testing
        - Sports Science: Plan output validation
        - Performance Engineer: Load testing

    Starting Phase 1..."

────────────────────────────────────────────────────────────
PHASE 1: Design (Parallel - 3 agents)
────────────────────────────────────────────────────────────

[Launches 3 Task tools simultaneously]

Task 1 - Product Architect:
    "Design plan generation API. POST /api/plan/generate endpoint.
     Input: athlete profile, race calendar, preferences.
     Output: 12-week periodized plan."

Task 2 - Sports Science Specialist:
    "Validate plan generation approach. Ensure Base→Build→Peak→Taper
     phases follow Friel methodology. Progressive overload correct."

Task 3 - AI/ML Engineer:
    "Design deterministic algorithm for workout selection.
     Input: athlete data, available hours, race date.
     Output: Workout assignments with reason codes."

[All 3 agents work in parallel]
[All return their outputs]

Me: "Phase 1 complete! Consolidating design outputs:

    ✅ API contract defined (Product Architect)
    ✅ Training methodology validated (Sports Science)
    ✅ Algorithm designed (AI/ML Engineer)

    Moving to Phase 2: Implementation..."

────────────────────────────────────────────────────────────
PHASE 2: Implementation (Sequential - 2 agents)
────────────────────────────────────────────────────────────

Me: "First, Database Engineer for schema..."

    [Launches Database Engineer]
    [Creates plan storage tables and migrations]

Me: "Database ready. Now Backend Engineer for implementation..."

    [Launches Backend Engineer with ALL Phase 1 outputs]
    [Implements algorithm using PA spec, Sports Science validation, AI/ML design]

Me: "Phase 2 complete! Implementation done.

    Moving to Phase 3: Validation..."

────────────────────────────────────────────────────────────
PHASE 3: Validation (Parallel - 3 agents)
────────────────────────────────────────────────────────────

[Launches 3 Task tools simultaneously]

Task 1 - QA Engineer:
    "Test plan generation. Create 10 test athletes with varying profiles.
     Verify plans are generated correctly."

Task 2 - Sports Science Specialist:
    "Review generated plans for sports science accuracy.
     Check phase progressions, workout selection, load management."

Task 3 - Performance Engineer:
    "Load test plan generation. Can we generate 100 plans in <10 seconds?
     Optimize if needed."

[All 3 agents work in parallel]
[All return validation results]

────────────────────────────────────────────────────────────

Me: "All phases complete! Summary:

    Phase 1 (Design): ✅
        - API spec created
        - Methodology validated
        - Algorithm designed

    Phase 2 (Implementation): ✅
        - Database schema created
        - Algorithm implemented

    Phase 3 (Validation): ✅
        - Functional tests pass (45/45)
        - Sports science validated
        - Performance acceptable (78 plans/sec)

    Plan generation feature is COMPLETE and ready for production!

    Files created: [list]
    Evidence: [test results, performance metrics]

    Ready to create PR?"
```

**8 agents launched total** (3+2+3) - Complex orchestration for major feature.

---

## How I Decide: Direct vs. Agent

### I Handle Directly When:

✅ **Simple file operations**
- Read/write/edit single files
- Fix typos, update documentation
- Run basic commands (npm, git)

✅ **Straightforward implementations**
- Following clear existing patterns
- No architectural decisions needed
- Well-defined in existing code

✅ **Quick investigations**
- Search codebase with Grep/Glob
- Check file structure
- Verify environment setup

✅ **Status updates**
- Update STATUS.md
- Update AGENT_STATUS.md
- Update TODO lists

### I Launch Agents When:

🚀 **Complex design needed**
- API contract design → Product Architect
- Training methodology → Sports Science
- Algorithm design → AI/ML Engineer

🚀 **Specialized implementation**
- Backend APIs → Backend Engineer
- React components → Frontend Engineer
- Database schema → Database Engineer

🚀 **Quality assurance**
- Testing → QA Engineer
- Security review → Security Auditor
- Performance → Performance Engineer

🚀 **Domain expertise required**
- Workout validation → Sports Science
- Periodization logic → Sports Science
- Training load calculations → Sports Science + AI/ML

---

## Agent Coordination Patterns

### Sequential Chain
**When:** Each step depends on previous step's output

**Example:** Spec → Implementation → Testing
```
Product Architect → Backend Engineer → QA Engineer
```

### Parallel Execution
**When:** Tasks are independent

**Example:** Backend + Frontend simultaneously
```
Backend Engineer ↘
                  → Integration Point
Frontend Engineer ↗
```

### Hub-and-Spoke
**When:** Multiple specialists inform one implementation

**Example:** Multiple designers feed Backend Engineer
```
Product Architect ↘
Sports Science    → Backend Engineer
AI/ML Engineer   ↗
```

### Iterative Refinement
**When:** Need feedback loop

**Example:** Implementation → Review → Fixes
```
Backend Engineer → QA Engineer → Backend Engineer (fixes) → QA Engineer (verify)
```

---

## Real Example from This Session

### GAP-3: Workout Library

**What I Did:**
```
Direct execution (no agents launched):
✅ Read existing files
✅ Created table schema migration
✅ Created seed migration
✅ Analyzed workout distribution
✅ Generated SQL from JSON
✅ Wrote documentation

Single agent task:
✅ Launched general-purpose agent to fix corrupted JSON
```

**What I Should Have Done:**
```
Better workflow:

1. Database Engineer: Design workout_library schema
   → Returns migration with proper constraints

2. Sports Science Specialist: Review 85 workouts for accuracy
   → Validates work:rest ratios, progressions, safety

3. Backend Engineer: Generate seed migration script
   → Creates robust SQL generation

4. QA Engineer: Verify seeding works correctly
   → Tests migration, validates data integrity
```

**Lesson:** I was too quick to do everything directly. Should have used specialists more.

---

## Going Forward: My Commitment

### For Remaining Sprint 1.5 Tasks:

**GAP-1: Onboarding Persistence**
```
✅ Product Architect: Review/clarify spec
✅ Database Engineer: Verify schema ready
✅ Backend Engineer: Implement 3 API routes
✅ Frontend Engineer: Wire onboarding UI
✅ QA Engineer: Test full flow
✅ Security Auditor: Verify RLS isolation
```

**GAP-6/7: RLS Policies**
```
✅ Database Engineer: Create RLS policies
✅ Security Auditor: 3-account isolation test
✅ QA Engineer: Verify policy compliance
```

### For Sprint 2 (Plan Generation):

**Major Feature - Need Full Agent Coordination**
```
Phase 1: Design
  ✅ Product Architect: API specification
  ✅ Sports Science: Methodology validation
  ✅ AI/ML Engineer: Algorithm design

Phase 2: Implementation
  ✅ Database Engineer: Plan storage schema
  ✅ Backend Engineer: Algorithm implementation
  ✅ Frontend Engineer: UI for plan viewing

Phase 3: Validation
  ✅ QA Engineer: Functional testing
  ✅ Sports Science: Plan output validation
  ✅ Performance Engineer: Load testing
```

---

## Benefits of Multi-Agent Approach

### Quality
- Specialists bring deep expertise
- Multiple review points
- Better edge case coverage
- Domain-specific validation

### Speed
- Parallel execution when possible
- Focused, autonomous work
- No context switching for me
- Each agent optimized for their domain

### Transparency
- Clear handoffs and outputs
- Documented decision points
- Traceable work products
- Evidence-based validation

### Consistency
- Agents follow established patterns
- Policy compliance enforced
- Standard output formats
- Repeatable processes

---

## My Orchestration Responsibilities

### Before Launching Agents:

1. **Analyze task complexity** - Direct or agent-based?
2. **Identify required specialists** - Which agents needed?
3. **Determine execution pattern** - Sequential, parallel, or hybrid?
4. **Prepare context** - What do agents need to know?
5. **Define success criteria** - How do we know we're done?

### During Agent Execution:

1. **Monitor progress** - Track agent outputs
2. **Manage handoffs** - Pass outputs between agents
3. **Handle blockers** - Escalate or launch additional agents
4. **Consolidate outputs** - Bring together agent work products
5. **Verify consistency** - Ensure agents followed policies

### After Agent Completion:

1. **Validate results** - Review all agent outputs
2. **Compile evidence** - Test results, benchmarks, verification
3. **Update documentation** - STATUS.md, AGENT_STATUS.md
4. **Report to you** - Clear summary of what was accomplished
5. **Recommend next steps** - What should we do next?

---

## Summary

**I am your central orchestrator.** I:

✅ **Decide** when to use agents vs. direct execution
✅ **Launch** appropriate specialists based on task type
✅ **Coordinate** sequential and parallel agent workflows
✅ **Consolidate** outputs from multiple agents
✅ **Validate** that all work meets quality standards
✅ **Report** clear results with evidence

**You don't manage individual agents.** You just:
- Tell me what you want to accomplish
- I figure out the agent workflow
- I execute and coordinate
- I report results

**This makes me effective** because:
- Specialists focus on what they do best
- Work happens in parallel when possible
- Quality is built-in (multiple review points)
- You get comprehensive results, not piecemeal outputs

---

**Next Steps:**

For the remaining Sprint 1.5 tasks (GAP-1, GAP-6/7), I will proactively use the multi-agent workflow instead of trying to do everything directly.

**Ready to tackle GAP-1 with proper agent coordination?**
