---
id: component-design
title: Component Design
sidebar_position: 14
description: The unit that gets deployed — how to decide what becomes a component and what stays inside.
doc_type: concept
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides what deserves to be a deployable component from
  quality requirements and lifecycle, not from code organization.
prerequisites: [package-design]
related: [modular-design, boundaries, dependency-direction]
canonical_for: [component design, deployable component]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Component Design

## Overview

A component is the smallest unit that gets deployed. Component design decides what
becomes one of those units and what stays inside another.

The decision is frequently confused with code organization. It is not: a component
is an **operations** decision, and the criterion comes from quality requirements
and lifecycle, not from structural aesthetics.

## Problem

The question "should this be a separate component?" tends to be answered with code
arguments: "it's too big", "it has too many responsibilities", "it would be cleaner
apart".

None of those justifies a component. All of them justify a
[module](/02-software-design/modular-design.md), which is free by comparison.

Splitting into components adds: a deployment pipeline, an artifact to version,
inter-process or inter-library communication, version incompatibility handling,
and — if over the network — partial failure, latency and distributed
observability.

That cost only pays off when there is a reason modules do not address.

## Core Concepts

### The reasons that justify a component

Four of them, and none is about code cleanliness:

**Independent lifecycle.** The part needs to be published at a different rate from
the rest. A library consumed by seven teams cannot go up together with one team's
application.

**A distinct quality requirement.** The part needs to scale, fail or be protected
separately. A report processor that consumes a lot of memory should not take down
request handling.

**An organizational boundary.** Different teams with release autonomy. It is the
strongest reason in practice and the least technical — see
[Conway's law](/23-architecture-leadership/conways-law.md).

**Reuse by external consumers.** Other systems need the capability without the
rest.

If none applies, an internal module delivers the same logical isolation for a
fraction of the cost.

### Component and module are not the same scale

| | Module | Component |
|---|---|---|
| Unit of | Understanding and change | Deployment |
| Boundary enforced by | Language, architecture test | Process, artifact |
| Cost to create | Low | High |
| Cost to move the boundary | Refactoring | Migration |
| Failure | Shared | Isolatable |

A well-designed system has many modules and few components.

### Components inherit the structure of the modules

The order that works: divide into modules first, let the boundaries prove
themselves in the history, and only then promote to a component the module that
has one of the four reasons.

The reverse order — deciding components before knowing the axes of change —
produces high-cost boundaries in the wrong place. And a wrong component boundary
is the most expensive of all to fix.

### A component's contract is public

The contract between modules can be refactored in one commit. The contract between
components is public: there is a deployed version on the other side that you do not
control.

That means versioning, backward compatibility and, eventually, supporting two
versions simultaneously. See
[schema evolution](/08-integration-architecture/index.md).

## Mental Model

**A component is a module that earned the right to be deployed on its own.** The
right is earned through one of the four reasons, not granted by organization.

## When to Use

- An independent release cycle is necessary.
- A distinct requirement for scale, failure or security.
- Different teams need deployment autonomy.
- External consumers need the capability in isolation.

## When Not to Use

**For size or aesthetics.** "It's too big" justifies a module, not a component.

**Before the boundaries have proven themselves.** Promote what the history showed
to be stable, not what the diagram suggests.

**When both sides are always deployed together.** If the separation is never
exercised, it is pure cost. See [boundaries](/02-software-design/boundaries.md).

**When one being unavailable makes the other useless.** There is no real failure
isolation; there are two points of failure instead of one.

**When the team cannot operate the result.** Each additional component is one more
item on call, one more set of alerts, one more thing to diagnose at three in the
morning.

## Alternatives

- **An internal module** — the right answer in most cases.
- **A shared library** — a component without a separate process; intermediate
  cost, and it couples release cycles.
- **Same process, resource isolation** — thread or memory limits per module,
  without separating deployment.

## Trade-offs

| Separate component | Internal module |
|---|---|
| Independent release | Joint release |
| Scale and failure isolated | Shared |
| Pipeline, artifact, versioning | None of that |
| Inter-process communication | Function call |
| A public contract to maintain | A refactorable contract |
| More items in operation | One item |

## Failure Modes

**Components coupled at release.** Always deployed together, in order, with matched
versions.

**Distributed monolith.** Separate components calling each other synchronously in a
chain; one failing takes down all of them.

**Ownerless component.** Nobody is accountable for its lifecycle.

**Excessive granularity.** More components than the team can operate. The cost
shows up in on-call and in diagnosis time.

## Common Mistakes

**Deciding components before modules.** An expensive boundary in the wrong place.

**Justifying it by code cleanliness.** Not a sufficient reason.

**Ignoring the operational cost.** It is the largest part of the cost and the least
accounted for.

**Treating the contract as refactorable.** It is public.

**Confusing component with microservice.** A published library is a component and
is not a service.

## Real-World Example

A team proposed extracting `reports` as a service. Justification: "it's too coupled
and it has grown too much".

The four reasons were checked.

*Lifecycle?* No — reports went up together with everything else and nobody
complained.
*Distinct quality requirement?* Yes — a heavy query consumed memory and had already
taken the application down twice.
*Organizational boundary?* No — same team.
*External consumer?* No.

One reason out of four. The extraction happened, but the scope changed because of
the analysis: instead of a `reports` service with a full API, only the **heavy
query executor** was extracted, as a separate process consuming from a queue.

The reporting business rules stayed in the monolith, as a module. What left was
only what had a resource-isolation requirement.

The result: a small component, with no public API, no synchronous contract, and the
memory problem solved. The original proposal would have created a service with an
API, a public contract and the whole cost — to solve a memory problem.

## The cost that does not make it into the calculation

The discussion about splitting off a component tends to compare implementation
effort. The real cost is operational and recurring.

Each additional component brings, per year of life: a pipeline to maintain and
migrate, a set of alerts to calibrate, an authentication surface, a version
compatibility matrix, one more item in the diagnosis of any incident, and one more
place someone has to look while investigating.

None of that appears in the pull request that creates the component.

A practical rule that works: **estimate how many components your team can operate
well**, and treat that as a budget. Teams of eight with a shared on-call rota tend
to sustain between three and six components with quality. Above that, incident
diagnosis starts degrading before any technical metric indicates a problem.

When the budget is full, creating a new component requires retiring another or
growing the team. Stating that explicitly changes the conversation from "it would
be cleaner apart" to "what comes off the list?".

## Related Concepts

- [Modular Design](/02-software-design/modular-design.md) — the division that
  precedes this.
- [Package Design](/02-software-design/package-design.md) — the release unit.
- [Boundaries](/02-software-design/boundaries.md) — the levels and their costs.
- [Microservices](/03-design-patterns/microservices.md) — the extreme case.

## Practical Exercise

List your system's deployable components. For each, check which of the four
reasons apply today.

The ones satisfying none are candidates to go back to being modules — and it is
worth estimating how much the team would save in operations.

## Interview Questions

- What justifies splitting something into a deployable component?
- What is the difference between a module and a component?
- Why is deciding components before modules risky?

## Further Exploration

- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — components and
  their principles.
- Newman, Sam. *Building Microservices*. 2nd ed., O'Reilly, 2021 — separation
  criteria and their costs.
