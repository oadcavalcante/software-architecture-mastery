---
id: distributed-cqrs
title: Distributed CQRS
sidebar_position: 39
description: Separating the write model from the read model — and why the separation without distinct stores rarely pays off.
doc_type: pattern
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader distinguishes the degrees of CQRS and applies only what the real
  problem requires.
prerequisites: [event-driven-systems]
related: [distributed-event-sourcing, eventual-consistency, replication]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Distributed CQRS

## Overview

CQRS separates the model used to **change** data from the model used to **query** data.

The idea is simple and the degree of application varies a great deal — from separating classes in the
same database to maintaining completely different stores, fed asynchronously.

Confusion between those degrees is the source of most badly calibrated adoptions: teams pay the cost
of the maximum degree to solve problems the minimum degree would solve.

## Problem

A single model serves two purposes with opposite needs.

**Writing** needs invariants, normalization, transactions and validation.

**Reading** needs ready data, denormalized, in the screen's format.

Serving both with the same model produces queries with many joins, or denormalization that
complicates writing — and the two workloads compete for the same resource.

## Core Concepts

### The degrees, and choosing the smallest sufficient one

**Degree 1 — separation in the code.** Commands and queries in different types, the same database,
the same tables. Nearly zero cost. It solves readability and allows optimizing queries without
carrying the domain model.

**Degree 2 — separate models over the same database.** Reading uses views or direct optimized
queries; writing uses the domain model. Still transactionally consistent.

**Degree 3 — read replica.** The same schema, a separate server. It introduces lag. See
[replication](/06-distributed-systems/replication.md).

**Degree 4 — a distinct read store.** A different database, with its own schema, fed by events.
Eventual consistency, projections to maintain, rebuilds to operate.

The recommendation: **most systems that "need CQRS" need degree 1 or 2.** Degree 4 is justified when
the read side has a different technology requirement — full-text search, graph, analytics — or when
the load asymmetry is large enough to require independent scaling.

Adopting degree 4 for elegance pays eventual consistency, projections and rebuild operations to solve
a problem a view would solve.

### The projection has to be rebuildable

At degree 4, the read model is derived. That means it can be discarded and rebuilt — and that
capability has to be exercised, not merely exist in theory.

A defect in the projection corrupts the reads. The fix is to fix the code and rebuild. If the rebuild
takes 18 hours and has never been tested, it is not an option during an incident.

The practice that works: rebuilding periodically in a test environment, and knowing the time.

### Eventual consistency leaks into the interface

At degree 3 or 4, a user who performs an action and immediately queries may not see the effect.

See [eventual consistency](/06-distributed-systems/eventual-consistency.md). The mitigations —
optimistic update, explicit state, reading directly from the write model for the author — have to be
designed.

Ignoring that produces the most common complaint in CQRS systems: "I saved and it does not show".

### Multiple projections are the main benefit

The gain that justifies degree 4 when it is justified: the same write feeds different projections,
each in the appropriate store.

```text
write  →  relational database (lookup by identifier)
       →  full-text search index
       →  aggregates for reporting
       →  read cache per screen
```

No single model serves all of those well. That is the real reason for adoption.

### CQRS does not require event sourcing

They appear together frequently and are independent.

CQRS can be fed by database change capture, by integration events, or by a batch process — with no
[event sourcing](/06-distributed-systems/distributed-event-sourcing.md).

Event sourcing practically requires CQRS. The converse does not hold, and treating them as a package
leads teams to adopt two expensive patterns when they needed one cheap one.

## Mental Model

**CQRS is a scale, not a switch.** The right question is what the smallest degree that solves the
real problem is.

## When to Use

- Reading requires different technology from writing — search, graph, analytics.
- A large load asymmetry, with a need to scale separately.
- Many distinct views of the same data.
- The domain model is complex and the queries become heavy because of it.
- There is already [event sourcing](/06-distributed-systems/distributed-event-sourcing.md).

## When Not to Use

**In CRUD.** The cost is full and the benefit is nil.

**Degree 4 when degree 1 or 2 solves it.** The most common calibration error.

**When strong consistency between write and read is a requirement.**

