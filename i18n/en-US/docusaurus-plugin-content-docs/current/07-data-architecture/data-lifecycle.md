---
id: data-lifecycle
title: Data Lifecycle
sidebar_position: 21
description: Retention, archiving and erasure — the decisions nobody makes until the bill or the regulator arrives.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader defines a retention policy per data set and designs
  erasure before needing it.
prerequisites: [data-architecture]
related: [data-ownership, data-partitioning, data-lakes]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Lifecycle

## Overview

All data is born, is used with decreasing frequency, and at some point should be archived or erased.

Almost no system models that. The default is keeping everything forever, because storage is cheap and
nobody wants to be responsible for deleting something that turns out to be needed.

The result appears in three forms: cost growing out of control, performance degrading with the volume,
and regulatory exposure over data that should no longer exist.

## Problem

"Keep everything" is not a decision — it is the absence of one.

And it has costs that accumulate:

**Direct cost.** Storage, backups, replication. Every byte is paid for several times.

**Performance cost.** Larger tables, larger indexes, slower maintenance.

**Risk cost.** Personal data kept beyond what is necessary is a liability. A breach exposes what could
already have been erased.

**Operational cost.** Longer restores, riskier migrations.

## Core Concepts

### The stages

```text
active       frequent access, fast storage
warm         occasional access, cheaper storage
cold         rare access, archival
erased       no longer exists
```

The transition between them should be automatic and policy-based, not dependent on someone remembering.

Most systems have only the first stage — and a table that only grows.

### Retention is a business and legal decision

The engineering team cannot define how long to keep data. The question has three answers that have to be
reconciled:

**The legal minimum.** Tax, employment, sector-specific.

**The legal maximum.** Data protection regulation requires not keeping personal data beyond what is
necessary for the purpose.

**The business need.** Historical analysis, support, auditing.

The point that surprises: there is a **maximum**, not only a minimum. Keeping data as a precaution can
violate the regulation just as much as erasing too early.

### Erasure has to be designed

If the system has never erased anything, it probably cannot.

The concrete obstacles:

**References.** Erasing a customer with orders, invoices and associated records.

**Copies.** The data is in the database, in the replica, in the backup, in the warehouse, in the lake, in
the search index, in the application logs.

**Immutability.** [Event sourcing](/06-distributed-systems/distributed-event-sourcing.md) and lakes with
immutable files.

**Performance.** Deleting millions of rows from a large table is an hours-long operation.

The last is solved by [partitioning](/07-data-architecture/data-partitioning.md). The other three require
an architectural decision beforehand, not afterwards.

### Anonymizing as an alternative to erasing

When the historical data has analytical value and the personal data cannot be kept, the way out is
removing what identifies and preserving the rest.

Two traps:

**Insufficient anonymization.** A data set with no name but with a postal code, a birth date and a gender
frequently re-identifies individuals.

**Anonymization broken by cross-referencing.** Two separately anonymized data sets can re-identify when
combined.

Anonymizing is harder than it looks, and "we removed the name" is not anonymization.

### Per-subject encryption solves the immutable case

For data that cannot be physically erased — event sourcing, immutable files — the technique is storing the
personal data encrypted with a per-subject key.

Erasing becomes discarding the key. The record remains, and the personal content becomes unrecoverable.

It has to be designed from the start. Retrofitting requires rewriting the history.

### The inventory is the prerequisite

None of that is possible without knowing where the data is.

A minimum inventory per data set: which personal data it contains, what the legal basis is, what retention
is defined, who the [owner](/07-data-architecture/data-ownership.md) is, what the copies are.

Without that, an erasure request cannot be honestly fulfilled — what you answer is "we erased it where we
found it".

## Mental Model

**Not deciding the retention is deciding to keep it forever.** And "forever" has growing cost and risk.

## When to Use

A lifecycle policy pays off whenever:

- The data grows continuously.
- Personal data is involved.
- There is a regulatory requirement.
- The storage cost is relevant.
- Performance degrades with the volume.
- There is data nobody has queried in years.

## When Not to Use

**Erasing data with a legal retention requirement.** The legal minimum comes first.

**Erasing without inventorying the copies.** Erasing from the source and keeping it in the warehouse
complies with nothing.

