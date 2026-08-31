---
id: container-diagrams
title: Container Diagrams
sidebar_position: 4
description: The executable units and how they communicate — the diagram that answers "where do I touch".
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader produces a container diagram that guides whoever will change the
  system, without descending into internal detail.
prerequisites: [c4-model]
related: [c4-model, context-diagrams, deployment-diagrams]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Container Diagrams

## Overview

A container diagram shows the **separately executable or storage units** that make up a
system, and how they communicate.

It answers the most frequent question of whoever is going to work on the system: **where
do I touch, and what does that affect?**

And it is the second highest-return diagram, after the
[context](/17-architecture-documentation/context-diagrams.md) — together, the two cover most of the real need for
structural documentation.

## Problem

The context shows the system as one box. That is enough for whoever is outside, and not
for whoever has to change it.

The next question is immediate:

```text
what pieces is this made of?
where does the logic for X live?
where does the data sit?
how do the pieces talk?
what do I have to start up to run this locally?
```

Without the diagram, those answers come from reading code and talking to whoever already
knows — which is expensive and produces partial answers.

## Core Concepts

### What counts as a container

```text
yes   web application, API, mobile app, background process,
      database, cache, queue, file system, serverless function
no    library, module, class, layer, concept
```

The test: **is it separately deployable, or is it a store?**

A library shared between two services is not a container — it is internal detail of both.
A queue is, because it has its own existence and has to be provisioned.

See [C4 model](/17-architecture-documentation/c4-model.md).

### Technology and protocol belong here

Unlike the context, the container diagram is technical. Including the technology is
useful:

```text
Orders API           [Java, Spring]
Orders Database      [PostgreSQL]
Processing Queue     [RabbitMQ]
Portal               [React]
```

And the protocols on the relationships:

```text
Portal → Orders API: "queries and creates orders, HTTPS/JSON"
API → Database: "reads and writes, TCP"
API → Queue: "publishes order created, AMQP"
```

That answers "what do I need to know to work here" — and it is what the context diagram
deliberately omits.

### The diagram reveals the real architecture

Drawing the containers and the communications exposes patterns the narrative hides:

```text
everyone reading the same database    → the database is the real integration
one piece talking to all the others   → a coupling point
two pieces that always change together → they probably should be one
communication in a long chain          → poor composed availability
```

See [integration landscapes](/15-enterprise-architecture/integration-landscapes.md) and
[availability](/06-distributed-systems/availability.md).

It is common for the first version of the diagram to cause discomfort — because it shows
the real structure, not the intended one.

### It guides local execution

A practical and underestimated use: the container diagram is the list of what has to be
running in order to work on the system.

That makes it the reference documentation for the development environment, and it gives a
complexity criterion: a system whose diagram has 14 containers is a system that requires
14 things running.

See [environment management](/14-devops-and-platform/environment-management.md).

### Stores deserve attention

Databases, caches and queues are containers, and showing them reveals what usually stays
implicit:

```text
how many stores exist
who writes to each one
who reads
whether there is direct access to someone else's store
```

The last is the most revealing. See
[data ownership](/07-data-architecture/data-ownership.md) — a diagram showing two
applications writing to the same database documents a boundary problem.

### The scope is one system

A container diagram describes **one** system. External systems appear at the edge, as
single boxes, with no internal detail.

Expanding it to show the inside of several systems produces a diagram that is too large
and mixes scopes — the same error as mixing levels.

When the question crosses systems, the right diagram is the context of the set, or a data
flow diagram. See
[data flow](/17-architecture-documentation/data-flow-diagrams.md).

### The number of boxes is a diagnosis

A large container diagram is rarely a drawing problem. It is a portrait of how many
separate things have to exist, be deployed, be monitored and be maintained.

```text
up to 6 containers   a system one team can hold
7 to 12              requires coordination, still tractable
above 15             the operational cost is already the dominant characteristic
```

The question the diagram provokes — "why so many pieces?" — is usually more valuable than
any answer it gives. See
[service boundaries](/05-system-design/service-boundaries.md): decomposing into deployable
units has a cost that only becomes visible when it is drawn all together.

And there is an asymmetry the drawing makes evident: adding a container is a decision made
by one person in an afternoon; removing it requires coordination among everyone who came
to depend on it. The diagram is the place where the accumulation of those individual
decisions appears as a property of the system, and where it can be discussed before it
becomes permanent structure.

