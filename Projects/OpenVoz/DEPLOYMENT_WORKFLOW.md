# OpenVoz Deployment Workflow

## Purpose

This document defines the official development, testing, version control, deployment, validation, and rollback workflow for OpenVoz.

It is the operational standard for developers and maintainers delivering changes to the platform. Every feature, fix, configuration change, dependency update, and database migration must follow this workflow unless an approved incident procedure requires a different response.

Infrastructure configuration and initial provisioning are documented in `DEPLOYMENT_GUIDE.md`. Routine production administration is documented in `OPERATIONS_RUNBOOK.md`. Framework-wide principles are defined in `../../Core/11_DEPLOYMENT.md`.

---

# Development Philosophy

OpenVoz follows a development-first workflow:

```text
Local Development
        ↓
Local Testing
        ↓
Git Commit
        ↓
GitHub Repository
        ↓
Production Server
        ↓
Production Validation
```

The production server is never the primary development environment. Code must not be designed, debugged, or edited directly in production during normal development.

Production receives approved, committed, and reproducible changes from the GitHub repository. This preserves traceability, keeps environments synchronized, and ensures that a deployed revision can be identified and restored.

---

# Repository Information

Record and maintain the verified repository details below. Do not substitute machine-specific values in this document unless they become approved project standards.

| Repository | Purpose | Standard or Value |
|---|---|---|
| Local repository | Development and local validation | `<LOCAL_REPOSITORY_DIRECTORY>` |
| GitHub repository | Authoritative shared remote | `<GITHUB_REPOSITORY_URL>` |
| Production repository | Deployed working tree | `<APPLICATION_DIRECTORY>` |
| Primary branch | Approved deployment branch | `main` |
| Git remote | Default shared remote | `origin` |

Before a deployment, the local and production repositories must both identify the expected remote, branch, and commit.

---

# Local Development Environment

## Preparation

1. Clone or update the approved GitHub repository.
2. Enter the repository directory.
3. Create and activate a Python virtual environment.
4. Install dependencies from the dependency manifest used by the application.
5. Configure development environment variables without committing secrets.
6. Configure the development database.
7. Apply migrations.
8. Confirm the configured static and media directories are available.

Example virtual environment setup:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

The virtual environment directory and local environment files must remain excluded from version control.

## Environment Variables

Use the project's approved local configuration mechanism. Required values may include Django settings, database connectivity, allowed hosts, and OpenAI integration credentials.

- Never commit secrets or production credentials.
- Use development-specific values locally.
- Confirm required values are present before starting Django.
- Keep variable names synchronized with the deployed application configuration.

Refer to `DEPLOYMENT_GUIDE.md` for the environment-variable inventory as it is verified and maintained.

## Database Configuration

OpenVoz may use SQLite for development and PostgreSQL in production, as documented in `DEPLOYMENT_GUIDE.md`.

- Do not assume that local and production database engines are interchangeable.
- Generate and test migrations locally.
- Review migration operations before deployment.
- Do not copy production data into development without authorization and appropriate protection.

## Static and Media Files

- Treat source-controlled static assets as application code.
- Confirm static assets render correctly during local testing.
- Treat user-uploaded media as persistent operational data, not repository content.
- Do not commit generated static output or user media unless the project explicitly requires it.
- Verify media upload, retrieval, and permissions whenever a change affects media handling.

---

# Local Startup Procedure

From the repository root:

```bash
source .venv/bin/activate
python manage.py migrate
python manage.py runserver
```

If the project standard uses a different virtual environment name or settings module, use the documented project value rather than changing application configuration ad hoc.

Verify successful startup:

1. Confirm Django starts without an exception.
2. Confirm the development server reports its local address.
3. Open the application in a supported browser.
4. Confirm the home page loads without server or browser-console errors.
5. Confirm the terminal does not report unexpected request errors.

The Django development server is for local development only and must not be used to serve production traffic.

---

# Local Validation Checklist

Complete the applicable checks before creating the deployment commit.

## Automated Validation

```bash
source .venv/bin/activate
python manage.py check
python manage.py test
```

