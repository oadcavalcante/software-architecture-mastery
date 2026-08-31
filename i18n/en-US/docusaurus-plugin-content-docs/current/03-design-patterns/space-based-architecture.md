---
id: space-based-architecture
title: Space-Based Architecture
sidebar_position: 30
description: Removing the database from the critical path using replicated memory — extreme scale at a high price.
doc_type: pattern
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes the specific bottleneck this style addresses and
  why it is rarely the answer.
prerequisites: [microservices]
related: [event-driven, cqrs, scalability]
canonical_for: [space-based architecture]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Space-Based Architecture

## Overview

Space-Based Architecture removes the database from the request path. The processing units
hold the data in memory, replicated among themselves, and persistence happens
asynchronously.

The name comes from the *tuple space* concept. It is the most specialized style in this
catalogue, and it exists for a specific bottleneck.

## Problem

Systems with highly variable, concurrent load run into the same limit: the central
relational database.

Adding application servers does not help — they all converge on the same database. Read
replicas help with queries and not with writes. Partitioning helps until an operation
needs to cross partitions.

The style starts from an observation: **if the database is the bottleneck, take it out of
the path.**

## Core Concepts

### The components

**Processing unit** — holds the logic and an in-memory data grid with the portion of the
data it needs.

**Replicated data grid** — the units synchronize among themselves; a write in one
propagates to the others.

**Asynchronous persistence engine** — writes to the database outside the request path.

**Virtualization middleware** — distributes requests and manages units joining and
leaving.

```mermaid
graph TB
  R[Requests] --> M[Middleware]
  M --> U1[Unit + memory] & U2[Unit + memory] & U3[Unit + memory]
  U1 <--> U2 <--> U3
  U1 & U2 & U3 -.asynchronous.-> DB[(Database)]
end
```

### Scaling is nearly linear

Since there is no central resource in the path, adding units adds capacity — up to the
limit of replication, which grows with the number of units.

That is the gain, and it is real: loads no central database sustains become viable.

### The price

**Eventual consistency between units.** Propagation takes time; two requests on different
units may see different states.

**Data loss on failure.** Whatever is in memory and not yet persisted is lost if the unit
goes down before replication and writing.

**Memory as the sizing constraint.** The active data set has to fit.

**High operational complexity.** Units joining and leaving, rebalancing, grid partitioning,
diagnosing divergence.

## When to Use

- Extremely variable and unpredictable load, with peaks of orders of magnitude.
- The central database is demonstrably the bottleneck, and the usual alternatives have
  already failed.
- The active data set fits in distributed memory.
- Eventual consistency is acceptable for the domain.
- Losing seconds of data on failure is tolerable.

## When Not to Use

**In the overwhelming majority of systems.** It has to be said explicitly: the style
addresses a bottleneck few systems reach.

**When the database has not been optimized.** Missing indexes, bad queries and the absence
of caching explain most bottlenecks attributed to the database.

**When strong consistency is a requirement.** Transactional finance does not fit.

**When data loss on failure is unacceptable.**

**When the active set does not fit in memory.**

**When the operational maturity does not exist.** It is the most demanding style in the
whole catalogue in terms of operations.

## Alternatives

Practically all of them should be exhausted first:

- **Optimizing queries and indexes** — solves most cases.
- **A distributed cache** — captures much of the benefit at far lower cost.
- **Read replicas** — for read load.
- **[CQRS](/03-design-patterns/cqrs.md)** — separating the models.
- **Partitioning** — when the operations do not cross partitions.
- **A modern distributed database** — several offer horizontal scale without the
  application changing style.

The last alternative is what most reduced this style's practical relevance: databases that
scale horizontally solve the original problem without requiring replicated memory in the
application.

## Trade-offs

