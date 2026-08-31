---
id: dead-letter-queues
title: Dead-Letter Queues
sidebar_position: 29
description: Where the messages that could not be processed go — and why it needs an owner.
doc_type: concept
level: 4
difficulty: intermediate
status: complete
objective: >
  By the end, the reader configures a dead-letter with enough context for diagnosis
  and defines the handling process.
prerequisites: [poison-messages]
related: [poison-messages, retries, observability]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Dead-Letter Queues

## Overview

A dead-letter queue receives the messages that could not be processed after the configured attempts.

It exists to give the poison message **a way out** of the main queue, without discarding it.

And it only serves its purpose if someone looks. A dead-letter with no alert and no owner is a
graveyard that gives the impression of handling.

## Problem

With no dead-letter, a message that always fails has two bad destinations: retrying indefinitely —
blocking — or being discarded — losing.

The dead-letter gives the third: leaving the queue and being kept for analysis.

The problem it creates is organizational: **messages pile up there and nobody notices**. That is
common and worse than it looks, because each message represents a business operation that did not
happen — an order not invoiced, a charge not issued, a notification not sent.

## Core Concepts

### What has to go along with the message

A message alone in the dead-letter is hard to diagnose. The necessary context:

**The original content**, unchanged.

**The error** — the exception, the message, the stack trace.

**How many attempts** and when.

**Which queue and which consumer** it came from.

**The correlation identifier**, to tie it back to the original operation's logs.

Without the last three, the analysis starts by reconstructing what happened — which is the work the
context exists to avoid.

Several brokers add part of that automatically in message attributes; it is worth checking what
yours adds and supplementing what is missing.

### It needs an alert and an owner

**Alert.** Any message in the dead-letter should notify. In high-volume systems, a threshold; in
business systems, the first message already deserves attention.

**Owner.** Someone answers for analyzing them. Without that, the alert becomes ignored noise.

The question that reveals whether the process exists: *how many messages are in the dead-letter
right now, and for how long?* If nobody can answer, the mechanism is configured and not working.

### Reprocessing requires idempotency

After fixing the cause, the dead-letter's messages are sent back to the main queue.

That is reprocessing — and some of them may have been **partially processed** before failing. If the
consumer wrote something and failed afterwards, reprocessing duplicates.

See [idempotency](/06-distributed-systems/idempotency.md) and
[duplicate messages](/06-distributed-systems/duplicate-messages.md). Reprocessing without them
trades one problem for another.

### One dead-letter per queue, not a global one

A dead-letter shared among several consumers makes reprocessing harder: you have to know which queue
each message goes back to.

One per queue keeps the association obvious and allows different policies per consumer.

### It is not long-term storage

Messages sit there to be analyzed and resolved, not stored. A retention period avoids indefinite
accumulation — and it forces the process to exist, because the message disappears if nobody acts.

The period has to be generous enough to cover a weekend and a holiday.

### After analysis, there are three destinations

A message in the dead-letter is not the end of the process — it is the beginning of a decision
someone has to make:

**Discard.** The message is invalid and there is nothing to do. Record the discard; a dead-letter
emptied with no record erases the evidence of the problem.

**Fix the message and reprocess.** A malformed field at the source. It requires an editing tool and
an audit trail of who changed what.

**Fix the code and reprocess.** The most common case. The message was right and the consumer had a
defect.

The third case is what justifies keeping the original message intact: after the fix, the
reprocessing needs the data as it arrived, not as the defective consumer interpreted it.

Without those three paths defined and owned, the dead-letter becomes a dump.

## Mental Model

**The dead-letter is an inbox, not an archive.** If it is never emptied, the process does not exist.

## When to Use

- Every message consumer.
- Especially where the message represents a business operation.
- Where the queue is ordered — the blockage is more serious.

## When Not to Use

**With no alert.** Configuring the dead-letter and not monitoring gives a false sense of handling.

**As a permanent destination.** Messages have to be resolved.

**Shared between different consumers.** It makes reprocessing harder.

