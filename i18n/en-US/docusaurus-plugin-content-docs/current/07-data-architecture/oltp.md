---
id: oltp
title: OLTP
sidebar_position: 7
description: Transactional workload — many small operations over few records, with low latency.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes an OLTP workload's signature and avoids
  contaminating it with analytical queries.
prerequisites: [data-architecture]
related: [olap, indexing, transactions]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# OLTP

## Overview

OLTP — online transaction processing — describes the workload characteristic of an operational
system: **many small operations, each touching few records, with a requirement for low latency and
consistency**.

Registering a customer, recording an order, debiting a balance, looking up your own statement. There
are thousands per second, each reading or writing units of records.

That signature determines the data model, the index, the storage and the scaling strategy.
Recognizing it is the first step of any decision in this section.

## Problem

The problem is not implementing OLTP — nearly every system starts that way, and relational databases
serve that workload very well.

The problem is what happens when a workload with the opposite profile starts sharing the same store.
A report that scans the entire orders table runs alongside the transactions and competes for the same
resources.

The symptom is well known: the system gets slow at month end, at closing time, or whenever someone
opens a certain dashboard. And the typical reaction — a bigger machine — treats the symptom and not
the cause.

## Core Concepts

### The signature

An OLTP workload has characteristics that appear together:

```text
operation volume        high (thousands/s)
records per operation   few (units to tens)
access                  by key or a selective index
proportion              significant writes
required latency        milliseconds
data                    the current state
consistency             generally strong
```

When one of those departs from the pattern — an operation that scans millions of rows, or that
tolerates seconds of latency — it is worth asking whether that is really OLTP.

### The normalized model serves it well

For that signature, [normalization](/07-data-architecture/normalization.md) is adequate: the
operations touch few records, so the cost of joins is low, and avoiding duplication eliminates a
class of inconsistency.

It is the inverse of what [OLAP](/07-data-architecture/olap.md) needs, and it is why the two models
diverge.

### An index is the difference between milliseconds and seconds

Since the access is selective — fetching one order, a customer's orders — an adequate
[index](/07-data-architecture/indexing.md) is what keeps the latency.

Without it, each operation scans the table, and the degradation is proportional to the data's growth:
the system works well for months and gets worse on its own.

### Concurrent writes are the real bottleneck

Unlike OLAP, OLTP writes a lot. That brings contention: two operations on the same record serialize.

That is why [transactions](/07-data-architecture/transactions.md) and isolation levels matter here and
barely matter in analytics. And why the bottleneck in a mature OLTP system is rarely CPU — it is
locking, index contention and write latency.

### Separating the workloads is the decision that solves it

The architectural answer to "the report takes down the system" is not to optimize the report. It is
to move it out.

A [read replica](/07-data-architecture/data-replication.md), a separate analytical store, or a
projection — any of them removes the competition.

Keeping both workloads in the same place for simplicity works up to a certain volume, and the moment
to separate arrives sooner than most teams expect.

### The bottleneck changes as the system matures

The dominant cause of slowness in an OLTP workload is not the same over time, and always treating the
same suspect is what makes diagnoses take long.

**A new system.** Missing indexes. Almost always.

**A growing system.** Queries that were cheap with a thousand rows stop being so, and execution plans
change as the statistics change.

**A mature system under load.** Contention — locks on hot records, long transactions, exhausted
connections.

**A mature system with mixed workloads.** Competition between operations and analytics.

There is also a final stage, less common: when the volume of concurrent writes to the same entity
exceeds what a single node can serialize. There the answer is redesigning the model to distribute the
contention — splitting a single counter into several partial ones summed on read, for example — and
not switching storage.

The progression matters because the answer is different at each stage: index, query review,
concurrency redesign and workload separation, respectively. Increasing the machine only clearly helps
at the second stage, and it is the answer applied at all of them.

## Mental Model

**OLTP is about many small operations with tight latency.** Everything else — model, index, isolation
— follows from that.

## When to Use

