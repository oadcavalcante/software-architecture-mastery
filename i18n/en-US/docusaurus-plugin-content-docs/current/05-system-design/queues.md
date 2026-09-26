---
id: queues
title: Queues
sidebar_position: 11
description: Decoupling in time, and the three guarantees a queue forces you to handle.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader decides when a queue pays for itself and handles duplication,
  ordering and poison messages before production.
prerequisites: [request-response]
related: [background-processing, rate-limiting, event-driven]
canonical_for: []
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Queues

## Overview

A queue receives messages from a producer and delivers them to a consumer, which processes
them at its own pace.

What it buys is **temporal decoupling**: the producer does not depend on the consumer's
availability. What it charges are three guarantees that become the application's
responsibility, and that are almost always discovered in production.

## Problem

A synchronous call ties producer and consumer together in time. If the consumer is down,
the producer is down. If the consumer is slow, the producer becomes slow. A peak on the
producer becomes a peak on the consumer.

The queue cuts that: the producer publishes and moves on; the queue absorbs; the consumer
processes when it can.

The common error is not adopting a queue, but adopting it without recognizing that **the
channel is a network**, and that a network brings duplication, disorder and messages that
never process.

## Core Concepts

### What the queue absorbs

**Consumer unavailability.** Messages pile up; nothing is lost.

**A difference in pace.** The producer can publish faster than the consumer processes, for a
while.

**A peak.** The queue grows instead of the system going down. It is the containment that
preserves the work: rate limiting and load shedding cost less to operate (no new component),
but they refuse requests.

None of the three is infinite: the queue has a limit, and what happens when it is reached
has to be decided. See
[backpressure](/06-distributed-systems/backpressure.md).

### The three guarantees you inherit

**Duplication.** Practically every queue system delivers
[at least once](/06-distributed-systems/delivery-guarantees.md). That means the same
[message can arrive twice](/06-distributed-systems/duplicate-messages.md): through a retry,
through a failed acknowledgment, through consumer rebalancing.

The consequence: **the consumer has to be idempotent whenever the effect is observable
outside the system or irreversible** (a charge, an email, an issued invoice). Processing
twice has to have the same effect as processing once. Without that, one charge becomes two.
Where the duplicated effect is harmless and cheap, the criterion is in
[idempotency](/06-distributed-systems/idempotency.md).

**Ordering.** Partitioned queues guarantee
[ordering within a partition](/06-distributed-systems/ordering.md), not across them. If
`OrderCreated` and `OrderCancelled` land in different partitions, they can arrive out of
order.

The usual mitigation is to partition by the entity's key (all of an order's events in the
same partition), which preserves the ordering that matters at the cost of imbalance if one
key is very active.

**[Poison message](/06-distributed-systems/poison-messages.md).** A message that always
fails goes back to the queue, indefinitely. With no ordering guarantee, it occupies one
consumer in a loop and the cost is capacity; with ordering per partition, the whole
partition stops. It is what requires a
[dead-letter queue](/06-distributed-systems/dead-letter-queues.md): after N attempts, the message goes to
a separate queue, with an alert.

With no dead-letter configured, the first malformed record only leaves the queue through
manual intervention.

### Acknowledge after processing

The consumer acknowledges the message **after** processing it successfully. Acknowledging
before processing turns at-least-once into at-most-once: if processing fails, the message is
lost. That is a deliberate choice where losing samples is acceptable (telemetry, aggregated
metrics) and an accident everywhere else. See
[delivery guarantees](/06-distributed-systems/delivery-guarantees.md).

The visibility timeout (how long the queue waits before redelivering) has to be longer than
the processing time. If it is shorter, the message is redelivered while it is still being
processed, and the result is guaranteed duplication.

### The queue hides the problem until it does not

A growing queue is a symptom, not a solution. If the consumer is permanently slower than the
producer, the queue only postpones the collapse.

Monitoring **depth and the age of the oldest message** is what turns that into an alert
before it becomes an incident.

## Mental Model

**A queue trades "failure now" for "delay now, and maybe failure later".** That is good when
the delay is acceptable and bad when it merely hides an incapacity.

## When to Use

- The producer does not need the result to continue.
- The consumer can process with a delay.
- You need to absorb a peak.
- The consumer is less available than the producer.
- The work is slow and does not fit in a request.

