---
id: denormalization
title: Denormalization
sidebar_position: 14
description: Duplicating on purpose — when the cost of joins exceeds the cost of keeping copies current.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader denormalizes with measurement and a maintenance plan, instead of
  by performance intuition.
prerequisites: [normalization]
related: [olap, data-modeling, indexing]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Denormalization

## Overview

Denormalizing is duplicating data on purpose to avoid joins on read.

It is a legitimate and frequently correct decision. What makes it risky is being made by intuition —
"joins are slow" — instead of by measurement, and with no plan to keep the copies coherent.

The question that governs it: **when the original changes, what happens to the copies?**

## Problem

[Normalized](/07-data-architecture/normalization.md) models require joins, and joins cost. In an
analytical query over millions of rows, they dominate the time.

Denormalizing solves that and creates a new problem: the same information now exists in several
places, and keeping them coherent becomes the application's responsibility.

The common error is not denormalizing — it is denormalizing without answering what happens on update,
and discovering the answer in production.

## Core Concepts

### Two categories that get confused

**A copy of a historical value.** The price charged, the delivery address, the applied tax rate. Those
values **should not** change when the registration changes — they are different facts from the current
data.

That is not denormalization: it is correct modeling. See
[normalization](/07-data-architecture/normalization.md).

**A copy of a live value.** The customer's name copied into the order to avoid a join. When the
customer changes their name, the copies become stale.

Only the second is real denormalization, and only it requires a maintenance plan. Separating the two
resolves a good part of the confusion about the topic.

### The ways to denormalize

**Copy an attribute.** The name alongside the identifier.

**Pre-compute an aggregate.** The order total, the item count, a balance.

**Flatten a hierarchy.** Category and subcategory directly on the product.

**Repeat the whole row.** A dimensional model — the whole dimension alongside the fact.

Pre-computed aggregates are the most valuable and the most prone to diverging, because they depend on
every write going through the same path.

### Keeping them current: three strategies

**In the same transaction.** Updating the original and the copy atomically. Coherence guaranteed, at
the cost of a more expensive write and of coupling between the writes.

**Asynchronously.** An event propagates the change. Fast writes, eventual coherence, and it requires
[idempotency](/06-distributed-systems/idempotency.md).

**Recomputing periodically.** A process rebuilds it. Simple, with a larger divergence window.

The choice depends on how much divergence time the business accepts — a question that has to be asked
of the business, not decided technically.

### Divergence checking is mandatory

Any strategy eventually fails: a lost event, a write path that forgot to update, a manual correction
in the database.

Without checking, the divergence is silent and permanent. A periodic process that compares the
aggregate with the computation from the source and alerts on a difference is the control that
separates sustainable denormalization from a time bomb.

It almost never exists.

### Measure first

"Joins are slow" is true in analytics and frequently false in transactional workloads, where an
indexed join of a few records costs almost nothing.

Before denormalizing in a transactional system, check the execution plan. The most common cause of a
slow query is a missing [index](/07-data-architecture/indexing.md) — and denormalizing to work around
a missing index adds permanent complexity to solve something one line would solve.

### The write path has to be single

If three services can change the original and only one knows how to update the copy, the divergence is
a matter of time.

Denormalization requires every write to go through a point that knows about the copies — which is an
architecture requirement, not an implementation one.

## Mental Model

**Denormalizing moves cost from reading to writing and to maintenance.** It pays off when you read far
more than you write.

## When to Use

- An analytical model. See [OLAP](/07-data-architecture/olap.md).
- Reads disproportionately more frequent than writes.
- The join has been measured and is the bottleneck.
- The copied data changes rarely.
- Storage with no efficient joins.
- An aggregate queried far more often than it is updated.

## When Not to Use

**Without measuring.** The bottleneck may be the index.

**With no maintenance plan.**

**With no divergence checking.**

**When the copied data changes frequently.** The propagation cost exceeds the gain.

