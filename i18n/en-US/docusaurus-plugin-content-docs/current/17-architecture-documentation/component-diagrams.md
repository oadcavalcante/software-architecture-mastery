---
id: component-diagrams
title: Component Diagrams
sidebar_position: 5
description: The inside of one piece — the most expensive level to maintain and the least frequently needed.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader knows when to descend to the component level and why it is the
  exception, not the rule.
prerequisites: [container-diagrams]
related: [c4-model, container-diagrams, living-documentation]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Component Diagrams

## Overview

A component diagram shows the **inside of a container**: the logical groupings of code and
how they relate.

It is the third level of the [C4 model](/17-architecture-documentation/c4-model.md), and the first whose necessity has
to be justified. Context and container are almost always worth it. Component, rarely.

The reason is economic: it describes what changes fastest, and therefore goes out of date
fastest — and the information it carries is already in the code, available to anyone who
opens the project.

## Problem

A new person is given the task of changing the shipping cost calculation. They know, from
the container diagram, that it lives in the Orders API. They open the project and find 240
files.

The container diagram stopped too early for that question.

But the obvious answer — drawing all the components of all the containers — produces a
cost that rarely pays off:

```text
a system with 8 containers
each with 10 to 20 components
= 8 diagrams that change with every internal refactoring
```

After three months, they describe a structure that no longer exists, and the new person is
sent to a wrong map — which is worse than having no map.

## Core Concepts

### What a component is here

A grouping of code with a cohesive responsibility and an identifiable interface, inside a
container:

```text
yes   Orders Controller, Shipping Calculator, Customer Repository,
      Payment Client, Coupon Validator
no    a class, an arbitrary package, an entire layer
```

A component is not separately deployable — if it were, it would be a container. It is a
unit of internal organization.

And the practical criterion: **a component is something you would name in a conversation
about where to touch.**

### It costs more than it looks

This is the central point:

```text
context      changes when the system changes purpose       — years
container    changes when a piece is created or removed    — months
component    changes with every internal refactoring       — weeks
```

The component diagram has the **shortest half-life** of the three, and the same manual
maintenance cost. See
[documentation principles](/17-architecture-documentation/documentation-principles.md).

An out-of-date diagram at this level is actively harmful: it asserts a structure with
enough precision to be followed, and it is wrong.

### When it pays off

Few cases, and all specific:

```text
a large, complex container, with more than 15 components
a domain that needs to be explained, not merely navigated
recurring onboarding into the same container
before a structural refactoring, to discuss the target
to argue a boundary decision
```

The last is the most legitimate: a diagram drawn to support a decision is disposable by
nature — it lives in the
[ADR](/18-architecture-decisions/what-is-an-adr.md), dated, and doesn't have to be
maintained.

### The alternative is to generate it

When the diagram really is necessary and the container is active, generating it from the
code solves the half-life problem:

```text
a tool reads the code, extracts the structure, produces the diagram
the diagram is never wrong
the layout is automatic and sometimes bad
it only shows what exists, not what is intended
```

See [living documentation](/17-architecture-documentation/living-documentation.md). This is the level where generation
has the highest return, because it is the level that goes out of date the most.

And there is a condition: generating only works if the code has a recognizable structure.
A project with no clear organization produces an illegible generated diagram — which,
incidentally, is a diagnosis.

### The code is the primary documentation

At the component level, there is an alternative that almost always wins:

```text
a directory structure that reflects the domain
names that say what the thing does
a short README per container with the map in text
```

A well-named folder structure answers "where do I touch" with no diagram at all, and never
goes out of date, because it is the code itself.

See [modular design](/02-software-design/modular-design.md).

### One container at a time

As at the previous level, the scope is single: **one diagram describes one container**. The
others appear, if at all, as boxes at the edge.

### A diagram nobody can draw is a finding

There is one outcome of the exercise that holds regardless of the diagram produced: when a
container's internal structure **cannot be drawn** legibly, that is not a documentation
failure.

```text
components with no clear responsibility   names that say nothing
dependencies in every direction           no discernible layer
one component that appears in everything  probably a god class
```

