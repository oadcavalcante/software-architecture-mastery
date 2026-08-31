---
id: application-architecture
title: Application Architecture
sidebar_position: 3
description: Which systems exist and what each one does — and the boundary question, which is the real decision.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides boundaries between systems at the organizational
  level, with an explicit criterion.
prerequisites: [business-capabilities]
related: [application-portfolios, integration-landscapes, enterprise-data-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Application Architecture

## Overview

Application architecture describes which systems exist, what each one is responsible for doing, and how
they relate.

The question it answers and no other layer answers: **where are the boundaries?**

That is the enterprise architecture decision with the greatest practical consequence. Well-drawn boundaries
produce systems that evolve independently; badly drawn ones produce an organization in which everything
depends on everything.

## Problem

Boundaries between systems are rarely decided — they emerge.

```text
a system grows and absorbs neighboring responsibilities
a new feature is put where it is easiest, not where it belongs
a purchased system brings the vendor's boundary
an acquisition brings systems with another organization's boundaries
```

The result is a set in which each system's responsibility is historical, not logical — and business changes
require touching several systems, because the boundary does not correspond to the domain.

## Core Concepts

### The boundary follows the domain, not technology or the org chart

The three wrong criteria, in the order they appear:

```text
by layer        an interface system, a logic one, a data one
                → every business change touches all three
by technology   grouped by what shares an implementation
                → the domain ends up scattered
by org chart    each area has its own system
                → the next reorganization misaligns everything
```

The criterion that works: **the boundary follows the domain**. See
[bounded context](/04-domain-driven-design/bounded-context.md) and
[business capabilities](/15-enterprise-architecture/business-capabilities.md).

A well-drawn boundary has the property that most business changes fit inside one system.

### The change test

The practical verification of a boundary:

```text
take the last ten business changes
how many systems did each one touch?
```

```text
most touch 1 system      good boundaries
most touch 3 or more     wrong boundaries
```

That test is more reliable than any technical coupling analysis, because it measures what matters: the
ability to change.

And it is easy to apply — the information is in the change history.

### Data cohesion is the strongest criterion

Systems that share the same data tend to be the same system.

```text
two systems writing to the same entity
  → either the boundary is wrong
  → or one of them should not be writing
```

See [enterprise data architecture](/15-enterprise-architecture/enterprise-data-architecture.md) and
[data ownership](/07-data-architecture/data-ownership.md).

The converse also holds: if two systems never share data and never need to talk, the separation is
correct.

### Not everything needs to be separated

The decomposition movement has a limit, and it is frequently exceeded.

```text
separate when      different teams need to evolve independently
                   the domain is genuinely distinct
                   scale or availability requirements diverge
do not separate when  the change almost always crosses
                   the same team looks after both
                   the separation exists only from architectural preference
```

See [modular monolith](/03-design-patterns/modular-monolith.md).

An organization with many small systems and many integrations can have a higher cost than one with fewer,
larger systems. See [integration landscapes](/15-enterprise-architecture/integration-landscapes.md).

### Responsibility needs to be declared

Each system should have a sentence describing what it is responsible for — and the sentence should not
contain "and".

```text
good   "it is responsible for the policy lifecycle"
bad    "it is responsible for policies, billing, and sales reports"
```

The second reveals a system that absorbed neighboring responsibilities.

And the absence of the declaration is the most common state: systems whose responsibility nobody can state
without listing features.

### Purchased systems bring somebody else's boundaries

A market product has the boundary the vendor chose, and it rarely coincides with the organization's domain.

That produces two situations:

**The product does more than necessary.** Features the organization already has elsewhere — and the
decision about which to use needs to be made, or duplication arises.

**The product does less.** Part of the domain falls outside, and needs to be built around it.

See [SaaS](/09-cloud-architecture/saas.md) and
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md) — the translation
layer is what prevents the vendor's boundary from entering the domain.

### System boundaries and team boundaries influence each other

An observation worth making explicit, because it constrains the options in practice: communication inside a
team is cheap and frequent; between teams, expensive and episodic.

That means a system maintained by two teams tends to develop an internal boundary mirroring the division —
and that two systems maintained by the same team tend to couple, because nothing prevents it.

See [Team Topologies](/14-devops-and-platform/platform-engineering.md) for the organizational treatment.

The practical consequence is that redesigning system boundaries without adjusting team boundaries produces
a structure that does not hold: the communication finds the path, and the coupling reappears where it is
easy.

And the inverse also holds: a team reorganization with no review of the system boundaries produces teams
that need to coordinate constantly to change what is theirs.

The order that works: decide the boundary by the domain, then align the team allocation to it — and not the
opposite.

## Mental Model

