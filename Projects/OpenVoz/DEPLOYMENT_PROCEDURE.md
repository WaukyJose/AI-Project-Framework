# OpenVoz Production Deployment Procedure

**Procedure ID:** OPENVOZ-OPS-DEPLOY-001  
**System / Service:** OpenVoz  
**Environment:** Production  
**Owner:** OpenVoz Operations  
**Approver:** OpenVoz release approver  
**Status:** Approved  
**Version:** 1.0  
**Effective Date:** 2026-07-29  
**Review Trigger:** After any material production, deployment, or recovery change

---

## Purpose

This procedure defines the controlled method for deploying an approved OpenVoz Release Candidate to the production DigitalOcean server. Its purpose is to make every deployment deterministic, repeatable, auditable, recoverable, and verifiable without relying on chat history, operator memory, or manual production edits.

## Scope

This procedure covers:

- deployment of an approved Release Candidate from GitHub to the existing production server;
- verification of the Git revision and production working tree;
- conditional installation of declared Python dependencies;
- Django deployment checks, migrations, and static-file collection;
- restart and health verification of Gunicorn;
- validation of Nginx, PostgreSQL-backed application behavior, HTTPS, and critical OpenVoz workflows;
- rollback to the previously recorded Git revision, with separate consideration of database recovery; and
- collection of evidence needed for the deployment record.

This procedure does not cover initial server provisioning, DNS changes, Nginx or Gunicorn reconfiguration, SSL issuance, operating-system upgrades, credential rotation, database administration unrelated to the release, or development and Release Candidate qualification.

## Preconditions

The operator must confirm every item before connecting to production:

- [ ] The GitHub Release Candidate has been qualified and approved for production.
- [ ] The approved Release Candidate is identified by its full 40-character Git commit SHA.
- [ ] The approved commit is present on `origin/main`.
- [ ] The local Release Candidate repository is synchronized with GitHub and clean.
- [ ] The production PostgreSQL backup has completed successfully.
- [ ] Any release-affected persistent media has been backed up when applicable.
- [ ] The backup identifier, creation time, storage location, and verification result are recorded.
- [ ] The previous known-good production commit SHA is available from the last successful deployment record.
- [ ] The release's dependency, migration, static-file, configuration, and compatibility changes have been reviewed.
- [ ] Required SSH, GitHub, `sudo`, application, and functional-test credentials are available through approved secure channels.
- [ ] Required production environment variables and secrets are already configured; no secret will be entered into the repository or deployment record.
- [ ] A maintenance window has been confirmed when the release may interrupt service.
- [ ] The deployment approver, operator, start time, rollback decision owner, and communication channel are recorded.

Stop if any precondition is unmet. Do not deploy without a verified backup when migrations or persistent data could be affected.

## Production Environment

| Component | Audited production value |
|-----------|--------------------------|
| Hosting | DigitalOcean server |
| Operating system | Ubuntu 24.04 LTS |
| Application framework | Django |
| Python | Python interpreter managed by the production virtual environment |
| Virtual environment | `/home/voicechat/.venv` |
| Project location | `/home/voicechat` |
| Application server | Gunicorn, managed by systemd as `voicechat.service` |
| Reverse proxy | Nginx |
| Database | PostgreSQL 16 |
| Transport security | Valid SSL certificate; HTTPS terminated by Nginx |
| Source remote | GitHub remote `origin` |
| Production branch | `main` |

The verified production request flow is:

```text
Internet
    │
    ▼
Nginx
    │
proxy_pass http://127.0.0.1:8000
    │
    ▼
voicechat.service
    │
    ▼
Gunicorn
    │
    ▼
Django
```

Nginx accepts HTTPS traffic and proxies application requests to `http://127.0.0.1:8000`. The `voicechat.service` systemd unit manages Gunicorn, which runs Django from the production virtual environment. Django uses PostgreSQL for persistent application data and external services for AI response generation and text-to-speech functionality.

