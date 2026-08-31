---
id: least-privilege
title: Least Privilege
sidebar_position: 12
description: Granting only what is necessary — the principle that defines the size of the damage when something goes wrong.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader grants access based on real usage and reduces accumulated
  permissions based on data.
prerequisites: [security]
related: [secure-boundaries, authz-models, cloud-identity]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Least Privilege

## Overview

Least privilege is granting each identity — a person, a service, a process — only the access necessary for
its function, and nothing beyond.

It is the principle that **defines the size of the damage** when something goes wrong. The compromise is
going to happen; what it reaches is exactly what that identity could do.

It is universally accepted and rarely practiced, because the path of least resistance goes in the opposite
direction.

## Problem

The dynamic that produces excessive permission is always the same:

Somebody needs access for a task. Finding out the exact permission takes time. The broad permission
resolves it in seconds and generates no error.

Nobody goes back to restrict it, because restricting can break something and brings no visible benefit.

That repeats for years. The result is an environment where almost every identity can do almost everything,
and nobody knows what is actually used.

## Core Concepts

### The principle is operationalized with data

"Grant the minimum" is vague advice. What works is a procedure:

**Start by denying everything.** The permission is added when the real need appears, not when it is
imagined.

**Use the access logs.** Almost every modern system records which permissions were exercised. Comparing
what was granted with what is used turns the reduction into an evidence-based decision, not an act of
courage.

**Restrict by resource, not only by action.** Allowing reads on one specific storage bucket is very
different from allowing reads on all of them.

**Restrict by condition.** Network origin, time of day, the presence of strong authentication.

**Review periodically.** Permissions for temporary tasks stay.

The second item is what unlocks the practice: reducing permissions based on 90 days of real usage is safe
and verifiable, whereas reducing by intuition is risky and nobody does it.

### Privilege accumulation

The failure mode specific to people: somebody changes roles and receives the new accesses, without losing
the old ones.

After a few years and a few changes, that person has access to practically everything — without any
individual grant having been wrong.

The control is a periodic review by role, not by person: **what does this role need?**, and not **what does
this person have?**.

### Temporary elevation instead of permanent

The pattern that resolves the tension between security and operations:

```text
permanent   administrative access all the time
temporary   access granted for 2 hours, with a justification and a record
```

Temporary elevation allows administrative access to exist without being continuously exposed. If somebody's
credential leaks, it does not come with elevated powers.

It is the highest-impact change for human access, and it is operationally viable — the friction of
requesting elevation is small compared to that of having no access at all.

### A service identity deserves more rigor than a person's

A person exercises judgment. A service executes what it was programmed to, always, and its credentials are
somewhere accessible to the code.

Even so, service identities usually receive broader permissions, because "it is just a service".

They should be the most restricted: minimal scope, short-lived credentials, no permission to change
permissions. See [cloud identity](/09-cloud-architecture/cloud-identity.md).

### Privilege escalation is subtle

Certain permissions are, effectively, permission for everything:

```text
changing access policies       can grant itself anything
creating identities            can create one with more power
attaching roles to resources   can give power to something it controls
changing audit configuration   can delete the trail
deploying code to production   the code runs with the environment's privilege
```

The last is frequently forgotten: whoever controls the pipeline controls what runs in production. See
[supply chain trust](/10-security/supply-chain-trust.md).

Those permissions deserve separate treatment, and they almost never belong to an application.

### The cost is real and needs to be acknowledged

Least privilege costs: permission errors during development, time to find the exact scope, operational
friction.

Pretending it does not cost is what makes the practice get abandoned at the first urgency. What makes it
sustainable is reducing the friction — temporary elevation that is easy to request, tools that suggest the
scope based on usage, development environments more permissive than production.

## Mental Model

**Permission is the reach of the damage.** Every grant is a decision about what a future compromise will be
able to do.

## When to Use

Always. Special priority when:

- There is sensitive or regulated data.
- There are service identities with persistent credentials.
- The environment grew with no review.
- Several teams share the infrastructure.
- There is third-party access.

## When Not to Use

**A broad permission to unblock quickly.** It stays.

