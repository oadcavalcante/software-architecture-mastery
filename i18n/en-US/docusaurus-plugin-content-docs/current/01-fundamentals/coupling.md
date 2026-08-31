---
id: coupling
title: Coupling
sidebar_position: 13
description: The degree to which changing one part forces a change in another — and why zero is not the goal.
doc_type: concept
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader identifies the kinds of coupling in a system and argues
  when more coupling is the right choice.
prerequisites: [modularity]
related: [cohesion, dependency-management, separation-of-concerns]
canonical_for: [coupling]
translated_from_version: 1
last_reviewed: 2026-08-29
---

# Coupling

## Overview

Coupling is the degree to which a change in one part of the system forces a
change in another.

The claim that organizes this document, and that runs against what is normally
taught: **coupling is not a defect to eliminate. It is a quantity to allocate.**
Parts that change together should be coupled. The problem is not coupling — it is
coupling in the wrong place.

## Problem

"Low coupling" gets repeated as a universal virtue, and the repetition hides the
real question.

A system with zero coupling between two parts that always change together does
not have a good property — it has duplication, and duplicated knowledge is a
worse form of coupling, because it is invisible. When the rule changes, both
places have to change, and nothing warns you if one was forgotten.

Conversely, a system that reduced coupling by introducing layers of indirection
between parts that never change independently paid complexity for a flexibility
that will never be exercised.

The useful question is not "how do I reduce coupling?". It is **"do these two
things change together?"** — and allocating coupling according to the answer.

## Core Concepts

### Kinds of coupling, from strongest to weakest

The classic scale, still useful as a diagnostic:

| Kind | What it means | Example |
|---|---|---|
| Content | One part alters the internals of another | Modifying private state directly |
| Common | They share mutable global state | Global variable, shared table |
| External | They depend on the same external format or protocol | Two modules parsing the same file |
| Control | One dictates the other's flow | Passing a flag that selects behaviour |
| Stamp | They pass more data than needed | Receiving a whole object to use one field |
| Data | They exchange exactly what is needed | Passing the identifier and the amount |

Data coupling is the desirable floor. There is no way for two parts to cooperate
with less than that.

### Afferent and efferent

**Afferent coupling** (Ca): how many modules depend on this one. High Ca means
changing here is expensive — many people are affected.

**Efferent coupling** (Ce): how many modules this one depends on. High Ce means
this module is fragile — many things can break it.

The distinction matters because the consequences are opposite. A module with high
Ca should be stable and change rarely; one with high Ce should be peripheral and
disposable.

A module with **both high** is the worst case: it changes often because it depends
on many things, and every change affects many people. That is where most degraded
systems concentrate their problem.

### Temporal coupling

Two components coupled in time must be available simultaneously. A synchronous
call couples in time; a queued message does not.

This is the axis that dominates distributed architecture, and it is the subject of
[integration](/08-integration-architecture/index.md). Trading temporal coupling
for format coupling — the message has a contract — is the central decision of
event-driven systems.

### Coupling is transitive

If A depends on B and B depends on C, changes in C can reach A. Deep dependency
graphs create propagation paths nobody sees end to end.

That is why the useful metric is not the number of direct dependencies, but the
size of the transitive closure.

## Mental Model

**Coupling is the answer to: if I change this, what else do I have to change?**

The question is answerable empirically. A commit history shows which files change
together — which is the real coupling, regardless of what the structure suggests.

## When to Use

More coupling is the right choice when:

- **The parts change together by nature.** An aggregate and its consistency rule.
  Separating them produces duplication and inconsistency.
- **The alternative is duplicating business knowledge.** Duplicating a tax rule in
  three places is worse than coupling all three to a tax module.
- **The indirection buys no real flexibility.** An interface with a single
  implementation that will never have another is coupling in disguise, with extra
  cost.
- **The cost of coordination exceeds the cost of dependency.** Two modules with a
  formal contract between teams that talk daily may as well be one module.

## When Not to Use

Reducing coupling is wrong when:

**The flexibility bought will never be used.** Abstracting data access to allow
swapping databases, in a system that never will, is pure cost.

**The reduction produces duplicated knowledge.** If decoupling two modules
requires copying the same rule into both, the coupling merely became invisible.

**The abstraction leaks.** A layer that reduces nominal coupling but requires the
consumer to know the other side reduced nothing and added indirection.

**The system is small and stable.** In code that fits in your head and rarely
changes, the navigation cost of indirection exceeds the benefit.

## Alternatives

- **Deliberate duplication** — when two parts coincide today but should evolve
  separately. See [coupling vs. duplication](/20-trade-offs/index.md).
- **Coupling through an explicit contract** — keeping the dependency, making it
  versioned and negotiated rather than implicit.
- **Dependency inversion** — keeping the coupling and inverting its direction,
  which is frequently cheaper than eliminating it.

## Trade-offs

The real axis is **coupling versus duplication**. There is no reducing one
without increasing the other; the decision is which of the two costs less in this
case.

| More coupling | Less coupling |
|---|---|
| One source of truth | Each part evolves alone |
| Consistent change by construction | Change can diverge unnoticed |
| Less code | More code, possibly duplicated |
| Change propagates | Change stays contained |
| Direct, readable flow | Indirection to navigate |

The practical rule: **couple what changes together; duplicate what coincides
today and should diverge tomorrow.**

## Failure Modes

**Pivot module.** A module with high Ca and Ce that every change passes through.
It becomes a development bottleneck and a source of merge conflicts.

**Coupling through a shared database.** Two services reading the same table have
all the coupling of a monolith and no contract. A schema change breaks the other
service without warning.

**Failure cascade through temporal coupling.** A slow service brings down those
that call it synchronously, which bring down their own callers. See
[circuit breakers](/12-reliability/index.md).

**Hidden coupling by convention.** Two parts that agree on a format without an
explicit contract. Nothing breaks at compile time; it breaks in production.

## Common Mistakes

**Chasing zero coupling.** It produces duplication, indirection and premature
abstractions.

**Measuring coupling from structure rather than history.** The import graph shows
declared coupling; the commit history shows the real one. When they diverge, the
history is right.

**Confusing low coupling with many interfaces.** An interface with one
implementation does not decouple — it only adds a file.

**Ignoring temporal coupling.** It is the most expensive in distributed systems
and the least visible in diagrams.

**Treating coupling between teams as technical coupling.** Two teams that have to
coordinate releases are coupled regardless of what the code shows.

## Real-World Example

A system had `OrderService` and `BillingService` separated, communicating through
an interface, each with its own test suite. The structure looked decoupled.

The commit history told a different story: over eighteen months, 94% of changes
to one came with a change to the other, in the same commit.

The two modules were one, spread across two places. The coupling had not been
reduced — it had been hidden behind an interface, at the cost of indirection and
of two test suites that always changed together.

The decision was to merge them, and the interface between them became an internal
function.

The counter-example, in the same system: `OrderService` and `NotificationService`
changed together in 6% of commits. There the separation was real and worth the
cost — and it later allowed notification to become asynchronous without touching
orders.

The same instrument — the history — answered both questions.

## Related Concepts

- [Cohesion](cohesion.md) — the other face of the same decision.
- [Modularity](modularity.md) — where to draw the boundaries.
- [Dependency Management](dependency-management.md) — the direction of coupling.

## Practical Exercise

Extract from your repository the pairs of files that appear together most often
in the commits of the past six months.

Compare with the directory structure. Highly coupled pairs in different modules
are candidates for merging; files in the same module that never change together
are candidates for splitting.

## Interview Questions

- Is zero coupling desirable? Why?
- What is the difference between afferent and efferent coupling, and why does it
  matter?
- How do you measure the real coupling of a system?

## Further Exploration

- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — component
  coupling metrics.
- Tornhill, Adam. *Your Code as a Crime Scene*. Pragmatic Bookshelf, 2015 —
  coupling measured from version history.
