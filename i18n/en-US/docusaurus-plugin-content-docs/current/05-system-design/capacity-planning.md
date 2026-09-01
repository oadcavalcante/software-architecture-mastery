---
id: capacity-planning
title: Capacity Planning
sidebar_position: 21
description: Estimating before building — and why the order of magnitude matters more than precision.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader produces capacity estimates that eliminate unviable
  architectures, without confusing an estimate with a forecast.
prerequisites: [components]
related: [bottleneck-analysis, scalability-basics, back-of-envelope]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Capacity Planning

## Overview

Capacity planning is estimating how much the system needs to handle — in volume, data and
bandwidth — before building it.

The goal is not to get the number right. It is **to discover the order of magnitude**, because
that is what eliminates unviable architectures and reveals where the problem will be.

## Problem

With no estimate, every architectural decision has no criterion. "Do we need a cache?" has no
answer if nobody knows how many reads per second there are.

The result is deciding by reputation — adopting what large systems adopt — or by familiarity. In
both cases, the system is sized for a scale somebody imagined.

And the estimate is usually avoided for a specific reason: people think it has to be precise. It
does not. **An estimate that is off by 3× and gets the order of magnitude right already
eliminates the wrong options.**

## Core Concepts

### What to estimate, in this order

**Operation volume.** How many per day, and what the peak is. The ratio between peak and average
matters more than the average — systems go down at the peak.

**The distribution between reads and writes.** A system with a 100-to-1 ratio has a different
architecture from one with 1 to 1.

**Data volume.** How much it grows per day, how much accumulates in a year, in three years.

**Average record size.** Multiplied by the volume, it gives storage.

**Bandwidth.** Volume × response size. It is what frequently surprises in systems with media.

**Concurrent connections.** Relevant for long connections and for sizing pools.

### Back-of-the-envelope arithmetic

Numbers worth having in your head, because they make estimating fast:

```text
1 day             ≈ 86,400 s   ≈ 10⁵ s
1 million/day     ≈ 12 /s
100 million/day   ≈ 1,200 /s
1 billion/day     ≈ 12,000 /s
```

Rule of thumb for peaks: **the peak is usually 2× to 5× the average** in systems with human
usage, and much more in systems with a concentrated event — ticket sales, Black Friday, the
accounting close.

A complete example:

```text
10 million orders/month
  → 333 thousand/day → ~4 /s average
  → peak 3×          → ~12 /s

2 KB record
  → 20 GB/year of orders
  → fits on one instance, comfortably

reads 50× writes
  → ~200 /s of reads at peak
  → a cache solves it; a replica is not needed yet
```

That calculation takes five minutes and already answers three architectural decisions.

### What the estimate eliminates

The value is in **ruling out**, not in predicting.

12 requests per second eliminates any discussion about partitioning, distributed systems or
space-based architecture. A database on one instance handles it with orders of magnitude of
headroom.

12 thousand per second eliminates the single instance and forces you to think about
partitioning, replicas and caching from the start.

The difference between the two is what the estimate reveals — and it does not change if the real
number is 15 or 9.

### An estimate is not a forecast

An estimate says what the system needs to handle given a scenario. A forecast says what is going
to happen.

The first is useful and verifiable. The second is always wrong, and the typical error is on the
high side — every product expects to grow a hundredfold.

The question that avoids oversizing: **what is the growth over the next twelve months, and how
much does it cost to defer the scaling decision until then?** Frequently deferring is cheap, and
the architecture for a hundredfold is never exercised.

### Re-estimate when the real numbers arrive

The initial estimate is replaced by measurement as soon as the system runs. Continuing to size by
estimate when there is real data is choosing the worse source.

## Mental Model

**Order of magnitude, not a number.** The question is whether it is tens, thousands or millions —
because each band has a different architecture.

## When to Use

- Before deciding the architecture of a new system.
- When evaluating whether a scaling decision is justified.
- In a system design interview — see
  [capacity estimation](/22-system-design-interviews/index.md).
- When sizing infrastructure and budget.
- Before adopting any distributed component.

## When Not to Use

**Seeking precision.** An estimate with three decimal places gives false confidence and costs
time.

**When there is real data.** Measure.

**To justify a decision already made.** An estimate built to confirm a choice eliminates nothing.

**Designing for an imagined scale.** See
[YAGNI](/02-software-design/yagni.md). Size for the foreseeable horizon, with a path to grow.

## Alternatives

- **Measure** — when the system exists.
- **Load test** — to discover the real limit instead of computing it.
- **Compare with a similar system** — when there is an internal one with a similar profile.

## Trade-offs

