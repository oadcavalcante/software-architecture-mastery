---
id: availability-zones
title: Availability Zones
sidebar_position: 9
description: Isolated datacenters inside a region — the cloud's best-return defense, and the most misused.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distributes resources across zones consciously, and knows
  the transfer cost that distribution generates.
prerequisites: [regions]
related: [regions, multi-region, cloud-networking]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Availability Zones

## Overview

An availability zone is a datacenter — or a set of them — isolated from the others inside the same
[region](/09-cloud-architecture/regions.md): independent power, cooling and network.

Zones are close enough for the latency between them to be a few milliseconds, and far enough apart that a
fire, a power outage or a flood does not hit two.

Distributing across zones is the cloud's **best cost-to-benefit defense**. And it is routinely confused
with multi-region, which solves another problem and costs far more.

## Problem

Datacenter failures happen: power, cooling, network, fire, human error in maintenance.

An entire system in one zone goes down with it — and most systems are like that with nobody having decided
it, because the default for creating resources is "one zone".

Distributing across zones turns an event that takes everything down into one that removes a third of the
capacity.

## Core Concepts

### A zone is not a region

The most common and most expensive confusion:

```text
                zone                     region
distance        kilometers               hundreds to thousands of km
latency         1 to 3 ms                20 to 250 ms
isolated failure  power, fire, network   a disaster, a whole-region failure
consistency     strong is cheap          expensive
cost            modest transfer          high
complexity      configuration            a project
```

The practical consequence: **synchronous replication between zones is viable**; between regions, it rarely
is. That is what makes multi-zone the default and multi-region the exception.

See [PACELC](/06-distributed-systems/pacelc.md).

### Three zones, not two

Two zones look sufficient and are not, because of [consensus](/06-distributed-systems/consensus.md):
systems that need a majority — databases with leader election, coordinators, orchestrators — cannot form a
majority with half of them down.

```text
2 zones, 1 down → 50% of the nodes → no majority → unavailable
3 zones, 1 down → 67% of the nodes → majority   → it continues
```

That is why the recommendation of three zones is not headroom: it is the minimum for the loss of one zone
to be tolerable in systems that coordinate.

### Distributing is not enough — there needs to be capacity

A frequent mistake: three instances in three zones, each one operating at 70%.

One zone goes down. The remaining two need to absorb 150% of the load they had, and they cannot.

The rule: the remaining zones' capacity needs to support the peak. With three zones, each one should
operate around 60% or less — or the auto scaling needs to be fast enough, which it rarely is during a
correlated event.

See [availability](/06-distributed-systems/availability.md).

### Cross-zone traffic is billed

This is multi-zone's hidden cost, and it surprises people.

Cross-zone transfer is usually charged in both directions. In an architecture with many services talking to
each other, and balancing that ignores the zone, most of the traffic crosses zones with no need.

Zone-preferring routing — serving preferentially in the same zone, crossing only when necessary — reduces
that substantially, and it is a configuration, not a rewrite.

### Not every service is multi-zone by default

Managed services vary: some replicate across zones automatically, others require explicit configuration,
and others are single-zone by nature.

Disk volumes, typically, belong to one zone. An instance with data on a local disk does not migrate to
another zone — the data stays where it is.

Checking that service by service is part of the design. The assumption that "it is in the cloud, so it is
resilient" is the origin of outages nobody expected.

### Zone failures are not always total

A zone can degrade without going down: high latency, an elevated error rate, an intermittent network.

Health checks that only verify whether the process responds do not detect that, and traffic keeps being
sent to a sick zone. See [failure detection](/06-distributed-systems/failure-detection.md).

Balancing that is sensitive to error rate and latency — not just presence — is what turns degradation into
automatic removal.

## Mental Model

**A zone is where redundancy is cheap.** If you are not using three, you are paying for cloud and operating
like a single datacenter.

## When to Use

Distributing across zones should be the default. Especially when:

- Unavailability has a relevant cost.
- The system needs a majority to coordinate.
- There is an agreed availability requirement.
- The cross-zone transfer cost is small next to the cost of stopping.

## When Not to Use

**Development and test environments.** Redundancy costs and serves nothing there.

**Ephemeral and reprocessable workloads.** A batch job that can be rerun does not need to survive a zone
outage.

**Two zones for systems that require a majority.** Worse than one in some respects, because it gives the
impression of redundancy.

**Distributing with no absorption capacity.** Redundancy that does not withstand the failure is not
redundancy.

**When the data is single-zone anyway.** Distributing the compute without distributing the state does not
solve it.

## Alternatives

- **[Multi-region](/09-cloud-architecture/multi-region.md)** — for a regional disaster; far more
  expensive.
