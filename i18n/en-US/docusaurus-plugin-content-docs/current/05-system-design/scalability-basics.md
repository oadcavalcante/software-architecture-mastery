---
id: scalability-basics
title: Basic Scalability Strategies
sidebar_position: 23
description: What to do after identifying the bottleneck — in order of cost, not of reputation.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader applies the scaling strategies in the correct order of cost
  and recognizes when scaling is not the answer.
prerequisites: [bottleneck-analysis]
related: [caching, load-balancing, queues, scalability]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Basic Scalability Strategies

## Overview

Once the [bottleneck](/05-system-design/bottleneck-analysis.md) is identified, there is a known
set of answers.

This document presents them **in order of cost** — which is different from the order in which
they are usually considered. The natural tendency is to start with the expensive ones.

## Problem

"We need to scale" usually means "let's distribute": more services, more partitions, more
components.

That is the most expensive answer and frequently the last one needed. Before it there are
several that cost orders of magnitude less and solve most cases.

The error is not distributing — it is distributing **before** exhausting what is cheap. And
after distributing, going back costs a migration.

## Core Concepts

### The order of cost

**1. Remove the work.** The cheapest gain: a query that does not need to exist, a field nobody
reads, a call that can be eliminated. It costs almost nothing and is the least considered.

**2. Fix what is wrong.** A missing index, a query that scans the table, an N+1. Frequently the
whole bottleneck is here, and the fix takes hours.

**3. Scale vertically.** A bigger machine. It is dismissed for not looking like architecture, and
it solves more than people admit — modern machines hold loads that would have required clusters a
decade ago. It costs money and no complexity.

**4. Cache.** Avoid recomputing. See [caching](/05-system-design/caching.md). It costs
invalidation and a component.

**5. Scale horizontally.** More stateless instances behind a
[balancer](/05-system-design/load-balancing.md). It costs the statelessness requirement.

**6. Go asynchronous.** Move work to a [queue](/05-system-design/queues.md). It costs eventual
consistency, duplication and ordering.

**7. Replicate reads.** Database replicas. It costs replication lag and query routing.

**8. Partition.** Split the data by key. It costs a lot: operations that cross partitions become
expensive, and the key choice is hard to reverse.

Each step costs more than the previous one. **Climb one at a time, measuring.**

### Vertical scaling is underestimated

The reflex is to treat vertical scaling as a defeat. It is worth countering with numbers: a
current database instance handles tens of thousands of transactions per second and hundreds of
gigabytes in memory.

Most systems that adopt partitioning never came close to saturating a single instance — and
permanently took on the cost of cross-partition operations.

Vertical scaling has a limit, and the limit is higher than intuition suggests.

### Statelessness is the step that unlocks

Step 5 depends on [statelessness](/05-system-design/stateless-vs-stateful.md). A component with
local state does not scale horizontally without affinity — which unbalances — or without
partitioning — which is step 8.

That is why investing in statelessness early pays off: it is cheap when the system is small and
expensive to retrofit later.

### Reducing the load is a strategy

Step 1 deserves saying again, because it almost never appears in the discussions.

A screen that loads 40 fields and shows 5. A report computed in real time that nobody opens. A
synchronization that runs every minute when hourly would be enough.

Each of those is capacity recovered at no architectural cost.

### Scaling does not fix

Scale increases capacity; it does not fix intrinsic slowness. If each request takes 3 seconds
because of a bad query, ten instances serve ten times more requests — all of them in 3 seconds.

See [performance versus scalability](/11-scalability/index.md).

## Mental Model

**Climb one step at a time, measuring between them.** The right step is the cheapest one that
solves the current bottleneck.

## When to Use

- The bottleneck was identified by measurement.
- The requirement is not being met.
- There is forecast growth with a deadline.
- A resource is above 70% utilization.

## When Not to Use

**Before identifying the bottleneck.** Scaling what is not the limit changes nothing — and
scaling the application when the bottleneck is the database makes it worse, because more
instances mean more connections.

**When the requirement is already met.** Idle capacity is cost.

**Skipping steps.** Partitioning without having tried indexes, caching and vertical scaling is
taking on a permanent cost for a possibly temporary problem.

**When the problem is the latency of one operation.** Scale makes nothing faster.

**Without measuring afterwards.** With no verification, nobody knows whether the step solved it.

