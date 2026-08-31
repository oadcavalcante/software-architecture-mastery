---
id: multi-region
title: Multi-Region
sidebar_position: 15
description: Operating in more than one region — what it solves, and why most systems do not need it.
doc_type: pattern
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader distinguishes the three multi-region designs and
  recognizes which problem each one solves.
prerequisites: [regions]
related: [regions, availability-zones, disaster-recovery]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Multi-Region

## Overview

Operating in more than one [region](/09-cloud-architecture/regions.md) solves three different problems, at
very different prices: surviving the loss of a region, serving distant users with low latency, and meeting
data residency requirements.

Confusing the three leads to expensive designs that do not meet the real objective.

And frankness is worth it: **most systems do not need this**. Three
[availability zones](/09-cloud-architecture/availability-zones.md) cover the overwhelming majority of real
failures, at a fraction of the complexity.

## Problem

Entire regions fail. It is rare, and it happens — and when it happens, it lasts hours.

For a single-region system, that is total unavailability with nothing to do but wait.

For some businesses, hours of downtime is unacceptable. For most, it is acceptable.

That is the first question, and it belongs to the business: **how much does each hour of downtime cost?**
If the answer does not justify multi-region's cost, the discussion ends there.

## Core Concepts

### The three designs

```text
                    cold active-passive  warm active-passive  active-active
idle capacity       none                 partial or total     none
recovery time       hours                minutes              seconds
data loss           minutes to hours     seconds              close to zero
additional cost     low                  medium to high       high
complexity          low                  medium               very high
writes              one region           one region           several regions
```

**Cold active-passive.** Backups replicated to another region; the infrastructure is created when
necessary. It is basically [disaster recovery](/09-cloud-architecture/disaster-recovery.md).

**Warm active-passive.** The secondary region exists and receives continuous replication. Promoting is an
operation, not a construction.

**Active-active.** Both regions serve traffic. It is the only one that gives almost transparent continuity,
and the only one that brings the hard problem: writing in more than one place.

### Active-active runs into consistency

If both regions accept writes for the same data, you have
[conflicts](/06-distributed-systems/conflict-resolution.md) — and the default resolution silently discards
data.

If you require strong consistency between regions, you pay intercontinental coordination latency on every
write. See [PACELC](/06-distributed-systems/pacelc.md).

There is no elegant way out. The ones that work avoid the problem:

**Partitioning by region.** Each piece of data has an owning region; European users write in Europe,
American users in America. With no concurrent writes for the same data, no conflict.

**Active-active reads, centralized writes.** Local and fast reads; writes go to the primary region. It
covers most latency cases without the conflict problem.

**Structures that converge.** For data that allows it — counters, sets.

The second is the most common design among successful implementations, and the least publicized, because it
is less impressive than full active-active.

### The single point geography does not protect

See [regions](/09-cloud-architecture/regions.md): global services — DNS, identity, the control plane —
cross regions.

A multi-region architecture that depends on one of them to work has a single point geographic redundancy
does not cover. Several wide-reaching incidents were exactly that.

### A failover nobody tested does not work

Multi-region's most common failure mode is not the region going down — it is the failover failing when it
is triggered.

Recurring reasons: insufficient quota in the secondary region, divergent configuration, a dependency that
only exists in the primary, a missing certificate, or simply nobody knowing how to execute the procedure
under pressure.

**Exercising the failover periodically, in production**, is what separates a plan from a hope. Systems that
do this discover problems in a controlled window, and not during the incident.

### The cost is more than double

Intuition says "two regions, twice the cost". In practice it is more:

**Duplicated capacity**, if warm or active.

**Cross-region transfer**, continuous, for replication.

**Operational complexity.** Two of everything — deployment, monitoring, configuration — and the guarantee
they do not diverge.

**Engineering time.** The design, the failover, the tests.

And there is a qualitative cost: the system becomes harder to reason about, which is paid in every future
incident, not only the regional ones.

## Mental Model

**Multi-region solves whole-region failure, which is rare.** Before paying for it, check whether three
zones do not solve what actually happens.

## When to Use

- Each hour of downtime has a cost that justifies it.
- A regulatory continuity requirement.
- Users on distant continents with a latency requirement.
- Data residency by jurisdiction.
- A contractual availability requirement a single region cannot reach.

## When Not to Use

**When three zones solve it.** That is the majority's case.

**Without exercising the failover.**

**Active-active without resolving writes.**

**As a precaution, with no number for the cost of downtime.**

**Before the system is solid in one region.** Multiplying a fragile system produces two fragile systems.

**Without checking quotas and service availability in the secondary region.**

## Alternatives

