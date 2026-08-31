---
id: pacelc
title: PACELC
sidebar_position: 12
description: The extension of CAP that covers the common case — latency versus consistency, when there is no partition.
doc_type: foundation
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader reasons about the trade-off that holds all the time, and not
  only during a partition.
prerequisites: [cap]
related: [cap, consistency, latency]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# PACELC

## Overview

PACELC, formulated by Daniel Abadi, extends [CAP](/06-distributed-systems/cap.md) with the part
that was missing:

> **If** there is a **P**artition, choose between **A**vailability and **C**onsistency.
> **E**lse — when there is no partition — choose between **L**atency and **C**onsistency.

The second half is what matters day to day, and it is what CAP omits.

## The Problem

CAP describes a rare event. Partitions happen, and a system can go months without one.

That leaves a gap: **what explains the behavior in the other 99.99% of the time?**

The answer is that consistency costs **coordination**, and coordination costs **network round
trips** — even with everything working perfectly.

A write that has to be acknowledged by replicas in another region pays the inter-region latency.
Not because something failed, but because the speed of light is finite and coordination is
mandatory.

PACELC names that trade-off. And it is the dominant one, because it holds always.

## Core Concepts

### The classification

Systems are described by two letters, one for each situation:

| Class | Under a partition | With no partition |
|---|---|---|
| **PA/EL** | Availability | Latency |
| **PA/EC** | Availability | Consistency |
| **PC/EL** | Consistency | Latency |
| **PC/EC** | Consistency | Consistency |

**PA/EL** — prioritizes responding fast, always. Key-value databases with asynchronous replication
tend to this profile.

**PC/EC** — prioritizes correctness, always, paying latency. Databases with distributed consensus
tend to this one.

**PA/EC** is the uncommon combination and it exists: systems that prefer consistency in the normal
case and give it up under a partition.

### The cost is geographic

EC's impact appears clearly in a multi-region configuration:

```text
linearizable write, replicas in two regions on the same continent
  → acknowledgment requires a round trip: ~30 ms extra per write

intercontinental replicas
  → ~150 ms extra per write
```

That is not optimizable. It is physical distance.

A system that requires global strong consistency and has users on three continents pays the
coordination latency on every write, and no code solves it.

### What that decides in practice

The choice between EL and EC determines:

**Where the writes happen.** Multi-region strong consistency frequently implies a single leader —
and writes from other regions pay the trip to it.

**Whether read replicas are usable.** Reading from a replica is EL; reading from the primary is EC.

**What the acknowledgment level is.** Acknowledging after one replica is EL; after a majority is
EC.

Those three parameters are usually configurable, and are frequently at a default nobody chose.

### Per operation, again

As in CAP and in [consistency](/06-distributed-systems/consistency.md), the choice is per
operation.

A system can be EC for a balance write and EL for a catalog read — and that is the correct
configuration in most cases.

Treating it as a global property forces every operation to the most demanding one's requirement.

## Why This Matters

**Because it describes the trade-off that holds always.** CAP explains the rare case; PACELC
explains the day to day. Teams that only know CAP have no vocabulary for the decision they
actually make every day.

**Because it makes the cost of consistency visible.** "Strong consistency" sounds free until
somebody quantifies the milliseconds it adds per operation.

**Because the decision is frequently configuration.** Acknowledgment level, read source, leader
placement — the parameters exist and someone has to choose.

## Common Mistakes

**Knowing only CAP.** It leaves the system's normal behavior unexplained.

**Treating the classification as a property of the database.** Most modern databases allow choosing
per operation.

**Not measuring the cost of EC.** The latency difference between acknowledging on one replica and
on a majority is measurable and rarely measured.

**Choosing EC globally as a precaution.** It pays latency on every operation to protect the few
that need it.

**Ignoring geography.** EC's cost depends on the distance between replicas.

## Real-World Example

A hotel booking system operated in three regions — South America, Europe and Asia — with a
replicated database and global strong consistency.

The response time to create a booking was 480 ms at the 50th percentile. The requirement was 300
ms.

Profiling showed that 340 ms was coordination: the write had to be acknowledged by a majority of
replicas, and the majority involved crossing continents.

The first proposal was to optimize the application. There was nothing to optimize — 71% of the time
was network waiting between continents.

The per-operation analysis changed the architecture.

**Room booking** stayed EC, and was **partitioned by the hotel's region**. A hotel in São Paulo has
its booking coordinated only among South American replicas. The coordination continues, and the
distance dropped from intercontinental to regional: from 340 ms to 18 ms.

**Availability lookup** became EL — it reads from the local replica, with an accepted delay of
seconds. The business confirmed that slightly stale availability is acceptable, because the actual
booking checks again.

**User profile and history** became EL with no reservations.

Result: a 95 ms p50.

The point the team underlines: strong consistency was not abandoned. What changed was **the scope
of the coordination** — from global to regional — plus separating the operations that did not need
it.

And the insight that only appeared with PACELC in the vocabulary: the problem was never a
partition. There was none. The cost was permanent, and CAP had no language to name it.

## Related Concepts

- [CAP](/06-distributed-systems/cap.md) — the half that deals with partitions.
- [Consistency](/06-distributed-systems/consistency.md) — the spectrum.
- [Latency](/06-distributed-systems/latency.md) — what you pay.
- [Replication](/06-distributed-systems/replication.md) — where the coordination happens.

## Practical Exercise

Find your database's write acknowledgment configuration: does it acknowledge after writing locally,
after one replica, or after a majority?

Then measure the latency difference between the modes. The number is the price of consistency in
your system, and almost nobody knows it.

## Interview Questions

- What does PACELC add to CAP?
- Why does consistency cost latency even with no failure?
- Why is the "else" trade-off more relevant day to day?

## Further Reading

- Abadi, Daniel. *Consistency Tradeoffs in Modern Distributed Database System Design*. IEEE
  Computer, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
