---
id: disaster-recovery-planning
title: Disaster Recovery Planning
sidebar_position: 7
description: The plan that has to work on the worst day — and why it only exists if it is exercised.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader builds a recovery plan with scope beyond the data, defined
  authority and regular exercise.
prerequisites: [rto]
related: [rto, rpo, failover]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Disaster Recovery Planning

## Overview

What disaster recovery is, and the technical strategies behind it, are in
[disaster recovery](/09-cloud-architecture/disaster-recovery.md). Recovery planning is the part you cannot buy
from the provider: the **plan** that triggers those strategies — what it needs to cover beyond the data, who
decides, and why it only exists if it is exercised.

The sentence that summarizes it: a plan never executed is documentation, not capability.

## Problem

Almost every organization has a disaster recovery document. It usually exists because of an audit
requirement, and the audit verifies that it exists — not that it works.

The predictable result: on the day it is triggered, you discover that the procedure is out of date, that
the person who wrote it left, that permissions are missing, and that nobody knows who has the authority to
trigger it.

## Core Concepts

### The plan covers far more than data

The part about restoring the database is the most discussed and frequently the simplest. What usually is
missing:

```text
configuration and secrets  where they are, how to recover them
DNS                        who changes it, with what propagation time
certificates               valid in the recovery environment
permissions and quotas     sufficient in the secondary region
external dependencies      what happens if the source address changes
communication              who notifies customers, regulators, the press
recovery order             what comes back first
completion criterion       how you know it is over
```

The secrets item deserves emphasis: if they are only in the environment that went down, the recovery does
not happen. See [secrets](/10-security/secrets.md).

### Authority needs to be defined beforehand

The first hour of a disaster is usually spent deciding whether it is a disaster.

With no defined authority, the decision to trigger — which is irreversible and expensive — gets paralyzed
among people who do not want to make it alone.

The plan needs to name:

**Who declares.** Two or three people, with backups.

**Based on what.** Objective criteria: unavailability above N minutes with no identified cause, a confirmed
loss of a region.

**Who communicates** internally and externally.

**Who decides to end it** and return to normal operation.

Names, not generic roles.

### Prioritize what comes back first

Not everything needs to come back at once. See [RTO](/12-reliability/rto.md) per function.

```text
essential   accept orders, authorize transactions
important   queries, history
deferrable  reports, low-criticality integrations
```

Restoring the essential first reduces the impact, and that prioritization needs to be decided beforehand —
during the incident, it becomes a negotiation under pressure.

See [graceful degradation](/12-reliability/graceful-degradation.md): operating reduced is a legitimate
state, and frequently the correct one.

### The scenarios are not interchangeable

A generic plan does not work because the responses diverge:

```text
loss of a region        regional failover
data corruption         restore to an earlier point
accidental deletion     selective restore, or a delayed replica
an encryption attack    isolated backups, a rebuilt environment
a compromise            rebuild from scratch, rotate everything
```

The last two diverge the most: rebuilding in a possibly compromised environment requires different premises
— you do not restore to the same infrastructure, and the credentials are not reused.

See [supply chain trust](/10-security/supply-chain-trust.md).

### The exercise is the plan

A plan exists to the extent that it has been executed.

```text
a tabletop exercise   discussing the scenario — cheap, finds procedure gaps
a partial exercise    restoring one component in a separate environment
a full exercise       end-to-end recovery, timed
```

The progression matters: the tabletop costs one meeting and usually finds more than expected. The full one
is the only one that verifies the [RTO](/12-reliability/rto.md).

And the frequency matters more than the depth: a quarterly partial exercise is worth more than a full one
every three years.

### The plan needs to be accessible when everything is down

An operational detail that has already made recoveries unviable: the plan stored in the system that went
down.

The same holds for the contact list, the emergency credentials and the architecture documentation.

An offline copy, up to date, with defined access. It is trivial and frequently absent.

## Mental Model

**The plan is the exercise.** The document is its record.

## When to Use

- There is a regulatory continuity requirement.
- Prolonged downtime has a relevant cost.
- The system is critical to the business's operation.
- There is data whose loss would be unrecoverable.

## When Not to Use

**A system with no state of its own.** If all of the system's data is derived — a search index, a cache, a
projection rebuildable from the source — recovery means redeploying and reprocessing. Its plan is one line in
the plan of the system that holds the source, not a separate plan with authority and exercises.

**Tolerable downtime measured in days.** When the operation can run for days on a manual process and the
system can be rebuilt from an external source — partners, tax records, the customers themselves — a tested
restore procedure is enough. Named authority and a plan per scenario cost more than they shorten.

**An exercise cycle more expensive than the outage.** If the yearly hours of tabletop, partial and full
exercises, added up, cost more than the expected loss from downtime — cost per hour times duration times
frequency — the full apparatus does not pay for itself, and a tested restore with one tabletop exercise a year
is the useful ceiling.

**A team too small to maintain a procedure per scenario.** With two or three people, five distinct procedures
age faster than anyone reviews them. A quarterly tabletop exercise, covering one scenario at a time, delivers
more than documents nobody updates.

