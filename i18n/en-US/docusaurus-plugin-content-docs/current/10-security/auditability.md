---
id: auditability
title: Auditability
sidebar_position: 13
description: Proving what happened — and why a log that can be deleted by whoever acted is useless.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader designs an audit trail that sustains an investigation and
  resists whoever has access to the system.
prerequisites: [security]
related: [security-failure-modes, data-protection, least-privilege]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Auditability

## Overview

Auditability is the ability to answer, after the fact: **who did what, when, and from where.**

It serves three distinct purposes, which are usually confused:

```text
investigation  reconstructing an incident
compliance     proving to a regulator that the controls work
detection      noticing the anomalous while it happens
```

The three require different things from the log, and a system that serves only the second — the common case
— does not serve the other two.

## Problem

Most systems have logs. Few can answer an investigation's questions.

The reasons repeat:

The log has what was easy to record, not what the question requires. There is no identification of who
acted — only the service. The retention is shorter than the time to discovery. And, most seriously, the log
is in the same place as the audited system, accessible to whoever compromised it.

## Core Concepts

### What to record

A useful audit event answers the five questions:

```text
who      verified identity — not the IP address, not the service
what     the action and the specific resource, with an identifier
when     the instant, with a time zone, from a trusted source
where    the request's origin, device, session
result   success or failure, and why
```

Two common absences make the log useless: **who**, when the system records only the service that executed;
and **failures**, when only success is recorded — and the denied attempt is precisely the attack signal.

### The log needs to be tamper-proof

This is the point that separates auditing from application logging.

If whoever has access to the system can delete or alter the record of what they did, the record sustains no
investigation and proves nothing.

The necessary properties:

**Writes allowed, deletion denied.** Not even administrators delete.

**Separate storage.** A distinct account or environment from the audited system. See
[cloud identity](/09-cloud-architecture/cloud-identity.md).

**Integrity verification.** Hash chaining, or signing, allowing alteration to be detected.

Without that, an attacker with administrative access deletes the trail — and that is the first thing they
do.

### Non-repudiation requires more than a log

Proving that **that person** did something, in a way they cannot deny, requires:

**Individual identity.** Shared accounts destroy non-repudiation — there is no way to attribute the action
to a person.

**Strong authentication.** If the credential is easily stolen, "it was their account" does not prove "it
was them".

**An intact log.**

The first is the most violated: shared administrative accounts are still common, and they make any
investigation inconclusive.

### Retention is defined by the time to discovery

Incidents take months to be discovered. A 30-day retention means the investigation starts with no data from
the beginning.

The retention needs to cover the typical time to detection, plus margin — which typically means a year or
more for security events, and whatever regulation requires for the rest.

And old logs can go to cold storage. See [data lifecycle](/07-data-architecture/data-lifecycle.md).

### The log cannot contain what it protects

The practical paradox: audit logs frequently contain sensitive data — request bodies, parameters, headers
with credentials.

The log becomes a target, with broader access than the original system. It is a recurring pattern: data
protected in the database, exposed in readable text in the logging system.

The rule: record **identifiers and actions**, not content. And filter credentials at the source. See
[secrets](/10-security/secrets.md).

### Detection requires alerts, not reports

A log consulted only when somebody is suspicious serves investigation and not detection.

The signals worth an automatic alert:

```text
anomalous volume per user       a mass export
access outside the pattern      time of day, location, resource type
a sequence of denials           permission scanning
a permission change             especially self-granted
access to a high-value record   executives, sensitive cases
a control disabled              including the log itself
```

The last deserves emphasis: alerting when somebody turns off the auditing is the control that protects all
the others.

## Mental Model

**Auditing is what remains when everything else fails.** If it can be deleted by whoever failed, nothing
remains.

## When to Use

- Access to sensitive or regulated data.
- Privileged and administrative operations.
- Permission and security configuration changes.
- A regulatory traceability requirement.
- Systems with a relevant insider threat.

## When Not to Use

**An audit log in the same account as the audited system.**

**With no individual identity.** Shared accounts.

**Recording sensitive content.**

**Retention that is too short.**

