---
id: data-partitioning
title: Data Partitioning
sidebar_position: 17
description: Splitting the table so queries read less and maintenance becomes viable.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses a partition key by the query pattern and
  recognizes when partitioning makes things worse instead of better.
prerequisites: [data-architecture]
related: [data-replication, indexing, data-lifecycle]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Partitioning

## Overview

Partitioning is splitting a large table into smaller parts according to a key, so that queries read
only the relevant parts.

The distributed fundamentals are in
[partitioning](/06-distributed-systems/partitioning.md). Here the focus is its use within one store:
the benefit that almost always pays off is not query performance — it is **maintenance**.

## Problem

Large tables create problems that are not about queries:

**Deleting old data** locks the table for hours and generates an enormous volume of transaction log.

**Rebuilding an index** requires a maintenance window that does not exist.

**Altering the schema** becomes a risky operation.

**Statistics** become imprecise, and the optimizer chooses bad plans.

Partitioning solves all four, because each operation comes to act on one partition.

## Core Concepts

### Partition pruning is the query gain

If the query filters by the partition key, the database ignores the other partitions without reading
them.

```sql
-- partitioned by month on sale_date
SELECT SUM(amount) FROM sales WHERE sale_date >= '2025-01-01'
```

Twelve partitions read instead of sixty. The gain is proportional to the fraction pruned.

And the condition is strict: **the query has to filter by the partition key**. A query that filters by
customer on a table partitioned by date reads every partition — and becomes slower than the
unpartitioned table, because now there are sixty accesses instead of one.

That is the point that decides whether partitioning helps or hurts.

### Deleting by partition is instantaneous

The most reliable benefit and the least cited.

Deleting six months of data from a large table is an hours-long operation, with locking and transaction
log growth.

Dropping a partition is a metadata operation — milliseconds, no locking, no growth.

For any table with a retention policy, that alone justifies partitioning by time. See
[data lifecycle](/07-data-architecture/data-lifecycle.md).

### The strategies

**By range.** Typically time. It is the most common and the one that serves retention.

**By list.** Discrete values — region, country, type. Good when the queries always filter by that
dimension.

**By hash.** Distributes uniformly. It eliminates concentration and **eliminates partition pruning** for
range queries, because nearby values land in different partitions.

The choice between range and hash is between being able to prune partitions and distributing the load
uniformly. You rarely get both.

### Partitioning has to be created in advance

A table partitioned by month needs next month's partition to exist before the 1st.

The failure mode is predictable and happens frequently: nobody automated the creation, the partition
does not exist, and every insert fails at midnight.

Automating creation months in advance is the first operational item for any partitioned table.

### The partition key in a unique index has a cost

In several databases, a unique index on a partitioned table has to include the partition key.

That means guaranteeing global uniqueness of a field — a document number, for example — may not be
possible if the table is partitioned by something else.

It is a constraint that usually appears late, after the model is defined.

### Too many partitions also cost

Each partition has metadata overhead, and the planner has to evaluate them.

Thousands of partitions degrade query planning time, sometimes to the point of dominating the execution
time.

Partitioning by day with seven years of retention gives 2,500 partitions — generally too many. By month
gives 84, which is comfortable.

## Mental Model

**Partitioning only helps the query that filters by the key.** For all the others, it adds cost.

## When to Use

- The table is large and grows continuously.
- There is a retention policy — deleting by partition is the decisive gain.
- The queries consistently filter by one dimension.
- Maintaining the whole table is already unviable.
- Old data can move to cheaper storage.

## When Not to Use

**When the queries do not filter by the key.** It makes things worse.

**On a small table.** Complexity with no return.

**With no partition creation automation.**

**When there is no natural partition dimension.**

**With granularity that is too fine.**

**To solve a slow query.** Check the [index](/07-data-architecture/indexing.md) first — it is the most
likely cause.

## Alternatives

- **An adequate [index](/07-data-architecture/indexing.md)** — it solves most slow query cases.
- **Periodic archiving** — moving old data to another table.
- **[Columnar](/07-data-architecture/column-stores.md)** — block skipping by minimum and maximum value,
  with no partitioning.
- **Deleting in small batches** — it solves the retention problem without partitioning, at the cost of a
  continuous process.

## Trade-offs

| Partitioned | Single table |
|---|---|
| Pruning on filtered queries | An index for everything |
| Deleting is instantaneous | A long operation |
| Maintenance per partition | Of the whole table |
| Unfiltered queries slower | Uniform |
| Limited uniqueness constraints | No constraint |
| Additional operations | None |

| By range | By hash |
|---|---|
| Pruning on period queries | No pruning |
| Trivial retention | Difficult |
| Risk of a hot partition | Uniform distribution |

## Failure Modes

**A missing future partition.** Inserts fail at the turn of the period.

**A query with no partition filter.** It reads all of them.

**A hot partition.** The current month receives all the writes.

**Too many partitions.** Planning dominates the time.

**Uniqueness impossible.** The constraint would have to cross partitions.

**Redistribution.** Changing the key requires rewriting everything.

## Common Mistakes

**Partitioning without checking the query pattern.**

**Not automating partition creation.**

**Granularity that is too fine.**

**Partitioning to solve an index problem.**

**Not considering the uniqueness constraint** before deciding the key.

## Real-World Example

An industrial monitoring system stored sensor readings: 8 billion rows, growing by 40 million per day,
with 3 years of retention.

Two problems dominated operations.

**Deleting old data.** The nightly process deleted readings older than 3 years. It took 5 hours,
generated 200 GB of transaction log and degraded the system while running.

**Index rebuilds.** Impossible — the necessary window did not exist.

Partitioning by month solved both:

**Dropping the old partition:** from 5 hours to under one second.

**Maintenance per partition**, each with a manageable volume.

**Period queries**, which are the majority, became 5 to 20 times faster through partition pruning.

Two problems appeared:

**A query by sensor with no period.** The diagnostics screen fetched a sensor's complete history with no
date filter. Before it read an index; afterwards it came to scan 36 partitions, and became **slower**.
Fixed by adding a default 30-day period filter in the interface — which, reviewed with the operators,
was what they wanted anyway.

**A partition not created.** In the third month, the 1st arrived with no partition. Ingestion stopped at
00:00 and was down for 40 minutes until someone understood. The automation came to create 6 months in
advance, with an alert if fewer than 3 remain.

The reading the team takes from it: the gain that justified the project was not query performance — it
was turning the daily deletion from a risky operation into metadata. The query gain came along and was
treated as a bonus.

## Related Concepts

- [Partitioning](/06-distributed-systems/partitioning.md) — the fundamentals.
- [Indexing](/07-data-architecture/indexing.md) — check first.
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md) — retention.
- [Data Replication](/07-data-architecture/data-replication.md).

## Practical Exercise

Take the largest table in your database and answer: how is old data deleted today, and how long does
that operation take?

If the answer is "it is not deleted", the table will grow forever — and that is a decision nobody made.

## Interview Questions

- Why can partitioning make a query slower?
- What is partitioning's most reliable benefit?
- What is the trade-off between partitioning by range and by hash?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 6.
- Winand, Markus. *SQL Performance Explained*, 2012.
- Botros, Silvia; Tinley, Jeremy. *High Performance MySQL*. 4th ed. O'Reilly, 2021.
