---
id: application-service
title: Application Service
sidebar_position: 15
description: Orchestrating a use case without deciding anything about the business — and the test that reveals when it decides.
doc_type: pattern
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader writes application services that coordinate without holding
  rules, and recognizes the leak when it happens.
prerequisites: [domain-service]
related: [domain-service, aggregate, clean-architecture]
canonical_for: [application service, use case]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Application Service

## Overview

An application service orchestrates a use case: it loads the aggregates, calls the domain's
operations, persists the result, controls the transaction and publishes the events.

What it does **not** do is decide anything about the business. That is the line, and it is
constantly crossed.

## Problem

Every use case needs coordination: someone has to fetch the data, invoke the rule, save and
deal with the transaction.

If that coordination lives in the entity, the entity comes to know persistence. If it lives
in the HTTP controller, the use case is tied to the channel and cannot be triggered by a
queue or a terminal.

The application service is the home for that coordination — and it is precisely because it
is the point where everything meets that it attracts business rules that should not be
there.

## Core Concepts

### It coordinates, it does not decide

The responsibility is a sequence with no judgement:

```text
CancelOrder.execute(orderId, reason):
    order = repository.find(orderId)      ← load
    order.cancel(reason)                  ← delegate the decision
    repository.save(order)                ← persist
    events.publish(order.events())        ← publish
```

The decision of **whether** the order can be cancelled belongs to the order. The service
only asks.

An `if` deciding something about the business inside the application service is the symptom
of the leak.

### The leak test

Facing an application service, ask of each conditional: **would this decision exist if there
were no software?**

Checking whether the user has permission, whether the input format is valid, whether the
resource exists — coordination.

Checking whether a shipped order can be cancelled, whether the credit limit allows it,
whether the waiting period has passed — business, and it belongs to the domain.

### It is the transactional boundary

The application service defines where the transaction begins and ends. That makes it
responsible for an architectural decision: **one aggregate per transaction**, per
[aggregate](/04-domain-driven-design/aggregate.md).

When a use case has to change two aggregates, this is where the decision surfaces —
coordinate by event, accept eventual consistency, or recognize that the boundaries are
wrong.

### It is the use case

In [Clean Architecture](/02-software-design/clean-architecture.md), the application service
corresponds to the use case interactor. In
[Ports and Adapters](/02-software-design/ports-and-adapters.md), it implements the primary
port.

One application service per use case — `CancelOrder`, `ConfirmPayment` — is preferable to a
service with fifteen methods, for the same cohesion reason that applies anywhere.

## When to Use

- There is a use case with a coordination sequence.
- The use case has to be triggered through more than one channel.
- There is a transaction to control.
- The domain has to be testable without infrastructure.

## When Not to Use

**When there is no real coordination.** A simple query returning data does not need to pass
through an application service — it can go straight from a read projection to the
controller. See [CQRS](/03-design-patterns/cqrs.md) level 2.

**As a mandatory layer out of symmetry.** Application services that merely forward to the
repository are an anemic layer. See [layering](/02-software-design/layering.md).

**In generic or supporting subdomains.** The separation between the rings rarely pays off
outside the core.

**When it would accumulate rules.** If rules insist on migrating there, the problem is in
the domain: an entity or a domain service to host them is missing.

## Alternatives

- **A controller calling the domain directly** — appropriate in trivial use cases and simple
  subdomains.
- **A command with a handler** — the same idea with different vocabulary. See
  [Command](/03-design-patterns/command.md).
- **A direct query** — for reads, without going through the domain.

## Trade-offs

| Application service | Direct controller |
|---|---|
| Use case reusable across channels | Tied to the channel |
| Transaction in one place | Scattered |
| Domain testable without infrastructure | Tests carry the channel |
| One class per use case | Fewer files |
| Risk of becoming an anemic layer | No extra layer |

## Failure Modes

**Business rules in the service.** The dominant mode, and the one that produces the anemic
model.

**A service with fifteen methods.** It lost cohesion; it became a module facade.

**A transaction spanning several aggregates.** A wrong boundary or unrecognized eventual
consistency.

**A service that returns entities.** The internal model leaks to the channel. It should
return a response type of its own.

**Anemic layer.** It forwards and coordinates nothing.

## Common Mistakes

**Putting a business `if` there.** Apply the leak test.

**Returning the domain entity.**

**Creating one service per entity instead of per use case.**

**Injecting everything.** A service with eight dependencies is usually doing too much.

## Real-World Example

A subscription system had a `SubscriptionService` with eleven methods and 700 lines.

Inside `cancel`, there was:

```text
if subscription.status == ACTIVE and daysSinceStart < 7:
    fullRefund = true
else if subscription.status == ACTIVE:
    proratedRefund = true
```

The seven-day rule is the statutory right of withdrawal. It is a business decision, and it
was in an application service — where no domain test covered it and where the product team
could not find it when looking.

The separation moved the rule into `Subscription.cancel(currentDate)`, which returns the
kind of refund due. The application service came to merely execute the refund the
subscription determined.

Two concrete gains.

When the statutory period changed from 7 to 14 days, the change was one line in the entity,
with the corresponding unit test. Before, it would have required finding the rule among 700
lines of coordination.

And the same cancellation came to apply to the three channels that triggered it — portal,
customer service and the automatic delinquency process — which previously had slightly
divergent implementations of the same calculation.

The third implementation, the automatic process, still used 5 days. Nobody knew.

## Related Concepts

- [Domain Service](/04-domain-driven-design/domain-service.md) — where rules across
  aggregates live.
- [Aggregate](/04-domain-driven-design/aggregate.md) — the transactional boundary.
- [Clean Architecture](/02-software-design/clean-architecture.md) — the use case as a circle.
- [Ports and Adapters](/02-software-design/ports-and-adapters.md).

## Practical Exercise

Pick an application service in your system and list all its conditionals.

For each, apply the test: would this decision exist without software?

The ones that would are business rules in the wrong place.

## Interview Questions

- What should an application service not do?
- How do you recognize business rules leaking into the application layer?
- Why one service per use case rather than one per entity?

## Further Exploration

- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017.
- Fowler, Martin. *AnemicDomainModel*, 2003.
