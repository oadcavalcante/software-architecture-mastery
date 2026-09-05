---
id: domain-event
title: Domain Event
sidebar_position: 16
description: A relevant domain fact, named and published — the coordination mechanism between aggregates.
doc_type: pattern
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader uses domain events to coordinate aggregates and
  distinguishes an internal event from an integration event.
prerequisites: [aggregate]
related: [aggregate, event-driven, event-sourcing]
canonical_for: [domain event, integration event]
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Domain Event

## Overview

A domain event is a fact that occurred, relevant to the business, named in the domain's
vocabulary and in the past tense: `OrderConfirmed`, `PaymentDeclined`,
`WaitingPeriodCompleted`.

It is the mechanism that allows coordinating aggregates without violating the one-aggregate-
per-transaction rule.

## Problem

The [aggregate](/04-domain-driven-design/aggregate.md) rule says: modify one aggregate per
transaction.

But real use cases cross aggregates. Confirming an order has to reserve stock, start billing
and notify the customer — three aggregates, possibly three contexts.

Two bad ways out.

Changing everything in the same transaction, which produces large aggregates and concurrency
conflicts.

Or putting the coordination in the application service, which then knows every aggregate
involved and becomes the place where the sequencing rule implicitly lives.

Domain events give the third: the aggregate records what happened, and whoever cares reacts
— each in its own transaction.

## Core Concepts

### The event belongs to the domain, not to the technology

A domain event has a name an expert recognizes. `OrderConfirmed` is a domain event;
`OrderUpdated` is not — "updated" is database vocabulary.

If the expert does not understand the name, the event does not capture a business fact.

### The aggregate records; the application publishes

The pattern that works:

```text
class Order:
    confirm():
        ... validates invariants ...
        this.status = CONFIRMED
        this.recordEvent(new OrderConfirmed(id, items, total))
```

The aggregate **records** the event in an internal list. The application service
**publishes** it after persisting successfully.

The order matters: publishing before persisting produces events for things that did not
happen, if the transaction fails.

### Domain event versus integration event

A distinction that avoids this pattern's most expensive mistake.

**A domain event** is internal to the bounded context. It carries concepts from the internal
model, can change freely, and its consumers are in the same context.

**An integration event** crosses the context boundary. It is a public contract: versioned,
stable, and expressed in terms that make sense outside.

Publishing domain events directly to the outside ties the internal model to external
consumers — and any refactoring then breaks them.

The correct practice is translation: the internal event triggers the publication of an
integration event, with a format of its own.

### The transactional publishing problem

If the transaction writes to the database and the publication goes to a message broker, the
two are not atomic. It can write and not publish, or publish and fail to write.

The usual solution is the *outbox* pattern — see
[delivery guarantees](/06-distributed-systems/delivery-guarantees.md), the canonical document
on the topic: the event is written to a table in the same transaction, and a separate
process publishes it. See
[distributed systems](/06-distributed-systems/index.md).

Ignoring that produces silent event loss, which is this pattern's hardest defect to
diagnose.

## When to Use

- Several aggregates need to react to a fact.
- The coordination does not need to be transactional.
- The fact means something to the business, not just to the system.
- Whoever acts has to be decoupled from whoever reacts.
- Auditing of business facts is necessary.

## When Not to Use

**When the reaction has to be transactional with the origin.** If the stock reservation has
to happen or the order is void, that is not an event — it is part of the same operation, and
the aggregate boundary is probably wrong.

**When there is one consumer and it is fixed.** A direct call is simpler and more traceable.

**For facts with no business meaning.** `EntitySaved` is not a domain event.

**Without idempotency handling in the consumer.** Delivery will be at least once.

**Without observability.** See
[event-driven architecture](/03-design-patterns/event-driven.md): the style's cost is
traceability.

## Alternatives

- **A direct call to the domain service** — when there is one consumer.
- **A [saga](/06-distributed-systems/sagas.md)** — when the coordination needs compensation
  and deadlines.
