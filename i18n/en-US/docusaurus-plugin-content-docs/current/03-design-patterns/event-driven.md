---
id: event-driven
title: Event-Driven Architecture
sidebar_position: 26
description: Components react to facts instead of being called — decoupling in time, at the cost of traceability.
doc_type: pattern
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses between orchestration and choreography and
  recognizes the traceability cost the style introduces.
prerequisites: [microservices]
related: [observer, cqrs, event-sourcing]
canonical_for: [event-driven architecture, choreography, orchestration]
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Event-Driven Architecture

## Overview

In an event-driven architecture, components publish facts that occurred and others react
to them, without the publisher knowing the consumers.

It is [Observer](/03-design-patterns/observer.md) at system scale, with one difference
that changes everything: the channel is durable, and delivery crosses processes.

## Problem

Synchronous communication between services couples in time: if the destination is down,
the origin is down. And it couples in knowledge: the caller has to know whom to call.

When confirming an order requires triggering stock, billing, delivery, loyalty and
notification, the order service knows five others, depends on the availability of all
five, and each new interested party requires altering it.

Publishing `OrderConfirmed` inverts that: orders announces a fact and moves on. Whoever
cares reacts in their own time.

## Core Concepts

### An event is a fact that occurred

The distinction that organizes everything: **an event is past tense, a command is
imperative.**

`OrderConfirmed` describes what happened; whoever reacts decides what to do.
`ReserveStock` says what to do, and is a command disguised as an event.

Naming commands as events produces coupling with the appearance of decoupling: the
publisher still knows what should happen.

### Orchestration and choreography

The style's structural decision, and the same one that appears in
[Mediator](/03-design-patterns/mediator.md) versus
[Observer](/03-design-patterns/observer.md).

**Orchestration** — a coordinator knows the flow and drives the steps. The flow lives in
one place, is auditable and visualizable. The coordinator couples.

**Choreography** — each service reacts to the events that concern it. Maximum decoupling,
and the flow exists nowhere: understanding it requires assembling what each service does.

| | Orchestration | Choreography |
|---|---|---|
| Flow visible | Yes, in one place | No, emergent |
| Coupling | Coordinator knows everyone | Each knows events |
| Adding a step | Alter the coordinator | A new subscriber |
| Debugging | Follow the coordinator | Reconstruct from traces |
| Suited to | Critical business flows | Independent reactions |

The choice is not ideological. Flows with ordering, compensation and legal responsibility
call for orchestration; independent reactions call for choreography. Real systems use
both.

### The central cost: traceability

What you gain in decoupling you pay in the ability to answer "what happened to this
order?".

In a synchronous system, the flow is readable in the code — you can follow it by reading,
and the error comes back to the caller. In an event-driven one there is no such thread: the
sequence only exists at runtime. Crossing processes requires correlating logs from several
services in both cases, over time, with the same identifier.

That makes [observability](/13-observability/index.md) a prerequisite, not a complement. A
correlation ID travelling through every event is not optional.

### The inherited guarantees

The channel is a network, and that forces you to **choose** the delivery guarantee — it
does not impose one. See [delivery guarantees](/06-distributed-systems/delivery-guarantees.md):
at-most-once is a legitimate choice where loss is acceptable, and the canonical document
notes that it is rarely considered.

Whoever chooses **at-least-once**, which is the common case, inherits:

Duplication — consumers have to be idempotent.
Order not guaranteed across partitions.
Messages that always fail — *poison messages* — need a dead-letter queue.
And eventual consistency between the services.

See [Level 04](/06-distributed-systems/index.md). None of that is optional; it is what the
style costs.

## When to Use

- Multiple independent parties interested in the same fact.
- The consumers change frequently.
- The reactions can be asynchronous with no harm to the business.
- Decoupling in time is needed — the producer should not depend on the consumer's
  availability.
- There is a need to reprocess history.

## When Not to Use

**When the response is needed to continue.** If the publisher needs the result, it is a
call, not an event.

**When strong consistency is a requirement.** Eventual consistency is the style's
semantics, and the business has to accept it explicitly.

**When there is one consumer and it is fixed.** A direct call is simpler and more
traceable.

