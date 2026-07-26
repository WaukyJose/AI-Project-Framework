# OpenVoz Operations Runbook

# Purpose

This document defines the operational procedures required to maintain OpenVoz after a successful production deployment.

It provides repeatable procedures for service checks, routine maintenance, monitoring, health validation, and incident escalation.

---

# Scope

This runbook covers:

- Daily production health checks.
- Server resource and service monitoring.
- Application and infrastructure log review.
- Application updates from GitHub.
- Django dependency, migration, and static file maintenance.
- Gunicorn and Nginx service administration.
- HTTPS certificate verification.
- OpenAI API availability checks through the application.
- Post-maintenance validation and incident escalation.

Deployment preparation and initial infrastructure provisioning are documented in `DEPLOYMENT_GUIDE.md`.

---

# Production Environment

OpenVoz runs on an Ubuntu Server hosted on a DigitalOcean Droplet. Nginx terminates HTTPS and forwards application requests to Gunicorn, which executes the Django application. The Django backend communicates with the OpenAI API and generates audio through gTTS.

Production infrastructure includes:

- DigitalOcean Droplet
- Ubuntu Server
- Nginx
- Gunicorn
- Django
- Let's Encrypt certificate management through Certbot
- Git and GitHub
- Static and media file storage

> **TODO:** Verify the production domain, application directory, deployment branch, Python virtual environment path, Gunicorn systemd service name, database engine, and application log configuration on the production server.

---

# Daily Operations

## Purpose

Daily operations confirm that the application and its supporting services remain available.

## Responsibilities

The operator is responsible for:

- Confirming Nginx and Gunicorn are running.
- Reviewing server resource utilization.
- Reviewing recent error logs.
- Confirming the production HTTPS endpoint is available.
- Verifying an application workflow that uses the OpenAI API.
- Recording and escalating unresolved issues.

## Procedures

### Checking Application Status

1. Connect to the production server through SSH.
2. Check Nginx status.
3. Check the Gunicorn service using its verified systemd unit name.
4. Confirm that no service is in a failed state.

```bash
sudo systemctl status nginx --no-pager
sudo systemctl status "${GUNICORN_SERVICE}" --no-pager
sudo systemctl --failed
```

> **TODO:** Set `GUNICORN_SERVICE` to the verified production Gunicorn systemd service name.

### Monitoring System Resources

Review uptime, load, memory, disk utilization, and active processes.

```bash
uptime
free -h
df -h
top
```

Investigate sustained high load, low available memory, or filesystems approaching capacity.

### Reviewing Logs

Review recent Nginx and Gunicorn messages, prioritizing errors and repeated failures.

```bash
sudo journalctl -u nginx --since today --no-pager
sudo journalctl -u "${GUNICORN_SERVICE}" --since today --no-pager
sudo tail -n 100 /var/log/nginx/error.log
```

> **TODO:** Verify the Gunicorn service name and all production application log locations.

### Checking HTTPS Availability

Request the production endpoint and verify that it returns a successful HTTP response over HTTPS.

```bash
curl --fail --silent --show-error --location --output /dev/null --write-out '%{http_code}\n' "https://${PRODUCTION_DOMAIN}/"
```

> **TODO:** Set `PRODUCTION_DOMAIN` to the verified production domain.

### Verifying AI Service Availability

1. Open the production application over HTTPS.
2. Complete a normal user workflow that generates an AI response.
3. Confirm that the response is returned without an application error.
4. Review the Gunicorn and application logs for OpenAI API errors.
5. Do not expose API credentials in commands, logs, or incident records.

> **TODO:** Document the exact OpenVoz AI health-check workflow or endpoint after it is verified in production.

---

# Routine Maintenance

## Purpose

Routine maintenance keeps the deployed application synchronized with approved source code and applies required application changes safely.

## Responsibilities

The operator is responsible for:

- Confirming the intended release and production branch before updating.
- Running commands from the verified application directory.
- Using the production Python virtual environment.
- Reviewing each command for errors before continuing.
- Restarting only the required services.
- Completing all post-maintenance health checks.

## Procedures

### Updating the Application from GitHub

