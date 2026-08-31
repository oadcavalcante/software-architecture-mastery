---
id: architecture-views
title: Architecture Views
sidebar_position: 9
description: A system doesn't fit in one drawing — each view answers one audience's concerns.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses views from the concerns of whoever reads them, instead of
  producing a fixed set by convention.
prerequisites: [c4-model]
related: [c4-model, architecture-descriptions, documentation-principles]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Architecture Views

## Overview

A system has too many properties to fit in a single representation. Structure, execution,
deployment, data, security, evolution — each is a different dimension, and no projection
shows all of them.

The answer is to organize documentation into **views**: each view is a representation of
the system built to answer the concerns of a specific audience.

And the important decision is not which set of views to use. It is **whose concerns need
answering** — which makes the set vary by system.

## Problem

The reflex is to look for the right diagram. It does not exist:

```text
whoever operates wants to know   where it runs, what goes down together, how it scales
whoever develops wants to know   where to touch, what breaks
whoever audits wants to know     where the data is, who accesses it
whoever funds wants to know      what it costs, what is blocked
whoever integrates wants to know which contracts exist
```

A single diagram trying to answer all of them becomes illegible to all of them. It is the
same failure as mixing levels of abstraction described in the
[C4 model](/17-architecture-documentation/c4-model.md), now across dimensions rather than across levels.

The opposite mistake is also common: adopting a canonical set of views and producing all
of them, regardless of whether anyone is interested in each. That generates documents
nobody reads — see [documentation principles](/17-architecture-documentation/documentation-principles.md).

## Core Concepts

### Viewpoint and view

The distinction is worth the effort:

```text
viewpoint   the conventions for building one type of representation —
            what it shows, for whom, with what notation
view        the application of a viewpoint to a concrete system
```

The viewpoint is reusable across systems; the view is specific. An organization defines
few viewpoints and produces many views.

See [architecture descriptions](/17-architecture-documentation/architecture-descriptions.md), where this terminology is
normative.

### Stakeholders and concerns

The starting point is always the same question: **who needs to know what, in order to
decide what.**

```text
stakeholder   whoever has something at stake in the system
concern       the question they need to answer
view          the representation that answers it
```

A view with no identified stakeholder should not be produced. That is the criterion that
keeps the set small.

And it is worth stating explicitly: a stakeholder is not only whoever writes code.
Operations, security, compliance, product, finance and external partners usually have
legitimate architectural concerns and no representation that addresses them.

### The 4+1 set

The best-known set, proposed by Kruchten in 1995, organizes four views around scenarios:

```text
logical         functionality, for developers and for the user
process         concurrency, performance, for whoever integrates
development     code organization, for whoever builds
physical        mapping onto hardware, for whoever operates
+1: scenarios   use cases that tie the four together
```

The lasting value is not the list. It is the "+1": the **scenarios validate the views** —
if a concrete scenario cannot be traced through the views, they are incomplete or
inconsistent.

That is the reusable idea, and the most ignored.

### Sets are a starting point, not an obligation

```text
4+1                          classic, development-oriented
C4                           levels of structural abstraction
arc42                        twelve sections, covers more than diagrams
Viewpoints and Perspectives  a broad catalog, with cross-cutting qualities
```

None is mandatory. A small system may need two views; a regulated system, seven.

The practice that works: start from the real recorded concerns, and choose the smallest set
that covers them.

### Cross-cutting perspectives

Some concerns are not a view — they cut across all of them:

```text
security          affects structure, deployment, data, operations
performance       same
availability      same
cost              same
evolvability      same
```

Treating them as separate views duplicates information. Treating them as **perspectives** —
lenses applied over the existing views — avoids the duplication and produces a useful
question: "what does each view say about security?"

See [quality attributes](/01-fundamentals/quality-attributes.md).

### Consistency across views

The real cost of multiple views: they have to agree.

```text
does a container in the structural view exist in the deployment view?
does a flow in the process view use containers that exist?
does the data view mention stores that appear in the physical view?
```

The more views, the greater the cost of maintaining consistency — and that is why the
number should be the minimum necessary. Views generated from a common source solve part of
the problem. See [living documentation](/17-architecture-documentation/living-documentation.md).

## Mental Model

**One view per concern with an owner.** The set is justified by its readers, not by the
method.

## When to Use

- In systems with distinct technical and non-technical audiences.
- In regulated environments, where there are formal concerns to address.
- In large systems, where one representation doesn't fit.
- When inheriting a system and needing to organize what to document.

## When Not to Use

**Producing a complete set by convention**, with no identified stakeholders.

**In small systems** — two or three representations suffice.

