---
id: data-replication
title: Data Replication
sidebar_position: 16
description: Copies of the same data in different places — seen from the storage and operations angle.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader configures replication knowing what it protects, what it
  does not protect and what lag the business accepts.
prerequisites: [data-architecture]
related: [data-partitioning, data-consistency, olap]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Data Replication

## Overview

Replicating is keeping copies of the same data on different nodes.

The fundamentals — synchronous and asynchronous, leader and followers — are in
[replication](/06-distributed-systems/replication.md). This document deals with the operational angle:
what replication actually protects, what it does not protect, and the decisions that appear when it is
in production.

The most expensive confusion in this section is between replication and backups.

## Problem

Replication is adopted for three different reasons, and each one requires a distinct configuration:

**Availability.** If the primary node goes down, another takes over.

**Read scale.** Distributing queries across replicas.

**Geographic proximity.** Serving reads close to the user.

Adopting it for one reason and assuming the others come along is the structural error. A replica
configured for read scale may not serve to take over as primary, and vice versa.

## Core Concepts

### Replication is not a backup

The most important distinction in this document.

Replication copies **everything**, including the error. A `DELETE` with no filter clause is replicated
in seconds to every replica. So is data corruption.

A backup has history: it allows going back to the state before the error.

```text
protects against            replication   backup
hardware failure            yes           yes (with restore time)
data center failure         yes           depends on where it is
human error                 no            yes
logical corruption          no            yes
an attack with deletion     no            yes, if isolated
```

Teams that trust replication as data protection discover the difference at the worst possible moment.

### The lag is the central operational metric

All asynchronous replication has lag, and it is not constant. See
[eventual consistency](/06-distributed-systems/eventual-consistency.md).

Three things make the lag spike: a high write load, a long transaction on the primary, and an index
rebuild on the replica.

Monitoring the lag is mandatory, and the metric has to be in seconds of staleness, not in pending bytes
— bytes say nothing to the business.

### Reading from a replica requires deciding what tolerates lag

The pattern that works is classifying the reads:

```text
critical read              primary — the balance before debiting
the user's own read        primary for N seconds after writing
general read               replica
report                     replica, or a dedicated replica
```

The second line is what eliminates most of the complaints. See
[eventual consistency](/06-distributed-systems/eventual-consistency.md).

And there is an operational detail that bites: heavy reports on a shared replica increase its lag for
everyone. A reporting replica should be dedicated.

### Failover is where everything goes wrong

The riskiest moment in the life of a replicated system.

**Lost writes.** With asynchronous replication, what the primary acknowledged and did not replicate is
lost when another replica is promoted.

**Split brain.** The old primary comes back and still considers itself primary. Two sources accepting
writes. See
[leader election](/06-distributed-systems/leader-election.md).

**Inconsistent cache.** The application keeps pointing at the old address.

**Divergent sequences.** Identifier counters can repeat values.

The failover has to be tested. A failover never exercised is not a plan — it is a hope.

### Deliberately delayed replication

A replica configured to stay deliberately one hour behind the primary.

It does not serve for reading or for taking over. It serves one purpose: when someone executes a
destructive command, there is an hour to notice and extract the data before the deletion arrives there.

It is cheap and covers exactly the case normal replication does not cover.

### Multiple primaries requires a conflict plan

Accepting writes on more than one node brings
[conflicts](/06-distributed-systems/conflict-resolution.md), and the default resolution discards data
silently.

The question before adopting: can each piece of data have a single owner per region? If it can,
partitioning solves it with no conflicts.

## Mental Model

**Replication protects against machine failure, not against human error.** Both protections are
necessary and they do not replace each other.

## When to Use

- High availability of the store.
- Read scale.
- Separating the analytical workload from the transactional one.
- Geographic proximity for reads.
- A delayed replica as a safety net against human error.

## When Not to Use

**As a substitute for backups.**

**To scale writes.** Replication does not help; see
[partitioning](/07-data-architecture/data-partitioning.md).

**Reading from a replica in a critical operation.**