**Successes only.** Denials are the signal.

**With no alerts.** It becomes a dead archive.

**Auditing everything indiscriminately.** A volume nobody can analyze, at a high cost — audit what matters.

## Alternatives

- **The platform's audit log** — the cloud provider already records infrastructure actions; using that is
  cheaper and more reliable than reimplementing it.
- **Database change capture** — to track data changes without instrumenting the application.
- **[Event sourcing](/06-distributed-systems/distributed-event-sourcing.md)** — the history is the model,
  and the auditing comes with it.
- **Temporal versioning** — to know how a record looked at each moment.

## Trade-offs

| Detailed auditing | Minimal |
|---|---|
| Investigation possible | Limited |
| High volume and cost | Low |
| A risk of containing sensitive data | Lower |
| Analysis requires tooling | Manual |

| Separate storage | Together |
|---|---|
| Resists a compromise | Deletable |
| Additional cost and operations | None |
| Harder correlation | Easy |

## Failure Modes

**The log deleted by the attacker.**

**No identity.** Only the service appears.

**A shared account.** The action is not attributable.

**Retention exhausted.** The start of the incident does not exist.

**Sensitive data in the log.**

**No alert.** The event was recorded and nobody saw it.

**Auditing turned off.** By configuration, by cost, by mistake.

**A wrong clock.** Correlating events between systems becomes impossible. See
[clock and time](/06-distributed-systems/clock-and-time.md).

## Common Mistakes

**Keeping the audit log in the same place.**

**Not logging denials.**

**Having no individual identity on administrative accounts.**

**Logging the request body.**

**Not alerting on the auditing being disabled.**

**Confusing application logging with an audit trail.** The two have different purposes and requirements.

## Real-World Example

A financial institution suffered improper access to customer data by an employee on the operations team,
over four months.

The investigation found limitations that prevented conclusions:

**A shared account.** The operations team used a common administrative account, with a password known by
seven people. The logs showed the account, not the person. It was not possible to attribute the accesses to
anybody specifically.

**No read logging.** The system recorded changes, not queries. The improper accesses were reads, and left
no trace in the system — the suspicion arose from a customer who noticed their data was known by somebody.

**60-day retention.** When the investigation started, the first two months no longer existed.

**Logs in the same account.** There was no evidence of tampering, and also no way to state that there had
been none.

The result: the institution knew there had been improper access, did not know by whom or the extent, and
had to notify every potentially affected customer — around 80,000 — instead of those actually accessed.

The reformulation:

**Mandatory individual identity.** Shared accounts eliminated; administrative access by temporary
elevation, by name. See [least privilege](/10-security/least-privilege.md).

**Read logging** for sensitive customer data, with the identifier of the record accessed.

**A separate account** for auditing, with deletion denied to everyone and integrity verification by
chaining.

**Two-year retention** for security events, with archiving after 90 days.

**Alerts** for anomalous volume per user, access outside business hours and a sequence of queries about
customers unrelated to the operator's work.

Eleven months later, the anomalous volume alert detected a similar case in two days — with identification of
the person, of the 14 records accessed, and with no need for mass notification.

The detail the team highlights: they met the regulatory requirement to "maintain an audit trail". The trail
existed, and it answered none of the questions the investigation asked.

## Related Concepts

- [Security Failure Modes](/10-security/security-failure-modes.md).
- [Least Privilege](/10-security/least-privilege.md) — individual identity.
- [Data Protection](/10-security/data-protection.md).
- [Observability](/13-observability/index.md) — the close relative, with another purpose.

## Practical Exercise

Choose a hypothetical incident — somebody improperly accessed a sensitive record six months ago — and try
to answer: who, what, when, from where.

The questions you cannot answer are your auditing's gaps.

## Interview Questions

- Why does the log need to be outside the audited system?
- What does non-repudiation require beyond a log?
- Why does recording only successes make the trail useless for detection?

## Further Reading

- NIST SP 800-92 — guide to security log management.
- Schneier, Bruce; Kelsey, John. *Secure Audit Logs*, 1999.
- OWASP. *Logging Cheat Sheet*.