1. Connect to the production server through SSH.
2. Change to the application directory.
3. Confirm the current branch and working tree state.
4. Fetch changes from GitHub.
5. Review the incoming commits.
6. Pull the approved production branch using fast-forward-only mode.

```bash
cd "${APPLICATION_DIRECTORY}"
git status
git branch --show-current
git fetch origin
git log --oneline "HEAD..origin/${PRODUCTION_BRANCH}"
git pull --ff-only origin "${PRODUCTION_BRANCH}"
```

> **TODO:** Set `APPLICATION_DIRECTORY` and `PRODUCTION_BRANCH` to verified production values.

### Installing Dependencies

Activate the production virtual environment and install the dependencies declared by the application.

```bash
cd "${APPLICATION_DIRECTORY}"
source "${VIRTUAL_ENVIRONMENT_PATH}/bin/activate"
python -m pip install -r requirements.txt
```

> **TODO:** Verify the production virtual environment path and dependency manifest filename before using this procedure.

### Running Database Migrations

Review pending migrations and then apply them.

```bash
cd "${APPLICATION_DIRECTORY}"
source "${VIRTUAL_ENVIRONMENT_PATH}/bin/activate"
python manage.py showmigrations
python manage.py migrate
```

> **TODO:** Verify the production database engine and backup procedure before applying migrations that change production data or schema.

### Collecting Static Files

Collect static assets using the production Django configuration.

```bash
cd "${APPLICATION_DIRECTORY}"
source "${VIRTUAL_ENVIRONMENT_PATH}/bin/activate"
python manage.py collectstatic --noinput
```

### Restarting Gunicorn

Restart Gunicorn and confirm that the service returns to an active state.

```bash
sudo systemctl restart "${GUNICORN_SERVICE}"
sudo systemctl status "${GUNICORN_SERVICE}" --no-pager
```

> **TODO:** Set `GUNICORN_SERVICE` to the verified production Gunicorn systemd service name.

### Restarting Nginx

Validate the Nginx configuration before restarting the service.

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager
```

### Verifying Services After Maintenance

1. Confirm Nginx and Gunicorn are active.
2. Confirm no systemd service has failed.
3. Complete the checks in the Health Checks section.
4. Review logs generated during the maintenance window.
5. Record the deployed revision and any operational issues.

```bash
sudo systemctl is-active nginx
sudo systemctl is-active "${GUNICORN_SERVICE}"
sudo systemctl --failed
git rev-parse --short HEAD
```

---

# Monitoring

## Purpose

Monitoring detects production failures and resource constraints before they significantly affect users.

## Responsibilities

Operational monitoring covers:

- Nginx and Gunicorn service state.
- HTTPS endpoint availability.
- CPU load and memory utilization.
- Disk utilization.
- Nginx, Gunicorn, Django, and system errors.
- SSL certificate validity.
- OpenAI API failures observed by the Django backend.
- User-facing application behavior.

## Procedures

### Daily

- Complete the Daily Operations procedures.
- Review failed systemd units.
- Review recent Nginx and Gunicorn errors.
- Verify one AI-enabled workflow.

### Weekly

- Review disk utilization and growth.
- Review repeated application and external-service errors.
- Check certificate status and expiration dates.
- Confirm static and media storage remain accessible.

### Monthly

- Review operating system and Python package update requirements.
- Review certificate renewal behavior.
- Review recurring incidents and update procedures with validated lessons.

```bash
sudo systemctl --failed
df -h
sudo certbot certificates
```

> **TODO:** Define production alerting thresholds, monitoring tools, notification recipients, and response ownership after they are implemented.

---

# Log Locations

## System Logs

Use the systemd journal for service and operating system events.

```bash
sudo journalctl --since today
sudo journalctl -p err --since today
```

## Nginx Logs

Standard Nginx log locations are shown below.

```bash
sudo tail -n 100 /var/log/nginx/access.log
sudo tail -n 100 /var/log/nginx/error.log
```

> **TODO:** Verify that the production Nginx configuration uses these paths.

## Gunicorn Logs

Review the systemd journal for the production Gunicorn service.

```bash
sudo journalctl -u "${GUNICORN_SERVICE}" --since today --no-pager
```

> **TODO:** Verify whether Gunicorn also writes to dedicated log files.

## Django Application Logs

> **TODO:** Verify and document the Django application log destination and retention configuration.

## Certbot Logs

The standard Certbot log location is shown below.

```bash
sudo tail -n 100 /var/log/letsencrypt/letsencrypt.log
```

> **TODO:** Verify this path and the certificate renewal mechanism on the production server.

---

# Operational Commands

Run application commands from the verified production application directory and activate the production virtual environment where required.

## Git

```bash
git status
git branch --show-current
git fetch origin
git log --oneline -n 10
git rev-parse --short HEAD
```

## Django

```bash
python manage.py check
python manage.py showmigrations
python manage.py migrate
python manage.py collectstatic --noinput
```

## Gunicorn

```bash
sudo systemctl status "${GUNICORN_SERVICE}" --no-pager
sudo systemctl restart "${GUNICORN_SERVICE}"
sudo journalctl -u "${GUNICORN_SERVICE}" -n 100 --no-pager
```

> **TODO:** Set `GUNICORN_SERVICE` to the verified production service name.

## Nginx

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
sudo systemctl reload nginx
sudo systemctl restart nginx
sudo journalctl -u nginx -n 100 --no-pager
```

