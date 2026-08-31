---
id: performance-vs-scalability
title: Performance versus Scalability
sidebar_position: 13
description: Two different properties, measured in different ways — and confusing them directs the effort to the wrong place.
doc_type: tradeoff
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies whether a problem is performance or scale, and
  chooses the measurement that answers that question.
prerequisites: [scalability]
related: [scaling-capacity-planning, hotspots, horizontal-scaling]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Performance versus Scalability

## Overview

They are two different properties:

```text
performance   how fast one unit of work is done
scalability   what happens to the cost per unit when the volume grows
```

A system can be fast and not scale. It can be slow and scale perfectly. The two properties are
independent, and the interventions that improve one frequently do not improve the other.

Confusing them is the most common reason a scale project does not solve the problem that motivated it.

## Problem

The reported symptom is almost always the same: "the system is slow".

From there, two interpretations lead to opposite paths:

**A performance problem.** An operation is intrinsically slow. It takes the same with one user or with a
thousand. The answer is optimizing that operation.

**A scale problem.** The operation is fast on its own and degrades under load. The answer is removing
contention or adding capacity.

Applying the wrong answer is expensive in both directions: optimizing code that is already fast, or adding
machines for a query that takes the same on any of them.

## Core Concepts

### The measurement that separates the two

A single measurement answers it: **latency at low load against latency at high load.**

```text
1 req/s: 800 ms | 1000 req/s: 850 ms  → performance. It scales well, it is slow.
1 req/s:  40 ms | 1000 req/s: 3000 ms → scale. It is fast, it degrades under load.
1 req/s: 800 ms | 1000 req/s: 4000 ms → both.
```

Without that comparison, the diagnosis is a guess. And it is cheap: one test with one user and one test
with load.

The instrumentation mistake that prevents it: measuring only the average in production, without separating
by load level. The average mixes the two regimes.

### Throughput and latency are not the same thing

**Latency** is the time of one operation.

**Throughput** is the number of operations per unit of time.

They are related and they are not proportional: a system can double its throughput by adding parallelism,
without each operation's latency improving at all.

And the relationship inverts under saturation: above a certain point, increasing the load **reduces**
throughput, because the contention comes to consume more than the useful work.

### Little's law organizes the reasoning

```text
requests in flight = throughput × average latency
```

Simple and powerful. Practical conclusions come out of it:

**If the latency doubles and the throughput holds, the number of simultaneous requests doubles** — which
means double the connections, the memory, the descriptors. That is why a slowdown in one dependency
exhausts resources with no apparent relation to it.

**To sustain 1,000 req/s with 200 ms of latency**, the system needs to support 200 simultaneous requests.
If the connection limit is 100, the maximum throughput is 500 req/s, regardless of CPU.

That last calculation is the one that reveals bottlenecks no CPU graph shows.

### Amdahl's law defines the ceiling

The part of a computation that does **not** parallelize limits the gain, regardless of how many resources
you add.

```text
serial fraction   maximum gain
       10%             10×
        5%             20×
        1%            100×
      0.1%          1,000×
```

In a distributed architecture, the "serial fraction" is everything that coordinates: a lock, a central
counter, a single sequence, a hot partition.

The practical consequence changes the target: above a certain point, **removing the serial fraction is
worth more than adding capacity**. A global counter replaced by partial counters summed at read time can
return more than doubling the machines.

### Linear scale is the exception

The ideal — double the resources, double the capacity — rarely happens.

What is observed in practice:

```text
2 nodes  → 1.9× the capacity
4 nodes  → 3.6×
8 nodes  → 6.5×
16 nodes → 10×
32 nodes → 11×   ← the coordination comes to cost more than the gain
```

The degradation comes from coordination and from contention over shared resources. There is a point beyond
which adding nodes **worsens** the result.

Knowing that point for your system — by measuring, not estimating — is what avoids spending on capacity
that does not deliver.

### There is always only one bottleneck at a time

A system has one limiting resource at each moment. Optimizing any other changes nothing.

```text
high CPU, idle disk               → CPU is the bottleneck
low CPU, high latency             → waiting: network, disk, a lock, a dependency
connections exhausted             → concurrency, not capacity
one partition at 100%, rest idle  → a hotspot
```

The fourth line is the most deceptive: the average utilization looks comfortable, and the system is
saturated. See [hotspots](/11-scalability/hotspots.md).

After removing one bottleneck, the next one appears — somewhere else. That is not a failure of the work; it
is how it works.

## Mental Model

**Performance is the time of one operation; scalability is what happens with many.** The measurement that
separates the two costs an afternoon.

## When to Use

Making the distinction explicit is necessary whenever:

- Somebody reports slowness.
- There is a proposal to add capacity.
- The volume is going to grow by orders of magnitude.
- The infrastructure cost grows faster than the business.