## Alternatives

- **Reduce the load** — step 1, and the cheapest.
- **Accept the degradation** — if the peak is rare and the consequence is small, accepting can be
  cheaper than sizing for it.
- **Rate limit** — protect the capacity instead of increasing it. See
  [rate limiting](/05-system-design/rate-limiting.md).
- **Degrade** — serve a cheaper version under pressure.

## Trade-offs

| Step | Gain | Cost |
|---|---|---|
| Remove work | Variable, sometimes large | None |
| Fix a query | Frequently orders of magnitude | Hours |
| Scale vertically | Linear up to the limit | Money |
| Cache | High on reads | Invalidation, freshness |
| Scale horizontally | Linear | Statelessness |
| Asynchronous | Absorbs peaks | Eventual consistency |
| Read replica | Reads scale | Lag, routing |
| Partition | Writes scale | Cross-partition operations, hard key |

## Failure Modes

**Scaling the application with the database saturated.** More connections, more pressure.

**Partitioning with the wrong key.** One partition concentrates the load — a
[hotspot](/11-scalability/index.md) — and partitioning does not help.

**A cache masking a problem.** The hit rate drops and the problem comes back worse.

**Asynchrony hiding an incapacity.** The queue grows indefinitely.

**A replica with lag not considered.** A read right after a write does not see the data.

## Common Mistakes

**Jumping straight to distribution.** Distributing trades a capacity problem for partial failure,
network latency and consistency — three problems harder than the original, acquired before
exhausting what was cheap.

**Not considering vertical scaling.** A machine today holds hundreds of gigabytes of memory and
dozens of cores. Switching instances is an afternoon of work and solves most business systems for
years.

**Not measuring between steps.** Without measuring after each change, nobody knows whether the
bottleneck moved — and optimizing the component that stopped being the limit is work with zero
return.

**Confusing scale with performance.** They are independent axes and sometimes opposites: a system
can respond in 10 ms and not handle double the load, and the optimization that speeds up the
single instance is frequently the one that prevents distributing.

**Not considering reducing the load.** Caching, pagination, removing an unnecessary query and
rate limiting change the denominator of the equation. It is the cheapest alternative and the one
that almost never makes the list, because the question asked was "how do we handle more?" instead
of "why is there so much?".

## Real-World Example

An invoice issuance system handled 40 requests per second and the requirement was 200. The
initial proposal: partition the database and distribute the application across three regions.

Climbing step by step took six weeks and never reached partitioning.

**Step 1.** The issuance screen loaded the customer's complete history — used by none of the
displayed fields. Removed: 40 → 65 req/s.

**Step 2.** Two queries with no adequate index, found in the profile. Indexes created: 65 → 140
req/s.

**Step 3.** The database instance was at a size defined three years earlier. Doubled: 140 → 190
req/s. Additional monthly cost equivalent to two days of an engineer's work.

**Step 4.** A cache on the customer registration lookup, which changed rarely and was read on
every issuance: 190 → 310 req/s.

It stopped there, with 55% of headroom over the requirement.

The total cost: six weeks of work, mostly measuring, and one instance upgrade. The original plan —
partitioning and multi-region — was estimated at two quarters and would have added permanent
operational cost.

What the team recorded in the ADR: steps 1 and 2 alone delivered 250% of the gain, and both were
fixes of things that were wrong, not scaling. If the original proposal had been executed, both
problems would still be there — distributed.

## Related Concepts

- [Bottleneck Analysis](/05-system-design/bottleneck-analysis.md) — what precedes.
- [Caching](/05-system-design/caching.md), [Load Balancing](/05-system-design/load-balancing.md),
  [Queues](/05-system-design/queues.md) — specific steps.
- [Stateless vs. Stateful](/05-system-design/stateless-vs-stateful.md) — what unlocks horizontal
  scaling.
- [Scalability](/11-scalability/index.md) — the in-depth treatment.

## Practical Exercise

If your system has a capacity problem, walk through the steps in writing before acting: is there
work to remove? A query to fix? When was the instance last sized?

The first three steps solve most cases and are almost never tried in order.

## Interview Questions

- What is the order of cost of the scaling strategies?
- Why can scaling the application make a database bottleneck worse?
- Why is vertical scaling underestimated?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Gregg, Brendan. *Systems Performance*. 2nd ed., 2020.
