---
id: cqrs
title: CQRS
sidebar_position: 27
description: Separating the write model from the read model — and the cost of keeping them in sync.
doc_type: pattern
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader distinguishes the levels of CQRS and knows when separating
  the models pays off.
prerequisites: [event-driven]
related: [event-sourcing, command, event-driven]
canonical_for: [CQRS, command-query separation]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# CQRS

## Overview

CQRS — *Command Query Responsibility Segregation* — separates the model used to change
state from the model used to query it.

The name covers a spectrum, and treating it as one thing is the source of most of the
misuse. There are three levels, with costs that differ by orders of magnitude.

## Problem

A single model serving both writes and reads ends up serving both badly.

Writes need invariants, small aggregates and normalization — to guarantee consistency.
Reads need combined, denormalized data in the shape of the screen — to be fast.

Serving both produces the familiar compromise: aggregates too large to write safely, with
too many joins to read with performance, and screens that fire chained queries.

## Core Concepts

### The three levels

**Level 1 — separating the methods.** Commands change and return no data; queries return
and change nothing. It is Bertrand Meyer's command-query separation principle, costs
almost nothing and is worth it almost always.

**Level 2 — separate models, same database.** The write side uses aggregates; the read
side uses direct queries or projections, without going through the domain. Moderate cost,
large benefit.

**Level 3 — separate stores.** Writes and reads in different databases, synchronized
asynchronously. High cost: eventual consistency, synchronization, reprocessing.

When someone says "let's use CQRS", the first question is **which level**. Most of the
benefits are at level 2; most of the problems, at level 3.

### Level 2 is underrated

Separating the models without separating the store resolves the main conflict and
introduces no eventual consistency.

The read side queries the database directly, returning exactly what the screen needs,
without loading aggregates. The write side keeps the aggregates small and focused on
invariants.

That eliminates the compromise and keeps the transaction. For most systems, it is where
to stop.

### Level 3 and eventual consistency

Separate stores mean the read side lags behind the write side by some interval.

The practical consequence is specific and has to be decided by the business: **the user
who just saved may not see their own change.**

There are mitigations — reading from the write side right after saving, or waiting for
projection confirmation — and all of them add complexity.

### CQRS does not require event sourcing

A frequent confusion. The two appear together because
[event sourcing](/03-design-patterns/event-sourcing.md) naturally produces a stream for
updating projections, but they are independent: CQRS works with traditional state, and
event sourcing can exist without CQRS.

## When to Use

- **Level 1:** always. It is hygiene.
- **Level 2:** when the read and write needs genuinely diverge — screens that combine
  data from several aggregates, or aggregates that grew in order to serve queries.
- **Level 3:** when the read load is orders of magnitude greater than the write load and
  scaling together is unviable, or when the reads require a different storage model —
  full-text search, graph, time series.

## When Not to Use

**Level 3 with no proven scaling requirement.** The dominant mistake. Eventual consistency
introduced for architectural elegance costs in support, in user confusion and in
reprocessing complexity.

**In CRUD domains.** If reads and writes use the same data the same way, there is no
divergence to resolve.

**When the business does not accept eventual consistency.** It has to be a declared
decision, not a discovered consequence.

**Without a reprocessing strategy.** Projections get corrupted, read schemas change. If
there is no way to rebuild from scratch, the system is stuck at the first error.

**As a synonym for "modern architecture".**

## Alternatives

- **A single model** — appropriate in most systems.
- **A read replica** — solves read scaling without separating models.
- **Materialized views in the database itself** — projections with no additional
  infrastructure.
- **Level 2 only** — the middle ground that resolves most cases.

## Trade-offs

| Level 3 | Level 2 | Single model |
|---|---|---|
| Independent scaling | Scales together | Scales together |
| Read model freely optimized | Optimized queries | A compromise |
| Eventual consistency | Transactional | Transactional |
| Synchronization to build and operate | None | None |
| Reprocessing necessary | No | No |
| High operational cost | Low | None |

## Failure Modes

**Projection lagging beyond what is acceptable.** The user does not see what they just
saved, and support gets the ticket.

**Corrupted projection with no rebuild.** A defect in the consumer writes wrong data and
there is no way to redo it.

**Synchronization that fails silently.** The read side stops updating and nobody notices
until someone complains.

**Models that diverge semantically.** The read side comes to represent something
different from the write side, and nobody knows which is right.

**Level 3 adopted where level 2 would have done.** Cost for a benefit that was already
available.

## Common Mistakes

**Not deciding the level.**

**Adopting level 3 by default.**

**Assuming CQRS requires event sourcing.**

**Not planning for projection rebuilds.**

**Not measuring the lag.** With no projection-delay metric, the problem shows up through
the support channel.

## Where it appears in practice

**High-volume e-commerce.** A catalogue read millions of times and updated rarely — the
case where level 3 is clearly justified.

**Search.** A search index is a read projection; almost every system with full-text
search practises level 3 CQRS without calling it that.

**Dashboards and reports.** Denormalized read models fed asynchronously.

**Financial systems with statements.** The balance is written with transactional rigour;
the statement is a projection optimized for querying by period.

The search case is the most instructive: nobody questions an index being seconds behind
the database. The same lag on a registration screen would generate complaints. **Tolerance
for eventual consistency is a property of the feature**, not of the system.

## Real-World Example

A courses platform had a listing screen taking 4 seconds: each course loaded its
instructor, category, ratings and enrolment count, with lazy loading producing the classic
N+1.

The initial proposal was level 3 CQRS, with a read database fed by events.

The analysis changed course. The read load was 200 requests per second — the database
handled it comfortably. The problem was not scale; it was the access model.

The solution was level 2: a single hand-written query returning a projection type with
exactly the screen's fields. No going through the aggregates, no lazy loading.

The time dropped to 80 ms. No new infrastructure, no eventual consistency, no reprocessing
to build.

Two years later, full-text search moved to a separate index — level 3, and justified
there, because the requirement was about the storage model, not about scale.

The two levels coexist in the same system, each where it pays off.

## Related Concepts

- [Command](/03-design-patterns/command.md) — the origin of the vocabulary.
- [Event Sourcing](/03-design-patterns/event-sourcing.md) — frequently combined,
  independent.
- [Event-Driven Architecture](/03-design-patterns/event-driven.md) — the synchronization
  mechanism.
- [Data Architecture](/07-data-architecture/index.md).

## Practical Exercise

Pick the slowest screen in your system. Check whether it loads complete aggregates to
display a few fields.

If so, write the query that returns exactly what the screen needs. Compare the time. That
is level 2's gain, with no consistency cost at all.

## Interview Questions

- What are the levels of CQRS and what does each one cost?
- Does CQRS require event sourcing?
- What business decision does level 3 force you to make?

## Further Exploration

- Young, Greg. *CQRS Documents*, 2010.
- Fowler, Martin. *CQRS*, 2011.
- Meyer, Bertrand. *Object-Oriented Software Construction*, 1988 — command-query
  separation.
