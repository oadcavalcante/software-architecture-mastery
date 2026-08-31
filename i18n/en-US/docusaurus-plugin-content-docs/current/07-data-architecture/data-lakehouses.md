---
id: data-lakehouses
title: Data Lakehouses
sidebar_position: 11
description: Transactions and schemas over files in cheap storage — the convergence and its limits.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates the lakehouse by what the transactional layer actually
  delivers, without treating it as a universal replacement.
prerequisites: [data-lakes]
related: [data-warehouses, column-stores, data-partitioning]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Lakehouses

## Overview

A lakehouse adds, on top of a [data lake's](/07-data-architecture/data-lakes.md) files, a layer that
brings transactions, a declared schema and controlled evolution.

The goal is to have a [warehouse's](/07-data-architecture/data-warehouses.md) guarantees with object
storage's cost and openness.

The architecture is real and solves concrete problems. It is not, however, a universal replacement —
and the marketing around the term obscures limits that matter in the choice.

## Problem

A [lake](/07-data-architecture/data-lakes.md) and a [warehouse](/07-data-architecture/data-warehouses.md)
cover different needs, and maintaining both means duplicating data, duplicating transformations and
living with divergent numbers between them.

The lake has low cost and no guarantees. The warehouse has guarantees and a high cost, with data locked
into a proprietary format.

The lakehouse tries to occupy the middle: open files in cheap storage, with a metadata layer that records
which files make up the table's current version.

## Core Concepts

### The mechanism is a version log

The transactional layer works by keeping a log: each operation records which files were added and
removed.

```text
version 1   files [a, b, c]
version 2   + [d]        → [a, b, c, d]
version 3   - [b] + [e]  → [a, c, d, e]
```

Reading the table is reading the log to know which files are valid now. Writing is adding an entry.

From that the properties follow:

**Atomicity.** The write is only visible when the entry is recorded. A process that fails midway does not
leave partial data visible — the most common problem of pure lakes.

**Stable reads.** A long query reads a fixed version and does not see concurrent writes.

**Time travel.** Querying how the table looked at any earlier version.

### Updating and deleting rows

In a pure lake, changing a row means rewriting the whole file. That makes corrections and
regulation-driven deletions operationally difficult.

Lakehouse formats support changing and deleting records, rewriting only the affected files.

That capability is what resolves the conflict between a lake and personal data protection, and on its own
it justifies the adoption in many cases.

### Controlled schema evolution

Adding a column, renaming, changing a type — with the history remaining readable.

It is the difference between a declared and an implicit schema: the format knows that column has existed
since version 12, and old readers do not break.

### Time travel has a retention cost

Keeping earlier versions allows auditing, comparing and reverting — and keeps the old files occupying
space.

With no version expiry policy, the storage cost grows indefinitely. And the cleanup is irreversible:
expiring versions erases the possibility of going back to them.

Defining the version retention window is an explicit decision, and frequently forgotten until the bill
arrives.

### Where the warehouse still wins

Being specific, because the comparison is usually made superficially:

**Interactive query latency.** Mature warehouses remain faster on small, concurrent queries, because they
do not pay for reading distributed metadata.

**Write concurrency.** Many simultaneous writers on the same table generate conflicts in the log and
retries.

**Tooling and governance.** Column- and row-level access control, auditing and an integrated catalog are
more mature in warehouses.

**Automatic optimization.** Compaction and ordering require explicit processes in the lakehouse.

### Maintenance is explicit

Compacting small files, expiring versions, physically reordering data, updating statistics.

None of that happens on its own. A lakehouse with no maintenance routines degrades the same way a lake
does — and the diagnosis is the same: queries get slow with no change in volume.

## Mental Model

**A lakehouse is a lake with a transaction log.** Everything extra it delivers comes from that, and
everything missing is what a log does not solve.

## When to Use

- A lake already exists and transactional guarantees are missing.
- Records have to be changed or deleted — regulation, corrections.
- Keeping a separate lake and warehouse is costing duplication.
- High volume with a relevant storage cost.
- An open format is a requirement, for portability.
- Analytical and data science workloads over the same data.

## When Not to Use

**For a transactional workload.** It is not an operational database.

**For very low latency, high concurrency interactive queries.**

**With many simultaneous writers on the same table.**

**When an existing warehouse serves well.** Migrating for architecture's sake is cost with no return.

**With no maintenance routines.**

**When the volume is small.** A relational database solves it.

## Alternatives

- **[Warehouse](/07-data-architecture/data-warehouses.md)** — when the tooling and the latency matter
  more than the cost.
- **A [lake](/07-data-architecture/data-lakes.md) with discipline** — a catalog and a columnar format
  cover part of the cases.
- **A warehouse with external tables** — querying the lake's files without moving them.
- **Keeping both** — legitimate when the workloads are genuinely distinct.

## Trade-offs

| Lakehouse | Warehouse |
|---|---|
| Open format | Frequently proprietary |
| Low storage cost | Higher |
| Explicit maintenance | Automatic |
| Higher interactive latency | Lower |
| Limited write concurrency | High |
| Governance to build | Mature |

| Lakehouse | Pure lake |
|---|---|
| Atomic writes | Partial state visible |
| Updates and deletes | Rewriting files |
| Declared schema | Implicit |
| Time travel | No versioning |
| Metadata to maintain | None |

## Failure Modes

**Small files.** With no compaction, it degrades.

**Old versions accumulating.** Growing cost.

**Write conflicts.** Concurrent writers failing and retrying.

**Large metadata.** The log grows and reading becomes slow.

**A query with no partition filter.** It scans everything.

**Version expiry erasing what was needed.** Irreversible.

## Common Mistakes

**Not scheduling compaction.** Frequent writes produce many small files, and each query starts paying to
open and read the metadata of thousands of them. Performance falls continuously with nothing having
changed in the query.

**Not defining version retention.** The history that allows querying the past grows indefinitely, and the
storage cost becomes a rising line nobody can explain.

**Expecting warehouse performance on interactive queries.** Reading from files in object storage has a
startup latency a warehouse does not have. For a dashboard with a filter the user changes, the difference
is noticeable.

**Migrating everything at once.** The business definitions embedded in the old loads only surface when a
number diverges from the report the executives already know — and then the whole migration loses
credibility.

**Too many writers on the same table.** The concurrency control is optimistic: simultaneous writes to the
same partition conflict and one of them is rejected. With too many writers, the rework starts dominating.

**Treating it as a replacement for a transactional database.** Transactions in the table format cover the
analytical workload, not thousands of small, concurrent writes per second with low-latency reads.

## Real-World Example

A media company kept a lake for raw audience data and a warehouse for commercial reports.

The cost of the duplication was visible: the same transformations written twice, numbers diverging
between the platforms, and a recurring complaint that "the report does not match the dashboard".

The migration to a lakehouse was done per domain, over fourteen months.

Gains:

**A single source.** The divergences between platforms disappeared, because there came to be only one
table.

**Regulation-driven deletion.** Deletion requests became executable — previously they required rewriting
whole partitions of the lake, a manual process that took days.

**Storage cost** dropped 60% relative to the warehouse.

**Time travel** allowed auditing number changes, resolving a whole class of disputes.

Problems:

**Interactive queries.** The commercial dashboard, with dozens of simultaneous users making small
queries, became 3 times slower. The solution was keeping an aggregated serving layer in the warehouse —
that is, both continued to exist, with clearer roles.

**Unscheduled maintenance.** In the first two months nobody configured compaction. Queries degraded
progressively and the diagnosis took weeks, because the data volume had not changed.

**Version cost.** Time travel was at a default 30-day retention over high-churn tables. The storage of
old versions came to exceed that of the current data before anyone reviewed it.

The initial expectation was to replace the warehouse. The result was redividing responsibilities —
lakehouse as the single source and processing layer, warehouse as the serving layer for interactive
queries.

Trying to eliminate one of the platforms was the wrong goal.

## Related Concepts

- [Data Lake](/07-data-architecture/data-lakes.md) — the foundation.
- [Data Warehouse](/07-data-architecture/data-warehouses.md) — the comparison.
- [Columnar](/07-data-architecture/column-stores.md) — the files' format.
- [Data Partitioning](/07-data-architecture/data-partitioning.md).

## Practical Exercise

If you have a lake and a warehouse, list the transformations that exist in both. Each duplicate is a
potential source of divergence.

Then ask: how many times in the last year did someone have to explain why two numbers did not match?

## Interview Questions

- How does the transaction log produce atomicity and time travel?
- What does a warehouse still do better?
- What maintenance does a lakehouse require and what happens without it?

## Further Reading

- Armbrust, Michael et al. *Lakehouse: A New Generation of Open Platforms*. CIDR, 2021.
- Armbrust, Michael et al. *Delta Lake: High-Performance ACID Table Storage*. VLDB, 2020.
- Dehghani, Zhamak. *Data Mesh*. O'Reilly, 2022.
