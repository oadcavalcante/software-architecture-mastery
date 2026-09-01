---
id: queue-based-scaling
title: Queue-Based Scaling
sidebar_position: 9
description: Decoupling the arrival rate from the processing rate — and scaling on the indicator that reacts first.
doc_type: pattern
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader uses the queue as a buffer and scales on its depth, with a
  ceiling and shedding defined.
prerequisites: [async-processing]
related: [async-processing, horizontal-scaling, scaling-capacity-planning]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Queue-Based Scaling

## Overview

A queue between the producer and the consumer decouples the **arrival rate** from the **processing rate**.

That resolves the problem capacity does not resolve well: short, intense peaks that last less than the time
to provision machines.

And it offers an indicator that reacts before any resource metric — the **queue
depth**.

## Problem

Auto scaling on CPU is reactive and slow: the metric rises, the alarm fires, the capacity comes up, the
application starts. See [cloud compute](/09-cloud-architecture/cloud-compute.md).

The interval is minutes. Many peaks last less than that — and when the capacity arrives, the peak is over.

With no queue, the excess becomes an error: refused requests, timeouts, retries that amplify the load.

With a queue, the excess becomes **delay**. And delay is almost always preferable to an error.

## Core Concepts

### The queue is a buffer, not capacity

The point that needs to be clear: the queue processes nothing. It absorbs the temporary difference between
arrival and processing.

```text
arrival 500/s, processing 300/s, for 2 minutes
  → the queue accumulates 24,000, drains afterward. It works.

arrival 500/s, processing 300/s, sustained
  → the queue grows indefinitely. It does not work.
```

See [asynchronous processing](/11-scalability/async-processing.md). The queue resolves a peak, not
sustained overload — and using it for the second turns an immediate error into a growing delay nobody
notices.

The check: the **average processing capacity needs to exceed the average arrival rate**. If it does not, no
queue resolves it.

### The queue gives the indicator that reacts first

```text
CPU            reacts after the work is already running late
latency        the same
queue depth    reacts at the instant arrival exceeds processing
```

Scaling on depth — or, better, on the **age of the oldest message** — gives minutes of lead time relative
to resource metrics.

Age is preferable to count because it translates directly into experience: "the oldest message is 4 minutes
old" says something to the business; "there are 30,000 messages" does not.

And it normalizes automatically: 30,000 messages can be 10 seconds or 3 hours, depending on the consumption
capacity.

### A ceiling and shedding are not optional

A queue with no limit accumulates until the storage runs out — and recovering a queue with millions of
messages is slow.

Three controls:

**A depth ceiling.** Above it, the producer receives a refusal. That pushes the pressure back to the edge,
where it can be handled. See [backpressure](/06-distributed-systems/backpressure.md).

**Shedding by deadline.** Messages whose usefulness has expired are discarded. A "your order is out for
delivery" notification 6 hours late should not be sent.

**Priority.** Separate queues by criticality, with consumption prioritizing the one that matters.

Shedding by deadline is the least implemented and the one that avoids the most damage: processing obsolete
work consumes capacity the new work needs.

### Prioritizing requires separate queues

A single queue processes in arrival order. In a recovery after an incident, that means new work waits
behind hours of backlog.

Separate queues by priority, with dedicated consumers or with a defined consumption ratio, resolve it — and
the decision of which operations are priorities needs to come from the business.

The common mistake is creating priority without reserving capacity for the low-priority queue: it is never
consumed while there is anything in the high one.

### The consumer needs to actually scale

Adding consumers only increases throughput if the work is parallelizable.

The limits that appear:

**Ordering by key.** If an entity's messages need to be processed in order, they go to the same consumer.
The parallelism is limited by the number of keys. See [ordering](/06-distributed-systems/ordering.md).

**A shared resource.** Twenty consumers against the same database only move the bottleneck.

**The number of partitions.** In partitioned systems, the maximum parallelism is the number of partitions —
adding consumers beyond that does nothing.

The third is the most frequent and the most surprising: doubling the consumers without increasing the
partitions changes nothing.

### Scaling to zero is possible and has a cost

When the queue is empty, the consumers can be turned off — which saves money on sporadic workloads.

The cost is the resumption latency: the first message after an idle period waits for the provisioning time.
See [serverless](/09-cloud-architecture/serverless.md).

For delay-tolerant work, it is a significant saving. For what needs a fast response, a minimum of
always-active consumers is necessary.

## Mental Model

**The queue converts excess into delay.** It buys time for the capacity to arrive — and it does not replace
capacity.

## When to Use

- Short, intense peaks.
- The work tolerates delay.
- Arrival is unpredictable.
- Processing is slower than acceptance.
- Several consumers can work in parallel.
- Scaling on a resource metric is too slow.

## When Not to Use

**For sustained overload.**

**With no depth ceiling.**

