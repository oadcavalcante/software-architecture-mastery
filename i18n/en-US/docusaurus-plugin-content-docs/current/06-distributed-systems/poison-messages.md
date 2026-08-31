---
id: poison-messages
title: Poison Messages
sidebar_position: 28
description: The message that never processes — and stalls the queue while it tries.
doc_type: concept
level: 4
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distinguishes transient from permanent failure in consumption and
  keeps a bad message from blocking processing.
prerequisites: [messaging]
related: [dead-letter-queues, retries, duplicate-messages]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Poison Messages

## Overview

A *poison message* is a message that fails on every processing attempt.

With no handling, it goes back to the queue indefinitely, consumes the consumer, and — in ordered
queues — **blocks all the messages that follow**.

It is the most common failure mode of newly adopted messaging systems, and the easiest to prevent.

## Problem

The consumer reads the message, tries to process it, throws an exception. It does not acknowledge.
The message becomes visible again. Another consumer reads it. The same exception.

Meanwhile, nothing else is processed — either because the message occupies the consumer in a loop,
or because the queue preserves ordering and it is next.

The system emits no visible error. From the outside, it looks like it is working: the consumer is
up, the broker is up, the queue simply **stops advancing**.

That is discovered hours later, typically by someone asking why an order was not processed.

## Core Concepts

### The causes

**Malformed data.** A field with an unexpected format, an invalid character, the wrong encoding.

**Schema change.** The producer started sending a format the consumer does not understand. See
[schema evolution](/08-integration-architecture/index.md).

**A defect in the consumer.** An unforeseen case that always throws.

**A permanently absent precondition.** The message references an entity that does not exist and
never will.

Note that the last is ambiguous: it can be disorder — the entity will still arrive — or permanent.
Distinguishing requires context the consumer does not always have.

### Transient versus permanent

The consumer's central decision on each failure: **will this work if I try again?**

| Failure | Nature |
|---|---|
| Database unavailable, network timeout | Transient — retry |
| External service with a 503 | Transient |
| Deserialization error | Permanent — do not retry |
| Business validation rejected it | Permanent |
| The referenced entity does not exist | Ambiguous |

Retrying a permanent failure is guaranteed waste. Treating a transient one as permanent discards
work that would have succeeded.

The consumer has to classify — and the "try three times and send to dead-letter" pattern treats them
all the same, which is acceptable as a safety net and bad as the only strategy.

### An attempt limit is mandatory

Every message needs a counter. After N attempts, it leaves the main queue for a
[dead-letter queue](/06-distributed-systems/dead-letter-queues.md).

With no limit, the loop is infinite. With a limit but no dead-letter, the message is discarded
silently — which trades a visible problem for an invisible one.

### The poisoning may not be in the message

A treacherous case: the message is correct and the consumer has a defect that only appears with that
content.

In that case, sending it to the dead-letter is the right behavior, and the analysis has to look at
the consumer, not the message. A batch of poison messages with the same pattern is a sign of that.

### Isolation of the blockage

In queues with no guaranteed ordering, a poison message occupies one consumer but does not prevent
the others from advancing. The impact is on capacity.

In queues with ordering per partition, it **blocks the whole partition**. All messages with the same
key stop.

That changes the urgency: in an ordered system, a poison message is an incident, not degradation.

## Mental Model

**Every message needs a way out of the queue** — through success or through giving up. Without the
second, it stays forever.

## When to Use

The handling is mandatory in any consumer. The decisions that remain:

- How many attempts before giving up.
- Whether to classify failures by nature or treat them all the same.
- Where the message goes when you give up.

## When Not to Use

**Retrying indefinitely.** It is never the answer.

**Discarding with no record.** It loses the information and hides the problem.

**Treating every failure as permanent.** It discards work that would have succeeded on the second
attempt.

**Treating every failure as transient.** It retries a deserialization error three times, with no
chance of success.

**With no alert.** A dead-letter queue nobody monitors is a graveyard.

## Alternatives

- **[Dead-letter queue](/06-distributed-systems/dead-letter-queues.md)** — the default answer.
- **Delayed retry queue** — for ambiguous failures, try again in hours instead of discarding.
- **Validation in the producer** — prevent the malformed message from entering. It is the
  prevention, and it does not remove the need for the handling.
- **Schema registry** — guarantee compatibility between producer and consumer.

## Trade-offs

| Few attempts | Many |
|---|---|
| Leaves the queue fast | Occupies it longer |
| A long transient failure becomes a dead-letter | More chance of success |
| Less resource consumption | More |

| Classify the failure | Treat them all the same |
|---|---|
| No useless retries | Simple |
| Requires mapping the errors | Nothing to maintain |
| Leaves faster in the permanent case | Always N attempts |

## Failure Modes

**Infinite loop.** With no attempt limit.

**Blocked partition.** In an ordered queue, everything with the same key stops.

**Silent discard.** With no dead-letter and no record.

**Unmonitored dead-letter.** The messages go there and nobody looks.

**Retrying a deserialization error.** Three guaranteed-useless attempts.

**Mass poisoning.** A schema change poisons every message at once, and the dead-letter receives
thousands.

## Common Mistakes

**Not configuring an attempt limit.**

**Not distinguishing transient from permanent.**

**Not alerting on the dead-letter.**

**Not recording the content and the error.** Without that, diagnosing requires reproducing.

**Not testing the failure path.** It is the path that only happens when something is wrong.

## Real-World Example

An order event consumer handled the tax integration.

An order with a control character in the notes field made the serialization of the tax payload throw
an exception.

The queue had ordering per partition, partitioned by branch. The poison message blocked that
branch's partition.

Nine hours of stopped issuance. It was discovered when the branch called asking why no invoices were
coming out.

The consumer was up. The broker was up. There was no error on any dashboard — only a partition that
was not advancing, and there was no metric for the oldest message's age per partition.

Four fixes.

**Dead-letter after three attempts**, with the original content and the error recorded.

**Failure classification:** serialization and validation errors go straight to the dead-letter, with
no retries. Network and database failures try three times.

**A double alert:** any message in the dead-letter raises a notice, and the oldest message's age per
partition above 15 minutes raises an alert.

**Sanitization in the producer.** Control characters came to be removed at the source — the
prevention, which does not replace the handling.

Over the following two years, the dead-letter received 34 messages. All were analyzed in minutes,
and none blocked anything.

The later assessment points out: the four fixes cost one day of work, and all of them were in the
queue service's documentation. The nine-hour incident was entirely avoidable with a standard
best-practice configuration.

## Related Concepts

- [Dead-Letter Queues](/06-distributed-systems/dead-letter-queues.md) — where the message goes.
- [Retries](/06-distributed-systems/retries.md) — the failure classification.
- [Messaging](/06-distributed-systems/messaging.md) — the channel.
- [Ordering](/06-distributed-systems/ordering.md) — why the blockage is worse with ordering.

## Practical Exercise

For each consumer in your system, check: is there an attempt limit? Is there a dead-letter? Is there
an alert on it?

Then deliberately publish a malformed message in a test environment and observe. If the queue
stalls, you reproduced the incident before it happened.

## Interview Questions

- What happens to a message that always fails, with no handling?
- How do you distinguish transient from permanent failure in consumption?
- Why is the blockage more serious in an ordered queue?

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003 — the *Dead Letter Channel*
  pattern.
- Nygard, Michael. *Release It!* 2nd ed., 2018.
