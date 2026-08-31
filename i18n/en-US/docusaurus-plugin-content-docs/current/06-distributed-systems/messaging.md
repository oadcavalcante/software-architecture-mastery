---
id: messaging
title: Messaging
sidebar_position: 19
description: Communication through durable messages — the models, and what the channel does and does not guarantee.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses between a queue and an event log based on the consumption
  pattern, and knows the channel's real guarantees.
prerequisites: [partial-failure]
related: [delivery-guarantees, ordering, event-driven-systems]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Messaging

## Overview

Messaging is communication through messages brokered by a durable component, instead of direct
calls.

It decouples producer and consumer in time. And it introduces a set of guarantees — and of absences
of guarantee — that have to be known before adopting, not discovered in production.

## Problem

A direct call couples in time: if the destination is down, the origin is down.

Messaging solves that, and the choice of **which model** is usually made by the available tool
instead of by the consumption pattern — which produces systems where the model does not match the
usage.

The two models have distinct semantics, and confusing them creates expectations the channel does
not meet.

## Core Concepts

### Queue versus event log

| | Queue | Event log |
|---|---|---|
| Consumed message | Disappears | Remains |
| Consumers | Compete for the message | Each one reads everything |
| Reprocessing history | Impossible | Reposition and reread |
| Ordering | Fragile with several consumers | Guaranteed per partition |
| Read position | The broker's | The consumer's |
| Typical use | Distributing work | Distributing facts |

**A queue** models work: one task, one worker. Several consumers compete, and scaling is adding
consumers.

**A log** models facts: the event happened and several interested parties react, each at their own
pace, each with their own position.

The wrong choice shows up like this: using a queue when several systems need the same event — and
ending up creating one queue per consumer, with the producer publishing N times. Or using a log to
distribute work — and having to coordinate who processes what.

### The channel is a network

Regardless of the model, the channel inherits the problems of
[network failure](/06-distributed-systems/network-failure.md), and that produces three guarantees
the application has to handle:

**[At-least-once delivery](/06-distributed-systems/delivery-guarantees.md)** — duplication will
happen.

**[Ordering only per partition](/06-distributed-systems/ordering.md)** — there is no global
ordering.

**Messages that always fail** — they need a
[dead-letter queue](/06-distributed-systems/dead-letter-queues.md).

None of those is optional. Adopting messaging without handling them is adopting the risk without the
mechanism.

### Acknowledgment and visibility

The consumer acknowledges **after** processing successfully. Acknowledging first loses the message
if the processing fails.

Between delivery and acknowledgment, the message is invisible to other consumers for a period. If
that period is shorter than the processing, the message is redelivered while it is still being
processed — systematic duplication.

That value has to be calibrated from the high percentile of the processing time, not estimated.

### The producer has a problem too

Publishing a message and writing to the database are not atomic. It can write and not publish, or
publish and fail to write.

The solution is the **outbox** pattern: the message is written to a table in the same transaction as
the data, and a separate process publishes it. See
[domain event](/04-domain-driven-design/domain-event.md).

Ignoring that produces silent message loss — the failure mode hardest to diagnose, because there is
no error anywhere.

### Push and pull

**Push** — the broker sends to the consumer. Low latency, and the consumer can be overloaded if
there is no flow control. See
[backpressure](/06-distributed-systems/backpressure.md).

**Pull** — the consumer fetches when it can. Natural pace control, at the cost of interval latency.

Most modern systems use pull with long polling: the consumer asks, and the connection stays open
until there is a message or it expires. It combines pull's control with push's latency.

## Mental Model

**A queue distributes work. A log distributes facts.** The question is whether the message is a task
for someone or an occurrence for whoever is interested.

## When to Use

- The producer does not need the response.
- The consumer can process with a delay.
- You need to absorb a peak.
- Several parties are interested in the same fact — there, a log.
- The work is slow and does not fit in a request.

## When Not to Use

**When the response is necessary.** See
[request/response](/05-system-design/request-response.md).

**With no idempotency in the consumer.** The duplication will happen.

