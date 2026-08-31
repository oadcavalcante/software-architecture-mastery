---
id: column-stores
title: Column Stores
sidebar_position: 5
description: Storing by column instead of by row — the order-of-magnitude difference in analytical workloads.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader understands why columnar transforms analytical performance
  and why it is unsuitable for transactional workloads.
prerequisites: [olap]
related: [data-warehouses, oltp, data-partitioning]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Column Stores

## Overview

Columnar storage keeps each column's values together, instead of keeping whole rows in sequence.

The change is one of physical layout, not of logical model — the table is still a table. And it
produces differences of one to two orders of magnitude in analytical queries.

Understanding **why** is what lets you predict when the gain will appear and when it will not.

## Problem

A typical analytical query reads few columns from a wide table:

```sql
SELECT region, SUM(amount) FROM sales WHERE year = 2025 GROUP BY region
```

Three columns from a table that may have fifty.

In row-oriented storage, a row's values are adjacent on disk. To read three columns, you have to bring
the whole row — the other forty-seven come along and are discarded.

Over billions of rows, that is most of the work, and no index solves it: the problem is not finding the
rows, it is that they are wide.

## Core Concepts

### Reading only what is needed

In the columnar layout, each column is a file. Reading three columns reads three files and ignores the
other forty-seven.

The gain is proportional to the ratio between columns read and total columns. In a fifty-column table
where the query uses three, the volume read drops by a factor near sixteen.

That also explains the limit: in a five-column table where the query uses four, the layout gain nearly
disappears.

### Compression is the second gain, and frequently the larger one

Values in the same column are of the same type and frequently repeat. A country column has two hundred
distinct values across billions of rows.

That compresses extraordinarily well — dictionary, run-length, delta — with ratios of five to twenty
times being common.

And the effect multiplies with the first: fewer columns, each one much smaller.

There is an additional effect that usually goes unnoticed: compressed data fits in memory. A 2 TB table
that compresses to 150 GB can be processed without touching disk.

### The physical ordering changes everything

Physically ordering the data by a column — the date, typically — allows skipping whole blocks.

Each block stores each column's minimum and maximum value. A query filtering by a month discards the
blocks whose range does not intersect, without reading anything from them.

That makes the choice of ordering as important as the choice of index in OLTP — and it is why period
filters are fast and filters on another dimension are not.

### Why it is bad at OLTP

**Writing one row** means writing to fifty different places.

**Updating a value** requires decompressing a block, changing it and recompressing.

**Reading a whole row by key** requires assembling the row from fifty files — the worst possible case.

It is not missing tuning. It is the layout working against what the workload needs. See
[OLTP](/07-data-architecture/oltp.md).

### Batch writing is the natural mode

Columnar wants to receive many records at once. Individual inserts produce small files and fragmentation
that degrades reads.

Columnar systems usually have a compaction process that merges small files. When it does not keep up
with the write rate, read performance drops progressively — and the diagnosis is counterintuitive,
because the query got worse with no change in volume.

## Mental Model

**Columnar trades row efficiency for column efficiency.** Whoever reads many rows and few columns gains;
whoever reads a whole row loses.

## When to Use

- An analytical workload over large volumes. See [OLAP](/07-data-architecture/olap.md).
- Wide tables with queries that use few columns.
- Historical data, written in batches, rarely updated.
- Aggregation over millions or billions of rows.
- Compression matters for storage cost.

## When Not to Use

**For a transactional workload.** Every point of the layout works against it.

**For reading complete individual records.**

**For frequent value updates.**

**When the table has few columns.** The layout gain disappears.

**When the volume is small.** A few million rows in an indexed relational database do not justify the
complexity.

**For record-by-record writing.** Fragmentation.

## Alternatives

- **Row-oriented with an index** — sufficient up to moderate volumes.
- **A columnar index inside a relational database** — several offer it, allowing both workloads in the
  same place at medium scale.
- **Materialized view** — pre-aggregation with no storage change.
- **Columnar files in object storage** — queried on demand, when the frequency is low.

The second option solves many cases: if the volume is large but not enormous, a columnar index over the
existing table avoids a whole platform.

## Trade-offs

| Columnar | Row-oriented |
|---|---|
| Reads only the used columns | Reads the whole row |
| High compression | Low |
| Efficient scans | Efficient access by key |
| Batch writes | Individual writes |
| Expensive updates | Cheap |
| Ideal for aggregation | For transactions |

## Failure Modes

**Fragmentation from individual writes.** Many small files degrade reads.

**A query with no ordering filter.** It scans everything, because there is no block to skip.

**`SELECT *` on a wide table.** It nullifies the entire benefit — it reads every column.

**A bulk update.** Rewriting and recompressing large blocks.

**Delayed compaction.** Performance drops with no change in volume.

**High cardinality in the ordering column.** The blocks do not separate well and the skipping does not
happen.

## Common Mistakes

**Using `SELECT *`.** It is this layout's specific antipattern.

**Inserting record by record.**

**Not choosing the physical ordering** — keeping the default wastes the main filtering mechanism.

**Expecting transactional performance.**

**Not monitoring compaction.**

## Real-World Example

A telecommunications company stored call records in a row-oriented relational database: 12 billion rows,
60 columns, 4 TB.

The monthly consumption report per customer took 4 hours.

The migration to columnar produced numbers the team documented:

**Volume on disk.** From 4 TB to 280 GB — 14× compression, mostly in the carrier, call type and area
code columns.

**The same query.** From 4 hours to 3 minutes. The gain came from three sources: reading 6 columns
instead of 60, compressed data, and block skipping from the period filter, with the data ordered by
date.

**Cost.** It dropped because of the compression, not the processing.

Two problems after the migration:

**`SELECT *` in an exploration tool.** Analysts used a tool that generated queries with every column.
Those queries became **slower** than in relational — they had to assemble 60 columns per row. Solved with
mandatory column projection in the access layer.

**Real-time ingestion.** An attempt to write calls individually, as they happened, created millions of
small files. The query that took 3 minutes came to take 25. Ingestion went back to five-minute batches.

What the team records about the second case: the intuition of "the fresher the data, the better" was
reasonable and cost two weeks of degradation until someone connected the two things. The real freshness
requirement was daily.

## Related Concepts

- [OLAP](/07-data-architecture/olap.md) — the workload it serves.
- [OLTP](/07-data-architecture/oltp.md) — the workload it does not serve.
- [Data Warehouse](/07-data-architecture/data-warehouses.md) — where it usually lives.
- [Data Partitioning](/07-data-architecture/data-partitioning.md) — it complements block skipping.

## Practical Exercise

Take the heaviest analytical query in your system. Count how many columns it uses and how many the table
has.

That ratio is a direct estimate of the gain the columnar layout would bring — and if it is close to 1,
the layout is not your problem.

## Interview Questions

- Why does columnar compress much better?
- Why is `SELECT *` this layout's antipattern?
- How does physical ordering speed up filtered queries?

## Further Reading

- Abadi, Daniel et al. *The Design and Implementation of Modern Column-Oriented Database Systems*, 2013.
- Stonebraker, Michael et al. *C-Store: A Column-oriented DBMS*. VLDB, 2005.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 3.
