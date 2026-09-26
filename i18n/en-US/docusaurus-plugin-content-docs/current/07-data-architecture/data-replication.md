---
id: data-replication
title: Data Replication
sidebar_position: 16
description: Copies of the same data in different places, seen from the storage and operations angle.
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
translated_from_version: 5
last_reviewed: 2026-08-31
---

# Data Replication

## Overview

Replicating is keeping copies of the same data on different nodes.

The fundamentals (synchronous and asynchronous, leader and followers) are in
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

| Protects against | Replication | Backup |
|---|---|---|
| Hardware failure | Yes | Yes, with restore time |
| Data center failure | Depends on where the replicas are | Depends on where the backup is |
| Human error | No, if real-time; yes, with a delayed replica and within its window | Yes |
| Logical corruption | No | Yes |
| An attack with deletion | No | Yes, if isolated |

Teams that trust replication as data protection discover the difference at the worst possible moment.

### The lag is the central operational metric

All asynchronous replication has lag, and it is not constant. See
[eventual consistency](/06-distributed-systems/eventual-consistency.md).

Three things make the lag spike: a high write load, a long transaction on the primary, and an index
rebuild on the replica.

Monitoring the lag is mandatory, and the metric has to be in seconds of staleness, not in pending bytes.
Bytes say nothing to the business.

### Reading from a replica requires deciding what tolerates lag

Which reads go to the primary and which accept a replica is the
[read classification](/11-scalability/scaling-replication.md#classifying-the-reads-is-the-work) defined
in scaling with replication. From the storage angle, what it adds is that the classification depends on a
number only operations knows: the replica's real lag. "Primary for N seconds after writing" only works if
N is greater than the lag measured at peak, and that lag is exactly what heavy reports on a shared replica
make grow.

### What failover inherits from replication

The switchover procedure (triggering, split brain, failing back, and the need to exercise it) is
[failover](/12-reliability/failover.md). What is specific to data replication are two consequences of the
lag at the moment of promotion:

**Lost writes.** With asynchronous replication, what the primary acknowledged and did not replicate is
lost when another replica is promoted. The size of the loss is the lag at that instant. That is why
choosing the least-lagged replica to promote matters, and why the lag monitored in seconds is also an
estimate of the loss in case of failover.

**Divergent sequences.** Identifier counters on the promoted replica can be behind the values already
handed out by the old primary, and repeat identifiers other systems have already stored.

### Deliberately delayed replication

A replica configured to stay deliberately one hour behind the primary.

It does not serve for reading or for taking over. It serves one purpose: when someone executes a
destructive command, there is an hour to notice and extract the data before the deletion arrives there.

Its cost is that of any replica (a full copy of the storage and a node), with no read load to amortize
it. What it buys is the case normal replication does not cover, recovered in minutes instead of a full
restore that discards the day's transactions.

### Multiple primaries requires a conflict plan

Accepting writes on more than one node brings
[conflicts](/06-distributed-systems/conflict-resolution.md), and the default resolution discards data
silently.

The question before adopting: can each piece of data have a single owner per region? If it can,
partitioning solves it with no conflicts.

## Mental Model

**Real-time replication protects against machine failure, not against human error**: it propagates the
destructive command with the same fidelity with which it propagates everything else. The exception is the
delayed replica, which is replication used as a window for regret. Both protections are necessary and they
do not replace each other.

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

- **Backups with tested restores**: for human error and corruption.
- **[Partitioning](/07-data-architecture/data-partitioning.md)**: for write scale.
- **Cache**: to reduce reads without replicating.
- **[Distributed CQRS](/06-distributed-systems/distributed-cqrs.md)**: a projection with its own model instead of
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
| More cost and more operations | Less |
| More lag to monitor | Less |

## Failure Modes

**Human error replicated.** The deletion reaches every copy.

**Lag growing with no alert.**

**Lost writes during failover.**

**Split brain.**

**A silently stopped replica.** It keeps answering reads of frozen data.

**A restore never tested.** The backup exists and nobody knows whether it works.

The fifth is particularly dangerous: a stopped replica does not error; it answers stale data as if it
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
everything to the replica makes the user save a change and not see it on reload. They report as
data loss.

## Real-World Example

A financial services company had its database replicated across three nodes, with daily backups.

One morning, a defective migration erased a column across 2 million records: not the whole data, only
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
a defense against human error: the conversation about data resilience had ended at "we have three
replicas".

## Related Concepts

- [Replication](/06-distributed-systems/replication.md): the fundamentals.
- [Data Partitioning](/07-data-architecture/data-partitioning.md): for write scale.
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

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017. Chapter 5.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Botros, Silvia; Tinley, Jeremy. *High Performance MySQL*. 4th ed. O'Reilly, 2021.
