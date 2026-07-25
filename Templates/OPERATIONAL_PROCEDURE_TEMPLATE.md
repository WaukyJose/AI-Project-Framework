# Operational Procedure Template

## Purpose

Briefly describe why this procedure exists and when it should be performed.

---

## Prerequisites

List any required conditions before executing the procedure.

Example:

- Administrator access
- Active virtual environment
- Internet connectivity
- Backup completed (if applicable)

---

## Commands

Provide the exact commands to execute.

Example:

```bash
sudo systemctl restart gunicorn
sudo systemctl status gunicorn
```

---

## Expected Output

Describe the expected successful result.

Example:

```text
Active: active (running)
```

---

## Verification

Explain how to verify that the procedure completed successfully.

Examples:

- Open the application.
- Check the service status.
- Verify HTTPS.
- Confirm database connectivity.
- Test application functionality.

---

## Troubleshooting

Describe common problems and their solutions.

Example:

| Problem             | Possible Cause      | Solution          |
| ------------------- | ------------------- | ----------------- |
| Service won't start | Configuration error | Check logs        |
| SSL failure         | Certificate expired | Renew certificate |
| 502 Bad Gateway     | Gunicorn stopped    | Restart Gunicorn  |

---

## Related Documents

List related documentation.

Example:

- Deployment Guide
- Operations Runbook
- Incident Log
- Monitoring Guide

---

## Revision History

| Version | Date       | Description     |
| ------- | ---------- | --------------- |
| 1.0     | YYYY-MM-DD | Initial version |
