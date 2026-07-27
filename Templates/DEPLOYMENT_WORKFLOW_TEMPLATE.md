# Deployment Workflow

**Project:** [Project name]

**Environment:** [Staging | Production | Other]

**Deployment Owner:** [Name or role]

**Approved Branch:** [Branch name]

**Application Directory:** `[Absolute deployment path]`

**Service Manager:** [systemd | Docker Compose | Kubernetes | Platform service | Other]

**Last Reviewed:** [YYYY-MM-DD]

---

## Purpose

This document defines a reusable workflow for deploying Python web applications such as Django, Flask, FastAPI, and similar services.

Customize all bracketed placeholders before using this procedure. Remove steps that do not apply, and document project-specific commands in the project copy of this template.

## Deployment Principles

- Develop and test changes outside production.
- Deploy only approved, committed, and reproducible revisions.
- Identify the exact revision before and after deployment.
- Protect secrets and persistent data.
- Back up data before changes that could affect recoverability.
- Prefer automated, repeatable deployment steps.
- Keep downtime and irreversible operations to a minimum.
- Verify application health and critical workflows after every deployment.
- Define rollback criteria before beginning.
- Record the deployment result.

## Standard Flow

```text
Develop
   ↓
Validate
   ↓
Approve Release
   ↓
Back Up
   ↓
Deploy Revision
   ↓
Update Dependencies and Data
   ↓
Restart or Replace Services
   ↓
Verify
   ↓
Complete or Roll Back
   ↓
Record Result
```

## Project Deployment Configuration

Complete this table in the project-specific copy.

| Setting | Value |
|---------|-------|
| Repository | `[Repository URL]` |
| Deployment branch or tag | `[Branch or tag]` |
| Remote name | `[Remote name]` |
| Application directory | `[Absolute path]` |
| Virtual environment | `[Absolute path or not applicable]` |
| Dependency manifest | `[requirements.txt | pyproject.toml | other]` |
| Application framework | `[Django | Flask | FastAPI | other]` |
| Application service | `[Service or workload name]` |
| Reverse proxy | `[Service name or not applicable]` |
| Database | `[Engine and connection identifier]` |
| Health endpoint | `[URL or command]` |
| Public application URL | `[URL]` |
| Backup procedure | `[Document path]` |
| Rollback procedure | `[Document path or section]` |
| Deployment log | `[Document or system location]` |

Never record credentials, private keys, tokens, or secret values in this document.

---

## 1. Prepare the Release

### Review the Change

Confirm:

- [ ] The intended scope is understood.
- [ ] Code review or required approval is complete.
- [ ] Dependency changes have been reviewed.
- [ ] Database migrations have been reviewed.
- [ ] Configuration changes are documented.
- [ ] User-visible and operational documentation is current.
- [ ] A rollback path exists.

### Validate in Development or Staging

Run the commands established by the project. Typical checks include:

```bash
<activate-environment-command>
<lint-command>
<type-check-command>
<test-command>
<security-check-command>
```

Framework examples:

```bash
# Django
python manage.py check
python manage.py test
python manage.py makemigrations --check --dry-run

# Flask or FastAPI projects using pytest
python -m pytest
```

Only run commands that the project has configured and validated.

### Confirm the Release Revision

```bash
git status
git log --oneline -1
git rev-parse HEAD
```

Record:

```text
Release branch or tag: [Value]
Release commit: [Full commit hash]
Release approved by: [Name or role]
```

The working tree should be clean, and the release revision should be available from the approved remote repository or artifact registry.

---

## 2. Perform Pre-Deployment Checks

Confirm:

- [ ] The correct target environment has been selected.
- [ ] The deployment window is open.
- [ ] Required access is available.
- [ ] Monitoring and logs are accessible.
- [ ] Current service health is known.
- [ ] Required configuration and secrets are present.
- [ ] Available disk space and system capacity are sufficient.
- [ ] No conflicting deployment or maintenance activity is underway.
- [ ] Stakeholders have been notified when required.

Record the current deployed revision:

```bash
cd <application-directory>
git rev-parse HEAD
```

For artifact- or image-based deployments, record the current artifact version or image digest instead.