**Archiving without testing recovery.** An unrecoverable archive is lost data.

**Naive anonymization.** Removing the name is not enough.

**Retention defined by engineering alone.**

**Erasure with no audit trail.** You have to be able to prove it was done.

## Alternatives

- **Archiving** — moving to cold storage instead of erasing.
- **Anonymization** — preserving analytical value with no personal data.
- **Aggregation** — keeping the summary and discarding the detail.
- **Per-subject encryption** — for immutable stores.
- **Retention by partition** — instantaneous discard. See
  [partitioning](/07-data-architecture/data-partitioning.md).

## Trade-offs

| Long retention | Short |
|---|---|
| History available | Lost |
| Growing cost | Controlled |
| Greater exposure | Less |
| Performance degrades | Stable |
| Compliance at risk | Facilitated |

| Archive | Erase |
|---|---|
| Recoverable | Irreversible |
| Residual cost | Zero |
| Still an exposure | Eliminates it |
| Slow recovery | — |

## Failure Modes

**Unbounded growth.** Cost and degradation.

**Incomplete erasure.** The data remains in copies.

**Accidental erasure of data with mandatory retention.**

**An unrecoverable archive.** An obsolete format, failed media, a lost key.

**Reversible anonymization.**

**An erasure request that cannot be fulfilled.**

**A backup holding what was erased.** The backup's retention has to enter the calculation.

## Common Mistakes

**Not defining retention.**

**Defining it without consulting legal counsel.**

**Not inventorying the copies.**

**Not testing archive recovery.**

**Not designing erasure in immutable systems.**

**Ignoring application logs.** They frequently contain personal data and rarely enter the policy.

## Real-World Example

An e-commerce company received a personal data deletion request from a customer.

The response took five weeks and was incomplete.

The hastily assembled inventory found the personal data in eleven places:

```text
transactional database      expected
replicas                    a consequence of replication
backups                     90-day retention
warehouse                   customer dimension
data lake                   raw layer, immutable files
search index                indexed profile
cache                       sessions
application logs            1-year retention, with registration data
support system              third party
email platform              third party
spreadsheet exports         shared by analysts
```

The last three were not under direct control. The exports were unknown until someone mentioned them in a
meeting.

The lake was the hardest problem: immutable files, with no inventory of which ones contained that
customer's data.

What was done afterwards:

**A personal data inventory** per data set, mandatory at ingestion. With no declared classification,
ingestion is refused.

**Per-subject encryption** in the lake's raw layer, allowing erasure by discarding the key. Retrofitting
it onto the existing history took four months.

**Retention defined per data set**, with legal, product and engineering. The discussion revealed that 60%
of the stored data had neither a legal requirement nor a business use.

**Application logs** with personal data filtering at the source, and retention reduced from 1 year to 90
days.

**Exports** prohibited outside the governed platform, with an alternative that met the analysts' real
need.

**An erasure process** automated, covering the in-house systems, with a documented procedure for the third
parties — and an audit trail of what was erased.

The reading the team takes from it: the request was from a single customer. The work it triggered took six
months, and would have been a fraction of that if the classification had existed from the start.

## Related Concepts

- [Data Ownership](/07-data-architecture/data-ownership.md) — who decides the retention.
- [Data Partitioning](/07-data-architecture/data-partitioning.md) — efficient discard.
- [Data Lake](/07-data-architecture/data-lakes.md) — where the problem is hardest.
- [Event Sourcing](/06-distributed-systems/distributed-event-sourcing.md).

## Practical Exercise

Pick a personal data set in your system and list **every** place it exists — including backups,
application logs and exports.

Then ask how long it would take to erase it from all of them. The answer is the measure of your exposure.

## Interview Questions

- Why is there a retention maximum, and not only a minimum?
- How do you erase personal data from an immutable store?
- Why is "we removed the name" not anonymization?

## Further Reading

- Data protection regulation — the principles of necessity and purpose limitation (Brazil's LGPD, Law
  13,709/2018, art. 6; the EU's GDPR, art. 5).
- Sweeney, Latanya. *Simple Demographics Often Identify People Uniquely*, 2000.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 12.