**With no tested rebuild procedure.**

**With no handling of eventual consistency in the interface.**

**Because it automatically accompanies event sourcing.**

**With no projection lag monitoring.** See
[backpressure](/06-distributed-systems/backpressure.md).

## Alternatives

- **A database materialized view** — much of the read benefit, maintained by the database, with no
  projection to operate.
- **Read replica** — load separation with no different schema.
- **Cache** — when the problem is the volume of repeated reads.
- **An index** — frequently the slow query needs an index, not architecture.

The last is the check to do before anything else: slow queries have motivated many CQRS adoptions an
index would have solved.

## Trade-offs

| Degree 1–2 | Degree 4 |
|---|---|
| Transactional consistency | Eventual |
| One store | Two or more |
| No projection | Projections to maintain and rebuild |
| Zero operational cost | Significant |
| Coupled scaling | Independent |
| One data model | Each read in the ideal format |
| A single technology | Technology per need |

## Failure Modes

**Lagging projection.** The reads get staler and staler.

**Corrupted projection.** A defect writes wrong data and it persists until a rebuild.

**Unviable rebuild.** It takes hours and has never been tested.

**Silent divergence.** The projection loses events and nobody compares.

**The interface showing stale data as current.**

**Complexity with no benefit.** Degree 4 over CRUD.

## Common Mistakes

**Jumping straight to degree 4.**

**Adopting it along with event sourcing without evaluating them separately.**

**Not testing the rebuild.**

**Not monitoring the projection's lag.**

**Not checking for divergence between write and read.** A periodic comparison of counts detects
silent loss.

**Not handling eventual consistency in the interface.**

## Real-World Example

A contract management system had slow queries on the main screen: a listing with filters that joined
seven tables, with a 4-second response time.

The initial proposal was degree 4 CQRS with a projection in a document store, fed by events.

Before implementing, the team ran a check that changed the decision.

**Query analysis.** Two of the seven joins were unnecessary — leftovers from an earlier version of
the screen. Removed, the time dropped to 1.8 seconds.

**A composite index.** Over the most used filter fields. Time: 320 ms.

**A materialized view** for the aggregate that was still expensive. Final time: 90 ms.

None of those is degree 4 CQRS. The problem was solved with three days of work.

A year later, a new requirement genuinely justified degree 4: full-text search over the contracts'
content, with typo tolerance, facet aggregation and relevance tuned by business
signals — and with a search load high enough to compete with the transactional one.
The database's own text search was measured first and did not sustain the last two.
See [search](/05-system-design/search.md).

The implementation was limited to what was necessary: one projection for the search index, fed by
events, with the rest of the queries staying on the relational database.

The operational problems that appeared in that projection:

**Divergence.** After a defective deployment, the projection lost 12 hours of updates. There was no
count comparison, and the discovery came from a user reporting a contract that did not appear in the
search.

**Rebuild.** It took 6 hours for the full history. It was reduced to 40 minutes with parallelization,
after the need appeared during an incident.

The point the team underlines: the CQRS that paid off was the minimally scoped one, adopted when
there was a clear technical reason. The CQRS they almost adopted a year earlier would have cost
months to solve an index problem.

## Related Concepts

- [Distributed Event Sourcing](/06-distributed-systems/distributed-event-sourcing.md) — independent.
- [Eventual Consistency](/06-distributed-systems/eventual-consistency.md) — the consequence.
- [Replication](/06-distributed-systems/replication.md) — the intermediate degree.
- [Event-Driven Systems](/06-distributed-systems/event-driven-systems.md) — how the projection is fed.

## Practical Exercise

Take the slowest query in your system. Before considering CQRS, check: is there an adequate index?
Are there unnecessary joins? Would a materialized view solve it?

If all the answers are negative and the query is still slow, then separating the models becomes a
candidate.

## Interview Questions

- What are the degrees of CQRS and how do you choose between them?
- Why does CQRS not require event sourcing?
- How do you detect that a projection has diverged?

## Further Reading

- Young, Greg. *CQRS Documents*, 2010.
- Fowler, Martin. *CQRS*, 2011.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013 — chapter 4.
