---
id: enterprise-integration-patterns
title: Enterprise Integration Patterns
sidebar_position: 11
description: The vocabulary that describes what routers, translators and aggregators do — independent of technology.
doc_type: reference
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader names the pieces of an integration flow precisely and
  recognizes which pattern solves which problem.
prerequisites: [messaging-integration]
related: [messaging-integration, event-driven-integration, integration-anti-corruption]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Enterprise Integration Patterns

## Overview

Hohpe and Woolf's *Enterprise Integration Patterns* catalog names the recurring pieces of asynchronous
integration flows.

It is over twenty years old and remains valid because it describes **problems**, not technologies. The
names it fixed — router, translator, aggregator, splitter — are the vocabulary with which integration is
discussed without talking about a product.

This document is a reference: what each relevant pattern solves, and where it costs. It is not meant to be
read in one sitting.

## Why the vocabulary matters

With no names, integration discussions become implementation descriptions: "then we read from the queue,
look at the type field, and send it to one of three queues".

With names: "it is a content-based router".

The saving is not in words. It is that the name carries the known failure modes — whoever says "aggregator"
already knows they need to decide the completion criterion and the time limit.

## Channels

How the messages travel.

**A point-to-point channel.** One message, one consumer. It is the queue. It distributes work.

**A publish-subscribe channel.** One message, all subscribers. It is the topic. It notifies.

**An invalid message channel.** A destination for messages that cannot be interpreted — a broken format, an
unknown schema. Distinct from the next one.

**A dead letter channel.** A destination for valid messages that failed in processing. See
[dead-letter queues](/06-distributed-systems/dead-letter-queues.md).

The distinction between the last two is useful and rarely made: a message that is **not understood** and a
message that **could not be processed** require different handling — the first is a contract problem, the
second an execution one.

**A guaranteed channel.** It persists the message before acknowledging receipt.

## Routing

How the message reaches whoever should handle it.

**A content-based router.** It examines the message and chooses the destination. It is the most used
pattern, and the one that accumulates the most business rules — the same vigilance described in
[API gateways](/08-integration-architecture/api-gateways.md) applies.

**A filter.** It discards what does not interest that consumer.

**A splitter.** It breaks a composite message into several. An order with five items becomes five messages.

**An aggregator.** The inverse: it joins several messages into one. It is the pattern with the most
decisions to make:

```text
correlation   how to know these messages form a set
completion    when the set is complete — a count, time, a signal
time limit    what to do if it never completes
ordering      whether arrival order matters
```

The third line is the one that gets forgotten, and the result is an aggregator that holds incomplete sets
forever, consuming memory.

**A resequencer.** It restores the order of messages that arrived out of sequence. See
[ordering](/06-distributed-systems/ordering.md) — including the buffer cost and the gap deadline.

**A recipient list.** It sends the same message to a computed list.

**Scatter-gather.** It sends to several processors and gathers the responses. It combines a recipient list
with an aggregator, and inherits the problems of both.

## Transformation

How the message changes shape.

**A message translator.** It converts from one format to another. It is the
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md)'s piece.

**A content enricher.** It adds data fetched from somewhere else. The hidden cost: it introduces a
synchronous dependency in the middle of an asynchronous flow — if the enrichment source goes down, the flow
stops.

**A content filter.** It removes fields. Useful for not propagating sensitive data downstream.

**A normalizer.** It converts messages from different formats into a common one. It is what allows four
suppliers to be handled with a single processing path.

**A claim check.** It stores the large body in a storage system and passes only the reference in the
message. It solves the message size limit, and introduces the need to manage the lifecycle of what was
stored.

## Endpoints

How the application and the channel connect.

**Competing consumers.** Several consumers on the same queue, to scale. It requires ordering not to matter.

**A message dispatcher.** One consumer reads and distributes to internal workers.

**A selective consumer.** It consumes only messages that match a criterion.