| Estimate first | Find out later |
|---|---|
| Eliminates unviable options early | Discovered in production |
| Sizing with a criterion | By reputation |
| Time spent before building | Zero |
| May oversize | May undersize |

## Failure Modes

**Estimating only the average.** The system goes down at the peak.

**Forgetting data growth.** The volume per second fits, and three years of storage does not.

**Ignoring bandwidth.** A 500 KB response at 200 requests per second is 100 MB/s of egress —
frequently the dominant cost.

**Oversizing by optimistic forecast.**

**Estimating and never comparing with the real numbers.** Without that comparison, nobody
improves the next estimate.

## Common Mistakes

**Skipping the estimate.** Without it, the architectural decision is made by intuition about
volume — and intuition about volume is off by orders of magnitude, in both directions.

**Seeking precision instead of an order of magnitude.** The question the estimate answers is
whether it fits on one machine or requires a hundred. Refining from 8,200 to 8,350 requests per
second changes no decision.

**Not estimating the peak.** The average sizes nothing: the system has to handle Black Friday,
not Tuesday. The peak-to-average ratio is usually an order of magnitude and is the number that
decides.

**Not estimating accumulated growth.** Throughput is solved by adding machines; stored volume is
not. It is the axis that decides partitioning and retention, and the one most frequently left out
of the math.

**Using the estimate as a committed forecast.** It exists to eliminate unviable architectures,
not to become a contractual target. Treated as a promise, it produces defensive oversizing.

## Real-World Example

A team was going to build a vehicle telemetry platform and proposed, from the start: a
distributed time-series database, a partitioned queue and stream processing.

The estimate took ten minutes.

```text
8,000 vehicles
1 reading every 30 s → 8,000/30 ≈ 267 /s
200-byte record      → 53 KB/s → 4.6 GB/day → 1.7 TB/year

queries: ~50 users, ~2 queries/min → 1.7 /s
```

267 writes per second and fewer than 2 reads. A relational database with a table partitioned by
time handles it comfortably.

The accumulated volume — 1.7 TB/year — was the only number that required a decision: retention.
The conversation with the business defined 90 days in detail and monthly aggregation afterwards,
which reduced the active store to 420 GB.

The system was built with one relational database instance and an ingestion process. It ran for
three years.

In the third year, the fleet reached 60 thousand vehicles — 2,000 writes per second — and
partitioning became necessary. The decision was made with real data, not with an estimate, and it
cost two weeks.

What the estimate avoided: three years operating a distributed system for a load one instance
handled, with the corresponding operational cost.

And what it got right was not the number — the fleet grew more than expected. It was the
**initial order of magnitude**, which was hundreds and not tens of thousands.

## Reference numbers

Estimating gets fast when a few orders of magnitude are memorized. These do not have to be exact
— they have to be the right order.

**Latency**

| Operation | Order |
|---|---|
| Memory read | ~100 ns |
| Sequential read of 1 MB from memory | ~10 µs |
| Round trip within the same zone | ~0.5 ms |
| Random read on a solid-state disk | ~100 µs |
| Round trip between regions on the same continent | ~30 ms |
| Intercontinental round trip | ~150 ms |

The last line is the one that most decides architecture: no code optimization compensates for
physical distance, and it is why
[CDNs](/05-system-design/cdn.md) and multi-region exist.

**Typical throughput of one instance**

| Component | Order |
|---|---|
| Stateless application, simple request | thousands/s |
| Relational database, simple write | thousands/s |
| Relational database, query with a join | hundreds/s |
| In-memory cache | tens of thousands/s |

These numbers vary by an order of magnitude depending on the case. Their value is different: they
say that **one database instance handles thousands per second**, which eliminates discussions
about partitioning in systems doing tens per second.

Numbers attributed to real systems should be measured, not estimated. These serve to rule out,
not to size.

## Related Concepts

- [Bottleneck Analysis](/05-system-design/bottleneck-analysis.md) — where the limit appears.
- [Scalability Basics](/05-system-design/scalability-basics.md) — what to do with the result.
- [Back-of-the-Envelope Calculations](/22-system-design-interviews/index.md) — the technique in an
  interview.
- [Cost Architecture](/09-cloud-architecture/cost-architecture.md).

## Practical Exercise

Estimate the capacity of the system you work on, without looking at metrics: operations per
second at peak, data growth per day, egress bandwidth.

Then compare with the real numbers. The distance between the two says how well you know the
system — and the exercise improves the next estimate.

## Interview Questions

- What do you estimate, and in what order?
- Why does the order of magnitude matter more than precision?
- What is the difference between an estimate and a forecast?

## Further Reading

- Dean, Jeff. *Numbers Everyone Should Know* — the reference latency table.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — the chapter on capacity
  planning.