**Without measuring real usage** before reducing. Reducing by intuition breaks things and discredits the
practice.

**Extreme rigor in a development environment**, to the point that people work around it. The workaround is
worse than the permission.

**Permission to change policies** on an application identity.

**A review by person** instead of by role.

## Alternatives

Ways to reduce reach without rewriting the whole policy:

- **Temporary elevation** — the highest return for human access.
- **Separation by account or environment** — a more robust boundary than policy. See
  [secure boundaries](/10-security/secure-boundaries.md).
- **Short-lived credentials** — it reduces the exploitation window.
- **Automated permission analysis** — it compares granted with used.
- **Two-person approval** for destructive operations.

## Trade-offs

| Least privilege | Broad permission |
|---|---|
| Contained damage | Total reach |
| Laborious configuration | Fast |
| Errors during development | None |
| Periodic review necessary | None |
| Operational friction | Fluidity |

| Temporary elevation | Permanent access |
|---|---|
| A leaked credential has little power | Total power |
| A record of each elevation | None |
| Friction when you need it | None |

## Failure Modes

**Accumulated permission.** Broadened, never reduced.

**Accumulation from role changes.**

**Privilege escalation.** One permission gives access to all of them.

**A service identity with administrator power.**

**A long-lived credential with broad scope.** The most dangerous combination.

**A reduction breaking production.** Done with no usage data.

**Workarounds.** Excessive rigor makes people create parallel paths.

## Common Mistakes

**Broadening until the error goes away.**

**Not using usage logs to reduce.**

**Reviewing by person.**

**Treating service identities with less rigor.**

**Not separating the escalation permissions.**

**Not measuring the friction.** A practice people work around is not working.

## Real-World Example

A logistics company ran an access review after an incident at another company in the sector.

The initial survey:

**86% of the identities** had permissions never exercised in the last 90 days.

**14 people** with permanent administrative access to production — out of a team of 60.

**All 23 service identities** with read permission on every storage bucket, because the policy template had
been copied from the first one.

**4 people** who had changed roles kept their previous accesses; one of them had passed through three areas
and accumulated access to finance, operations and engineering.

**The deployment pipeline** could change access policies — which meant that anybody able to approve a
pipeline change could grant themselves any permission.

The reduction was done in three phases, with data:

**Phase 1 — cut by usage.** Permissions not exercised in 90 days were removed, with a two-week period in
warning mode: instead of denying, record what would be denied. That revealed 11 permissions that were used
rarely — quarterly — and would have broken. They were kept.

**Phase 2 — temporary elevation.** Permanent administrative access was removed from the 14 people and
replaced by 4-hour elevation with a justification. Over the following six months, the average was 3
elevations a week across the entire team — the permanent access was being kept for occasional use.

**Phase 3 — scope per service.** Each service identity received its own policy, derived from the access
logs. Two broke, both from undocumented dependencies the analysis did not catch.

Result after a year: the granted permissions fell by around 80%, and there were three "missing permission"
incidents — all resolved in under an hour through the elevation process.

What was recorded afterward: phase 1 in warning mode is what made everything viable. The original proposal
was to cut directly, and the operations team had vetoed it — rightly. Two weeks recording what would be
denied turned a risk discussion into a list of exceptions.

## Related Concepts

- [Secure Boundaries](/10-security/secure-boundaries.md).
- [Authorization Models](/10-security/authz-models.md) — how to express the permissions.
- [Cloud Identity](/09-cloud-architecture/cloud-identity.md).
- [Auditability](/10-security/auditability.md).

## Practical Exercise

Take your main application's identity and compare what it **can** do with what it **did** in the last 90
days.

Then do the same with your own account. The difference, in both cases, is the reach of a compromise that
has not happened yet.

## Interview Questions

- Why should reducing permissions start from usage data?
- What is privilege accumulation and how is it controlled?
- Which permissions constitute privilege escalation?

## Further Reading

- Saltzer, Jerome; Schroeder, Michael. *The Protection of Information in Computer Systems*, 1975 — the
  original formulation.
- NIST SP 800-53 — access controls.
- The major cloud providers' access analysis documentation.
