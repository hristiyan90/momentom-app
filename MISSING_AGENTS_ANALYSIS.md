# Missing Agents Analysis

**Date:** October 29, 2025
**Context:** Identifying gaps in our Claude Code agent roster

---

## Current Agent Roster (10 agents)

### Strategic Specialists (3)
1. ✅ Product Architect
2. ✅ Sports Science Specialist
3. ✅ AI/ML Engineer

### Implementation Specialists (3)
4. ✅ Backend Engineer
5. ✅ Frontend Engineer
6. ✅ Database Engineer

### Quality Specialists (3)
7. ✅ QA Engineer
8. ✅ Security Auditor
9. ✅ Performance Engineer

### Support Specialists (1)
10. ✅ DevOps Engineer

---

## Missing Agents - Gap Analysis

### 🔴 HIGH PRIORITY - Needed for Current Sprint

#### 1. UX/UI Designer
**Why missing:** Referenced 10+ times in Sprint 1.5 plan but not in CLAUDE.md roster!

**Sprint mentions:**
- Task 1.5-B: "Full-Stack Dev + **UX/UI**"
- Task 2-D: "**UX/UI** + Full-Stack Dev"
- Task 2-E: "**UX/UI** + Full-Stack Dev"
- Task 2-F: "**UX/UI** + Full-Stack Dev"

**Needed for:**
- Onboarding flow design and refinement
- Cockpit dashboard UI improvements
- Calendar view UX
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1)
- Design system consistency (Radix UI + Tailwind)

**Specialization should include:**
- Interface design (Figma/mockups not needed - we work in code)
- User flow optimization
- Accessibility audits (ARIA, keyboard nav, screen readers)
- Mobile-first responsive patterns
- Design system consistency
- Component composition patterns
- Visual hierarchy and information architecture

**Example use cases:**
```
"Review onboarding flow for UX issues - too many steps?"
"Design calendar view interaction patterns"
"Audit accessibility compliance for dashboard"
"Optimize mobile experience for cockpit page"
```

---

#### 2. Data Integration Engineer
**Why missing:** Garmin sync, file parsing, data transformation are specialized skills

**Sprint mentions:**
- Task 1.5-E: "Garmin Connect API OR GarminDB export pipeline"
- Task 1.5-F: "Wellness data ingestion pipeline"
- Task 1.5-G: "Workout data ingestion pipeline"

**Needed for:**
- GarminDB SQLite → Postgres sync
- TCX/GPX/FIT file parsing
- Data normalization and transformation
- Integration with external APIs (Garmin, Strava future)
- ETL pipeline design
- Data quality validation
- Webhook handling (future)

**Specialization should include:**
- File format parsing (TCX, GPX, FIT)
- SQLite → Postgres migrations
- Data transformation pipelines
- External API integration (Garmin Connect, Strava)
- Data quality checks and validation
- Error handling for malformed data
- Batch vs real-time sync strategies

**Example use cases:**
```
"Parse TCX file and extract heart rate zones"
"Sync GarminDB wellness data to readiness_daily table"
"Design ETL pipeline for daily Garmin sync"
"Handle duplicate workout detection"
```

**Why Backend Engineer isn't enough:**
Backend Engineer focuses on API routes and business logic. Data Integration Engineer specializes in external data sources, file parsing, and ETL pipelines.

---

### 🟡 MEDIUM PRIORITY - Needed for Sprint 2+

#### 3. Technical Writer
**Why missing:** Documentation quality and completeness are critical

**Needed for:**
- API documentation (OpenAPI specs)
- Developer onboarding guides
- User-facing help content
- Architecture decision records (ADRs)
- Migration guides
- Troubleshooting runbooks

**Specialization should include:**
- OpenAPI/Swagger documentation
- Markdown technical writing
- API reference documentation
- Code example creation
- Tutorial writing
- Architecture documentation
- Decision log entries (AUTO_LOG.md)