When a change includes models or migrations, also run:

```bash
python manage.py makemigrations --check --dry-run
python manage.py showmigrations
```

Use any additional linting, formatting, type checking, security scanning, or project-specific test commands established by the repository.

## Manual Verification

- [ ] The affected feature works as intended.
- [ ] Error and empty states behave correctly.
- [ ] Authentication and authorization remain correct.
- [ ] Staff-only behavior is not exposed to unauthorized users.
- [ ] Existing related workflows remain operational.
- [ ] No secrets, credentials, or sensitive data appear in code, output, or logs.
- [ ] Documentation reflects user-visible or operational changes.

## Browser Testing

- [ ] Pages load without unexpected browser-console errors.
- [ ] Navigation, forms, and validation work.
- [ ] Responsive layouts remain usable at relevant viewport sizes.
- [ ] Static assets load correctly.
- [ ] Authentication workflows behave correctly.

## Media Verification

When the change affects media:

- [ ] Upload succeeds for an allowed file.
- [ ] Stored media can be retrieved.
- [ ] Invalid or oversized files are handled correctly.
- [ ] Existing media remains accessible.
- [ ] Media paths and permissions behave correctly.

## AI Feature Verification

When the change affects AI functionality:

- [ ] A normal OpenVoz AI workflow completes successfully.
- [ ] Missing, invalid, or unavailable AI service responses fail safely.
- [ ] Timeouts and user-facing error messages are acceptable.
- [ ] No API key or sensitive prompt data is exposed.
- [ ] Usage and behavior remain within approved product expectations.
- [ ] Logs contain enough diagnostic context without sensitive content.

---

# Git Workflow

## Inspect the Working Tree

```bash
git status
git diff
git diff --staged
```

Review every changed file. Separate unrelated work into different commits and do not commit local secrets, generated files, virtual environments, databases, or user media.

## Create the Commit

Stage only the intended changes:

```bash
git add <files>
git diff --staged
git commit -m "<type>: <concise description>"
```

Use meaningful, imperative commit messages that explain the delivered change. Recommended types include:

- `feat:` for new functionality.
- `fix:` for defect corrections.
- `docs:` for documentation.
- `refactor:` for behavior-preserving code changes.
- `test:` for test changes.
- `chore:` for maintenance.

Examples:

```text
feat: add staff media filtering
fix: preserve uploaded audio during lesson edits
docs: establish deployment workflow
```

Avoid vague messages such as `update`, `changes`, or `fix stuff`.

## Confirm the Commit

```bash
git status
git log --oneline -1
```

The working tree should be clean unless intentionally uncommitted work remains. Record the approved commit hash for deployment verification.

---

# GitHub Workflow

The current deployment branch is `main`.

Before pushing, synchronize with the remote and resolve any divergence locally:

```bash
git fetch origin
git status
git log --oneline --decorate --graph --max-count=20
git pull --ff-only origin main
```

Re-run affected validation if synchronization changes the local revision. Then push:

```bash
git push origin main
```

Verify that:

- The push succeeds.
- GitHub shows the expected commit on `main`.
- Required repository checks, if configured, pass.
- The local `HEAD` and `origin/main` identify the same approved commit.

```bash
git rev-parse HEAD
git rev-parse origin/main
```

Do not force-push `main` as part of the normal OpenVoz workflow. Feature branches and pull requests may be introduced later, but they are not assumed by this procedure.

---

# Production Deployment

## Preconditions

- [ ] Local validation passed.
- [ ] Documentation is synchronized with the change.
- [ ] The deployment commit is on GitHub `main`.
- [ ] The intended commit hash has been recorded.
- [ ] Migration and dependency changes have been reviewed.
- [ ] A current backup exists when the change can affect persistent data.
- [ ] Required production access and a suitable deployment window are available.

Use the verified values maintained for:

```text
<PRODUCTION_SSH_TARGET>
<APPLICATION_DIRECTORY>
<VIRTUAL_ENVIRONMENT_PATH>
<GUNICORN_SERVICE>
<PRODUCTION_DOMAIN>
```

## Required Steps

