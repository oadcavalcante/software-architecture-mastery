---
id: modular-design
title: Modular Design
sidebar_position: 12
description: The practical application of modularity — how to divide a real system by capability.
doc_type: concept
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader divides a system by business capability and defines the
  internal contract between modules.
prerequisites: [layering]
related: [package-design, component-design, boundaries]
canonical_for: [modular design, capability module]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Modular Design

> Prerequisite: [Modularity](/01-fundamentals/modularity.md) establishes why to
> divide and what the criterion is. Here the focus is how to carry the division
> out in a real system: what goes inside each module, what crosses, and how the
> internal contract is defined.

## Overview

Modular design is the practice of dividing a system into capability modules, each
with its own complete internal structure and an explicit contract with the others.

The result being sought is specific: **a typical business change fits inside one
module.**

## Problem

Modularity as a concept is accepted without controversy. Carrying it out in a real
system runs into three questions the concept does not answer.

**Where exactly do you draw the lines?** The domain does not arrive pre-divided.

**What may a module expose?** If it exposes its entities, the coupling is the same
as before with more ceremony.

**How do two modules cooperate without coupling?** Every real feature crosses
capabilities: an order involves catalogue, stock, payment and delivery.

Without concrete answers, the division becomes renaming directories.

## Core Concepts

### The division comes from capability, not from the entity

The most common mistake is dividing by domain noun: a `Customer` module, an
`Order`, a `Product`.

That reproduces the layering problem on another axis. A change to "a customer can
have a credit limit" touches `Customer`, `Order` and `Billing`, because the
capability *granting credit* is spread across all three entities.

The division that works is by **capability** — what the business does — and each
capability has its own view of the entities it needs. It is the same idea that
[strategic DDD](/04-domain-driven-design/strategic-ddd.md) formalizes as a bounded
context.

### Each module has a complete internal structure

A capability module contains everything it needs: its API, its application, its
domain, its persistence.

```text
billing/
  api/           ← what other modules may call
  application/
  domain/
  infra/
```

That duplicates structure — each module has its own `infra`. The duplication is
accepted deliberately: it is the price of keeping the change contained.

### The contract is narrow and does not expose the interior

What a module publishes is not its entity. It is a contract type, designed for the
consumer.

```text
❌  billing.api  exposes  Invoice (entity, with all its fields and relations)
✅  billing.api  exposes  BillingStatus { upToDate: bool, amountDue: Money }
```

On the right, `billing` can restructure `Invoice` entirely without affecting
anyone.

### Communication between modules

Three forms, in increasing order of decoupling:

| Form | Coupling | When |
|---|---|---|
| Direct call to the module's API | Contract and temporal | A synchronous query is necessary |
| Internal domain event | Contract only | The consumer reacts; the source need not know |
| Local copy of projected data | Minimal, with eventual consistency | The consumer queries frequently |

The second is what most often resolves it, and is the least used — teams tend to
reach for the direct call out of habit.

## Mental Model

**A module is a service that has not been extracted yet.** If you design each one
as though it might become a service some day, the division comes out good even if
it never does.

That gives a concrete test: if extracting this module would require changing a lot
in the others, it is not modular.

## When to Use

- In any system beyond a few tens of thousands of lines.
- When more than one team works on the same codebase.
- When parts evolve at different rates.
- Before considering microservices — the modular monolith is the step that tells
  you where the boundaries actually are.

## When Not to Use

**In small systems.** Below a few thousand lines, the module structure costs more
in navigation than it saves in containment.

**When the domain is not yet understood.** A wrong boundary is worse than a
missing one. Start flat and extract modules as the axes appear in the history.

**When the proposed division does not match a real capability.** Modules by entity
or by technical layer add ceremony without containing change.

**When the internal contract ends up exposing everything.** A module that publishes
its entities has the cost of the division and none of the benefit.

## Alternatives

