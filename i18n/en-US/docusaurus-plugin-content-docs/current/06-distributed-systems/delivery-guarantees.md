---
id: delivery-guarantees
title: Delivery Guarantees
sidebar_position: 25
description: At most once, at least once, exactly once — and why the third is not what it seems.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader understands why exactly-once is an end-to-end property
  and not a tool feature.
prerequisites: [messaging, idempotency]
related: [idempotency, duplicate-messages, ordering]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Delivery Guarantees

## Overview

Three possible guarantees when a message crosses the network:

**At most once** — it can be lost, it never duplicates.
**At least once** — it is never lost, it can duplicate.
**Exactly once** — it neither loses nor duplicates.

The third is the desired one, is advertised by several tools, and **does not exist as a property of
the channel**. Understanding why is what keeps you from building systems on a guarantee that is not
there.

## Problem

The choice between the first two is straightforward and comes from the nature of the network.

If the producer does not wait for an acknowledgment, the message can be lost: **at most once**.

If it resends until acknowledged, it is never lost — and the acknowledgment can be lost, causing a
resend of something already delivered: **at least once**.

There is no third option at the channel level. It is a direct consequence of the
[third outcome](/06-distributed-systems/distributed-fundamentals.md): when the acknowledgment does
not arrive, the producer does not know whether the message arrived.

The temptation is to look for a tool that solves it. It cannot — the problem belongs to the
protocol, not to the implementation.

## Core Concepts

### Why exactly-once is not deliverable

To not duplicate, the producer would have to know whether the message arrived. To know, it would
need the acknowledgment. If the acknowledgment is lost, it does not know.

Any decision it makes — resend or not — can be wrong.

That is not an engineering limitation. It is the same result that makes
[idempotency](/06-distributed-systems/idempotency.md) necessary.

### What the tools actually offer

Systems that advertise "exactly once" offer one of two things:

**Deduplication in the broker.** The producer sends an identifier; the broker discards repetitions
within a window. That solves duplication **in delivery to the broker**, not in processing by the
consumer.

**Transactional processing.** Reading, processing and committing the read offset in a single
transaction — possible when the read and the write are in the same system.

The second is genuine and limited: it holds while the effect does not leave the system. The moment
the consumer calls an external service or writes to another database, the guarantee ends — because
that call does not participate in the transaction.

And that is exactly what real consumers do.

### Exactly-once is end to end

The correct formulation: **at-least-once delivery, plus idempotent processing, produces an
exactly-once effect.**

```text
channel: at least once   →  the message can arrive N times
consumer: idempotent     →  the effect happens 1 time
                            ─────────────────
                            exactly-once effect
```

The guarantee is not in the channel — it is in the composition. And the part the application
controls is the idempotency.

That is the reason idempotency is the central concept of this level.

### At most once has a legitimate use

It is frequently dismissed and it has a place: high-volume telemetry, aggregated metrics, presence
signals.

Losing a few samples among millions changes no conclusion, and the cost of guaranteeing delivery —
acknowledgment, retries, durable storage — is disproportionate.

Choosing **at most once** deliberately, where the loss is acceptable, is a legitimate architectural
decision and is rarely considered.

### Where messages are lost in practice

Loss almost never comes from the broker. It comes from the seams, and they are few and well known:

**Publishing with no acknowledgment.** The producer sends and moves on without waiting for the ack.
If the broker did not persist it, the message does not exist and nobody knows.

**Acknowledging the read before processing.** The consumer marks the message as processed on
receipt, and then fails to process it. That is the default in several libraries, and it is the most
common cause of silent loss.

**In-memory buffering.** The producer accumulates messages to send in a batch and the process
terminates. The batch vanishes.

**Persistence with no replication.** The broker acknowledged, wrote to a single node, and that node
failed.

Auditing those four seams in your system finds more loss than any change of nominal guarantee.

## Mental Model

**The channel chooses between losing and duplicating. You choose to make the duplication harmless.**

## When to Use

**At least once** — the default. Almost every business case, with an idempotent consumer.

**At most once** — when the loss is acceptable and the volume makes the guarantee expensive:
telemetry, metrics, ephemeral signals.

