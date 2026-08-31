---
id: strategic-ddd
title: Strategic DDD
sidebar_position: 10
description: The part of DDD that decides architecture — and the one almost always skipped.
doc_type: foundation
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader runs a strategic domain analysis and understands why it
  precedes and conditions any tactical decision.
prerequisites: [bounded-context, context-mapping]
related: [tactical-ddd, subdomain, enterprise-architecture]
canonical_for: [strategic DDD, strategic design]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Strategic DDD

## Overview

Strategic DDD is the part that decides **where the boundaries go** and **where to invest**.
It operates before any decision about aggregates or repositories.

It is also the part almost always skipped — most of what is called "adopting DDD" starts and
ends with the tactical.

## The Problem

The order in which DDD is usually learned is inverted.

Someone reads about aggregates, entities and value objects, applies the patterns, and
concludes that DDD is a style of writing classes. The system gains `Aggregate`, `Repository`
and `ValueObject` in its names, and keeps the same wrong boundaries as before.

The result is the worst of both worlds: the cost of the tactical part — indirection,
ceremony, more types — with none of the benefit of the strategic one, which is what actually
changes the architecture.

The correct order is the reverse. **Boundaries come first.** They decide where the modules
go, where services will be extracted, who talks to whom, and where applying the tactical part
is worth it.

## Core Concepts

### What makes up the strategic part

Five concepts, in the order they apply:

**[Domain](/04-domain-driven-design/domain.md) and
[subdomain](/04-domain-driven-design/subdomain.md).** Understanding the business and dividing
it into areas.

**Classification** into [core](/04-domain-driven-design/core-domain.md),
[supporting](/04-domain-driven-design/supporting-domain.md) and
[generic](/04-domain-driven-design/generic-domain.md). Deciding where to invest, where to
simplify and what to buy.

**[Bounded context](/04-domain-driven-design/bounded-context.md).** Defining the model's
boundaries — the decision with the greatest architectural consequence.

**[Ubiquitous language](/04-domain-driven-design/ubiquitous-language.md).** Establishing the
vocabulary inside each boundary.

**[Context mapping](/04-domain-driven-design/context-mapping.md).** Naming the relationships
between contexts, including the organizational dimension.

### It produces architectural decisions

The strategic part is not analysis for a report. Each concept produces a concrete decision:

| Analysis | Decision it produces |
|---|---|
| Subdomain classification | Where to allocate engineers; what to buy |
| Bounded context | Where the modules go, and later the services |
| Context mapping | How to integrate; where to build an anti-corruption layer |
| Ubiquitous language | The code's vocabulary |

The second row is the most important: **context boundaries are the best candidates for
service boundaries.** See [microservices](/03-design-patterns/microservices.md).

### It almost always pays off

Unlike the tactical part, the strategic one has a low cost and a high return even in small
systems.

Identifying where the vocabulary changes meaning is conversation work, not code work.
Knowing which subdomain differentiates the company changes the allocation of people. Neither
requires adopting any pattern.

A team can apply strategic DDD in full and write code with not a single aggregate — and
frequently that is the right decision.

### The main instrument is conversation

*Event storming*, collaborative modelling sessions, expert interviews. The strategic part is
done with business people in the room.

That is what makes it uncomfortable in organizations structured around layers of
communication — and it is the real prerequisite, more than any technical knowledge.

## Why This Matters

**Because boundaries are the decisions with the highest cost of reversal.** A wrong context
boundary costs years; a badly designed aggregate costs a refactoring.

**Because it decides where the tactical part pays off.** Without the subdomain
classification, tactical DDD is applied uniformly — and wasted on four fifths of the system.

**Because it connects architecture to the business.** It is the bridge between
[business context](/01-fundamentals/business-context.md) and software structure, and the
vocabulary that allows discussing one with whoever understands the other.

## Common Mistakes

**Jumping straight to the tactical part.** The structural mistake, and the most common.

**Doing the analysis without domain experts.** It produces boundaries invented by
engineering.

**Treating it as a documentation exercise.** A context map that changes no decision was not
worth the effort.

**Defining boundaries by organizational structure without checking the vocabulary.** The
organization is a clue, not the answer — and sometimes it is the organization that is wrong.

**Doing it once and never revisiting.** The business changes, and boundaries age.

**Confusing subdomain with bounded context.** Problem versus solution.

## Real-World Example

A property management company adopted DDD after two years of growing difficulty. The team
started with the tactical part: aggregates, repositories, value objects.

Six months later, the system had DDD vocabulary and the same problems: every change crossed
three modules, and two teams constantly blocked each other.

The strategic analysis, done afterwards, took three weeks — two *event storming* sessions
with building managers, administrators and the team.

What it revealed: the system was divided by entity — `Building`, `Unit`, `Resident`,
`Billing` — and the business operated through three distinct capabilities with their own
vocabularies.

**Facilities management** — maintenance, assets, work orders. "Unit" there is a physical
space.

**Finance** — apportionment, billing, delinquency. "Unit" is an ideal fraction with an owner
and a debt history.

**Community** — bookings, assemblies, notices. "Unit" is a group of residents with voting
rights.

Three meanings of "unit", three bounded contexts, and the system had one `Unit` class with 60
fields serving all three.

The reorganization by context took four months. The aggregates and repositories already
built were redistributed — most of the tactical work was reused, but inside the right
boundaries.

The conclusion the team recorded: the tactical part was not wrong. It was applied over a
division that the strategic analysis would have corrected in three weeks, had it come first.

## Related Concepts

- [Bounded Context](/04-domain-driven-design/bounded-context.md) — the central decision.
- [Subdomain](/04-domain-driven-design/subdomain.md) — the division of the problem.
- [Context Mapping](/04-domain-driven-design/context-mapping.md) — the relationships.
- [Tactical DDD](/04-domain-driven-design/tactical-ddd.md) — what comes afterwards.
- [Enterprise Architecture](/15-enterprise-architecture/index.md) — the same reasoning above
  the system.

## Practical Exercise

Gather two business people and map, on a timeline, the events that happen in your domain —
from the start to the end of an important flow.

Observe where the events cluster and where the vocabulary changes owner.

Compare the clusters with the system's module structure. The differences are the result.

## Interview Questions

- Why should the strategic part precede the tactical one?
- What architectural decisions does the strategic analysis produce?
- Why does strategic DDD pay off even in small systems?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — part IV.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.
- Brandolini, Alberto. *EventStorming*, 2013.
