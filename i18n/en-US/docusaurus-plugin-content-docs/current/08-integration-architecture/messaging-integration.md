---
id: messaging-integration
title: Messaging Integration
sidebar_position: 4
description: A broker between the ends — what the decoupling solves and what it transfers to operations.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides between synchronous and messaging integration
  based on the availability coupling each one imposes.
prerequisites: [integration-architecture]
related: [event-driven-integration, webhooks, rest]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Messaging Integration

## Overview

In messaging integration, the sender hands the message to a broker and moves on. The receiver consumes it
when it can.

The fundamentals — delivery guarantees, ordering, duplicates — are in
[messaging](/06-distributed-systems/messaging.md). Here the focus is the integration decision: **what
changes when two ends stop talking to each other directly**.

What changes is the availability coupling. And that solves a real problem and creates others, all of them
operational.

## Problem

In a synchronous integration, the caller depends on the callee being available **now**. If the destination
is down, the operation fails.

In a chain of four services with 99.9% each, the combined availability drops to 99.6% — and the user feels
the fourth link's failure even when their order was already validated.

Worse: a slow destination propagates the slowness. The caller's connections get stuck waiting, and the
saturation climbs the entire chain. See [partial failure](/06-distributed-systems/partial-failure.md).

## Core Concepts

### The broker absorbs unavailability

The central gain: the sender hands off to the broker and the operation ends. If the consumer is down for
two hours, the messages wait.

That decouples **availability**, not format or semantics — the consumer still needs to understand the
message.

And it moves the dependency: now both ends depend on the broker. It becomes a critical component, with all
the operations that implies.

### Queue or topic decides the topology

**A queue.** One message, one consumer. Several processes can consume from the same queue, and each message
goes to only one. It is work distribution.

**A topic.** One message, all subscribers. It is notification.

The choice is not aesthetic: the queue lets you scale processing by adding consumers; the topic lets you
add destinations without touching the sender.

A command goes to a queue. A fact goes to a topic. See
[event-driven integration](/08-integration-architecture/event-driven-integration.md).

### The response, when it exists, is another problem

When the sender needs to know the outcome, the decoupling is not free:

**A reply queue.** The message carries the reply address and a correlation identifier. It works, and it
reintroduces waiting.

**A later query.** The sender receives an identifier and queries later. Simpler to operate.

**A notification.** The result becomes another event, or a
[webhook](/08-integration-architecture/webhooks.md).

If the sender needs the response **in order to continue**, the integration probably should be synchronous.
Messaging with waiting for a response is the worst of both worlds: the queue's latency plus the call's
coupling.

### What becomes your responsibility

This is what the usual comparison omits. On adopting messaging, you take on:

```text
idempotency       at-least-once delivery is the realistic default
ordering          it is not guaranteed across partitions
duplicates        they will happen
poison messages   a message that always fails jams the consumption
a dead-letter queue  and the process for handling it
consumer lag      monitored, with an alert
schema            evolution of the message's format
```

Seven responsibilities the synchronous call did not have. Each one is covered in
[distributed systems](/06-distributed-systems/index.md), and all of them need to exist before the first
message goes into production.

### A stopped consumer is the characteristic failure mode

In a synchronous integration, a failure appears immediately: the caller receives an error.

In a messaging integration, a consumer that died generates an error nowhere. The sender keeps publishing
successfully. The messages accumulate. Nobody notices until somebody complains about the absence of the
effect.

**A consumer lag alert is not optional.** It is the metric that replaces the error you no longer have.

### Transactionality between the database and the queue

The classic problem: writing to the database and publishing the message needs to be atomic. If the database
commits and the publish fails, the effect vanishes.

The standard solution is the **transactional outbox**: write the change and the message in the same local
transaction, and a separate process publishes from there.

That solves it with no distributed transaction. See
[distributed transactions](/06-distributed-systems/distributed-transactions.md).

## Mental Model

**Messaging trades availability coupling for operational responsibility.** The seven responsibilities above
are the price, and it is fixed.

## When to Use

- The sender does not need the response to continue.
- Load spikes need to be absorbed.
- The destination is slower or less available than the origin.
- The processing can be retried without intervention.
- Several destinations consume the same fact.
- Different teams need to evolve at different paces.

## When Not to Use

**When the caller needs the response.** A query, a validation, an authorization.

**For a single known and always available destination.** The indirection does not pay.

**With no consumer lag monitoring.** A silent failure.

**With no idempotency in the consumer.** A duplicate is certain.

