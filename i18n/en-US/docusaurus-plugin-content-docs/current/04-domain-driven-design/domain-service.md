---
id: domain-service
title: Domain Service
sidebar_position: 14
description: A domain rule that belongs to no entity — and the risk of becoming a dumping ground for logic.
doc_type: pattern
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes when a rule belongs to a domain service and when
  it is escaping the entity that should contain it.
prerequisites: [aggregate]
related: [application-service, aggregate, entity]
canonical_for: [domain service]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Domain Service

## Overview

A domain service holds business rules that do not naturally belong to any entity or value
object — typically because they involve several of them.

It is still domain: it knows no infrastructure, orchestrates no transaction, knows nothing
of HTTP or of the database.

## Problem

Not every rule fits in an entity.

"Transfer an amount between two accounts" involves two accounts and belongs to neither —
putting it in `Account` would make one account know and modify another, which violates the
[aggregate](/04-domain-driven-design/aggregate.md) boundary.

"Assess eligibility" may depend on three different aggregates.

With no place for those rules, they migrate into the application service — where they get
mixed with orchestration and transaction control — or into an entity that comes to know too
much.

The domain service is the correct place for them.

## Core Concepts

### The criterion

A rule belongs in a domain service when:

It is of the domain — it expresses a business decision, not technical coordination.

It belongs to no entity — forcing it into one produces unnatural coupling.

It is stateless — the service keeps nothing between calls.

Missing any of the three, it is something else.

### Domain service versus application service

The distinction that causes the most confusion, and the reason
[Onion](/02-software-design/onion-architecture.md) names both rings.

| | Domain service | [Application service](/04-domain-driven-design/application-service.md) |
|---|---|---|
| Contains | Business rules | Orchestration |
| Knows infrastructure | No | Yes |
| Controls the transaction | No | Yes |
| Decides something about the business | Yes | No |
| Testable without infrastructure | Yes | Needs substitutes |

The practical test: **if you removed all the technology, would this rule still exist?** If
so, it is domain.

### It speaks the ubiquitous language

A domain service is named after a business operation: `EligibilityAssessor`,
`ShippingCalculator`, `TransferBetweenAccounts`.

Names like `OrderManager`, `CustomerHelper` or `GenericProcessor` are a sign the rule was
not understood — and frequently that the service became a dumping ground.

### The risk: escaping responsibility

The mode of degeneration is well known: it is easier to write the rule in a service than to
find where it belongs in the entity.

The result is the anemic model — entities with no behaviour and services with all the logic.
See [encapsulation](/02-software-design/encapsulation.md).

The check: before creating a domain service, ask whether the rule genuinely involves more
than one aggregate. If it involves only one, it belongs to that one.

## When to Use

- The rule involves more than one aggregate.
- The rule is domain, not coordination.
- There is no entity where it fits without producing unnatural coupling.
- The operation has a name in the business's vocabulary.

## When Not to Use

**When the rule involves a single aggregate.** It belongs to that aggregate.

**When it is orchestration.** That is an application service.

**When the service would hold state.** Domain services are stateless; state belongs to
entities.

**As a dumping ground for logic with no obvious home.** It is the most common degeneration,
and the symptom is a generic name.

**In subdomains outside the core.** The distinction between the rings rarely pays off there.

## Alternatives

- **A method on the entity** — when it involves a single aggregate.
- **A value object with behaviour** — when the rule is about a concept, not about entities.
- **A factory method** — when the rule is about creation. See
  [factory](/04-domain-driven-design/factory.md).
- **A policy as an object** — a rule encapsulated as a
  [Strategy](/03-design-patterns/strategy.md), when there are variants.

## Trade-offs

| Domain service | Rule on the entity |
|---|---|
| A rule across aggregates has a home | One entity would know another |
| Testable in isolation | Testable along with the entity |
| Risk of hollowing out the entities | A rich model |
| One more type | None |
| The domain name made explicit | The rule inside a method |

## Failure Modes

**A service that becomes a dumping ground.** A generic name, many unrelated operations.

**Anemic model.** Rules that belonged to the entities migrated into services.

**Stateful service.** Shared between requests, it produces concurrency defects.

**A service that knows infrastructure.** It stopped being domain.

**A domain service that orchestrates.** Confusion with the application layer.

## Common Mistakes

**Creating a service for a rule involving one aggregate.** The dominant mistake.

**A generic name.** `Manager`, `Helper`, `Processor`, `Handler` — none is domain
vocabulary.

**Injecting a repository into the domain service.** It is debated; this material's position
is that the domain service should receive the aggregates already loaded, keeping data access
in the application layer. That preserves testability without substitutes.

**Confusing it with an application service.**

## Real-World Example

A banking system had a `TransferService` with 400 lines, containing: balance validation, fee
calculation, daily limit checking, audit logging, email notification and transaction
control.

Six responsibilities, of which two were domain and four were not.

The separation:

**The rule that belonged to the entity.** Balance validation and the daily limit are
invariants of `Account`. They moved there — `account.debit(amount)` throws if the balance or
the limit does not allow it.

**The rule that belonged to a domain service.** The fee calculation depends on the type of
both accounts, the amount and the time of day. It belongs to neither account. It became
`FeeCalculator`, stateless, testable with two in-memory objects.

**Coordination.** Loading the accounts, calling the debit and the credit, computing the fee,
persisting, controlling the transaction, publishing the event — all of that went to the
application service.

**Effects.** Auditing and notification became consumers of a
[domain event](/04-domain-driven-design/domain-event.md), outside the transactional flow.

The most relevant result was not the organization. It was that `FeeCalculator` came to have
40 unit tests running in milliseconds, covering combinations of account type, amount and
time of day that previously required setting up two accounts in the database.

The fee rule changed three or four times a year by commercial decision. The change cycle
dropped from days to hours.

## Related Concepts

- [Application Service](/04-domain-driven-design/application-service.md) — the
  orchestration.
- [Aggregate](/04-domain-driven-design/aggregate.md) — where most rules belong.
- [Entity](/04-domain-driven-design/entity.md) — a rule's default home.
- [Onion Architecture](/02-software-design/onion-architecture.md) — the rings' vocabulary.

## Practical Exercise

List the classes in your system whose names end in `Service`, `Manager` or `Handler`.

For each of their operations, answer: is it a business rule or coordination? Does it involve
one aggregate or several?

The rules involving a single aggregate are in the wrong place.

## Interview Questions

- What is the criterion for a rule to belong to a domain service?
- How do you distinguish a domain service from an application service?
- Why should domain services be stateless?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Fowler, Martin. *AnemicDomainModel*, 2003.
