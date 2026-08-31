---
id: boundaries
title: Boundaries
sidebar_position: 7
description: Where to draw the lines the code does not cross — and what makes a line real.
doc_type: concept
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses where to draw boundaries from the axis of change
  and the cost of crossing, and knows which mechanism makes each one effective.
prerequisites: [interfaces]
related: [layering, modular-design, dependency-direction]
canonical_for: [boundary, architectural boundary]
translated_from_version: 1
last_reviewed: 2026-08-30
---

# Boundaries

## Overview

A boundary is a line separating two parts of the system, with a rule about what
may cross it and in which direction.

Boundaries are the central instrument of structural design. They determine what
can be changed without affecting the rest, what can be tested in isolation, and
where failure stops propagating.

## Problem

Every system has boundaries. The question is whether they were decided or whether
they emerged.

Emergent boundaries are the worst possible ones, because they follow historical
accident: where the first developer put the file, which module happened to be open
when the feature was requested, who had time that week.

But conscious decisions go wrong too, in two symmetric ways.

**Too many boundaries.** Each one has a cost: a contract to maintain, an
indirection to navigate, a type translation, one more place where the flow is
interrupted. A system with fifteen boundaries where three would do pays that cost
fifteen times.

**Boundaries on the wrong axis.** Worse than none. A boundary cutting
perpendicular to the axis of change makes every business change cross it — and
crossing costs coordination, translation and, when different teams are involved,
negotiation.

## Core Concepts

### The criterion is the axis of change

The same as for [modularity](/01-fundamentals/modularity.md) and
[cohesion](/01-fundamentals/cohesion.md): things that change for the same reason
stay on the same side.

The check is empirical and cheap. Look at the history: if most commits cross the
boundary, it is in the wrong place. If few cross, it is capturing a real
separation.

### A boundary has a direction

A boundary is not symmetric. Beyond separating, it declares who may know whom.

The rule that almost always holds: **the dependency points in the direction of
stability.** The side that changes less is known by the side that changes more,
not the other way around. That is the subject of
[dependency direction](/02-software-design/dependency-direction.md).

### The levels and their costs

The same boundary decision shows up at different scales, with costs that grow by
orders of magnitude:

| Level | Mechanism | Cost of crossing |
|---|---|---|
| Function | Signature | None |
| Class | Visibility | None |
| Module | Language module, architecture test | Compilation, discipline |
| Package / library | Versioning | Release, compatibility |
| Process / service | Network | Latency, partial failure, serialization, operations |
| System / organization | Formal contract | Negotiation between teams |

Moving up a level without need is the most common source of accidental complexity
in distributed systems. A badly drawn module boundary costs a refactoring; the
same badly drawn boundary between services costs months.

**Choose the lowest level that solves the problem.** It is almost always lower
than the initial proposal suggests.

### What crosses matters

A boundary that lets one side's internal type through is not a boundary. If the
orders module receives the customers module's persistence entity, both are coupled
to the same schema decision.

What crosses should be the minimum, and should belong to the contract — not to
either side's implementation. Frequently that means a type owned by the boundary,
and a translation at each end. It looks like ceremony until the first time one
side changes on its own.

### Nominal versus effective

A boundary that depends on remembering will be crossed. See
[architecture vs. implementation](/01-fundamentals/architecture-vs-implementation.md):
the list of mechanisms, from documented convention to process separation, is a
scale of strength, and code review sits in the middle of it — not at the top.

## Mental Model

**A boundary is a promise about what will not change.** If it cannot be verified,
it is not a promise — it is an intention.

## When to Use

- When two parts change for independent reasons and at different rates.
- When different people or teams work on the two sides.
- When one part needs to be replaced, tested or deployed in isolation.
- When one part has a distinct quality requirement — it needs to scale or fail
  separately.
- When failure propagation has to be contained.

## When Not to Use

**When both sides always change together.** The boundary becomes a tax on every
change, with no benefit at all.

**When the domain is not yet understood.** A wrong boundary is more expensive than
a missing one, and a new domain does not reveal its axes of change in a few months.
Start with weak separations and harden what proves stable.