| Space-based | Central database |
|---|---|
| Nearly linear scaling | Limited by the database |
| Memory latency | Network and disk latency |
| Eventual consistency | Transactional |
| Risk of loss on failure | Durability guaranteed |
| Memory as the dominant cost | Cheap storage |
| Very complex operations | Well understood |

## Failure Modes

**Divergence between units.** Delayed replication produces inconsistent responses.

**Data loss.** A unit goes down before persisting.

**Split brain.** A network partition divides the grid; two groups diverge.

**Memory exhaustion.** The active set grows beyond what was anticipated.

**Replication storm.** A new unit joining triggers synchronization that saturates the
network.

## Common Mistakes

**Adopting it without exhausting the alternatives.** Read replicas, caching and query
fixes solve most cases for a fraction of the operational cost, and are rarely tried to the
end before moving state into memory.

**Assuming the database is the bottleneck without measuring.** The whole pattern exists to
take the database out of the critical path. If the bottleneck was a query with no index,
you pay the whole complexity and the system stays slow.

**Ignoring the data loss window.** Between the write to the in-memory grid and the
asynchronous persistence there is an interval in which a simultaneous node failure loses
writes acknowledged to the user. That interval is a business decision, not a configuration
detail.

**Underestimating the operations.** A distributed data grid requires understanding
partitioning, rebalancing and behaviour under network partition — a skill most teams do
not have and will not hire for a single system.

## Where it appears in practice

**Financial trading platforms.** Microsecond latency and extreme volume, with tolerance
for later reconciliation.

**High-concurrency booking systems.** Ticket sales with peaks of orders of magnitude
within minutes.

**Multiplayer games.** World state in memory, asynchronous persistence.

**Betting platforms.** Volume concentrated in short windows.

The common denominator is revealing: **extreme, short peaks, with tolerance for momentary
inconsistency**. Outside that profile, the style is cost with no return — and that is why
it appears in niches and not in ordinary business systems.

## Real-World Example

A ticketing platform faced a real problem: when sales opened for a large event, 400
thousand people arrived within two minutes. The central database saturated in seconds, and
the waiting queue grew until it timed out.

Before considering this style, the team exhausted the rest: indexes, read caching,
replicas, an admission queue. Each bought something, and the bottleneck stayed in the
writes — reserving a seat is a concurrent write over the same set of rows.

The solution adopted was space-based **for the reservation module only**, during the
opening window. The event's seat inventory lives in replicated memory; reservations happen
there; persistence is asynchronous.

The rest of the system — registration, payment, ticket issuance — stayed on the central
database.

Two consequences the team accepted explicitly. A window of up to two seconds in which two
units may reserve the same seat, resolved by reconciliation with cancellation and refund —
which happens in about 0.01% of reservations and is treated as a cost of business.

And a data loss window of seconds, mitigated by triple replication.

What makes the case defensible is not the technology. It is that the scope was minimal,
the alternatives were exhausted first, and both consequences were negotiated with the
business rather than discovered afterwards.

## Related Concepts

- [Microservices](/03-design-patterns/microservices.md) — the style can be applied to one
  service.
- [CQRS](/03-design-patterns/cqrs.md) — a cheaper alternative for separating load.
- [Scalability](/11-scalability/index.md) — the strategies that come first.
- [Distributed Systems](/06-distributed-systems/index.md) — replication and consistency.

## Practical Exercise

If your system has a bottleneck attributed to the database, check in this order: do the
queries have adequate indexes? Is there caching? Is the load reads or writes? Do the writes
contend over the same rows?

Only the last answer, if yes, points in this style's direction.

## Interview Questions

- Which specific bottleneck does this style address?
- Which alternatives should be exhausted first?
- What are the two consequences the business has to accept?

## Further Exploration

- Richards, Mark; Ford, Neal. *Fundamentals of Software Architecture*. O'Reilly, 2020 —
  the chapter on the style.
- Gelernter, David. *Generative Communication in Linda*. TOPLAS, 1985 — the origin of the
  tuple space concept.
