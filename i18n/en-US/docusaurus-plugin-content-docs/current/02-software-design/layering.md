---
id: layering
title: Layering
sidebar_position: 11
description: The most used and most misapplied arrangement of boundaries — and what it costs when the axis is wrong.
doc_type: concept
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader assesses whether a division into layers matches the
  system's axis of change and recognizes layers that only pass calls along.
prerequisites: [boundaries]
related: [modular-design, package-design, clean-architecture]
canonical_for: [layering, layered architecture]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Layering

## Overview

Layers are an arrangement of boundaries in which each level knows only the one
below. It is the most widespread structural pattern and the one most frequently
applied without anyone asking whether it serves that particular system.

## Problem

The canonical division — presentation, application, domain, infrastructure —
organizes code by **technical type**. That is orthogonal to the axis along which
systems actually change, which is business capability.

The symptom is measurable: in a layered architecture applied to a system that
changes by capability, almost every commit touches every layer. Adding a field to
a registration goes through the controller, the service, the repository and the
entity.

The layer contained nothing. It merely distributed the same change across four
directories, and added translation between them.

That does not make layers wrong. It makes them **wrong as the primary division**
in most business systems.

## Core Concepts

### The layer rule

Each layer depends only on the one immediately below. Upward calls are forbidden;
calls that skip levels are the *relaxed* variant, which is common and weakens the
structure.

The rule exists to ensure that a change in one layer does not reach the ones
above. It does that — for changes that genuinely belong to a single layer.

### Layer as secondary division

The arrangement that works in most business systems inverts the hierarchy:
**module by capability first, layers inside each module**.

```text
❌ layer primary                ✅ capability primary
   controllers/                   billing/
     OrderController                api/  application/  domain/  infra/
     CustomerController           catalogue/
   services/                        api/  application/  domain/  infra/
     OrderService                 delivery/
     CustomerService                api/  application/  domain/  infra/
   repositories/
     ...
```

On the right, a change in billing stays in billing. The layers still exist and
still enforce dependency direction — but inside a boundary that matches the axis of
change.

### Where layers work well as the primary division

- **Systems with little domain logic and much technical variation.** A gateway, a
  protocol adapter, an ETL.
- **Small systems**, where any division serves and the most conventional one
  reduces onboarding friction.
- **When the real variation is by layer.** An application with three user
  interfaces — web, mobile, terminal — over the same domain has genuine variation
  in the presentation layer.

### The anemic layer

A layer that merely passes calls along to the next one separates nothing. It adds
a file, a type translation and a hop in navigation, without hiding any decision.

The test: if removing the layer forces nobody to learn anything new, it was not
hiding anything.

## Mental Model

**A layer is a horizontal boundary. A module is a vertical one.** The question is
which of the two matches the axis along which your system changes — and the
answer, in business systems, is almost always the vertical one.

## When to Use

- As the division **inside** a capability module — almost always useful.
- As the primary division when the real variation is technical, not of domain.
- In small systems, for conventionality.
- When dependency direction between policy and detail has to be enforced.

## When Not to Use

**As the primary division in a mid-sized or larger business system.** It is the
dominant mistake, and the cost shows up as "every change touches everything".

**When the layers merely pass calls along.** If the application layer calls the
service that calls the repository without adding anything, there is one layer
fewer than it appears.

**When the number of layers grows out of symmetry.** Five, six layers because "one
was missing for DTOs". Each one charges translation.

**When the rule is relaxed until it disappears.** If skipping layers is allowed and
common, the structure is decorative and the cost remains.

## Alternatives

- **Module by capability, layers inside** — the arrangement that works in most
  cases.
- **[Ports and Adapters](/02-software-design/ports-and-adapters.md)** — swaps the
  stack metaphor for inside and outside, with a single direction rule.
- **Vertical slice** — organize by use case, with everything it needs together.
- **No layers** — in small systems, a flat package is honest.

## Trade-offs

| Layers as primary division | Module as primary division |
|---|---|
| Conventional, easy onboarding | Requires an initial explanation |
| Clear dependency direction | Direction inside each module |
| A business change touches everything | The change stays contained |
| Technical variation isolated | Technical variation repeats per module |
| One place for each kind of file | The same kind in several places |

## Failure Modes

**Every change crosses every layer.** The main symptom.

**Anemic layer.** Passes along and hides nothing.

**Vertical leak.** The persistence entity reaches the controller. The layers exist
and do not separate.

**Relaxed rule.** Skipping layers becomes the norm; the direction stops holding.

**Dominant translation layer.** More code converting types between layers than
implementing business rules.

## Common Mistakes

**Adopting layers by default, without asking about the axis.** The root of it.

**Confusing layers with
[Clean Architecture](/02-software-design/clean-architecture.md).** The second has a
specific direction rule that the first does not.

**Creating a layer for each kind of object.** DTOs, mappers and validators in
their own layers produce constant crossing.

**Thinking layers guarantee low coupling.** A layered system can have severe
coupling inside each one.

## Real-World Example

A school management system with four layers and 60 thousand lines. Six months of
commits measured: 91% touched three or more layers.

The reorganization kept the four layers but placed them inside six capability
modules: enrolment, grades, attendance, finance, communication, reporting.

After: 74% of commits touched a single module.

What did not change: the direction rule still held, and was still verified by an
architecture test. Each module's domain still does not depend on infrastructure.

What did change: the boundary that contains the change became the vertical one.
The layers remain useful — inside each module, to separate policy from detail.

The original mistake was not using layers. It was using them as the top-level
division.

## How many layers

The number tends to grow by accumulation, and each additional layer charges
translation at every crossing.

One criterion to justify each one: **does it hide a decision that its neighbours do
not need to know?** If removing the layer forces nobody to learn anything new, it
was not hiding anything.

In practice, three layers cover most cases inside a module:

| Layer | Hides |
|---|---|
| Inbound | The protocol — HTTP, queue, terminal |
| Application and domain | Nothing external; it is the policy |
| Outbound | The persistence and integration technology |

The fourth layer appears when application and domain genuinely diverge — when
there are rules involving several entities and belonging to none. See
[Onion](/02-software-design/onion-architecture.md).

The fifth onwards is usually type translation elevated to a layer, and that is
where suspicion is warranted.

## Related Concepts

- [Boundaries](/02-software-design/boundaries.md) — the general concept layers are
  one arrangement of.
- [Modular Design](/02-software-design/modular-design.md) — the vertical division.
- [Clean Architecture](/02-software-design/clean-architecture.md) — layers with an
  explicit direction rule.
- [Ports and Adapters](/02-software-design/ports-and-adapters.md) — the
  inside-and-outside alternative.

## Practical Exercise

Measure: over the last six months, what fraction of your system's commits touched
more than one top-level layer?

If it is high, list the directories that most frequently appear together. They are
the capability module that should be the primary division.

## Interview Questions

- When are layers the correct primary division?
- What is an anemic layer and how do you recognize one?
- What is the difference between layered architecture and Clean Architecture?

## Further Exploration

- Fowler, Martin. *Patterns of Enterprise Application Architecture*.
  Addison-Wesley, 2002 — the classic formulation of layers.
- Richards, Mark. *Software Architecture Patterns*. O'Reilly, 2015.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — the dependency
  rule.
