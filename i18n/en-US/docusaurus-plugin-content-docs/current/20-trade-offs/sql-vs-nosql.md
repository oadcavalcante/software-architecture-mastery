---
id: sql-vs-nosql
title: SQL vs. NoSQL
sidebar_position: 10
description: The axis is the access pattern and the need for unforeseen queries — not volume.
doc_type: tradeoff
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses storage by the known access pattern and by the cost of
  operating one more database.
prerequisites: [nosql]
related: [strong-vs-eventual-consistency, managed-vs-self-hosted, performance-vs-maintainability]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# SQL vs. NoSQL

## Overview

The pair is badly named. "NoSQL" gathers families with very different properties — key-value,
document, wide-column, graph — and several modern relational databases have absorbed
capabilities that motivated the original split.

The useful axis is not the query language:

```text
real axis   are the access patterns known and stable, or will there be an
            unforeseen query over the same data?
```

Non-relational databases are optimized for access patterns **known in advance** — the modeling
starts from the query. Relational databases allow arbitrary queries over the same structure, at
the cost of less optimization per case.

And there is a second axis, almost always decisive in practice: **how much does it cost to
operate one more database?**

## Problem

The decision is commonly made on arguments that do not decide:

```text
"NoSQL scales better"        → relational databases scale well up to volumes
                               most systems never reach
"SQL is more mature"         → several non-relational options are 15+ years old
"flexible schema is better"  → the schema exists either way;
                               the question is whether it is checked or implicit
"we'll need scale"           → which scale, measured how?
```

