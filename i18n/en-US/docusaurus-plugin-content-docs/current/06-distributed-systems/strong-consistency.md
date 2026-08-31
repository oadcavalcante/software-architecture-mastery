---
id: strong-consistency
title: Strong Consistency
sidebar_position: 32
description: Every read observes the last write — and the latency price you pay always.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader identifies the operations that require strong consistency and
  limits the scope of the coordination to what is necessary.
prerequisites: [consistency]
related: [eventual-consistency, consensus, pacelc]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Strong Consistency

## Overview

Strong consistency — in its strictest form, **linearizability** — guarantees that the system
behaves as if there were a single copy of the data, with every operation happening instantaneously
in an order that respects real time.

It is the guarantee that makes reasoning simple: the read sees the last write, period.

And it costs coordination — which means latency, on every operation, forever.

## Problem

The mental model of strong consistency is the one every developer already has, because it is how a
single-process program works.

That makes the guarantee attractive by default: adopting it eliminates a whole class of reasoning
about stale data, conflicts and convergence.

The cost is that it does not scale the same way. Every operation that needs a strong guarantee has
to coordinate with a majority of replicas — and coordination is a network round trip.

In a single-region configuration, that is acceptable. In a multi-region one, it is frequently
unviable — and the arithmetic is geometric, not a matter of optimization.

## Core Concepts

### What it guarantees

**Linearizability** is about individual operations: there is an instant between the start and the
end of each operation at which it appears to have happened, and the order of those instants respects
real time.

The practical consequence: if A completes before B starts, B sees A's effect. Always, regardless of
which replica serves it.

**Serializability** is about transactions: the result is equivalent to some sequential execution.
The two together — *strict serializability* — give the strongest guarantee available.

Confusing the two is common. A database can be serializable and not linearizable: the transactions
are correct, and a read may not see the most recent write.

### The cost is coordination

Guaranteeing that every read sees the last write requires the write to be known by whoever answers
the read.

The ways to achieve that — writing to a majority, reading from a majority, or reading from the
leader — all involve communication between nodes.

```text
single region, same zone            → +1 to 2 ms per operation
single region, across zones         → +2 to 5 ms
two regions, same continent         → +30 ms
intercontinental regions            → +150 ms
```

The last line is what makes global strong consistency impractical for high-frequency operations.
See [PACELC](/06-distributed-systems/pacelc.md).

### Limiting the scope is the main technique

The question that solves most cases is not "strong or eventual?". It is **"strong with respect to
what?"**.

**Global** strong consistency — all the replicas in the world coordinating — is expensive. **Per
partition** strong consistency is far cheaper: coordinating only among that partition's replicas,
which can be close together.

A hotel booking system does not need São Paulo to coordinate with Tokyo. It needs the São Paulo
hotel's replicas to coordinate among themselves.

See [partitioning](/06-distributed-systems/partitioning.md). **Partitioning reduces the scope of
the coordination**, and it is what makes strong consistency viable at scale.

### It is unavailable under a partition

By [CAP](/06-distributed-systems/cap.md), guaranteeing consistency during a partition means refusing
operations on the minority side.

That has to be accepted explicitly: the system becomes unavailable for some users instead of
diverging.

For a bank balance and for stock, it is the right trade. For a catalog and a feed, it is not.

### Not every operation needs it

The observation that avoids most of the cost: in a typical system, the fraction of operations that
genuinely requires strong consistency is small.

Debiting a balance, yes. Looking up a statement, no. Reserving a seat, yes. Listing flights, no.

Applying the guarantee uniformly pays the cost on all of them to protect a few.

## Mental Model

**Strong consistency trades latency for certainty, on every operation.** The question is for which
operations the certainty is worth the price.

## When to Use

- The data controls a finite resource — stock, a seat, a balance, a quota.
- An irreversible decision depends on the value read.
- There is a regulatory requirement for accuracy.
- Two concurrent operations would produce an invalid state.
- The cost of being wrong exceeds the cost of the latency.

## When Not to Use

**As the default for every operation.** It pays on all of them to protect a few.

**Globally, when per partition solves it.** The scope is the most important variable.

**When unavailability under a partition is unacceptable.** There the answer is eventual, with
reconciliation.

**For data that does not control a resource.** Profile, catalog, history, aggregates.

**When session guarantees solve the perception.** See
[eventual consistency](/06-distributed-systems/eventual-consistency.md).

## Alternatives