**At a higher level than necessary.** Splitting into services what could be modules
trades a function call for the network, serialization, partial failure and one more
deployment pipeline — to obtain, in most cases, the same logical isolation.

**When the translation cost exceeds the benefit.** If maintaining the boundary
requires converting types at every crossing and crossings are frequent, either the
boundary is on the wrong axis or it should not exist.

**For aesthetic symmetry.** Boundaries created so that "each layer has its own" add
cost without capturing any real separation.

## Alternatives

- **Convention without enforcement** — cheaper, adequate in small and stable teams;
  it degrades with turnover.
- **An internal boundary with no physical separation** — modules in the same
  process, with an explicit contract. Solves most cases at the lowest cost.
- **Accepted and concentrated coupling** — instead of separating, gather the
  dependency at a single point, so that a future change has just one place to
  happen.

## Trade-offs

The axis is **isolation versus cost of crossing**.

| More boundaries | Fewer boundaries |
|---|---|
| Change contained on one side | Change spreads |
| Parts replaceable and testable | Replacement touches everything |
| Teams work in parallel | Conflict and coordination |
| Failure contained | Failure propagates |
| Contracts to maintain and version | No contract |
| Type translation at every crossing | Direct flow |
| Flow hard to follow end to end | Readable end to end |

## Failure Modes

**Leaky boundary.** One side's internal type crosses. Both come to depend on the
same structural decision.

**Boundary on the wrong axis.** Every business change crosses it. The symptom is
the pull request that always touches both sides.

**Nominal boundary.** It exists in the diagram and nothing enforces it.

**Boundary at too high a level.** Two services always deployed together, where one
being unavailable makes the other useless. They are one service at the cost of two.

**A boundary nobody can explain.** Inherited, crossed by accumulated exceptions,
kept out of fear.

## Common Mistakes

**Drawing boundaries by technical layer.** Controllers on one side, repositories on
the other. It cuts perpendicular to the axis of change.

**Trusting a directory as a boundary.** With no mechanism, it is visual
organization.

**Choosing the level by what sounds modern.** A separate service is an operations
decision, not a code-organization one.

**Letting the ORM's or the framework's type through.** The most common leak.

**Not measuring crossings.** The commit history says whether the boundary is in the
right place, and almost nobody consults it.

## Real-World Example

A booking system was split into `Booking`, `Payment` and `Notification`, each a
service, with REST APIs between them.

After a year, measurement showed: 87% of changes to `Booking` required a
corresponding change to `Payment`, in the same cycle. The two were deployed
together. `Payment` being unavailable made `Booking` useless.

The boundary between them was on the wrong axis **and** at too high a level. Cost
paid: two pipelines, service-to-service authentication, partial failure handling,
type translation at every call — to separate two things that were one.

`Notification` was different: 4% joint changes, and its unavailability degraded the
system without taking it down.

The fix was to merge `Booking` and `Payment` into one service, keeping the boundary
between them as modules with an architecture test. `Notification` stayed separate
and, a year later, became asynchronous — which was only possible because the
boundary there was real.

Two boundaries proposed together, with the same justification. One of them was
right.

## Related Concepts

- [Modularity](/01-fundamentals/modularity.md) — the resulting structure.
- [Dependency Direction](/02-software-design/dependency-direction.md) — the side
  the boundary allows knowing.
- [Layering](/02-software-design/layering.md) — a specific arrangement of
  boundaries.
- [Architecture vs. Implementation](/01-fundamentals/architecture-vs-implementation.md)
  — how to enforce.

## Practical Exercise

Pick two boundaries in your system. For each, measure across the last six months of
history: what fraction of commits crosses it?

Then answer: which mechanism enforces each boundary? If the answer is "convention",
count how many violations exist today.

The combination of high crossing with weak enforcement is the worst quadrant, and
it is where most systems are.

## Interview Questions

- How do you decide where to draw a boundary?
- How do you choose the level — module, package, service?
- What makes a boundary effective rather than nominal?

## Further Exploration

- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — the part on
  boundaries and their costs.
- Parnas, David. *On the Criteria To Be Used in Decomposing Systems into Modules*.
  CACM, 1972.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — bounded context as a
  model boundary.
