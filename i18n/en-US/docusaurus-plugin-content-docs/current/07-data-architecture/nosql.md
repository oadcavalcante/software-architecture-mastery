---
id: nosql
title: NoSQL
sidebar_position: 2
description: A term that groups technologies with nothing in common — and why using it gets in the way of the decision.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader replaces the question "SQL or NoSQL?" with questions about
  the access pattern, which is what actually decides.
prerequisites: [relational-databases]
related: [document-databases, key-value-databases, column-stores]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# NoSQL

## Overview

"NoSQL" does not describe a technology. It groups document, key-value, columnar, graph and time series
databases — which **have nothing in common** beyond not being relational.

A graph database and a key-value store are more different from each other than either is from a
relational database.

This document exists to take the term apart, because reasoning with it leads to bad decisions
systematically.

## Problem

The question "should we use SQL or NoSQL?" looks like a choice between two options.

It is, in fact, a choice between six or seven models with radically different properties, presented as
binary.

The practical effect: teams decide "let's go NoSQL", pick the best-known tool in the category and
discover months later that its model does not serve the access pattern they have.

The correct question is never about the category. It is about how the data is accessed.

## Core Concepts

### What the term groups

```text
document     aggregates with variable structure, read whole
key-value    access by key, very high throughput, no querying
columnar     analytical scans over few columns
graph        relationship traversal
time series  metrics ordered by time, with retention
search       an inverted index with relevance
```

Each line solves a different problem. Choosing "NoSQL" is choosing none of them.

### What unites them is historical, not technical

They arose in the same period, motivated by real limitations of the relational databases of the time at
web scale.

That explains the association and does not justify it today: relational databases evolved, several
non-relational ones added transactions and schemas, and the boundary became porous.

Relational databases support documents with indexing. Document databases offer transactions across
documents. The category no longer predicts the properties.

### The promises that aged

**"Schemaless."** There is no data with no schema — there is an undeclared schema. It disappears from
the database and reappears in the application, in several places, with no validation. See
[document databases](/07-data-architecture/document-databases.md).

**"It scales horizontally."** Several do, at the cost of abandoning transactions across records and
unforeseen queries. And distributed relational databases scale too.

**"It's faster."** Faster for the specific access pattern. Outside it, frequently worse.

### The question that replaces it

Instead of "SQL or NoSQL", four questions decide:

**How is the data read?** By key, by a filtered query, by a scan, by traversal, by textual relevance.

**How is it written?** Individual records, batches, a continuous stream.

**What consistency does the operation require?** See
[consistency](/06-distributed-systems/consistency.md).

**What unforeseen questions will be asked?** If many, models optimized for one access pattern will
limit you.

With those four answered, the storage choice is nearly mechanical — and the word "NoSQL" never appears.

### Polyglot persistence has a real operational cost

Using the right store for each case is correct in principle and each additional technology brings:
operational knowledge, monitoring, backup and restore procedures, an upgrade plan, and someone who
knows how to debug it at three in the morning.

The rule of thumb: add a store when there is a concrete problem the current one does not solve — not
for theoretical fit.

### The term hides the operational questions

Beyond grouping incompatible technologies, "NoSQL" shifts the conversation toward capacity and
performance — and away from the questions that determine whether the adoption will hold up.

The ones usually missing:

**How do you back it up and how long does the restore take?** It varies enormously between categories,
and some require their own procedure.

**What happens during a version upgrade?** Some require downtime.

**Who on the team knows how to debug this under pressure?**

**How do you monitor it?** The metrics that matter are different from a relational database's, and the
standard tooling may not cover them.

**What is the cost of migrating away later?** Models optimized for a specific access pattern are hard
to export to another format.

None of those appears in a performance comparison, and all of them appear during the first serious
incident.

## Mental Model

**"NoSQL" is a marketing category, not an architectural decision.** Decide by the access pattern.

## When to Use

The term is useful in exactly one context: a historical conversation about the movement of the late
2000s.

To decide on storage, use the specific categories:

- **[Document](/07-data-architecture/document-databases.md)** — variable aggregates read whole.
- **[Key-value](/07-data-architecture/key-value-databases.md)** — access by key, throughput.
- **[Columnar](/07-data-architecture/column-stores.md)** — analytics.
- **[Graph](/07-data-architecture/graph-databases.md)** — traversal.
- **Time series** — metrics with retention.

