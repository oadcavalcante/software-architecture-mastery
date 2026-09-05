---
id: service-boundaries
title: Service Boundaries
sidebar_position: 20
description: Where to separate processes — the most expensive decision to reverse in system design.
doc_type: concept
level: 3
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides service boundaries from evidence in the history
  and from quality requirements, not from intuition.
prerequisites: [services]
related: [system-decomposition, microservices, bounded-context]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Service Boundaries

## Overview

A service boundary separates two sets of capabilities into distinct processes, with a
network contract between them.

It is the most expensive decision to reverse in system design. Moving a boundary
between modules is refactoring; moving a boundary between services is data migration,
coordination between teams and a coexistence period.

## Problem

The question "where to separate?" is usually answered by intuition, by analogy with
another system, or by the current org chart.

All three fail for the same reason: **the right boundary depends on how the system
changes**, and that is not visible by looking at the structure at one instant.

The symptom of a wrong boundary is well known: two services that are always deployed
together, whose mutual unavailability takes both down, and whose changes appear in the
same pull request. They are one service at the cost of two.

## Core Concepts

### The four reasons, and none is code organization

A service boundary is justified by:

**Independent deployment cycle.** Different teams need to ship without coordinating.

**A distinct quality requirement.** Scale, memory, availability or latency very
different from the rest.

**Failure isolation.** One part cannot take down the other.

**External consumption.** Another organization needs the capability isolated.

Without one of them, a module delivers the same logical isolation at a fraction of the
cost. See
[component design](/02-software-design/component-design.md).

### History answers better than intuition

The most reliable check is empirical: **what fraction of commits crosses the proposed
boundary?**

```bash
# files that change together, last 6 months
git log --since=6.months --name-only --pretty=format:%H   | awk 'NF' | sort | uniq -c | sort -rn
```

If two groups of files appear together in 80% of commits, separating them into services
creates a boundary that every change has to cross — with coordination, versioning and a
coexistence period on each alteration.

If they appear together in 5%, the separation captures real independence.

That measurement costs minutes and is almost never done before the decision.

### A bounded context is the natural candidate

The boundaries of a [bounded
context](/04-domain-driven-design/bounded-context.md) are the best candidates, because
they derive from how the business divides — and businesses divide more stably than
technologies.

But not every bounded context needs to become a service. The conclusion of the
[modular monolith](/03-design-patterns/modular-monolith.md): the logical boundary is
always worth it; the physical one, only with one of the four reasons.

### Data defines the boundary, not code

The criterion that most separates a real boundary from a nominal one: **each service is
the exclusive owner of its data.**

If two services read the same table, the boundary does not exist — there is schema
coupling with no contract, which is worse than code coupling.

That implies that deciding the boundary is deciding the partitioning of the data. And
it is the hardest part: separating code is refactoring; separating data involves
migration, eventual consistency and frequently
[sagas](/06-distributed-systems/sagas.md).

### Extract one at a time, with the reason recorded

The strategy that works: start as modules, let the boundaries prove themselves, and
extract **one service at a time**, each with the reason documented in an
[ADR](/18-architecture-decisions/what-is-an-adr.md).

If there is no specific reason, the module stays where it is.

## Mental Model

**The right boundary is the one that change rarely crosses.** That is measurable before
deciding.

## When to Use

- One of the four reasons applies, demonstrably.
- History shows a low crossing rate.
- The data can be partitioned without strong consistency between the sides.
- The team can operate one more service.

## When Not to Use

**Without one of the four reasons.** A module solves it.

**Before the domain stabilizes.** A wrong boundary between services is the most
expensive correction there is.

**When consistency between the sides has to be strong.** Separating requires eventual
consistency or a saga; both change the business semantics and have to be accepted by
the business.

**When crossing is high.** History has already said the boundary is wrong.

**When the team lacks operational capacity.** Each service is one more on the on-call
rotation.

## Alternatives

- **A module with an enforced boundary** — the answer in most cases.
- **Partial extraction** — separate only what has a reason, keeping the rest together.
- **A separate process with no synchronous API** — a queue consumer isolates resources
  without creating a call contract.
- **Defer** — keep it as a module until the reason appears.

## Trade-offs

| Service boundary | Module boundary |
|---|---|
| Independent deployment | Joint |
| Isolated scale and failure | Shared |
| Boundary enforced by the network | Needs a mechanism |
| Moving the boundary is a migration | It is refactoring |
| Transaction across the sides impossible | Possible |
| Versioned public contract | Refactorable |
| One more item in operations | None |

The fourth line is the asymmetry that decides: **it is cheap to promote a module to a
service and expensive to do the inverse.** That recommends erring on the side of fewer
services.

## Failure Modes

**Distributed monolith.** Services coupled in release and in availability.

**Shared database.** Schema coupling with no contract.

**Boundary on the wrong axis.** Every business change crosses it.

**Long synchronous chain.** Availability multiplied, latency added. See
[services](/05-system-design/services.md).

**Extraction with no data migration.** The new service keeps reading the old database.

## Common Mistakes

**Deciding by intuition without measuring the history.**

**Extracting several services at once.**

**Not separating the data along with it.**

**Copying another system's boundary.** The context is what decides.

**Not recording the reason.** Without it, nobody knows whether the boundary still makes
sense.

## Real-World Example

An education platform decided to extract four services from a monolith: `Courses`,
`Enrollments`, `Payments` and `Certificates`.

Before starting, they measured the crossing in 12 months of history.

| Pair | Joint commits |
|---|---|
| Courses ↔ Enrollments | 71% |
| Enrollments ↔ Payments | 34% |
| Payments ↔ Certificates | 3% |
| Courses ↔ Certificates | 2% |

The first pair practically never separated: changes to course structure almost always
implied a change to enrollment. Separating them would create a boundary that 71% of
changes would cross.

The revised decision: `Courses` and `Enrollments` stayed together, as modules with an
enforced boundary. `Certificates` was extracted — low crossing, and it had its own
requirement: PDF generation consumed memory and had already taken down the main process
twice.

`Payments` was not extracted right away. The 34% crossing was ambiguous, and there was
no quality reason — the requirement came a year later, when a second provider came on
board and the payments team gained autonomy.

Result after two years: two services instead of four, and no reversals.

The point the team underlines: the measurement took an afternoon and changed half the
decisions. The original proposal would have created two wrong boundaries, and undoing
them would have cost a data migration in both cases.

## Related Concepts

- [Services](/05-system-design/services.md) — what a boundary creates.
- [Decomposition](/05-system-design/system-decomposition.md) — the logical division that
  precedes it.
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — the natural
  candidate.
- [Microservices](/03-design-patterns/microservices.md) — the style.
- [Modular Monolith](/03-design-patterns/modular-monolith.md) — the default
  alternative.

## Practical Exercise

If you are considering extracting a service, measure first: what fraction of the last
six months' commits touches both sides of the proposed boundary?

Then answer which of the four reasons applies. If none, the boundary should be a
module.

## Interview Questions

- What reasons justify a service boundary?
- How do you empirically check whether a boundary is in the right place?
- Why is separating data harder than separating code?

## Further Reading

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Tornhill, Adam. *Software Design X-Rays*. Pragmatic Bookshelf, 2018 — coupling
  measured by history.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
