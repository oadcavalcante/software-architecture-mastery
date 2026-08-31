---
id: monolith-vs-microservices
title: Monolith vs. Microservices
sidebar_position: 8
description: The question is about organizational prerequisites, not about code structure.
doc_type: tradeoff
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates the decision by operational prerequisites and by the
  stability of boundaries, not by fashion or by code size.
prerequisites: [microservices]
related: [centralization-vs-decentralization, coupling-vs-duplication, sync-vs-async]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Monolith vs. Microservices

## Overview

The question is asked as if it were about code structure. It is not.

```text
real axis   do the organizational prerequisites exist, and are the domain
            boundaries stable enough to be fixed in place?
```

Microservices solve an **organizational** problem: letting teams deploy and scale
independently. If that problem does not exist — because there is one team, or because joint
deployment is not a bother — the architecture delivers cost without benefit.

And there is a technical prerequisite: splitting into services **fixes boundaries**. Fixing a
wrong boundary is expensive to correct, and the right boundary is rarely known at the start.

## Problem

The decision is frequently made for the wrong reasons:

```text
"the monolith is big"              → size is not the criterion
"microservices scale better"       → scale is solved by replicas, not by splitting
"this way they'll be decoupled"    → poorly split services couple more, over the network
"it's what the big companies use"  → they have the prerequisites, and you may not
```

And the cost shows up later, distributed:

```text
a local transaction becomes a distributed transaction
a method call becomes a network call, with partial failure
debugging requires distributed tracing
the local environment requires N services running
a change that crosses a boundary requires coordinating teams
each service needs a pipeline, monitoring, alarms, on-call
```

The symmetric error exists: keeping a monolith when the organization already has 40 teams
competing for a single deployment, and coordination has become the dominant bottleneck.

## Core Concepts

### Prerequisites, not preferences

Microservices require capabilities that must exist **beforehand**:

```text
automated deployment, independent per service
distributed observability — tracing, correlation, log aggregation
self-service provisioning
teams that own services, with their own on-call
the ability to operate asynchronous communication
management of contracts between services, with versioning
```

Without them, the cost of each additional service is high and falls on the teams. An
organization that adopts microservices with no platform pays the cost of distribution without
receiving the autonomy.

See [platform engineering](/14-devops-and-platform/platform-engineering.md).

### An unstable boundary is the main impediment

```text
known domain, stable boundaries    splitting is viable
domain still being discovered      splitting fixes errors in place
```

A wrong boundary inside a modular monolith is fixed by moving code. Between services, fixing it
requires migrating data, coordinating deployments and versioning contracts.

This favors the sequence: **modular monolith first, extraction later**, once the boundary has
proven stable across months of real change.

See [bounded contexts](/04-domain-driven-design/bounded-context.md).

### Code size is not the criterion

```text
500k-line monolith, one team, clear internal boundaries  → it is fine
12 services, a team of 6 people                          → it is not
```

The criterion is the number of **teams that need to deploy independently**, and the contention
that joint deployment creates.

One measurable sign: waiting time to deploy, and how often one change is blocked by another.

### The modular monolith is the most underestimated option

```text
one deployable unit
modules with an explicit boundary and their own schema
access between modules only through the public interface
automated boundary checking
```

It delivers most of the organizational benefit of clear boundaries with none of the costs of
distribution, and it preserves the option to extract later.

The failure mode is well known: without automated checking, boundaries erode in 12 to 18
months. With it, they do not. See
[fitness functions](/19-architecture-governance/fitness-functions-governance.md).

### Granularity: how many services

When the split is justified, it is frequently made too fine:

```text
service per domain context       usually right
service per entity               almost always wrong
service per team                 a good starting point
service per layer                wrong — couples everything on every change
```

Few large services get it wrong less often than many small ones, because each boundary is a
decision that can be wrong. See
[service boundaries](/05-system-design/service-boundaries.md).

### Signs of the wrong choice

```text
split too early
  a feature change frequently requiring changes in 3+ services
  distributed transactions where there was a local transaction
  the local environment requiring more services than the machine can hold
  debugging time dominated by correlating logs
  more services than engineers

kept the monolith past the point
  a deployment queue, with changes blocking each other
  one component requiring scale far above the rest
  teams waiting on each other to deliver
  a deployment window negotiated between teams
  a failure in one module taking down unrelated functionality
```

The first sign in each list is the most reliable.

### Cost of changing your mind

```text
modular monolith → services      moderate, and viable: the boundaries already exist
services → monolith              expensive and rare, but it happens — requires
                                 reunifying data and undoing contracts
non-modular monolith → services  very expensive: untangle before extracting
```

The third line is the most common situation in practice, and the reason modularization is worth
it even for those who intend never to split: it is what keeps the option open at low cost.

## Mental Model

**Microservices are an organizational solution with technical prerequisites.** Without the
prerequisites and without the problem, they are pure cost.

## When to Use

Prefer **microservices** when:

- Multiple teams need to deploy independently, and the queue already exists.
- The operational prerequisites are built.
- The domain boundaries are known and stable.
- Components have very different scale profiles.
- There is an isolation requirement — regulatory, security, availability.

Prefer a **modular monolith** when:

- There is one or few teams.
- The domain is still being discovered.
- There is no operations platform.
- Scale is served by replicas of the whole.
- The deadline does not allow building the prerequisites.

## When Not to Use

**Deciding by code size.**

**Adopting microservices without the prerequisites.**

**Splitting by layer or by entity.**

**Keeping a non-modular monolith** — the worst of both, and it is where most teams are.

**As an irreversible decision** — the modular → extraction sequence is legitimate and
preferable.

## Alternatives

- **Modular monolith** — the right option more often than either extreme.
- **Selective extraction** — separate one or two components with a distinct profile, keeping
  the rest together.
- **Services per team, not per domain** — coarse granularity, aligned with the real
  organizational need.
- **Monolith with specialized replicas** — the same codebase deployed with different
  configurations per load profile.

The last solves the "one component needs different scale" case without splitting anything.

## Trade-offs

| Microservices | Modular monolith |
|---|---|
| Independent deployment | Simple deployment |
| Scale per component | Scale of the whole |
| Isolated failure | Shared failure |
| Distributed transaction | Local transaction |
| Requires a platform | Does not |
| Boundaries fixed | Boundaries movable |

| Few large services | Many small ones |
|---|---|
| Fewer wrong boundaries | More autonomy |
| Less coordination | More coordination |
| Less operational overhead | More |

## Failure Modes

**Splitting without prerequisites.** The cost of distribution, without the autonomy.

**Wrong boundary fixed in place.** Changes crossing services always.

**Non-modular monolith.** Neither simple nor separable.

**Granularity too fine.** More services than engineers.

**Deployment queue ignored.** The monolith is past its point.

**Modularity without checking.** Erosion in 12 to 18 months.

## Common Mistakes

**Deciding by size** instead of by number of teams and deployment queue.

**Splitting before knowing the domain.**

**Not building the platform first.**

**Not modularizing the monolith** while it is the right choice.

**Treating the decision as permanent.**

## Real-World Example

An education company with 22 engineers across 4 teams migrated its monolith to microservices in
2022. The stated reason: "the monolith is hard to maintain".

Eighteen months later, with 31 services:

```text
engineers                                        22
services                                         31
feature changes touching 3+ services             61% of deliveries
average delivery time                            from 6 to 17 days
incidents per month                              from 4 to 14
local environment startup time                   45 min, when it worked
hand-implemented distributed transactions         7
```

The cause was not the architecture itself. It was the absence of prerequisites and the
instability of the boundaries:

```text
deployment platform          did not exist; each service with its own pipeline
distributed tracing          absent
on-call                      a single one, for 31 services
boundaries                   derived from the monolith's table structure,
                             not from the domain
```

Boundaries derived from tables were the structural problem: they produced services that
corresponded to no unit of business change, which explains the 61%.

The correction, over 14 months, was reconsolidation:

**From 31 to 9 services**, regrouped by domain context identified from the change history —
modules that always changed together became one again.

**A modular monolith** absorbed 19 of the 31 services, with internal boundaries checked
automatically.

**Four services kept separate**, each with a recorded justification: a distinct scale profile in
video processing, regulatory isolation in the minors' data service, a very different change
cadence in the school integration service, and its own availability requirement in
authentication.

**A platform built** during the process — a common pipeline, distributed observability,
self-service provisioning.

Results after the reconsolidation:

```text
services                                         9
changes touching 3+ services                     14% of deliveries
average delivery time                            5 days
incidents per month                              3
local environment startup time                   4 min
distributed transactions                         2, both necessary
```

And two years later, with the company at 9 teams, two modules of the modular monolith were
extracted — this time with boundaries proven by two years of changes, and with the platform
ready. The extractions took 5 and 7 weeks, with no incident.

The later assessment points out: the 2022 monolith was in fact hard to maintain, and the
diagnosis was right. The error was in the treatment — the problem was the absence of internal
boundaries, and the answer applied was distribution, which fixes boundaries before they are
known.

Modularizing would have solved the real problem, and half the work was exactly that, two years
later and at a much higher cost.

## Related Concepts

- [Microservices](/03-design-patterns/microservices.md) and
  [Modular Monolith](/03-design-patterns/modular-monolith.md).
- [Service Boundaries](/05-system-design/service-boundaries.md).
- [Centralization vs. Decentralization](/20-trade-offs/centralization-vs-decentralization.md).
- [Synchronous vs. Asynchronous](/20-trade-offs/sync-vs-async.md) — the cost splitting brings.

## Practical Exercise

Measure, across the last 30 deliveries in your system, how many touched more than one service or
module.

Above 40%, the boundaries do not correspond to the business's units of change — and splitting
further will make it worse.

## Interview Questions

- Why is code size not a criterion for this decision?
- What prerequisites must exist before splitting?
- Why is an unstable boundary the main impediment to splitting?

## Further Reading

- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