**With no retention.** It accumulates indefinitely.

**For transient failures.** A database outage should not send messages to a dead-letter — there
should be retries with [backoff](/06-distributed-systems/backoff.md). If the dead-letter fills during
a dependency outage, the failure classification is wrong.

## Alternatives

- **Delayed retry queue** — for ambiguous failures, try again in hours instead of giving up.
- **Discard with a record** — when the message is genuinely disposable and the volume makes analysis
  unviable. It has to be an explicit decision.
- **A pending items table** — instead of a queue, write to a database with an analysis interface.
  Better when the handling involves a human decision.

The last is underestimated: for messages that require a business decision, a screen is better than a
queue.

## Trade-offs

| With a dead-letter | Without |
|---|---|
| The queue does not block | It blocks or loses |
| The message is preserved for analysis | Lost |
| One more queue to operate and monitor | Fewer pieces |
| Requires a handling process | Nothing to do |

## Failure Modes

**Silent accumulation.** With no alert, nobody notices.

**No context.** The message is there and nobody knows why it failed.

**Reprocessing duplicating.** With no idempotency.

**Filling from transient failures.** The wrong classification sends messages that would have
succeeded.

**Retention expiring before the analysis.** The message disappears before anyone looks.

**A dead-letter of the dead-letter.** The reprocessing fails again and comes back — with no limit, it
is a slower loop.

## Common Mistakes

**Configuring it and not alerting.** The queue fills in silence and the discovery happens when a
customer complains about an order that vanished, weeks later.

**Not including the error along with the message.** Without the exception, the timestamp and the
attempt it failed on, whoever investigates has to reproduce the problem to find out what happened —
and frequently cannot.

**Not defining an owner.** A dead-letter queue with no named owner is emptied by nobody; it becomes a
graveyard everybody sees on the dashboard and nobody opens.

**Reprocessing with no idempotency.** The message ended up there because it failed after a partial
effect. Resending it with no protection repeats the effect that succeeded and duplicates a charge,
stock or a notification.

**Not measuring how long the messages have been there.** The count does not distinguish five
messages from today from five stuck for two months, and those are completely different situations.
The oldest one's age is the useful metric.

## Real-World Example

A subscriptions system had dead-letters configured on all seven queues — a best practice followed
correctly.

None had an alert.

During a schema migration, the producer started sending a field with a different type. The
subscription renewal consumer failed on deserialization and sent messages to the dead-letter.

That lasted 23 days.

4,100 renewals unprocessed. Subscriptions expired with no charge, access was suspended, and
customers called — which finally led someone to investigate.

The discovery came from looking at the dead-letter and finding 4,100 messages, the oldest three
weeks old.

The reprocessing had its own problem: some renewals **had been partially processed** — the charge was
made and the subscription update failed. Reprocessing charged 180 customers again.

The fixes, in order of importance:

**An alert on the first message.** In a business system, one message in the dead-letter is an
anomaly, not a statistic.

**An age metric.** A dashboard with the count and the oldest message's age per queue.

**Idempotency in the renewal consumer**, with a key per subscription and period — which would have
prevented the double charge during reprocessing.

**A schema registry** between producer and consumer, preventing an incompatible change from being
published.

The recorded lesson: the dead-letter did exactly what it should — it prevented the queue from
blocking and preserved the messages. What was missing was the organizational half of the mechanism.

## Related Concepts

- [Poison Messages](/06-distributed-systems/poison-messages.md) — what goes there.
- [Idempotency](/06-distributed-systems/idempotency.md) — necessary to reprocess.
- [Retries](/06-distributed-systems/retries.md) — the classification that decides what goes.
- [Observability](/13-observability/index.md) — alerts and metrics.

## Practical Exercise

Find out, right now, how many messages are in your system's dead-letter queues and for how long.

If you cannot answer in a minute, the mechanism is configured and is not being used.

## Interview Questions

- What has to accompany the message in the dead-letter?
- Why does reprocessing require idempotency?
- Why should transient failures not reach the dead-letter?

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — actionable alerts.
