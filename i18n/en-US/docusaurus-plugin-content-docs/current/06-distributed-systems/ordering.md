---
id: ordering
title: Ordering
sidebar_position: 26
description: The order in which messages arrive — and why global ordering costs more than almost any system needs.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader identifies which ordering the business actually requires and chooses
  the partition key that preserves it.
prerequisites: [messaging]
related: [partitioning, clock-and-time, duplicate-messages]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Ordering

## Overview

Ordering is the guarantee about the sequence in which messages are processed.

The claim that organizes the subject: **global ordering is expensive and almost never what the
business needs.** What it needs is ordering **per entity** — and that one is cheap.

## Problem

The observed behavior is well known: `OrderCancelled` arrives before `OrderCreated`. The consumer
tries to cancel an order that does not exist yet.

The cause is structural. Messaging systems distribute messages across partitions to scale. Each
partition preserves ordering internally; **between partitions there is no guarantee at all**.

If the two messages for the same order land in different partitions, they are processed by different
consumers, at different paces.

The instinctive reaction is to ask for global ordering — a single partition. That works and
eliminates parallelism: the whole topic's throughput is limited to one consumer.

## Core Concepts

### The levels of ordering

| Level | Guarantee | Cost |
|---|---|---|
| None | Any order | None |
| Per partition | Ordering within a partition | None — it is the default |
| Per key | Messages with the same key in order | Choosing the key |
| Global | All in order | One partition, no parallelism |

**Per key** is the level that solves most real cases, and it comes for free: it is enough for the
partition key to be the entity whose ordering matters.

```text
partition = hash(order_id)
  → all of an order's events in the same partition
  → ordering preserved among them
  → different orders in parallel
```

### Global ordering is rarely necessary

It is worth testing the assumption. The questions:

**Are the events for the same entity?** If not, the ordering between them probably does not matter.
That order 100 is processed before order 200 is irrelevant.

**Is there a causal dependency?** Cancelling depends on creating. But cancelling order A does not
depend on creating order B.

**Can the consumer tolerate it?** If it can reorder or wait, the ordering does not have to come from
the channel.

In most business systems, the answer is: per-entity ordering is enough.

### Per-key ordering has a hidden cost

Choosing the key to preserve ordering also determines the distribution. If one key is far more
active, it concentrates load on one partition — the
[hotspot](/11-scalability/index.md).

A system that partitions by `customer_id` and has a corporate customer with 40% of the volume has
one saturated partition and the others idle.

The trade-off: ordering requires grouping; distribution requires spreading.

### Tolerating disorder in the consumer

When ordering cannot be guaranteed by the channel, the consumer can handle it:

**Ignore the stale.** Each message carries a version number for the entity; the consumer discards
messages with a version lower than the one already applied.

**Wait for the dependency.** If `OrderCancelled` arrives before `OrderCreated`, hold it and
reprocess later. It requires a place to hold it and a wait limit.

**Commutative operations.** If order does not change the result, the problem disappears. It is the
most elegant solution and not always possible.

The first is the most used and the simplest: **a version in the message** solves most disorder cases
with no waiting mechanism at all.

### Timestamps do not establish ordering

Trying to order by timestamps from different machines does not work — clocks diverge. See
[clocks and time](/06-distributed-systems/clock-and-time.md).

The ordering has to come from a counter on the entity, from a sequence number assigned by the
producer, or from the partition.

### Reordering in the consumer has a cost and a limit

When the consumer needs ordering the transport does not guarantee, the way out is to hold
out-of-sequence messages until the missing one arrives.

That works and brings two constraints that have to be decided beforehand:

**The buffer is finite.** Holding indefinitely exhausts memory. With a limit, a long gap forces a
discard or a block.

**The gap may never close.** If the missing message was lost or went to another partition, waiting
for it stalls consumption forever.

That mandates a deadline: after N seconds waiting for sequence 7, the consumer has to choose between
processing out of order, skipping, or stopping and alerting.