## Controlled Inputs and Deployment Record

Before execution, create a deployment record outside the production repository. Record:

```text
Deployment date and start time
Operator
Approver
Maintenance window
Approved Release Candidate commit SHA
Previous production commit SHA
Backup identifier and verification result
Dependency manifest changed: yes/no
Migrations included: yes/no
Static assets or static configuration changed: yes/no
Configuration change required: yes/no
```

The approved Release Candidate SHA and previous production SHA are controlled inputs. Copy full SHAs from GitHub and the previous deployment record; do not infer them from branch position or abbreviated output.

During the procedure, retain the command output required by the Evidence and Audit Record section. Do not record credentials, tokens, private keys, environment-variable values, personal data, or other secrets.

## Safety and Stop Conditions

- Evaluate all production working-tree modifications before deployment. Tracked runtime-generated assets, such as generated audio files, require separate evaluation; block execution only when changes could interfere with the deployment.
- Never use `git reset --hard`, force pull, force push, or ad hoc file replacement as part of this procedure.
- Never edit application code, migrations, dependency manifests, service units, or Nginx configuration directly in production.
- Do not continue after an unexplained command error.
- Do not run `migrate` until the backup and database compatibility review are confirmed.
- Do not restart Nginx after a failed `nginx -t`.
- Stop and escalate if the current branch is not `main`, the remote is not the approved GitHub repository, the approved SHA is absent from `origin/main`, a pull is not fast-forward-only, or the observed production state differs materially from the recorded baseline.
- Begin rollback when post-deployment validation identifies release-caused loss of critical functionality, data-integrity risk, or an application state that cannot be corrected safely within the maintenance window.

## Deployment Procedure

Run commands exactly as shown unless a step is explicitly conditional. Review each command's output before continuing.

### 1. Connect to the Production Server

Connect through the approved SSH account and host definition maintained in the operator's secure access configuration. Confirm the server identity before making changes.

```bash
hostnamectl
whoami
date --iso-8601=seconds
```

The output must identify the audited Ubuntu 24.04 production server and the authorized operator account.

### 2. Enter the Project and Activate Python

```bash
cd /home/voicechat
source /home/voicechat/.venv/bin/activate
pwd
python --version
python -c "import sys; print(sys.executable)"
```

Expected results:

- `pwd` returns `/home/voicechat`.
- The Python executable is `/home/voicechat/.venv/bin/python`.
- Python starts without an import or environment error.

Record the reported Python version.

### 3. Capture the Pre-Deployment Baseline

```bash
git rev-parse HEAD
git status --short
git branch --show-current
git remote get-url origin
sudo systemctl is-active postgresql
sudo systemctl is-active voicechat.service
sudo systemctl is-active nginx
sudo nginx -t
sudo systemctl --failed
df -h
```

Expected results:

- `git rev-parse HEAD` matches the recorded previous production SHA.
- every working-tree modification has been evaluated, including tracked runtime-generated assets such as generated audio files, and no change could interfere with the deployment;
- the current branch is `main`;
- `origin` is the approved GitHub repository;
- PostgreSQL, `voicechat.service`, and Nginx return `active`;
- the Nginx configuration test succeeds; and
- no relevant production unit is failed.

Stop if any working-tree change could interfere with the deployment or the baseline is not the expected production state. Evaluate tracked runtime-generated assets separately. Do not clean, stash, overwrite, or commit unexplained production changes.

### 4. Fetch and Verify the Approved Release Candidate

```bash
git fetch --prune origin
git fetch --tags origin
git log --oneline --decorate HEAD..origin/main
git merge-base --is-ancestor HEAD origin/main
```

Using the full approved Release Candidate SHA from the deployment record, run:

```bash
git cat-file -e APPROVED_RELEASE_SHA^{commit}
git merge-base --is-ancestor APPROVED_RELEASE_SHA origin/main
git rev-parse APPROVED_RELEASE_SHA
```