**With no shedding of obsolete work.**

**When the response has to be immediate.**

**When the consumer does not parallelize.** Adding consumers does not help.

**Without monitoring the age of the oldest message.**

## Alternatives

- **Capacity provisioned before the peak** — when it is predictable, scheduled scaling is better than any
  reaction. See [cloud compute](/09-cloud-architecture/cloud-compute.md).
- **Rate limiting** — refusal at the edge, instead of accumulating. See
  [rate limiting](/05-system-design/rate-limiting.md).
- **Load shedding** — rejecting the less important to preserve the essential.
- **Batch processing** — grouping reduces the cost per item.

## Trade-offs

| With a queue | Without |
|---|---|
| A peak becomes delay | It becomes an error |
| The consumer scales independently | Coupled |
| Intermediate state | A direct response |
| An additional component | Fewer parts |
| A silent failure is possible | A visible error |

| Scaling on depth | On CPU |
|---|---|
| Reacts earlier | Later |
| Translates into experience | It does not |
| Requires a queue | Available in any service |

## Failure Modes

**A queue growing indefinitely.**

**Obsolete work processed.** Old notifications sent.

**A stopped consumer with no alert.**

**Parallelism limited by partitions.**

**A low-priority queue never consumed.**

**Slow recovery.** Millions of accumulated messages take hours to drain.

**Amplification from retries.** The consumer fails, retries, and the queue grows with repetitions.

## Common Mistakes

**Using a queue for sustained overload.** A queue absorbs a peak; if input exceeds output on average, it
only turns immediate unavailability into a growing delay.

**Not defining a ceiling.** Auto scaling on depth with no limit responds to a defective producer by
bringing up consumers until the quota — or the invoice — blows up.

**Not shedding expired work.** Processing a message whose window of usefulness has passed consumes capacity
the still-useful work needs, and it prolongs the recovery.

**Scaling on CPU when depth is available.** A consumer waiting on the network has low CPU with the queue
growing. Queue depth is the direct signal; CPU is a poor substitute.

**Not reserving capacity for low priority.** With no reservation, a high-priority peak leaves the secondary
queue stalled for hours — and it usually contains what becomes a complaint later.

**Adding consumers without increasing partitions.** In a partitioned log, the parallelism is limited by the
number of partitions. Consumers beyond that sit idle and the cost rises with no gain.

## Real-World Example

A food delivery platform had predictable peaks — lunch and dinner — with a volume eight times the average.

Auto scaling on CPU did not keep up: the lunch peak ramped up in around 90 seconds, and the capacity took 4
minutes. In the first minutes, orders were refused.

The reformulation:

**A queue between acceptance and processing.** The order came to be accepted and enqueued. The refusals
disappeared; the peak became processing delay.

**Scaling on the age of the oldest message**, with a 30-second target. The reaction became immediate,
because the age grows at the instant arrival exceeds consumption.

**Scheduled scaling** for the two peaks, provisioning capacity 15 minutes beforehand. The queue came to be
the protection for the unforeseen, not the main mechanism.

**Queues by priority.** Order confirmation at high priority; restaurant dashboard updates at medium;
reports and indexing at low. With 20% of the consumption reserved for the low one, so that it would not
stall.

**Shedding by deadline.** Status notifications more than 10 minutes old came to be discarded — the
information was no longer useful, and processing them consumed capacity needed for the current ones.

Two problems appeared:

**Insufficient partitions.** The scaling went up to 40 consumers, and the throughput stopped growing at 12
— the topic's number of partitions. Discovered by comparing the number of consumers with the throughput.
The partitions were increased to 48.

**Slow recovery.** During a 40-minute outage of the payment service, the queue accumulated 180,000 orders.
Draining took 2 hours, during which the new orders went behind. Prioritization by delivery deadline was
added: orders with a closer delivery time are processed first, regardless of arrival order.

The learning that stuck: scheduled scaling resolved more than the queue for the known peaks. The queue is
still essential — for the unforeseen and for recovery — and the initial expectation, that it alone would
resolve the daily peaks, was wrong.

## Related Concepts

- [Asynchronous Processing](/11-scalability/async-processing.md).
- [Backpressure](/06-distributed-systems/backpressure.md) — the ceiling.
- [Horizontal Scaling](/11-scalability/horizontal-scaling.md) — the consumer.
- [Queues](/05-system-design/queues.md) — the fundamentals.

## Practical Exercise

If you have queues, check whether the scaling uses depth or CPU — and whether an alert exists on the age of
the oldest message.

Then compare the number of consumers with the number of partitions. If the consumers can exceed the
partitions, the scaling is spending without delivering.

## Interview Questions

- Why does a queue resolve a peak and not sustained overload?
- Why is the age of the oldest message a better indicator than the count?
- Why can adding consumers not increase the throughput?

## Further Reading

- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