## Alternatives

- **High availability** — it avoids reaching the scenario. See [redundancy](/12-reliability/redundancy.md).
  It does not substitute: it covers neither human error nor corruption.
- **Automated [failover](/12-reliability/failover.md)** — for the anticipated scenarios.
- **A delayed replica** — cheap protection against human error.
- **Tabletop exercises** — the minimum viable when the full exercise is not possible.

## Trade-offs

| A detailed plan | A lean one |
|---|---|
| Little decision under pressure: the procedure decides | A lot: each step is judged during the incident |
| Ages faster | Ages less, but depends on who is on call |
| Requires frequent review | Does not survive the departure of whoever wrote it |

| A full exercise | A partial one |
|---|---|
| Verifies the RTO | Verifies components |
| Expensive and risky | Cheap |
| Annual | Quarterly |

## Failure Modes

**An out-of-date procedure.**

**The author unavailable.** The knowledge left with the person.

**Secrets inaccessible.**

**Insufficient quota on the secondary.**

**The plan inaccessible.** Stored in what went down.

**Undefined authority.** The first hour is lost deciding.

**The wrong scenario.** The plan covers the loss of a region; the incident is corruption.

## Common Mistakes

**Not exercising it.** The procedure keeps citing the replaced tool, and the restore is figured out during the
incident, with the RTO clock running.

**Using a generic plan** for scenarios requiring different responses. The region-loss procedure restores to
the same infrastructure — which, in a compromise, is exactly what you cannot do.

**Covering only data restoration.** The database comes back and the system does not start: the secrets stayed
in the environment that went down, and the recovery stalls waiting for them.

**Not naming who triggers it.** The first hour is lost sending the decision up the hierarchy, and it comes out
of the RTO regardless.

**Not prioritizing what comes back first.** The essential comes back along with everything else — in the
example below, 5 hours instead of 40 minutes.

**Keeping the plan only in the environment that can go down.** On the day of the incident, the procedure, the
contact list and the emergency credentials are down together with the system.

**Writing for the audit**, and not for the day of the incident. The document passes the annual check and is
never confronted with real operations.

## Real-World Example

A logistics company had a 40-page recovery plan, reviewed annually for the audit and never executed.

A migration error deleted the routes table — 4 million records — at 10 a.m. on a Tuesday.

What happened:

**The first hour lost in a decision.** Nobody knew who had the authority to restore from a backup, because
that would mean discarding the morning's operations. The decision went up three hierarchical levels.

**An out-of-date procedure.** The document referenced a tool replaced two years earlier. The restore had to
be figured out during the incident.

**Secrets inaccessible.** The recovery database's credentials were in a manager that depended on the
affected environment. An emergency procedure nobody had tested was required.

**An unnecessary full restore.** There was no selective restore procedure. The whole database was restored
to a point 6 hours earlier, also discarding data that had no problem.

**No prioritization.** Everything was restored together. The essential functions could have come back in 40
minutes; they took 5 hours.

Total duration: 7 hours and 20 minutes, against a declared RTO of 2 hours.

The reformulation:

**A plan per scenario**, with distinct procedures for the loss of a region, corruption, accidental deletion
and a compromise.

**Named authority** — three people, with objective triggering criteria.

**Function prioritization**, with the three essential ones identified and a selective restore procedure.

**Emergency credentials** in a physical safe and in a separate account.

**A 6-hour delayed replica**, with stopping replication among the actions the named authority can take
without consultation. It only protects if the deletion is detected and replication stopped within the delay
window; with the hour lost deciding, a 1-hour window would already have applied the deletion.

**An offline copy of the plan**, updated at each review.

**Quarterly exercises** — one tabletop, one partial, alternating. The full exercise became annual.

In the following two years, the exercises found nine problems, all fixed in a controlled window. A real
partial corruption incident was resolved in 35 minutes.

In retrospect: the 40-page plan met the audit requirement perfectly. It had never been written to be used —
only to exist.

## Related Concepts

- [RTO](/12-reliability/rto.md) and [RPO](/12-reliability/rpo.md) — the targets.
- [Failover](/12-reliability/failover.md) — the mechanism.
- [Disaster Recovery](/09-cloud-architecture/disaster-recovery.md) — the strategies.
- [Chaos Engineering](/12-reliability/chaos-engineering.md) — the verification.

## Practical Exercise

Get the team together and run a tabletop exercise: it is 10 a.m. on a Tuesday, the most important table has
been deleted. Who decides what, and in what order?

The questions with no answer in the room are your plan's gaps.

## Interview Questions

- What does a plan need to cover beyond data restoration?
- Why does the triggering authority need to be named beforehand?
- Why does a generic plan not work?

## Further Reading

- ISO. *ISO 22301:2019 — Security and resilience — Business continuity management systems — Requirements*. 2019.
- Swanson, Marianne et al. *NIST SP 800-34 Rev. 1 — Contingency Planning Guide for Federal Information Systems*. NIST, 2010.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 17, "Testing for Reliability".