In these three commands, replace the literal token `APPROVED_RELEASE_SHA` with the recorded full SHA before execution. This token denotes a required controlled input, not an environment default.

Expected results:

- the approved object exists and is a commit;
- the approved commit is contained in `origin/main`;
- the resolved SHA exactly matches the deployment record; and
- the current production revision can advance to `origin/main` by fast-forward.

Stop if `origin/main` contains any commit beyond the approved Release Candidate. The deployment target must be the approved commit, not merely the latest unreviewed branch state.

### 5. Pull the Approved Revision

After confirming that `origin/main` resolves exactly to the approved full SHA:

```bash
git pull --ff-only origin main
git rev-parse HEAD
git status --short
```

The resulting full SHA must equal the approved Release Candidate SHA, and `git status --short` must show no unevaluated change or change that could interfere with the deployment. Stop if either check fails.

### 6. Install Python Dependencies When Required

Run this step only if `requirements.txt` changed between the previous production SHA and the approved Release Candidate.

Verify the change from the reviewed comparison:

```bash
git diff --name-only PREVIOUS_PRODUCTION_SHA HEAD -- requirements.txt
```

Replace `PREVIOUS_PRODUCTION_SHA` with the full SHA recorded before deployment. If the command prints `requirements.txt`, run:

```bash
python -m pip install -r requirements.txt
```

Do not install undeclared packages manually. Stop on dependency resolution or installation failure.

### 7. Run Django Deployment Checks

```bash
python manage.py check --deploy
python manage.py makemigrations --check --dry-run
```

Expected results:

- the deployment check reports no errors; and
- Django reports no model changes missing from committed migrations.

Any new warning must be understood and accepted by the deployment approver before proceeding.

### 8. Review and Apply Database Migrations

```bash
python manage.py showmigrations
python manage.py migrate --plan
```

Compare the plan with the approved migration review.

If no migration is pending, do not run a data-changing command. If migrations are pending and match the approved release, reconfirm the production backup identifier, then run:

```bash
python manage.py migrate
python manage.py showmigrations
```

All approved migrations must show as applied. Stop on any migration error. Do not edit the migration table, fake a migration, reverse a migration, or alter production data ad hoc.

### 9. Collect Static Files

Run this step when static assets, templates that reference them, or static-file configuration changed:

```bash
python manage.py collectstatic --noinput
```

The command must complete without error. Do not delete the static root manually.

### 10. Restart and Verify Gunicorn

```bash
sudo systemctl restart voicechat.service
sudo systemctl is-active voicechat.service
sudo systemctl status voicechat.service --no-pager
sudo journalctl -u voicechat.service -n 100 --no-pager
curl -I http://127.0.0.1:8000
```

`voicechat.service` must return `active`, remain active, and show no new startup traceback, missing setting, missing credential, import failure, migration incompatibility, or reCAPTCHA startup error. The local health verification must return `HTTP/1.1 200 OK` before continuing to browser-based HTTPS verification.

### 11. Validate Nginx

Application-only releases do not require an Nginx restart.

```bash
sudo nginx -t
sudo systemctl is-active nginx
sudo systemctl status nginx --no-pager
sudo tail -n 100 /var/log/nginx/error.log
```

The configuration test must succeed, Nginx must return `active`, and the error log must contain no new deployment-related error.

