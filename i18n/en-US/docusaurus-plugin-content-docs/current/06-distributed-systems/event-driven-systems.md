---
id: event-driven-systems
title: Event-Driven Systems
sidebar_position: 37
description: Communication through published facts — the decoupling you gain and the traceability you lose.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides between event and call-based communication based on the
  desired coupling, and recognizes each one's operational cost.
prerequisites: [messaging]
related: [sagas, distributed-event-sourcing, ordering]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Event-Driven Systems

## Overview

In an event-driven system, components publish **facts that happened** instead of calling each other
asking for actions.

The producer does not know who consumes. The consumer reacts when it can.

The gain is real decoupling: adding a consumer does not touch the producer. The cost is that the
business flow stops existing anywhere readable — it emerges from the reactions.

## Problem

Communication through direct calls couples: the caller has to know whom to call, and needs the callee
to be available now.

When a business action triggers five consequences, a direct call produces a service that knows five
others and fails if any of them is down.

Events invert that — and trade one set of problems for another.

## Core Concepts

### An event is a past fact, a command is a request

The distinction that organizes everything:

```text
command: "process the payment"   → directed, can be refused
event:   "payment processed"     → a fact, you do not refuse the past
```

Naming in the past tense is not aesthetic convention. An event named as a command — `SendEmail`
published to a topic — reveals that the producer knows what should happen, which nullifies the
decoupling.

### Two types of event, with opposite implications

**Notification.** It carries the minimum: an identifier and a type. The consumer queries the producer
for details.

A small payload and availability coupling back — the consumer needs the producer to respond.

**Event with state.** It carries the necessary data. The consumer queries nobody.

Complete decoupling, and the event becomes a contract: changing its format breaks consumers you do
not know about.

The choice between the two is the design's most consequential decision. A notification preserves the
temporal coupling; an event with state transfers the problem to contract versioning.

### The flow disappears

In a mature event-driven architecture, nobody can point to where the "create order" process is
described. It is the sum of reactions scattered around.

That is a direct consequence of the decoupling, not an implementation defect. And it has a real
operational cost:

- Understanding a change's effect requires knowing who consumes.
- Debugging requires distributed tracing.
- A consumer that stopped working generates no error anywhere — only the absence of an effect.

The third is the most dangerous. See [consumer lag
monitoring](/06-distributed-systems/backpressure.md).

### Ordering and delivery are not given

See [ordering](/06-distributed-systems/ordering.md) and [delivery
guarantees](/06-distributed-systems/delivery-guarantees.md).

Events can arrive out of order, duplicated, or much later. Every consumer has to be
[idempotent](/06-distributed-systems/idempotency.md), and most have to tolerate out-of-order events.

Consumers written assuming ordering and single delivery work in tests and fail in production under
retries or rebalancing.

### The event is a public contract

When the producer does not know who consumes, it also does not know who breaks when it changes the
format.

That requires discipline: versioning, additive changes, a coexistence period between versions, and a
schema registry.

Teams that treat events as internal structures discover the problem when a removed field breaks
three consumers.

### It is not all or nothing

The most common adoption error is treating "event-driven" as a global choice.

Well-designed systems mix: a direct call where the caller needs the response to continue, an event
where the consequence is asynchronous.

Checking a balance is a call. "Order created" is an event.

## Mental Model

**An event decouples the producer from the consumer, and distributes the business flow.** What you
gain in independence you pay for in traceability.

## When to Use

- One action has multiple independent consequences.
- The consumers change more frequently than the producer.
- The producer should not know the consequences.
- The processing can be asynchronous.
- Different teams need to evolve independently.
- Absorbing peaks matters. See [messaging](/06-distributed-systems/messaging.md).

## When Not to Use

**When the caller needs the response.** A lookup, a validation, an authorization.

**For a single known and stable consumer.** The indirection does not pay off.

**When strict ordering between different entities is mandatory.**

**With no distributed tracing.** Debugging becomes unviable.

**With no consumer monitoring.** Silent failure.

**With no versioning strategy.** Changing the event will break someone.

**As a global choice.** The mix is the correct design.

