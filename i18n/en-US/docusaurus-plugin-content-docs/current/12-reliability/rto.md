---
id: rto
title: RTO
sidebar_position: 8
description: How long until it is back — a business decision with a price, not a technical estimate.
doc_type: foundation
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader defines the RTO with the business and recognizes what it
  requires of the architecture.
prerequisites: [reliability]
related: [rpo, disaster-recovery-planning, failover]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# RTO

## Overview

RTO — recovery time objective — is **how long the service can be unavailable** before it is operating
again.

It is a business decision, not an engineering estimate. The question that defines it is: how much does each
hour of downtime cost?

And it has an inseparable partner: [RPO](/12-reliability/rpo.md), which answers how much data can be lost.
Together the two define the recovery strategy and its cost.

## Why This Matters

With no defined RTO, three things happen.

**There is no investment criterion.** You do not know whether the current strategy is sufficient,
excessive or insufficient.

**There is no criterion during the incident.** The pressure is always "as fast as possible", which leads to
hasty decisions — restoring without verifying, promoting without fencing.

**The architecture is chosen with no target.** Multi-region, warm standby, pilot light and backups deliver
very different RTOs, at very different prices. With no target, the choice becomes a preference.

## Core Concepts

### The RTO defines the strategy

```text
RTO            typical strategy               relative cost
days           backups, manual restore        very low
hours          backups with automation        low
tens of min    a pilot light                  medium
minutes        a warm standby                 high
seconds        active-active                  very high
```

See [disaster recovery](/09-cloud-architecture/disaster-recovery.md) and
[multi-region](/09-cloud-architecture/multi-region.md).

The choice is mechanical once the number exists. It is the number that is hard.

### The clock starts earlier than you think

The RTO is measured from the **start of the unavailability**, not from the moment somebody starts acting.

```text
the failure occurs      → 0
the alert fires         → 4 min
a person responds       → 9 min
diagnosis               → 25 min
decision to trigger     → 32 min
execution               → 48 min
verification            → 55 min
```

In this example, the execution took 16 minutes and the real RTO was 55. The first three stages —
detection, response and diagnosis — usually dominate, and they are the least considered when the recovery
time is estimated.

Reducing the RTO frequently means investing in detection and in decision clarity, not in recovery
technology.

### An RTO per function, not per system

Not everything needs to come back at once. Defining a single RTO for the whole system leads to sizing
everything by the strictest requirement.

```text
accept orders         RTO 15 min
view history          RTO 4 h
management reports    RTO 24 h
```

That allows prioritizing during the recovery, and it substantially reduces the cost. See
[graceful degradation](/12-reliability/graceful-degradation.md).

And the prioritization needs to be decided beforehand: during the incident, nobody has the composure to
negotiate it.

### The RTO needs to be verified

An RTO declared and never measured is an intention.

The verification is the recovery exercise, timed. See
[chaos engineering](/12-reliability/chaos-engineering.md) and [failover](/12-reliability/failover.md).

Teams that exercise it discover that the real time is several times the estimate — on the first execution.
And that it falls substantially with practice.

### The RTO and the user's expectation are different things

It is worth separating two measures that are usually confused in communication with the business.

**RTO** is when the service is operating again. **Time to normalization** is when the operation returns to
its previous pace — which includes processing the backlog, reconciling divergences and reprocessing what
was left pending.

```text
service restored           → 30 min   ← the RTO
pending queue drained      → 2 h
reconciliation completed   → 6 h      ← when the business feels it normalized
```

Promising a 30-minute RTO while the business expects normalization in 30 minutes is a misalignment that
generates friction in every incident.

The practice that resolves it: declaring the two measures separately, and estimating the second from the
backlog processing capacity. See [queue-based scaling](/11-scalability/queue-based-scaling.md).

## Common Mistakes

**Estimated by engineering**, with no cost of downtime on the table.

**A single RTO** for the whole system.

**Measured from the start of the execution**, ignoring detection and decision.

**Never verified** by a timed exercise.

**Defined without considering dependencies.** The system's RTO cannot be lower than the critical vendor's.

**Confused with [RPO](/12-reliability/rpo.md).** They are different questions.

## Real-World Example

A health plan operator declared a 4-hour RTO for the procedure authorization system, a number inherited
from a compliance document written years earlier.

Nobody had verified it, and nobody knew where it came from.

Two discoveries changed everything:

**The real cost of downtime.** The conversation with operations revealed that, with no authorization,
partner hospitals suspend elective procedures. Four hours of downtime meant rescheduled procedures, and the
cost was far greater than anybody in engineering supposed.

**The real recovery time.** The first timed exercise took **11 hours** — almost three times the declared
RTO. The procedure was out of date, the quota in the secondary region was insufficient, and nobody on the
current team had executed it.

The RTO was renegotiated with the board, per function:

```text
authorize a procedure      30 min
view an authorization      2 h
history and reports        12 h
```

The change from 4 hours to 30 minutes on the critical function required moving from backups with automation
to a pilot light, at significant cost — approved with no discussion once the cost of downtime was
presented.

And, of the 30 minutes, the exercise showed that 18 were detection and decision. The larger investment
ended up going to monitoring and to a clear triggering criterion, not to infrastructure.

After six quarterly exercises, the measured time stabilized at 22 minutes.

What the team records: the 4-hour number had never been a decision. It was a value copied from a document
template, and it sustained — on paper — a strategy that would take 11 hours.

## Related Concepts

- [RPO](/12-reliability/rpo.md) — the partner.
- [Disaster Recovery Planning](/12-reliability/disaster-recovery-planning.md).
- [Failover](/12-reliability/failover.md) — the mechanism.
- [Availability Metrics](/12-reliability/availability-metrics.md) — the measured recovery time.

## Practical Exercise

Find out your most critical system's declared RTO and where it came from.

Then time a recovery exercise. The difference between the two numbers is your real exposure.

## Interview Questions

- Why is the RTO a business decision?
- Why does the clock start before the execution?
- Why define the RTO per function instead of per system?

## Further Reading

- ISO 22301 — business continuity management.
- NIST SP 800-34 — contingency planning.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
