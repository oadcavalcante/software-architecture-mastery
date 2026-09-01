---
id: conways-law
title: Conway's Law
sidebar_position: 18
description: Architecture reproduces the organization's communication structure — and that is the strongest constraint there is on it.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader reads the architecture from the org chart and proposes organizational
  change as part of architectural change.
prerequisites: [architecture-leadership-basics]
related: [team-topologies, organizational-architecture, cross-team-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Conway's Law

## Overview

Melvin Conway, in 1968:

> Organizations which design systems are constrained to produce designs which are copies of the
> communication structures of these organizations.

The formulation is sixty years old and remains the most predictive observation about software
architecture there is. It doesn't describe a tendency — it describes a constraint:

```text
two teams that don't talk            produce two systems with poor
                                     integration between them
four teams on one component          produce four subcomponents
                                     with internal boundaries
one team that does everything        produces a system with no internal
                                     boundaries
```

And the consequence for whoever leads architecture is direct: **designing teams is designing
architecture**. Ignoring that is designing against the current, and the current always wins.

## Problem

The pattern the law explains, and that almost every architect has lived through:

```text
the target architecture is designed with four services
the teams are organized by layer — front end, back end, data
eighteen months later, four services exist on paper
and a layer-coupled system exists in practice
```

Nothing in that result is an execution failure. Every individual decision was made by competent
people following the path of least friction — and the path of least friction is the one where the
communication already exists.

A back-end team that needs a front-end change negotiates, waits and coordinates. The same team,
changing something within its own scope, just does it. Over eighteen months, that difference in
friction reorganizes the system.

The symmetrical error: reorganizing teams without understanding the existing architecture, and
producing a structure in which every product change requires three teams.

## Core Concepts

### It is about communication, not the org chart

The law speaks of **communication structure**, and that doesn't always match the org chart:

```text
two teams on the same floor, who have lunch together
  → they communicate well, even in different departments
two teams in the same department, in distant time zones
  → they communicate badly, even on the same org chart
```

That matters for the diagnosis: the real architectural boundary will appear where communication is
expensive, and not where the org chart says there is a separation.

In distributed organizations, time zone is frequently a stronger architectural constraint than
hierarchy.

### The inverse maneuver

The most valuable practical application: if the architecture reproduces the organization, then
**organize the teams in the shape of the desired architecture**.

```text
you want independent services per domain
  → organize teams by domain, with complete ownership

you want a cohesive modular monolith
  → one team, or teams with explicit internal boundaries
    and strong communication between them

you want a reusable platform
  → a platform team with its own product, not an
    on-demand infrastructure team
```

That is known as the inverse Conway maneuver, and it is the most powerful tool a senior architect
has — and the one they can most rarely invoke alone, because it requires engineering leadership.

That is why the architectural proposal and the organizational proposal have to travel together. See
[organizational architecture](/23-architecture-leadership/organizational-architecture.md).

### Teams by layer produce systems by layer

A specific and frequent case:

```text
organization   a front-end team, a back-end team, a data team
result         every feature crosses three teams
               no team delivers value on its own
               the bottleneck is coordination, not capacity
```

The resulting architecture is horizontally coupled: changing a business rule requires touching
three layers maintained by three teams, with three prioritization queues.

The alternative — teams by domain, with every layer inside — produces vertically coupled systems,
which is the coupling you want, because it follows the business's units of change.

### Team size is an architectural constraint

```text
a team of 5 to 9 people   communicates internally with no formal structure
above that                communication needs a mechanism, and the
                          component tends to subdivide
```

That means the maximum size of a cohesive component is limited by the size of team that can
maintain it. A component requiring fifteen people will split — the only question is whether the
split will be designed or emergent.

See [team topologies](/23-architecture-leadership/team-topologies.md).

### The law predicts the future, it doesn't only explain the past

The most valuable use is predictive:

```text
"you want three independent services, and they will be maintained
 by the same team of six people. In a year, they will be
 coupled — because there is no friction at all between them."

"you want a modular monolith, and the team is split between
 two cities with two hours of overlap. The
 boundaries will appear along that split, whether you draw
 them or not."
```

Making that prediction in a design review is one of the most useful contributions an architect can
make, and it costs one sentence.

### Not every divergence is bad

```text
aligned        the architecture matches the teams; changes
               are local
divergent      the architecture doesn't match; every change
               requires coordination
deliberate     the divergence is temporary and known, with
               a convergence plan
```

The third line is legitimate: during a transition, the target architecture and the current
organization may not match, and forcing the reorganization before the architecture exists would be
worse.

What is not legitimate is unacknowledged divergence — the organization that expects independent
microservices from teams organized by layer and doesn't understand why it doesn't work.

### The law also operates on vendors and contracts

```text
a system built by three different vendors
  → three subsystems with contractual integration between them
a system built with one consultancy per module
  → modules that reflect each contract's scope
```

A contract boundary is a communication boundary, and it shows up in the architecture as clearly as
a team boundary.

## Mental Model

**The architecture will look like the communication structure, always.** The choice is between
designing that correspondence or discovering it later.

## When to Use

- When proposing any significant architectural change.
- When diagnosing why an architecture never materialized.
- When evaluating a team reorganization.
- When predicting the outcome of a division of work.

## When Not to Use

**As an excuse** — "Conway's law explains it" resolves nothing; it guides the intervention.

**As determinism** — the law describes a strong constraint, not an impossibility; disciplined teams
maintain boundaries against the current, at the cost of continuous effort.

**Reorganizing teams by architectural fashion**, without understanding the domain.

**Ignoring the cost of reorganizing** — a team change costs productivity for months.

**Alone** — the inverse maneuver requires engineering leadership; proposing it without that
alignment wastes capital.

## Alternatives

- **Maintain the divergence with discipline** — boundaries preserved by automated verification, at
  the cost of continuous effort. See
  [fitness functions](/23-architecture-leadership/fitness-functions.md).
- **Adapt the architecture to the organization** — design what the current structure supports,
  instead of the ideal.
- **Change the communication without changing the org chart** — time zone overlap, shared rituals,
  rotating people.

The third is underrated and frequently viable when reorganization is not: the communication
structure can be altered without touching hierarchy.

## Trade-offs

| Align teams to the architecture | Adapt architecture to the teams |
|---|---|
| Sustainable boundaries | No reorganization cost |
| Cost of reorganizing | Architecture limited by the structure |
| Requires sponsorship | The architect's autonomy |

| Divergence with discipline | Convergence |
|---|---|
| No reorganization | Less continuous effort |
| Permanent vigilance cost | One-off change cost |

## Failure Modes

**Architecture designed against the structure.** It doesn't materialize.

**Reorganization without understanding the domain.** Wrong boundaries, fixed in place.

**Unacknowledged divergence.** The organization expects a result the structure prevents.

**Teams by layer** with an expectation of independent delivery.

**A component larger than the team** that maintains it.

**The inverse maneuver with no sponsorship.** A proposal that cannot be executed.

## Common Mistakes

**Treating the law as a historical curiosity.**

**Proposing architecture without looking at the org chart.**

**Reorganizing teams with no architectural convergence plan.**

**Ignoring time zone** as a communication boundary.

**Not using the law predictively** in design reviews.

## Real-World Example

An e-commerce company with 140 engineers decided to migrate from a monolith to microservices by
domain: catalog, cart, order, payment, delivery.

The organization, at the time, was by layer:

```text
web applications team         22 people
back-end services team        48 people
data team                     19 people
infrastructure team           14 people
product teams                 37 people, with no engineers of their own
```

Eighteen months later, five separately deployed services existed — and the measurement showed:

```text
feature changes touching 3+ services               68%
changes touching 2+ teams                          81%
average delivery time                              from 9 to 21 days
independent deployments per service/month          1.4 (the monolith
                                                   did 12)
```

Five services with deployment coupled by human coordination — the worst of both worlds: the
operational cost of distribution with none of the autonomy.

The diagnosis was direct: the services' boundaries were by domain, and the communication boundaries
were by layer. Every domain change crossed three teams with independent prioritization queues.

The reorganization took nine months and was led by engineering leadership together with the
architecture group:

**Five teams by domain**, each with front end, back end and data inside. Between 9 and 14 people
each.

**A platform team** with its own product — pipeline, observability, provisioning — instead of an
infrastructure team fielding requests.

**An enabling team** for data, temporary, to transfer modeling and quality competence to the domain
teams instead of executing for them.

**Complete ownership** declared: each service has an owning team, with its own on-call rotation.

It was an expensive reorganization. In the first four months, delivery speed dropped 30% — people
were learning layers they didn't know, and individual productivity collapsed.

Results 14 months after the reorganization:

```text
changes touching 3+ services                       19%
changes touching 2+ teams                          23%
average delivery time                              6 days
independent deployments per service/month          18
incidents per change                               -44%
```

In the retrospective: the five services were the same before and after. Not one architectural
boundary line changed. What changed was who talked to whom — and that, on its own, turned an
architecture that didn't work into one that did.

And the lesson that stuck for the decision process: architecture proposals came to require a
section on organizational structure. The standardized question was "which teams maintain each
boundary drawn here, and can they change it without coordinating with others?".

## Related Concepts

- [Team Topologies](/23-architecture-leadership/team-topologies.md).
- [Organizational Architecture](/23-architecture-leadership/organizational-architecture.md).
- [Cross-Team Architecture](/23-architecture-leadership/cross-team-architecture.md).
- [Monolith vs. Microservices](/20-trade-offs/monolith-vs-microservices.md).

## Practical Exercise

Draw your organization's engineering org chart next to the container diagram of the main system.

Look for the correspondences. Where they diverge, you probably find the boundaries that cost the
most to maintain — and the ones that generate the most coordination.

## Interview Questions

- Why does Conway's law speak of communication and not of the org chart?
- What is the inverse maneuver, and why does it require leadership sponsorship?
- Why do teams organized by layer produce horizontally coupled systems?

## Further Reading

- Conway, Melvin. *How Do Committees Invent?*. Datamation, 1968.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- MacCormack, Alan et al. *Exploring the Duality Between Product and Organizational
  Architectures*. Harvard, 2011.