- **A flat package** — honest in small systems.
- **Layers as the primary division** — when the real variation is technical.
- **Vertical slice by use case** — a finer division still, useful in systems with
  many independent cases.
- **Separate services** — when there is a requirement for independent deployment
  or scale. It costs far more; see
  [boundaries](/02-software-design/boundaries.md).

## Trade-offs

| Modules by capability | No modules |
|---|---|
| Change contained | Change spreads |
| Teams in parallel | Constant conflict |
| Extraction into a service viable | Extraction unviable |
| Internal structure duplicated per module | A single structure |
| Internal contracts to maintain | No contracts |
| Cooperation between modules requires design | Direct call to anything |

## Failure Modes

**Module by entity.** The capability ends up spread across several.

**A contract that exposes entities.** Coupling identical to before.

**A growing `shared` module.** Whatever has no owner goes there, and it becomes a
universal dependency.

**Circular dependency between modules.** See
[dependency direction](/02-software-design/dependency-direction.md).

**Modules that always change together.** The division is on the wrong axis.

## Common Mistakes

**Dividing by noun.** The dominant mistake.

**Not enforcing the contract.** Without a mechanism, the neighbouring module
imports the entity directly.

**Creating modules before knowing the domain.** See "when not to use".

**Thinking modules require microservices.** A modular monolith delivers most of the
benefit for a fraction of the operational cost.

## Real-World Example

A logistics system was divided into `Driver`, `Vehicle`, `Route` and `Delivery` —
by entity.

The feature "reassign a delivery when the driver becomes unavailable" touched all
four modules, and that was the most frequent operation in the business.

The redivision by capability produced: `planning` (who does what and when),
`execution` (what is happening now), `registry` (driver and vehicle data) and
`billing`.

Reassignment came to fit entirely inside `planning`, which keeps its own
projection of driver availability — a local copy, updated by an event from
`registry`.

The local copy bothered the team at first: it was duplicated data. What it bought
was that `planning` stopped depending on `registry` in the critical path, and the
system's most frequent operation became local.

## How to introduce modules into an existing system

Reorganizing a large system all at once is expensive, risky and conflicts with all
work in progress. The incremental sequence that works:

**Discover the boundaries rather than deciding them.** Extract from the history
which files change together. The groupings that appear are module candidates, and
they come with evidence.

**Start with the most peripheral module.** The one with the fewest incoming
dependencies. Extracting it is cheaper and teaches the team the pattern at low
risk.

**Move without refactoring.** First reorganize files and enforce the boundary;
refactor the interior later, in a separate commit. Mixing the two produces reviews
nobody can assess.

**Enforce the boundary in the same commit that creates it.** Without the
architecture test, the new boundary is crossed before the quarter ends.

**Accept a transitional `legacy` module.** Whatever has not been classified stays
there, explicitly, with the rule that it may depend on the new modules but not the
reverse. That makes progress measurable — the size of `legacy` only goes down.

## Related Concepts

- [Modularity](/01-fundamentals/modularity.md) — the concept and the criterion.
- [Boundaries](/02-software-design/boundaries.md) — what separates the modules.
- [Package Design](/02-software-design/package-design.md) — the organization
  inside each one.
- [Strategic DDD](/04-domain-driven-design/strategic-ddd.md) — bounded context as the
  formalization of capability.

## Practical Exercise

List the five most frequent operations in your system — the ones the business asks
to change most often.

For each, count how many top-level modules it touches today.

Then sketch a division in which each one would fit inside a single module. The
differences between the two divisions point at where the boundaries are wrong.

## Interview Questions

- Why does dividing modules by entity tend to fail?
- What should a module expose in its contract?
- How do two modules cooperate without coupling?

## Further Exploration

- Parnas, David. *On the Criteria To Be Used in Decomposing Systems into Modules*.
  CACM, 1972.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Tornhill, Adam. *Software Design X-Rays*. Pragmatic Bookshelf, 2018 — measuring
  boundaries from history.
