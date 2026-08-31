---
id: vertical-scaling
title: Vertical Scaling
sidebar_position: 1
description: A bigger machine — the right answer more often than the literature suggests.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader considers vertical scaling before horizontal and knows the
  real limit of a single machine today.
prerequisites: [scalability]
related: [horizontal-scaling, database-scaling, performance-vs-scalability]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Vertical Scaling

## Overview

Scaling vertically is using a bigger machine: more CPU, more memory, a faster disk.

It is treated as a naive solution, superseded by horizontal scaling. That reputation is out of date: a
modern instance holds hundreds of cores and terabytes of memory, and most systems never come close to that.

What vertical scaling delivers and horizontal does not: **the absence of coordination**. There is no
distributed consistency, no partitioning, no balancing and no consensus. And that absence is worth a lot.

## Problem

The scale discussion jumps straight to distribution, and with it comes a set of problems that did not
exist:

State needs to leave the process. Consistency becomes a decision. Ordering stops being guaranteed.
Diagnosis requires distributed tracing. Partial failure becomes a normal case. See
[distributed systems](/06-distributed-systems/index.md).

Each of those is permanent complexity, paid every day. Taking it on to serve a volume that would fit on a
bigger machine is a common bad deal.

## Core Concepts

### The limit is higher than intuition suggests

Reference numbers for commercially available instances:

```text
CPU      up to a few hundred cores
memory   up to several terabytes
disk     millions of operations per second on local storage
network  tens of gigabits per second
```

A relational database on a large instance sustains tens of thousands of transactions per second and tens of
terabytes.

Most systems that "need to scale" operate at a fraction of that — and the check of how far the system is
from the limit is rarely done before deciding to distribute.

### What you avoid by not distributing

It is worth enumerating, because it is the central argument:

**Consistency.** A local transaction resolves what, distributed, requires a
[saga](/06-distributed-systems/sagas.md) or coordination.

**Ordering.** Guaranteed inside one process.

**Diagnosis.** A profiler and a debugger answer questions that, distributed, require correlated tracing.

**Partial failure.** Either the process is alive, or it is not — with no "I don't know" state. See
[partial failure](/06-distributed-systems/partial-failure.md).

**Network latency between components.** Calls become function calls.

The engineering time saved is the most relevant item, and the least accounted for in cost comparisons.

### Where the ceiling actually appears

Vertical scaling stops for specific reasons, and recognizing them is what indicates the moment to change:

**Availability.** One machine is a single point. This is the most legitimate reason, and it is frequently
resolved with two machines — a primary and a replica — with no partitioning.

**Non-linear cost.** The larger instances cost disproportionately more. There is a point at which two
medium ones come out cheaper than one large one.

**A physical limit reached.** When the largest available type is not enough.

**A restart.** Changing size requires downtime. With one machine, that is unavailability.

**Internal contention.** Above a certain number of cores, the software itself may not scale — internal
locks, shared structures. Doubling the cores does not double the throughput.

The last is the one that surprises: not all software takes advantage of a very large machine.

### Vertical for the state, horizontal for the rest

The design that resolves most real cases:

```text
application layer   horizontal — stateless, easy to multiply
database            vertical — one large instance, with a replica
cache               horizontal or vertical, depending on the volume
```

That combines the best of both: the layer that scales easily scales horizontally; the layer where
coordination costs dearly stays single.

Distributing the database is this section's most expensive decision, and it is the one most frequently made
before it is necessary. See [database scaling](/11-scalability/database-scaling.md).

### Scaling vertically requires measuring first

Growing the machine without knowing which resource saturates is waste.

See [performance versus scalability](/11-scalability/performance-vs-scalability.md). If the bottleneck is a
query with no index, a bigger machine buys a few months and the problem comes back.

The sequence that works: identify the bottleneck, fix what is fixable, check how much of the machine's
capacity is being used, and only then consider growing.

## Mental Model

**Vertical buys time without buying complexity.** Before distributing, check how far you are from the
ceiling — it is usually further than the discussion presupposes.

## When to Use

- The system is far from the available machine's limit.
- The load is predictable and has no extreme peaks.
- The distributed complexity is not justified.
- The component is the database.
- The team is small.
- The urgency is immediate — growing the machine takes minutes; distributing takes months.

## When Not to Use

**When availability requires more than one machine.** One is a single point.

**When the physical limit has been reached.**

**When the cost is already disproportionate** relative to two medium machines.

**When the software does not take advantage** — internal contention above a certain size.

**Without measuring.** Growing without knowing what saturates.

**For peaks lasting minutes.** Resizing requires a restart.

## Alternatives

