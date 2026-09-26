---
id: data-lifecycle
title: Data Lifecycle
sidebar_position: 21
description: "Retention, archiving and erasure: the decisions nobody makes until the bill or the regulator arrives."
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
translated_from_version: 3
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

"Keep everything" is the absence of a decision.

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

Most systems have only the first stage, and a table that only grows.

### Retention is a business and legal decision

The engineering team does not decide alone how long to keep data. The question has three answers that have to be
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

The way out only holds if it is actual anonymization, not pseudonymization. The difference, and why
"we removed the name" is not enough, is in
[data protection](/10-security/data-protection.md#pseudonymization-and-anonymization-are-not-the-same-thing).

What the lifecycle adds: pseudonymized data is still personal and still subject to the retention maximum;
only anonymized data leaves the clock. That is why anonymization is a dated transition (executed when the
personal data's deadline expires), and when the analysis only needs totals, aggregation is the safer
transition, because it discards the detail that would allow re-identification.

### Per-subject encryption solves the immutable case

For data that cannot be physically erased (event sourcing, immutable files), the technique is
[per-subject encryption](/10-security/encryption.md#per-subject-encryption-solves-deletion): erasing
becomes discarding the key, and retrofitting requires rewriting the history.

What it brings to the lifecycle is that retention moves from the data to the key. The key vault now holds
the most sensitive policy in the system: if its backups keep keys longer than the subject's retention, the
"discarded" key comes back on restore, and the erasure is undone. Intentional discard coexists with the
opposite rule of [key management](/10-security/key-management.md), which forbids discarding a key while
any data still depends on it.

### The inventory is the prerequisite

None of that is possible without knowing where the data is.

A minimum inventory per data set: which personal data it contains, what the legal basis is, what retention
is defined, who the [owner](/07-data-architecture/data-ownership.md) is, what the copies are.

Without that, an erasure request cannot be honestly fulfilled: what you answer is "we erased it where we
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

**A small data set, with stable volume and no personal data.** Reference tables and configuration
catalogs: the cost of building and operating automatic transitions exceeds the cost of keeping everything,
and there is no legal maximum to respect. A recorded decision to keep it is enough.

**Data under a preservation obligation.** Ongoing litigation, investigation or audit freezes erasure for
that data set or subject. The automatic cycle does not apply while the obligation lasts (erasing during
that period is destruction of evidence), which is why the policy needs a suspension mechanism before it
needs one.

**A system with a scheduled shutdown.** If the system goes out of operation in months and the data migrates
with it, the policy applies to the destination. Building stages in the system that is about to die is wasted
work; it is enough to make sure the migration does not carry what should already have been erased.

## Alternatives

- **Archiving**: moving to cold storage instead of erasing.
- **Anonymization**: preserving analytical value with no personal data.
- **Aggregation**: keeping the summary and discarding the detail.
- **Per-subject encryption**: for immutable stores.
- **Retention by partition**: instantaneous discard. See
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
| An erasure request requires scanning the archive | Nothing to scan |

## Failure Modes

**Unbounded growth.** Cost and degradation.

**Incomplete erasure.** The data remains in copies.

**Accidental erasure of data with mandatory retention.**

**An unrecoverable archive.** An obsolete format, failed media, a lost key.

**Reversible anonymization.**

**An erasure request that cannot be fulfilled.**

**A backup holding what was erased.** The backup's retention has to enter the calculation.

## Common Mistakes

**Not defining retention.** The default becomes keeping forever, and the first discussion about deadlines
happens under pressure: over the bill that doubled or the deletion request that cannot be fulfilled.

**Defining retention in engineering alone, without legal counsel.** Engineering picks a round number, and
it lands below the tax minimum or above the data protection maximum; the error only shows up in an audit
or a deletion request.

**Erasing from the source without inventorying the copies.** The data disappears from the database and
stays in the warehouse, the search index and the backups; the answer to the subject says "erased" and it
is not true.

**Archiving without testing recovery.** An obsolete format, failed media or a lost key only reveal
themselves on the day an audit or a lawsuit asks for the data, and then the archive is lost data.

**Treating name removal as anonymization.** The data set is kept past the deadline as if it had left the
scope, and it is still re-identifiable: it is personal data kept beyond the maximum.

**Not designing erasure in immutable systems.** The first deletion request in a lake or an event log
requires rewriting the history; in the example below, retrofitting took four months.

**Erasing with no audit trail.** The erasure was done, but there is no way to prove to the subject or the
regulator what, when and from where.

**Ignoring application logs.** They frequently contain personal data and rarely enter the policy.

## Real-World Example

An e-commerce company kept everything in a single stage. Seven years of orders, browsing events and
application logs lived in the transactional database and in the lake's raw layer, with no transition to
warm or cold and nothing ever erased.

The cost showed up diffusely: the storage and backup bill grew along with the volume, and index
maintenance on the orders table no longer fit in the nightly window. Nobody treated it as a policy problem
until a single customer's deletion request took five weeks to answer, and was answered incompletely.

The response stalled on two points that only existed because the data had never left the first stage:

**The lake.** Immutable files, with no record of which ones contained that customer's data. Erasing
required rewriting years of a raw layer nobody queried.

**The copies with no policy.** Application logs kept registration data for a year, and spreadsheet
exports, shared by analysts, were unknown until someone mentioned them in a meeting.

What was done afterwards:

**A personal data inventory** per data set, mandatory at ingestion. With no declared classification,
ingestion is refused.

**Per-subject encryption** in the lake's raw layer, allowing erasure by discarding the key. Retrofitting
it onto the existing history took four months.

**Retention defined per data set**, with legal, product and engineering, and automatic transition between
stages. The discussion revealed that 60%
of the stored data had neither a legal requirement nor a business use.

**Application logs** with personal data filtering at the source, and retention reduced from 1 year to 90
days.

**Exports** prohibited outside the governed platform, with an alternative that met the analysts' real
need.

**An erasure process** automated, covering the in-house systems, with a documented procedure for the third
parties, and an audit trail of what was erased.

The reading the team takes from it: the request was from a single customer. The work it triggered took six
months, and would have been a fraction of that if the classification had existed from the start.

## Related Concepts

- [Data Ownership](/07-data-architecture/data-ownership.md): who decides the retention.
- [Data Partitioning](/07-data-architecture/data-partitioning.md): efficient discard.
- [Data Lake](/07-data-architecture/data-lakes.md): where the problem is hardest.
- [Event Sourcing](/06-distributed-systems/distributed-event-sourcing.md).
- [Data Protection](/10-security/data-protection.md): pseudonymization, anonymization and the inventory
  from the security point of view.
- [Encryption](/10-security/encryption.md): per-subject encryption.
- [Key Management](/10-security/key-management.md): why discarding a key is the exception, not the rule.

## Practical Exercise

Pick a personal data set in your system and list **every** place it exists, including backups,
application logs and exports.

Then ask how long it would take to erase it from all of them. The answer is the measure of your exposure.

## Interview Questions

- Why is there a retention maximum, and not only a minimum?
- How do you erase personal data from an immutable store?
- Why is "we removed the name" not anonymization?

## Further Reading

- Data protection regulation: the principles of necessity and purpose limitation (Brazil's LGPD, Law
  13,709/2018, art. 6; the EU's GDPR, art. 5).
- Sweeney, Latanya. *Simple Demographics Often Identify People Uniquely*, 2000.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017. Chapter 12.
