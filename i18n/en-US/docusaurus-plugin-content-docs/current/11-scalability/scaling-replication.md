---
id: scaling-replication
title: Replication for Scale
sidebar_position: 6
description: Multiplying copies to scale reads — what it resolves, and the limit it does not.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader uses replicas to scale reads by classifying what tolerates
  lag, and recognizes where replication does not help.
prerequisites: [scalability]
related: [database-scaling, scaling-partitioning, scaling-cache]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Replication for Scale

## Overview

Replicating is keeping copies of the data on more nodes. For scale, it resolves one specific problem and
does not resolve another:

```text
read scaling    yes — each replica serves reads
write scaling   no — every write goes to every replica
```

The fundamentals are in [replication](/06-distributed-systems/replication.md) and
[data replication](/07-data-architecture/data-replication.md). Here what matters is the scale arithmetic
and what it reveals about the limit.

## Problem

Most systems have a read-to-write ratio of 10 to 1 or more. That makes replication the natural answer:
adding replicas multiplies the read capacity without touching the model.

What makes it insufficient on its own is the asymmetry: each replica added increases the read capacity and
**changes nothing** in the write capacity — because every write still goes to every copy.

There is a point at which writes saturate, and no number of replicas helps.

## Core Concepts

### Write amplification

```text
1 primary, 0 replicas    → 1 write per operation
1 primary, 5 replicas    → 6 writes per operation
1 primary, 20 replicas   → 21 writes per operation
```

Each replica needs to apply every write. The total write work grows linearly with the number of copies,
while the write capacity **per node** stays the same.

The practical consequence: above a certain number of replicas, they come to spend most of their capacity
applying replication, and little is left to serve reads.

That defines the ceiling: replication scales reads up to the point at which writes, applied everywhere,
consume the nodes.

When that point arrives, the answer is [partitioning](/11-scalability/scaling-partitioning.md) — which
divides the writes instead of multiplying them.

### Classifying the reads is the work

Not every read can go to a replica. The classification that works:

```text
critical            the primary — a balance before debiting, a stock check
the user's own      the primary for N seconds after they write
general             a replica
reporting           a dedicated replica
```

The second line is what eliminates most of the "I saved it and it does not appear" complaints. See
[eventual consistency](/06-distributed-systems/eventual-consistency.md).

Without that classification, two bad things happen: either everything goes to the primary — and the
replication scales nothing — or everything goes to a replica, and critical operations decide on stale data.

### Reporting on a shared replica poisons general reads

A heavy analytical query on a replica that also serves user traffic increases its lag for everybody, and
competes for resources.

A reporting replica should be dedicated. It is the same logic as separating
[OLTP from OLAP](/07-data-architecture/oltp.md), applied inside the replica layer.

### The lag needs to enter the routing decision

A lagging replica keeps answering — with stale data, with no error.

Mature routing considers the lag: replicas above a threshold leave the rotation for sensitive reads, or
leave completely.

Without that, a replica that has stalled keeps receiving traffic and serving frozen data. See
[failure detection](/06-distributed-systems/failure-detection.md).

### A replica is not only for scale

It is worth remembering, because it changes the sizing: replicas also serve availability — taking over if
the primary goes down.

If all the replicas are sized to the limit serving reads, promoting one of them happens on an
already-saturated node, at the worst possible moment.

The sizing needs to reserve headroom for that scenario. See
[capacity planning](/11-scalability/scaling-capacity-planning.md).

### Cache before replicas

A read served by a cache reaches no replica at all.

For repeatedly read data, a cache is cheaper and faster than adding replicas — and it does not suffer write
amplification.

The practical order: cache first, replicas for what the cache does not cover. See
[caching for scale](/11-scalability/scaling-cache.md) and the ladder in
[database scaling](/11-scalability/database-scaling.md).

## Mental Model

**A replica multiplies reads and multiplies the write work.** It scales up to the point at which writes,
applied everywhere, consume the nodes.

## When to Use

- Reads dominate writes.
- The reads tolerate seconds of lag.
- There is a reporting load to separate.
- Availability requires copies anyway.
- Geographically distributed users read locally.

## When Not to Use

**To scale writes.**

**Without classifying the reads.**

**Reporting on a shared replica.**

**Without considering lag in the routing.**

**With no headroom for promotion.**

