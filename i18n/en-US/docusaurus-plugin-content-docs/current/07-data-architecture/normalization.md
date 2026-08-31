---
id: normalization
title: Normalization
sidebar_position: 13
description: Each fact in one place only — what that guarantees and where the cost of joins weighs.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader applies normalization as an integrity decision, knowing what
  each normal form prevents.
prerequisites: [data-modeling]
related: [denormalization, relational-databases, oltp]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Normalization

## Overview

Normalizing is organizing the data so that **each fact exists in one place only**.

The goal is not elegance or saving space — it is preventing the same data from existing in two
contradictory versions.

It is the appropriate choice for a [transactional](/07-data-architecture/oltp.md) workload, and the
inappropriate one for an [analytical](/07-data-architecture/olap.md) one. Knowing why is what lets you
decide instead of following a rule.

## Problem

When a fact is repeated in several places, three problems arise inevitably:

**Update anomaly.** Changing a supplier's address requires altering every row that copied it. One
that escapes produces a contradiction.

**Insertion anomaly.** It is not possible to record a supplier without recording an order, because
its data lives in the orders table.

**Deletion anomaly.** Deleting a supplier's last order also deletes the supplier's data.

Normalization eliminates all three by construction, not by discipline.

## Core Concepts

### The normal forms, without the formalism

The theory has six or more normal forms. In practice, three solve nearly everything:

**First.** Each field holds a single value, not a list. A `phones` column with "11999998888,
1133334444" violates it — and forces the application to parse text.

**Second.** Every attribute depends on the whole key. In a table with a composite key of order and
product, the product's name depends only on the product — therefore, it does not belong there.

**Third.** No attribute depends on another non-key attribute. If the table has a postal code and a
city, the city depends on the postal code, not on the record — therefore, it belongs somewhere else.

The rule of thumb that summarizes all three: **each attribute should depend on the key, the whole
key, and nothing but the key**.

### Third normal form is the usual stopping point

Forms above the third solve rare anomalies, and the cost of joins grows.

In practice, third normal form with conscious deviations is the design of a well-built transactional
system. Higher forms appear in specific domains and rarely justify the effort.

### What you gain is verifiable integrity

The central gain is not space — it is that the **constraint can be declared**.

With the supplier in one table and the foreign key in the order, the database guarantees that no
order points to a non-existent supplier. For every writer, including scripts.

In a denormalized model, that guarantee has to be maintained by code — and by every piece of code
that writes.

### The cost is joins, and it is real

Each separate table is one more join on read.

In [OLTP](/07-data-architecture/oltp.md), where the query brings few records, indexed joins are cheap
and the cost is irrelevant.

In [OLAP](/07-data-architecture/olap.md), where the query scans millions, joins dominate the time —
and that is why the criterion inverts.

### Normalizing is not about saving space

That argument appears frequently and has aged: storage is cheap.

The valid argument is integrity. Whoever normalizes to save space tends to denormalize as soon as
space stops mattering — and loses the guarantee without realizing it was the guarantee that mattered.

### Conscious deviations are normal

A real system has deviations: a pre-computed total, a name copied to avoid a join in a critical query.

That is deliberate [denormalization](/07-data-architecture/denormalization.md), and it is legitimate
when documented and with a maintenance strategy. The problem is not the deviation — it is the
accidental deviation, which nobody knows exists.

## Mental Model

**Normalizing is guaranteeing there are no two versions of the same fact.** The price is joins; the
return is integrity the database enforces on its own.

## When to Use

- A transactional workload with concurrent writes.
- Referential integrity matters.
- The data changes frequently.
- Unforeseen queries will be made.
- Multiple writers, including scripts and integrations.

## When Not to Use

**In an analytical model.** See [OLAP](/07-data-architecture/olap.md) — joins over volume dominate.

**When the data is a snapshot of the moment.** The price at the instant of purchase should be copied,
not referenced — it does not change when the catalog price changes.

**On principle, without evaluating the access.**

**Beyond third normal form with no concrete reason.**

**In storage with no joins.** See [documents](/07-data-architecture/document-databases.md) — there the
model is different.

The second deserves emphasis: copying a historical value is not denormalization, it is correct
modeling. They are different facts — "the product's price" and "the price paid".

## Alternatives

- **Selective [denormalization](/07-data-architecture/denormalization.md)** — at measured points.
- **Materialized view** — the normalized form remains; the read queries the view.
- **Dimensional model** — for analytics.
- **[CQRS](/06-distributed-systems/distributed-cqrs.md)** — normalized for writing, denormalized for
  reading.

## Trade-offs

| Normalized | Denormalized |
|---|---|
| One place per fact | Duplication |
| No update anomaly | Bulk updates |
| Declared integrity | Maintained by code |
| Joins on read | Direct read |
| Simple writes | Writes in several places |
| Unforeseen queries | Optimized for the foreseen |

## Failure Modes

**Too many joins in a critical query.** A sign that a materialized view or a conscious deviation is
missing.

**Third normal form applied to analytics.** Unviable queries.

**A missing foreign key.** The model looks normalized and does not have the guarantee.

**A historical value referenced instead of copied.** Last year's report changes when someone corrects
a registration.

**Excessive normalization.** Tables with two fields that only exist out of formal rigor.

The fourth is subtle and produces the worst kind of defect: numbers that change retroactively with
nobody having altered the history.

## Common Mistakes

**Normalizing out of habit.**

**Not declaring foreign keys.**

**Referencing when copying was correct** — the historical value case.

**Applying the same criterion to OLTP and OLAP.**

**Denormalizing with no documentation.**

## Real-World Example

A billing system normalized correctly: customer, product, price, order, order item. Foreign keys
declared, third normal form.

The order item referenced the product and obtained the price from the price table.

The problem appeared during a tax audit: the value of the invoices issued in 2023 did not match what
the system computed when reissuing the report in 2025.

The cause: the prices had changed. Since the item referenced the current price table, every
historical report reflected today's prices.

The model was formally normalized and conceptually wrong. "The product's price" and "the price charged
on this item" are different facts — the second is immutable and belongs to the item.

The fix was to copy to the order item, at the moment of issuance: unit price, applied tax rate,
product description and discount. Five fields.

That looks like duplication and is not: none of those values has any relationship with the price table
after issuance. They can never change.

Reconstructing the earlier history was partial, from archived invoice PDFs.

What the team records: the model review had been done by someone rigorous in normalization theory,
and the error slipped through precisely because of that. The question that was missing was not about
functional dependency — it was "can this value change later?".

## Related Concepts

- [Denormalization](/07-data-architecture/denormalization.md) — the inverse decision.
- [Data Modeling](/07-data-architecture/data-modeling.md) — the context.
- [OLTP](/07-data-architecture/oltp.md) — where it serves.
- [Relational Databases](/07-data-architecture/relational-databases.md).

## Practical Exercise

Look through your model for values that represent a historical fact — the price charged, the delivery
address, the applied tax rate — and check whether they are copied or referenced.

Where they are referenced, your historical reports change on their own.

## Interview Questions

- Which anomalies does normalization eliminate?
- Why does the criterion invert in an analytical workload?
- When is copying a value not denormalization?

## Further Reading

- Codd, E. F. *Further Normalization of the Data Base Relational Model*, 1971.
- Date, C. J. *Database Design and Relational Theory*. O'Reilly, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