## Certbot

```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

## Linux System Administration

```bash
uptime
free -h
df -h
top
ps aux
ss -tulpn
sudo systemctl --failed
sudo journalctl -p err -n 100 --no-pager
```

---

# Health Checks

## Purpose

Health checks confirm that OpenVoz and its production dependencies are operating correctly after maintenance.

## Procedures

1. Confirm Nginx is active.
2. Confirm the Gunicorn service is active.
3. Confirm no systemd service is in a failed state.
4. Validate the Nginx configuration.
5. Request the production URL over HTTPS and confirm a successful response.
6. Load the application in a browser and verify expected page rendering.
7. Complete an AI-enabled workflow and confirm an OpenAI response is returned.
8. Confirm generated audio is available where the tested workflow requires it.
9. Confirm static and media files load without errors.
10. Review Nginx, Gunicorn, and Django logs for new errors.
11. Confirm database-backed application behavior operates normally.

```bash
sudo systemctl is-active nginx
sudo systemctl is-active "${GUNICORN_SERVICE}"
sudo systemctl --failed
sudo nginx -t
curl --fail --silent --show-error --location --output /dev/null --write-out '%{http_code}\n' "https://${PRODUCTION_DOMAIN}/"
```

> **TODO:** Document the verified production domain and any dedicated health-check endpoint.

---

# Incident Escalation

## Purpose

Incident escalation ensures that unresolved operational failures are contained, communicated, and documented.

## Procedures

When an issue cannot be resolved through normal procedures:

1. Stop making changes that could increase the impact.
2. Record the detection time, symptoms, affected functionality, and commands already executed.
3. Capture relevant logs without exposing credentials or personal data.
4. Determine whether Nginx, Gunicorn, Django, the database, or an external service is affected.
5. Preserve the current deployed revision and service status.
6. Notify the designated OpenVoz operational owner.
7. Follow the AI Project Framework incident response process.
8. Record the incident and resolution in `INCIDENT_LOG.md`.
9. Complete post-recovery health checks.
10. Update this runbook only with procedures validated during the incident.

```bash
date --iso-8601=seconds
git rev-parse --short HEAD
sudo systemctl status nginx --no-pager
sudo systemctl status "${GUNICORN_SERVICE}" --no-pager
sudo journalctl -u nginx -n 100 --no-pager
sudo journalctl -u "${GUNICORN_SERVICE}" -n 100 --no-pager
```

> **TODO:** Document the OpenVoz operational owner, escalation contacts, communication channel, severity levels, and expected response times.

---

# References

- `Projects/OpenVoz/DEPLOYMENT_GUIDE.md`
- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/INCIDENT_LOG.md`
- `Core/11_DEPLOYMENT.md`
- `Core/12_OPERATIONS.md`
- `Core/13_MONITORING.md`
- `Core/14_INCIDENT_RESPONSE.md`