## Alternatives

- **Direct call** — when the response is necessary.
- **Point-to-point queue** — asynchronous with no multiple consumers.
- **Explicit orchestration** — a readable flow with asynchronous steps. See
  [sagas](/06-distributed-systems/sagas.md).
- **Periodic polling** — simpler, and sufficient when the delay is acceptable.

## Trade-offs

| Event-driven | Direct call |
|---|---|
| The producer does not know the consumers | It knows |
| The consumer can be down | It has to be available |
| Adding a consumer does not touch the producer | It touches |
| Distributed flow | Explicit in the code |
| Tracing mandatory | Call stack |
| Idempotency mandatory | Frequently dispensable |
| Absorbs peaks | Propagates load |

| Notification | Event with state |
|---|---|
| Small payload | Large |
| The consumer queries the producer | Self-sufficient |
| Temporal coupling remains | Decoupled |
| Small contract | A broad contract to version |

## Failure Modes

**A stalled consumer with no alert.** Nobody notices the absence of an effect.

**A lost event.** Published and not persisted, or consumed and discarded.

**A duplicate processed.** With no idempotency.

**Ordering broken.** The consumer assumes a sequence.

**A broken contract.** A field removed; unknown consumers fail.

**An event cascade.** One event generates another, which generates another — and nobody has the map.
Cycles are possible.

**A storm.** A batch operation publishes millions of events and drowns the consumers.

## Common Mistakes

**Naming an event as a command.**

**Treating the event as an internal structure.**

**Not implementing idempotency.**

**Adopting it globally.**

**Not monitoring consumer lag.**

**Not having distributed tracing from the start.** Adding it later is far more expensive.

## Real-World Example

An e-commerce system migrated from direct calls to events. The orders service called seven others; it
came to publish `OrderCreated`.

The gains were real: adding the recommendation service as a consumer required no change to the orders
service, and the order came to be accepted even with the email service down.

Three problems appeared.

**A consumer stalled for nine days.** The tax invoice consumer failed after a deployment, with a
deserialization error. There was no lag alert. The discovery came from the tax department during the
month-end close — nine days of unissued invoices.

**An unexpected cascade.** `OrderCreated` triggered `StockReserved`, which triggered
`RestockNeeded`, which under certain conditions triggered a purchase order that published
`OrderCreated`. A real cycle, discovered on a night when the volume exploded.

**A broken contract.** A field renamed in the event broke two consumers from other teams, whom nobody
knew existed.

The fixes, in the order the team believes they should have come:

**Lag monitoring per consumer,** with an alert. It is the cheapest fix and it was the last one made.

**A schema registry** with mandatory compatibility. Renaming a field came to be rejected at
publication.

**An event catalog** — who publishes, who consumes. It made the unknown consumers visible and allowed
detecting the cycle.

**Distributed tracing** mandatory on every event.

**A partial reversal.** Two of the seven integrations went back to being direct calls, because the
caller needed the response and the event had added indirection with no benefit.

That reversal is the point the team records as the most instructive: the migration had been treated
as a global decision, when the right answer was per integration.

## Related Concepts

- [Messaging](/06-distributed-systems/messaging.md) — the infrastructure.
- [Sagas](/06-distributed-systems/sagas.md) — coordination over events.
- [Ordering](/06-distributed-systems/ordering.md) and [Delivery
  Guarantees](/06-distributed-systems/delivery-guarantees.md).
- [Idempotency](/06-distributed-systems/idempotency.md) — a requirement.

## Practical Exercise

List your system's integrations. For each one ask: does the caller need the response to continue?

Where the answer is no, an event is a candidate. Where it is yes, a direct call.

Then: is there an alert if a consumer stops? If not, that is the most urgent gap.

## Interview Questions

- What is the difference between an event and a command, and why does it matter?
- Notification or event with state — what changes?
- How is a stalled consumer detected?

## Further Reading

- Fowler, Martin. *What do you mean by "Event-Driven"?*, 2017.
- Stopford, Ben. *Designing Event-Driven Systems*. O'Reilly, 2018.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — chapter 3.