### 1. Connect and Inspect

```bash
ssh <PRODUCTION_SSH_TARGET>
cd <APPLICATION_DIRECTORY>
git status
git branch --show-current
git remote -v
```

Stop the deployment if the production working tree contains unexplained changes or is not on `main`. Preserve and investigate unexpected state; do not overwrite it.

### 2. Review and Pull the Approved Revision

```bash
git fetch origin
git log --oneline HEAD..origin/main
git pull --ff-only origin main
git rev-parse HEAD
```

Confirm that the production commit matches the recorded deployment commit.

### 3. Activate the Production Environment

```bash
source <VIRTUAL_ENVIRONMENT_PATH>/bin/activate
```

### 4. Run Django Checks

```bash
python manage.py check --deploy
```

Review warnings in the context of the approved production settings. Do not continue past an unexplained error.

### 5. Restart the Application Service

```bash
sudo systemctl restart <GUNICORN_SERVICE>
sudo systemctl status <GUNICORN_SERVICE> --no-pager
```

Confirm that Gunicorn returns to an active state.

### 6. Verify the Web Server

If application routing or web-server configuration has not changed, confirm Nginx remains healthy:

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
```

Proceed immediately to post-deployment validation.

## Conditional Steps

Run these steps only when the release requires them.

### Install Changed Dependencies

When the dependency manifest changed:

```bash
python -m pip install -r requirements.txt
```

Use the project's approved dependency installation policy and review installation errors before continuing.

### Apply Database Migrations

When the release includes migrations:

```bash
python manage.py showmigrations
python manage.py migrate
```

Confirm the applicable backup and rollback implications before applying a migration to production. A code rollback does not automatically reverse a database change.

### Collect Static Files

When static assets or static configuration changed:

```bash
python manage.py collectstatic --noinput
```

### Restart Nginx

Restart Nginx only when required by an approved configuration or service change:

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager
```

Never restart Nginx after a failed configuration test.

Detailed service and maintenance procedures are maintained in `OPERATIONS_RUNBOOK.md`.

---

# Post-Deployment Validation

Complete this checklist immediately after deployment:

- [ ] The production commit matches the approved GitHub commit.
- [ ] Nginx is active and its configuration is valid.
- [ ] Gunicorn is active.
- [ ] The site loads successfully over HTTPS.
- [ ] Login works for an authorized test account.
- [ ] The Staff Dashboard loads and its primary actions work.
- [ ] Content Manager loads and its primary actions work.
- [ ] Media Library lists, retrieves, and handles media correctly.
- [ ] Static assets render correctly.
- [ ] A representative AI feature returns a valid response.
- [ ] Existing critical OpenVoz functionality remains operational.
- [ ] Recent Nginx, Gunicorn, and application logs show no new unexplained errors.

Useful verification commands:

```bash
sudo systemctl is-active nginx
sudo systemctl is-active <GUNICORN_SERVICE>
sudo systemctl --failed
curl --fail --silent --show-error --location --output /dev/null --write-out '%{http_code}\n' https://<PRODUCTION_DOMAIN>/
git rev-parse --short HEAD
```

Record the date, operator, branch, commit, result, and any issue encountered. Use `../../Templates/DEPLOYMENT_CHECKLIST_TEMPLATE.md` as the deployment record format.

If validation fails, stop further releases, assess user impact, review logs, and either correct the issue through the standard workflow or begin rollback.

---

# Rollback Procedure

Rollback restores the last known stable application state. Database compatibility must be assessed separately from code compatibility.

1. Stop and record the failed deployment state, including its commit hash and observed symptoms.
2. Identify the previous stable commit from the deployment record and Git history.
3. Review all migrations, dependencies, static assets, and configuration changes between the failed and stable revisions.
4. Confirm that the selected rollback method preserves repository history and operational data.
5. Restore the previous stable application revision using an approved, non-destructive Git procedure.
6. Reinstall the stable revision's dependencies if dependency declarations changed.
7. Handle database migrations only when a reviewed and tested reverse migration or restoration procedure is appropriate.
8. Recollect static files if the stable revision requires different assets.
9. Restart the affected application services.
10. Repeat the full post-deployment validation checklist.
11. Record the rollback result in the deployment record and document a production incident in `INCIDENT_LOG.md` when appropriate.

