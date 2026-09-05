---
id: scaling-partitioning
title: Partitioning for Scale
sidebar_position: 5
description: Dividing writes instead of multiplying them — the last option, and the hardest to reverse.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses a partition key by the access pattern and recognizes
  what is lost by dividing.
prerequisites: [scaling-replication]
related: [scaling-replication, hotspots, database-scaling]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Partitioning for Scale

## Overview

Partitioning is dividing the data among nodes, so that each one is responsible for a part.

It is the only technique that **scales writes**: instead of replicating every write to every node, each
write goes to a single node. See [replication for scale](/11-scalability/scaling-replication.md).

And it is the most expensive and the hardest to reverse. It is the last rung of the ladder in
[database scaling](/11-scalability/database-scaling.md), and there are reasons for it being at the end.

## Problem

When writes saturate, the options run out. Replicas multiply the write work. Caching does not help. A
bigger machine buys time until the physical ceiling.

Partitioning resolves it, and it changes three things permanently:

**The partition key becomes part of the model.** Every query needs it, or it goes to every node.

**Queries that cross partitions get expensive.** What was one query becomes N plus aggregation.

**Transactions across partitions stop existing** — or become distributed coordination. See
[distributed transactions](/06-distributed-systems/distributed-transactions.md).

## Core Concepts

### The key decides everything, and it is almost irreversible

The partition key choice determines the performance of every future query. The criteria, in order:

**Do most queries filter by it?** If not, they go to every node.

**Does it distribute uniformly?** If not, there is a [hotspot](/11-scalability/hotspots.md).

**Do the operations that need to be atomic land in the same partition?** If not, distributed transactions.

**Is the cardinality high enough?** Few distinct values concentrate.

Meeting all four is rare, and the choice is a compromise. What is not acceptable is choosing without
analyzing them — because changing the key later requires rewriting all the data.

### The strategies

**By range.** Nearby values stay together. It allows range queries, and it concentrates writes when the key
is increasing — the most common problem.

**By cryptographic hash.** Uniform distribution, and it eliminates range queries.

**By list.** Discrete values — a region, a customer type. Simple, and the imbalance is whatever the natural
distribution determines.

**Composite.** Combining two dimensions — customer and period. It is usually the answer when no single one
serves.

See [partitioning](/06-distributed-systems/partitioning.md) for the fundamentals.

### Cross-partition queries are the hidden cost

A query that filters by the key goes to one node. One that does not filter goes to all of them.

```text
with the key    1 node, the latency of 1 query
without it      N nodes, the latency of the slowest, plus aggregation
```

And the second case is not only slower: it consumes capacity from every node for a single request, which
nullifies part of the scale gain.

The design consequence: frequent queries that do not use the key need a **global secondary index** — which
is an additional store, partitioned by another key, with the consistency between the two becoming a
problem.

### Rebalancing needs to be possible

Adding nodes requires moving data. The strategy matters:

**Division by the number of nodes.** Changing the number of nodes remaps almost everything. Unviable in
production.

**Fixed partitions in a number larger than the nodes.** Each node holds several partitions; adding a node
moves whole partitions, not records. It is the approach that works.

**Dynamic splitting.** Partitions that grow too large split automatically.

The first looks the simplest and it is the one that prevents growing later. Choosing it is a mistake that
only appears when it is expensive to fix.

### What is lost

It is worth enumerating, because the decision needs both sides:

**Transactions across partitions.** Operations touching two partitions need a
[saga](/06-distributed-systems/sagas.md) or coordination.

**Joins across partitions.** They stop existing in the database; they become code.

**Global uniqueness.** A uniqueness constraint that does not include the partition key cannot be enforced.

**Global ordering.** Sequences and total ordering require coordination.

**Operational simplicity.** Backup, restore, schema migration and monitoring come to be per partition.

The global uniqueness item usually appears late: you discover the customer's document number needs to be
unique, and the partitioning is by region.

### Partitioning the application before the database

A frequently better alternative: separating by domain, into independent databases, before partitioning
horizontally.

See [database scaling](/11-scalability/database-scaling.md), rung 9. The boundary already exists in the
business, the queries that cross are already rare, and each database scales on its own.

Many cases taken to partitioning would be resolved that way, with less permanent cost.

## Mental Model

**Partitioning divides the writes and divides the model along with them.** It is this section's least
reversible decision.

## When to Use

