---
id: rpo
title: RPO
sidebar_position: 9
description: How much data can be lost — and why the answer "none" is almost never true.
doc_type: foundation
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader defines the RPO with the business and knows what each value
  requires of the replication.
prerequisites: [reliability]
related: [rto, disaster-recovery-planning, failover]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# RPO

## Overview

RPO — recovery point objective — is **how much data can be lost** in a recovery.

If the most recent usable copy is from an hour ago, the RPO is one hour: everything that happened after
that is lost.

Like the [RTO](/12-reliability/rto.md), it is a business decision. And, unlike it, it has a reflexive
answer that almost never holds: "no data can be lost".

## Why This Matters

An RPO of zero requires synchronous replication — each write acknowledged in more than one place before
responding to the user.

That costs latency on **every** write operation, permanently. See
[PACELC](/06-distributed-systems/pacelc.md).

```text
synchronous in the same zone   +1 to 2 ms
synchronous between zones      +2 to 5 ms
synchronous between regions    +30 to 150 ms
```

The last line makes most transactional systems unviable. An RPO of zero across regions is rare, expensive,
and frequently promised with nobody having done the arithmetic.

And there is a second cost: synchronous replication couples availability. If the synchronous copy does not
respond, the write does not commit — the system becomes unavailable in order to preserve the RPO.

## Core Concepts

### The RPO defines the replication mechanism

```text
RPO         mechanism                            cost
24 h        a daily backup                       minimal
1 h         an hourly backup, or a continuous log  low
minutes     asynchronous replication             medium
seconds     close asynchronous replication       medium-high
zero        synchronous replication              high, with permanent latency
```

See [data replication](/07-data-architecture/data-replication.md).

The cost jump between "seconds" and "zero" is the largest in the table, and it is where the conversation
with the business needs to happen with numbers.

### An RPO per type of data

Like the RTO, it does not need to be a single one:

```text
financial transactions   zero or seconds
customer records         minutes
interface preferences    hours
access logs              a day
```

That allows applying synchronous replication only where it is justified, keeping the rest asynchronous. It
is frequently the difference between viable and unviable.

### The real RPO can be worse than the configured one

Three situations in which the loss exceeds the objective:

**Replication lag above normal.** Under high load, the replica falls further behind. The effective RPO is
the lag at the moment of the failure, not the average lag.

**A corrupted backup.** If the most recent copy does not restore, the RPO is the previous one's. That makes
restore testing part of the RPO guarantee, not an operational detail.

**Logical corruption.** If the data was corrupted before the copy, restoring it restores the corruption.
The relevant RPO becomes that of the last copy **prior to the problem** — which can be days.

The third case is what justifies retaining several generations and keeping a
[delayed replica](/07-data-architecture/data-replication.md).

### Replication does not guarantee an RPO against human error

A destructive command replicates in seconds. The RPO against hardware failure can be seconds, and against
human error it can be hours — the interval back to the previous copy.

Declaring a single RPO with no distinction of scenario is the most common conceptual mistake here.

### The RPO needs to account for what is in flight

Beyond what was written, a system has work in progress that the RPO discussion usually ignores.

```text
messages in a queue not consumed
requests accepted and not processed
work in processes' memory
files in transfer
open transactions
```

If the queue is durable and replicated, it enters the same calculation as the database. If it is in memory,
or if the requests were accepted and not yet persisted, that work is lost regardless of the database's RPO.

See [asynchronous processing](/11-scalability/async-processing.md) — accepting and not persisting is the
most common way of losing work with no metric recording it.

The check: sum what is in flight at the typical peak moment. If that volume matters, it needs to be treated
with the same rigor as the database.

## Common Mistakes

**Promising an RPO of zero** without calculating the latency cost.

**A single RPO** for every type of data.

**Not measuring the real replication lag** at the high percentile.

**Not testing the restore**, which makes the RPO a hypothesis.

**Not distinguishing the scenario.** The RPO against hardware failure and against human error are
different.

**Confusing it with [RTO](/12-reliability/rto.md).**

## Real-World Example

A brokerage declared an RPO of zero for the order system, with synchronous replication between two zones.

The verification found three problems.

**The zero RPO was partial.** The synchronous replication covered the orders database. The reconciliation
system, which recorded the exchange's confirmations, used asynchronous replication with a typical lag of 4
seconds. In a failure, orders would exist with no corresponding confirmation — the worst possible state for
a brokerage.

**The real lag was worse than the typical one.** At market open, the asynchronous replication's lag reached
40 seconds. The effective RPO on that component was 40 seconds, not 4.

**Human error was not covered.** The backups were daily. A destructive command at 2 p.m. would mean losing
the whole day — an RPO of up to 24 hours against that scenario, despite the declared "RPO of zero".

The reformulation:

**An RPO per type of data**, with the reconciliation system moving to synchronous alongside the orders one
— the additional 3 ms of latency was accepted once measured.

**An RPO per scenario**, declared explicitly:

```text
instance or zone failure   zero
human error or corruption  15 minutes
regional disaster          5 minutes
```

**A 15-minute delayed replica**, covering the human error scenario — the cheapest of the three controls and
the one that did not exist.

**Backups every 15 minutes** through a continuous log, replacing the daily one.

**A monthly restore test**, with the effective RPO measured and recorded.

What the team records: "RPO of zero" was true for one component and false for the system. And the most
likely scenario — human error — was the least covered, with an exposure of up to 24 hours nobody had
noticed.

## Related Concepts

- [RTO](/12-reliability/rto.md) — the partner.
- [Disaster Recovery Planning](/12-reliability/disaster-recovery-planning.md).
- [Data Replication](/07-data-architecture/data-replication.md).
- [PACELC](/06-distributed-systems/pacelc.md) — the cost of synchronous.

## Practical Exercise

Measure your database's replication lag at the 99th percentile over the last week, not the average.

That number is your real RPO against infrastructure failure. Compare with the declared one.

## Interview Questions

- Why does an RPO of zero cost permanent latency?
- Why can the real RPO be worse than the configured one?
- Why is the RPO against human error different from the RPO against hardware failure?

## Further Reading

- ISO 22301 — business continuity management.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- NIST SP 800-34 — contingency planning.