- **Three [availability zones](/09-cloud-architecture/availability-zones.md)** — it covers most real
  failures.
- **[Disaster recovery](/09-cloud-architecture/disaster-recovery.md) in another region** — reduced
  capacity, activated on demand. Far cheaper.
- **A read replica in another region** — read latency without the write problem.
- **A content delivery network** — it solves static content latency with none of this.
- **Graceful degradation** — operating in reduced mode during the failure, instead of duplicating
  everything.

## Trade-offs

| A single region, three zones | Multi-region |
|---|---|
| Simple to operate | Complex |
| Base cost | Much higher |
| Cheap consistency | Expensive |
| A regional failure takes it down | Continuity |
| One configuration set | Two, to keep identical |

| Active-passive | Active-active |
|---|---|
| One region writes | Several |
| No conflict | A conflict to resolve |
| Recovery in minutes | Seconds |
| Idle capacity | All of it in use |
| Medium complexity | Very high |

## Failure Modes

**A failover failing when triggered.**

**Insufficient quota in the secondary.**

**Divergent configuration between regions.**

**A write conflict discarding data.**

**A global service failure.** It crosses both.

**Split brain.** Both regions consider themselves primary.

**An unexpected replication cost.**

**Data loss on promotion.** What the asynchronous replication had not sent.

## Common Mistakes

**Adopting it without quantifying the cost of downtime.** Multi-region multiplies infrastructure and
complexity. With no number for how much an hour offline costs, there is no way to know whether the
investment pays for itself.

**Not exercising the failover.** It is the mechanism that will only be used under stress. With no periodic
exercise, you discover during the incident that a configuration diverged or a quota does not exist.

**Active-active with no write strategy.** Simultaneous writes to the same record in different regions
conflict, and the default resolution discards one of them. Either you partition the data by region, or you
elect a write region.

**Not checking quotas in the secondary.** The account has per-region limits. The secondary, little used,
usually has a low quota — and the failover stops at the moment of bringing up capacity.

**Assuming multi-region eliminates the single point.** DNS, authentication, the control plane and the
provider's global services remain shared, and have already caused outages that hit every region at the same
time.

**Letting the configurations diverge.** The secondary region receives fewer changes and silently falls
behind. When it is triggered, it behaves differently from the primary — which is exactly what you do not
want during a disaster.

## Real-World Example

A payments platform implemented warm active-passive between two regions, motivated by a regulatory
continuity requirement.

The investment was large: duplicated capacity, continuous replication, a documented promotion procedure.

In the first real regional failure — 3 hours of partial provider unavailability — the failover was
triggered and took **2 hours and 40 minutes**, when the target was 15 minutes.

The causes, all found during the incident:

**Quota.** The secondary region had an instance limit sufficient for the standby capacity, not for the
total capacity. Bringing up the rest required opening an emergency ticket with the provider: 50 minutes.

**Divergent configuration.** Three environment variables had been changed in the primary over the year and
never in the secondary. The application came up and failed.

**A dependency only in the primary.** An internal fee calculation service existed only in the primary
region. The secondary pointed at it — over the network, across regions. With the primary degraded, it did
not respond.

**A certificate.** The secondary's certificate had expired four months earlier. Nobody monitored it,
because it was not used.

**The procedure.** The document had 14 steps and was out of date in 5 of them. The on-call person had never
executed it.

After the incident:

**A monthly failover exercise**, in production, in a low-traffic window. The first exercise found two new
problems; the third, none.

**Quota provisioned** for full capacity in both regions.

**Configuration as code**, a single one, applied to both — divergence became impossible.

**A per-region dependency inventory**, verified automatically.

**Certificate monitoring** in both.

After six months of exercises, the failover time fell to 9 minutes.

The learning that stuck: they had had multi-region for two years and had never used it. Having the
infrastructure and **being able to use it** are different things — and the difference only shows up in the
exercise or in the incident.

## Related Concepts

- [Regions](/09-cloud-architecture/regions.md) and
  [Availability Zones](/09-cloud-architecture/availability-zones.md).
- [Disaster Recovery](/09-cloud-architecture/disaster-recovery.md) — the cheaper alternative.
- [Conflict Resolution](/06-distributed-systems/conflict-resolution.md).
- [PACELC](/06-distributed-systems/pacelc.md).

## Practical Exercise

If you have a secondary region, answer: when was the last time it served production traffic?

If the answer is "never", you have infrastructure, not continuity.

## Interview Questions

- What are the three designs, and what problem does each one solve?
- Why does active-active run into consistency, and how is that avoided?
- Why is exercising the failover the part that decides?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- The major providers' multi-region architecture documentation.
