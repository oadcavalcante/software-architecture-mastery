---
id: sharding
title: Sharding
sidebar_position: 15
description: Partitioning across separate instances — and what changes when a partition becomes a server.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader distinguishes sharding from local partitioning and recognizes the
  operational cost the physical separation adds.
prerequisites: [partitioning]
related: [partitioning, replication, database-scaling]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Sharding

## Overview

Sharding is [partitioning](/06-distributed-systems/partitioning.md) in which each partition lives on
a **separate instance** of the database, with its own resources.

The distinction looks subtle and is not: when the partition becomes a server, the cost leaves the
domain of modeling and enters that of operations.

## Problem

Partitioning within one instance — tables partitioned by range, for example — improves maintenance
and some query patterns. It does not increase capacity: CPU, memory and disk remain shared.

When one instance's limit is reached, the partition has to move to another machine. Then three
things change.

**The query has to know where to go.** Someone — the application, a router, the driver — has to map
key to instance.

**Joins and transactions across shards cease to exist** as a database operation. What was a `JOIN`
becomes two queries and an aggregation in the application.

**Each shard is a database to operate.** Backup, monitoring, upgrades, sizing, failover — multiplied
by the number of shards.

## Core Concepts

### Where the routing lives

Three places, with different implications:

**In the application.** It computes the shard and connects to the right database. Simple to start
with, and it spreads the mapping logic through every piece of code that accesses data.

**In a router.** A proxy that speaks the database's protocol and forwards. The application does not
know there are shards. It adds a hop and a component on the critical path.

**In the database itself.** Distributed databases do the routing internally. It is the path of least
friction, and it ties the architecture to that product.

The first is the most common in systems that evolved into sharding, and the most expensive to
maintain — because the routing decision appears in dozens of places.

### The shard directory

The key-to-shard mapping can be:

**Algorithmic.** `hash(key) mod N`, or consistent hashing. Stateless, and rebalancing requires
recomputing.

**By directory.** A table that says where each range lives. Flexible — it allows moving a specific
key, giving a dedicated shard to a large tenant — and it adds a lookup before every access, plus a
component that has to be highly available.

The directory is what allows handling imbalance case by case, and it is what mature multi-tenant
systems usually use.

### Rebalancing is the hard operation

Adding a shard requires moving data. During the move:

Writes for the keys in transit have to go to both places, or be blocked. Reads have to know which
side is authoritative. And the process consumes bandwidth and resources on both nodes.

The technique that reduces the pain is **logical shards**: creating far more logical partitions than
physical instances — 1024 partitions across 8 instances, for example. Adding an instance moves whole
partitions, with no key recomputation.

It is the approach practically every modern partitioned system adopts.

### The unbalanced shard

In a multi-tenant system, imbalance is the rule, not the exception: one large customer can have more
data than a thousand small ones.

That breaks hash partitioning by tenant — that customer's shard saturates while the others sit idle.

The ways out: a dedicated shard for the large ones, or partitioning the large ones internally by a
second dimension. Both require the directory.

## Mental Model

**Sharding is partitioning that became an operations problem.** The modeling is the same; what
changes is that each partition now has its own operational cost.

## When to Use

- The write or data volume exceeds what one instance holds, measured.
- The scaling alternatives have been exhausted. See
  [scalability strategies](/05-system-design/scalability-basics.md).
- There is a natural key by which almost every operation filters.
- The team can operate N databases instead of one.

## When Not to Use

**Before exhausting vertical scaling.** A modern instance holds far more than intuition suggests.

**When operations would frequently cross shards.** The cost of aggregating in the application
exceeds the gain.

**When transactions across shards are a requirement.** They become
[distributed transactions](/06-distributed-systems/distributed-transactions.md).

**With no logical shards.** Rebalancing with a direct mapping to physical instances is significantly
more painful.

**When a distributed database solves it.** Several products do sharding internally, and adopting one
of them avoids building the routing and the operations.

