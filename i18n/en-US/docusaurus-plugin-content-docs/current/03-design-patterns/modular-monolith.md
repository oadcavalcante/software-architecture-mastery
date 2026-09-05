---
id: modular-monolith
title: Modular Monolith
sidebar_position: 24
description: One deployment unit with enforced internal boundaries — the default that is rarely considered.
doc_type: pattern
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader evaluates the modular monolith as a first-class option and
  knows what it delivers and what it does not, relative to microservices.
prerequisites: [design-patterns]
related: [microservices, modular-design, boundaries]
canonical_for: [modular monolith]
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Modular Monolith

## Overview

A modular monolith is an application deployed as a single unit, with explicit and
**enforced** internal boundaries between capability modules.

It is the right answer whenever the need is for **logical** isolation and not operational
isolation — and it is the least considered, because "monolith" carries a negative
connotation that conflates two different things: single deployment and absence of
structure.

## Problem

The choice is presented as binary: monolith or microservices. Monolith means tangled
code; microservices mean autonomous teams and independent scaling.

The dichotomy is false. What makes a monolith painful is not the single deployment — it
is the absence of boundaries. And what microservices actually deliver splits into two
things with very different costs:

**Logical isolation** — modules that do not know each other's internals. A modular
monolith delivers that in full, for a fraction of the cost.

**Operational isolation** — independent deployment, scaling and failure. Only separate
services deliver that, and this is where the real cost is.

The useful question is not "monolith or microservices?". It is **"do I need operational
isolation, or only logical isolation?"** — and the second is enough for anything with no
scaling, failure or compliance requirement of its own.

## Core Concepts

### What makes it modular

Three properties. Missing any one, it is merely a monolith.

**Modules by business capability**, not by technical layer. See
[modular design](/02-software-design/modular-design.md).

**An explicit contract between modules.** Each publishes a narrow interface and hides its
entities, its schema and its dependencies.

**Boundaries enforced by a mechanism.** An architecture test, a language module or static
analysis. Without that, the boundaries erode — see
[architecture vs. implementation](/01-fundamentals/architecture-vs-implementation.md).

### Data per module

The point that most separates a modular monolith from an ordinary one: **each module owns
its data.**

The database may be a single one. The access is not. The billing module does not read the
catalogue table; it calls the catalogue module's API or consumes an event.

Enforcing that is harder than enforcing a code boundary, and there are mechanisms:
separate schemas in the same database, per-module permissions, or static verification of
which tables each module references.

Without that property, extracting a service later is practically impossible — because the
boundary never existed where it mattered.

### It is the step that informs extraction

A well-built modular monolith answers empirically the question nobody can answer on paper:
**where should the service boundaries be?**

After a year, the history shows which modules change together, which are stable, and which
have distinct scaling requirements. Extracting becomes an informed decision instead of a
bet.

## When to Use

- New systems, in a domain not yet fully understood.
- Teams of up to a few dozen people.
- When there is no proven requirement for independent scaling or deployment.
- When the organization lacks operational maturity for distributed systems.
- As the step before considering extracting services.

## When Not to Use

**When there is a real requirement for independent scaling.** A component needing ten
times the resources of the rest wastes them by scaling together.

**When teams need deployment autonomy.** If five teams block each other at release, the
boundary has to be a deployment one.

**When failure isolation is a requirement.** A module that cannot take the others down
needs a separate process.

**When parts have incompatible regulatory or security requirements** — data that cannot
reside in the same process or the same jurisdiction as the rest, or an artifact that has to
be certified and audited separately. There, the single deployment unit is what breaks.

**When the codebase is already too large for a viable build and test.** If the feedback
cycle exceeds tens of minutes and there is no way to parallelize, that is a real cost.

## Alternatives

- **[Microservices](/03-design-patterns/microservices.md)** — when operational isolation
  is necessary.
- **A monolith with no modules** — legitimate in small, short-lived systems.
- **Selective extraction** — a modular monolith with one or two services extracted for a
  specific reason. It is the arrangement that is least named and the one that shows up most
  when you look closely at a mature system, because that is where the decision was made
  component by component.

## Trade-offs

