# Operational Procedure

**Procedure:** [Procedure name]

**Procedure ID:** [Unique identifier]

**System / Service:** [System or service]

**Environment:** [Development | Staging | Production | All]

**Owner:** [Name, team, or role]

**Approved By:** [Name or role]

**Status:** [Draft | Approved | Retired]

**Version:** [Version]

**Effective Date:** [YYYY-MM-DD]

**Last Reviewed:** [YYYY-MM-DD]

**Next Review:** [YYYY-MM-DD]

---

## Purpose

[State what this procedure accomplishes and why it is required.]

## Scope

### Included

- [Systems, environments, data, or activities covered]

### Excluded

- [Items outside this procedure]

## Procedure Type

Select the applicable type:

- [ ] Backup
- [ ] Deployment
- [ ] Incident response
- [ ] Recovery
- [ ] Maintenance
- [ ] Other: [Type]

## Trigger and Frequency

**Trigger:** [Scheduled interval, alert, request, release approval, incident condition, or other event]

**Frequency:** [Daily | Weekly | Monthly | Quarterly | Per release | As needed]

**Maintenance Window:** [Approved time window or not applicable]

**Maximum Expected Duration:** [Duration]

**Maximum Acceptable Service Impact:** [None, degraded service, planned downtime, or defined limit]

Do not run this procedure outside its approved trigger or schedule unless the required authorization has been obtained.

## Roles and Responsibilities

| Role | Responsibility | Contact / Escalation Path |
|------|----------------|---------------------------|
| Procedure owner | Maintains and reviews the procedure | [Contact or reference] |
| Operator | Executes the procedure and records results | [Contact or reference] |
| Approver | Authorizes execution when required | [Contact or reference] |
| Escalation owner | Responds to failures or unexpected impact | [Contact or reference] |

## Prerequisites

### Access and Authorization

- [ ] Required approval has been obtained.
- [ ] Operator identity and target environment have been confirmed.
- [ ] Required permissions are available.
- [ ] Relevant stakeholders have been notified.

### Tools and Inputs

| Requirement | Approved Value or Location | Verification |
|-------------|----------------------------|--------------|
| Tool or platform | [Name and version] | [Verification command or method] |
| Configuration | [Path or system] | [Verification method] |
| Source or artifact | [Version or identifier] | [Verification method] |
| Backup or recovery point | [Identifier or location] | [Verification method] |

### Initial System State

- [ ] Current system health has been recorded.
- [ ] No conflicting work is underway.
- [ ] Required capacity, disk space, and dependencies are available.
- [ ] Monitoring and logs are accessible.
- [ ] A rollback or recovery path is available.

Record the initial state:

```text
Date and time:
Operator:
Target environment:
Current version or state:
Health status:
Active alerts:
Backup or recovery-point identifier:
```

## Safety and Data Protection

### Warnings

- [Describe destructive, irreversible, security-sensitive, or service-affecting actions.]
- [Describe conditions that require the operator to stop.]

### Required Safeguards

- Use explicit, verified targets. Do not rely on ambiguous paths, unresolved variables, or broad wildcards for destructive actions.
- Never place credentials, tokens, private keys, or sensitive data in this procedure or its execution record.
- Protect backups, logs, and exported data according to the project's access and retention rules.
- Use approved test data for verification when possible.
- Confirm the rollback implications before changing data, schemas, infrastructure, or configuration.
- Require independent approval for actions identified by the project as high risk.

### Stop Conditions

Stop the procedure and escalate if:

- The target system or environment cannot be verified.
- A prerequisite or required approval is missing.
- The observed state differs materially from the expected initial state.
- A command would affect a broader scope than intended.
- A backup or rollback path required by this procedure is unavailable.
- An unexpected security, data-integrity, or availability risk appears.

## Communication Plan

| Event | Audience | Channel | Message Owner |
|-------|----------|---------|---------------|
| Procedure starting | [Audience] | [Channel] | [Owner] |
| Service impact detected | [Audience] | [Channel] | [Owner] |
| Procedure completed | [Audience] | [Channel] | [Owner] |
| Procedure failed or rolled back | [Audience] | [Channel] | [Owner] |

## Procedure

Replace the sample steps below with the exact approved actions. Each step should define the action, expected result, verification, and response to failure.

### Step 1: Confirm the Target

**Action**

[Identify and confirm the system, environment, resource, data set, or release.]

```bash
<target-verification-command>
```

**Expected Result**

[Describe the exact acceptable result.]

**Verification**

```bash
<verification-command>
```

**If Verification Fails**

[Stop, retry under defined conditions, roll back, or escalate.]

### Step 2: Prepare the System

**Action**

[Create a backup, enable maintenance mode, drain traffic, pause jobs, validate configuration, or perform another preparation.]

```bash
<preparation-command>
```

**Expected Result**

[Describe the acceptable prepared state.]

**Verification**

```bash
<verification-command>
```

**If Verification Fails**

[Describe the safe response.]

### Step 3: Perform the Operational Task

**Action**

[Describe the exact backup, deployment, response, recovery, or maintenance action.]

```bash
<execution-command>
```

**Expected Result**

[Describe successful command output and system state.]

**Verification**

```bash
<verification-command>
```

**If Verification Fails**

[Describe retry limits, rollback conditions, and escalation.]

### Step 4: Restore Normal Operation

**Action**

[Resume traffic or jobs, disable maintenance mode, restart services, or return the system to its normal state.]

```bash
<normal-operation-command>
```