**Without distributed observability.** The system becomes undiagnosable.

**For a critical flow with no orchestration.** Choreography in a payment flow produces a
process nobody can audit.

**When the team does not have a grip on duplication and ordering problems.** They will
appear, and the defects are subtle.

## Alternatives

- **A synchronous call** — when there is one consumer and the response matters.
- **Explicit orchestration** — keeping events, but with a coordinator.
- **Scheduled polling** — simpler than events when the tolerated latency is high.
- **A [modular monolith](/03-design-patterns/modular-monolith.md) with internal events** —
  the logical decoupling without the network.

## Trade-offs

| Event-driven | Synchronous calls |
|---|---|
| Producer independent of the consumer | Depends on availability |
| A new consumer does not touch the producer | Touches it |
| Absorbs peaks by queuing | Propagates pressure |
| Flow not visible anywhere | Visible in the call stack |
| Duplication and ordering to handle | Simple semantics |
| Eventual consistency | Transactions possible |
| Requires distributed observability | Local diagnosis |

## Failure Modes

**Invisible flow.** Nobody can describe what happens after an event.

**Command disguised as an event.** Coupling with the appearance of decoupling.

**Non-idempotent consumer.** Duplication becomes a duplicated effect — a repeated charge
is the classic case.

**Event silently lost.** With no dead-letter queue and no alert.

**Event cascade.** One event triggers another that triggers another; a loop.

**Unversioned event contract.** A removed field breaks consumers the producer does not
know about.

## Common Mistakes

**Adopting it without observability.**

**Choreography in a critical flow.**

**Not versioning the event contract.** It is public by definition.

**Ignoring idempotency.**

**Treating the event as a notification and then as a source of truth.** If the consumer
stores the data, the event became a data contract and evolving it gets far more
expensive.

## Where it appears in practice

**Order processing in e-commerce.** The condition that makes it appropriate: many
independent parties interested in the same fact, all with a tolerable asynchronous
reaction.

**Real-time data systems.** Ingestion, transformation and distribution through event
streams.

**Integration between a company's domains.** Business events as a contract between areas.

**Notification and auditing.** Independent, non-critical reactions — the case where
choreography is clearly appropriate.

In payment systems, the typical split is revealing: the authorization and capture flow is
orchestrated; notification, loyalty and analytics consume events. The same platform uses
both styles, for different reasons.

## Real-World Example

A delivery platform adopted pure choreography: nineteen services reacting to events, with
no coordinator.

The symptom appeared in customer support. An order would stay "in preparation"
indefinitely, and nobody could say why — the expected flow was documented nowhere, and
reconstructing it required reading nineteen services.

Three engineers took two days to discover that a consumer had stopped processing because
of a poison message, with no dead-letter queue configured.

The fix had two parts.

The operational one: a dead-letter queue and alerting on every consumer.

The structural one: the order's main flow — accepted, preparation, pickup, delivery —
became orchestrated, with an explicit saga that knows the steps, the deadlines and the
compensations. The other services — loyalty, analytics, notification, rating — stayed in
choreography.

The result: the critical flow became auditable and gained a deadline per stage; the
peripheral reactions kept their decoupling.

The original mistake was not using events. It was using choreography for a process that
carries legal responsibility and a contractual deadline.

## Related Concepts

- [Observer](/03-design-patterns/observer.md) — the in-process version.
- [CQRS](/03-design-patterns/cqrs.md) and
  [Event Sourcing](/03-design-patterns/event-sourcing.md) — patterns that frequently
  accompany it.
- [Distributed Systems](/06-distributed-systems/index.md) — the guarantees.
- [Integration](/08-integration-architecture/index.md) — the mechanisms.

## Practical Exercise

Pick a business flow in your system and try to describe it in writing, from start to
finish, without consulting the code.

If you cannot, the flow is emergent. Check whether it is critical — if it is,
orchestration is probably justified.

## Interview Questions

- What is the difference between an event and a command?
- When is choreography inappropriate?
- Which guarantees does the style force you to handle?

## Further Exploration

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — sagas and choreography.
- Fowler, Martin. *What do you mean by "Event-Driven"?*, 2017.
