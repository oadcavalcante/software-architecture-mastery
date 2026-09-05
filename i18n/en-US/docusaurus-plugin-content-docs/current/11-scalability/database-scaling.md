---
id: database-scaling
title: Database Scaling
sidebar_position: 10
description: Most systems' real bottleneck — and the escalation order that avoids distributing too early.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader follows a database escalation order, exhausting the cheap
  options before the expensive ones.
prerequisites: [scalability]
related: [scaling-replication, scaling-partitioning, hotspots]
canonical_for: []
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Database Scaling

## Overview

The database is most systems' real bottleneck, and the hardest component to scale — because it is where the
state lives, and state does not multiply for free.

There is an escalation order, from cheapest to most expensive. Following it avoids this section's costliest
decision: **distributing the database before it is necessary**.

## Problem

When the system gets slow and the database appears as the limiting factor, the discussion jumps to
partitioning — the most expensive and most irreversible solution available.

Before it there is a sequence of interventions that, together, usually deliver one or two orders of
magnitude. Each one costs days or weeks; partitioning costs months and permanent complexity.

The problem is not partitioning. It is the order.

## Core Concepts

### The escalation ladder

From cheapest to most expensive:

```text
1. indexes and queries      days — the most frequent gain
2. connection pooling       days — resolves saturation from concurrency
3. caching                  weeks — removes repeated reads
4. a bigger machine         hours — buys time with no complexity
5. a read replica           weeks — separates reads from writes
6. separating workloads     weeks — analytics leaves the transactional side
7. archiving cold data      weeks — smaller tables, everything faster
8. partitioning tables      weeks — inside the same database
9. splitting by domain      months — separate databases per context
10. partitioning across nodes  months — the last option
```

The rule: **do not skip rungs**. Each one resolves a different class of problem, and rung 10 does not fix
what rung 1 would resolve.

The characteristic mistake is going from 1 straight to 10, because 10 is what appears at conferences.

### Reads and writes have different limits

```text
reads    scale well — replicas, caches. A high limit.
writes   scale badly — they have to go to the primary. A low limit.
```

Most systems have a ratio of 10 to 1 or more in favor of reads. That means replicas and caches resolve most
of the problem.

When the bottleneck is genuinely on writes, the options shrink: partition, or reduce the writes — in
batches, asynchronously, or by eliminating what is not necessary.

Distinguishing the two cases before deciding is what avoids building the wrong solution.

### Connections saturate before CPU

The most common bottleneck and the least suspected.

Each connection consumes memory and a process or thread in the database. The practical limit is a few
hundred — far below what a horizontally scaled application layer will open.

See [horizontal scaling](/11-scalability/horizontal-scaling.md) and Little's law in
[performance versus scalability](/11-scalability/performance-vs-scalability.md).

A **connection pooler** multiplexes many application connections into few database ones. It is one of the
interventions with the best effort-to-result ratio, and it frequently arrives late.

### Write contention is not resolved by capacity

When many transactions contend for the same record, they serialize — regardless of CPU, memory or number of
replicas.

```text
an account balance         every transaction updates the same row
a popular product's stock  the same
an aggregate counter       the same
```

The ways out are in the model, not in the infrastructure:

**A relative operation** instead of read-compute-write.

**Partial counters** summed at read time.

**A ledger of movements** with the balance derived.

**A queue** that deliberately serializes, with batch processing.

See [hotspots](/11-scalability/hotspots.md) and [transactions](/07-data-architecture/transactions.md).

### Cold data weighs on everything

Large tables degrade indexes, statistics, maintenance and backups — even if the old data is never queried.

Archiving what is not accessed is one of the most underestimated interventions: a table that shrinks 80%
gets faster at everything, with no architectural change at all.

See [data partitioning](/07-data-architecture/data-partitioning.md) — dropping a partition makes archiving
a metadata operation.

### Splitting by domain before partitioning

If the single database is at its limit, separating by context — orders in one database, catalog in another
— is usually simpler than partitioning.

Gains: each database gets smaller, scales independently, and the boundary follows the domain, which is a
division that already exists.

Cost: queries that cross the two stop existing, and consistency between them becomes an application
problem. See [data ownership](/07-data-architecture/data-ownership.md).

It is rung 9, and it resolves many cases that would be taken to 10.

## Mental Model

**Scale the database from the bottom up.** The rung that resolves your problem is almost always lower than
the discussion suggests.

## When to Use

Each rung has its moment:

- **1 to 3:** always, before anything else.
- **4:** when the machine has headroom available.
- **5:** when reads dominate and tolerate lag.
- **6:** when there is analytical load mixed in.
- **7:** when there is old, rarely accessed data.
- **8 to 10:** when the previous ones have been exhausted and measured.

## When Not to Use

**Partitioning before exhausting the previous rungs.**

**A read replica for an operation that requires up-to-the-instant data.**

**Caching with no invalidation strategy.** See [caching for scale](/11-scalability/scaling-cache.md).

**More capacity for write contention.**

**Splitting by domain when the boundary does not exist** in the business.