## When Not to Use

**When the response is necessary.** If the caller needs the result, the queue adds complexity
without removing the wait.

**When the consumer is not idempotent and cannot be.** The duplication will happen.

**When strong consistency is a requirement.** A queue implies eventual consistency.

**For one fixed consumer and one producer, both available.** A direct call is simpler and
more traceable.

**With no dead-letter and no depth monitoring.** That is adopting the risk without the
instrument.

## Alternatives

- **Synchronous call**: when the response matters.
- **[Background processing](/05-system-design/background-processing.md) in the same process**:
  for light work, with no additional component.
- **A table as a queue**: for low volume, using the database you already have avoids one more
  piece to operate.
- **A published event**: when there are several interested parties, not one consumer. See
  [event-driven architecture](/03-design-patterns/event-driven.md).

## Trade-offs

| With a queue | Direct call |
|---|---|
| Producer independent of consumer | Coupled in time |
| Peak absorbed | Propagated |
| Automatic retry | Manual |
| Duplication and ordering to handle | Simple semantics |
| Fragmented flow | Traceable |
| Eventual consistency | Transactional |
| One more component to operate | None |

## Failure Modes

**Non-idempotent consumer.** Duplicated effect: a charge, an email, a debit.

**No dead-letter.** One bad message stalls the queue.

**Acknowledgment before processing.** Silent loss.

**Visibility shorter than the processing time.** Systematic duplication.

**Queue growing with no alert.** Discovered by the user.

**Queue as a database.** Messages accumulated for later querying — not the purpose and it
does not have the guarantees.

## Common Mistakes

**Adopting it without idempotency.** The duplicated effect is external and no deploy undoes
it: in the example below, it meant cancelling invoices with the tax authority, one by one.

**Not configuring a dead-letter.** The message that always fails occupies a consumer in a
loop, and getting it out of the queue becomes manual intervention under pressure.

**Not monitoring depth and age.** The backlog is discovered through the missed deadline, not
on the dashboard.

**Assuming global ordering.** The cancellation is processed before the creation, and the
order stays active after being cancelled.

**Publishing inside the transaction with no outbox.** The transaction fails and the message
was already published, or vice versa. See
[domain event](/04-domain-driven-design/domain-event.md).

## Real-World Example

A billing system moved invoice issuance to a queue, because the tax authority's service was
unstable and was taking down order confirmation.

It worked for three weeks. Then, three incidents in a row.

**Duplicate invoices.** The tax authority's service took longer than the configured
visibility timeout. The message was redelivered while it was still being processed, and two
invoices were issued for the same order. Fixing it required cancellation with the tax
authority, one by one.

**Stalled queue.** An order with an invalid character in the address made the consumer throw
an exception. The message went back to the queue and was reprocessed indefinitely, consuming
the whole consumer. Nine hours of stopped issuance until somebody investigated.

**Silent backlog.** The tax authority was down over a weekend. The queue grew to 40 thousand
messages. Nobody noticed because there was no alert. The problem appeared on Monday, when
the legal deadline for some invoices was close.

The fixes, all known beforehand and none implemented:

An idempotency key per order, checked before issuing. The visibility timeout went up to twice
the 99th percentile of processing time.

Dead-letter after three attempts, with an alert. The problematic message leaves the queue in
minutes, and the rest continue.

An alert for depth above a thousand and for the oldest message's age above 15 minutes.

The queue was right as a decision. What was missing was handling two of the guarantees it
inherits (duplication and poison messages) and instrumenting depth before going live; all
three were in the queue service's documentation.

## Related Concepts

- [Request/Response](/05-system-design/request-response.md): the model the queue replaces.
- [Background Processing](/05-system-design/background-processing.md): the consumer.
- [Distributed Systems](/06-distributed-systems/index.md): idempotency, ordering,
  dead-letter, backpressure.
- [Rate Limiting](/05-system-design/rate-limiting.md): controlling the consumption pace.

## Practical Exercise

For each queue in your system, answer: is the consumer idempotent? Is a dead-letter
configured? Is the visibility timeout longer than the worst processing time? Is there a depth
alert?

Every "no" is one of the three incidents above waiting to happen.

## Interview Questions

- Which guarantees does a queue force you to handle?
- Why does the consumer have to be idempotent?
- What happens with no dead-letter queue?

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