**Before caching.** A replica is more expensive for the same effect on repeated data.

## Alternatives

- **[Caching](/11-scalability/scaling-cache.md)** — cheaper for repeated reads.
- **[Partitioning](/11-scalability/scaling-partitioning.md)** — when the limit is writes.
- **[Distributed CQRS](/06-distributed-systems/distributed-cqrs.md)** — a read model of its own, optimized.
- **A materialized view** — precomputation in the database itself.

## Trade-offs

| More replicas | Fewer |
|---|---|
| More read capacity | Less |
| More write amplification | Less |
| More failure tolerance | Less |
| More lag to monitor | Less |
| Linear cost | Low |

| A replica | A cache |
|---|---|
| All the data | Only what is cached |
| Arbitrary queries | A known key |
| Suffers amplification | It does not |
| No invalidation | Invalidation to manage |

## Failure Modes

**Writes saturating with many replicas.**

**A lagging replica serving stale data.**

**A stalled replica answering normally.**

**Reporting increasing the general lag.**

**Promotion onto a saturated node.**

**A critical read on a replica.** A decision on out-of-date data.

## Common Mistakes

**Adding replicas to resolve writes.** A replica scales reads; every write still goes to the primary, and
each additional replica further increases its replication work.

**Not classifying the reads.** Not every read tolerates lag. Sending everything to a replica makes the user
not see their own change on reload — the most common bug report from this arrangement.

**Not implementing "read your own writes".** It is the minimum guarantee that makes replica reads
acceptable to the user. Without it, the inconsistency appears exactly to whoever just acted.

**Not monitoring lag per replica.** The lag varies between replicas and with the load. The average hides
the replica that is minutes behind and still receiving reads.

**Not reserving headroom for promotion.** If the replicas operate at the limit, promoting one to primary
puts it under a write load it does not have the capacity to absorb — and the failover takes the successor
down.

**Not using a cache first.** An additional replica costs a database instance per month; a cache usually
resolves the same read load for a fraction, and it should be evaluated first.

## Real-World Example

A classifieds platform scaled from 2 to 12 read replicas over two years, as the traffic grew.

With 12 replicas, two problems appeared:

**Writes saturated.** Each listing published generated 13 writes — the primary and the 12 replicas. The
replicas spent most of their time applying replication, and the read capacity per replica had fallen.
Adding the 13th made every replica's lag worse.

**Irregular lag.** Two replicas served internal reports and had lag of minutes, while the others had
seconds. The routing did not distinguish, and users occasionally saw out-of-date listings — with no
apparent pattern, which made the diagnosis take months.

The fixes:

**Cache before replicas.** The most common searches — which accounted for 70% of the reads — went to a
cache with event-based invalidation. That allowed **reducing** from 12 to 6 replicas, which halved the
write amplification and improved every replica's lag.

**Replicas dedicated to reporting**, out of the user traffic rotation.

**Lag-sensitive routing.** Replicas more than 5 seconds behind leave the rotation for sensitive reads;
above 30 seconds, they leave completely.

**Read classification.** Publishing a listing and editing by its own author came to read from the primary
for 30 seconds. The "I edited it and it did not change" complaint disappeared.

**Planned partitioning** for when writes saturate again, with a defined trigger — which the team estimates
at around three years at the current pace.

The later assessment points out: the answer to two years of growth had always been the same — add a
replica. Nobody had calculated the write amplification, and the 12th replica was making the system worse.

## Related Concepts

- [Database Scaling](/11-scalability/database-scaling.md) — the ladder.
- [Partitioning for Scale](/11-scalability/scaling-partitioning.md) — when writes saturate.
- [Caching for Scale](/11-scalability/scaling-cache.md) — before replicas.
- [Replication](/06-distributed-systems/replication.md) — the fundamentals.

## Practical Exercise

Count how many replicas you have and multiply by the write rate. That is your set's total write work.

Compare with one node's write capacity. The ratio says how much of each replica's capacity is being
consumed before serving any read at all.

## Interview Questions

- Why does replication not scale writes?
- What is write amplification and how does it define the ceiling?
- Why should a cache come before a replica?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 5.
- Botros, Silvia; Tinley, Jeremy. *High Performance MySQL*. 4th ed. O'Reilly, 2021.
- Gunther, Neil. *Guerrilla Capacity Planning*. Springer, 2007.
