---
id: bottleneck-analysis
title: Bottleneck Analysis
sidebar_position: 22
description: Finding the resource that saturates first — and why optimizing any other changes nothing.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies the real bottleneck by measurement and recognizes that
  optimizing outside it does not increase capacity.
prerequisites: [capacity-planning]
related: [capacity-planning, scalability-basics, hotspots]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Bottleneck Analysis

## Overview

A bottleneck is the resource that saturates first and limits the capacity of the whole.

The consequence that organizes everything: **optimizing any resource that is not the bottleneck
does not increase the system's capacity.** It only increases the headroom of something that
already had headroom.

## Problem

Teams optimize what is visible, familiar or uncomfortable — rarely what limits.

The pattern: someone rewrites a slow function and gains 40% in that snippet. The system's
response time does not change, because the function accounted for 3% of the total and the
bottleneck was the database.

That is not a lack of competence. It is the absence of measurement before acting — and the
measurement is fast when you know what to look for.

## Core Concepts

### The candidates, in order of frequency

In business systems, the bottleneck is usually one of these:

**The database.** The most common. A query with no index, a lock, exhausted connections, or
simply volume above what the instance can hold.

**A synchronous external call.** A third-party service in the response, with high or variable
latency.

**The connection pool.** Exhausted, requests wait for a resource that exists.

**CPU.** Serialization, cryptography, compression, image processing.

**Network.** Egress bandwidth, especially with media.

**A lock.** A serialized resource everything passes through — a counter, a hot row, a lock.

Memory is rarely a throughput bottleneck; it is a stability bottleneck — the system does not get
slow, it goes down.

### Measure before acting

Three instruments, in order:

**Distributed tracing.** Where a request's time is spent, per step. It is what answers the
question fastest.

**CPU and allocation profiling.** When the time is inside the process.

**Resource metrics.** CPU utilization, connections in use, queue depth, lock wait time.

The guiding question: **where does the time come from, and which resource is closest to its
limit?**

### Utilization and queueing

A resource does not degrade linearly. It works well up to about 70% utilization and gets worse
fast after that — because queue wait time grows non-linearly as utilization approaches 100%.

The practical consequence: **a resource at 85% utilization is already degrading**, even if it has
not gone down yet. Waiting for 100% to act is waiting for the collapse.

### The bottleneck moves

Fix one, and another appears. That is not a failure — it is the expected result.

The system always has a bottleneck; the question is whether it is above or below the necessary
capacity. Optimizing until the current bottleneck is out of the way and the next one is
comfortably above the requirement is the stopping criterion.

Without that criterion, optimization never ends.

### Amdahl's law applied

If a step accounts for 20% of the total time, eliminating it completely improves things by 20% —
never more.

That gives the priority order: **optimize what accounts for the largest fraction of the time**,
and nothing else. A 10× improvement in something that costs 5% of the total yields 4.5%.

## Mental Model

**Which resource is closest to its limit?** Everything else has headroom by definition, and
touching it does not change the capacity.

## When to Use

- The system is slow or unstable and nobody knows why.
- Before any optimization effort.
- Before deciding to scale — scaling what is not the bottleneck is spending with no gain.
- When validating whether an architectural change would solve the real problem.

## When Not to Use

**As a substitute for measurement.** Analysis with no instrument is a guess.

**When the system meets the requirement.** Optimizing what is already enough is cost with no
return.

**Optimizing what is not the bottleneck.** It yields zero in capacity.

**With no stopping criterion.** Without knowing which requirement has to be met, optimization
never ends.

## Alternatives

- **Load test** — provoke saturation in a controlled environment, instead of waiting for
  production.
- **Reduce the load** — the least considered alternative: a query that does not need to exist is
  the cheapest gain.
- **Accept it** — if the bottleneck is above the requirement, it is not a problem.

## Trade-offs

| Measure first | Optimize directly |
|---|---|
| Effort on what pays off | Frequently on what does not |
| Requires instrumentation | None |
| Time before acting | Immediate action |
| Verifiable result | A sense of improvement |