**Increasing the connection pool** with no pooler — it makes the contention in the database worse.

## Alternatives

- **Reducing the writes** — batching, making them asynchronous, eliminating the unnecessary ones.
- **[Distributed CQRS](/06-distributed-systems/distributed-cqrs.md)** — a separate read model.
- **Appropriate storage per workload** — search in an inverted index, time series in a database of their
  own. See [NoSQL](/07-data-architecture/nosql.md).
- **A distributed relational database** — it keeps the model and distributes the writes, at the cost of
  coordination latency.

## Trade-offs

| A read replica | Partitioning |
|---|---|
| Scales reads | Scales writes and reads |
| Eventual consistency | Strong per partition |
| Configuration | A redesign |
| Reversible | Practically irreversible |

| Splitting by domain | Partitioning |
|---|---|
| The boundary already exists | Artificial |
| Cross queries disappear | Preserved within the partition |
| Each database scales alone | Uniform scaling |

## Failure Modes

**Connections exhausted with idle CPU.**

**A lagging replica serving stale data.** See
[replication for scale](/11-scalability/scaling-replication.md).

**Contention on a hot record.**

**Partitioning with the wrong key.** Redistributing requires rewriting everything.

**A query crossing partitions.** What was one query becomes N plus aggregation.

**A long transaction holding resources.**

**Maintenance not keeping up.** Stale statistics produce bad plans.

## Common Mistakes

**Jumping to partitioning.** An appropriate index, a read replica and a query fix resolve most cases.
Partitioning prevents joins and transactions across partitions — a permanent cost for a limit that may not
have arrived.

**Not using a connection pooler.** Each connection consumes memory in the database, and application
instances multiply their number. The connection limit is usually reached well before the CPU limit.

**Not separating the analytical load.** A query that scans months competes for memory and disk with
business-hours transactions, and it is the most frequent cause of unexplained intermittent slowness.

**Not archiving cold data.** Tables that grow forever degrade indexing, backup and restore. Moving the
history nobody queries usually returns more per engineering week than any other rung, when the table grows
with no retention policy and the indexes have stopped fitting in memory.

**Choosing a partition key without analyzing the query pattern.** If the key does not appear in the
frequent queries, each one has to ask every partition — and the partitioning has worsened the performance
it was supposed to improve.

**Treating write contention as a lack of capacity.** When thousands of transactions contend for the same
row, adding a machine does not help: the bottleneck is the lock, and the solution is changing the model.

## Real-World Example

A payments platform reached the database's limit: write latency rising, timeouts at peak hours, and the
proposal on the table was partitioning by merchant identifier — a project estimated at seven months.

The ladder was walked first:

**Rung 1 — queries.** Three queries accounted for 60% of the read load. Two had unnecessary joins; one was
missing a composite index. Fixed in four days. The read load fell 45%.

**Rung 2 — connections.** The instances demanded 1,100 connections against a 400 limit in the database:
the excess ones were refused, and the waiting queue sat in each application's pool. A connection pooler
reduced it to 180 real connections. The peak timeouts disappeared that same day.

**Rung 3 — caching.** Merchant data, read on every transaction and changed rarely, went to a cache with
event-based invalidation. 30% fewer reads.

**Rung 6 — separating workloads.** Reconciliation reports ran on the transactional database. Moved to a
dedicated replica.

**Rung 7 — archiving.** Transactions older than two years, never queried by the operation, went to cold
storage. The main table shrank 70%, and the indexes fit in memory — which improved everything.

**Write contention.** Discovered in the middle of the process: the merchant's balance was updated with
read-compute-write on every transaction. Large merchants had dozens of concurrent transactions on the same
row. Replaced by a relative operation, with the detailed balance derived from a ledger of movements.

Result after ten weeks: write latency from 340 ms to 28 ms at peak, transactions per second quadrupled,
**with no partitioning**.

The partitioning plan was shelved with the design ready and a defined trigger: when write utilization
sustainably passes 60% for a month.

What the team learned: rungs 1 and 2, alone, resolved the incident that motivated the project — and they
cost one week. The seven-month proposal had been assembled with none of the measurements the ladder
requires.

## Related Concepts

- [Replication for Scale](/11-scalability/scaling-replication.md) and
  [Partitioning](/11-scalability/scaling-partitioning.md).
- [Hotspots](/11-scalability/hotspots.md) — the contention.
- [Indexing](/07-data-architecture/indexing.md) — rung 1.
- [OLTP](/07-data-architecture/oltp.md) — separating workloads.

## Practical Exercise

Walk the ladder with your database: how many rungs have you already climbed, and what is the next one?

If the discussion in your team is at rung 10 and you have not passed rung 2, a connection pooler probably
resolves this week's problem.

## Interview Questions

- Why do connections saturate before CPU?
- Why is write contention not resolved by capacity?
- Why is splitting by domain usually preferable to partitioning?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Botros, Silvia; Tinley, Jeremy. *High Performance MySQL*. 4th ed. O'Reilly, 2021.
- Winand, Markus. *SQL Performance Explained*, 2012.