**Example use cases:**
```
"Document POST /api/athlete/profile endpoint"
"Create onboarding guide for new developers"
"Write ADR for state management decision"
"Create troubleshooting guide for Garmin sync issues"
```

---

#### 4. Mobile Engineer (Future)
**Why missing:** Mobile app is on roadmap (Sprint 3+)

**Needed for:**
- React Native implementation (iOS/Android)
- Mobile-specific UI patterns
- Offline-first architecture
- Push notifications
- Mobile performance optimization

**Specialization should include:**
- React Native development
- iOS/Android platform differences
- Offline data sync
- Mobile authentication flows
- Push notification handling
- Mobile performance optimization
- App store deployment

**Not needed yet** - Web-first approach for MVP.

---

### 🟢 NICE TO HAVE - Support Specialists

#### 5. Accessibility Specialist
**Why useful:** WCAG compliance, inclusive design

**Could be covered by:** UX/UI Designer (with accessibility focus)

**Needed for:**
- WCAG 2.1 AA compliance audits
- Screen reader testing
- Keyboard navigation verification
- Color contrast validation
- ARIA implementation review
- Assistive technology compatibility

**Example use cases:**
```
"Audit dashboard for WCAG 2.1 AA compliance"
"Test calendar with screen readers"
"Verify keyboard navigation works everywhere"
```

---

#### 6. Content Strategist
**Why useful:** Copy, messaging, athlete-facing language

**Needed for:**
- UI copy and microcopy
- Error messages (user-friendly, not technical)
- Onboarding messaging
- Email templates
- In-app notifications
- Help content

**Specialization should include:**
- UX writing (clear, concise, actionable)
- Error message design
- Athlete-facing language (no jargon)
- Motivational messaging
- Tone and voice consistency

**Example use cases:**
```
"Review error messages for user-friendliness"
"Write onboarding welcome copy"
"Design notification messages for plan adaptations"
```

---

#### 7. Observability Engineer (Sprint 3)
**Why missing:** Sprint 3 includes observability

**Needed for:**
- Structured logging setup
- Log aggregation (e.g., Datadog, LogDNA)
- Application monitoring
- Performance monitoring
- Error tracking (Sentry)
- Alerting setup

**Specialization should include:**
- Structured JSON logging
- Log redaction (PII, tokens)
- Request ID correlation
- Performance monitoring (APM)
- Error tracking integration
- Alert configuration
- Dashboard creation

**Not needed yet** - Planned for Sprint 3.

---

## Immediate Recommendations

### Add These 2 Agents NOW (Sprint 1.5):

#### ✅ 1. UX/UI Designer
**Priority:** HIGH
**Reason:** Referenced throughout Sprint 1.5 plan, needed for onboarding UI

**Add to CLAUDE.md:**
```markdown
#### UX/UI Designer
**When to use:** Interface design, user flows, accessibility audits, responsive design, mobile optimization

**Specialization:**
- Review and optimize user flows
- Design component composition patterns
- Audit accessibility compliance (WCAG 2.1 AA)
- Ensure mobile-first responsive design
- Maintain design system consistency (Radix UI + Tailwind)
- Optimize information architecture
- Review error states and loading patterns
- Ensure keyboard navigation works
- Test with screen readers

**Inputs:** Feature requirements, existing UI, accessibility goals
**Outputs:** UX recommendations, accessibility fixes, design pattern suggestions, component refactors

**Example invocation:**
"Acting as UX/UI Designer for Momentum app, review the onboarding flow at
/app/onboarding/page.tsx. Evaluate user experience, accessibility, and mobile
responsiveness. Identify friction points and suggest improvements. Ensure WCAG
2.1 AA compliance."
```

#### ✅ 2. Data Integration Engineer
**Priority:** HIGH
**Reason:** Tasks 1.5-E, F, G require specialized data integration skills