- **An application service orchestrating** — when the flow is critical and has to be
  auditable in one place.
- **A scheduled process** — when the tolerated latency is high.

## Trade-offs

| Domain events | Direct coordination |
|---|---|
| Small, independent aggregates | A large aggregate or a coupled service |
| A new consumer does not touch the origin | Touches it |
| One transaction per aggregate | A broad transaction |
| Eventual consistency | Strong |
| Flow not visible in one place | Explicit |
| Duplication and ordering to handle | Simple semantics |

## Failure Modes

**Event published without persisting.** The transaction fails after the publication.

**Event persisted and not published.** With no outbox, the process dies between the two.

**Non-idempotent consumer.** Duplication becomes a duplicated effect.

**Domain event leaking outward.** The internal model becomes a public contract.

**Event with insufficient data.** The consumer has to query the origin, which recreates the
coupling.

**Event with too much data.** It carries the whole aggregate; any model change breaks
consumers.

## Common Mistakes

**Naming with technical vocabulary.** `OrderUpdated` does not say what happened in the
business and forces every consumer to inspect the payload to find out. `OrderCancelled` and
`DeliveryAddressChanged` are different events because they provoke different reactions.

**Publishing before persisting.** If the transaction fails after publication, consumers react
to a fact that did not happen — and there is no way to withdraw the event from circulation.

**Not distinguishing a domain event from an integration event.** The first is internal and
can change along with the model; the second is a public contract and cannot. Publishing the
internal one outward freezes the domain model into other teams' consumers.

**Ignoring the transactional publishing problem.** Writing to the database and publishing to
the broker are two operations that can diverge: one may succeed and the other fail. It is the
problem the outbox pattern exists to solve, and ignoring it produces silent, rare
inconsistency — the worst combination to debug.

**Using events for coordination that has to be transactional.** If the next step has to
happen together with the first or neither does, an event is the wrong tool: it delivers
eventual consistency, and the requirement was atomicity.

## Real-World Example

An insurance system published `PolicyIssued` directly from the aggregate to the message
broker, consumed by four contexts: billing, commissions, reporting and communications.

The event carried the whole serialized `Policy` object.

Two problems appeared.

A refactoring of the aggregate — renaming an internal field and restructuring the coverages —
broke all four consumers simultaneously. The internal model was a public contract without
anyone having decided so.

And, during a broker outage, 340 policies were issued without the event being published. None
was billed. It was discovered three weeks later, in the accounting reconciliation.

The two fixes.

The aggregate came to record `PolicyIssued` as an **internal** event, with whatever model it
wants. The application service translates it into `PolicyIssuedV1` — an integration event
with a versioned format, containing only the fields consumers need: number, insured party,
period, premium, coverages in a format of its own.

Internal refactorings stopped reaching consumers.

The four consumers became idempotent, deduplicating by the event key on write — without
that, trading loss for at-least-once delivery would have turned into duplicate charges, which
is worse. And publishing came to use an outbox: the integration event is written in the same
transaction as the policy, and a process publishes it with at-least-once guarantees.

The silent loss became impossible.

## Related Concepts

- [Aggregate](/04-domain-driven-design/aggregate.md) — who records the event.
- [Application Service](/04-domain-driven-design/application-service.md) — who publishes it.
- [Event-Driven Architecture](/03-design-patterns/event-driven.md) — the style at system
  scale.
- [Event Sourcing](/03-design-patterns/event-sourcing.md) — when the events are the source of
  truth.

## Practical Exercise

List the events your system publishes. For each, check: is the name in the past tense and in
the domain's vocabulary? Does it cross the context boundary? If so, is it versioned?

Then check how publishing is done: is there a guarantee that the event is published if and
only if the transaction commits?

## Interview Questions

- What is the difference between a domain event and an integration event?
- Why record in the aggregate and publish in the application service?
- How do you guarantee the event is published only if the transaction commits?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — the outbox pattern.