**Without checking consistency** across the views.

**With cross-cutting concerns turned into views**, duplicating content.

**As a compliance exercise** — the worst use, and the most frequent in large
organizations.

## Alternatives

- **[C4 model](/17-architecture-documentation/c4-model.md)** — when the concern is only structural.
- **arc42** — when you want a ready-made structure that goes beyond diagrams.
- **A single short document** — for small systems, one page with four sections.
- **Documentation by question** — organize by frequent question instead of by view.

The last is underrated and works well: an index of questions ("how does this scale?",
"where is the customer data?") with short answers covers most of the real need with less
structure.

## Trade-offs

| Many views | Few |
|---|---|
| Every audience served | Less maintenance |
| Consistency cost | Gaps |
| Formal | Practical |

| Standard set | Set derived from the concerns |
|---|---|
| Fast to adopt | Fitted to the system |
| Produces what nobody reads | Requires surveying stakeholders |
| Comparable across systems | Varies |

## Failure Modes

**Views with no reader.** Cost with no return.

**Views inconsistent with each other.** Worse than a single one.

**Cross-cutting concerns duplicated** in every view.

**A set adopted for compliance.**

**Absent scenarios.** Without them, nothing validates the set.

## Common Mistakes

**Choosing the set before surveying the concerns.** Adopting 4+1 or C4 by reputation produces views nobody asked for and leaves out the one somebody needed.

**Not naming each view's stakeholder.** A view with no identified reader is work nobody will open, and the effort shows up as abandoned documentation.

**Treating security as a view.** Security cuts across every view. Confining it to one diagram removes it from the others, which is where the decisions happen.

**Not checking consistency.** Views that contradict each other destroy confidence in the whole set — the reader no longer knows which one to believe.

**Producing every view with the same effort**, without prioritizing. The effort dilutes and the view that would decide something ends up at the same level as the one nobody consults.

## Real-World Example

An insurer adopted a formal set of views for every system classified as relevant — 34
systems, seven views each, 238 documents.

The process took fourteen months. Two years later, a usage measurement:

```text
structural view      consulted regularly in 31 of the 34
deployment view      in 28
data view            in 12, almost all in audits
process view         in 4
development view     in 2
integration view     in 19
evolution view       in 0
```

Three of the seven views answered concerns nobody had. And the maintenance cost was the
same for all of them.

Worse: a consistency audit found divergence between the structural and the deployment view
in 22 of the 34 systems. The views disagreed with each other — and whoever consulted them
didn't know which was right.

The revision:

**The set reduced to three mandatory views** — structural, deployment and integration —
chosen by measured use, not by method.

**The data view on demand**, mandatory only for systems handling personal or financial
data. See
[data flow](/17-architecture-documentation/data-flow-diagrams.md).

**The process and development views** eliminated as mandatory, produced when someone asks.

**Security became a perspective**, not a view: a list of questions applied to the three
mandatory views during review.

**Consistency verified automatically** where possible — the deployment view came to be
derived from the infrastructure code, and a checker compares the containers declared in
the structural view against those deployed. See
[living documentation](/17-architecture-documentation/living-documentation.md).

**Scenarios reintroduced.** Each system keeps two or three scenarios traced through the
views, reviewed annually. That is what started catching gaps.

The result: from 238 documents to 119, with the consultation rate rising and the
divergence between views dropping to 3 systems.

What the team records: the question missing at the start was the simplest one — "who will
read this, and to decide what?". It would have eliminated three views before fourteen
months of work.

## Related Concepts

- [C4 Model](/17-architecture-documentation/c4-model.md) — one set of structural views.
- [Architecture Descriptions](/17-architecture-documentation/architecture-descriptions.md) — the formalization.
- [Documentation Principles](/17-architecture-documentation/documentation-principles.md) — the reader first.
- [Quality Attributes](/01-fundamentals/quality-attributes.md) — the perspectives.

## Practical Exercise

List the stakeholders in your system and, for each one, the question they need to answer.

Then compare that with the existing documentation. There are probably documents with no
stakeholder and stakeholders with no document — and both are problems.

## Interview Questions

- What is the difference between a viewpoint and a view?
- Why is security usually a perspective and not a view?
- What does the "+1" in the 4+1 model add to the four views?

## Further Reading

- Kruchten, Philippe. *Architectural Blueprints — The 4+1 View Model*. IEEE Software, 1995.
- Rozanski, Nick; Woods, Eoin. *Software Systems Architecture*. 2nd ed. Addison-Wesley, 2011.
- Clements, Paul et al. *Documenting Software Architectures*. 2nd ed. Addison-Wesley, 2010.
