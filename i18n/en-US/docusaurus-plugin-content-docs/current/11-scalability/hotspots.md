---
id: hotspots
title: Hotspots
sidebar_position: 11
description: When the average deceives — one saturated partition with the rest idle, immune to any amount of machines.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader detects distribution imbalance and chooses the spreading
  technique appropriate to the access pattern.
prerequisites: [scalability]
related: [scaling-partitioning, performance-vs-scalability, database-scaling]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Hotspots

## Overview

A hotspot is a part of the system that receives disproportionate load: a partition, a key, an instance, a
record.

It is the failure mode that **survives any amount of capacity**. Adding nodes does not help, because the
problem is not total capacity — it is distribution.

And it is hard to see, because aggregate metrics hide it: the average utilization looks comfortable while
one partition is at 100%.

## Problem

The system has ten partitions. Nine operate at 15% utilization; one is saturated.

The average is 23%. Every dashboard shows headroom. And the system is unavailable for that partition's
users.

The natural reaction — adding more partitions — does not resolve it: the hot key still goes to a single
one. Frequently it makes things worse, because the rebalancing consumes capacity and the distribution stays
uneven.

That explains the sentence that appears in many post-mortems: "we have ten replicas and it still went
down".

## Core Concepts

### The origins are few and recognizable

**Naturally uneven distribution.** A few customers with disproportionate volume. It is the rule, not the
exception — in almost every business, a small fraction of the customers generates most of the traffic.

**A low-cardinality partition key.** Partitioning by state, by type, by status. The most common value
concentrates everything.

**A sequential key.** Partitioning by time or by an increasing identifier makes all the writes go to the
last partition. The others sit idle.

**A concentrated event.** A product on sale, a viral video, a batch of messages with the same key.

**A reference record.** A global counter, a configuration read by everything, an aggregate row updated by
every transaction.

The third is the most common in databases, and the least noticed: sequential identifiers look like a
neutral choice.

### Detecting requires a per-partition metric

The rule: **every metric of a partitioned resource needs to exist per partition, not only aggregated.**

```text
aggregate       average utilization 23%   → looks healthy
per partition   maximum 100%, minimum 8%  → saturated
```

And the metric that matters is the **ratio between the maximum and the median**. Above 3, there is
imbalance; above 10, there is a hotspot.

Without that, the diagnosis depends on somebody being suspicious and going to look — which happens after
the incident.

### The spreading techniques

**A random suffix on the key.** One hot key becomes several — `product:123:0` through `product:123:9`. The
writes spread; the read has to query the ten and sum.

It works well for counters and aggregations. It costs complexity on reads.

**A composite key.** Combining the uneven dimension with a more uniform one. Partitioning by customer
**and** by period, instead of only by customer.

**A cryptographic hash of the key.** It distributes uniformly, and it eliminates the ability to query by
range. See [partitioning](/06-distributed-systems/partitioning.md).

**Isolating the hot one.** The few customers with disproportionate volume get a dedicated partition or
dedicated infrastructure. It is the simplest solution to operate and the most used in mature platforms.

**A cache in front.** For reads, a cache absorbs the hot key before it reaches the store. See
[caching for scale](/11-scalability/scaling-cache.md).

**A relative operation.** A counter updated with an increment, instead of read-compute-write, removes the
contention without changing the distribution.

### The hot spot moves

A hotspot is not static. Today's product on sale is another tomorrow; the customer who grew becomes the
biggest.

That means a fixed spreading scheme — decided once, based on the observed distribution — ages.

The solutions that survive are adaptive: detecting the hot key at runtime and spreading it on demand, or
rebalancing automatically.

### Write contention is a hotspot with no partitioning

The case where there is no wrong distribution: all the operations need the **same record**.

```text
the balance of an account with many transactions
the stock counter of a popular product
an aggregate row updated by every sale
```

Here the spreading is not of a key — it is of the model. A single counter becomes partial counters summed
at read time. A balance becomes a ledger of movements, with the balance derived.

See [transactions](/07-data-architecture/transactions.md) — it is the same contention, seen from the scale
angle.

## Mental Model

**A hotspot is a distribution problem, not a capacity problem.** More machines do not change where the load
goes.

## When to Use

Attention to hotspots is necessary when:

- There is partitioning or distribution of any kind.
- The usage distribution among customers is uneven — almost always.
- There are sequential or low-cardinality keys.
- There are reference records read or written by everything.
- Concentrated events are part of the business — sales, launches.

## When Not to Use

**Spreading without measuring.** Adding complexity for an imbalance that does not exist.

**A random suffix when reading by key is the dominant pattern.** The read comes to cost N times more.

**A cryptographic hash when there are range queries.** It eliminates the ability.

**Isolating large customers too early.** Operational complexity before the concentration hurts.

**Adding capacity** as the answer.

## Alternatives