Do not improvise destructive Git or database commands in production. If a safe reverse migration is unavailable, preserve the database state and use a forward-compatible application correction or the approved backup-and-recovery procedure in `../../Core/16_BACKUP_AND_RECOVERY.md`.

---

# Troubleshooting

## Migration Failures

- Stop before restarting services when the application and schema may be incompatible.
- Read the complete migration error and identify the last successfully applied migration.
- Verify the production database connection and user permissions.
- Compare `showmigrations` output with the approved release.
- Do not edit applied migration history or production data ad hoc.

See `OPERATIONS_RUNBOOK.md` and `../../Operations/Troubleshooting/DATABASE_CONNECTION_FAILURE.md`.

## Static Files Not Updating

- Confirm `collectstatic` used the production settings and virtual environment.
- Check the configured static root, Nginx mapping, file ownership, and permissions.
- Confirm the browser or proxy is not serving a stale cached asset.
- Verify the asset exists in the deployed commit.

See `../../Operations/Troubleshooting/COLLECTSTATIC_ISSUES.md` and `../../Operations/Troubleshooting/STATIC_FILES_NOT_LOADING.md`.

## Missing Dependencies

- Confirm the correct virtual environment is active.
- Confirm the deployed dependency manifest matches the approved commit.
- Install from the declared manifest and review version conflicts.
- Restart Gunicorn after the environment is corrected.

## Service Restart Failures

- Inspect systemd status and recent journal entries.
- Confirm the service unit uses the expected application directory and virtual environment.
- Run Django checks and inspect configuration before retrying.

See `../../Operations/Troubleshooting/GUNICORN_WORKER_FAILED_TO_BOOT.md`, `../../Operations/Troubleshooting/NGINX_502_BAD_GATEWAY.md`, and `../../Operations/Monitoring/SYSTEMD_SERVICES.md`.

## Permission Problems

- Identify the exact file or directory and the service account that requires access.
- Compare ownership and permissions with the approved configuration.
- Apply the narrowest correction; do not use broad world-writable permissions.

See `../../Operations/Troubleshooting/PERMISSION_DENIED.md`.

## Media Issues

- Confirm the media path and Nginx mapping.
- Check file existence, ownership, permissions, storage capacity, and upload limits.
- Confirm user media was not replaced or removed during deployment.
- Test both new uploads and existing media retrieval.

## AI Integration Issues

- Confirm required environment variables exist without printing secret values.
- Check application logs for authentication, quota, timeout, and response errors.
- Confirm outbound connectivity and provider availability.
- Test a representative application workflow.
- Fail safely and avoid exposing provider errors or credentials to users.

Operational health checks are documented in `OPERATIONS_RUNBOOK.md` and `../../Operations/Monitoring/HEALTH_CHECKS.md`.

---

# Best Practices

- Develop and test locally before every deployment.
- Keep commits focused and commit frequently at stable milestones.
- Use meaningful commit messages.
- Keep code, migrations, dependency declarations, and documentation synchronized.
- Never use production as the primary development environment.
- Avoid direct production edits.
- Preserve backward compatibility where practical.
- Review every migration before production use.
- Protect secrets and persistent user data.
- Use fast-forward-only synchronization for the normal production pull.
- Record the exact commit deployed.
- Validate every deployment immediately.
- Convert production lessons into documentation, tests, or framework improvements.

---

# Future Enhancements

The following capabilities are candidates for future workflow improvements and are not documented here as currently implemented:

- Continuous integration and continuous deployment.
- Automated test execution on every push.
- A dedicated staging environment.
- Containerized or Docker-based deployment.
- Automated, verified rollback.
- Application performance and error monitoring.
- Deployment health gates.
- Deployment and incident notifications.
- Protected branches and pull-request approval rules.
- Automated deployment records and release notes.

Adopt future enhancements only after their design, ownership, security, and recovery procedures are documented and approved.
