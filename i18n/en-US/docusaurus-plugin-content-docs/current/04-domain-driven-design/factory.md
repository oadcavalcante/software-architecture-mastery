---
id: factory
title: Factory
sidebar_position: 18
description: Encapsulating the creation of complex aggregates — and why it belongs to the domain.
doc_type: pattern
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes when creating an aggregate deserves a domain
  factory and when the constructor is enough.
prerequisites: [aggregate]
related: [aggregate, repository, factory-method]
canonical_for: [domain factory]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Factory

## Overview

A domain factory encapsulates the creation of aggregates or value objects whose construction
is complex enough not to fit in a constructor.

It is a different concept from the
[GoF Factory Method](/03-design-patterns/factory-method.md): here the problem is not type
variation by subclass, but guaranteeing that an aggregate is born valid and complete.

## Problem

Creating an aggregate sometimes involves more than assigning fields.

It may require assembling internal objects and guaranteeing consistency between them. It may
require applying rules that determine the initial state. It may require data from more than
one source.

Putting that in the constructor produces a constructor with logic, which is hard to test and
which mixes the decision of "how it is born" with the object's structure.

Putting it in the application service scatters the creation rule — and it is a domain rule.

## Core Concepts

### The factory returns a valid aggregate

The contract: what comes out of the factory satisfies every invariant. There is no visible
invalid intermediate state.

That is the same guarantee the parameter [Builder](/03-design-patterns/builder.md) offers,
with one difference: the domain factory applies **business rules** on creation, not merely
assembly.

### It belongs to the domain

The rule determining an aggregate's initial state is a business rule.

"A policy is born with a 30-day waiting period, except on portability" is a domain decision,
and the factory is where it lives — not the application service.

### Where the factory lives

Three places, depending on the case.

**A static method on the aggregate itself.** `Order.newFor(customer)`. Appropriate when
creation depends only on simple data.

**A method on another aggregate.** `customer.newOrder()`. Appropriate when the creating
aggregate has the information and the rule.

**A separate factory class.** When creation depends on several aggregates or on domain
services, and fits in none of them.

The third is the least frequent and the one the vocabulary tends to suggest first.

### Reconstitution is not creation

A distinction that avoids confusion with the
[repository](/04-domain-driven-design/repository.md).

**Creating** is bringing a new aggregate into existence: the creation rules apply, an
identifier is generated, events may be recorded.

**Reconstituting** is bringing back an aggregate that already existed: no creation rule
applies, the identifier comes from storage, no event is recorded.

The repository reconstitutes. If it goes through the factory, an order loaded from the
database will trigger the creation rules — and probably an `OrderCreated` event on every
read.

## When to Use

- Creation involves business rules.
- Assembling the aggregate requires coordinating several internal objects.
- There is more than one way to create, with different rules.
- The constructor would have many parameters or logic.

## When Not to Use

**When the constructor suffices.** If creating means assigning fields and validating, the
constructor solves it. The factory adds indirection.

**For reconstitution.** That is the repository's job.

**In subdomains outside the core.** The ceremony does not pay off.

**When the factory merely forwards to the constructor.** With no rule of its own, it is an
anemic layer.

**When the problem is parameter readability.** There a
[Builder](/03-design-patterns/builder.md) serves better — it solves verbosity, not creation
rules.

## Alternatives

- **A constructor with validation** — the most common case.
- **A named factory method on the aggregate** — `Subscription.annual(plan)`,
  `Subscription.monthly(plan)`. It expresses the variants with no separate class.
- **A [Builder](/03-design-patterns/builder.md)** — for many optional parameters.
- **Creation on the parent aggregate** — when it has the information.

## Trade-offs

| Domain factory | Constructor |
|---|---|
| Creation rule in one place | Scattered or in the constructor |
| Aggregate always valid | Depends on whoever constructs |
| Named creation variants | Constructor overloads |
| One more type | None |
| Indirection on creation | Direct |

## Failure Modes

**Factory used in reconstitution.** Creation rules triggered when loading from the database.

**Anemic factory.** Forwards to the constructor adding nothing.

**A factory that persists.** Creating and saving are different things; mixing them ties
creation to infrastructure.

**A factory with an infrastructure dependency.** It stopped being domain.

**Duplicated creation rule.** It exists in the factory and in the constructor, and they
diverge.

## Common Mistakes

**Confusing it with the GoF Factory Method.** Different problems.

**Creating a factory for everything.**

**Using it in reconstitution.**

**Putting the creation rule in the application service.** It is a domain rule.

## Real-World Example

A pension system created `Plan` in the application service:

```text
plan = new Plan()
plan.setType(type)
plan.setWaitingPeriod(type == PGBL ? 60 : 30)
plan.setAdminFee(computeFee(type, contribution))
plan.setStatus(ACTIVE)
if type == PORTABILITY:
    plan.setWaitingPeriod(0)
    plan.setStatus(AWAITING_TRANSFER)
```

Three problems.

The object existed in an invalid state between the calls — a `Plan` with no type, no waiting
period and no fee was constructible.

The waiting period and initial state rules were in the application service, not in the
domain. When the PGBL waiting period changed from 60 to 90 days, it had to be found outside
the domain.

And three application services created plans — portal, customer service and bulk import. All
three repeated the sequence, and the import one still used 60 days.

The factory concentrated everything:

```text
Plan.new(type, contribution)         → applies waiting period and fee by type
Plan.byPortability(origin)           → variant with its own rules
```

Two named operations, in the business's vocabulary, inside the domain.

The constructor became private. There is no longer a way to create an invalid `Plan`.

When the waiting period changed again, six months later, the change was one line — and it
applied to all three channels simultaneously.

## Factory and reconstitution in the same aggregate

The separation between creating and reconstituting has a practical consequence usually
discovered late: the aggregate needs two entry paths.

```text
Order.newFor(customer)                ← factory: applies rules, generates the id,
                                        records the event

Order.reconstitute(id, state)         ← used by the repository: no rules,
                                        no events
```

The second path is normally not public — it is accessible only to the persistence layer,
through package visibility, an internal constructor, or a mapper mechanism.

Three consequences worth anticipating.

**Tests need a reconstitution path.** Assembling an aggregate in a specific state to test an
operation should not go through the factory, because that would trigger the creation rules. A
dedicated test construction solves it.

**Object-relational mappers interfere.** Several require a no-argument constructor and direct
field access, which competes with the guarantee that the aggregate is born valid. The
solutions vary by tool and all involve some concession.

**Data migration uses reconstitution.** Importing history should not trigger creation events,
on pain of reprocessing years of facts that already happened.

Ignoring that separation produces the characteristic defect: creation events published on
every read from the database.

## Related Concepts

- [Aggregate](/04-domain-driven-design/aggregate.md) — what the factory creates.
- [Repository](/04-domain-driven-design/repository.md) — reconstitution, in contrast.
- [Factory Method](/03-design-patterns/factory-method.md) — the GoF pattern, which solves
  another problem.
- [Builder](/03-design-patterns/builder.md) — when the problem is verbosity.

## Practical Exercise

Look in your system for places where an aggregate is created with a sequence of assignments
followed by conditional logic.

Check whether that sequence appears in more than one place and whether the copies diverged.

Then ask: is there any point in that sequence where the object is invalid?

## Interview Questions

- What is the difference between the domain factory and the GoF Factory Method?
- Why should the repository not use the factory?
- When does the constructor suffice?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