**Add to CLAUDE.md:**
```markdown
#### Data Integration Engineer
**When to use:** External data sources, file parsing, ETL pipelines, API integrations, data transformations

**Specialization:**
- Parse workout files (TCX, GPX, FIT formats)
- Design and implement ETL pipelines
- Integrate external APIs (Garmin Connect, Strava, etc.)
- Transform data between formats
- Handle data quality issues (missing data, malformed files)
- Design sync strategies (batch vs real-time)
- Implement duplicate detection
- Validate data integrity

**Inputs:** Data source specifications, file formats, sync requirements
**Outputs:** Parsers, ETL pipelines, integration code, data validation logic

**Example invocation:**
"Acting as Data Integration Engineer for Momentum app, design the GarminDB to
Postgres sync pipeline for wellness data (Task 1.5-F). Input: GarminDB SQLite
tables. Output: Daily wellness data in readiness_daily table with proper
normalization and data quality flags. Handle missing data gracefully."
```

---

### Consider Adding Later (Sprint 2+):

#### 🟡 3. Technical Writer (Sprint 2)
**When:** Sprint 2 - plan generation needs good documentation

#### 🟡 4. Observability Engineer (Sprint 3)
**When:** Sprint 3 - observability and monitoring setup

#### 🟢 5. Accessibility Specialist (Can be absorbed by UX/UI Designer)
**When:** As needed for accessibility audits

#### 🟢 6. Content Strategist (Can be absorbed by UX/UI Designer)
**When:** As needed for UX copy review

---

## Updated Agent Roster (12 agents)

### Strategic Specialists (3)
1. Product Architect
2. Sports Science Specialist
3. AI/ML Engineer

### Implementation Specialists (5) ⬆️ +2
4. Backend Engineer
5. Frontend Engineer
6. Database Engineer
7. **UX/UI Designer** ⭐ NEW
8. **Data Integration Engineer** ⭐ NEW

### Quality Specialists (3)
9. QA Engineer
10. Security Auditor
11. Performance Engineer

### Support Specialists (1)
12. DevOps Engineer

---

## Action Items

### Immediate (Today):
1. ✅ Add **UX/UI Designer** to CLAUDE.md
2. ✅ Add **Data Integration Engineer** to CLAUDE.md
3. ✅ Update "When to Use Which Agent" section
4. ✅ Add example invocations for both

### Sprint 2:
5. 🟡 Add **Technical Writer** when documentation needs increase

### Sprint 3:
6. 🟡 Add **Observability Engineer** for monitoring/logging setup

---

## Coverage Analysis

### Sprint 1.5 Tasks Coverage:

**Task 1.5-A (Auth):** ✅ Backend Engineer + Security Auditor
**Task 1.5-B (Onboarding UI):** ✅ Frontend Engineer + **UX/UI Designer** + Backend Engineer
**Task 1.5-C (Schema):** ✅ Database Engineer
**Task 1.5-D (Workout Library):** ✅ Sports Science Specialist + Database Engineer
**Task 1.5-E (Garmin Pipeline):** ✅ **Data Integration Engineer** + Backend Engineer
**Task 1.5-F (Wellness Sync):** ✅ **Data Integration Engineer** + Backend Engineer
**Task 1.5-G (Workout Sync):** ✅ **Data Integration Engineer** + Backend Engineer

**Coverage:** 100% ✅ (after adding UX/UI Designer + Data Integration Engineer)

---

## Summary

**Missing Critical Agents:**
- ❌ UX/UI Designer (referenced 10+ times in sprint plan!)
- ❌ Data Integration Engineer (3 tasks require specialized data integration)

**Add these 2 agents immediately** to properly support Sprint 1.5.

**Future consideration:**
- Technical Writer (Sprint 2)
- Observability Engineer (Sprint 3)
- Mobile Engineer (Sprint 4+)

**Can be absorbed by existing agents:**
- Accessibility → UX/UI Designer
- Content Strategy → UX/UI Designer