**With no dead-letter.** One bad message stalls consumption.

**With no outbox, when the message represents a persisted fact.** Silent loss.

**As a database.** A log with infinite retention used for querying has neither the guarantees nor
the indexes of a database.

**When strong consistency is a requirement.** Messaging implies eventual consistency.

## Alternatives

- **Synchronous call** — when the response matters.
- **A table as a queue** — for low volume, using the existing database avoids one more component to
  operate.
- **Direct call with retries** — when there is one consumer and it is reliable.
- **Scheduled processing** — when the tolerated latency is high.

## Trade-offs

| With messaging | Direct call |
|---|---|
| Producer independent of consumer | Coupled in time |
| Peak absorbed | Propagated |
| A new consumer without touching the producer | Touches it |
| Duplication, ordering, dead-letter to handle | Simple semantics |
| Fragmented flow | Traceable |
| One more component to operate | None |

## Failure Modes

**Non-idempotent consumer.** Duplicated effect.

**Loss from the absence of an outbox.** The transaction committed, the message was not published.

**Visibility shorter than the processing.** Systematic duplication.

**Silent backlog.** The queue grows and nobody notices.

**Consumer slower than the producer.** The queue only postpones the collapse.

**Badly configured retention.** In a log, messages expire before a slow consumer reaches them.

## Common Mistakes

**Choosing the model by the available tool.** Queues and event logs solve different problems — work
to be executed once versus a fact many read at their own pace. Using whatever is already installed
for both forces one of the two cases into the wrong shape.

**Not calibrating the visibility timeout.** If it is shorter than the processing time, the message
reappears for another consumer while the first is still working — and the effect happens twice.

**Not monitoring depth and the oldest message's age.** The two measure distinct things: depth flags
an input spike, age flags a stalled consumer. A queue with ten messages stuck for two hours is more
serious than one with ten thousand draining.

**Publishing inside the transaction with no outbox.** The database and the broker do not share a
transaction: one can commit and the other fail, and the result is an event with no fact or a fact
with no event.

**Using the log as query storage.** It is optimized for sequential reading by position. Asking "what
is order X's current state" requires scanning, and the answer gets worse as the history grows.

## Real-World Example

A logistics system used a queue to notify four areas about completed deliveries: billing, support,
analytics and the customer.

Since a queue delivers to one consumer, the solution was for the producer to publish to four
separate queues.

Three problems appeared.

**Coupling in the producer.** Adding a fifth interested party required changing the deliveries
service and deploying it. Over two years, that happened three times.

**Partial publication.** Publishing to four queues is not atomic. During a momentary broker outage,
messages went to two queues and not to the other two — and billing processed deliveries support
never knew existed.

**Reprocessing impossible.** When analytics needed to recompute six months of metrics, there was no
way: the messages had been consumed and no longer existed.

The migration to an event log solved all three.

The producer publishes **once**, to a topic. Each consumer reads everything, with its own position.
The fifth interested party was added without touching the producer.

Single publication with an outbox eliminated the partiality.

And reprocessing became repositioning the read — analytics recomputed six months in two hours,
reading the retained history.

What the team learned: the queue was not wrong as a technology. It was wrong as a **model** — the
case was distribution of facts, not of work, and the symptom of having chosen wrong was having to
publish N times.

## Related Concepts

- [Delivery Guarantees](/06-distributed-systems/delivery-guarantees.md) — what the channel promises.
- [Ordering](/06-distributed-systems/ordering.md) and
  [Duplicate Messages](/06-distributed-systems/duplicate-messages.md).
- [Dead-Letter Queues](/06-distributed-systems/dead-letter-queues.md).
- [Queues](/05-system-design/queues.md) — the system design view.

## Practical Exercise

For each use of messaging in your system, answer: is the message work for someone or a fact for
whoever is interested?

If it is a fact and you use a queue, check how many queues the producer has to feed. More than one
is the symptom.

## Interview Questions

- What is the semantic difference between a queue and an event log?
- Why is the outbox pattern necessary?
- What happens if the visibility timeout is shorter than the processing time?

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 11.