## When Not to Use

**Adding capacity without identifying the bottleneck.**

**Optimizing without measuring under load.**

**Chasing linear scale.** It does not exist; know your saturation point.

**Optimizing what is not the bottleneck.**

**Measuring only the average.** It hides the tail and mixes load regimes.

**Scaling before needing to.** Permanent complexity for a hypothetical problem.

## Alternatives

Ways to resolve "it is slow" without adding capacity:

- **An appropriate index** — the most common cause. See [indexing](/07-data-architecture/indexing.md).
- **A cache** — it reduces repeated work.
- **Asynchronous processing** — it takes the operation off the critical path. See
  [asynchronous processing](/11-scalability/async-processing.md).
- **Removing the serial fraction** — the highest return when Amdahl's ceiling has been reached.
- **Separating workloads** — analytics out of transactional. See [OLTP](/07-data-architecture/oltp.md).

## Trade-offs

| Optimizing performance | Adding capacity |
|---|---|
| Reduces the cost per operation | Increases the total cost |
| Requires engineering time | Immediate |
| Gain limited by the operation | Limited by contention |
| Improves at low load too | Only under load |

| Vertical scaling | Horizontal |
|---|---|
| No coordination | Coordination costs |
| The bigger machine's ceiling | A contention ceiling |
| Simple | Permanent complexity |

## Failure Modes

**Capacity added with no effect.** The bottleneck was something else.

**Optimizing the wrong path.** Weeks spent on code that was not the limit.

**Saturation from concurrency.** Connections exhausted with idle CPU.

**The saturation point exceeded.** More nodes, less throughput.

**The average hiding the tail.** The 99th percentile is terrible and the average looks fine.

**An unrealistic load test.** Synthetic data with no real distribution produces results that do not hold.

## Common Mistakes

**Not measuring latency at two load levels.**

**Adding machines as the first answer.**

**Ignoring Little's law** when sizing connections and concurrency.

**Not identifying the serial fraction.**

**Optimizing before finding the bottleneck.**

**Trusting the average.**

## Real-World Example

A booking platform received the directive to "solve the scalability" after recurring slowness at peak
hours.

The proposed plan: migrate to microservices and add auto scaling. Estimated at nine months.

Before approving, the measurement was made at two load levels:

```text
operation                 1 user     peak
availability search      2,400 ms   2,600 ms
booking detail              45 ms   1,900 ms
confirmation               120 ms   4,200 ms
```

Three different diagnoses, on the same screen:

**Availability search: a performance problem.** Slow on its own, practically the same under load. No amount
of machines would help. The cause was a query with unnecessary joins and no appropriate index. Fixed: 2,400
ms to 180 ms.

**Booking detail: a scale problem.** Fast on its own, degrades. The cause was the connection pool being
exhausted — 50 connections, with 45 ms of latency, limiting the throughput to around 1,100 req/s by
Little's law. The peak asked for 1,800. Increasing the pool and reducing the connection hold time resolved
it.

**Confirmation: both.** Slow on its own and worse under load. The slowness came from a synchronous call to
a payment service; the degradation, from all the confirmations competing for a lock on the inventory table.

The confirmation received two independent fixes: the payment call became asynchronous with explicit state,
and the single lock was replaced by a per-resource lock, removing the serial fraction.

Result: the three operations came within target in six weeks, with no microservices and with no capacity
increase.

Six months later, with double the volume, the system stayed within target — which would not have happened
if the original plan had been executed, because the availability search would be equally slow in any
architecture.

What the team records: the measurement that directed everything took an afternoon. The nine-month plan had
been assembled from the symptom, with no measurement at all distinguishing the three cases.

## Related Concepts

- [Hotspots](/11-scalability/hotspots.md) — when the average deceives.
- [Horizontal Scaling](/11-scalability/horizontal-scaling.md) and
  [Vertical](/11-scalability/vertical-scaling.md).
- [Capacity Planning](/11-scalability/scaling-capacity-planning.md).
- [Bottleneck Analysis](/05-system-design/bottleneck-analysis.md).

## Practical Exercise

Take the most complained-about operation in your system and measure the latency with a single user and
under peak load.

The difference between the two numbers says which problem you have — and it probably contradicts the
hypothesis the team is working on.

## Interview Questions

- Which measurement distinguishes a performance problem from a scale problem?
- How does Little's law reveal bottlenecks CPU graphs do not show?
- Why can removing the serial fraction return more than adding capacity?

## Further Reading

- Amdahl, Gene. *Validity of the Single Processor Approach*, 1967.
- Gunther, Neil. *Guerrilla Capacity Planning*. Springer, 2007 — the universal scalability law.
- Gregg, Brendan. *Systems Performance*. 2nd ed. Addison-Wesley, 2020.