Choosing among the three is a domain decision, not a technical one — and a consumer that reorders
with no defined deadline will stall in production, invariably in the middle of the night.

## Mental Model

**The question is not "are the messages in order?". It is "the ordering of what matters to whom?"**

## When to Use

**Per-key ordering** when:
- Events for the same entity have a causal dependency.
- The consumer applies sequential state changes.
- The key's distribution is reasonably uniform.

**Global ordering** when:
- There is a genuine requirement for a total sequence — an accounting ledger, for example.
- The throughput fits in one consumer.

## When Not to Use

**Global ordering as a precaution.** It eliminates parallelism and is rarely necessary.

**Per-key ordering when the key is unbalanced.** It becomes a hotspot.

**Trusting ordering without checking the configuration.** Several systems only guarantee ordering
under specific conditions — a producer with no parallel sends, with no retries reordering.

**Ordering by timestamps across machines.**

## Alternatives

- **A version in the message** — the consumer discards the stale. It solves most cases.
- **Commutative operations** — eliminate the dependency on ordering.
- **Reordering buffer** — hold and apply in order, with a wait limit.
- **State in the consumer** — check the precondition before applying, instead of trusting the
  ordering.

## Trade-offs

| Global ordering | Per key | None |
|---|---|---|
| Total sequence guaranteed | Per entity | No guarantee |
| No parallelism | Parallel across keys | Maximum parallelism |
| Throughput of one consumer | Scales with partitions | Scales freely |
| No hotspot from ordering | Possible hotspot | Uniform distribution |

## Failure Modes

**An event applied out of order.** Incorrect state — a cancellation before the creation.

**A hotspot from the ordering key.** One saturated partition.

**Ordering broken by a retry.** The producer resends a message after having already sent the next
one.

**Ordering broken by rebalancing.** Consumers swap partitions and process overlapping.

**Ordering assumed and not configured.** The producer sends in parallel, which reorders even within
the partition.

## Common Mistakes

**Asking for global ordering without checking the need.**

**Not including a version in the messages.** It is the cheapest defense against disorder.

**Choosing the key without looking at the distribution.**

**Assuming the broker guarantees ordering without reading the producer's configuration.**

**Ordering by timestamp.**

## Real-World Example

A parcel tracking system processed status events. A customer reported a parcel that showed "out for
delivery" after "delivered".

The investigation found the cause: the events were partitioned by `carrier_id` — a choice made to
group by partner — and a parcel could change carriers mid-route.

On the change, the subsequent events went to another partition, and the ordering between the two
groups was not guaranteed.

The first proposal was global ordering. The calculation showed the cost: 40 thousand events per
minute in a single consumer, against the eight parallel consumers that existed. Unviable.

The fix had two parts.

**The partition key changed** to `parcel_id` — the entity whose ordering actually matters. Carrier
remains an attribute of the event, not the key.

**A version in the message.** Each event carries a sequential counter for the parcel, assigned by
the producer. The consumer discards events with a version lower than the last applied.

The second part paid off the most, and for a reason the team did not anticipate: it protects against
disorder from **any** source — a retry, rebalancing, manual reprocessing — and not only against the
known cause.

The distribution by parcel also turned out to be more uniform than by carrier, where two large
partners concentrated the load.

## Related Concepts

- [Messaging](/06-distributed-systems/messaging.md) — the channel.
- [Partitioning](/06-distributed-systems/partitioning.md) — choosing the key.
- [Clocks and Time](/06-distributed-systems/clock-and-time.md) — why timestamps do not order.
- [Duplicate Messages](/06-distributed-systems/duplicate-messages.md).

## Practical Exercise

For each topic in your system, answer: what is the partition key, and whose entity's ordering does
it preserve?

Then check whether the messages carry a version. If they do not, the consumer has no way to detect
disorder.

## Interview Questions

- Why is global ordering expensive?
- How do you choose the partition key to preserve the ordering that matters?
- Why is a version in the message the most robust defense against disorder?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Lamport, Leslie. *Time, Clocks, and the Ordering of Events in a Distributed System*. CACM, 1978.
