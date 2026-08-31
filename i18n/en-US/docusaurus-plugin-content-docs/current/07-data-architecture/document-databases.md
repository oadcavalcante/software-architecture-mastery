---
id: document-databases
title: Document Databases
sidebar_position: 3
description: Aggregates read whole — and why "schemaless" merely moves the schema into the application.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies when the aggregate is the natural unit of access
  and recognizes the cost of losing the declared schema.
prerequisites: [nosql]
related: [relational-databases, data-modeling, denormalization]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Document Databases

## Overview

A document database stores nested structures — typically JSON — as the unit of storage and of access.

The case where it shines is specific and recognizable: **the data is read and written as a whole**,
has a structure that varies between instances, and the queries almost always start from the document's
root.

Where that pattern holds, the model eliminates joins and the application's object corresponds to the
stored record. Where it does not hold, it charges dearly.

## Problem

The relational model spreads a business object across several tables. Assembling an order with items,
address and payment requires joins, and reconstructing the object in the application is repeated work.

When that object is always read whole, that spreading is cost with no benefit.

The document database stores the object as it is. And in doing so, it gives up things that are only
missed later.

## Core Concepts

### The aggregate defines the boundary

The central modeling decision is: **what goes into a document and what stays outside**.

The rule that works: a document is the unit read and written together, and over which consistency has
to hold.

An order with its items is a document — they are born, change and are read together. A customer with
all their orders is not: the orders grow without limit and are queried independently.

Getting that boundary wrong is the model's dominant error, and it is expensive to fix later.

### "Schemaless" means an undeclared schema

There is no data with no structure. There is structure the database does not know about.

The effect: validation migrates to the application — and to **every** application that writes,
including correction scripts and legacy services.

In practice, a collection with years of use accumulates three or four coexisting formats, and the
reading code becomes a sequence of defensive checks.

That is not an argument against the model. It is an argument for declaring the schema somewhere —
validation in the database, when available, or a contract checked at the edge.

### The real flexibility is incremental evolution

The legitimate gain is not the absence of a schema. It is being able to add a field without altering
millions of existing records.

In a large table, altering the schema requires planning. In a document, the new field appears in the
new records and the code deals with its absence in the old ones.

That is valuable, and it is a specific operational advantage — not an exemption from modeling.

### Duplication is a choice, not carelessness

Since there are no efficient joins, referenced data is usually copied into the document. See
[denormalization](/07-data-architecture/denormalization.md).

The question that decides: when the original value changes, do the documents that copied it have to
change?

If the data is a snapshot of the moment — the price at the instant of purchase, the address used for
that delivery — the copy is correct and permanent.

If it is a live reference — the customer's current name — copying creates a bulk update problem.

### Transactions across documents exist, and the cost remains

Several document databases have come to offer transactions across documents, which removes the classic
objection.

The cost remains: they are more expensive than updating a single document, and using them frequently
signals that the aggregate boundary is wrong.

### A query outside the foreseen pattern is the limit

Querying by a deeply nested field, aggregating across collections or cross-referencing data with no
prepared index goes from hard to unviable.

It is the same trade-off as always: the model is optimized for the foreseen access, and the unforeseen
questions cost.

## Mental Model

**A document is good when the aggregate is the unit of access.** Outside that, the model works against
you.

## When to Use

- The object is read and written whole.
- The structure legitimately varies between instances.
- The queries start from the document's root.
- The necessary consistency fits within one document.
- Incremental schema evolution has operational value.
- Catalog, medical record, configuration, content, event history.

## When Not to Use

**When the queries cross entities.** Joins are what is missing, and reimplementing them in the
application is worse.

**When the aggregate grows without limit.** A list that only grows inside a document ends up exceeding
the size limit.

**When referential integrity matters.** There are no foreign keys.

**As a generic replacement for relational.** See
[relational databases](/07-data-architecture/relational-databases.md).

**For pure key access with very high throughput.** See
[key-value](/07-data-architecture/key-value-databases.md), simpler and faster.

**With no structure validation at all.** The implicit schema will diverge.

## Alternatives

- **[Relational](/07-data-architecture/relational-databases.md)** — with a document column, which
  combines a declared schema and localized flexibility.
- **[Key-value](/07-data-architecture/key-value-databases.md)** — when there is no query by content.
- **Inverted index** — when the need is search with relevance.

The first deserves emphasis: modern relational databases index fields inside documents stored in a
column. That covers a good part of the cases without giving up transactions and constraints.

## Trade-offs

| Document | Relational |
|---|---|
| Object read at once | Joins |
| Variable structure | Uniform schema |
| Incremental evolution | Planned migration |
| Validation in the application | In the store |
| No referential integrity | Foreign keys |
| Foreseen queries | Unforeseen ones possible |
| Duplication as the norm | Normalization as the norm |

## Failure Modes

**A document growing without limit.** It hits the size ceiling and writes start failing.

**Divergent formats.** Years of writes with no validation.

**A bulk update of duplicated data.** A field copied into millions of documents has to change.

**A join in the application.** Fetching N documents in a loop, with one query per item.

**A missing index on a nested field.** A full collection scan.

**A wrong aggregate boundary.** Transactions across documents become routine.

## Common Mistakes

**Nesting a collection that grows without limit.**

**Not declaring any validation.**

**Copying live data with no update plan.**

**Modeling as if they were tables** — one document per entity, with references between them,
reproducing relational without its guarantees.

**Choosing it for being "schemaless".**

## Real-World Example

A content platform modeled articles as documents: title, body, author, tags and nested comments.

It worked for two years. Then:

**Documents overflowing.** Popular articles accumulated thousands of comments. One reached 14 MB and
started failing on write — the database's limit was 16 MB. The comments were moved to their own
collection, with a reference to the article.

**The author's name duplicated.** Each article stored the author's name. When an author changed their
name, 40 thousand documents had to be updated. The name became a reference, and the interface fetches
it separately.

**Coexisting formats.** With no validation, three tag formats coexisted: a list of strings, a list of
objects, and comma-separated text. The reading code had to handle all three. The fix required a
migration and mandatory validation.

What remained correct: the article itself is still a document, read whole per route. The model is
adequate for it.

What the team records: all three fixes had the same diagnosis. The aggregate boundary was defined by
initial reading convenience — "the screen shows it all together" — and not by how the data changes.

## Related Concepts

- [NoSQL](/07-data-architecture/nosql.md) — the category and its problems.
- [Relational Databases](/07-data-architecture/relational-databases.md) — the main comparison.
- [Denormalization](/07-data-architecture/denormalization.md) — duplication as a decision.
- [Data Modeling](/07-data-architecture/data-modeling.md).

## Practical Exercise

Take the largest document in one of your collections. Look at its size and what makes it grow.

If something inside it grows with no ceiling, that is the wrong aggregate boundary — and the problem
appears as failing writes, not as slowness.

## Interview Questions

- How do you decide a document aggregate's boundary?
- What does "schemaless" really mean in operations?
- When is duplicating data inside the document correct?

## Further Reading

- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 2.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — on aggregates.
