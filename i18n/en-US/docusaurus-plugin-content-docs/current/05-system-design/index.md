---
id: system-design
title: System Design
sidebar_position: 0
description: How to go from requirements and constraints to a system with components, interfaces, data and deployment.
doc_type: index
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader can walk the full path from requirements to a high-level
  architecture, justifying each decomposition by the constraints.
prerequisites: [design-patterns, domain-driven-design]
related: [distributed-systems, scalability, case-studies]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 03 — System Design

Here the object of study stops being the code and becomes the running system:
processes, data that persists, calls that cross the network, resources that run
out.

## The problem this section addresses

A practitioner who has mastered software design knows how to structure a module.
Faced with "design the system", they frequently do not know where to start —
because the decision space changed in nature. It is no longer about where to put a
class, but about how many processes exist, what each one holds, what happens when
one of them goes down and how much all of it costs per month.

This section establishes the path that leads from a prompt to a defensible
architecture:

```text
requirements
    ↓
constraints
    ↓
high-level architecture
    ↓
components
    ↓
interfaces
    ↓
data
    ↓
deployment
```

The path is always this one. What changes between one system and another is what
the constraints allow at each step.

## What you will find here

**Decomposition.** Components, services and service boundaries. How to decide what
is a service and what is a module inside a service — and why that decision is more
organizational than technical.

**Interfaces.** APIs, request/response systems, pagination and configuration. The
contract is the hardest part to change later; it is where spending time pays off.

**State.** State management and the distinction between stateful and stateless
systems. This is the decision that most determines how easy it will be to scale
later.

**Mechanisms.** Load balancing, caching, CDNs, queues, background processing, rate
limiting, search and file storage. The pieces systems are made of, each with the
problem it solves and what it breaks.

**Access.** Authentication and authorization at the system level — where the
decisions are made and by whom.

**Sizing.** Capacity planning, bottleneck analysis and the basic scalability
strategies. How to estimate before building.

## Reading order

Read **decomposition**, **state** and **service boundaries** first, in that order.
They are the three structural decisions; everything else is a consequence.

The mechanisms — cache, queues, load balancing — can be read by lookup. But read
**capacity planning** and **bottleneck analysis** before them, not after. Without
an estimate, the choice of mechanism becomes preference.

## By the end

You can take a system prompt and produce, in an hour, a high-level architecture
with named components, sketched contracts, an initial data model and a capacity
estimate — along with a list of what you still do not know and would need to ask.

You can point at where the bottleneck is before the system exists. And you can
explain why you introduced each piece, without the answer being "because everyone
uses it".

## A warning about the next level

Much of what you design here assumes that calls work, that the network delivers and
that components are either up or down.

None of that is true. [Level 04](/06-distributed-systems/index.md) undoes those
assumptions, and it is the deepest section of the course for that reason.
