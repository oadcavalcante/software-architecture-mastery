---
id: event-driven-integration
title: Event-Driven Integration
sidebar_position: 5
description: Publishing facts between systems — and the difference between an internal event and an integration event.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs integration events as a public contract,
  separate from the internal model of whoever publishes them.
prerequisites: [messaging-integration]
related: [messaging-integration, schema-evolution, integration-anti-corruption]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Event-Driven Integration

## Overview

Event-driven integration is publishing **facts** that other systems can consume, without the publisher
knowing who they are.

The fundamentals are in [event-driven systems](/06-distributed-systems/event-driven-systems.md). Here the
focus is what changes when the event crosses the boundary from one system to another: it stops being an
internal detail and becomes a **public contract**.

That distinction — an internal event versus an integration event — is the decision that separates
architectures that evolve from those that seize up.

## Problem

A system starts publishing events to decouple. Naturally, it publishes the events it already uses
internally, in the format it already has.

Months later, the internal model needs to change. And it cannot: four systems depend on that format, and
two of them belong to other teams.

The internal event became a public contract without anybody deciding that. The decoupling that motivated
the adoption produced a worse coupling — because now the internal model is frozen.

## Core Concepts

### An internal event and an integration event are different things

```text
internal event      domain-level, granular, reflects the model
                    changes with the model, with no coordination
                    consumed inside the service itself

integration event   published outward, stable, versioned
                    the business's language, not the model's
                    a contract with a change process
```

The integration event is **translated** from the internal one, in a deliberate layer. See
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

That looks like ceremony until the first time the internal model needs to change. Teams that publish the
internal event directly discover, generally in the second year, that they can no longer refactor.

### A thin or a fat event

**Thin — a notification.** It carries the identifier and the type. The consumer queries to find out the
rest.

A small contract, easy to version. And it gives back the availability coupling: the consumer needs the
publisher to answer.

**Fat — with state.** It carries the data. The consumer queries nobody.

Complete decoupling. And the event becomes a broad contract: each published field is a commitment.

One point that decides many cases: the fat event carries the state **at the moment of the fact**, and the
thin one brings the **current** state at query time. For auditing and for historical processing, the first
is the correct one — the price at the time of the order is not today's price.

See [normalization](/07-data-architecture/normalization.md).

### Name it in the past, and in the business's vocabulary

`OrderConfirmed`, not `UpdateOrderStatus`.

If the event's name describes what the consumer should do, the publisher is commanding — and knows the
consumers, which nullifies the decoupling.

And the vocabulary needs to be the business's, not the table's. `OrderLineInserted` exposes the internal
model; `ItemAddedToOrder` describes the fact.

### A catalog is what makes this operable

Without a place that says which events exist, what they mean, who publishes and who consumes, nobody can
change anything safely.

The catalog answers the question the decoupling made difficult: **who breaks if I change this?**

Together with a schema registry — which refuses incompatible changes at publish time — it is what allows
events to evolve with no incident. See
[schema evolution](/08-integration-architecture/schema-evolution.md).

### The consumer should not rely on what it does not need

A consumer that deserializes the whole event into an object couples itself to every field, including the
ones it does not use.

Consuming only the necessary fields, ignoring the rest, is what lets the publisher add things freely.

That is the consumer's responsibility, and it is the prerequisite for future compatibility.

### Ordering between events from different systems does not exist

Two systems publishing related events have no guaranteed ordering between them. `PaymentApproved` can
arrive before `OrderCreated`.

The consumer needs to tolerate that — typically by holding the out-of-sequence event or querying the
current state instead of assuming the ordering.

See [ordering](/06-distributed-systems/ordering.md).

## Mental Model

**An integration event is an API.** It deserves the same care in contract, versioning and deprecation as
any public endpoint.

## When to Use

- A fact interests several systems, and the publisher should not know them.
- New consumers appear frequently.
- Different teams evolve at different paces.
- The consequence is asynchronous.
- You need to record what happened, not only the current state.

## When Not to Use

**Publishing the internal event directly.** It freezes the model.

**When the publisher needs the response.**

**For a single known and stable consumer.**

**With no catalog.** Nobody knows who consumes what.

**With no schema registry.** The first change breaks somebody.

**With no consumer monitoring.** See
[messaging integration](/08-integration-architecture/messaging-integration.md).

**As a global choice.** Mixing it with synchronous integration is the correct design.

## Alternatives

- **[REST](/08-integration-architecture/rest.md)** — when the response is necessary.
- **[Webhooks](/08-integration-architecture/webhooks.md)** — events outside the organization, without
  requiring the partner to consume your broker.
- **Database change capture** — publishing from the database log, without touching the application. Fast to
  adopt, and it publishes the internal model — with all the coupling that brings.