- **Session guarantees** — solve the user's perception at low cost.
- **Strong consistency per partition** — reduces the scope of the coordination.
- **Local transaction** — if the data fits on one node, the guarantee comes for free.
- **Reservation with expiry** — instead of coordinating globally, reserve locally with a deadline
  and confirm later.

The last is the pattern used in ticketing and bookings: locking locally for minutes solves the real
concurrency without global coordination.

## Trade-offs

| Strong | Eventual |
|---|---|
| Simple reasoning | The application deals with stale data |
| No conflicts | Conflicts to resolve |
| Coordination latency always | Local latency |
| Unavailable under a partition | Available |
| Limited write scaling | Scales |

| Global scope | Per partition |
|---|---|
| Coordination among all replicas | Only within the partition |
| Geographic latency | Local |
| Cross-partition operations simple | They need extra coordination |

## Failure Modes

**Unacceptable latency discovered in production.** The coordination was underestimated.

**Unforeseen unavailability under a partition.** The business did not know the system would refuse
operations.

**Strong consistency presumed and not configured.** The code assumes the read sees the write, and
the configuration reads from a replica.

**Unnecessary global scope.** Intercontinental coordination for regional data.

**Contention.** Many concurrent operations on the same key serialize, and throughput collapses.

## Common Mistakes

**Adopting it uniformly.** Few flows in a system need strong consistency — balance, stock,
uniqueness. Applying it to the catalog and the history pays latency and availability for a
guarantee nobody uses.

**Not limiting the scope by partition.** Coordination across all nodes costs far more than
coordination within a partition. Choosing the key so that the invariant fits in one is what makes
the guarantee affordable.

**Confusing linearizability with serializability.** The first is about the real-time order of
operations on an object; the second, about equivalence to some sequential order of transactions. A
database can offer one without the other, and the requirement is usually for only one of them.

**Not checking what the database actually guarantees in the configuration in use.** The default
isolation level is rarely the strongest, and reading from a replica frequently discards the
guarantee the write paid for.

**Not measuring the coordination's latency cost.** Each coordinated write carries at least one round
trip between replicas. Across zones that is a few milliseconds; across continents, more than a
hundred — and the number changes which response requirements are achievable.

## Real-World Example

An event ticketing system needed to guarantee that a seat was not sold twice.

The original implementation used global strong consistency: the database replicated across three
regions, with writes requiring a majority.

Each reservation cost 180 ms of coordination. At the opening of sales for a large event, with 40
thousand simultaneous people, the system could not keep up — the coordination serialized.

The redesign kept strong consistency and changed the scope.

**Partitioning by event.** Each event has its replicas, in the region where it takes place. The
coordination to reserve a seat became one among regional replicas: from 180 ms to 8 ms.

**Reservation with expiry.** Instead of coordinating throughout the whole purchase flow, the
reservation locks the seat for 10 minutes — one coordinated, short operation. The rest of the flow
— payment, registration — happens with no coordination.

**Eventual reads for the seat map.** The availability view reads from a local replica, with a
seconds-long delay. The business accepted it: if a seat appears available and has already been
reserved, the reservation attempt fails with a clear message — which is rare and acceptable.

Result: the guarantee against selling twice remained absolute, and capacity rose by more than an
order of magnitude.

The later assessment points out: giving up strong consistency for the reservation was never in
question. What was wrong was the **scope** — coordinating globally something that is intrinsically
local to an event.

## Related Concepts

- [Consistency](/06-distributed-systems/consistency.md) — the spectrum.
- [Eventual Consistency](/06-distributed-systems/eventual-consistency.md) — the other end.
- [PACELC](/06-distributed-systems/pacelc.md) — the permanent cost.
- [Consensus](/06-distributed-systems/consensus.md) — the mechanism behind it.
- [Partitioning](/06-distributed-systems/partitioning.md) — how to reduce the scope.

## Practical Exercise

List your system's operations that genuinely require strong consistency — the ones that would
produce an invalid state if two happened concurrently.

For each one, ask: what is the smallest coordination scope that suffices? If the answer is smaller
than the current scope, latency is being paid unnecessarily.

## Interview Questions

- What is the difference between linearizability and serializability?
- Why does strong consistency cost latency even with no failure?
- How do you reduce the cost without giving up the guarantee?

## Further Reading

- Herlihy, Maurice; Wing, Jeannette. *Linearizability: A Correctness Condition for Concurrent
  Objects*. TOPLAS, 1990.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 9.
- Abadi, Daniel. *Consistency Tradeoffs in Modern Distributed Database System Design*. IEEE
  Computer, 2012.