**An idempotent receiver.** It detects and discards duplicates. See
[duplicate messages](/06-distributed-systems/duplicate-messages.md).

**A service activator.** It connects a channel to a service that knows nothing about messaging.

## Management

How you see what is happening.

**Message history.** The message carries where it has been. Useful for debugging and for detecting cycles.

**A message store.** A copy of every message, for auditing and reprocessing.

**A wire tap.** An extra consumer that observes without interfering.

**A test message.** Injecting synthetic messages periodically to verify the flow is alive — the equivalent
of monitoring absence described in [batch integration](/08-integration-architecture/batch-integration.md).

## When to use this catalog

- When designing a flow with more than two steps.
- When discussing integration with another team — the common vocabulary saves a meeting.
- When reviewing an existing flow, to name what is there.
- When evaluating tools: they implement these patterns under their own names.

## When not to use it

**As a catalog to implement.** It is not a list of features to have. Each pattern is an answer to a
problem; with no problem, it is complexity.

**For simple flows.** One queue between two services does not need vocabulary.

**As justification for an integration tool.** The platforms that implement the whole catalog usually bring,
along with it, a configuration language of their own and a central point that accumulates business rules.

**Without the fundamentals.** These patterns presuppose
[idempotency](/06-distributed-systems/idempotency.md), duplicate handling and consumer monitoring. Without
that, none of them works.

## Common Mistakes

**An aggregator with no time limit.**

**An enricher creating a synchronous dependency** in a flow that should be asynchronous.

**A router accumulating business rules.**

**A splitter with no correlation.** The parts get lost and there is no way to reassemble them.

**Confusing an invalid message with a dead message.**

**Implementing the catalog instead of solving the problem.**

## Real-World Example

A distributor received orders from four channels — a portal, an app, EDI from large clients and a
spreadsheet by email — with completely different formats.

The processing was a service with conditionals per channel, 3,000 lines, that nobody wanted to touch.

The rewrite used the catalog's vocabulary, and the main gain was clarity:

**A normalizer per channel.** Four translators, each converting to an internal order format. The
conditionals disappeared.

**A splitter.** The normalized order becomes one message per item, because availability is checked per
item.

**An enricher.** Each item receives product and price data.

**An aggregator.** The items' responses are gathered back into an order, with a completion criterion by
count and a 30-second time limit.

**A content-based router.** A complete order goes on to billing; an order with an unavailable item goes on
to commercial handling.

Two problems appeared, and both were the patterns' known failure modes:

**An aggregator with no time limit.** The first version waited for all items indefinitely. An item whose
enrichment failed made the whole order get stuck. After three days there were 1,200 orders stuck in memory.
The 30-second time limit with handling for the incomplete set solved it.

**An enricher taking the flow down.** The pricing service got slow, and since the enrichment was
synchronous, the whole queue stopped. Fixed with a timeout, a cache and an alternative path that uses the
last known price, flagging the item for review.

The later assessment points out: both problems are described in the book, under those names, for twenty
years. Having used the vocabulary in the design phase would have made somebody ask "what is the
aggregator's completion criterion?" before the implementation existed.

## Related Concepts

- [Messaging Integration](/08-integration-architecture/messaging-integration.md) — the base.
- [Event-Driven Integration](/08-integration-architecture/event-driven-integration.md).
- [Anti-Corruption in Integration](/08-integration-architecture/integration-anti-corruption.md) — the
  translator.
- [Ordering](/06-distributed-systems/ordering.md) — the resequencer.

## Practical Exercise

Take the most complex integration flow in your system and name each step with the patterns in this
document.

Where a step has no name, it probably does two things — and splitting it is the next refactoring.

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003 — the reference.
- [enterpriseintegrationpatterns.com](https://www.enterpriseintegrationpatterns.com) — the online catalog,
  with the diagrams.
- Hohpe, Gregor. *Conversation Patterns*, 2017 — the follow-up on long-running flows.