## When Not to Use

**As a decision category.** "Let's go NoSQL" is not a decision.

**As a synonym for scale.** Relational databases scale more than most people need.

**As a synonym for "schemaless".** The schema only changes location.

**As the opposite of SQL.** Several non-relational databases have SQL-like languages, and the
opposition was never about the language.

**To justify leaving relational without measuring.** See
[relational databases](/07-data-architecture/relational-databases.md).

## Alternatives

Instead of the term, use the specific category. Instead of the binary question, use the four
access-pattern questions.

And consider that the answer may be more than one store — with the operational cost included in the
calculation.

## Trade-offs

The real trade-off is not between SQL and NoSQL. It is between generality and specialization:

| General-purpose store | Specialized |
|---|---|
| Serves many patterns reasonably | One pattern very well |
| Unforeseen queries possible | Limited to the foreseen |
| One technology to operate | One more per case |
| Adequate performance | Orders of magnitude better in its case |
| Migrating later is expensive | Migrating later is expensive |

## Failure Modes

**Choice by category.** The tool does not serve the real access pattern.

**An implicit schema diverging.** Each service writes a slightly different format.

**An unforeseen query impossible.** The optimized model does not answer the new question.

**Proliferation.** Five stores and nobody masters any of them.

**Loss of integrity.** With no constraints in the store.

## Common Mistakes

**Treating it as a binary decision.** The question is not relational or not; it is which store serves
each access pattern. Mature systems use more than one, for declared reasons.

**Adopting by trend.** The choice has to come from a requirement — volume, the shape of the data, the
query pattern. Adopted by popularity, it appears as a limitation months later, when the necessary query
is not expressible.

**Assuming "schemaless" eliminates the schema.** The schema merely migrates to the reading code, and
comes to exist in several simultaneous versions with nobody declaring them. Migration is still
necessary — only with no tooling.

**Choosing the tool before describing the access pattern.** Key-oriented databases require modeling
from the queries. Choosing first and modeling later usually ends in a full scan to answer what was
trivial in relational.

**Adding technology without counting the operational cost.** Each new store is a duplicated set of
procedures, and the [cost of the second database](/20-trade-offs/sql-vs-nosql.md) rarely enters
the comparison — which tends to be made on performance alone.

## Real-World Example

A health startup decided at its founding: "NoSQL architecture, to scale from the start". It chose a
document database for everything.

Three years later, the inventory was this:

**Medical records.** Variable structure, read whole per patient. The document model serves it well. It
stayed.

**Appointments.** Queries by period, by professional, by room, with time conflict detection. It
required transactions and queries with multiple filters. It was migrated to relational after two
double-booking incidents.

**User sessions.** Access by key, high throughput, expiry. It was in the document database, with a
process scanning to delete expired ones. Migrated to key-value with native expiry; the cleanup process
ceased to exist.

**Usage metrics.** Time series written as documents, one per event. The collection grew to 2 billion
documents and the aggregation queries took minutes. Migrated to a time series database.

**Symptom search.** Implemented with regular expressions over text fields. Slow and with no relevance.
Migrated to an inverted index.

Of the five workloads, the document database was the right choice for one.

The later assessment points out: the original decision was not between models — it was between "NoSQL"
and "SQL", and that is why it could not be right. None of the five workloads was described in terms of
its access pattern before choosing.

## Related Concepts

- [Relational Databases](/07-data-architecture/relational-databases.md) — the default you give up.
- [Document Databases](/07-data-architecture/document-databases.md),
  [Key-Value](/07-data-architecture/key-value-databases.md),
  [Columnar](/07-data-architecture/column-stores.md), [Graph](/07-data-architecture/graph-databases.md)
  — the real categories.

## Practical Exercise

For each store in your system, write in one sentence the access pattern it serves.

Where you cannot write it, or where the sentence would fit another technology equally well, there is a
choice that was not made on any criterion.

## Interview Questions

- Why is "NoSQL" not a useful category for deciding?
- What does "schemaless" really mean?
- Which questions replace "SQL or NoSQL"?

## Further Reading

- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 2.
- Stonebraker, Michael. *The Traditional RDBMS Wisdom Is All Wrong*, 2013.
