---
id: cohesion
title: Cohesion
sidebar_position: 14
description: The degree to which what sits together belongs together — the other face of the boundary decision.
doc_type: concept
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader assesses a module's cohesion by its axis of change and
  recognizes when increasing cohesion costs more than it returns.
prerequisites: [coupling]
related: [modularity, separation-of-concerns]
canonical_for: [cohesion]
translated_from_version: 1
last_reviewed: 2026-08-29
---

# Cohesion

## Overview

Cohesion is the degree to which the elements of a module belong together.

Cohesion and [coupling](coupling.md) are not independent properties: they are the
same decision seen from two sides. In deciding what goes inside a boundary, you
simultaneously determine the cohesion of what stayed inside and the coupling with
what stayed outside.

## Problem

A module with low cohesion groups things that have no relation. The symptom is
characteristic: the module changes frequently, but each change touches a
different part of it, and the parts do not talk to each other.

The cost shows up in three ways. Whoever needs to understand one part carries the
rest along. Whoever changes one part risks the others for no reason. And the
module becomes everybody's dependency — because everyone needs something in
there, even if different things.

Modules called `utils`, `helpers`, `common` or `shared` are the canonical
manifestation: grouped by what they are not, rather than by what they are.

## Core Concepts

### The cohesion scale

From worst to best, in the classic taxonomy:

| Kind | Grouping criterion | Assessment |
|---|---|---|
| Coincidental | None | `utils` |
| Logical | Same generic category | All validators together |
| Temporal | They run at the same moment | `initialize()` |
| Procedural | They are part of the same sequence | Steps of a flow |
| Communicational | They operate on the same data | Everything that reads the order |
| Sequential | The output of one is the input of the next | Transformation pipeline |
| Functional | They contribute to a single well-defined task | Tax calculation |

Functional cohesion is the target. Coincidental cohesion is the sign that nobody
decided.

### The practical criterion

The taxonomy is useful for diagnosis, but the operational criterion is the same
as in [modularity](modularity.md) and
[separation of concerns](separation-of-concerns.md):

> **Things that change for the same reason belong together.**

A module is cohesive when a short sentence describes what it does, without using
"and". If the description needs conjunctions, there is probably more than one
subject in there.

### High cohesion reduces coupling — sometimes

When a module is cohesive, whoever uses it depends on one thing, not several.
That tends to reduce efferent coupling on the outside.

But the relationship is not automatic. You can have an internally cohesive module
that depends on ten others — high cohesion and high efferent coupling at once.
The two properties relate to each other; they do not determine each other.

### Cohesion is contextual

The same grouping can be cohesive or not depending on the system. In a small
system, "customer operations" is a well-defined task. In a large one, "customer"
fragments into registration, credit, preferences and purchase history — which
change for distinct reasons and do not belong together.

That means cohesion degrades with growth without anyone doing anything wrong. A
module that was cohesive two years ago may no longer be.

## Mental Model

**Describe the module in one sentence. If you need "and", it is not cohesive.**

The test is crude and works well in practice, because the difficulty of naming
reflects the absence of a single concept behind the grouping.

## When to Use

Increasing cohesion is worth it when:

- The module has parts that change for independent reasons.
- Different consumers use disjoint parts of it.
- Naming it requires a conjunction or a generic name.
- It appears in nearly every commit, but for different reasons each time.
- Testing it requires setting up context from unrelated subjects.

## When Not to Use

**When the resulting split produces modules that always change together.**
Increasing cohesion by fragmenting one module into three that never change
separately trades one problem for a worse one — now there are three places to
keep in sync.

**When the missing cohesion is apparent rather than real.** A module that seems
to group distinct subjects but whose parts share a business invariant is
cohesive, even if the name does not capture that well. The fix is the name, not
the split.

**When the cost of reorganizing exceeds the remaining benefit.** A low-cohesion
module in stable code that nobody has touched in a year is debt with no interest.
Fixing it has real cost and hypothetical benefit.

**In disposable code.** The same reasoning as in
[separation of concerns](separation-of-concerns.md).

## Alternatives

- **Rename instead of split** — when the cohesion exists and the name does not
  reveal it.
- **Move elements instead of splitting the module** — frequently one or two
  elements are in the wrong place and the rest is fine.
- **Accept and isolate** — putting the low-cohesion module behind a cohesive
  facade, when reorganizing it is too expensive.

## Trade-offs

The axis is **the cost of understanding and changing one part versus the number
of boundaries to navigate**.

| More cohesion | Less cohesion |
|---|---|
| Module understandable on its own | You carry irrelevant context |
| A change does not risk unrelated parts | Every change touches unrelated neighbours |
| Consumers depend only on what they use | Everyone depends on the whole module |
| More modules, more boundaries | Fewer places to look |
| Risk of fragmenting what changes together | No fragmentation risk |

## Failure Modes

**Dumping-ground module.** `utils`, `common`, `shared`. Coincidental cohesion
taken to the limit. It becomes a universal dependency, and changes to it affect
everything.

**Temporal cohesion turning into coupling.** A `setup()` that initializes ten
unrelated things creates an ordering dependency between them that nobody
documented.

**The module that grew.** It started cohesive and accumulated neighbouring
responsibilities, one at a time, each addition defensible. The symptom is the name
having stopped describing the contents.

**Fragmentation from chasing cohesion.** Five tiny modules that always change
together. The cohesion of each is high and the system got worse.

## Common Mistakes

**Creating `utils` as the default.** It is the path of least resistance when you
do not know where something belongs. Not knowing is information: it usually means
the concept has not yet been identified.

**Confusing cohesion with size.** A large module can be highly cohesive; a small
one can be coincidental. Size is a consequence.

**Grouping by technical type.** All the validators, all the DTOs, all the
mappers. Logical cohesion — the second worst level on the scale — and very common
because it looks organized.

**Ignoring degradation.** Cohesion is not decided once. Modules degrade by
accumulation, and nobody notices because each individual addition was reasonable.

## Real-World Example

A `CustomerService` module of 900 lines, responsible for: registration, document
validation, credit limit calculation, communication preferences and purchase
history.

Five consumers. None used more than two of the five subjects.

Analysis by reason of change separated the groups clearly: registration and
document validation change together, for regulatory reasons. Credit limit changes
by risk decision. Preferences change by product decision. History had not changed
in two years.

The module became three: `CustomerRegistration`, `CustomerCredit`,
`CustomerPreferences`. History was absorbed into the orders module, where the data
already lived.

The instructive detail: the initial temptation was to create five modules, one per
identified subject. Keeping registration and document validation together —
despite their seeming separable — was the right call, because both change for the
same external reason and separating them would have created a boundary that every
regulatory change would cross.

## Related Concepts

- [Coupling](coupling.md) — the other face.
- [Modularity](modularity.md) — the resulting structure.
- [Separation of Concerns](separation-of-concerns.md) — the principle that guides
  the split.

## Practical Exercise

Pick the three largest modules in your system. For each, try to write in one
sentence what it does, without using "and" and without using its own name.

Where you cannot, list the reasons for change and group the ones that have
historically occurred together. Those groups are the modules that should exist.

## Interview Questions

- How do you assess whether a module is cohesive?
- What is the relationship between cohesion and coupling?
- Why is `utils` a problem, and what do you do with what is inside it?

## Further Exploration

- Yourdon, Edward; Constantine, Larry. *Structured Design*. Prentice Hall, 1979 —
  the original cohesion taxonomy.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — component cohesion
  principles.