- The system records and queries the business's current state.
- The operations touch few identified records.
- There are relevant concurrent writes.
- The latency has to be milliseconds.
- Consistency matters for the operation.

## When Not to Use

**For reports and analysis.** See [OLAP](/07-data-architecture/olap.md) — the workload is opposite in
every dimension.

**For scanning large volumes.** Aggregations over the entire history.

**For bulk export.** It will compete with the operation.

**As the only store when there is already a relevant analytical workload.** The separation has
stopped being optional.

## Alternatives

- **[OLAP](/07-data-architecture/olap.md)** — for the analytical workload.
- **Read replica** — a cheap separation, the same model.
- **[CQRS](/03-design-patterns/cqrs.md)** — separate models.
- **Cache** — for repeated reads of hot data.

## Trade-offs

| OLTP | OLAP |
|---|---|
| Many small operations | Few large operations |
| Access by key | Scan |
| Significant writes | Predominantly reads |
| Normalized | Denormalized |
| Current state | History |
| Millisecond latency | Seconds to minutes acceptable |
| Row-oriented | Frequently columnar |

## Failure Modes

**Analytical contamination.** A heavy report degrades the whole operation.

**Degradation from growth.** A missing index shows up when the volume grows.

**Write contention.** Hot records serialize operations.

**A long transaction.** It holds locks and stalls the rest.

**Too many indexes.** Each index is a write cost; an excess degrades what it was meant to speed up.

## Common Mistakes

**Running reports on the transactional database.** It is the most common cause of unexplained
slowness during business hours, and the easiest to rule out: just look at which long queries run at
peak.

**Not separating the workloads until the system goes down.** The separation is cheap when planned and
expensive when done during an incident, with the report already being demanded by the executives.

**Creating an index for every slow query without evaluating the write cost.** Each index is updated on
every insert and update. A table with fifteen indexes has slow writes, and the next problem is blamed
on the database, not on the decision that caused it.

**Keeping a transaction open during an external call.** The transaction holds locks for the duration
of a third party's response — which can be the whole timeout. It is how external slowness becomes
internal stalling.

**Choosing storage by reputation instead of by the access pattern.** What decides is the shape of the
queries and the need for transactions, not the product's popularity in the year of the choice.

## Real-World Example

An order management system degraded on the 1st of every month. The slowdowns lasted two to three
hours, with response time rising from 80 ms to 4 seconds.

The cause was found quickly: the monthly close triggered reports that scanned the complete orders
table — 400 million rows — while the system operated.

The first reaction was to increase the machine. It helped for two months, until the volume grew
again.

What solved it was separating the workloads.

**A read replica** for the reports, with a lag of seconds — irrelevant for a monthly close.

**Columnar storage** for the three heaviest reports, loaded daily. What took 40 minutes came to take
90 seconds, because the workload was analytical and had finally landed in an analytical store.

**A query time limit** on the transactional database. Any query above 5 seconds is interrupted. That
broke two internal reports, which was the point — they should not have been there.

The team records that the most expensive part was the time between the first incident and the correct
diagnosis: nearly a year treating the problem as a lack of capacity, when it was mixed workloads.

## Related Concepts

- [OLAP](/07-data-architecture/olap.md) — the opposite workload.
- [Indexing](/07-data-architecture/indexing.md) — what sustains the latency.
- [Transactions](/07-data-architecture/transactions.md) — isolation and contention.
- [Normalization](/07-data-architecture/normalization.md) — the adequate model.

## Practical Exercise

List the five slowest queries in your transactional database. For each one, classify: is it OLTP —
few records by key — or analytics in disguise?

The analytical ones do not belong there, and moving them usually yields more than any optimization.

## Interview Questions

- What is an OLTP workload's signature?
- Why does normalization serve OLTP and hurt OLAP?
- What is the typical bottleneck in a mature OLTP system?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 3.
- Gray, Jim; Reuter, Andreas. *Transaction Processing*. Morgan Kaufmann, 1992.
- Winand, Markus. *SQL Performance Explained*, 2012.