## Alternatives

- **Vertical scaling** — the previous step, almost always not exhausted.
- **[Replication](/06-distributed-systems/replication.md)** — if the bottleneck is reads.
- **Archiving** — reducing the active volume.
- **A distributed database** — delegating the sharding to the product.
- **Logical partitioning on one instance** — improves maintenance without distributing.

## Trade-offs

| With sharding | Single instance |
|---|---|
| Writes and volume scale | Limited |
| Failure isolated per shard | Total |
| Cross-shard operations in the application | The database's `JOIN` and transaction |
| N databases to operate | One |
| Rebalancing as an operation | None |
| Routing to maintain | None |

## Failure Modes

**Unbalanced shard.** One saturates, the others idle.

**A query without the key.** It becomes a scan of every shard.

**Rebalancing during a peak.** It competes with the traffic.

**Directory unavailable.** Without it, no query knows where to go — it becomes a single point of
failure and has to be replicated.

**An unforeseen cross-shard transaction.** Discovered when the requirement appears.

**Scattered routing.** The mapping logic in dozens of places, diverging.

## Common Mistakes

**Sharding before you need it.** It adds routing, prevents joins and transactions across partitions,
and complicates every query — a cost paid from day one for a limit that may never arrive.

**Not using logical shards.** Mapping the key straight to the physical machine ties the number of
partitions to the number of servers, and growing then requires remapping everything. Many logical
partitions over few physical ones make growth a change to a routing table.

**Ignoring tenant imbalance.** Partitioning by customer looks natural until the largest customer
alone exceeds one partition's capacity — and it cannot be split by the chosen key.

**Spreading the routing through the application.** Every point that computes which partition holds
the data is a place to change when the partitioning scheme changes, and a place where the rule can
diverge.

**Not planning the rebalancing before needing it.** When a partition saturates, moving data under
load, without stopping writes and without losing consistency, is an operation that has to have been
designed. Improvising it on the day is how data is lost.

## Real-World Example

A corporate communication platform sharded by `company_id`, with a simple hash across 8 instances.

Two problems in eighteen months.

**Imbalance.** Three large corporate customers landed on the same shard by hash coincidence. That
shard had 60% of the data and saturated while the other seven operated at 15% utilization.

With a simple hash, the only way out would be changing the number of shards — which would
redistribute every key.

**Unviable rebalancing.** When trying to go from 8 to 16 shards, the calculation showed that
practically all the data would have to be moved — weeks of migration with dual writes.

The redesign adopted the two techniques that were missing.

**1024 logical shards** mapped to 8 instances through a directory. Adding instances came to mean
moving whole logical shards, with no key recomputation at all.

**A directory instead of a pure hash.** That made it possible to move the three large customers to
dedicated instances, individually — something impossible with algorithmic mapping.

The migration to the new scheme took six weeks. After it, going from 8 to 12 instances took four
hours.

The detail the team highlights: logical shards and a directory are decisions that cost little at the
start and are expensive to retrofit. Both were in the reference documentation nobody read before
implementing.

## Related Concepts

- [Partitioning](/06-distributed-systems/partitioning.md) — the concept and the choice of key.
- [Replication](/06-distributed-systems/replication.md) — each shard needs its replicas.
- [Hotspots](/11-scalability/index.md) — the imbalance.
- [Database Scaling](/11-scalability/index.md).

## Practical Exercise

If your system is sharded, measure the distribution: size and operation rate per shard. A difference
greater than 3× between the largest and the smallest indicates an imbalance that will get worse.

If it is not, check: is there a natural key? What would happen to a query that does not include it?

## Interview Questions

- What is the difference between partitioning and sharding?
- What are logical shards and what problem do they solve?
- When is a directory preferable to algorithmic mapping?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 6.
- Public architecture write-ups on sharding from large-scale platforms — Slack's, Notion's and
  Figma's are especially detailed.
