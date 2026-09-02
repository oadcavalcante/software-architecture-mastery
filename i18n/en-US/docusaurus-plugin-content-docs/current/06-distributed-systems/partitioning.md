---
id: partitioning
title: Partitioning
sidebar_position: 14
description: Dividing the data across nodes — the only way to scale writes, and the hardest to reverse.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses a partitioning strategy and key knowing what
  becomes expensive afterwards.
prerequisites: [replication]
related: [sharding, hotspots, replication]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Partitioning

## Overview

Partitioning divides the data into disjoint subsets, each living on a different node.

It exists for a reason [replication](/06-distributed-systems/replication.md) does not solve:
**scaling writes**. Replicas multiply read capacity; for writes, every replica receives everything.

And it is the data decision hardest to reverse, because the choice of key determines what stays
cheap and what becomes expensive — permanently.

## Problem

An instance has a limit: of storage, of memory, of write rate. When it is reached, adding replicas
does not help — they all receive the same writes.

Partitioning solves that: each node receives a fraction of the writes and holds a fraction of the
data.

The cost appears immediately: **operations that cross partitions become expensive**. A query that
needs data from several partitions becomes one query per partition plus an aggregation. A
transaction that touches two partitions becomes a distributed transaction.

The choice of key decides which operations cross — and that is why it is the decision, not the
mechanism.

## Core Concepts

### The strategies

**By range.** Ordered keys divided into intervals: A–F on one partition, G–M on another.

Range queries are efficient — neighboring data is together. And the distribution becomes uneven if
the data is not uniform: partitioning by date concentrates all writes on the current period's
partition.

**By hash.** The key goes through a hash function and the result determines the partition.

Uniform distribution, and range queries lose out: neighboring keys land on different partitions, and
the query has to scan them all.

**Hybrid.** Hash on one component and range on another — for example, a hash of the customer
identifier and a range by date within it. It preserves range queries **within** a customer and
distributes across customers.

The hybrid is frequently the right answer in business systems, and the least considered.

### The key decides everything

The choice of partition key determines three things at once:

**What stays local.** Operations that involve only one key are fast.

**What becomes expensive.** Operations that cross keys require coordination.

**How the load distributes.** A key with far more activity concentrates load — the
[hotspot](/11-scalability/index.md).

The criterion: **partition by the dimension most operations use to filter**. In a multi-tenant
system, typically the tenant; in a user-facing system, the user.

### Repartitioning is expensive

Changing the partition key requires moving practically all the data. In a production system with
volume, that is a months-long project with a coexistence period.

That asymmetry — cheap to decide, expensive to change — recommends two things: deferring the
partitioning until it is necessary, and when it is, spending time on choosing the key.

### Consistent hashing reduces the cost of growing

With a simple hash — `hash(key) mod N` — adding a node changes the destination of nearly every key.

Consistent hashing arranges the keys and the nodes on a ring: adding a node moves only the keys
between it and its neighbor — about `1/N` of the total.

It is what makes growth operationally viable. The other way out of the same problem is to fix far more
logical partitions than physical instances and move whole partitions — see
[sharding](/06-distributed-systems/sharding.md). Current systems split between the two.

### Partitioning and replication are orthogonal

Confusing them is common. **Partitioning** divides the data; **replication** copies each partition.

Real systems do both: each partition has its replicas, so that losing one node does not mean losing
that fraction of the data.

## Mental Model

**Partitioning is choosing what stays together.** Everything that has to be queried or changed
together should share the key.

## When to Use

- The write volume exceeds one node's capacity, demonstrably.
- The data volume does not fit on one instance.
- There is a natural dimension by which most operations filter.
- Operations that would cross partitions are rare.

## When Not to Use

**Before exhausting the alternatives.** See
[scalability strategies](/05-system-design/scalability-basics.md): optimizing, scaling vertically and
caching come first.

**When there is no natural dimension.** If operations filter by different dimensions depending on
the case, any key makes half of them expensive.

**When many operations would cross partitions.** The coordination cost exceeds the gain.

**When the distribution would be uneven.** Partitioning by a key with a hotspot does not distribute
load.

**When transactions across partitions are a requirement.** They become
[distributed transactions](/06-distributed-systems/distributed-transactions.md), with the
corresponding cost.

## Alternatives

- **Vertical scaling** — higher than assumed, and with no structural cost.
- **[Replication](/06-distributed-systems/replication.md)** — if the bottleneck is reads.
- **Archiving** — moving old data to cheaper storage reduces the active volume, frequently enough.
- **Logical partitioning on the same node** — tables partitioned by range within one instance, which
  improves maintenance without distributing.

## Trade-offs

| Partitioned | Single instance |
|---|---|
| Writes scale | Limited by one node |
| Volume scales with the number of nodes | Limited by one node |
| Cross-partition operations expensive | All local |
| A cross-partition transaction is distributed | Local |
| Rebalancing to operate | Nothing |
| Key hard to change | No key |

## Failure Modes

**Hotspot.** One partition receives disproportionate load.

**Wrong key discovered late.** Repartitioning is a months-long project.

**A cross-partition operation on the critical path.** Latency summed across several partitions.

**Rebalancing during a peak.** Data movement competing with traffic.

**A query without the key.** It becomes a scan of every partition — the most common performance
failure mode in partitioned systems.

## Common Mistakes

**Partitioning too early.**

**Choosing the key without analyzing the queries.**

**Not considering the real data distribution.** A key that is uniform in theory can be concentrated
in practice.

**Using a simple hash instead of a consistent one.**

**Not measuring the distribution afterwards.** The load can become unbalanced over time.

## Real-World Example

A multi-tenant school management platform partitioned by `student_id`, a choice made because
students were the most numerous entity.

It worked for student queries. It broke for everything else.

The system's most frequent operation was "list a class's students" — and students in the same class
were spread across every partition. Each listing queried the 16 partitions and aggregated.

Reports by school crossed everything. Bulk enrollment became a distributed transaction.

And there was an imbalance nobody anticipated: three large schools accounted for 40% of the
students, but since the key was the student, that did not concentrate — which masked the real
problem, which was the number of operations crossing partitions, not the distribution.

Repartitioning to `school_id` took five months, with a dual-write period and incremental migration.

Afterwards: class listings, reports and bulk enrollment became local to one partition. The
operations that cross partitions became rare — only administrative consolidations, executed off
hours.

The imbalance of the three large schools came into existence and was handled with dedicated
partitions for them.

The later assessment points out: the right key was not the most numerous entity. It was the dimension
by which the operations filtered — and that information had been in the query log since day one.

## Related Concepts

- [Sharding](/06-distributed-systems/sharding.md) — the case of partitions on separate instances.
- [Hotspots](/11-scalability/index.md) — the load imbalance.
- [Replication](/06-distributed-systems/replication.md) — orthogonal and complementary.
- [Scalability](/11-scalability/index.md).

## Practical Exercise

If your system is partitioned, measure the load distribution across partitions. If it is not,
analyze the query log: by which dimension does the majority filter?

That dimension is the candidate key — and discovering it before you need it is what makes the
decision cheap.

## Interview Questions

- Why does replication not solve write scale?
- How do you choose the partition key?
- What does consistent hashing solve?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 6.
- Karger, David et al. *Consistent Hashing and Random Trees*. STOC, 1997.
