---
id: data-warehouses
title: Data Warehouses
sidebar_position: 9
description: Data from several sources, modeled for analysis — and the cost of maintaining the transformation.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes when a warehouse is justified and what sustains
  trust in the numbers it produces.
prerequisites: [olap]
related: [data-lakes, column-stores, denormalization]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Warehouses

## Overview

A data warehouse brings data from multiple operational sources into its own model, designed for
analysis.

The key word is **multiple**. If there is a single source, a replica or
[columnar](/07-data-architecture/column-stores.md) storage solves it with no complexity.

What the warehouse adds is the integration: cross-referencing sales from the commercial system, costs
from finance and support from the help desk — systems that do not know each other and name the same
things differently.

## Problem

Each operational system has its vocabulary, its key and its granularity. The commercial system's
"customer" is not the same record as finance's "customer".

Answering "what is the margin by customer segment" requires reconciling that — deciding what a customer
is, which identifier holds, what to do when the registrations diverge.

That reconciliation work is the warehouse. The technology is the easy part.

## Core Concepts

### The dimensional model

The standard design: **fact tables** at the center, with the measures and the keys; **dimension tables**
around them, with the descriptive attributes.

```text
fact_sales           dimensions
  product_key    →     dim_product   (name, category, brand)
  store_key      →     dim_store     (name, city, region)
  date_key       →     dim_date      (day, month, quarter, holiday)
  quantity
  amount
```

The model is deliberately [denormalized](/07-data-architecture/denormalization.md): the product
dimension repeats category and brand instead of referencing them.

That avoids chained joins and makes the queries readable to non-specialists — which is half the purpose.

### The fact's granularity is irreversible

The most important modeling decision: what does each row of the fact table represent?

A sale? A sale item? A daily total per store?

Fine granularity allows aggregating in any way. Coarse granularity is cheaper and **discards the
possibility** of more detailed questions — permanently, because the detail was not kept.

The rule: record at the finest granularity the volume allows. Aggregating later is always possible;
disaggregating never is.

### Dimensions that change over time

A customer changes segment. Should the old sales appear in the old segment or the current one?

**Overwrite.** Simple, and it rewrites history — old reports change.

**Version.** A new row in the dimension, with a validity period. The fact points to the version in
effect at the time. It preserves the history and complicates the load.

**Keep both values.** Current segment and original side by side.

The choice has to be made per dimension, with the business. It is the most common source of "last year's
report changed".

### The load has to be idempotent

Load processes fail midway and are re-run. If the re-run inserts the facts again, the numbers double —
with no error, no alert.

The pattern that works: deleting the period's partition and reloading, instead of inserting
incrementally. See
[idempotency](/06-distributed-systems/idempotency.md).

### Lineage and trust

The warehouse only has value if people trust the numbers. And the trust is lost the first time two
reports disagree with no explanation.

What sustains the trust:

**Lineage.** Where each number came from, through which transformation.

**A visible update date** on every report.

**Reconciliation with the source.** Periodic comparison of totals. See
[data consistency](/07-data-architecture/data-consistency.md).

**Published definitions.** What exactly counts as an "active customer".

The last avoids the most exhausting discussion a warehouse produces: two teams with different numbers,
both correct according to distinct definitions.

### The real cost is the transformation

The storage technology is a commodity. What costs is writing and maintaining the transformations — and
they break whenever a source system changes.

A warehouse with dozens of sources has a constant stream of maintenance. Budgeting the project without
budgeting that maintenance is the characteristic planning error.

## Mental Model

**A warehouse is about integrating sources, not about storing a lot of data.** If there is only one
source, you do not need one.

## When to Use

- Multiple sources have to be cross-referenced.
- There is a need for single definitions for the business.
- Recurring analytical queries over historical data.
- A history requirement the source systems do not keep.
- The analytical workload has to leave the transactional database.

## When Not to Use

**With a single source.** A replica or columnar storage solves it.

**When the volume does not justify it.**

**For exploratory analysis of raw unstructured data.** See
[data lake](/07-data-architecture/data-lakes.md).

**With no owner for the business definitions.** It becomes one more disagreeing source.

**With no budget for continuous maintenance.**

**As the operational source of truth.** It is derived.

## Alternatives