## Failure Modes

**Optimizing outside the bottleneck.** Effort with no capacity gain.

**Confusing the symptom with the cause.** "The database is overloaded" is a symptom; the cause
may be a query, an access pattern or an unnecessary feature.

**Measuring with unrealistic load.** A test with staging data does not reveal the behavior with
production volume.

**Fixing one and not checking the next.** The bottleneck moved and nobody looked.

**Ignoring the tail.** The average is fine and the 99th percentile is terrible — and that is the
one the user perceives.

## Common Mistakes

**Optimizing without measuring.**

**Scaling before identifying the bottleneck.** Adding instances when the bottleneck is the
database makes it worse — more instances, more connections, more pressure.

**Looking only at the average.**

**Not instrumenting before you need it.** During an incident, there is no time to instrument.

**Stopping with no criterion.**

## Real-World Example

A booking system had 3 seconds of latency at the 95th percentile, against a requirement of 800
ms.

The first hypothesis was the database, and the team started discussing a read replica.

Distributed tracing showed something else. The time distribution of a typical request:

```text
database (3 queries)       180 ms
pricing service          2,400 ms   ← 80% of the time
serialization               40 ms
the rest                   120 ms
```

The database accounted for 6%. A read replica would have improved things, in the best case, by
6% — for a problem that required 73%.

The pricing service was the bottleneck. Investigating: it made a synchronous call to a currency
exchange service on every request, and the rate changed twice a day.

The fix was a cache with a 5-minute TTL on the rate. Latency dropped to 210 ms.

After that the bottleneck moved to the database — the 3 queries became 85% of the remaining time.
But 210 ms is comfortably below the 800 ms requirement, and the team stopped.

Two lessons recorded. The initial hypothesis was wrong, and it would have consumed weeks building
a replica to gain 6%. And the stop was deliberate: the new bottleneck exists, is measured, and
does not need fixing while the requirement is met.

## Where to start looking

When distributed tracing is not available, a sequence of checks resolves most cases in minutes.

**One.** Is the time inside or outside the process? Compare the request's total time with the sum
of time spent in external calls — database, services, cache. If most of it is outside, the problem
is not your code.

**Two.** How many queries per request? A number that grows with the quantity of items displayed is
the classic N+1. See
[Proxy](/03-design-patterns/proxy.md).

**Three.** Does any query scan the table? The execution plan answers that. A missing index is the
most frequent cause and the cheapest to fix.

**Four.** Is the connection pool saturated? Requests waiting for a connection show up as slowness
with no component being busy.

**Five.** Is there a lock? Lock wait time in the database, or contention on a serialized resource
in the application.

**Six.** Is the CPU saturated? If so, the profile says where. If not, the time is spent waiting —
and waiting is network, disk or a lock.

The order matters: the first three answer most cases in business systems, and the three cost
minutes. Starting with the CPU profile is starting with the least likely answer.

## Related Concepts

- [Capacity Planning](/05-system-design/capacity-planning.md) — the estimate that precedes it.
- [Scalability Basics](/05-system-design/scalability-basics.md) — what to do with the identified
  bottleneck.
- [Observability](/13-observability/index.md) — the instruments.
- [Hotspots](/11-scalability/index.md) — when the bottleneck is a key, not a resource.

## Practical Exercise

Take the most important operation in your system and find out where the time is spent, per step.

If you cannot answer in minutes, instrumentation is missing — and that is the most valuable
discovery of the exercise.

## Interview Questions

- Why does optimizing outside the bottleneck not increase capacity?
- Why is a resource at 85% utilization already a problem?
- How do you decide when to stop optimizing?

## Further Reading

- Gregg, Brendan. *Systems Performance*. 2nd ed., Addison-Wesley, 2020.
- Goldratt, Eliyahu. *The Goal*, 1984 — the theory of constraints, where the idea of a bottleneck
  comes from.