And the forgotten cost is operational, which the section on [the second
database](#the-second-database-costs-more-than-the-first) details.

See [managed vs. self-hosted](/20-trade-offs/managed-vs-self-hosted.md).

## Core Concepts

### The access pattern is the axis

```text
known and stable            model for the query → non-relational works well
unforeseen, exploratory     needs arbitrary queries → relational
```

Concrete examples:

```text
user session by identifier                        key-value
product catalog with attributes per category      document or relational
relationships and paths between entities          graph
time series with aggregation by window            wide-column or purpose-built
a report nobody foresaw, over order data,
  filtered by three dimensions                    relational
```

The last is the decisive criterion in information systems: **will there be an unforeseen
question?** In almost every business system, yes — and answering it in a database modeled for
the known access requires reprocessing data.

### A schema always exists

```text
declared schema   checked by the database, visible, explicit migration
implicit schema   checked by the application, scattered, silent migration
```

"Schemaless" means the schema lives in the code of every application that reads that data — and
that documents of different formats coexist indefinitely.

That is a real advantage during discovery, and a real debt afterwards. Mature systems on
document databases frequently reintroduce schema validation in the application layer, which is
a declared schema with extra steps.

See [data modeling](/07-data-architecture/data-modeling.md).

### Transactions and integrity

```text
relational        multi-table transaction, foreign key, constraint
non-relational    transaction per document or partition, integrity in the application
```

Several non-relational databases added multi-document transactions, with scope restrictions and
a performance cost. The practical question: **does the model require changing two things
atomically?** If so, the relational one solves it with no code.

See [transactions](/07-data-architecture/transactions.md).

### Scale is not the argument it appears to be

Row count is the wrong axis. A modern relational instance handles tens of terabytes and tens of
thousands of transactions per second — this material has cases of 400 million and of 12 billion
rows on relational, with no migration. See [relational
databases](/07-data-architecture/relational-databases.md).

What actually pushes you out of relational:

```text
write rate above what one instance accepts, with
  no natural partition key                           non-relational has the advantage
writes accepted in more than one region, with
  availability under network partition               likewise
hot set larger than available memory, with
  uniform access (no locality)                       likewise
consistent sub-millisecond read latency, by key      key-value
maintenance window shorter than a schema operation
  on the largest table                               a sign for partitioning, not family
```

Note that only the fourth line is about latency and none is about row count. Volume by itself does
not decide: what decides is what the volume does to writes, to memory, and to the window.

Most business systems never cross any of those lines. Choosing for the scale
scenario that may never arrive costs today, for certain, for an uncertain benefit.

See [simplicity vs. flexibility](/20-trade-offs/simplicity-vs-flexibility.md) — it is the same
optionality trade-off.

### The second database costs more than the first

```text
team skill                duplicated
restore procedure         duplicated, and it has to be tested
upgrades and migrations   duplicated
monitoring and alarms     duplicated
on-call                   one more to know
consistency between them  new, and not trivial
```

This makes "use the right database for each case" — polyglot persistence — a more expensive
strategy than it looks. It is justified when the gain in one case is large; it is not justified
by elegance.

### Signs of the wrong choice

```text
chose non-relational and should not have
  joins done in the application
  data duplicated across collections, diverging
  exploratory queries requiring an export to another system
  schema validation reimplemented in the application
  transactions simulated with manual compensation

chose relational and should not have
  a schema with dozens of null columns from type variation
  a generic attribute table (entity-attribute-value)
  latency dominated by joins that always return the same aggregate
  partitioning done manually by hand
```

The signs in the two lists do not appear at the same time. Those in the first show up early, in
the first weeks of use, because they are an immediate consequence of the model. Those in the
second are accumulated state — null columns and a generic attribute table take many migrations to
form — and that is why the second list is the one discovered late.

### Cost of changing your mind

```text
relational → non-relational   data migration, with a model derived from the access
non-relational → relational   more expensive: requires rebuilding the schema from
                              accumulated heterogeneous documents
```

The asymmetry favors starting relational when in doubt — the data leaves it with a known
structure, and enters any other model. The reverse path requires archaeology over format
variations accumulated over years.

## Mental Model

**Are the accesses known, or will there be a new question?** And: how much does it cost to
operate one more database?

## When to Use

Prefer **non-relational** when:

- The access patterns are known, stable and few.
- The model is naturally hierarchical, graph-shaped or a time series.
- Scale requires globally distributed writes.
- The required latency is below what the relational one delivers.
- There will be no exploratory queries over that data.

Prefer **relational** when:

- There will be unforeseen queries.
- There is a need for transactions across entities.
- Referential integrity matters.
- The volume is within what the relational one handles comfortably.
- The team already operates one, and the case does not justify a second.

## When Not to Use

**Choosing by hypothetical scale** — when none of the five lines above has been crossed and no
dated projection crosses them. The cost is today; the benefit, maybe.

**Adopting a second database when the gain does not cover the six duplicated items.** The question
is quantitative: does the case motivating the second database save more than a skill, an on-call
rotation and a tested restore cost per year?

**Treating "schemaless" as the absence of a schema** — the schema moves into the code that reads,
scattered across every reader, and the divergence only surfaces when one of them fails in
production.

**Using non-relational when an unanticipated question exists** — the decisive distinction in this
document. If the product is going to segment by combinations nobody listed, the denormalized model
forces an export to answer.

**Using relational with a generic attribute table** — a symptom of the wrong model, not the wrong
database; switching families does not fix it, it just moves the problem.

## Alternatives

- **Relational with JSON** — handles attribute variation without a second database; solves most
  of the cases that motivate document databases.
- **Dedicated search index** — keeps the relational one as the source of truth and solves
  faceted queries.
- **Read replica or analytical warehouse** — for exploratory queries without affecting the
  operational side.
- **Cache** — when the problem is read latency, not the model.

The first is the most underestimated alternative: typed columns for what is common, a document
for what varies, one database to operate.

## Trade-offs

| Relational | Non-relational |
|---|---|
| Arbitrary queries | Known access optimized |
| Transactions and integrity | Write scale |
| Checked schema | Evolution without migration |
| Only one, already operated | One more to operate |

| One database | Polyglot |
|---|---|
| Lower operational cost | The right tool per case |
| Compromise in some cases | Consistency between databases |
| One skill | Several |

## Failure Modes

The symptoms of a wrong choice are in [the list above](#signs-of-the-wrong-choice). What follows is
what shows up later, once the choice has been absorbed by the system and is no longer attributed
to it.

**Improvised consistency between databases.** There is no transaction across the two, so someone
wrote a reconciliation routine — and it is the least tested piece of the system, because it only
runs when something has already gone wrong.

**A migration that became archaeology.** The documents accumulated formats, and leaving requires
an analyst reading data to find out how many exist. The cost of leaving grew without anyone
deciding it.

**The right database for the wrong reason.** The choice was sound and nobody knows why — whoever
decided has left, there is no record, and the review stays blocked because touching it feels
risky.

**Performance blamed on the family.** The system is slow, and the conversation turns into
relational versus non-relational instead of query profiling. Switching families rewrites
everything and keeps the bad query.

## Common Mistakes

**Deciding on the database family before listing the access patterns.** Key-oriented databases
require modeling from the queries; choosing first forces you to discover later that the
necessary query is not expressible.

**Not asking whether there will be unforeseen queries.** It is the decisive distinction: the
relational one answers well what nobody anticipated; the denormalized one does not.

**Not counting the cost of the second database.** The comparison is made on performance, and the
recurring cost — [six duplicated items](#the-second-database-costs-more-than-the-first) — enters
neither side of it.

**Ignoring JSON in a relational database** as an option. It covers a good part of what is sought
in a document store without giving up transactions, joins and ad hoc queries — and it rarely
makes the list.

**Confusing an index problem with a model problem.** Switching databases over slowness an index
would solve replaces an afternoon of work with a migration.

## Real-World Example

A digital nutrition company chose a document database as its primary storage in 2022. The
recorded justification: attribute variation between types of meal plan, and an expectation of
growth.

In 2025, with 2.3 million users:

```text
collections                                     11
distinct document formats coexisting
  in the plans collection                        9
joins done in the application                   14 points
schema validation reimplemented                 yes, in 2023
exploratory queries by the product team         weekly export to a spreadsheet
                                                and a temporary relational
                                                database
simulated multi-document transactions           4 flows, with manual compensation
incidents from divergence between collections   9 in 12 months
```

The 9 coexisting formats were the structural problem. Each model change had been applied only to
new documents, and the code dealt with all the variations.

And the access pattern had changed: the product started asking unforeseen questions —
segmentation by combination of dietary restriction, adherence and history — exactly the case the
model does not serve.

The migration took nine months:

**Relational as the source of truth** for plan, user, adherence and history — the entities with
relationships and exploratory queries.

**JSON column** for the attributes that really do vary by plan type, with schema validation in
the database. That solved the original motivation without a second database.

**Document database kept** for one case: the meal log, which is only written per user and read
by identifier, with no cross-cutting queries. About 80% of the write volume, and no exploratory
queries.

**Normalization of the 9 formats** into one, with a single migration process — the longest work,
four months.

**Dedicated search index** for the product's segmentation, fed from the relational database.

Results after the migration:

```text
coexisting formats                              1
joins in the application                        0
simulated transactions                          0 — they became transactions
exploratory queries                             on the relational one, no manual export
product segmentation                            dedicated index, continuously fed
incidents from divergence                       0 in 10 months
stateful components in production               3 (against 1)
infrastructure cost                             -12%
```

Two lines in that table deserve care, because they are easy to read as a bigger win than it was.

**Exploratory querying did not all come back to the relational database.** What ended was the
weekly manual export to a spreadsheet and a temporary database: questions about plans, adherence
and history became a single query. But segmentation by combinations of restrictions — the
unanticipated question that motivated the migration — is not answered by the relational database
alone: it lives in a search index fed from it. The migration traded a manual export for a
continuous pipeline, which is better, and not for nothing.

**And the index counts as a stateful component.** By this document's own cost model it brings a
skill, a tested restore, upgrades, alarms, on-call and a consistency to coordinate — the lag
between the relational database and the index. Counting "two databases" would mean not applying
the yardstick the document demands of others: the design went from one store to three.

The 12% comes from two sources, neither of them the number of components: the document cluster
went from nine nodes to three once 80% of the write volume was the only case left on it, and the
JSON column removed a cache layer that existed only to avoid the joins in the application.

The three components have a justification recorded in an ADR, with a reversal condition: if the
meal log starts requiring cross-cutting queries, it goes back to the relational one; if
segmentation fits an index on the relational database itself, the dedicated index goes away.

The 2022 decision was not absurd — the attribute variation was real. The error was one of
method: the choice was made from a characteristic of the data, without listing the foreseen
access patterns or asking whether there would be unforeseen queries. The answer to that second
question, in a product still discovering its market, was obviously yes.

## Related Concepts

- [NoSQL](/07-data-architecture/nosql.md) and
  [Relational Databases](/07-data-architecture/relational-databases.md).
- [Data Modeling](/07-data-architecture/data-modeling.md).
- [Strong vs. Eventual Consistency](/20-trade-offs/strong-vs-eventual-consistency.md).
- [Indexing](/07-data-architecture/indexing.md).

## Practical Exercise

List your system's access patterns to the main data and mark which ones existed when the
database was chosen.

The ones that appeared later measure the probability that more will appear — and it is that
probability that decides.

## Interview Questions

- Why is "scale" rarely the decisive argument in this choice?
- Why does "schemaless" not mean the absence of a schema?
- Why does the asymmetry in migration cost favor starting relational when in doubt?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Winand, Markus. *SQL Performance Explained*. 2012.