If an approved release separately includes an Nginx configuration change, validate it first and then reload rather than restart:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl is-active nginx
```

Never reload Nginx after a failed configuration test.

### 12. Verify Application Startup and Final Revision

```bash
python manage.py check --deploy
git rev-parse HEAD
git status --short
sudo systemctl is-active postgresql
sudo systemctl is-active voicechat.service
sudo systemctl is-active nginx
sudo systemctl --failed
```

The Git SHA must match the approved Release Candidate; the working tree must contain no unevaluated change or change that could interfere with the deployment; PostgreSQL, `voicechat.service`, and Nginx must be active; and no relevant unit may be failed.

## Post-Deployment Validation

Perform these checks through the production HTTPS domain with authorized test accounts. Use non-destructive test data and preserve evidence without capturing credentials or sensitive user content.

- [ ] **Homepage:** Load the production homepage over HTTPS. Confirm a successful response, correct rendering, and a valid browser certificate.
- [ ] **Authentication:** Sign in with an authorized test account, confirm the authenticated session, sign out, and confirm the session ends.
- [ ] **AI response generation:** Submit a representative OpenVoz prompt and confirm a complete AI response is returned without a user-visible or logged provider error.
- [ ] **Voice and TTS:** Complete the normal voice workflow, confirm permitted speech input is accepted, and confirm generated audio plays successfully.
- [ ] **Static files:** Confirm CSS, JavaScript, images, and fonts load without HTTP errors or broken presentation.
- [ ] **Admin:** Open Django Admin with an authorized administrator account and confirm a database-backed list page loads. Do not modify production data solely for validation.
- [ ] **Staff Dashboard:** Open the Staff Dashboard with an authorized staff account and confirm its primary database-backed views load.
- [ ] **Database connectivity:** Confirm authentication, Admin, and Staff Dashboard data loads succeed; then run the read-only Django database check below.
- [ ] **Logs:** Confirm the validation generated no new unexplained Gunicorn, Nginx, Django, PostgreSQL, OpenAI, gTTS, or reCAPTCHA errors.

Read-only database verification:

```bash
python manage.py shell -c "from django.db import connection; connection.ensure_connection(); print(connection.vendor)"
```

Expected output is `postgresql`.

Final service and log verification:

```bash
sudo systemctl is-active postgresql
sudo systemctl is-active voicechat.service
sudo systemctl is-active nginx
sudo systemctl --failed
sudo journalctl -u voicechat.service --since "30 minutes ago" --no-pager
sudo journalctl -u nginx --since "30 minutes ago" --no-pager
sudo tail -n 100 /var/log/nginx/error.log
```

The deployment is successful only when all required checks pass. Record each result, the deployed full SHA, completion time, and approver acceptance. If a critical check fails because of the release, begin rollback.

## Rollback Procedure

Rollback restores application code to the previously recorded known-good commit. It does not automatically reverse database, media, environment, dependency, or infrastructure changes.

### 1. Preserve Failure Evidence

Before changing the failed deployment, record:

```bash
cd /home/voicechat
source /home/voicechat/.venv/bin/activate
date --iso-8601=seconds
git rev-parse HEAD
git status --short
sudo systemctl status voicechat.service --no-pager
sudo systemctl status nginx --no-pager
sudo journalctl -u voicechat.service -n 200 --no-pager
sudo tail -n 200 /var/log/nginx/error.log
```

Record the failed functional checks and user impact. Do not include secrets or personal data.

### 2. Identify and Validate the Previous Commit

Take the full previous production SHA from the last successful deployment record and confirm it exists:

```bash
git log --oneline --decorate -n 20
git show --no-patch --format=fuller PREVIOUS_PRODUCTION_SHA
git merge-base --is-ancestor PREVIOUS_PRODUCTION_SHA origin/main
```

Replace `PREVIOUS_PRODUCTION_SHA` with the recorded full SHA. Confirm that it is the intended known-good release before proceeding.

### 3. Assess Database and Release Compatibility

```bash
git diff --name-status PREVIOUS_PRODUCTION_SHA HEAD -- requirements.txt
git diff --name-status PREVIOUS_PRODUCTION_SHA HEAD -- '*/migrations/*.py'
git diff --name-status PREVIOUS_PRODUCTION_SHA HEAD
```

Determine whether the old application revision can safely run against the current database schema and environment.

- A Git rollback does not reverse an applied migration.
- Do not run a reverse migration unless it has been explicitly reviewed and tested for this release.
- Restore PostgreSQL only when the approved recovery decision requires it and the verified backup corresponds to the required recovery point.
- A database restore can discard production data created after the backup. Obtain explicit authorization and follow the framework backup-and-recovery process before restoring.
- If the previous code is incompatible with the migrated schema and a safe database restore or tested reverse migration is not authorized, stop and escalate. Use a reviewed forward-compatible correction; do not improvise.

### 4. Restore the Previous Application Revision

Create a history-preserving rollback commit from the changes introduced after the previous production SHA:

```bash
git status --short
git revert --no-commit PREVIOUS_PRODUCTION_SHA..HEAD
git status --short
git diff --cached --stat
git commit -m "Rollback production to PREVIOUS_PRODUCTION_SHA"
```

Replace both instances of `PREVIOUS_PRODUCTION_SHA` with the recorded full SHA. Before `git commit`, review the staged rollback and confirm it removes only the failed release changes.

This procedure assumes the failed deployment is the linear range after the known-good production commit. If Git reports conflicts, if the range includes unrelated commits, or if a production working-tree change could interfere with the rollback, stop. Evaluate tracked runtime-generated assets separately. Resolve the rollback through the normal reviewed GitHub workflow rather than editing production files.

Push and document the rollback commit through the approved GitHub workflow so production and GitHub remain synchronized:

```bash
git push origin main
git rev-parse HEAD
git status --short
```

### 5. Restore Release-Level Runtime State

If `requirements.txt` changed, install the dependency set declared by the rollback commit:

```bash
python -m pip install -r requirements.txt
```

If static assets changed:

```bash
python manage.py collectstatic --noinput
```

Do not run `migrate` merely because code was rolled back. Execute only the separately approved database recovery decision from Step 3.

### 6. Restart and Validate the Rollback

```bash
python manage.py check --deploy
sudo systemctl restart voicechat.service
sudo systemctl is-active voicechat.service
sudo nginx -t
sudo systemctl is-active nginx
sudo systemctl is-active postgresql
sudo systemctl --failed
```

Repeat the complete Post-Deployment Validation checklist. Record the rollback commit SHA, database decision, service status, functional results, completion time, and approving authority. Open or update an incident record in `INCIDENT_LOG.md` after production has been stabilized.

## Troubleshooting

Troubleshooting is diagnostic. Do not make unreviewed code, configuration, permission, schema, or data changes in production.

### Gunicorn Does Not Start

```bash
sudo systemctl status voicechat.service --no-pager
sudo journalctl -u voicechat.service -n 200 --no-pager
source /home/voicechat/.venv/bin/activate
cd /home/voicechat
python manage.py check --deploy
python -c "import sys; print(sys.executable)"
```

Verify the traceback, production settings, virtual-environment interpreter, imports, required environment configuration, migrations, and reCAPTCHA startup behavior. If the failure began with the release and cannot be corrected through the approved artifact, roll back.

### Nginx Configuration or Gateway Failure

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
sudo journalctl -u nginx -n 200 --no-pager
sudo tail -n 200 /var/log/nginx/error.log
sudo systemctl status voicechat.service --no-pager
```

