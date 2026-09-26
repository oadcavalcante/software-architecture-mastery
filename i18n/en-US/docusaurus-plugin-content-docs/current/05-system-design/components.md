---
id: components
title: Components
sidebar_position: 2
description: The parts of a system, their responsibilities and what needs to be decided about each one.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader describes a component by what it decides on its own and by
  what it needs from the others.
prerequisites: [system-decomposition]
related: [services, apis, service-boundaries]
canonical_for: []
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Components

## Overview

A component is a part of the system with a defined responsibility, an explicit
interface and its own lifecycle.

Describing a system by its components is the most used vocabulary in system design,
and the most frequently vague, because "component" is used for things of very
different scales.

## Problem

Architecture diagrams show boxes with names. What a box means varies enormously: a
process, a library, a module, a managed service, a database.

Without defining what each box is, the diagram communicates less than it seems to,
and important decisions stay invisible. Two boxes connected by an arrow can be a
function call or a network request between continents, and the difference is
everything.

What makes a component usefully described are four questions:

**What does it own?** Which data and which decisions belong to it.
**What does it expose?** The interface, and what stays hidden.
**What does it depend on?** And with what guarantees.
**How does it fail?** And what happens to the rest.

A component whose four answers are not clear is not designed.

## Core Concepts

### Ownership defines the component

The most useful criterion: **a component owns a set of data and the decisions about
it.**

If two components write to the same table, they are not two but one, split
across two places, with the coupling hidden in the database.

That is the rule that most separates a real decomposition from a nominal one. See
[modular design](/02-software-design/modular-design.md).

### The component's type matters

Not every component is of the same type, and the type determines the cost of
interacting with it:

| Type | Interaction | Cost |
|---|---|---|
| Module | Function call | None |
| Library | Function call | Versioning |
| Local process | Local network | Serialization, partial failure |
| Remote service | Network | Latency, failure, timeout |
| Managed service | Network | The above, plus vendor dependency |
| Storage | Its own protocol | Latency, consistency |

A diagram that does not distinguish those types hides the cost of each connection.
That is what decides latency and failure mode.

### A stateless component is simpler in every way

The distinction between stateful and stateless components runs through every
subsequent decision: scaling, deployment, failure recovery, load balancing.

See [stateless versus stateful](/05-system-design/stateless-vs-stateful.md). The
recommendation up front: concentrate state in a few components and keep the rest
stateless.

### The component is the unit of replacement

The four questions have an operational test that sums them up: **can you replace
this component's implementation without touching any other?**

If the answer is yes, the boundary is real. If it is no, the drawing has more boxes
than components, and the cost shows up on the first replacement, when a swap
announced as local turns into a change in four places.

The test is useful because it fails cheaply. Replacing a component for real is
rare, but imagining the replacement costs five minutes and exposes the coupling the
diagram hides: the data format that leaked to consumers, the call order that became
an assumption, the field that exists only because the current implementation
produced it.

It also explains why data ownership is the criterion that comes before all others.
A component that does not own its data cannot be replaced on its own: whoever
writes to the same table has to change with it, and the boundary the drawing
promises does not exist in production.

### Infrastructure components are components

Databases, caches, queues and gateways are components of the system, with their own
ownership, interface, dependencies and failure modes.

Omitting them from the drawing (or drawing them as generic boxes with no associated
decision) hides where the bottlenecks and failure points are.

## Mental Model

**For each box in the diagram, answer the four questions.** The boxes that do not
survive the exercise are labels, not components.

## When to Use

- When describing a system to someone else.
- When planning the build and dividing the work.
- When analyzing where the bottlenecks and failure points are.
- When deciding what can be replaced.

## When Not to Use

**As a substitute for decomposition.** Naming components is not decomposing; the
decomposition comes first and uses a different criterion.

**At a level of detail that ages fast.** A component diagram that descends to
classes needs updating every week and will not be.

**Without declaring each one's type.** A diagram where a module and a remote service
look the same hides what matters.

## Alternatives

- **The C4 model**: zoom levels with semantics defined per level. See
  [architecture documentation](/17-architecture-documentation/index.md).
- **Sequence diagram**: when the question is about behavior over time, not about
  structure.
- **Deployment diagram**: when the question is where things run.

## Trade-offs

| More components | Fewer components |
|---|---|
| Clear responsibilities | Components that do a lot |
| Localized replacement | Touches the whole |
| More interfaces to maintain | Fewer contracts |
| The flow crosses more boxes | Direct |
| More informative diagram, denser | More readable, less precise |

## Failure Modes

**Component with no data ownership.** Two write to the same place.

**Component that does everything.** High fan-in; every change goes through it.

**Component invisible in the drawing.** Omitted databases and queues hide the
bottlenecks.

**Type not declared.** A network call that looks like a local call: the same
problem [Proxy](/03-design-patterns/proxy.md) introduces.

**Component with no defined failure mode.** Nobody knows what happens when it goes
down.

## Common Mistakes

**Drawing boxes without defining what they are.**

**Omitting infrastructure.**

**Not declaring data ownership.**

**Descending to detail that ages.**

**Confusing a component with a team.** They can coincide and are not the same thing.

## Real-World Example

A team presented the design of a booking system: five boxes connected by arrows, all
visually identical.

The four questions were applied to each one.

`Bookings` and `Availability` answered the first one badly: both wrote to the
occupancy table. They were not two components.

`Notifications` had no answer for the fourth: nobody knew what happened if it went
down. It turned out the call was synchronous inside the booking transaction: the
unavailability of the email service prevented bookings.

And the database did not appear in the drawing, although it was shared by three of
the five boxes. That made their independence fiction.

The redone drawing had five components (four application ones and the database, which
now appeared with its ownership boundaries), with each one's type declared and
notification moved outside the transactional flow.

No code changed at that stage. What changed is that three structural problems became
visible before they cost an incident.

## How to document components so they do not age

Component diagrams age because they descend to detail that changes every week. The
half-life of each level of detail is in
[documentation principles](/17-architecture-documentation/documentation-principles.md);
arrow labels and declared scope, in
[diagram quality](/17-architecture-documentation/diagram-quality.md).

What is specific to components is the stopping criterion: descend while each box still
answers the four questions, and stop there. A box that owns no data and has no failure
mode of its own is already implementation detail, and it is the one that forces a
redraw every month. The container and component levels of the
[C4 model](/17-architecture-documentation/c4-model.md) mark that boundary.

## Related Concepts

- [Decomposition](/05-system-design/system-decomposition.md): how the parts arise.
- [Services](/05-system-design/services.md): components with their own process.
- [APIs](/05-system-design/apis.md): the contract between them.
- [Component Design](/02-software-design/component-design.md): when to promote to
  deployable.

## Practical Exercise

Take your system's architecture diagram and, for each box, answer the four questions
in writing.

The boxes with no clear answer for data ownership or for failure mode are where the
next surprise will appear.

## Interview Questions

- What defines a component?
- Why declare each component's type in the diagram?
- What does it mean for two components to write to the same table?

## Further Reading

- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015. The C4 model.
- Bass, Len; Clements, Paul; Kazman, Rick. *Software Architecture in Practice*.
  4th ed., 2021.