- **A backup with a tested restore** — when temporary unavailability is acceptable.
- **Managed services that are already multi-zone** — they transfer the problem. See
  [managed services](/09-cloud-architecture/managed-services.md).
- **A single zone with fast recovery** — a legitimate decision for low-criticality systems, as long as it
  is explicit.

## Trade-offs

| Multi-zone | A single zone |
|---|---|
| Survives the loss of a datacenter | Goes down with it |
| Transfer billed | Cheap local traffic |
| Latency of a few ms | Minimal |
| Idle capacity for absorption | No headroom |
| Additional configuration | Simple |

| Three zones | Two |
|---|---|
| The majority is preserved | Lost |
| 33% loss per failure | 50% |
| Higher cost | Lower |

## Failure Modes

**Everything in one zone with nobody knowing.** The creation default led to that.

**Two zones with no majority.** The coordination stops.

**Insufficient capacity.** The remaining zones saturate.

**Data stuck in one zone.** The compute migrates, the volume does not.

**A degraded zone receiving traffic.** The health check is too shallow.

**An unexpected transfer cost.** Traffic crossing zones with no need.

**Auto scaling concentrating in one zone.** When replacing instances, the provider can allocate where there
is capacity — which may be a single zone.

## Common Mistakes

**Not distributing, by omission.** Distributing across zones costs almost nothing within a region and is
the cheapest defense there is. Staying in one zone is rarely a decision — it is the default nobody
reviewed.

**Using two zones.** Losing one means losing half the capacity, so each zone needs to run at 50% to absorb
the other. With three, losing one requires a third of headroom, and the total cost comes out lower.

**Not sizing for the loss of one zone.** Distributing with no headroom only changes the failure mode:
instead of going down together, the system survives the loss and then saturates with the redistributed
load.

**Assuming the managed service is multi-zone.** Many offer the option and do not apply it by default,
because it costs more. The check is per resource, in the actual configuration.

**Not configuring zone preference in the routing.** With no preference, traffic crosses zones with no need
— which adds latency and, at several providers, cross-zone transfer charges.

**Not testing the loss of a zone.** It is the mechanism that will only be exercised during an incident.
With no deliberate exercise, you find out on the day that a dependency was single-zone.

## Real-World Example

An e-commerce platform operated in three zones and considered itself resilient.

In a real zone failure — power, lasting 4 hours — the system was unavailable for 50 minutes. The
investigation found four independent causes:

**Capacity.** The instances operated at 75% at normal times. With one zone down, the remaining two would
need to absorb 112% of what they could handle. Auto scaling started bringing up instances, and took 9
minutes — during which the system was saturated.

**A database in two zones.** The primary database and its synchronous replica were in two zones, not three.
The zone that went down had the replica; the promotion worked. But the coordination service used for
election was also in two zones, lost its majority, and could not decide for 6 minutes.

**Stuck volumes.** Four services wrote to a local disk. The instances were recreated in other zones,
without the data. Two of them were caches and recovered; the other two required a restore.

**Inverted zone preference.** A balancing configuration made traffic cross zones by default. That was
already expensive, and during the incident it sent part of the requests to the degraded zone — which still
answered the health checks, only with very high latency.

The fixes:

**A 55% utilization target** per zone, to absorb the loss of one without depending on scaling.

**Coordination across three zones**, and the database too.

**State off the local disk** in the two services that needed it.

**A health check sensitive to latency**, not only to a response.

**Zone preference in the routing** — which, as a side effect, reduced the transfer bill by around 40%.

**Periodic zone-loss testing**, in production, in a controlled window. The first test found two new
problems.

What the team learned: they were in three zones and believed they were protected. Being distributed and
**surviving** the failure are different things, and the difference only shows up in the test — or in the
incident.

## Related Concepts

- [Regions](/09-cloud-architecture/regions.md) — the level above.
- [Multi-Region](/09-cloud-architecture/multi-region.md) — for a regional disaster.
- [Availability](/06-distributed-systems/availability.md).
- [Consensus](/06-distributed-systems/consensus.md) — why three, not two.

## Practical Exercise

Find out how many zones your system runs in today — and ask the same question for the database, the cache,
the volumes and the coordination service, separately.

Then calculate: if a zone vanishes now, do the remaining ones handle the peak?

## Interview Questions

- What is the difference between a zone and a region, and why does it decide the strategy?
- Why three zones and not two?
- Why does distributing across zones not guarantee surviving the loss of one?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- The major providers' availability zone documentation.
- Vogels, Werner. *10 Lessons from 10 Years of Amazon Web Services*, 2016.