**Expected Result**

[Describe the normal operational state.]

**Verification**

```bash
<health-check-command>
```

**If Verification Fails**

[Describe the rollback, recovery, or escalation response.]

Add, remove, or reorder steps as required. Do not retain placeholder steps in an approved procedure.

## Verification and Success Criteria

The procedure is successful only when all required criteria pass.

### Technical Verification

- [ ] Target version or state is correct.
- [ ] Services and dependencies are healthy.
- [ ] Required data is present, consistent, and accessible.
- [ ] Critical workflows pass.
- [ ] Scheduled jobs, queues, and workers operate normally.
- [ ] Logs contain no new critical or repeated errors.
- [ ] Monitoring remains within approved thresholds.
- [ ] Security and access controls remain effective.

### Procedure-Specific Verification

#### Backup

- [ ] Backup completed without errors.
- [ ] Backup identifier, size, checksum, and retention class were recorded.
- [ ] Backup is readable and stored in the approved location.
- [ ] Restore verification or the scheduled restore test passed.

#### Deployment

- [ ] Approved release identifier is running.
- [ ] Migrations and assets completed when applicable.
- [ ] Health checks and critical smoke tests passed.
- [ ] Error rate and latency remain within accepted limits.

#### Incident Response

- [ ] Impact is contained.
- [ ] Service is restored or an approved workaround is active.
- [ ] Evidence and timeline are preserved.
- [ ] Incident owner and follow-up actions are assigned.

#### Recovery

- [ ] Recovery point and restored scope are documented.
- [ ] Data integrity and application compatibility are verified.
- [ ] Recovery objectives were measured.
- [ ] Normal operations and monitoring are restored.

#### Maintenance

- [ ] Planned work completed.
- [ ] Temporary changes and access were removed.
- [ ] Capacity and performance remain acceptable.
- [ ] No maintenance task or resource remains unintentionally active.

Remove verification sections that do not apply to the final procedure.

## Rollback or Recovery

### Rollback Criteria

Initiate rollback or recovery if:

- [Defined health check fails]
- [Error or performance threshold is exceeded]
- [Data integrity cannot be verified]
- [Maximum procedure duration or downtime is exceeded]
- [Other procedure-specific condition]

### Rollback Steps

1. [Stop or contain the current operation.]
2. [Restore the previous version, configuration, data, or service state.]
3. [Restart or reconnect required services.]
4. [Run health and integrity checks.]
5. [Notify stakeholders and record the result.]

```bash
<rollback-command>
<rollback-verification-command>
```

### Recovery Point

**Previous Stable State:** [Version, backup, snapshot, or configuration identifier]

**Recovery Time Objective:** [Target or not applicable]

**Recovery Point Objective:** [Target or not applicable]

Do not perform an untested data restore or destructive reverse migration without the required authorization.

## Failure Handling and Escalation

| Condition | Immediate Action | Escalate To | Time Limit |
|-----------|------------------|-------------|------------|
| Expected result not observed | [Stop, retry, or roll back] | [Role or team] | [Duration] |
| Service degradation | [Contain impact] | [Role or team] | [Duration] |
| Data-integrity concern | [Stop writes or isolate system] | [Role or team] | [Duration] |
| Security concern | [Contain and preserve evidence] | [Role or team] | [Duration] |
| Rollback failure | [Invoke recovery or incident process] | [Role or team] | [Duration] |

Reference related escalation material:

- Incident response procedure: [Path or link]
- Disaster recovery procedure: [Path or link]
- Contact or on-call directory: [Path or link]

## Execution Record

Create one record for each execution.

| Field | Value |
|-------|-------|
| Procedure ID and version | [Value] |
| Start time | [YYYY-MM-DD HH:MM timezone] |
| End time | [YYYY-MM-DD HH:MM timezone] |
| Operator | [Name or role] |
| Approver | [Name or role, if required] |
| Target | [Environment, service, or resource] |
| Initial state | [Summary] |
| Final state | [Summary] |
| Backup or recovery point | [Identifier or not applicable] |
| Result | [Successful | Partial | Failed | Rolled Back] |
| Incident or change reference | [Identifier or not applicable] |

### Deviations

[Record skipped, changed, repeated, or out-of-order steps and the authorization for each deviation. State "None" when there were no deviations.]

### Issues Encountered

[Record errors, unexpected results, service impact, and their resolution. State "None" when no issues occurred.]

### Follow-Up Actions

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action] | [Owner] | [YYYY-MM-DD] | [Open | Complete] |

## Post-Procedure Review

Perform a review when the procedure:

- Fails or requires rollback.
- Causes unexpected service or data impact.
- Produces unclear, incorrect, or incomplete steps.
- Exceeds its planned duration.
- Reveals a new risk or missing safeguard.
- Is used during a significant incident or recovery.

Record lessons learned and update this procedure through the project's normal review and approval process. Preserve the execution record even when the procedure itself changes.

## Related Documents

- Architecture: [Path or link]
- Audit or risk assessment: [Path or link]
- Monitoring standard: [Path or link]
- Backup procedure: [Path or link]
- Deployment procedure: [Path or link]
- Incident response procedure: [Path or link]
- Recovery procedure: [Path or link]
- Maintenance schedule: [Path or link]

## Revision History

| Version | Date | Author | Approved By | Summary |
|---------|------|--------|-------------|---------|
| 0.1 | [YYYY-MM-DD] | [Author] | [Approver] | Initial draft |