- **Periodic polling** — simpler, and sufficient when the delay is acceptable.

The third deserves the warning: capturing database changes is frequently sold as event-driven integration,
and it is exactly the anti-pattern described above — the table's schema becomes a public contract.

## Trade-offs

| A translated integration event | A published internal event |
|---|---|
| The internal model is free to change | Frozen |
| A translation layer to maintain | None |
| Business vocabulary | Implementation vocabulary |
| An explicit contract | An accidental one |

| A fat event | A thin event |
|---|---|
| A self-sufficient consumer | It queries the publisher |
| State at the moment of the fact | Current state |
| A broad contract | A small one |
| Larger messages | Smaller |
| Sensitive data circulates | It stays at the source |

The last line of the second table decides privacy cases: a fat event with personal data replicates that
data across every consumer, and each copy is exposure.

## Failure Modes

**A frozen internal model.** The event became a contract with no decision.

**An unknown consumer broken.**

**An out-of-order event.** The consumer assumed a sequence.

**An event cascade.** One event generates another, and nobody has the map. Cycles are possible.

**A storm.** A batch operation publishes millions of events.

**A stopped consumer with no alert.**

**Sensitive data replicated.** A fat event spreads what should stay at the source.

## Common Mistakes

**Publishing the internal event.** The domain event carries the internal model; publishing it makes every
consumer depend on it, and the model comes to be unable to change without breaking teams you do not
control.

**Naming an event like a command.** `SendWelcomeEmail` is a disguised order: the publisher decided what the
consumer does. `CustomerRegistered` lets each consumer decide whether to react and how.

**Not maintaining a catalog.** With no place listing the events, their schemas and who consumes them,
nobody can assess the impact of a change — and the assessment ends up being made in production.

**Not versioning.** The schema will change. With no explicit version and no coexistence period, the change
requires every consumer to update at the same instant — the coordination the event model existed to avoid.

**A consumer deserializing the whole event.** Requiring every field makes the consumer break on the
addition of a new field, which should be a compatible change. Reading only what you use is what lets the
publisher evolve.

**Confusing database change capture with event integration.** Capturing table changes publishes the
physical schema outward. It is coupling to the database with the appearance of an event — and the worst
kind, because it looks decoupled.

## Real-World Example

A healthcare company adopted events to integrate scheduling, medical records, billing and a patient portal.

The initial implementation published the existing domain events, in the scheduling service's internal
format.

It worked for eighteen months. Then:

**An impossible refactoring.** The scheduling service needed to separate the concept of an "appointment"
from a "procedure" — a model change the business demanded. Three consumers depended on the old format, and
one belonged to an external partner. The refactoring sat still for seven months.

**Sensitive data spread around.** The event carried the patient's national ID number and date of birth,
because the internal object had those fields. Four systems came to store data they did not need. On a
deletion request, all four copies had to be traced. See
[data lifecycle](/07-data-architecture/data-lifecycle.md).

**An unknown consumer.** A field change broke a business intelligence system nobody knew consumed the
topic.

**A cycle.** `AppointmentScheduled` triggered `InvoiceGenerated`, which on cancellations triggered
`AppointmentRescheduled` — which published `AppointmentScheduled`. A rare case generated a loop that
published 200,000 events overnight.

The reformulation, over a year:

**Separate integration events**, translated from the internal ones, with the business's vocabulary and only
the fields the consumers needed. The national ID number came out; an opaque patient identifier stayed, and
whoever needs the data queries for it with authorization.

**A catalog** with publisher, consumers and schema. It made the unknown consumer visible and allowed the
cycle to be seen — which nobody had noticed in eighteen months because no diagram existed.

**A schema registry** with mandatory compatibility.

**Version coexistence** for six months on each incompatible change.

After that, the refactoring of "appointment" and "procedure" was done in three weeks, without touching a
single consumer.

The learning that stuck: the translation layer looked like unnecessary ceremony at the start — "it is the
same data, why copy it?". Its cost is small and constant; the cost of not having it was seven months of a
blocked business change.

## Related Concepts

- [Event-Driven Systems](/06-distributed-systems/event-driven-systems.md).
- [Messaging Integration](/08-integration-architecture/messaging-integration.md).
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md) — where the
  translation lives.
- [Schema Evolution](/08-integration-architecture/schema-evolution.md).

## Practical Exercise

Take an event your system publishes outward. Ask: if the internal model changes tomorrow, does this event
change with it?

If the answer is yes, you do not have an integration event — you have your internal model exposed as a
public contract.

## Interview Questions

- What is the difference between an internal and an integration event, and why does it matter?
- When is a fat event preferable to a thin one, and vice versa?
- Why is capturing database changes not event-driven integration?

## Further Reading

- Stopford, Ben. *Designing Event-Driven Systems*. O'Reilly, 2018.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018.
