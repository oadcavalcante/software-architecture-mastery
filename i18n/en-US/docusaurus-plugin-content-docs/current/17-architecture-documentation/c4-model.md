---
id: c4-model
title: C4 Model
sidebar_position: 2
description: Four levels of zoom for diagramming software, and why the first two suffice in most cases.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses the zoom level appropriate to the reader and avoids
  mixing abstractions in a single diagram.
prerequisites: [documentation-principles]
related: [context-diagrams, container-diagrams, component-diagrams]
canonical_for: []
translated_from_version: 3
last_reviewed: 2026-08-31
---

# C4 Model

## Overview

The C4 model organizes software diagrams into **four levels of zoom**, each with an
audience and a question:

```text
context     the system and the world around it — for anyone
container   the executable pieces and how they communicate — for technical readers
component   the inside of one piece — for whoever will work on it
code        classes and relations — rarely worth drawing
```

The model's contribution is the discipline of **one level of
abstraction per diagram**, not the notation. That is where most architecture diagrams fail.

## Problem

The typical architecture diagram mixes abstractions:

```text
one box is an entire system
another is a service
another is a library
another is a database table
another is a business concept
```

The result is illegible to everyone: too technical for non-technical readers, and too
imprecise for technical ones.

And it has no defined reader: it was drawn to "show the architecture", not for someone
with a question. See
[documentation principles](/17-architecture-documentation/documentation-principles.md).

## Core Concepts

### One level per diagram

The central rule: **all the boxes in a diagram are of the same type**.

```text
context     every box is a system or a person
container   every box is an executable or storage unit
component   every box is a grouping inside one container
```

That forces choosing the audience. And it makes the diagram legible, because the reader
knows what a box means without having to interpret case by case.

### What a container is

The term causes the most confusion, because it does not mean a virtualization container.

A container, in the model, is **something that executes or stores**:

```text
yes   a web application, an API, a mobile app, a database,
      a file system, a queue, a background process
no    a library, a module, a class, a concept
```

The test: **is it a separately deployable unit or a store?**

See [container diagrams](/17-architecture-documentation/container-diagrams.md).

### The first two levels cover most of it

```text
context     almost always worth it — the most consulted diagram
container   almost always worth it — it answers "where do I touch"
component   worth it for large systems, and it ages fast
code        almost never worth drawing — the tool generates it if needed
```

See [documentation principles](/17-architecture-documentation/documentation-principles.md): the half-life decreases
with the zoom.

The practical recommendation: produce context and container for every relevant system,
and component only for the parts that justify it.

### The model is about structure, not about everything

The four levels describe static structure. The model also defines supplementary
diagrams (system landscape, dynamic and deployment) that sit outside the zoom hierarchy
and answer other questions; here they are covered in
[sequence diagrams](/17-architecture-documentation/sequence-diagrams.md) and
[deployment diagrams](/17-architecture-documentation/deployment-diagrams.md):

```text
behavior in sequence   dynamic diagram — see sequence diagrams
physical deployment    deployment diagram — see deployment diagrams
data flow              outside C4 — see data flow
decisions and reasons  outside C4 — see architecture decisions
```

Trying to express sequence or process in a structural diagram produces a diagram with
numbered arrows that is neither of the two things done well.

In practice, a useful set combines the first two levels with two or three sequence
diagrams of the flows that cross the most pieces. It is that combination that answers
both "what exists" and "what happens", and it costs little more than the structure alone.

Treating the four levels as complete documentation is a scoping error: they are
deliberately partial, and that partiality is what keeps them usable.

### The notation is free, the semantics are not

The model prescribes no shapes, colors or tools. It prescribes what a box means at each
level.

That is deliberate: any notation works as long as it is consistent, and a legend handles
the rest. See
[diagram quality](/17-architecture-documentation/diagram-quality.md).

What is not free: mixing levels, omitting the legend, or using the same shape for
different things.

### Diagrams as code

A diagram described in text, versioned with the system and with the image generated, is
covered in [living documentation](/17-architecture-documentation/living-documentation.md).
What is specific to C4: because the model fixes the element type at each level, tools
such as Structurizr describe the system once, as a model, and derive the context,
container and component views from it. Renaming a container in the model updates every
view it appears in, instead of requiring the same edit in three drawings, and one view
cannot contradict another, because both read the same model.

## Mental Model

**One level of abstraction per diagram, one audience per level.** Context and container
resolve most of it.

## When to Use

- To communicate a system's structure.
- When onboarding new people.
- In architecture reviews.
- To discuss boundaries and integrations.
- As the basis for a system's documentation.

## When Not to Use

**When the question is about behavior.** If what needs documenting is the order of a
flow, concurrency or failure handling, the four levels have nowhere to put it. A sequence
diagram answers directly; forcing C4 produces the numbered arrows described above.

**When a contract or standard requires standardized notation.** If the artifact must
follow UML, SysML or an ISO 42010-conformant description, free notation with a legend
does not meet it, and C4's freedom becomes a liability. UML or a template such as arc42
satisfies the requirement.

**When the system is a single small deployable.** With only one container, the container
level adds nothing to the context level, and what remains (the context and a paragraph
about the internal organization) fits in a README or a sketch.

