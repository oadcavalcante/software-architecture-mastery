---
id: service-boundaries
title: Service Boundaries
sidebar_position: 20
description: "Where to separate processes: the most expensive decision to reverse in system design."
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
translated_from_version: 4
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
# commits from the last 6 months that touch both sides of the proposed boundary
git log --since=6.months --no-merges --name-only --pretty=format:%H |
  awk -v a='^src/courses/' -v b='^src/enrollments/' '
    length($0) == 40 && $0 ~ /^[0-9a-f]+$/ {
      total++; cross += (ta && tb); ta = tb = 0; next
    }
    $0 ~ a { ta = 1 }
    $0 ~ b { tb = 1 }
    END { cross += (ta && tb); printf "%d of %d commits cross\n", cross, total }'
```

If two groups of files appear together in 80% of commits, separating them into services
creates a boundary that every change has to cross, with coordination, versioning and a
coexistence period on each alteration.

If they appear together in 5%, the separation captures real independence.

That measurement costs minutes and is almost never done before the decision.

### A bounded context is the natural candidate

The boundaries of a [bounded
context](/04-domain-driven-design/bounded-context.md) are the best candidates, because
they derive from how the business divides, and businesses divide more stably than
technologies.

But not every bounded context needs to become a service. The conclusion of the
[modular monolith](/03-design-patterns/modular-monolith.md): the logical boundary is
always worth it; the physical one, only with one of the four reasons.

### Data defines the boundary, not code

The criterion that most separates a real boundary from a nominal one: **each service is
the exclusive owner of its data.**

If two services read the same table, the boundary does not exist: the processes are
separated and their evolution is not, because the schema remains the point of
agreement between the two sides. Why that coupling is the most expensive one, in
[data ownership](/07-data-architecture/data-ownership.md).

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

**When consistency between the sides has to be strong.** Separating leaves three ways
out: eventual consistency and sagas, which change the business semantics and have to be
accepted by the business, or a
[distributed transaction](/06-distributed-systems/distributed-transactions.md), which
preserves the semantics and charges for it in availability.

**When crossing is high.** History has already said the boundary is wrong.

**When the team lacks operational capacity.** Each service is one more on the on-call
rotation.

## Alternatives

- **A module with an enforced boundary**: the answer in most cases.
- **Partial extraction**: separate only what has a reason, keeping the rest together.
- **A separate process with no synchronous API**: a queue consumer isolates resources
  without creating a call contract.
- **Defer**: keep it as a module until the reason appears.

## Trade-offs

| Service boundary | Module boundary |
|---|---|
| Independent deployment | Joint |
| Isolated scale and failure | Shared |
| Boundary enforced by the network | Needs a mechanism |
| Moving the boundary is a migration | It is refactoring |
| Transaction across the sides only distributed | Local, in the same commit |
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

**Deciding by intuition without measuring the history.** The crossing rate shows up
either way: after the extraction, when correcting it already costs a migration.

**Extracting several services at once.** Without one extraction at a time there is no
baseline between them, and whatever latency or availability regression shows up at the
end has nothing to attribute it to.

**Not separating the data along with it.** The deferred migration is the work that
remains, and it grows with every month of coexistence.

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
| Enrollments ↔ Certificates | 6% |
| Courses ↔ Payments | 4% |
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
no quality reason. The requirement came a year later, when a second provider came on
board and the payments team gained autonomy. The extraction happened then, with the
reason recorded.

Result after two years: three deployable processes instead of the four proposed (the
`Courses`+`Enrollments` core, `Certificates` and `Payments`) and no reversals.

The point the team underlines: the measurement took an afternoon and changed half the
decisions. Of the original proposal, one boundary was wrong: `Courses`↔`Enrollments`,
and undoing it would have cost a data migration. The other was premature: `Payments`
came out a year later, for the right reason and with nothing to undo.

## Related Concepts

- [Services](/05-system-design/services.md): what a boundary creates.
- [Decomposition](/05-system-design/system-decomposition.md): the logical division that
  precedes it.
- [Bounded Context](/04-domain-driven-design/bounded-context.md): the natural
  candidate.
- [Microservices](/03-design-patterns/microservices.md): the style.
- [Modular Monolith](/03-design-patterns/modular-monolith.md): the default
  alternative.
- [Data Ownership](/07-data-architecture/data-ownership.md): why partitioning the data
  decides whether the boundary is real.

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
- Tornhill, Adam. *Software Design X-Rays*. Pragmatic Bookshelf, 2018. Coupling
  measured by history.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