### Back Up Persistent Data

Create or verify a current backup when the deployment affects:

- Database schemas or stored data.
- User-uploaded files.
- Persistent volumes.
- Configuration that cannot be reconstructed automatically.

Follow the approved backup procedure:

```text
[Reference to backup procedure]
```

Verify that the backup completed successfully and record its identifier. Do not assume that creating a backup command means the backup is usable.

---

## 3. Place the Application in the Required Deployment State

Choose the approach defined by the project:

- Rolling or zero-downtime replacement.
- Blue-green deployment.
- Maintenance mode.
- Brief service stop.
- Platform-managed release.

If maintenance mode or a service stop is required:

```bash
<enable-maintenance-mode-command>
<stop-application-command>
```

Do not stop shared services unless the approved deployment design requires it.

---

## 4. Deploy the Approved Revision

Use one approved delivery method.

### Git-Based Deployment

```bash
cd <application-directory>
git status
git fetch <remote-name>
git checkout <approved-branch>
git pull --ff-only <remote-name> <approved-branch>
git rev-parse HEAD
```

Confirm that the deployed commit exactly matches the recorded release commit.

Do not discard local production changes automatically. If the production working tree is not clean, stop and investigate before continuing.

### Artifact, Container, or Platform Deployment

```bash
<authenticate-to-registry-or-platform>
<retrieve-approved-artifact>
<deploy-artifact-or-image-by-version>
<confirm-deployed-version-or-digest>
```

Use an immutable version, tag, digest, or release identifier. Avoid deploying an unverified floating version.

---

## 5. Update the Runtime

### Activate the Runtime Environment

For a virtual-environment deployment:

```bash
source <virtual-environment-path>/bin/activate
```

For containers or managed platforms, run subsequent commands in the approved release environment.

### Install Dependencies

Use the project's locked or approved dependency source:

```bash
python -m pip install -r <requirements-file>
```

Or:

```bash
<project-package-manager> <approved-install-command>
```

Avoid unreviewed dependency upgrades during deployment.

### Apply Database Migrations

First review the migration state:

```bash
<migration-status-or-preview-command>
```

Then apply approved migrations:

```bash
<migration-command>
```

Common examples:

```bash
# Django
python manage.py showmigrations
python manage.py migrate

# Projects using Alembic
alembic current
alembic upgrade head
```

For destructive, long-running, or backward-incompatible migrations, follow a separately reviewed migration plan. Confirm application-version compatibility before proceeding.

### Build or Collect Assets

When applicable:

```bash
<asset-build-command>
<static-file-collection-command>
```

Example for a Django project configured to collect static assets:

```bash
python manage.py collectstatic --noinput
```

### Run Deployment Checks

```bash
<framework-check-command>
<configuration-validation-command>
```

Examples may include:

```bash
# Django
python manage.py check --deploy

# Import or startup validation
python -m py_compile <application-entrypoint>
```

Stop before restarting services if a required check fails.

---

## 6. Restart or Replace Application Services

Use the project's approved service mechanism.

### systemd Example

```bash
sudo systemctl restart <application-service>
sudo systemctl status <application-service> --no-pager
```

Reload or restart the reverse proxy only when its configuration or operational state requires it:

```bash
sudo <reverse-proxy-configuration-test-command>
sudo systemctl reload <reverse-proxy-service>
```

### Docker Compose Example

```bash
docker compose up -d --build <application-service>
docker compose ps
```

### Kubernetes or Managed Platform

```bash
<apply-or-release-command>
<rollout-status-command>
```

Confirm that the expected number of application instances is healthy before continuing.

If maintenance mode was enabled:

```bash
<disable-maintenance-mode-command>
```

---

## 7. Verify the Deployment

### Confirm the Deployed Version

Verify the deployed commit, artifact version, or image digest:

```bash
<deployed-version-command>
```

It must match the approved release identifier.

### Verify Service Health

```bash
<service-status-command>
<health-check-command>
```

Confirm:

- [ ] Application processes are running.
- [ ] The health endpoint returns the expected result.
- [ ] The reverse proxy or ingress can reach the application.
- [ ] Database connectivity succeeds.
- [ ] Required queues, workers, schedulers, or background tasks are healthy.
- [ ] Logs contain no new critical or repeated errors.
- [ ] Monitoring shows acceptable error rate, latency, and resource use.

### Run Functional Smoke Tests

Verify the project's critical user paths:

- [ ] Public entry point loads.
- [ ] Authentication works when applicable.
- [ ] A primary read workflow succeeds.
- [ ] A primary write workflow succeeds when safe to test.
- [ ] Static assets load.
- [ ] Uploads or media work when applicable.
- [ ] External integrations respond or fail safely.
- [ ] AI-backed workflows work and protect sensitive data when applicable.
- [ ] Authorization boundaries remain correct.

Use synthetic or approved test data. Do not expose or alter real user data unnecessarily.

### Observe After Release

Monitor the deployment for the project's defined observation period:

```text
Observation period: [Duration]
Metrics reviewed: [Metrics]
Logs reviewed: [Locations or queries]
Rollback thresholds: [Thresholds]
```

---

## 8. Decide: Complete or Roll Back

Complete the deployment only when:

- The expected revision is running.
- Required health checks pass.
- Critical workflows pass.
- Error rates and performance remain within accepted limits.
- No unresolved release-blocking issue remains.

Initiate rollback when:

- The application cannot start or remain healthy.
- A critical workflow fails.
- Data integrity is at risk.
- Security controls are impaired.
- Error rate, latency, or resource use exceeds the defined threshold.
- The release revision cannot be verified.

---

## 9. Rollback Procedure

Rollback steps must be customized and tested before production use.

### Restore the Previous Application Version

```bash
<deploy-previous-approved-revision-or-artifact>
<restart-or-rollout-command>
```

### Handle Database Compatibility

Choose the approved response:

- Keep forward-compatible migrations in place.
- Apply a reviewed reverse migration.
- Restore from backup.
- Execute a separately approved recovery plan.

Do not reverse migrations or restore data automatically unless the consequences are understood and the action is authorized.

### Re-Verify

```bash
<service-status-command>
<health-check-command>
```

Repeat the critical smoke tests and confirm that the previous stable version is operational.

Record the rollback reason, actions, data impact, and follow-up owner.

---

## 10. Deployment Record

| Field | Value |
|-------|-------|
| Project | [Project name] |
| Environment | [Environment] |
| Deployment start | [YYYY-MM-DD HH:MM timezone] |
| Deployment end | [YYYY-MM-DD HH:MM timezone] |
| Deployed by | [Name or role] |
| Approved by | [Name or role] |
| Previous revision | [Commit, artifact, or image identifier] |
| New revision | [Commit, artifact, or image identifier] |
| Backup identifier | [Identifier or not applicable] |
| Database migrations | [Applied migrations or none] |
| Configuration changes | [Summary or none] |
| Verification result | [Passed | Failed | Partial] |
| Deployment result | [Successful | Rolled Back | Aborted] |
| Incident or issue reference | [Reference or none] |

### Notes

[Summarize noteworthy events, deviations, decisions, and follow-up work.]

### Follow-Up Actions

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action] | [Owner] | [YYYY-MM-DD] | [Open | Complete] |

---

## Deployment Checklist

### Before Deployment

- [ ] Change approved.
- [ ] Tests and required checks passed.
- [ ] Release revision recorded.
- [ ] Target environment confirmed.
- [ ] Current deployed revision recorded.
- [ ] Backup completed or confirmed unnecessary.
- [ ] Rollback method and thresholds confirmed.

### During Deployment

- [ ] Approved revision deployed.
- [ ] Dependencies installed from approved source.
- [ ] Migrations applied when required.
- [ ] Assets built or collected when required.
- [ ] Configuration validated.
- [ ] Services restarted or replaced successfully.

### After Deployment

- [ ] Deployed revision verified.
- [ ] Service and dependency health verified.
- [ ] Critical smoke tests passed.
- [ ] Logs and monitoring reviewed.
- [ ] Observation period completed.
- [ ] Maintenance mode disabled.
- [ ] Deployment result recorded.
- [ ] Stakeholders notified when required.