- Writes have saturated and the previous rungs have been exhausted.
- The data volume exceeds what one machine holds.
- There is a natural key most queries filter by.
- The atomic operations fit inside one partition.
- The projected growth justifies the permanent cost.

## When Not to Use

**Before exhausting the ladder.**

**With no natural key.** Partitioning by something artificial produces cross-partition queries in
everything.

**When splitting by domain resolves it.**

**With a low-cardinality or sequential key.**

**With no rebalancing strategy.**

**When cross-partition transactions would be frequent.**

## Alternatives

- **Splitting by domain** — the most frequently appropriate alternative.
- **[Replication](/11-scalability/scaling-replication.md)** — if the limit is reads.
- **Archiving cold data** — it reduces the volume without dividing.
- **Reducing the writes** — batching, making them asynchronous, eliminating the unnecessary ones.
- **A distributed relational database** — it keeps the model and distributes, at the cost of coordination
  latency.

## Trade-offs

| Partitioned | A single node |
|---|---|
| Scales writes | The node's ceiling |
| Unlimited volume | Limited |
| A query with no key is expensive | Uniform |
| No cross-partition transactions | Simple transactions |
| Operations per partition | One |
| Irreversible in practice | Flexible |

| By hash | By range |
|---|---|
| Uniform distribution | A risk of concentration |
| No range queries | Possible |
| No locality | Preserved |

## Failure Modes

**The wrong key.** Queries on every partition.

**A hotspot.** One saturated partition. See [hotspots](/11-scalability/hotspots.md).

**Unviable rebalancing.** The chosen strategy requires remapping everything.

**Impossible uniqueness.** The constraint would need to cross partitions.

**Frequent cross-partition transactions.** What should be rare became routine.

**A query with no key on the critical path.**

**Multiplied operations.** Maintenance, backup and migration are now N times over.

## Common Mistakes

**Partitioning too early.**

**Choosing the key without analyzing the query pattern.**

**A sequential key.**

**Not planning rebalancing.**

**Not considering splitting by domain.**

**Not checking the uniqueness constraints** before deciding the key.

## Real-World Example

A corporate messaging platform partitioned the message database by conversation identifier, with a
cryptographic hash.

The choice was right for the dominant pattern: opening a conversation and reading its messages — one
partition, one query.

Three problems appeared, all predictable:

**Global search.** Full-text search across all of a user's conversations had to query every partition. With
64 partitions, each search generated 64 queries. It was 3% of the requests and consumed 40% of the
capacity.

Resolved with a separate inverted index, partitioned by user — the global secondary index the original
decision had not anticipated.

**Attachment uniqueness.** A new requirement demanded that the same file not be stored twice, with
deduplication by content hash. That is a global uniqueness constraint, impossible to enforce with
partitioning by conversation. Resolved with a separate deduplication table, partitioned by the file's hash.

**Rebalancing.** The original implementation mapped conversation to node by the modulus of the number of
nodes. Going from 8 to 12 nodes would remap two thirds of the data — only the keys where `k mod 8` and
`k mod 12` coincide stay put, which is one in every three. The migration to fixed partitions — 1,024
partitions distributed across the nodes — took four months and was done with the system live.

That last one was the most expensive, and it was the most avoidable: the mapping strategy had been chosen
in the project's first week, with no discussion.

What was recorded afterward: the partition key was right and it is still right. What was missing was
anticipating the queries that do **not** use the key — search and deduplication — which existed on the
product roadmap and did not enter the analysis.

## Related Concepts

- [Replication for Scale](/11-scalability/scaling-replication.md) — the previous step.
- [Hotspots](/11-scalability/hotspots.md) — the key's risk.
- [Database Scaling](/11-scalability/database-scaling.md) — the ladder.
- [Partitioning](/06-distributed-systems/partitioning.md) — the fundamentals.

## Practical Exercise

If you were to partition your database today, what would the key be? List the ten most frequent queries and
check how many use it.

Then list the uniqueness constraints and the operations that need to be atomic. The ones that do not fit in
one partition are the decision's cost.

## Interview Questions

- Why is partitioning the only technique that scales writes?
- Why does the rebalancing strategy need to be decided at the start?
- What is lost by partitioning, beyond the implementation cost?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 6.
- DeCandia, Giuseppe et al. *Dynamo: Amazon's Highly Available Key-value Store*, 2007.
- Corbett, James et al. *Spanner: Google's Globally-Distributed Database*, 2012.
