---
id: system-decomposition
title: System Decomposition
sidebar_position: 1
description: How to go from a prompt to a set of parts — the first move in system design.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader decomposes a system from capabilities and quality
  requirements, and recognizes the decompositions that create more problems than they solve.
prerequisites: [system-design]
related: [components, service-boundaries, modular-design]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# System Decomposition

## Overview

Decomposing is dividing the system into parts that can be understood, built,
deployed and operated separately.

It is the first move in system design, and the one that most conditions everything
that follows — because the boundaries chosen here determine where change stays
contained and where it spreads.

## Problem

Faced with "design the system", the temptation is to start by drawing components.
That produces decompositions that reflect the familiarity of whoever is drawing, not
the problem.

Three patterns of bad decomposition appear regularly.

**By technical layer.** API, service, data. It reproduces at the system level the
problem [layering](/02-software-design/layering.md) already has at the code level:
every business change crosses everything.

**By entity.** One component per domain noun. The business capability ends up spread
across several.

**By org chart with no analysis.** The team structure copied into the system,
without checking whether it corresponds to the business. Sometimes it does;
frequently it is the organization that is wrong.

## Core Concepts

### The criterion is capability, with quality requirements as a second axis

The primary division comes from **business capabilities** — what the system does for
whoever uses it. Charge, catalog, deliver, support.

The second axis is the **quality requirement**: parts with very different needs for
scale, availability or latency are candidates for separation, even within one
capability.

A report processor that consumes a lot of memory and a request handler that has to
respond in 200 ms do not coexist well in the same process, even if they belong to
the same capability.

### Logical decomposition before physical

Two decisions, frequently confused:

**Logical** — what the conceptual parts are and what each one does. Cheap to change.

**Physical** — how many processes, how many artifacts, what runs where. Expensive to
change.

The order matters. Deciding the physical decomposition before the logical one has
proven itself produces high-cost boundaries in the wrong place. See
[boundaries](/02-software-design/boundaries.md) and
[component design](/02-software-design/component-design.md).

The safe path: decompose logically, enforce the boundaries within one process, and
promote to a separate component whatever has a reason.

### The decomposition has to pass the change test

A decomposition is good when the typical changes fit in one part.

That is verifiable before building: list the five most likely changes over the next
six months and check how many parts each one touches. If most touch three or more,
the decomposition is wrong.

In an existing system, history answers better than prediction.

### Not everything needs to be decomposed

A small system with one team gains nothing from being divided. Decomposition has a
cost — contracts, translation, navigation — and it only pays off above a certain
scale of code and of people.

## Mental Model

**Start with capabilities, check against quality requirements, and only then decide
what becomes a separate process.**

## When to Use

- The system has grown beyond what one person holds in their head.
- More than one team works on it.
- Parts have distinct quality requirements.
- Parts evolve at different rates.

## When Not to Use

**In small systems.** Below a few thousand lines and with one team, decomposition
costs more navigation than it saves in contention.

**Before understanding the domain.** A wrong boundary is worse than an absent one.
See [bounded context](/04-domain-driven-design/bounded-context.md).

**Copying the org chart without checking.** [Conway's
law](/23-architecture-leadership/conways-law.md) describes what happens, not what should
happen.

**Decomposing physically by default.** Modules first.

## Alternatives

- **Monolith with internal modules** — the answer in most cases. See
  [modular monolith](/03-design-patterns/modular-monolith.md).
- **A single system with no division** — legitimate in small systems.
- **Partial decomposition** — separate only what has a distinct requirement, keeping
  the rest together.

## Trade-offs

| More parts | Fewer parts |
|---|---|
| Change contained | Spreads |
| Scale and failure isolable | Shared |
| Teams in parallel | Coordination |
| Contracts to maintain | None |
| The flow crosses boundaries | Direct |
| More complex operations | Simple |

## Failure Modes

**Decomposition by technical layer.** Every change crosses everything.

**Parts that always change together.** The boundary is on the wrong axis.

**One central part everything depends on.** It becomes a development bottleneck.

**Premature physical decomposition.** An expensive boundary in the wrong place.

**A contract that exposes the interior.** The parts stay coupled with extra ceremony.

## Common Mistakes

**Starting by drawing components.** Start with capabilities.

**Decomposing by entity.**

**Confusing logical decomposition with physical.**

**Not checking against the likely changes.**

**Decomposing too much.** More parts than the team can operate.

## Real-World Example

An event management system was decomposed into `API`, `Processing`, `Notifications`
and `Reports` — a division by technical nature.

Tested against the five most frequent changes of the last year: adding a ticket
type, changing the refund rule, adding a field to the attendee record, altering the
capacity policy and adding a notification channel.

Four of the five touched three or more parts.

Re-decomposing by capability produced `Tickets`, `Attendees`, `Access` — entry
control at the event — and `Finance`.

A new measurement of the same five changes: four touched a single part.

The fifth — adding a notification channel — kept crossing, because notification is
cross-cutting. It became a module consumed by the four, with an explicit contract,
instead of a top-level part.

None of those parts became a separate process. The decomposition was logical,
enforced by architecture tests, and the system remained one artifact.

Two years later, `Access` was extracted — because entry validation at large events
has load peaks of orders of magnitude and needs to scale on its own. One reason,
recorded, and only that one.

## How to validate a decomposition before building

Three checks that cost hours and save months.

**The change test.** List the five most likely changes and count how many parts each
one touches. If most touch three or more, the decomposition is on the wrong axis. In
an existing system, history answers better than prediction.

**The ownership test.** For each part, list the data it owns. If two parts write to
the same place, they are one part split in two — and the boundary is fiction.

**The explanation test.** Ask someone who did not take part in the design to explain
what each part does, in one sentence, without using "and". Names that require a
conjunction reveal grouping with no concept behind it.

The first is the most valuable and the least done, because it requires admitting that
you do not know how the system will change. The honest answer is that nobody knows —
but the history of similar systems, or of the product itself, informs far better than
the intuition of whoever is drawing at that moment.

A decomposition that passes all three is not guaranteed to be right. One that fails
any of them is demonstrably wrong, and that alone pays for the exercise.

## Related Concepts

- [Components](/05-system-design/components.md) — the resulting parts.
- [Service Boundaries](/05-system-design/service-boundaries.md) — where to separate
  processes.
- [Modular Design](/02-software-design/modular-design.md) — the execution in code.
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — the domain
  criterion.

## Practical Exercise

List the five most likely changes to your system over the next six months.

For each one, count how many top-level parts it would touch.

If most touch three or more, list the parts that appear together most often — they
are the decomposition that should exist.

## Interview Questions

- What is the primary criterion for decomposition, and why?
- Why is deciding the physical decomposition before the logical one risky?
- How do you check whether a decomposition is correct before building?

## Further Reading

- Parnas, David. *On the Criteria To Be Used in Decomposing Systems into Modules*.
  CACM, 1972.
- Newman, Sam. *Building Microservices*. 2nd ed., O'Reilly, 2021.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
