# Deployment Verification

## Purpose

This document provides a standardized procedure to deploy changes safely and verify that the production environment is synchronized with the latest approved source code.

---

# Preconditions

Before deploying, confirm the following:

- Development has been completed.
- Local testing has passed.
- Documentation has been updated.
- Changes have been committed.
- Changes have been pushed to the remote repository.

---

# Local Repository Verification

## Repository Status

```bash
git status
```

Expected:

```
On branch main
nothing to commit, working tree clean
```

---

## Current Commit

```bash
git log --oneline -1
```

Record the current commit hash.

Example:

```
4c4e496c docs: establish project handoff version 1.0
```

---

## Push Latest Changes

```bash
git push
```

Expected:

```
Everything up-to-date
```

or

```
Objects pushed successfully
```

---

# Production Server Deployment

Connect to the production server.

```bash
ssh user@server
```

Navigate to the project directory.

```bash
cd /path/to/project
```

---

## Verify Repository Status

```bash
git status
```

Expected:

```
On branch main
nothing to commit, working tree clean
```

---

## Pull Latest Changes

```bash
git pull
```

Expected:

Either

```
Already up to date.
```

or

```
Updating xxxxxxxx..yyyyyyyy
Fast-forward
```

---

## Verify Current Commit

```bash
git log --oneline -1
```

Confirm that the commit hash matches the local repository.

---

# Service Restart (if required)

Restart application services only when necessary.

Examples:

```bash
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

or

```bash
docker compose restart
```

depending on the project.

---

# Operational Verification

Verify that production services are healthy.

Examples:

```bash
systemctl status gunicorn
systemctl status nginx
```

or

```bash
docker ps
```

---

Verify that the application loads correctly.

- Home page
- Authentication
- Primary workflow
- Critical functionality

---

# Deployment Checklist

| Step | Status |
|-------|--------|
| Local repository clean | ☐ |
| Documentation updated | ☐ |
| Changes committed | ☐ |
| Changes pushed | ☐ |
| Production pull completed | ☐ |
| Commit hashes match | ☐ |
| Services restarted (if required) | ☐ |
| Production verified | ☐ |

---

# Deployment Record

Date:

Developer:

Project:

Branch:

Commit Hash:

Deployment Notes:

Issues Encountered:

Resolution:

Deployment Result:

- Successful
- Rolled Back
- Partial

---

# Lessons Learned

Document any observations that may improve future deployments.
