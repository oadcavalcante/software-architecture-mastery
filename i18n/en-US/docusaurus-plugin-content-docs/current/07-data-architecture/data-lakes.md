---
id: data-lakes
title: Data Lakes
sidebar_position: 10
description: Storing raw and interpreting later — and the thin line between a lake and a dump.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes what separates a usable data lake from a file
  dump, and what has to exist from day one.
prerequisites: [data-warehouses]
related: [data-lakehouses, data-ownership, data-lifecycle]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Lakes

## Overview

A data lake stores data in its raw format, in cheap storage, without requiring prior modeling.

The idea is reasonable: store now and decide later how to interpret it — because you do not always know,
at ingestion, which questions will be asked.

The idea fails in a specific and well-documented way: with no catalog, no owner and no quality control,
the lake becomes a dump where nobody finds anything and nobody trusts what they find.

## Problem

A [data warehouse](/07-data-architecture/data-warehouses.md) requires deciding the model before
ingesting. That costs time and discards what was not foreseen.

Data that does not fit in tables — application logs, images, documents, event streams — is left out.

The lake solves that by inverting it: it stores everything, and the structure is applied on read.

The cost of that inversion is that the discipline the schema imposed disappears, and it has to be
replaced by other means. When it is not, the result is well known.

## Core Concepts

### Schema on read moves the work, it does not eliminate it

In the warehouse, the structure is validated on write. In the lake, each reader interprets.

That gives flexibility and transfers a cost: if ten teams read the same file, ten interpretations can
diverge. A format change at the source breaks all ten, at different moments, with no warning.

It is not an argument against the model. It is an argument for a catalog and a contract.

### The zones

The design that works separates the lake into layers with distinct purposes:

```text
raw          exactly as it arrived, immutable, no transformation
refined      cleaned, deduplicated, typed, in a columnar format
curated      modeled by domain, ready for consumption
```

The raw layer is the lake's reason to exist — it allows reprocessing when the transformation turns out
to be wrong.

The common error is consuming directly from the raw layer. It is raw material, not a product.

### The catalog is not optional

A lake with no catalog is a file system.

The catalog answers: what exists, what it means, where it came from, who owns it, what the format is,
what the update frequency is, what the retention is.

Without it, each new question starts with weeks of archaeology — and frequently ends with someone
ingesting the same data again, because they did not find what was already there.

This is the difference between a lake and a swamp, and it is practically the only one.

### The file format matters more than it seems

Storing in a text format — JSON, CSV — is convenient and expensive: no efficient compression, no types,
no selective column reading.

Columnar formats compress several times better and allow reading only the necessary columns. See
[columnar](/07-data-architecture/column-stores.md).

The raw layer can keep the original format. The refined and curated layers should not.

### Small files degrade everything

Continuous ingestion produces thousands of small files. Each query has to open all of them.

A lake with millions of small files becomes slow in a way that is not solved with more capacity.
Periodic compaction is mandatory maintenance, not an optimization.

### Governance has to come first, not later

Personal data in a lake is the characteristic regulatory problem: immutable files, copied, with no idea
who has access to what.

Classification at ingestion, access control per zone and a retention policy have to exist from day one.
See [data lifecycle](/07-data-architecture/data-lifecycle.md).

Retrofitting governance onto a lake with years of accumulation is a months-long project, and rarely
complete.

## Mental Model

**The lake trades discipline on write for discipline on read.** If the second does not exist, none is
left.

## When to Use

- Data in varied formats, including non-tabular.
- The future questions are not known.
- High volume with a relevant storage cost.
- A need to keep the raw data for reprocessing.
- Data science and exploration.
- Ingestion from many sources with unstable schemas.

## When Not to Use

**With no catalog.** It becomes a dump.

**With no defined owners per data set.** With no named owner, nobody fixes broken ingestion or answers
what the column means — and the data set rots in use.

**For recurring analytical queries with stable definitions.** See
[warehouse](/07-data-architecture/data-warehouses.md).

**As the operational source of truth.** Ingestion latency and the absence of transactions make the lake
unsuitable for deciding whether there is stock right now.

**With no personal data classification.** Without knowing where personal data is, there is no way to
comply with a deletion request or limit access — and the obligation exists regardless of whether the
organization can answer.

**To replace a warehouse that works.** They are complementary.

## Alternatives

- **[Warehouse](/07-data-architecture/data-warehouses.md)** — when the questions are known.
- **[Lakehouse](/07-data-architecture/data-lakehouses.md)** — the convergence.
- **Object storage with a catalog** — the minimum viable version, which solves a good part of the cases
  with no platform.
