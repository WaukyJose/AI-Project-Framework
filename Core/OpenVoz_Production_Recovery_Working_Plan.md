# OpenVoz -- Production Recovery & Deployment Working Plan

## Purpose

This document is a practical recovery plan to follow if the production
update fails. It complements the Production Baseline Audit and serves as
the operational checklist during deployment.

## Current Situation

The production qualification identified four critical blockers before
release:

1.  No immutable release candidate.
2.  Production Git working tree is not clean.
3.  No verified database + media recovery set.
4.  Deployment, rollback, and disaster recovery have not been fully
    qualified.

The Production Baseline Audit captured the current production
environment (Ubuntu 24.04.2 LTS on a DigitalOcean Droplet) and revealed
a production Git tree containing many deleted/modified files that must
be understood before deployment. This baseline should be preserved for
comparison before and after release.

## Deployment Strategy

### Stage 1 -- Freeze

- Stop feature development.
- Finish local testing.
- Commit all approved changes.
- Push to GitHub.
- Create a Release Candidate tag.

### Stage 2 -- Baseline

Collect and archive: - Git SHA - Git status - Running services - System
information - SSL status - Database status - Disk usage - Media
inventory - Application smoke test

Do not modify production during this stage.

### Stage 3 -- Backup

Create: - PostgreSQL backup - Media snapshot - Recovery manifest -
Checksums

Verify restoration in an isolated environment before deployment.

### Stage 4 -- Deployment

- Pull the approved release candidate.
- Install dependencies if needed.
- Run migrations.
- Collect static files.
- Restart services.
- Execute smoke tests.

## If Deployment Fails

Immediately:

1.  Stop further changes.
2.  Preserve logs.
3.  Record the exact failure.
4.  Do NOT continue troubleshooting on a partially deployed system.

Then:

- Restore previous Git release.
- Restore database if required.
- Restore media if required.
- Restart services.
- Execute smoke tests.
- Confirm application functionality.

## Evidence to Collect

- Git SHA before and after deployment.
- Deployment log.
- Migration output.
- Rollback log (if executed).
- Backup verification.
- Smoke test results.
- Final production status.

## Success Criteria

The deployment is successful only if: - Production matches the approved
release SHA. - All critical functionality operates. - No data loss
occurs. - Rollback has been demonstrated or remains immediately
available. - Production is stable after verification.

## Future Improvements

- Atomic deployments.
- Automated backups.
- Automated health checks.
- Continuous deployment pipeline.
- Automated release evidence collection.