**When the documentation has to cover several views.** If security, deployment,
development and operations have distinct stakeholders, 4+1 or arc42 organize the whole,
and C4 comes in as their structural part, not as the whole.

## Alternatives

- **arc42**: a broader document template, including diagrams and text. See
  [architecture descriptions](/17-architecture-documentation/architecture-descriptions.md).
- **The 4+1 model**: organizes by views. See
  [architecture views](/17-architecture-documentation/architecture-views.md).
- **UML**: more expressive and heavier; useful when precision matters.
- **Informal diagrams**: a sketch on a whiteboard resolves a lot of conversation, and
  doesn't have to become an artifact.

The last deserves a note: not every diagram has to be documented. A disposable drawing
that clarifies a conversation has done its job.

## Trade-offs

| C4 | UML |
|---|---|
| Simple to learn | Long learning curve |
| Few notation elements | Large, expressive vocabulary |
| Free notation | Standardized |
| Four levels | Many diagram types |
| Focus on communication | On precision |

| Context and container | All levels |
|---|---|
| Sustainable | High maintenance cost |
| Covers most of it | Complete coverage |

## Failure Modes

**Mixed levels.** Illegible to everyone.

**Container confused with a virtualization container.**

**An out-of-date component diagram.**

**Sequence expressed in a structural diagram.**

**A hand-drawn diagram nobody updates.**

**No legend.** Each reader interprets the shapes.

## Common Mistakes

**Mixing abstractions.** The decision is to make one diagram "with everything", and
system, service, library and table end up side by side. The diagram loses its reader:
every audience now needs someone to explain it.

**Producing all four levels for every system.** It looks like completeness. The cost
arrives months later, when the component and code diagrams drift from the code and the
team starts distrusting even the levels that were still correct.

**Keeping in a graphics tool a diagram that has to evolve with the code.** The whiteboard
sketch is fine where it is; the mistake is making a file outside the repository, which
few people know how to edit, the reference. The first structural change without an update
makes it false, and nothing warns anyone.

**Numbering arrows** to express sequence in a structural diagram. It saves one diagram
and produces one where the reader follows numbers around the drawing to rebuild what a
sequence diagram would show top to bottom.

**Omitting the legend.** Whoever draws it finds the notation obvious because they
invented it; each reader assigns the shapes and arrows a meaning of their own, and two
people leave the same diagram with different readings of a dependency.

**Not dating it.** Without a date or version, the reader cannot tell whether they are
looking at today's structure or the one from two years ago (the situation in the example
below) and starts treating every diagram as suspect. Generated in the pipeline, the
diagram inherits the commit date; drawn by hand, it has to carry the date on the drawing.

## Real-World Example

A healthcare company had a single architecture diagram per system, drawn in a graphics
tool, with 40 to 60 boxes each.

The boxes included, in the same diagram: external systems, internal services, shared
libraries, database tables and business concepts.

Two consequences:

**Nobody used them.** The diagrams were shown in presentations and not consulted at work.

**Out of date.** Half of them had last been updated more than two years earlier.

Adopting C4 changed four things:

**Context per system.** One diagram with the system, the people who use it, and the
systems it talks to. Between 5 and 12 boxes.

That became the organization's most consulted diagram, used in onboarding, in
conversations with the business, and in impact assessment.

**Container per system.** The executable units and the stores, with the protocols between
them. Between 6 and 15 boxes.

**Component for only three systems**: the largest ones, where internal navigation
justified it.

**Diagrams as code**, versioned in each system's repository and generated in the
pipeline.

Versioned text does not detect drift on its own: a commit that changes the structure
without touching the diagram passes cleanly through the diff. What it did was make
updating cheap enough to fit in the same commit, which let "does the diagram still match?"
become an item in code review. That item is what contained the staleness.

One problem during adoption:

**Confusion about "container".** The platform team interpreted "container" as a
virtualization container, and the first diagrams showed the runtime topology instead of
the logical structure.

The fix was terminological: the internal glossary started calling the level "executable
units", with a note that it corresponds to the C4 container.

The point the team underlines: the gain didn't come from the notation. It came from the
discipline of one level per diagram. That made it possible to say, before drawing, who
the diagram is for.

## Related Concepts

- [Context Diagrams](/17-architecture-documentation/context-diagrams.md) and
  [Container Diagrams](/17-architecture-documentation/container-diagrams.md): the two most worthwhile.
- [Component Diagrams](/17-architecture-documentation/component-diagrams.md).
- [Diagram Quality](/17-architecture-documentation/diagram-quality.md).
- [Living Documentation](/17-architecture-documentation/living-documentation.md).

## Practical Exercise

Take an architecture diagram from your team and classify each box: is it a system, an
executable unit, an internal grouping, or a concept?

If there is more than one type, the diagram mixes levels, and that is why it is hard to
read.

## Interview Questions

- Why one level of abstraction per diagram?
- What is a container in the model, and what is not?
- Why does the component level age fast?

## Further Reading

- Brown, Simon. *The C4 model for visualising software architecture*. C4model.com.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