- **A cache** — it absorbs hot reads without touching the distribution.
- **Isolation per customer** — the operationally simplest solution.
- **Modeling with no contention** — partial counters, a ledger of movements.
- **Rate limiting per key** — it does not resolve the distribution, and it prevents one key from consuming
  all the capacity. See [rate limiting](/05-system-design/rate-limiting.md).

## Trade-offs

| A random suffix | A direct key |
|---|---|
| Writes spread | Concentrated |
| Reads query N and aggregate | One query |
| Complexity in the application | None |

| A cryptographic hash | A natural key |
|---|---|
| Uniform distribution | Uneven |
| No range queries | Possible |
| No locality | Preserved |

| Isolating the hot one | Spreading |
|---|---|
| Simple operation to understand | Transparent |
| Dedicated infrastructure to maintain | Shared |
| A clear limit per customer | Diffuse |

## Failure Modes

**Saturation with a comfortable average.**

**Rebalancing with no effect.** The hot key still concentrates.

**All the writes on the last partition.** A sequential key.

**A cache not helping.** The hot key is a write key, not a read one.

**An aged spreading scheme.** The hot spot moved.

**Isolation leaking.** The large customer was isolated, and a shared resource remained.

**A hotspot in the cache.** A heavily accessed key saturates one cache node — the same problem, one layer
up.

## Common Mistakes

**Having no per-partition metric.** The average across partitions hides the saturated one. While the
dashboard shows 30% usage, one partition is at 100% and it is the one defining the experience.

**Partitioning by a sequential key.** An increasing identifier or a timestamp concentrates all the new
writes on the last partition — the worst possible case, and the easiest to create without noticing.

**Partitioning by a low-cardinality dimension.** A state or category with few values limits the number of
useful partitions and guarantees imbalance, because the values never have similar volume.

**Adding nodes as the answer.** If the load is concentrated on one key, more nodes receive the idle part
and the hot node stays hot. The problem is distribution, not capacity.

**Not reviewing the distribution periodically.** A key balanced today becomes unbalanced when a customer
grows or a product goes viral. It is a property that ages.

**Not considering write contention** as a hotspot. A single counter updated by everybody serializes the
transactions with no infrastructure metric reporting saturation.

## Real-World Example

An e-commerce platform partitioned the orders database by order identifier, which was sequential.

The result: **all the writes went to the last partition**. The other fifteen received only reads of old
orders.

The symptom in production: order creation latency degrading over the course of the day, recovering at
night, and getting worse week by week. The partitions' average utilization was 12%.

The first reaction, months earlier, had been to double the number of partitions. It changed nothing — the
last partition still received everything, now with half the historical data.

The diagnosis came when somebody added a per-partition metric and saw 100% on one and 5% on the others.

The fixes were on three fronts:

**A composite partition key.** It came to be a cryptographic hash of the customer identifier, plus the
period. The writes spread, and the per-customer queries — which were the majority — got better, because one
customer's orders came to be together.

The identifier range query, which existed in two reports, was rewritten to use the date.

**Stock contention.** Discovered during the same investigation: the stock row of popular products was
updated by every sale, with read-compute-write. During sales, dozens of transactions competed for the same
row.

Replaced by a relative operation with a check — `UPDATE stock SET quantity = quantity - ? WHERE id = ? AND
quantity >= ?`. The contention dropped drastically, and the lost update anomaly, which nobody had noticed,
disappeared along with it.

**Isolating the large ones.** Twelve corporate customers generated 40% of the volume. They were moved to
dedicated partitions, which stabilized the others' experience and allowed sizing the large ones separately.

**A per-partition metric** with an alert on the maximum-to-median ratio above 4.

Result: order creation latency fell from 900 ms to 60 ms at peak, with the **same amount of
infrastructure**.

The recorded conclusion: the doubling of partitions done months earlier had cost money and two weeks of
migration, with no effect at all. It was decided from the aggregate metric, which was the only number
available.

## Related Concepts

- [Partitioning for Scale](/11-scalability/scaling-partitioning.md).
- [Performance versus Scalability](/11-scalability/performance-vs-scalability.md).
- [Database Scaling](/11-scalability/database-scaling.md).
- [Partitioning](/06-distributed-systems/partitioning.md) — the fundamentals.

## Practical Exercise

For each partitioned resource in your system, calculate the ratio between the most loaded partition and the
median.

If you cannot calculate it, that is the gap — and it is the reason the next incident will take a while to
diagnose.

## Interview Questions

- Why does adding capacity not resolve a hotspot?
- Why does a sequential key concentrate writes, and how is that resolved?
- How is write contention a hotspot with no partitioning?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 6.
- DeCandia, Giuseppe et al. *Dynamo: Amazon's Highly Available Key-value Store*, 2007.
- Gregg, Brendan. *Systems Performance*. 2nd ed. Addison-Wesley, 2020.