Do not reload Nginx until `nginx -t` succeeds. A `502` with healthy Nginx commonly requires checking Gunicorn status and the configured upstream, not changing the application blindly.

### Migration Failure

```bash
python manage.py showmigrations
python manage.py migrate --plan
sudo systemctl status postgresql --no-pager
sudo journalctl -u postgresql -n 200 --no-pager
```

Record the failing migration and last applied migration. Do not edit migration history, use `--fake`, reverse migrations, or modify data without a reviewed recovery decision. Assess code/schema compatibility and the verified backup before restarting services or rolling back.

### Static Files Are Missing

```bash
python manage.py collectstatic --noinput
sudo nginx -t
sudo tail -n 200 /var/log/nginx/error.log
```

Confirm the asset exists in the approved commit and that collection completed under the production virtual environment. Diagnose the configured static root, Nginx mapping, ownership, permissions, and browser cache without deleting the static root or applying broad permissions.

### Database Connection Failure

```bash
sudo systemctl status postgresql --no-pager
sudo journalctl -u postgresql -n 200 --no-pager
python manage.py check --database default
python manage.py shell -c "from django.db import connection; connection.ensure_connection(); print(connection.vendor)"
```

Verify that PostgreSQL is active and Django can connect using its configured production environment. Do not print database credentials or edit them into source control. Escalate authentication, authorization, storage, corruption, or recovery failures.

