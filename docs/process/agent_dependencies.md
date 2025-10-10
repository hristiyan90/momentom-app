# Agent Cluster Dependencies & Communication Flow

## Agent Cluster Architecture

```
YOU (Project Owner & Central Coordinator)
    ↓
┌─── PLANNING CLUSTER ───┐
│   Ops Orchestrator     │
└────────────────────────┘
    ↓
┌─── SPECIFICATION CLUSTER ───┐
│   Product Architect          │
│   Sports Science Specialist │  
│   UX/UI Designer             │
│   AI/ML Engineer             │
└──────────────────────────────┘
    ↓
┌─── IMPLEMENTATION CLUSTER ───┐
│   Prompt Agent (M_PR)        │
│   QA Agent                   │
│   DevOps Agent               │
└───────────────────────────────┘
    ↓
CURSOR (Local Implementation)
```

## Detailed Workflow Dependencies

### Phase 1: Strategic Planning

**YOU ↔ OPS ORCHESTRATOR**

- Project priorities and sprint goals
- Resource allocation and timeline constraints
- Feature breakdown and task identification
- Specialist requirements assessment

**OPS ORCHESTRATOR → YOU**

- Feature planning recommendations
- Specialist assignment suggestions
- Timeline and effort estimates
- Risk identification

### Phase 2: Core Specification

**YOU ↔ PRODUCT ARCHITECT**

- Feature requirements from OPS planning
- Business constraints and timeline
- Policy compliance needs

**PRODUCT ARCHITECT → YOU**

- Complete feature specification
- API contracts and data models
- Policy requirements (ETag/Auth/RLS)
- Acceptance criteria with cURLs

### Phase 3: Domain Expertise (Parallel Processing)

**YOU → DOMAIN SPECIALISTS** (All receive PA core spec + domain-specific requirements)

**→ SPORTS SCIENCE SPECIALIST:**

- Training methodology requirements
- Evidence-based recommendations
- Scientific validation criteria

**→ UX/UI DESIGNER:**

- Interface design requirements
- User flow specifications
- Component and copy needs

**→ AI/ML ENGINEER:**

- Algorithm specifications
- Model requirements and evaluation criteria
- Data pipeline needs

**DOMAIN SPECIALISTS → YOU**

- Domain-specific specifications
- Integration requirements with core spec
- Implementation constraints and validation criteria

### Phase 4: Implementation Coordination

**YOU → IMPLEMENTATION CLUSTER**

**→ PROMPT AGENT (M_PR):**

- Consolidated complete specification
- All domain specialist inputs
- Clear acceptance criteria
- Implementation approach guidance

**M_PR ↔ CURSOR** (via YOU in local repo)

- Iterative implementation and refinement
- Bug fixes and feature development
- Code quality improvements

**YOU → QA AGENT:**

- Complete specifications for validation
- Implementation to test against criteria
- Validation requirements from all specialists

**YOU → DEVOPS AGENT** (as needed)

- Deployment coordination
- Infrastructure requirements
- CI/CD pipeline management

## Communication Patterns

### Sequential Dependencies (Must happen in order)

1. **YOU → OPS:** Strategic planning must establish direction
2. **YOU → PA:** Core spec must exist before domain work
3. **YOU → Domain Specialists:** Can work in parallel after PA spec
4. **YOU consolidate → Implementation:** All specs must be ready before implementation
5. **M_PR → QA:** Implementation must complete before validation
6. **QA → DevOps:** Validation must pass before deployment

### Parallel Dependencies (Can happen simultaneously)

- **All Domain Specialists:** Work simultaneously from PA core spec
- **QA + DevOps preparation:** Can prepare while M_PR implements
- **Multiple features:** Different feature tracks can run in parallel

### Feedback Loops (Through YOU as coordinator)

- **M_PR issues → YOU → Relevant Specialist → YOU → M_PR**
- **QA failures → YOU → M_PR (with specific feedback)**
- **DevOps issues → YOU → PA (architecture) or M_PR (implementation)**

## Handoff Formats

### OPS → YOU Planning Handoff

```
Sprint Goal: [High-level objective]
Feature Breakdown: [List of features with priorities]
Specialist Requirements: [Which agents needed per feature]
Timeline: [Sprint duration and milestones]
Risk Assessment: [Potential blockers and mitigation]
```

### PA → YOU Specification Handoff

```
Feature Specification: [Complete functional requirements]
API Design: [Endpoints, data models, contracts]
Policy Requirements: [ETag/Auth/RLS compliance details]
Acceptance Criteria: [Testable success conditions]
Integration Points: [How it connects to existing system]
```

### Domain Specialists → YOU Handoff

```
Domain Requirements: [Specialist-specific specifications]
Integration Notes: [How to merge with PA core spec]
Validation Criteria: [Domain-specific testing requirements]
Implementation Constraints: [Technical or methodological limits]
Dependencies: [Requirements from other specialists]
```

### YOU → Implementation Cluster Handoff

```
Complete Specification: [PA + all domain specialist inputs]
Acceptance Criteria: [All validation requirements]
Implementation Priority: [Order of development]
Success Metrics: [How to measure completion]
Escalation Triggers: [When to involve other agents]
```

## Who Briefs Whom (Normal Operation)

**YOU brief directly:**

- Ops Orchestrator (strategic planning)
- Product Architect (core specifications)
- All Domain Specialists (parallel, with PA spec)
- All Implementation Cluster agents (with consolidated specs)

**Agents brief YOU only:**

- All agents return work product directly to YOU
- No agent-to-agent communication
- YOU consolidate and coordinate all information flow

**Exception Handling:**

- **Blockers:** Any agent escalates directly to YOU
- **Authority conflicts:** PA has final architectural say
- **Quality gates:** QA has validation authority
- **Deployment issues:** DevOps coordinates through YOU

## Benefits of Cluster Architecture

**Reduced Handoff Chains:**

- Old: YOU → OPS → PA → Specialist → OPS → YOU → M_PR (6 handoffs)
- New: YOU → OPS → YOU → PA → YOU → Specialist → YOU → M_PR (4 coordination points)

**Parallel Processing:**

- Domain specialists work simultaneously from PA spec
- Faster specialist coordination through shared base specification
- Implementation cluster can prepare while specification work continues

**Centralized Control:**

- YOU maintain visibility into all agent work
- No information loss through multiple intermediaries
- Clear escalation path for all issues

**Quality Assurance:**

- Dedicated QA Agent validates against all specifications
- DevOps Agent ensures deployment readiness
- Multiple validation gates before feature completion

## Testing Phase vs Normal Operation

**Current Testing (Manual validation):**

- YOU → directly brief each agent to test capabilities
- Skip cluster coordination to validate individual agent quality
- Test handoffs manually to identify friction points

**Normal Operation (After testing):**

- YOU → coordinate through cluster structure
- Agents work within their cluster responsibilities
- Standardized handoff formats ensure consistency