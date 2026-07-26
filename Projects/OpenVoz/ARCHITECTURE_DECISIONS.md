# OpenVoz Architecture Decisions

# Purpose

This document records verified architectural decisions for OpenVoz and the context in which each decision applies.

Architecture Decision Records preserve why a technology or design was selected, its consequences, and its relationship to the implemented system. They complement the current architecture documented in `SYSTEM_ARCHITECTURE.md`.

---

# How to Use This Document

Add a decision record when a proposed change affects system structure, component responsibilities, external services, data management, deployment, security, or operations.

Each decision should:

- Describe the problem or constraint before recording the decision.
- Record only evidence-supported context and rationale.
- Identify alternatives that were actually evaluated.
- State operational and technical consequences.
- Use a unique sequential decision ID.
- Remain in the document after replacement.
- Link a replaced decision to the decision that supersedes it.
- Be updated only when its status or supporting evidence changes.

Do not use decision records for routine implementation details or speculative future work.

---

# Decision Record Format

## Decision ID

`ADR-NNN: Decision Title`

## Date

`YYYY-MM-DD`

## Status

`Proposed`, `Accepted`, `Superseded`, or `Deprecated`

## Context

TODO: Describe the verified problem, constraints, and architectural forces.

## Decision

TODO: State the selected architecture or technology.

## Alternatives Considered

- TODO: Record only alternatives that were actually evaluated.

## Consequences

- TODO: Record positive, negative, and operational consequences.

## Related Documents

- TODO: Link the architecture, deployment, operational, or incident documents affected by the decision.

---

# Accepted Decisions

## ADR-001: Use Django as the Web Framework

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

OpenVoz requires a backend that processes HTTP requests, implements business logic, manages sessions and authentication, renders templates, exposes application endpoints, and accesses persistent data through an ORM.

### Decision

Use Django as the web framework because the implemented backend uses Django to provide these responsibilities within one application framework.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- Application request handling, templates, authentication, models, and migrations follow Django conventions.
- Persistent data is accessed by the backend through the Django ORM.
- Production application commands and maintenance procedures depend on Django management commands.

### Related Documents

- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/DEPLOYMENT_GUIDE.md`
- `Projects/OpenVoz/OPERATIONS_RUNBOOK.md`

## ADR-002: Use Gunicorn as the WSGI Application Server

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

The Django application requires a production WSGI application server between the public web server and the backend.

### Decision

Use Gunicorn to execute the Django application and receive requests forwarded by Nginx.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- Gunicorn is a required production service.
- Deployments and maintenance must restart or reload the Gunicorn service when application changes require it.
- Gunicorn service status and logs are part of operational health checks.

### Related Documents

- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/DEPLOYMENT_GUIDE.md`
- `Projects/OpenVoz/OPERATIONS_RUNBOOK.md`

## ADR-003: Use Nginx as the Reverse Proxy

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

OpenVoz requires a public web server to receive HTTPS traffic, forward application requests to Gunicorn, and serve static and media files.

### Decision

Use Nginx as the public web server and reverse proxy because it provides the documented boundary between user HTTPS requests and Gunicorn.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- Nginx configuration and service availability directly affect public access.
- Nginx configuration must be validated before reloads or restarts.
- Nginx status and logs are required operational checks.

### Related Documents

- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/DEPLOYMENT_GUIDE.md`
- `Projects/OpenVoz/OPERATIONS_RUNBOOK.md`

## ADR-004: Use DigitalOcean for Production Hosting

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

OpenVoz requires production compute, networking, storage, and remote administration for its Ubuntu, Nginx, Gunicorn, and Django environment.

### Decision

Use a DigitalOcean Droplet as the production virtual private server because it hosts the verified OpenVoz production environment and its application services.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- Production availability depends on the DigitalOcean Droplet and its network connectivity.
- Operators administer the server through SSH.
- Application files, static files, and media files are stored in the server environment.

### Related Documents

- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/DEPLOYMENT_GUIDE.md`
- `Projects/OpenVoz/OPERATIONS_RUNBOOK.md`

## ADR-005: Use the OpenAI API for AI Services

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

OpenVoz requires AI-generated conversational responses and language assessment while keeping external AI services isolated behind the Django backend.

### Decision

Use the OpenAI API for AI-powered responses and assessment. The Django backend is the only application layer that communicates with the service.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- AI-enabled features depend on external OpenAI API availability.
- API credentials must be provided securely through environment variables.
- AI availability must be verified through the application and monitored through backend errors.
- The frontend does not communicate directly with the OpenAI API.

### Related Documents

- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/DEPLOYMENT_GUIDE.md`
- `Projects/OpenVoz/OPERATIONS_RUNBOOK.md`

## ADR-006: Use GitHub for Source Code Version Control

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

OpenVoz requires a source repository that supports version-controlled application updates to the production server.

### Decision

Use GitHub as the source code repository because the documented deployment and maintenance workflow synchronizes approved application changes from GitHub.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- Production updates depend on access to the GitHub repository.
- Operators must verify the deployment branch, working tree, and incoming commits before updating.
- Deployed revisions can be identified through Git history.

### Related Documents

- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/DEPLOYMENT_GUIDE.md`
- `Projects/OpenVoz/OPERATIONS_RUNBOOK.md`

## ADR-007: Use HTTPS with Let's Encrypt

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

OpenVoz requires secure communication between users and the production application, with certificate management integrated into the Nginx infrastructure.

### Decision

Require HTTPS for frontend communication and use Let's Encrypt certificates managed through Certbot.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- Nginx terminates secure public traffic.
- Certificate validity and renewal behavior are production health concerns.
- Operations include HTTPS availability checks and Certbot certificate verification.

### Related Documents

- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/DEPLOYMENT_GUIDE.md`
- `Projects/OpenVoz/OPERATIONS_RUNBOOK.md`

---

# Future Decisions

Create a new sequential record from the Decision Record Format before implementing a material architectural change.

Future records should:

- Capture the verified context and constraints.
- Identify the people responsible for accepting the decision.
- Record alternatives only when they were evaluated.
- Define consequences for development, deployment, security, and operations.
- Reference affected project documents.
- Use `Proposed` while under review and `Accepted` only after approval.
- Mark an earlier record `Superseded` when a new accepted decision replaces it.
- Mark a decision `Deprecated` when it remains present but should no longer guide new work.

Do not add future decisions solely because a technology appears in a roadmap.

---

# References

- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/DEPLOYMENT_GUIDE.md`
- `Projects/OpenVoz/OPERATIONS_RUNBOOK.md`