### AI or Voice/TTS Failure

```bash
sudo journalctl -u voicechat.service -n 200 --no-pager
```

Confirm the core site and database-backed functions remain healthy, then review application logs for external-provider authentication, quota, timeout, network, gTTS, or reCAPTCHA errors. Validate through the normal application workflow; never print secret values as a diagnostic step.

## Operational Notes

- Deploy only approved, committed, reproducible revisions.
- Evaluate all working-tree modifications before deployment, including tracked runtime-generated assets such as generated audio files, and block only changes that could interfere with the deployment.
- Always verify the production backup and record its recovery identifier before a data-affecting release.
- Treat the full Git commit SHA as the release identity; branch names and abbreviated SHAs are insufficient audit evidence.
- Avoid all manual edits on production. Make corrections through the reviewed repository and repeat this procedure.
- Install dependencies only from the committed manifest and only when required by the release.
- Apply only reviewed migrations; code rollback and database recovery are separate decisions.
- Restart `voicechat.service` after application or runtime changes. Do not restart or reload Nginx for an application-only release.
- Monitor logs during deployment and after functional validation.
- Confirm PostgreSQL, `voicechat.service`, Nginx, HTTPS, critical workflows, and systemd status before ending maintenance.
- Preserve deployment and rollback evidence according to the project's operational record-retention practice.
- Review this procedure after a failed deployment, rollback, incident, infrastructure change, service-name change, Python or PostgreSQL upgrade, or deployment workflow change.

## Evidence and Audit Record

Retain the following for each deployment:

- deployment date, start time, completion time, operator, approver, and maintenance window;
- approved Release Candidate full SHA;
- previous and final production full SHAs;
- pre- and post-deployment `git status --short`, branch, and remote verification;
- backup identifier and verification result;
- incoming commit review;
- dependency installation output when applicable;
- Django check, migration plan, migration result, and static collection result;
- PostgreSQL, `voicechat.service`, Nginx, Nginx configuration, and failed-unit results;
- results for homepage, authentication, AI, voice/TTS, static files, Admin, Staff Dashboard, and database connectivity;
- relevant sanitized log evidence;
- deployment decision: successful, failed, or rolled back; and
- rollback SHA and database recovery decision when applicable.

## Completion Criteria

The maintenance window may end only when:

- the final production SHA is recorded and matches the approved deployment or approved rollback result;
- the working tree contains no unevaluated change or change that could interfere with the deployment;
- PostgreSQL, `voicechat.service`, and Nginx are active;
- Nginx configuration validation succeeds;
- all required post-deployment checks pass;
- recent logs contain no new unexplained critical errors;
- the deployment record is complete; and
- the deployment approver has accepted the result.

## References

- `DEPLOYMENT_WORKFLOW.md`
- `DEPLOYMENT_GUIDE.md`
- `OPERATIONS_RUNBOOK.md`
- `INCIDENT_LOG.md`
- `../../Core/DOCUMENTATION_STANDARD.md`
- `../../Core/11_DEPLOYMENT.md`
- `../../Core/14_INCIDENT_RESPONSE.md`
- `../../Core/16_BACKUP_AND_RECOVERY.md`