**Broker deduplication** — as an additional layer, reducing the frequency of duplication without
replacing idempotency.

## When Not to Use

**Trusting the tool's "exactly once".** Read the guarantee's scope: it almost always covers the leg
up to the broker, not the final effect.

**At least once with no idempotency.** It is adopting guaranteed duplication.

**At most once for business data.** Losing a charge is not acceptable.

**Depending on a transaction across systems.** A consumer that writes to another database or calls
an external service has left the transactional scope.

## Alternatives

There is no alternative to the three guarantees — what exists is where to place the responsibility:

- **Idempotency in the consumer** — the default answer and the one that always works.
- **Deduplication by key** — check whether it has already been processed before applying.
- **Commutative operations** — if order and repetition do not matter, the problem disappears.
- **Reconciliation** — accept divergence and correct it through a separate process.

## Trade-offs

| At most once | At least once |
|---|---|
| No duplication | Duplication guaranteed eventually |
| Loss possible | No loss |
| No acknowledgment, faster | Acknowledgment and retries |
| Simple consumer | Has to be idempotent |
| Suitable for disposable data | Suitable for business data |

## Failure Modes

**Duplication with a non-idempotent consumer.** A double charge, a duplicate email, stock debited
twice.

**Loss from premature acknowledgment.** The consumer acknowledges before processing.

**Trust in a misunderstood guarantee.** The tool promises exactly once; the external effect
duplicates anyway.

**A short deduplication window.** A retry after the window produces a duplicate.

**Loss from the absence of an outbox in the producer.** The message never reaches the broker.

## Common Mistakes

**Assuming the tool solves it.** No broker delivers exactly once end to end: it guarantees its own
leg, and the effect on your database remains your responsibility.

**Not reading the scope of the advertised guarantee.** "Exactly once" usually holds within the
system itself, between partitions it controls, and not for a consumer that writes to an external
database.

**Treating idempotency as optional.** It is what turns at-least-once into a single effect, and it is
the only defense that does not depend on any infrastructure promise.

**Not considering at most once where it would fit.** Telemetry and metrics tolerate loss, and
accepting that explicitly eliminates retries, deduplication and state storage — a large saving that
is rarely evaluated.

**Acknowledging before processing.** Acknowledging receipt and then failing converts at-least-once
into at-most-once with nobody having decided it, and the message is lost silently.

## Real-World Example

A team migrated payment event processing to a platform that advertised exactly-once semantics, and
removed the consumer's idempotency check — "the platform guarantees it".

It worked for four months.

The consumer read the event, called the acquirer's API to capture the payment, and wrote the result
to a separate relational database.

The platform's guarantee covered reading and committing the offset within it. The call to the
acquirer and the write to the external database **did not participate** in that transaction.

During a network failure, the consumer captured the payment successfully, and the offset commit
failed. The message was redelivered. The consumer captured it again.

217 payments captured twice in one day.

A careful reading of the documentation — done after the incident — made the scope clear: the
guarantee holds for the platform's internal flow, and external systems require idempotency on the
application's side.

The fix restored the removed check, now with an idempotency key sent to the acquirer, and added a
local check before the call.

What the team recorded as the main lesson was not technical: **"exactly once" on a product page is
a claim with a scope, and the scope is in the technical documentation.** Removing a protection based
on the marketing was the decision that caused the incident.

## Related Concepts

- [Idempotency](/06-distributed-systems/idempotency.md) — what makes at-least-once safe.
- [Duplicate Messages](/06-distributed-systems/duplicate-messages.md) — the practical handling.
- [Messaging](/06-distributed-systems/messaging.md) — the channel.
- [Partial Failure](/06-distributed-systems/partial-failure.md).

## Practical Exercise

For each message consumer in your system, answer: what happens if the same message is processed
twice?

If any effect leaves the system — an external call, a write to another database — the tool's
guarantee does not cover it, regardless of what it advertises.

## Interview Questions

- Why does exactly-once not exist at the channel level?
- What do the tools that advertise it actually offer?
- When is at most once the correct choice?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Helland, Pat. *Idempotence Is Not a Medical Condition*. ACM Queue, 2012.
