---
id: olap
title: OLAP
sidebar_position: 8
description: Analytical workload — few large queries that scan a lot and aggregate, with tolerant latency.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes an analytical workload and chooses a model and
  storage suited to it instead of forcing it into the transactional one.
prerequisites: [oltp]
related: [data-warehouses, column-stores, denormalization]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# OLAP

## Overview

OLAP — online analytical processing — describes the workload opposite to the
[transactional](/07-data-architecture/oltp.md) one: **few queries, each scanning large volumes,
aggregating, with tolerance for latency of seconds or minutes**.

Revenue by region and month. Cohort behavior over a year. A ranking of products by margin.

Each one reads millions of records and returns tens of rows. None writes.

## Problem

An analytical workload executed in transactional storage is inefficient by construction, not for lack
of tuning.

A row-oriented database has to read the whole row to access two columns. A normalized schema requires
joins that, over millions of records, dominate the time. Indexes designed for selectivity do not help
someone scanning everything.

And, beyond the inefficiency, there is the competition: the analytical query occupies resources the
operation needs. See [OLTP](/07-data-architecture/oltp.md).

## Core Concepts

### The signature

```text
query volume            low (tens/day to hundreds/hour)
records per query       millions
access                  a scan with a period filter
proportion              almost exclusively reads
acceptable latency      seconds to minutes
data                    history, frequently immutable
consistency             eventual is sufficient
```

The last line is important and frequently ignored: a report about last month does not need the data
from right now. That frees up the entire architecture.

### Columnar storage changes the order of magnitude

A typical analytical query reads few columns from many rows. [Columnar](/07-data-architecture/column-stores.md)
storage keeps each column together, so reading two columns from a fifty-column table reads only what
is needed.

The gain is not marginal. Add compression — similar adjacent values compress very well — and the
difference is usually one to two orders of magnitude.

### Denormalizing is the right choice here

The criterion that holds in [OLTP](/07-data-architecture/oltp.md) inverts. Since there are no
concurrent writes and the queries scan, [denormalizing](/07-data-architecture/denormalization.md)
eliminates joins with no relevant maintenance cost.

It is the reason dimensional models — a fact at the center, dimensions around it — dominate analytical
design.

### Pre-aggregation trades space for time

If the same aggregations are queried repeatedly, computing them in advance turns minutes into
milliseconds.

The cost is space, update lag and the risk of divergence between the aggregate and the source. The
periodic check that the two match is the control that is usually missing.

### Analytical data is historical, and that changes everything

Analytical records do not change after being written. That allows partitioning by time, compressing
aggressively, archiving to cheap storage and reprocessing with no coordination.

An analytical system that treats the data as mutable is paying a cost it does not have to pay.

### Self-service has a cost nobody budgets

Giving business teams direct analytical access is valuable and brings a predictable consequence:
badly written queries, full scans with no period filter, and cost that grows with no ceiling.

A time limit, a per-user quota and a mandatory partition filter are not bureaucracy — they are what
keeps the platform viable.

### Freshness is a requirement to be asked about, not presumed

The question that saves the most effort in an analytical platform: what is the maximum age at which
the data still serves that decision?

The answer is almost never "in real time", and when it is, it usually comes from intuition and not
from necessity. A monthly closing report does not improve with per-minute updates. Neither does a
daily tracking dashboard.

The cost difference between the tiers is large:

```text
daily      nightly batch load, cheap and simple
hourly     incremental load, moderate
minutes    continuous processing, expensive
seconds    a dedicated streaming architecture, very expensive
```

Adopting the seconds tier for a requirement that was daily is the most common way to multiply an
analytical platform's cost with nobody noticing the trade.

## Mental Model

**OLAP is about few queries that read a lot.** Columnar, denormalized and historical — all three
follow from that.

## When to Use

- Reports, dashboards, exploratory analysis.
- Aggregation over large historical volumes.
- Ad hoc queries that are not known in advance.
- Latency of seconds is acceptable.
- Data from several systems has to be cross-referenced.

## When Not to Use

**For real-time operations.** If a user is waiting for an immediate response to continue a flow, it is
not analytical.

**For frequent writes of individual records.** Columnar storage is bad at that.

**As the operational source of truth.** It is derived.

