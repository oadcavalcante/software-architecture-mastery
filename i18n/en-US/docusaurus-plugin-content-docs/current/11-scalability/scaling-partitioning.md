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
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Partitioning for Scale

> Prerequisite: [Partitioning](/06-distributed-systems/partitioning.md).
> The focus here is the write load that saturated, not the mechanics of the strategies.

## Overview

Partitioning is dividing the data among nodes, so that each one is responsible for a part.

It is the only technique that **scales writes to a single dataset beyond one node's ceiling**: instead of replicating every write to every node, each
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

### The strategies, seen through writes

The mechanics of each strategy are in [partitioning](/06-distributed-systems/partitioning.md). Here there is
only one question: does it spread the write load that saturated?

**By range**, with an increasing key — a date, a sequence — it does not: every new write lands in the current
period's partition, and the bottleneck that motivated the split reappears on a single node. **By
cryptographic hash** spreads it, at the price of range queries. **By list** — a region, a customer type —
spreads it in proportion to the natural distribution, which is rarely uniform. **Composite** — customer and
period — spreads it across customers and preserves ranges within each one.

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
moves whole partitions, not records. It requires fixing the number up front: too few partitions cap how many
nodes the system can ever have.

**Consistent hashing.** Keys and nodes on a ring; adding a node moves about `1/N` of the keys — see
[partitioning](/06-distributed-systems/partitioning.md). There is no number to estimate, and without virtual
nodes the load across nodes is uneven.

**Dynamic splitting.** Partitions that grow too large split automatically.

The first looks the simplest and it is the one that prevents growing later. Choosing it is a mistake that
only appears when it is expensive to fix. Between fixed partitions and consistent hashing, fixed partitions win
when operations need to move named units — taking a hot partition whole to an idle node; consistent hashing
wins when the node count varies widely and there is no way to estimate the ceiling.

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

**Partitioning too early.** The permanent cost — queries without the key, distributed transactions,
per-partition operations — is paid before the write load that would justify it exists.

**Choosing the key without analyzing the query pattern.** The frequent queries that do not use it go to every
partition, and fixing it requires rewriting the data.

**A sequential key.** Every new write lands in the current period's partition; the saturation that motivated
the split comes back, now on a single node.

**Not planning rebalancing.** The first node added remaps almost all the data — in the example below, four
months of migration.

**Not considering splitting by domain.** You pay the cost of horizontal partitioning where a business
boundary, with cross queries already rare, would have resolved it.

**Not checking the uniqueness constraints** before deciding the key. A constraint that does not include the
key stops being enforced by the database and becomes a separate table or code.

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

- Why is partitioning the only technique that scales writes to a single dataset beyond one node's ceiling?
- Why does the rebalancing strategy need to be decided at the start?
- What is lost by partitioning, beyond the implementation cost?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 6.
- DeCandia, Giuseppe et al. *Dynamo: Amazon's Highly Available Key-value Store*, 2007.
- Corbett, James et al. *Spanner: Google's Globally-Distributed Database*, 2012.