- **Keeping it at the source** — if nobody consumes it, ingesting is pure cost.

## Trade-offs

| Lake | Warehouse |
|---|---|
| Cheap and fast ingestion | Modeling first |
| Any format | Tabular |
| Unforeseen questions | The foreseen ones |
| Interpretation per reader | A single definition |
| Quality not guaranteed | Validated |
| Governance to build | Structured |

| Raw zone | Curated |
|---|---|
| Faithful to the source | Modeled |
| Reprocessable | Derived |
| Hard to consume | Ready |
| No quality guarantee | With a guarantee |

## Failure Modes

**A swamp.** Nobody knows what exists.

**Duplicated ingestion.** The same data enters several times through different paths.

**Small files.** Queries degrade progressively.

**A broken format at the source.** Consumers fail at different moments.

**Cost growing out of control.** With no retention, everything stays forever.

**Personal data with no traceability.** A deletion order with no way to comply.

**Divergent interpretations.** Two teams, two numbers from the same file.

## Common Mistakes

**Starting with no catalog.** Without knowing what exists, where it came from and what it means, stored
data is indistinguishable from non-existent data — and the cost has already been paid.

**Consuming directly from the raw zone.** Each consumer reimplements cleaning and interpretation its own
way, and two reports about the same fact start diverging with nobody knowing which is right.

**Storing everything in a text format.** JSON and CSV force reading the whole file to answer about three
columns. A columnar format reduces reading and cost by an order of magnitude, and the conversion is cheap
at ingestion.

**Not compacting small files.** Continuous ingestion generates thousands of files per day, and the cost
of listing and opening them starts exceeding the cost of reading the data.

**No retention policy.** "Store everything, decide later" is a growing-cost decision made by omission —
and, when there is personal data, also a growing regulatory exposure.

**Ingesting data nobody asked for**, as a precaution. Each source has an ingestion, storage, cataloging
and compliance cost. A precaution with no identified consumer is a guaranteed cost for a hypothetical
benefit.

## Real-World Example

A logistics company built a lake to consolidate tracking, vehicle telemetry, tax invoices and application
logs.

In eighteen months it accumulated 400 TB. And it produced two reports.

The diagnosis:

**No catalog.** 12 thousand folders with no documentation. An analyst took weeks to find out whether a
piece of data existed. Three teams had ingested the same tax invoice source, in different formats,
unaware of each other.

**Everything in compressed JSON.** A query over one month of telemetry read 8 TB to use three fields.

**14 million small files.** Ingestion wrote one file per minute per vehicle. Queries took hours opening
files.

**No retention.** Two years of application logs, which nobody queried, occupied 60% of the volume.

**Personal data scattered.** Drivers' names and documents spread across several data sets, with no
inventory. A deletion request could not be met with confidence.

The recovery took eight months:

**A catalog** with a mandatory owner per data set — with no declared owner, ingestion is blocked.

**Explicit zones**, with the refined layer in a columnar format partitioned by date. The telemetry query
dropped from 8 TB to 40 GB read.

**Daily compaction**, reducing it to 60 thousand files.

**Retention per data set**, cutting 45% of the volume in the first month.

**Personal data classification** at ingestion, with a restricted zone.

The lesson that stuck: none of those measures is hard or expensive — they are all cheap if adopted at the
ingestion of the first data set. Retrofitting cost eight months because each decision had to be applied
to data that was already there, with no documentation of its origin.

## Related Concepts

- [Data Warehouse](/07-data-architecture/data-warehouses.md) — the complement.
- [Lakehouse](/07-data-architecture/data-lakehouses.md) — the convergence.
- [Data Ownership](/07-data-architecture/data-ownership.md) — what prevents the swamp.
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md) — retention.

## Practical Exercise

If you have a lake, answer: how many data sets exist, who owns each one, and how many were queried in the
last 90 days?

The third answer is usually the most revealing — and it is the argument for a retention policy.

## Interview Questions

- What separates a data lake from a swamp?
- Why is consuming from the raw zone an error?
- Why do small files degrade performance?

## Further Reading

- Dixon, James. *Pentaho, Hadoop, and Data Lakes*, 2010 — the origin of the term.
- Gorelik, Alex. *The Enterprise Big Data Lake*. O'Reilly, 2019.
- Dehghani, Zhamak. *Data Mesh*. O'Reilly, 2022.
