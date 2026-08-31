---
id: relational-databases
title: Relational Databases
sidebar_position: 1
description: The default that remains the right choice in most cases — and where it genuinely does not serve.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader can justify relational as the default choice and
  identify the concrete cases in which another model is better.
prerequisites: [data-architecture]
related: [nosql, transactions, normalization]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Relational Databases

## Overview

The relational model organizes data into tables with a defined schema, and allows querying it through
a declarative language that describes **what** you want, not how to find it.

It is fifty years old, has survived several waves of replacement, and remains the correct choice for
most systems.

This document defends that position and delimits where it does not hold — because "relational by
default" is only a good rule when accompanied by the cases in which you abandon the rule.

## Problem

The question "which database should we use?" is usually answered by familiarity or by trend, and both
produce bad choices.

The correct choice comes from the access pattern: how the data is written, how it is read, in what
volume, with what consistency requirement.

Relational is the reasonable default because it serves a very wide range of those patterns well — and
because it errs cheaply when you discover you needed something else.

## Core Concepts

### What it delivers that the others do not deliver together

None of those properties is exclusive. What distinguishes relational is having them all at the same
time, mature:

**Transactions with strong guarantees.** See [transactions](/07-data-architecture/transactions.md).

**Declarative queries with an optimizer.** You describe the result; the database decides the plan.
That means the same code stays efficient when the volume or the data distribution changes.

**Constraints in the store.** Foreign key, uniqueness, check. The rule holds for every writer,
including one-off scripts and manual corrections.

**Unforeseen queries.** The normalized model allows questions that were not anticipated during
modeling. Models optimized for one access pattern do not.

The fourth is the most underestimated. Most of the questions a system will answer in five years are
not known today.

### A rigid schema is an operational advantage

The common criticism is that the schema slows down evolution. What rarely enters the calculation is
the other side: with no schema, validation migrates to the application — and to **every** application
that writes.

One correction script or one legacy service is enough to introduce inconsistent records, which will
only be discovered when read, months later.

The schema is the only point where the rule holds for everyone.

### Vertical scaling goes further than assumed

The argument that relational does not scale is from an era with different hardware. A modern instance
holds tens of terabytes and tens of thousands of transactions per second.

Most systems that abandon relational for scale never came close to that limit — and frequently the
problem was an [index](/07-data-architecture/indexing.md) or mixed workloads.

### Where it genuinely does not serve

Being specific, because the list is short:

**Globally distributed writes.** Multiple regions accepting writes for the same data. See
[PACELC](/06-distributed-systems/pacelc.md).

**Extreme volume of simple writes.** Telemetry, events, time series at millions per second.

**Deep relationship traversal.** Queries of several levels of depth. See
[graph databases](/07-data-architecture/graph-databases.md).

**Documents with genuinely variable structure.** When there is no common schema.

**Large-scale analytics.** See [columnar](/07-data-architecture/column-stores.md).

**Full-text search with relevance.** An inverted index solves it; relational does not.

### A system can use more than one

The decision is not global. A system can have its transactional core in relational, search in an
inverted index and telemetry in a time series store.

The cost is operational — more technologies to know, monitor and recover — and it is frequently worth
it. The error is adopting several without each one solving a concrete problem.

## Mental Model

**Relational is the default you give up with a justification, not the option you choose by
comparison.**

## When to Use

- The data has a stable structure and relationships.
- Transactions with multiple records have to be atomic.
- Unforeseen queries will be necessary.
- Referential integrity matters.
- The volume fits on one instance — which is more than you imagine.
- There is no specific reason for something else.

## When Not to Use

**Globally distributed writes active in several regions.**

**Massive ingestion of events or time series.**

**Deep graph traversal.**

**Documents with no common schema.**

**Analytics over billions of rows.**

**Full-text search with relevance.**

**Cache.** A relational database as a cache is a waste; use a
[key-value](/07-data-architecture/key-value-databases.md) store.

## Alternatives

- **[Document](/07-data-architecture/document-databases.md)** — aggregates read whole.
- **[Key-value](/07-data-architecture/key-value-databases.md)** — access by key, very high throughput.
- **[Columnar](/07-data-architecture/column-stores.md)** — analytics.
- **[Graph](/07-data-architecture/graph-databases.md)** — relationships as first class.
- **Time series** — metrics and telemetry.
- **Distributed relational** — keeps the model and distributes the writes, at the cost of coordination
  latency.

## Trade-offs

| Relational | Non-relational |
|---|---|
| Transactions across records | Generally per record |
| Guaranteed schema | Validation in the application |
| Unforeseen queries | Optimized for the foreseen |
| Integrity in the store | In the code |
| Vertical scaling, distributing is expensive | Native horizontal scaling |
| Mature tooling | Varies |
| Efficient joins | Frequently absent |

## Failure Modes

**A slow query from a missing index.** The most common cause, and the one most confused with a scale
limit.

**Contention on a hot record.**

**A schema migration locking the table.** On large tables, a badly planned change causes
unavailability.

**Exhausted connections.** The connection limit is usually reached before any data limit.

**A long transaction holding locks.**

**A join over analytical volume.** The wrong workload in the wrong place.

## Common Mistakes

**Abandoning it for scale without having measured the real limit.**

**Not using constraints** — foreign keys and uniqueness — and reimplementing them in the application,
worse.

**Altering a large table's schema with no strategy.**

**Storing an unstructured document in a text column** and querying by content.

**Using it as a queue.** It works at low volume and degrades with contention; there is a tool for that.

## Real-World Example

A logistics company migrated the tracking core from a relational database to a document one, motivated
by "relational does not scale".

The system had 80 million shipment records and 3 thousand operations per second at peak.

The migration took seven months. The results:

**Performance.** Practically the same. The original bottleneck was three queries with no adequate
index, which the later audit confirmed.

**Integrity.** With no foreign keys, orphan references started appearing — shipments pointing to
deleted routes. In eight months, about 12 thousand inconsistent records, fixed by script.

**Reports.** The queries that cross-referenced shipment, route and customer became much harder. Two
were rewritten as batch processing, and what was a query became code.

**Transactions.** The operation of transferring a shipment between routes touched three documents.
With no transaction, they had to implement a [saga](/06-distributed-systems/sagas.md) with
compensation — for an operation that was a three-line transaction.

Two years later, the transactional core went back to relational. What stayed in the document store was
the tracking event history — data with variable structure, written once, read by key. There the model
is adequate.

The lesson that stuck: the decision was made from a premise nobody had verified. One day of query plan
analysis would have avoided seven months of migration.

## Related Concepts

- [NoSQL](/07-data-architecture/nosql.md) — the term and what it hides.
- [Transactions](/07-data-architecture/transactions.md) — the main guarantee.
- [Normalization](/07-data-architecture/normalization.md) — the model.
- [Indexing](/07-data-architecture/indexing.md) — what is usually the real problem.

## Practical Exercise

If someone on your team argues for leaving relational because of scale, ask for the number: which
metric is at its limit, and what the limit is.

If the answer does not exist, the next step is analyzing the plans of the slow queries — not choosing
another database.

## Interview Questions

- What does relational deliver that other models do not deliver simultaneously?
- Why is a rigid schema an operational advantage?
- Which concrete cases justify leaving relational?

## Further Reading

- Codd, E. F. *A Relational Model of Data for Large Shared Data Banks*. CACM, 1970.
- Winand, Markus. *SQL Performance Explained*, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 2.