**With no poison message handling.** One message jams the whole queue.

**When strict ordering across distinct entities is mandatory.**

**For transferring large volumes.** See
[batch integration](/08-integration-architecture/batch-integration.md) — messages are not the right
transport for gigabytes.

## Alternatives

- **[REST](/08-integration-architecture/rest.md)** — when the response is necessary.
- **[Webhooks](/08-integration-architecture/webhooks.md)** — notifying without a broker of your own.
- **Periodic polling** — simpler, and sufficient when the delay is acceptable. Frequently discarded too
  early.
- **[Batch](/08-integration-architecture/batch-integration.md)** — for high volume and a defined
  periodicity.
- **A transactional outbox** — solves the "database plus event" case with no additional messaging.

## Trade-offs

| Messaging | Synchronous |
|---|---|
| The destination may be down | It needs to be available |
| Absorbs spikes | Propagates load |
| The sender does not wait | It waits |
| Seven new responsibilities | None of them |
| A silent failure is possible | An immediate error |
| A broker to operate | No extra component |
| Debugging requires tracing | A call stack |

## Failure Modes

**A stopped consumer with no alert.**

**A poison message jamming the queue.**

**A duplicate processed.**

**A lost message.** Published without acknowledgment, or acknowledged before processing.

**A queue growing without bound.** The consumer does not keep up with the producer. See
[backpressure](/06-distributed-systems/backpressure.md).

**An unavailable broker.** The single point the integration created.

**A broken message format.** Consumers fail at different moments.

## Common Mistakes

**Adopting it without implementing the seven responsibilities.**

**Not monitoring consumer lag.**

**Waiting for a response over a queue.**

**Publishing outside the database transaction.**

**Not handling poison messages.**

**Treating it as a global decision** instead of per integration.

## Real-World Example

A retail chain integrated the sales system with the inventory system through a synchronous call. Every sale
called inventory to decrement stock.

Two recurring consequences:

**Blocked sales.** When inventory became unavailable — which happened during deployments and at peaks —
sales stopped. On one Black Friday, that was 40 minutes of checkout down because of a service that was not
on the payment's critical path.

**Propagated slowness.** Inventory degraded under load, and the slowness climbed all the way to the
checkout screen.

The migration to a queue solved both: the sale came to publish the decrement and conclude. Inventory
consumes at its own pace.

Five problems appeared in the first months, and all of them were among the responsibilities the team had
not implemented:

**A consumer stopped for 6 hours.** A defective deployment took the consumer down overnight. Nobody
noticed. Inventory was 6 hours stale, and sold-out products kept being sold.

**Duplicates.** A redelivery after a restart decremented stock twice for around 800 items. The consumer was
not idempotent.

**A poison message.** A sale with an unexpected field made the consumer fail and reprocess indefinitely.
The queue stopped for 90 minutes, with a single message blocking everything.

**Publishing outside the transaction.** In process crashes between writing the sale and publishing, the
decrement never happened. Rare, and it accumulated divergence.

**No reconciliation.** There was nothing comparing inventory with sales. The divergences from the four
items above only appeared in the physical stock count.

The fixes all came after the incident, and the team records the order that would have avoided the wear:

**A consumer lag alert** — half an hour of work, it would have caught the first and the third.

**Idempotency by sale identifier** — it would have caught the second.

**A dead-letter queue** with an attempt limit — the third.

**A transactional outbox** — the fourth.

**Daily reconciliation** between sales and inventory movements — the safety net for everything.

What the team learned: the decision to migrate to a queue was right and solved the problem that motivated
the change. The mistake was treating messaging as an "asynchronous call" — a change of mechanism — when it
is a set of new responsibilities that need to exist before the first message.

## Related Concepts

- [Messaging](/06-distributed-systems/messaging.md) — the fundamentals.
- [Event-Driven Integration](/08-integration-architecture/event-driven-integration.md).
- [Idempotency](/06-distributed-systems/idempotency.md).
- [Dead-Letter Queues](/06-distributed-systems/dead-letter-queues.md).

## Practical Exercise

For each asynchronous integration in your system, answer: is there an alert if the consumer stops?

Where there is not, calculate how long it would take until somebody noticed by the absence of the effect.
That number is your damage window.

## Interview Questions

- What kind of coupling does messaging remove, and which one does it keep?
- What new responsibilities does it transfer to you?
- Why is waiting for a response over a queue the worst of both worlds?

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — chapter 3.
- Stopford, Ben. *Designing Event-Driven Systems*. O'Reilly, 2018.