**The boundary follows the domain.** If most changes cross systems, the boundary is in the wrong place.

## When to Use

- When deciding where to put a new feature.
- Before decomposing a large system.
- After acquisitions, to consolidate.
- When simple changes require touching several systems.
- When evaluating market products.

## When Not to Use

**Separating by technical layer.** Every business change crosses every layer, and what was decomposition
becomes mandatory coordination.

**Separating by org chart.** The structure changes faster than the domain, and the boundaries need to be
redrawn at each reorganization.

**Decomposing beyond what is necessary.** Each additional boundary is a contract to maintain and a
coordination to pay for; below a certain size, it costs more than it isolates.

**Without declaring each system's responsibility.** Without that, the same capability ends up implemented
in several places and none is authoritative.

**Letting the vendor's boundary enter** the domain. When the market product's model becomes the company's
model, switching vendors comes to require redesigning business processes.

## Alternatives

- **[Bounded context](/04-domain-driven-design/bounded-context.md)** — the same reasoning, with DDD's
  method.
- **[Business capabilities](/15-enterprise-architecture/business-capabilities.md)** — the business lens for
  grouping.
- **Keeping it as is** — a legitimate decision when the cost of reorganizing exceeds that of living with
  it.

## Trade-offs

| Larger systems | Smaller |
|---|---|
| Less integration | More |
| The change fits inside | It crosses |
| Larger teams | Autonomy |
| Uniform scaling | Independent |

| A boundary by domain | By org chart |
|---|---|
| Survives reorganization | Misaligns |
| Requires understanding the domain | Obvious |

## Failure Modes

**A change crossing systems.** A wrong boundary.

**A system with no clear responsibility.** It absorbed what was nearby.

**Excessive decomposition.** An integration cost greater than the benefit.

**A vendor's boundary in the domain.**

**Two systems writing the same entity.**

**An orphan system.** Nobody owns it, and it evolves by accretion.

## Common Mistakes

**Separating by layer.** A front-end system, a rules one and a data one guarantee that every business
change crosses all three — and requires coordinating three teams to deliver one feature.

**Separating by organizational area.** The org chart changes at each reorganization; the business
capability does not. Boundaries drawn over the first need to be redrawn at each structural change.

**Not applying the change test.** The question that validates a boundary is what fraction of changes cross
it. Without measuring that in the history, the decomposition is aesthetic.

**Not declaring responsibility.** With no sentence saying what each system answers for, the same capability
appears in three places and none of them is the source of truth.

**Decomposing by architectural preference.** Deciding the granularity by the chosen style — microservices,
for example — inverts the order: the boundary comes from the domain, and the style comes afterward.

**Not isolating market products.** A third party's system whose model leaks into the rest ties the
architecture to the vendor, and replacing it stops being a commercial decision.

## Real-World Example

A logistics company had 68 systems, and one constant complaint: simple changes took months.

The change test, applied to the twenty most recent business changes:

```text
touched 1 system      3
touched 2 systems     4
touched 3 to 5        9
touched more than 5   4
```

Eighty-five percent of the changes crossed systems.

The boundary analysis found the cause: the systems had been separated by **logistics process stage** —
pickup, transport, delivery, billing — while the business changes were by **service type**: express
delivery, less-than-truckload, refrigerated transport.

Adding a new service type required changing all four systems.

The boundary was aligned to the process, and the business evolved by service.

The reorganization, over two years, moved the boundary:

**Systems per service type**, each covering the complete cycle — pickup to billing — of its service.

**Common capabilities extracted** into shared services: tracking, geocoding, document issuance.

**Consolidation.** The 68 systems became 41 — the earlier decomposition had produced systems that were too
small, with a high integration cost.

The change test, repeated two years later:

```text
touched 1 system     13
touched 2 systems     5
touched 3 or more     2
```

And the average delivery time for a business change fell from 11 weeks to 3.

The original boundary was reasonable when it was created — the company had one service type, and the
process was the only axis of variation. It stopped making sense when the business came to vary by service,
and nobody revisited it.

## Related Concepts

- [Application Portfolios](/15-enterprise-architecture/application-portfolios.md).
- [Integration Landscapes](/15-enterprise-architecture/integration-landscapes.md).
- [Bounded Context](/04-domain-driven-design/bounded-context.md).
- [Enterprise Data Architecture](/15-enterprise-architecture/enterprise-data-architecture.md).

## Practical Exercise

Take the last ten business changes and count how many systems each one touched.

If most touched three or more, your boundaries do not follow the axis on which the business varies.

## Interview Questions

- What is the practical test of a boundary?
- Why is separating by technical layer wrong?
- Why can excessive decomposition cost more than it helps?

## Further Reading

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