| Modular monolith | Microservices |
|---|---|
| One pipeline, one artifact | One per service |
| Local transactions between modules | Distributed coordination |
| Refactoring a boundary is a commit | It is a migration |
| Debugging in one process | Distributed tracing |
| Scaling as a block | Scaling per service |
| Shared failure | Isolatable failure |
| Release coupled across teams | Autonomous |
| Boundary erodes without a mechanism | The network blocks reaching the code, not the data |

The first four rows are advantages of the monolith usually forgotten in the comparison.
The last four are what microservices buy — and the price is in the rows above.

## Failure Modes

**Nominal boundaries.** Directories with no enforcement. It becomes an ordinary monolith
within months.

**Shared database with no ownership.** Modules reading each other's tables. It is the
failure that most prevents future extraction.

**A growing `shared` module.** A universal dependency.

**A build that does not scale.** A feedback cycle that is too long, with no
per-module parallelization.

**Modularity that does not match the business.** Division by entity or by layer; every
change crosses modules.

## Common Mistakes

**Treating "monolith" as an architectural failure.** It is a deployment decision.

**Not enforcing the boundaries.** With no mechanism, there is no modularity.

**Sharing tables between modules.** It is the decision that looks like it saves a query and
costs the future extraction: the boundary never comes to exist where it matters, and that is
found out when someone tries to separate them.

**Adopting microservices to obtain logical isolation.** You pay the operational cost for
something modules deliver.

**Not measuring whether the boundaries are right.** The history answers.

## Where it appears in practice

**Shopify.** Westeinde, Kirsten. *Deconstructing the Monolith*, Shopify Engineering, 2019,
and the 2020 assessment, *Under Deconstruction: The State of Shopify's Monolith*: the Ruby
commerce monolith was split into components within the same repository, with boundaries
enforced by the Packwerk tool. The documented decision is about that core — the company
operates services outside it — and that is what makes it useful here: the choice was made
component by component, not for the whole architecture.

**Consolidations of services back into modular monoliths.** There are public accounts, and
the stated reason is usually operational cost and debugging difficulty.

**Enterprise applications with language modules.** Module systems in Java and .NET allow
enforcing boundaries at compile time.

In the accounts that reach the public, the pattern is the same: the teams kept the
modularity and abandoned the distribution. That is compatible with this document's thesis —
that the two are separable — but does not confirm it: whoever reverses and regrets it rarely
writes about it, so the sample leans toward the cases that worked.

## Real-World Example

A logistics company with eighteen engineers built its platform as nine microservices,
following what was considered good practice.

After two years: four of the nine were always deployed together; none scaled independently
because the bottleneck was the shared database; and the average time to diagnose an
incident was forty minutes, almost all of it spent correlating logs across services.

The consolidation merged the four coupled ones into a modular monolith, keeping the
boundaries as modules with an architecture test. Two were decommissioned.

Three services stayed separate, and that decision required first resolving the diagnosed
bottleneck: the data of the three moved out of the shared database into their own. Without
that, keeping them outside would buy no scaling at all — they would stay stuck at the same
limit, which was exactly why the nine did not scale.

Result: from nine to four deployable units. Diagnosis time dropped to under ten minutes.
No logical boundary was lost.

What the team recorded in the ADR is the interesting part: the original architecture was
not wrong in identifying the boundaries — it was wrong in concluding that every logical
boundary had to be a process boundary.

## Related Concepts

- [Microservices](/03-design-patterns/microservices.md) — when operational isolation is
  necessary.
- [Modular Design](/02-software-design/modular-design.md) — how to carry out the division.
- [Boundaries](/02-software-design/boundaries.md) — the levels and their costs.
- [Component Design](/02-software-design/component-design.md) — when to promote a module.

## Practical Exercise

If your system is distributed, measure: how many of the services are always deployed
together? How many scale independently in practice?

If your system is a monolith, check: are there internal boundaries? Are they enforced by
some mechanism? Do modules read each other's tables?

## Interview Questions

- What is the difference between logical and operational isolation?
- What makes a monolith "modular"?
- Why does data ownership per module matter more than code ownership?

## Further Exploration

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019 — the modular monolith as a
  starting point.
- Fowler, Martin. *MonolithFirst*, 2015.
- Westeinde, Kirsten. *Deconstructing the Monolith: Designing Software that Maximizes
  Developer Productivity*. Shopify Engineering, 2019 — and *Under Deconstruction: The State
  of Shopify's Monolith*, 2020, with what they would do differently.