- **Read replica** — when there is one source.
- **[Columnar](/07-data-architecture/column-stores.md) directly** — with no integration layer.
- **[Data lake](/07-data-architecture/data-lakes.md)** — for raw data and exploration.
- **[Lakehouse](/07-data-architecture/data-lakehouses.md)** — the combination.
- **Federated queries** — querying the sources where they are, without moving them; it avoids the load
  at the cost of performance and of load on the source systems.

## Trade-offs

| Warehouse | Querying the sources |
|---|---|
| Unified definitions | Each source with its own |
| History preserved | Whatever the source keeps |
| No load on the systems | Competes with the operation |
| Transformation to maintain | None |
| Data with lag | Current |

| Fine granularity | Aggregated |
|---|---|
| Any future question | Only the foreseen ones |
| Larger volume | Smaller |
| More expensive queries | Cheap |
| Irreversible if too coarse | — |

## Failure Modes

**Duplication from a reload.** The numbers double silently.

**An overwritten dimension.** Historical reports change.

**A transformation broken by a change at the source.**

**Granularity too coarse.** The new question cannot be answered.

**Divergent numbers between reports.** Different definitions.

**A delayed load with no signal.** Decisions on stale data.

## Common Mistakes

**Building it with a single source.** If there is only one origin, the warehouse's value is nearly nil: a
read replica solves it, with no modeling and no load cost.

**A non-idempotent load.** Re-running the day's load is a routine operation after a failure. If it adds
instead of replacing, the reprocessing duplicates the numbers — and the error is discovered by the
report.

**Not deciding the strategy for changing dimensions.** When a customer changes region, the old orders
start counting in the new region if the dimension is overwritten. It is the difference between historical
and current "sales by region", and nobody notices until the comparison with last year does not match.

**Aggregating too early.** Keeping only the daily total prevents any question by hour or by segment
later — and the data that would produce the answer has already been discarded.

**Not publishing definitions.** With no written definition of "active customer", each area computes its
own, and the meeting discusses whose number it is instead of discussing what it shows.

**Not showing the update date.** A dashboard that does not say through when the data goes is
indistinguishable from a dashboard whose load has been broken for three days.

## Real-World Example

A pharmacy chain built a warehouse integrating point of sale, stock, finance and the loyalty program.

It worked well for two years and the trust collapsed in one week.

The commercial director and the finance director presented different revenue numbers for the same quarter
— a 4% difference. Both came from the warehouse.

The investigation found three simultaneous causes:

**Divergent definitions.** One report included sales cancelled the same day; the other did not. No
definition was published; each analyst had written their own.

**An overwritten dimension.** Stores that changed region had the dimension updated, and the historical
sales came to appear in the new region. Comparisons with previous quarters became inconsistent.

**Partial duplication.** A point-of-sale load had failed and been re-run manually. Three days went in
twice.

The fixes:

**A published glossary** with definitions approved by the business, and a certified metrics layer —
official reports can only use those definitions.

**Versioning in the store dimension**, allowing viewing a sale in the region at the time or the current
one, explicitly.

**An idempotent load** per date partition, and the manual process eliminated.

**Daily reconciliation** comparing the warehouse's total with the point of sale's, with an alert above
0.1%.

The recorded lesson: the technical problems were fixed in three weeks. The trust took nearly a year to
come back, and for a long time the areas kept parallel spreadsheets "to check".

## Related Concepts

- [OLAP](/07-data-architecture/olap.md) — the workload.
- [Columnar](/07-data-architecture/column-stores.md) — the typical storage.
- [Data Lake](/07-data-architecture/data-lakes.md) and
  [Lakehouse](/07-data-architecture/data-lakehouses.md).
- [Denormalization](/07-data-architecture/denormalization.md) — the model.

## Practical Exercise

Take two similar metrics used by different areas — revenue, active customers. Ask whoever uses them for
each one's exact definition.

If the definitions differ and nobody knew, you have found the next divergent-numbers discussion before it
happens.

## Interview Questions

- Why is the fact's granularity irreversible?
- What are the strategies for a changing dimension, and what does each one cost?
- What sustains trust in a warehouse's numbers?

## Further Reading

- Kimball, Ralph; Ross, Margy. *The Data Warehouse Toolkit*. 3rd ed. Wiley, 2013.
- Inmon, W. H. *Building the Data Warehouse*. 4th ed. Wiley, 2005.
- Linstedt, Dan. *Building a Scalable Data Warehouse with Data Vault 2.0*, 2015.
