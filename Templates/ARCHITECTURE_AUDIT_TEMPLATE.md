# Architecture Audit

**Project:** [Project name]

**Audit Date:** [YYYY-MM-DD]

**Auditor(s):** [Name, team, or responsible agent]

**Architecture Version / Baseline:** [Version, branch, commit, or document reference]

**Audit Scope:** [Systems, services, environments, and concerns included]

**Status:** [Draft | In Review | Approved]

---

## Executive Summary

### Purpose

[Explain why the audit was performed and what decisions it is intended to support.]

### Overall Assessment

[Summarize the architecture's current condition, fitness for purpose, and ability to support expected business and technical needs.]

### Key Conclusions

- [Most important conclusion]
- [Most important conclusion]
- [Most important conclusion]

### Priority Actions

| Priority | Action | Rationale | Owner | Target Date |
|----------|--------|-----------|-------|-------------|
| Critical / High / Medium / Low | [Required action] | [Why it matters] | [Owner] | [YYYY-MM-DD] |

---

## Findings

Document each finding with sufficient evidence to make it independently reviewable.

### Finding [ID]: [Short Title]

**Category:** [Architecture | Security | Reliability | Performance | Scalability | Maintainability | Data | Operations | Compliance | Other]

**Severity:** [Critical | High | Medium | Low | Informational]

**Affected Components:** [Components, services, or workflows]

**Observation:**  
[Describe what was observed.]

**Evidence:**  
[Reference source files, diagrams, metrics, logs, interviews, tests, or documentation.]

**Impact:**  
[Describe the current or potential effect.]

**Recommendation:**  
[State the proposed response.]

**Disposition:** [Open | Accepted | Planned | Resolved | Risk Accepted]

Repeat this subsection for each finding.

---

## Current Architecture

### Scope and Context

[Describe the system boundary, primary users, external actors, and relevant constraints.]

### Architecture Overview

[Describe the current architectural style and the responsibilities of its major components.]

### Component Inventory

| Component | Responsibility | Technology | Dependencies | Owner | Lifecycle Status |
|-----------|----------------|------------|--------------|-------|------------------|
| [Component] | [Purpose] | [Technology or platform] | [Dependencies] | [Owner] | [Active | Transitional | Deprecated] |

### Data Architecture

[Describe data stores, ownership, schemas, data flows, retention, backup, and consistency requirements.]

### Integration Architecture

[Describe internal and external interfaces, protocols, contracts, queues, events, and failure handling.]

### Deployment and Infrastructure

[Describe environments, hosting, networking, configuration, secrets, deployment topology, and delivery mechanisms.]

### Operational Characteristics

[Describe observability, availability, recovery, support, capacity, and incident-response capabilities.]

### Architecture Diagram

[Insert or link to a current architecture diagram. Include a legend, system boundary, and last-updated date.]

---

## Risks

### Risk Assessment Method

[Define how likelihood, impact, and overall rating are determined.]

| ID | Risk | Cause | Likelihood | Impact | Rating | Existing Controls | Mitigation | Owner |
|----|------|-------|------------|--------|--------|-------------------|------------|-------|
| R-001 | [Risk statement] | [Underlying cause] | [Low / Medium / High] | [Low / Medium / High] | [Overall rating] | [Current safeguards] | [Planned response] | [Owner] |

### Accepted Risks

[List formally accepted risks, the approving authority, rationale, review date, and expiration date.]

---

## Technical Debt

### Debt Summary

[Summarize the principal sources of technical debt and their effect on delivery, operations, quality, or risk.]

| ID | Debt Item | Evidence | Consequence | Effort | Priority | Owner | Target |
|----|-----------|----------|-------------|--------|----------|-------|--------|
| TD-001 | [Debt description] | [Supporting evidence] | [Current impact] | [S / M / L / XL] | [Critical / High / Medium / Low] | [Owner] | [Milestone or date] |

### Debt Trends

[State whether material debt is increasing, stable, or decreasing, and explain why.]

---

## Recommendations

Recommendations should be specific, traceable to findings or risks, and ordered by value and urgency.

### Recommendation [ID]: [Short Title]

**Related Findings / Risks:** [IDs]

**Priority:** [Immediate | Near Term | Medium Term | Long Term]

**Proposed Change:**  
[Describe the recommended change and its intended outcome.]

**Expected Benefits:**  
[Describe measurable improvements.]

**Trade-offs:**  
[Describe cost, complexity, migration impact, limitations, and new risks.]

**Dependencies:**  
[List prerequisite decisions, capabilities, or work.]

**Success Measures:**  
[Define how completion and effectiveness will be verified.]

**Owner:** [Owner]

**Target:** [Milestone or YYYY-MM-DD]

Repeat this subsection for each recommendation.

### Recommended Roadmap

| Sequence | Recommendation | Time Horizon | Dependencies | Completion Evidence |
|----------|----------------|--------------|--------------|---------------------|
| 1 | [Recommendation ID and title] | [Immediate / Near / Medium / Long term] | [Dependencies] | [Required evidence] |

---

## Future Architecture

### Target State

[Describe the intended future architecture and the outcomes it enables.]

### Architecture Principles

- [Principle and its practical implication]
- [Principle and its practical implication]
- [Principle and its practical implication]

### Proposed Components and Responsibilities

| Component | Responsibility | Change from Current State | Key Interfaces | Owner |
|-----------|----------------|---------------------------|----------------|-------|
| [Component] | [Purpose] | [New | Retained | Modified | Replaced | Removed] | [Interfaces] | [Owner] |

### Target Data and Integration Model

[Describe future data ownership, flows, interfaces, contracts, and governance.]

### Target Deployment and Operations Model

[Describe future hosting, delivery, security, observability, resilience, recovery, and support.]

### Migration Approach

| Phase | Objective | Scope | Entry Criteria | Exit Criteria | Rollback / Contingency |
|-------|-----------|-------|----------------|---------------|------------------------|
| [Phase] | [Objective] | [Included changes] | [Required conditions] | [Verification criteria] | [Fallback approach] |

### Future Architecture Diagram

[Insert or link to the proposed architecture diagram. Clearly distinguish existing, changed, new, and retired components.]

### Open Decisions

| Decision | Options | Decision Owner | Due Date | Status |
|----------|---------|----------------|----------|--------|
| [Decision required] | [Options under consideration] | [Owner] | [YYYY-MM-DD] | [Open | Decided | Deferred] |

---

## Appendix

### Audit Scope and Exclusions

**Included:**  
[Items included in the audit.]

**Excluded:**  
[Items explicitly outside the audit.]

### Methodology

[Describe document review, code inspection, interviews, workshops, metrics analysis, testing, or other methods used.]

### Evidence Reviewed

| Reference | Description | Version / Date | Location |
|-----------|-------------|----------------|----------|
| [Reference ID] | [Artifact or evidence] | [Version or date] | [Path or URL] |

### Assumptions and Constraints

- [Assumption or constraint]
- [Assumption or constraint]

### Glossary

| Term | Definition |
|------|------------|
| [Term] | [Definition] |

### Review and Approval

| Role | Name | Decision | Date | Notes |
|------|------|----------|------|-------|
| [Role] | [Name] | [Approved | Approved with Conditions | Rejected] | [YYYY-MM-DD] | [Notes] |

### Revision History

| Version | Date | Author | Summary of Changes |
|---------|------|--------|--------------------|
| 0.1 | [YYYY-MM-DD] | [Author] | Initial draft |
