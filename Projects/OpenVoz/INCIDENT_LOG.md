# OpenVoz Incident Log

# Purpose

This document records validated production incidents affecting OpenVoz.

The Incident Log preserves the symptoms, impact, root cause, resolution, verification, and lessons from each incident so that recurring failures can be resolved faster and preventive improvements can be tracked.

---

# Scope

Document incidents that affect or threaten:

- Production application availability.
- User access through DNS or HTTPS.
- Nginx, Gunicorn, or Django operation.
- Database availability or data integrity.
- Static or media file delivery.
- OpenAI API or gTTS functionality used by OpenVoz.
- Production server resources, security, or connectivity.
- Deployment and maintenance procedures.

Routine maintenance without unexpected impact does not require an incident record.

---

# Incident Classification

## Critical

A complete production outage, confirmed data loss, active security compromise, or another event requiring immediate response.

## High

A major production function is unavailable or severely degraded for many users, with no acceptable workaround.

## Medium

A limited production function is unavailable or degraded, while the primary application remains usable or a workaround exists.

## Low

A minor operational issue with limited user impact that should be tracked and corrected through routine maintenance.

> **Note:** Classify incidents using confirmed impact. Update the severity if the observed impact changes during the response.

---

# Incident Template

Copy the following template into the Incident History section for each validated production incident.

## Incident ID

`OVZ-YYYY-NNN`

## Date and Time

- **Detected:** TODO
- **Resolved:** TODO
- **Timezone:** TODO

## Severity

TODO: Critical, High, Medium, or Low.

## Summary

TODO: Provide a concise description of the incident and its production impact.

## Symptoms

- TODO: Record observable application or infrastructure behavior.
- TODO: Record affected users, services, endpoints, or workflows.

## Root Cause

TODO: Document the validated technical or operational cause. Do not record an assumption as a confirmed root cause.

## Resolution

1. TODO: Record the actions that restored normal operation.
2. TODO: Include relevant commands or configuration changes without exposing credentials.

## Verification

- TODO: Record the health checks completed after resolution.
- TODO: Confirm HTTPS, application, AI service, static file, media file, and database behavior where relevant.

## Lessons Learned

- TODO: Record validated operational lessons from the incident.

## Preventive Actions

- [ ] TODO: Record the action, owner, and target completion date.

---

# Incident History

No validated production incidents are documented in the repository at this time.

> **TODO:** Add the first validated production incident using the Incident Template. A DNS/HTTPS incident must not be added until its date, impact, symptoms, root cause, resolution, and verification can be supported by deployment records or other production evidence.

---

# Best Practices

- Create the incident record as soon as production impact is confirmed.
- Use a unique sequential incident ID in the `OVZ-YYYY-NNN` format.
- Record dates and times with an explicit timezone.
- Describe observed symptoms separately from the root cause.
- Base severity on confirmed production impact.
- Preserve relevant commands, service status, and log evidence without including credentials or personal data.
- Record the deployed revision when application code may be involved.
- Document every action taken in chronological order.
- Confirm recovery using the health checks in `OPERATIONS_RUNBOOK.md`.
- Assign an owner and target date to every preventive action.
- Update the final root cause only after it has been validated.
- Add reusable operational improvements to the appropriate project document after they have been tested.

---

# References

- `Projects/OpenVoz/DEPLOYMENT_GUIDE.md`
- `Projects/OpenVoz/OPERATIONS_RUNBOOK.md`
- `Core/14_INCIDENT_RESPONSE.md`
