---
id: tactical-ddd
title: Tactical DDD
sidebar_position: 19
description: The model's building blocks — expensive, and therefore restricted to the core.
doc_type: foundation
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides where to apply tactical DDD from the subdomain
  classification and the real complexity of the rules.
prerequisites: [aggregate, repository]
related: [strategic-ddd, core-domain, clean-architecture]
canonical_for: [tactical DDD, tactical design]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Tactical DDD

## Overview

Tactical DDD is the set of building blocks that implement a model inside a bounded context:
entities, value objects, aggregates, domain services, events, repositories and factories.

It is DDD's best-known part and the most expensive. The question this document answers is
not how to apply it — the individual documents do that — but **where**.

## The Problem

The tactical part is frequently applied uniformly: if the team "adopted DDD", every module
gets aggregates, repositories and value objects.

That wastes in two directions.

**Where the rules are simple**, the ceremony dominates. A registration with format
validation gains an aggregate, a repository, a factory and three value objects — to do what
thirty lines would.

**Where the rules are complex**, the attention is diluted. The core gets the same care as
the rest, rather than the disproportionate care it deserves.

The tactical part pays off when **the business rules are genuinely complex and change
frequently**. Outside that, it costs.

## Core Concepts

### The blocks and what each one solves

| Block | Problem it solves |
|---|---|
| [Entity](/04-domain-driven-design/entity.md) | Stable identity over time |
| [Value Object](/04-domain-driven-design/value-object.md) | A concept defined by values, valid by construction |
| [Aggregate](/04-domain-driven-design/aggregate.md) | Unit of transactional consistency |
| [Domain Service](/04-domain-driven-design/domain-service.md) | A rule involving several aggregates |
| [Application Service](/04-domain-driven-design/application-service.md) | Use case orchestration |
| [Domain Event](/04-domain-driven-design/domain-event.md) | Coordination between aggregates |
| [Repository](/04-domain-driven-design/repository.md) | Access to aggregates without coupling to persistence |
| [Factory](/04-domain-driven-design/factory.md) | Creation with business rules |

### The cost-to-return gradient

The blocks neither cost the same nor yield the same. Ordered by return relative to effort:

**[Value Object](/04-domain-driven-design/value-object.md)** — the best ratio. Cheap to
introduce, eliminates a whole class of defects, and is worth it even outside the core.

**[Ubiquitous language](/04-domain-driven-design/ubiquitous-language.md)** — not a block, and
the highest-return item of all. It costs conversations.

**[Entity](/04-domain-driven-design/entity.md) with behaviour** — cheap, and it is what
avoids the anemic model.

**[Aggregate](/04-domain-driven-design/aggregate.md)** — the most consequential and the
hardest to get right. Core only.

**[Domain Event](/04-domain-driven-design/domain-event.md)** — high return in systems with
several contexts; a real infrastructure cost.

**[Repository](/04-domain-driven-design/repository.md) and
[Factory](/04-domain-driven-design/factory.md)** — the most ceremonial. Outside the core,
they rarely pay off.

That means "adopting tactical DDD" is not a binary decision. It is possible — and frequently
correct — to adopt value objects and rich entities without adopting aggregates, repositories
and factories.

### The decision comes from the strategic part

The [subdomain](/04-domain-driven-design/subdomain.md) classification informs it directly:

**[Core](/04-domain-driven-design/core-domain.md)** — the full tactical set is justified. It
is where the rules are complex, change, and have to be testable and auditable.

**[Supporting](/04-domain-driven-design/supporting-domain.md)** — value objects and rich
entities, yes. Aggregates, repositories and factories, rarely. A direct service with data
access usually suffices.

**[Generic](/04-domain-driven-design/generic-domain.md)** — none. You bought or adopted it;
do not model it.

Without that classification, there is no criterion — and the application becomes uniform.

### The sign that it does not pay off

Three symptoms of the tactical part applied where it does not fit:

The ratio between lines of ceremony and lines of rules exceeds two to one.

The aggregates are anemic: they hold fields and no real invariant.

The repositories have one `save` method and one `findById`, and nothing else — because there
is no domain operation requiring more.

## Why This Matters

**Because the tactical part is the visible part and the one that consumes effort.** Applying
it in the wrong place is the most common waste for teams adopting DDD.

**Because partial adoption is legitimate.** Recognizing that you can adopt two blocks and not
all eight removes the barrier to entry — and produces more value than full adoption in the
wrong place.

**Because it connects to the investment decision.** Where to apply the tactical part is the
same question as where to allocate the best engineers, and the answer comes from the
business.

## Common Mistakes

**Applying it uniformly.** The dominant mistake.

**Applying it without the [strategic](/04-domain-driven-design/strategic-ddd.md) part.**
Without the right boundaries, the blocks are built in the wrong place.

**Treating it as all or nothing.** Partial adoption is frequently the correct one.

**Confusing vocabulary with adoption.** Naming classes `...Aggregate` and `...Repository`
with no invariants and no dependency inversion is a naming convention.

**Anemic model.** The most common failure mode: the blocks exist and the behaviour is in the
services. See [encapsulation](/02-software-design/encapsulation.md).

**Applying it to CRUD.** If the operation is create, read, update and delete with format
validation, there is no model to build.

## Real-World Example

A logistics platform adopted tactical DDD across the whole codebase: eleven modules, all
with aggregates, repositories, factories and value objects.

The review done two years later measured the ratio between ceremony code and rules code in
each module.

**Routing and pricing** — the two core modules. A ratio of 1 to 3: for each line of
structure, three of rules. The aggregates had real invariants, the value objects carried
behaviour, the events genuinely coordinated. The tactical part was paying off.

**Driver, vehicle, customer and reference table registration** — four supporting modules. A
ratio of 3 to 1, inverted: three lines of structure for each line of rules. The aggregates
had one field and no invariant. The repositories had two methods. The factories forwarded to
the constructor.

**Authentication and notification** — generic, and built in-house, which was another problem.

Simplifying the four supporting modules — removing aggregates, repositories and factories,
keeping value objects where there was real validation — removed about 40% of those modules'
code without losing any functionality or any business test.

The average time to add a field to a registration dropped from two days to a few hours.

The later assessment notes: value objects were kept in every module, including the supporting
ones, because they kept paying off — document, licence plate and coordinate validation are
worth it anywhere. The other blocks went.

That is the partial adoption this material recommends, arrived at by measurement.

## Related Concepts

- [Strategic DDD](/04-domain-driven-design/strategic-ddd.md) — what comes first and decides
  where.
- [Core Domain](/04-domain-driven-design/core-domain.md) — where the tactical part pays off.
- [Aggregate](/04-domain-driven-design/aggregate.md) — the most consequential block.
- [Clean Architecture](/02-software-design/clean-architecture.md) — the structure that usually
  accompanies it.

## Practical Exercise

Pick two modules in your system: one you consider core and one supporting.

In each, count the lines of structure — class declarations, constructors, accessors,
repository interfaces, mappings — and the lines of business rules.

The ratio between the two counts says whether the tactical part is paying off there.

## Interview Questions

- Where does tactical DDD pay off, and why?
- Is it legitimate to adopt only some of the blocks?
- What signs indicate the tactical part was applied in the wrong place?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — parts II and III.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Vernon, Vaughn. *Effective Aggregate Design*, 2011.