**When the volume does not justify it.** A few million rows in a well-indexed relational database do
not need an analytical platform.

The last avoids most premature analytical platform projects: the complexity only pays off above a
certain volume.

## Alternatives

- **Read replica** — separates the workload without changing technology. Sufficient for moderate
  volumes.
- **Materialized view** — pre-aggregation with no separate platform.
- **[Data warehouse](/07-data-architecture/data-warehouses.md)** — when there are multiple sources.
- **Querying files directly** — when the volume is large and the frequency low.

## Trade-offs

| Columnar | Row-oriented |
|---|---|
| Efficient scans of few columns | Reads the whole row |
| High compression | Lower |
| Individual writes expensive | Cheap |
| Updates expensive | Cheap |
| Ideal for aggregation | For access by key |

| Pre-aggregated | Computed on the fly |
|---|---|
| Milliseconds | Seconds to minutes |
| Additional space | None |
| Update lag | Always current |
| Only the foreseen aggregations | Any question |
| Risk of diverging from the source | No risk |

## Failure Modes

**A query with no partition filter.** It scans the entire history and costs a lot.

**An aggregate divergent from the source.** Nobody compares.

**Cost growing with no ceiling.** Self-service with no quota.

**A delayed update with no signal.** The dashboard shows yesterday's data as if it were today's.

**Duplication during the load.** A re-run inserts the same facts twice, and the numbers double with no
error at all.

## Common Mistakes

**Running analytics on the transactional database.** A scan of months of history competes for memory
and disk with the transactions during business hours, and degrades exactly what cannot degrade.

**Normalizing the analytical model.** Normalization optimizes writes and integrity; an analytical
query wants few, wide joins. A normalized model turns a simple question into an eight-table join.

**Building an analytical platform before the volume justifies it.** Up to a certain size, a read
replica with a few indexes answers everything — with no load pipeline, no dimensional modeling and no
extra system to operate.

**Not showing the last update time on dashboards.** A load broken three days ago shows exactly the
same screen as a correct one, and the decision is made on stale data with nobody suspecting.

**A load with no idempotency.** See
[idempotency](/06-distributed-systems/idempotency.md).

## Real-World Example

A retail company built an executive dashboard on the replicated transactional database. It worked for
a year and degraded.

The problem was not the total volume — 200 million sales rows. It was the shape: each dashboard query
joined sale, product, store and calendar, and aggregated by month.

Load time: 90 seconds. The executives stopped using it.

The migration to columnar storage with a dimensional model changed the numbers: the same dashboard
came to load in 1.4 seconds.

Three problems appeared afterwards.

**Silent duplication.** The daily load failed midway and was re-run. That day's facts were inserted
twice, and revenue appeared inflated. Nobody noticed for six days, until a manager found his store's
number odd. The fix was making the load idempotent — deleting the day's partition before reloading.

**Self-service cost.** With direct access opened up, one query with no period filter scanned five
years of data. In one month, the query cost exceeded the storage cost fourfold. Solved with a
mandatory partition filter and a per-user quota.

**Delayed updates.** The dashboard showed data from two days earlier, with no indication of that.
Decisions were made on stale information. The fix was trivial and should have existed from the start:
a "data through" stamp on each dashboard.

The team records the third as the most embarrassing — it cost one line of interface and generated the
only real business consequence of the three.

## Related Concepts

- [OLTP](/07-data-architecture/oltp.md) — the opposite workload.
- [Column Stores](/07-data-architecture/column-stores.md) — the adequate technology.
- [Data Warehouse](/07-data-architecture/data-warehouses.md) — the platform.
- [Denormalization](/07-data-architecture/denormalization.md) — the model.

## Practical Exercise

Take the most consulted dashboard in your company. Find out where it reads from and how long it
takes.

If it reads from the transactional database, compute how much resource it consumes at peak hours. That
number is usually the argument that was missing.

## Interview Questions

- Why is columnar storage better for aggregation?
- Why does the normalization criterion invert in analytics?
- How does a non-idempotent load corrupt analytical numbers?

## Further Reading

- Kimball, Ralph; Ross, Margy. *The Data Warehouse Toolkit*. 3rd ed. Wiley, 2013.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 3.
- Abadi, Daniel et al. *The Design and Implementation of Modern Column-Oriented Database Systems*,
  2013.
