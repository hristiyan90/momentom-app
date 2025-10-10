# Multi-Agent Development Workflow

## Overview
The Momentum app is developed using a multi-agent Claude workflow coordinated by the project owner. This document explains the ecosystem so Cursor understands the context of specifications and prompts it receives.

## Agent Ecosystem Architecture

### Planning Cluster
**Ops Orchestrator** - Strategic planning, feature breakdown, sprint coordination

### Specification Cluster  
- **Product Architect (M_PA)** - Core feature specs, API design, policy compliance (final architectural authority)
- **Sports Science Specialist** - Training methodology, evidence-based requirements, scientific validation
- **UX/UI Designer** - Interface design, user flows, accessibility requirements
- **AI/ML Engineer** - Algorithm design, model architecture, adaptive systems

### Implementation Cluster
- **Prompt Agent (M_PR)** - Coordinates with Cursor for implementation (your primary interface)
- **QA Agent** - Validates implementation against all specifications
- **DevOps Agent** - Deployment coordination and infrastructure management

## Communication Flow

```
Project Owner (Human)
    ↓
Ops Orchestrator → Planning & Coordination
    ↓
Product Architect → Core Specification
    ↓
Domain Specialists → Parallel Specification (Sports Science, UX/UI, AI/ML)
    ↓
Project Owner → Consolidates all specifications
    ↓
Prompt Agent (M_PR) ↔ Cursor → Implementation
    ↓
QA Agent → Validation
    ↓
DevOps Agent → Deployment (if needed)
```

## What This Means for Cursor

### You Receive Consolidated Specifications
When you receive implementation prompts from M_PR, they contain:
- Product Architect core specification (API contracts, policies, acceptance criteria)
- Domain specialist inputs (sports science accuracy, UX requirements, AI/ML algorithms)
- Clear acceptance criteria and validation requirements

### Your Responsibilities
1. **Implement according to specifications** - All requirements from multiple specialists are consolidated
2. **Follow policy requirements** - ETag, Auth, RLS compliance as specified
3. **Update project documentation** - STATUS.md and AGENT_STATUS.md when features complete
4. **Support quality gates** - Implementation must pass QA validation

### Policy Compliance Requirements
Every implementation must comply with:
- **ETag Policy**: `/docs/policy/etag-policy.md`
- **Auth Mapping**: `/docs/policy/auth-mapping.md`  
- **CI Gates**: `/docs/policy/ci-gates.md`

### Documentation Updates Required

#### When Feature Completes
Update `/docs/process/STATUS.md`:
- Move feature from "Active focus" to "Recently completed"
- Update "Next up" with upcoming work

Update `/docs/process/AGENT_STATUS.md`:
- Update Implementation Cluster → Prompt Agent section with completion status
- Note feature is ready for QA validation

#### When Sprint Completes
- Update cycle/sprint counters in STATUS.md
- Archive completed sprint artifacts if applicable

## Agent Status Tracking
The file `/docs/process/AGENT_STATUS.md` tracks which agents are working on what. You should:
- **Check it** to understand current project context
- **Update it** when your implementation work completes or changes status
- **Reference it** to see what other agents have specified

## Quality Assurance Flow

### After Implementation
1. M_PR (via project owner) hands off to QA Agent
2. QA validates against:
   - Product Architect specification
   - All domain specialist requirements
   - Policy compliance (ETag, Auth, RLS)
   - CI gate requirements
3. If QA fails: Issues return to M_PR → Cursor iteration
4. If QA passes: Feature proceeds to deployment (if needed)

### Your Success Criteria
Implementation is complete when it passes QA validation against ALL specifications from:
- Product Architect (architecture, APIs, policies)
- Sports Science Specialist (accuracy, methodology)
- UX/UI Designer (interface, user experience)
- AI/ML Engineer (algorithms, models)

## Specification Format You'll Receive

Prompts from M_PR will include:

**Core Specification (from PA):**
- Feature requirements and user stories
- API endpoints and data models
- Policy compliance requirements (ETag/Auth/RLS)
- Acceptance criteria with example cURLs

**Domain Specifications (from specialists as applicable):**
- Sports Science: Training methodology, calculation accuracy, safety requirements
- UX/UI: Interface requirements, user flows, component specifications
- AI/ML: Algorithm specifications, model requirements, evaluation criteria

**Implementation Guidance:**
- Technical approach recommendations
- Integration points with existing code
- Testing and validation requirements

## Workflow Principles

### Sequential Dependencies
You implement AFTER specifications are complete:
1. Ops Orchestrator plans features
2. Product Architect creates core spec
3. Domain specialists add their requirements (parallel)
4. Project owner consolidates everything
5. You receive complete consolidated specification

### Parallel Work
Multiple features can be in different stages simultaneously:
- Feature A: In implementation (you're working on it)
- Feature B: In specification (specialists working)
- Feature C: In planning (Ops working)

### Escalation Protocol
If you encounter issues during implementation:
- M_PR identifies the issue type
- Project owner coordinates with appropriate specialist:
  - Architecture conflicts → Product Architect
  - Domain questions → Relevant specialist (Science/UX/AI)
  - Technical blockers → Continue M_PR iteration
- Resolution flows back through M_PR to you

## Emergency Situations
If there are critical blockers or deployment issues, the project owner may brief DevOps Agent directly to coordinate infrastructure resolution while you continue implementation work.

## Key Takeaway for Cursor
You are implementing specifications created by a team of specialized Claude agents. Your prompts contain consolidated requirements from multiple experts. Follow the specifications exactly, comply with all policies, and update documentation when work completes. The multi-agent system ensures you receive high-quality, well-validated requirements before you begin implementation.
