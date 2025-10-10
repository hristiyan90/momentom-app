# Agent Status Tracking

**Last Updated:** [Timestamp - maintained by Cursor]
**Current Cycle:** 2 | **Current Sprint:** 1

## Active Agent Assignments

### Planning Cluster
#### Ops Orchestrator
- **Last Active**: [Timestamp]
- **Context**: Sprint planning and feature coordination
- **Status**: [Active/Standby]
- **Current Focus**: [Sprint/feature being planned]

### Specification Cluster
#### Product Architect (M_PA)
- **Last Active**: [Timestamp]
- **Context**: [Current feature specification work]
- **Status**: [Active/Standby] 
- **Pending Tasks**: [Architecture and policy work]

#### Sports Science Specialist
- **Last Active**: [Timestamp]
- **Context**: [Domain expertise being provided]
- **Status**: [Active/Standby]
- **Pending Tasks**: [Scientific validation work]

#### UX/UI Designer
- **Last Active**: [Timestamp]
- **Context**: [Interface design work]
- **Status**: [Active/Standby]
- **Pending Tasks**: [Design and user experience work]

#### AI/ML Engineer
- **Last Active**: [Timestamp]
- **Context**: [Algorithm and model work]
- **Status**: [Active/Standby]
- **Pending Tasks**: [Machine learning tasks]

### Implementation Cluster
#### Prompt Agent (M_PR)
- **Last Active**: [Timestamp]
- **Context**: [Cursor iteration work]
- **Status**: [Active/Standby]
- **Current Focus**: [Implementation being worked on]

#### QA Agent
- **Last Active**: [Timestamp]
- **Context**: [Validation work]
- **Status**: [Active/Standby]
- **Pending Tasks**: [Testing and validation tasks]

#### DevOps Agent
- **Last Active**: [Timestamp]
- **Context**: [Deployment coordination]
- **Status**: [Active/Standby]
- **Pending Tasks**: [Infrastructure and deployment work]

## Handoff Protocols

### Agent Cluster Communication
**All communication flows through YOU as the central coordinator**

**Planning Cluster:**
- YOU ↔ Ops Orchestrator (sprint planning, feature coordination)

**Specification Cluster (Parallel):**
- YOU → Product Architect (feature requirements from OPS output)
- YOU → Domain Specialists (PA core spec + specific domain needs)
  - Sports Science Specialist (training methodology, evidence-based requirements)
  - UX/UI Designer (interface requirements, user flows)
  - AI/ML Engineer (algorithm specs, model requirements)

**Implementation Cluster (Sequential/Parallel):**
- YOU → Prompt Agent (consolidated specifications for Cursor iteration)
- YOU → QA Agent (validation against all specifications)
- YOU → DevOps Agent (deployment coordination as needed)

### Standard Handoff Information
**OPS → YOU (Feature Planning):**
- Feature breakdown and task identification
- Specialist requirements assessment
- Timeline and priority recommendations
- Resource allocation suggestions

**YOU → PA (Specification):**
- Feature requirements from OPS planning
- Business constraints and timeline
- Policy compliance needs
- Success criteria definition

**PA → YOU (Core Specification):**
- Complete feature specification
- API contracts and data models
- Policy requirements (ETag/Auth/RLS)
- Acceptance criteria with cURLs

**YOU → Domain Specialists (Parallel):**
- PA core specification
- Domain-specific requirements
- Integration points needed
- Timeline for domain input

**Domain Specialists → YOU:**
- Domain-specific specifications
- Integration requirements
- Implementation constraints
- Validation criteria

**YOU → Implementation Cluster:**
- Consolidated complete specification
- All domain specialist inputs
- Clear acceptance criteria
- Implementation approach guidance

### Agent Communication Architecture
**Cluster-Based Communication (All through YOU):**

**Planning Cluster:**
- YOU ↔ Ops Orchestrator (strategic coordination)

**Specification Cluster:**
- YOU ↔ Product Architect (core specifications)
- YOU ↔ Domain Specialists (parallel specialist input)

**Implementation Cluster:**
- YOU ↔ Prompt Agent (Cursor iteration)
- YOU ↔ QA Agent (validation)
- YOU ↔ DevOps Agent (deployment)

**Benefits:**
- Shorter handoff chains (3-4 steps vs 6+)
- Parallel specialist work (faster)
- YOU maintain central control
- Reduced context loss through fewer intermediaries

**Exception Handling:**
- Any agent can escalate blockers directly to YOU
- PA has final architectural authority
- QA Agent has validation authority
- DevOps Agent coordinates deployment issues

## Recent Handoffs Log
- [Timestamp]: WA → Previous WA (B3e T2-T6 task continuation)
- [Timestamp]: [Future handoff entries]

## Notes
- Cursor updates this file when agent assignments change
- Agents reference this for current ecosystem state
- WA maintains handoff protocol compliance
- Each agent should update their status section when taking/leaving focus