In those cases the diagram becomes refactoring input, and it serves its purpose better
than it would if it came out pretty. See
[modular design](/02-software-design/modular-design.md).

## Mental Model

**The lowest-return and highest-cost level.** Draw it when there is a specific question,
generate it when you need permanence, and prefer well-organized code to both.

## When to Use

- A large container, with a non-obvious internal structure.
- Recurring onboarding into the same container.
- Before a structural refactoring, as a target to discuss.
- To support a boundary decision — disposable, inside the ADR.
- When it is generated automatically.

## When Not to Use

**For every container, for completeness.** This is the expensive mistake.

**Maintained by hand, in code that changes every week.**

**When the folder structure already answers it.**

**With classes as boxes** — that would be the fourth level, and it is rarely worth it.

**With nobody responsible for updating it.**

## Alternatives

- **A well-named directory structure** — an answer with no maintenance cost.
- **A README per container** — the map in text, easier to maintain.
- **A generated diagram** — always current.
- **Nothing** — for small containers, reading the code is faster.

The last is legitimate more often than people admit: a container of 15 files doesn't need
a diagram.

## Trade-offs

| Drawn | Generated |
|---|---|
| Expresses intent | Shows what exists |
| Goes out of date | Always current |
| Good layout | Automatic |
| Continuous cost | Up-front cost |

| Diagram | Folder structure |
|---|---|
| Shows relationships | Shows organization |
| Maintenance cost | None |
| Independent of the code | Is the code |

## Failure Modes

**Out of date and followed.** Worse than not existing.

**Produced for every container.** A cost that never pays off.

**Classes as boxes.** Wrong level.

**Generated from code with no structure.** Illegible.

**No owner.** It is born and rots.

## Common Mistakes

**Treating the third level as mandatory** because the model has four.

**Not considering the folder structure as an alternative.**

**Maintaining by hand what could be generated.**

**Not dating it** — with no date, the reader trusts it.

## Real-World Example

A platform team decided to document its systems completely, including the component level
for all 22 existing containers.

The effort took six weeks. The diagrams were published on the wiki.

Eleven months later, a documentation audit measured:

```text
context diagrams      6 — 6 still correct
container diagrams   22 — 19 correct, 3 out of date
component diagrams   22 — 4 correct, 18 out of date
```

And, more seriously, two incidents had been made worse by wrong component diagrams: in
both, someone located where to touch from the diagram, touched the indicated place, and
the behavior was in another component — moved in a refactoring months earlier.

The policy revision:

**Component level removed by default.** The 22 diagrams were archived.

**Four exceptions kept**, all in large containers with frequent onboarding — and all
converted to automatic generation from the code.

**A README per container** replaced the rest: a five- to ten-line map in text, kept in the
container's own repository, reviewed alongside structural changes.

**Decision diagrams** moved into the ADRs, dated and explicitly not maintained — with a
line in the header: "snapshot of the structure as of 2026-03; not updated".

The result, measured over the following year: structural documentation shrank from 50 to
32 artifacts, the share of correct items rose from 58% to 91%, and no incident was made
worse by wrong documentation.

An unforeseen effect: while writing the READMEs, three teams discovered they could not
describe their internal organization in ten lines — which became a reason to refactor.

The subsequent assessment points out: the lesson was not "components don't matter", but
that completeness has a cost and the cost is continuous. Documenting everything produced
less truth than documenting less.

## Related Concepts

- [C4 Model](/17-architecture-documentation/c4-model.md).
- [Container Diagrams](/17-architecture-documentation/container-diagrams.md) — the level above.
- [Living Documentation](/17-architecture-documentation/living-documentation.md) — the way out at this level.
- [Documentation Principles](/17-architecture-documentation/documentation-principles.md) — the half-life.

## Practical Exercise

Pick a container in your team and write a ten-line README describing its internal
organization.

If you can't, the problem is probably not documentation.

## Interview Questions

- Why does the component level have the worst return of the three?
- When is an out-of-date diagram worse than no diagram?
- What alternative usually beats the component diagram?

## Further Reading

- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017.
- Parnas, David. *On the Criteria To Be Used in Decomposing Systems*. CACM, 1972.
