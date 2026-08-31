---
id: key-value-databases
title: Key-Value Databases
sidebar_position: 4
description: The simplest model there is — access by key, very high throughput, and no querying.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes the workloads the model serves and avoids using it as
  the source of truth when the access is not by key.
prerequisites: [nosql]
related: [document-databases, data-lifecycle, relational-databases]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Key-Value Databases

## Overview

A key-value store does one thing: it stores a value under a key and returns it when that key is asked
for.

There is no querying by content, no joins, no aggregation. That limitation is what allows microsecond
latency and throughput of millions of operations per second.

It is the easiest model to choose correctly, because the question is objective: **is the access always
by a known key?**

## Problem

A lot of system workload is exactly that — a user session, the result of an expensive computation, a
counter, a catalog item by identifier, rate limit control.

Serving those workloads from a relational database works and wastes: you pay for an optimizer,
transactions, a schema and joins to do a lookup by key.

Worse, you occupy the transactional database with very high-frequency load that competes with the real
operation.

## Core Concepts

### The limitation is the feature

With no querying by content, the store can partition by key with no coordination. With no joins, there
is no operation that crosses partitions.

That is what makes horizontal scaling trivial: doubling the capacity is adding nodes and redistributing
keys. See
[partitioning](/06-distributed-systems/partitioning.md).

### The key's design is the entire modeling

Since access is only by key, the key has to carry everything that identifies the data.

```text
session:{session_id}
user:{user_id}:preferences
limit:{customer_id}:{minute}
cart:{user_id}
```

A prefix convention, a consistent separator and versioning in the prefix when the value's format
changes. There is no easy bulk rename — badly designed keys stay.

### Native expiry eliminates work

Most of these stores delete keys automatically when the deadline passes.

That is more relevant than it looks: it replaces a cleanup process, a control table and the risk of
unbounded growth. Sessions, caches and rate limits come out correct with no code.

See [data lifecycle](/07-data-architecture/data-lifecycle.md).

### In memory or persistent — decide clearly

Many are primarily in memory, with optional persistence. That changes what you can store there.

**If the loss is acceptable** — a cache, a recoverable session — in memory is adequate and fast.

**If the loss is not acceptable**, check exactly what the configuration guarantees: some acknowledge
the write before persisting, and a crash loses the last few seconds.

Treating an in-memory store as the source of truth without checking that is the model's most expensive
error.

### Atomic operations cover more than expected

Increment, add to a structure, set-if-absent. Those primitives solve counting, a simple queue, rate
limiting and light locking with no transaction.

On distributed locking, though, there is a known trap — see
[distributed locks](/06-distributed-systems/distributed-locks.md).

### The value is opaque

The store does not interpret the content. That means changing the value's format requires every reader
to handle the old versions still stored.

Including the format version inside the value, or in the key's prefix, costs nothing at the start and
avoids an unpleasant migration.

## Mental Model

**Key-value trades all query capability for speed and scale.** If you need to ask something other than
"give me key X", it is the wrong model.

## When to Use

- The access is always by a known key.
- Very high throughput or very low latency matter.
- Cache, session, rate limit, counter, computed result.
- Automatic expiry has value.
- The value is read whole.

## When Not to Use

**When you need to query by content.** That is not what it does.

**As the source of truth without checking durability.**

**For data with relationships.**

**For aggregation or reporting.**

**When the value is large and only a piece of it is used.** See
[documents](/07-data-architecture/document-databases.md).

**For a queue with guarantees.** It works approximately and offers no redelivery, no ordering and no
[dead-letter](/06-distributed-systems/dead-letter-queues.md).

## Alternatives

- **[Document](/07-data-architecture/document-databases.md)** — when there is querying by field.
- **[Relational](/07-data-architecture/relational-databases.md)** — when there are relationships.
- **A local in-process cache** — when the data fits and consistency between instances does not matter;
  it eliminates a network round trip.
- **Messaging** — when the need is a queue.

## Trade-offs

| Key-value | Document |
|---|---|
| By key only | Querying by field |
| Minimal latency | Higher |
| Trivial horizontal scaling | More complex |
| Modeling only in the key | Aggregate modeling |
| Opaque value | Known structure |

| In memory | Persistent |
|---|---|
| Microseconds | Milliseconds |
| Loss possible on a crash | Durable |
| Limited by memory | By disk |
| High cost per gigabyte | Low |

## Failure Modes

**Data loss on a crash.** Durability was not what was assumed.

**Keys with no expiry accumulating.** Memory fills and the store starts evicting data — including what
matters.

**A hot key.** A heavily accessed key concentrates load on one node.

**An incompatible value format.** A deployment changes the serialization and the stored values are no
longer readable.

**Use as a queue with no guarantees.** Messages lost on a consumer failure.

**A badly designed key.** With no consistent prefix, there is no way to inventory or expire by
category.

## Common Mistakes

**Assuming durability without checking the configuration.**

**Not setting an expiry** on data that should expire.

**Not versioning the value's format.**

**Storing large values** — moving megabytes per key wastes network and memory.

**Using it as a queue.**

**Not monitoring the eviction rate.** It is the sign that the store is discarding data for lack of
memory.

## Real-World Example

A commerce platform used an in-memory key-value store for sessions, cache and the shopping cart.

Sessions and cache: correct use — acceptable loss, native expiry, access by key.

The cart: incorrect use, and it took fourteen months to surface.

During an unplanned node restart, **every active cart was lost**. The configuration persisted every
second, but that specific node had persistence disabled by a change made months earlier to reduce
latency — with nobody connecting the change to the cart.

The estimated loss was an afternoon of interrupted sales.

A second problem appeared during the investigation: the eviction rate had been high for weeks. Cache
keys with no expiry filled memory, and the store discarded the least used ones — which were sometimes
the carts of customers who took a while to check out.

That is, carts had been disappearing silently before the incident, and the complaint was treated as
user error.

The fixes:

**The cart migrated to a durable store**, with the key-value store kept only as a read cache.

**Mandatory expiry** on every cache key, validated in the access library.

**An eviction rate alert**, which did not exist.

**A key convention** with a prefix per domain, allowing an inventory of what was occupying memory —
which nobody could answer before.

The reading the team takes from it: the question "what happens if this node restarts right now?" had
never been asked about the cart. It would have cost five minutes.

## Related Concepts

- [Document Databases](/07-data-architecture/document-databases.md) — when there is querying.
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md) — expiry and retention.
- [Partitioning](/06-distributed-systems/partitioning.md) — how the scaling works.
- [Distributed Locks](/06-distributed-systems/distributed-locks.md).

## Practical Exercise

List what is in your key-value store. For each category, answer: what happens if that data disappears
right now?

Where the answer is serious, check the durability configuration — not the product's documentation, that
environment's configuration.

## Interview Questions

- Why is the absence of querying what allows the scale?
- How do you decide whether data can live in an in-memory store?
- What does the eviction rate indicate?

## Further Reading

- DeCandia, Giuseppe et al. *Dynamo: Amazon's Highly Available Key-value Store*. SOSP, 2007.
- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