- **[Horizontal scaling](/11-scalability/horizontal-scaling.md)** — when the ceiling has been reached or
  availability requires it.
- **A read replica** — it distributes reads without partitioning. See
  [replication for scale](/11-scalability/scaling-replication.md).
- **Caching** — it reduces the load reaching the machine. See
  [caching for scale](/11-scalability/scaling-cache.md).
- **Asynchronous processing** — it takes work off the critical path. See
  [asynchronous processing](/11-scalability/async-processing.md).
- **Optimization** — frequently it returns more than any capacity increase.

## Trade-offs

| Vertical | Horizontal |
|---|---|
| No coordination | Coordination in everything |
| Trivial consistency | A decision to make |
| Simple diagnosis | Distributed tracing |
| A single point of failure | Failure tolerance |
| A physical ceiling | A contention ceiling |
| A restart to resize | No downtime |
| Non-linear cost at the top | Linear |

## Failure Modes

**The ceiling reached with no plan.** The largest type is not enough, and distributing takes months.

**A single point.** The machine goes down and the system with it.

**A restart to resize.** Planned unavailability.

**Disproportionate cost.** The large instance costs more than the distributed architecture.

**Software not taking advantage.** Idle cores from internal contention.

**An increase with no effect.** The bottleneck was a query, not capacity.

## Common Mistakes

**Discarding it by reputation.** "It does not scale" became a reflex, but a machine today holds hundreds of
gigabytes of memory and dozens of cores — more than most business systems will ever need.

**Not measuring how much of the capacity is in use.** Teams decide to distribute with the machine at 30%
utilization, because nobody looked at the number before designing the next architecture.

**Growing without identifying the bottleneck.** Doubling the CPU of a system limited by input and output
changes nothing, and the cost doubles.

**Having no plan for the ceiling.** Vertical scaling runs out, and reaching the largest instance type with
no plan leaves distribution as an emergency instead of a project.

**Ignoring that resizing requires downtime.** Changing the instance type usually requires a restart.
Discovering that on the day means an unagreed maintenance window.

**Distributing the database too early.** It is the whole system's most expensive decision to reverse: it
eliminates joins and transactions across partitions and contaminates every query.

## Real-World Example

A fleet management platform decided to migrate the database to a distributed architecture, with
partitioning by region. The project was estimated at eight months.

Before starting, the measurement of the existing database:

```text
CPU at peak               34%
memory in use             45% of 128 GB
disk operations           18% of the provisioned limit
connections               85 of 200
transactions per second   1,400, at peak
```

The database was operating at around a third of the instance's capacity — and it was not one of the largest
available.

The business growth projection, for three years, pointed at 4,000 transactions per second. An instance two
tiers up would sustain that comfortably.

The decision was to postpone the partitioning and do three things:

**A bigger instance**, with double the memory. It cost an 8-minute maintenance window.

**A read replica** for reports, which accounted for 40% of the load and did not need up-to-the-instant
data.

**Fixing two queries** that did full scans on large tables — which alone reduced peak CPU from 34% to 21%.

Three years later, with the projected volume reached, the database operates at 48% utilization. The
partitioning is still not necessary.

And what the team considers most relevant: in those three years, the team delivered features that were in
the queue. The partitioning project's eight months would have consumed most of the period's engineering
capacity.

Two complementary decisions were made at the time:

**A plan for the ceiling.** What would be done when utilization sustainably passed 70% was documented —
including the partitioning design, ready to be executed when necessary.

**A trend alert**, not only an absolute value one: if utilization grows at a rate that reaches 70% in less
than six months, the alert fires.

The recorded lesson: the decision to distribute had been made from a growth projection, with no measurement
at all of what the current infrastructure could handle. The missing calculation — how much of the machine
are we using — took an hour.

## Related Concepts

- [Horizontal Scaling](/11-scalability/horizontal-scaling.md) — the alternative.
- [Database Scaling](/11-scalability/database-scaling.md).
- [Performance versus Scalability](/11-scalability/performance-vs-scalability.md).
- [Cloud Compute](/09-cloud-architecture/cloud-compute.md).

## Practical Exercise

Find out the CPU, memory, disk and connection utilization of your most critical machine at the 95th
percentile over the last 30 days.

Compare with the next available instance size. If the headroom covers a two-year growth projection, the
discussion about distributing can wait.

## Interview Questions

- What does vertical scaling deliver that horizontal does not?
- What are the legitimate reasons for abandoning the vertical one?
- Why is distributing the database this area's most expensive decision?

## Further Reading

- Gunther, Neil. *Guerrilla Capacity Planning*. Springer, 2007.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Gregg, Brendan. *Systems Performance*. 2nd ed. Addison-Wesley, 2020.