## Mental Model

**The pieces that execute or store, and how they talk.** It answers where to touch.

## When to Use

- For every system with more than one executable unit.
- When onboarding people onto the team.
- To discuss internal boundaries.
- When planning changes that cross pieces.
- As a development environment reference.

## When Not to Use

**With libraries or modules** as boxes.

**Expanding external systems.**

**Without technology or protocol** — the level is technical, and omitting them reduces the
usefulness.

**For a single-piece system** — the context suffices.

**Descending into internal components.**

## Alternatives

- **[Context](/17-architecture-documentation/context-diagrams.md)** — when the question is external.
- **[Component](/17-architecture-documentation/component-diagrams.md)** — when it is about the inside of one piece.
- **[Deployment](/17-architecture-documentation/deployment-diagrams.md)** — when it is about where it runs.
- **Textual description** — for systems with two or three pieces.

## Trade-offs

| Container | Context |
|---|---|
| Says where to touch | Says what the system does |
| Technical | For anyone |
| Ages faster | Slowly |
| More boxes | Few |

| With technology | Without |
|---|---|
| Useful for working | More stable |
| Ages with migrations | Less |

## Failure Modes

**Libraries as boxes.** It confuses the level.

**External systems expanded.** Mixed scope.

**No protocols.** It doesn't answer "how do they talk".

**Out of date after a new piece.**

**Too large.** A sign that the system has too many responsibilities.

## Common Mistakes

**Including internal modules.** It mixes two levels of abstraction and makes the diagram lose its function, which is to show deployable units and how they talk.

**Omitting stores.** A database, a queue and a cache are containers with an architectural decision embedded in them. Hiding them erases half of what the diagram existed to show.

**Not labeling the communications.** Without the protocol and whether it is synchronous on the arrow, you cannot assess coupling or failure propagation.

**Expanding what is outside the system.** An external system is a single box. Detailing it spends space and suggests a level of control over it that doesn't exist.

**Not versioning it alongside the code.** A diagram outside the repository is not updated together with the change that invalidates it, and goes stale in the first week.

## Real-World Example

An e-commerce platform produced container diagrams for its eight main systems.

The one for the orders system revealed something the team did not expect:

```text
Orders API              → Orders Database
Billing Service         → Orders Database     ← direct access
Admin Panel             → Orders Database     ← direct access
Reconciliation Process  → Orders Database     ← direct access
```

Three consumers accessed the database directly, bypassing the API.

That was known individually, and had never appeared all together. The consequence was
documented in previous incidents without the cause being named: changes to the database
schema broke systems nobody had considered.

And the diagram made something else visible: the orders API had 11 endpoints, and the
admin panel used none of them — it read directly.

The decisions that came out of it:

**Direct access eliminated** over nine months. The three consumers moved to the API, with
new endpoints where they were missing. See
[data ownership](/07-data-architecture/data-ownership.md).

**Boundary revisited.** The reconciliation process, which only read, was moved to a
dedicated read replica — with an explicit contract about the schema.

And a side effect of the exercise: the diagrams became the development environment
documentation. The question "what do I have to start up to work on the orders system?"
came to have a visual answer.

One problem during production:

**Libraries as boxes.** The first diagrams included shared libraries — authentication,
logging, the internal HTTP client. That inflated the diagrams and mixed levels. The rule
"is it separately deployable?" resolved it.

What was recorded afterwards: the direct database access had existed for five years, was
known to several people, and had never been treated as an architectural problem — until it
appeared in a diagram with three arrows converging on the same box.

## Related Concepts

- [C4 Model](/17-architecture-documentation/c4-model.md).
- [Context Diagrams](/17-architecture-documentation/context-diagrams.md) — the level above.
- [Component Diagrams](/17-architecture-documentation/component-diagrams.md) — the one below.
- [Deployment Diagrams](/17-architecture-documentation/deployment-diagrams.md) — where it runs.

## Practical Exercise

Draw the container diagram of one of your team's systems, including every store.

Then check: does any application access another's store directly? That arrow is usually
the most valuable discovery of the exercise.

## Interview Questions

- What test decides whether something is a container?
- Why do technology and protocol belong at this level and not at the context level?
- What does the diagram reveal that the narrative hides?

## Further Reading

- Brown, Simon. *The C4 model* — c4model.com.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021.