**When there are multiple uncontrolled write paths.**

**In a transactional model, out of habit.**

## Alternatives

- **An adequate [index](/07-data-architecture/indexing.md)** — check first, always.
- **Materialized view** — the database maintains the copy and updates it; less code and less risk of
  divergence.
- **Cache** — duplication with a deadline, and the expiry takes care of coherence.
- **[CQRS](/06-distributed-systems/distributed-cqrs.md)** — explicit separation with a rebuildable
  projection.

The materialized view is underused: it delivers denormalization's benefit with the maintenance handled
by the database.

## Trade-offs

| Denormalized | Normalized |
|---|---|
| Fast reads | Joins |
| Writes in several places | One place |
| Risk of divergence | No risk |
| More space | Less |
| Optimized for the foreseen | Unforeseen queries |
| Maintenance by code | Guaranteed by the database |

| Synchronous | Asynchronous | Periodic |
|---|---|---|
| Always coherent | Eventual | A larger window |
| Slower writes | Fast | Fast |
| Coupled | Decoupled | Decoupled |
| No divergence | If an event is lost | Until the next cycle |

## Failure Modes

**Silent divergence.** The copy and the original disagree and nobody knows.

**A wrong aggregate.** A pre-computed total that does not match the sum of the items.

**A bulk update.** A value copied into millions of rows has to change.

**A forgotten write path.** A new service changes the original and ignores the copies.

**A manual correction in the database.** Someone corrects the original with a direct command, and the
copies fall behind.

**Accidental denormalization.** Duplication nobody decided on and nobody maintains.

## Common Mistakes

**Denormalizing without measuring.**

**Not implementing divergence checking.**

**Confusing a historical value copy with denormalization.**

**Not documenting which fields are copies.** Whoever arrives later cannot distinguish the original
from the copy.

**Copying data that changes frequently.**

## Real-World Example

A commerce system stored the pre-computed order total, to avoid summing the items on every listing.

A correct decision: the listing is queried thousands of times a day, and the order is changed a few
times.

The total was updated in the same transaction that changed the items. It worked for four years.

Then three new write paths appeared, and none updated the total:

**Partial cancellation** implemented by a different team, which removed items directly.

**A support correction**, an internal tool that adjusted quantities.

**Order import** from a partner channel, which inserted items in bulk.

The divergence grew in silence. When it was finally measured — by chance, during another investigation
— **1.8% of orders** had a total different from the sum of the items. Some higher, some lower. The
accumulated financial impact was significant and took months to reconcile.

The fixes:

**A daily check** comparing the total with the sum, alerting on a difference. It is what should have
existed from the start, and it cost half a day to implement.

**A single write point.** Every change to items now goes through the same service, which updates the
total.

**On-demand recomputation** for orders with a detected divergence.

The reading the team takes from it: the denormalization was right, the initial implementation was
right, and the model rotted because nothing prevented new paths from ignoring the rule. A copy with no
checking is a bet on permanent discipline from every future team.

## Related Concepts

- [Normalization](/07-data-architecture/normalization.md) — the inverse decision.
- [Indexing](/07-data-architecture/indexing.md) — check first.
- [OLAP](/07-data-architecture/olap.md) — where denormalizing is the default.
- [CQRS](/06-distributed-systems/distributed-cqrs.md).

## Practical Exercise

List the pre-computed or copied values in your database. For each one, write the query that recomputes
it from the source and compare the results today.

The divergence rate you find is the measure of how well the current strategy is working.

## Interview Questions

- What is the difference between copying a historical value and denormalizing?
- Why is divergence checking mandatory?
- What do you check before denormalizing in a transactional system?

## Further Reading

- Kimball, Ralph; Ross, Margy. *The Data Warehouse Toolkit*. 3rd ed. Wiley, 2013.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Fowler, Martin. *Patterns of Enterprise Application Architecture*, 2002.