**A shared replica for heavy reporting.**

**Multiple primaries with no conflict strategy.**

**Without monitoring the lag.**

**Without testing the failover.**

## Alternatives

- **Backups with tested restores** — for human error and corruption.
- **[Partitioning](/07-data-architecture/data-partitioning.md)** — for write scale.
- **Cache** — to reduce reads without replicating.
- **[Distributed CQRS](/06-distributed-systems/distributed-cqrs.md)** — a projection with its own model instead of
  an identical copy.

## Trade-offs

| Synchronous | Asynchronous |
|---|---|
| No loss on failover | Loses the unreplicated |
| Higher write latency | Lower |
| A slow replica stalls writes | Does not affect them |
| The replica is always current | Lagging |

| More replicas | Fewer |
|---|---|
| More read capacity | Less |
| More fault tolerance | Less |
| Cost and operations | Simplicity |
| More lag to monitor | Less |

## Failure Modes

**Human error replicated.** The deletion reaches every copy.

**Lag growing with no alert.**

**Lost writes during failover.**

**Split brain.**

**A silently stopped replica.** It keeps answering reads of frozen data.

**A restore never tested.** The backup exists and nobody knows whether it works.

The fifth is particularly dangerous: a stopped replica does not error — it answers stale data as if it
were current.

## Common Mistakes

**Treating replication as a backup.** The replica faithfully reproduces the wrong `DELETE`, in seconds.
It protects against losing a machine, not against human error or logical corruption.

**Not monitoring lag.** Replication lag varies with the write load. Without measuring it, nobody notices
when a replica read starts returning data from minutes ago instead of milliseconds.

**Not testing failover.** It is the procedure that is only executed during an incident. A mechanism
never exercised fails precisely the first time it is needed.

**Not testing backup restores.** An unverified backup is a hypothesis. What matters is the measured
restore time and the integrity of what comes back, not the file's existence.

**Reporting on a shared replica.** A heavy analytical query holds resources and makes the replica's lag
grow, degrading the operational reads that depended on it.

**Reading from a replica without classifying the reads.** Not every read tolerates lagging data. Sending
everything to the replica makes the user save a change and not see it on reload — which they report as
data loss.

## Real-World Example

A financial services company had its database replicated across three nodes, with daily backups.

One morning, a defective migration erased a column across 2 million records — not the whole data, only
one field, replaced with null.

Replication propagated it in 4 seconds. The three replicas became identical to the primary, all wrong.

The previous night's backup existed. And the full restore took 6 hours and would roll back the whole
system, discarding 9 hours of legitimate transactions.

What saved them was something created for another reason: a one-hour delayed replica, configured months
earlier to investigate a performance problem and never removed.

It still had the column intact. The data was extracted and applied selectively, without touching the
day's transactions. Total time: 40 minutes.

After the incident, three changes:

**The delayed replica made official**, at one hour, with a documented purpose.

**Restores tested monthly**, in a separate environment, with the time measured. The first run revealed
that the documented procedure was out of date and did not work as written.

**Destructive migrations** came to require a copy of the affected table beforehand, and a second
person's approval.

The reading the team takes from it: the protection that worked existed by accident. Nobody had designed
a defense against human error — the conversation about data resilience had ended at "we have three
replicas".

## Related Concepts

- [Replication](/06-distributed-systems/replication.md) — the fundamentals.
- [Data Partitioning](/07-data-architecture/data-partitioning.md) — for write scale.
- [Data Consistency](/07-data-architecture/data-consistency.md).
- [Eventual Consistency](/06-distributed-systems/eventual-consistency.md).

## Practical Exercise

Answer three questions about your database: when the backup restore was last tested; when the failover
was last exercised; and what happens if someone executes a destructive command right now.

If the first two are "never", they are the most urgent work in this section.

## Interview Questions

- Why does replication not replace backups?
- What can go wrong during a failover?
- What is a deliberately delayed replica for?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 5.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Botros, Silvia; Tinley, Jeremy. *High Performance MySQL*. 4th ed. O'Reilly, 2021.
