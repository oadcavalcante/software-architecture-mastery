---
id: backpressure
title: Backpressure
sidebar_position: 30
description: Signaling that you cannot keep up — and why a buffer only postpones the collapse.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes that unbounded queuing is the absence of
  backpressure, and chooses what to do when capacity runs out.
prerequisites: [messaging]
related: [rate-limiting, queues, retries]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Backpressure

## Overview

Backpressure is the mechanism by which an overloaded consumer signals to the producer to slow down.

The central claim: **unbounded queuing is not backpressure — it is postponing the collapse.** A
queue that grows indefinitely trades an immediate, visible failure for a late, catastrophic one.

## Problem

Producer and consumer rarely have the same capacity. When the producer is faster, the excess has to
go somewhere.

The instinctive answer is a buffer. It absorbs short peaks, and it does not solve a sustained
imbalance — it only moves the problem in time.

And when the buffer fills, three things can happen:

**Block the producer.** It stops accepting new work — which propagates the pressure backwards, until
it reaches whoever originated it.

**Discard.** Work is lost, and someone has to decide which.

**Grow until memory runs out.** The process dies, and **all** of the buffer is lost — not only the
excess.

The third is what happens by omission, and it is the worst of the three.

## Core Concepts

### An unbounded buffer is the antipattern

An in-memory queue with no limit looks resilient and is a time bomb.

Under a sustained imbalance, it grows until it exhausts memory. And when the process dies,
everything is lost — including the work that had already been accepted and acknowledged to the
producer.

A bounded buffer that rejects when full is always preferable: the failure is immediate, visible, and
proportional to the excess.

### The answers when capacity runs out

**Block.** The producer waits. Suitable when it can wait — a batch job, a queue consumer.
Unsuitable when there is a user waiting.

**Discard the newest.** Reject what arrives. Simple, and it preserves old work that may already be
obsolete.

**Discard the oldest.** Preserves the recent. Suitable for data whose value decays — telemetry,
quotes, a vehicle's position.

**Discard by priority.** Reject the least important and preserve the critical. It requires
classifying, and it is what lets a saturated system keep serving what matters.

**Sample.** Process a fraction. Suitable for metrics and analytics.

The choice depends on what the data means — and that is a business decision.

### Backpressure has to cross the chain

If a consumer signals pressure and the producer merely queues internally, the problem has only
moved.

The signal has to propagate to the **origin** — typically the user or the external system — which is
where the load can actually be reduced.

In a chain, that means each link has to have a limit and react to the next one's signal. A link with
an unbounded buffer breaks the propagation and becomes the point where the system accumulates until
it dies.

### Pull has natural backpressure

A consumer that **fetches** messages when it can does not receive more than it can process. The pace
control is inherent to the model.

A consumer that **receives** pushed messages needs an explicit mechanism — a credit window,
acknowledgment with a limit on in-flight messages, or pressure signaling.

It is one of the reasons modern streaming systems adopt pull with long polling.

### Discarding is not failing

Discarding load deliberately is a design decision, not a defect.

A system that discards 5% of requests at peak and serves the other 95% well is preferable to one
that accepts everything, degrades for everyone, and eventually goes down.

That has to be explicit: which load is disposable, and what the client receives when it is.

## Mental Model

**The question is not "how do we absorb more". It is "what do we do when it does not fit".** Every
system has a limit; the difference is whether it was designed.

## When to Use

- Producer and consumer with different capacities.
- Variable load with peaks.
- Chains of asynchronous processing.
- Consuming a continuous stream — telemetry, events, streaming.

## When Not to Use

**An unbounded buffer as a strategy.** It never is.

**Blocking when there is a user waiting.** They will give up and possibly retry, increasing the
load.

**Discarding without deciding what.** Random discarding loses the critical along with the
disposable.

**Signaling pressure without propagating.** The problem merely changes place.

**Backpressure as a substitute for capacity.** If the system is permanently saturated, the problem is
sizing.

## Alternatives

- **[Rate limiting](/05-system-design/rate-limiting.md)** — limit at the entrance instead of
  reacting at the exit. Preventive, and it requires knowing the capacity.
- **Scale the consumer** — when the imbalance is one of capacity, not of peaks.
- **Degrade** — process more cheaply under pressure.
- **Prioritize** — discard the least important.

## Trade-offs

| Block | Discard |
|---|---|
| Nothing is lost | Loses work |
| Pressure propagates backwards | Contained locally |
| The producer has to be able to wait | Does not have to |
| Risk of stalling the whole chain | The system keeps flowing |

| Large buffer | Small |
|---|---|
| Absorbs larger peaks | Absorbs less |
| Higher latency under load | Lower |
| More memory and more loss in a failure | Less |
| Hides the imbalance longer | Reveals it early |

The last line is frequently an advantage of the small buffer: it makes the problem visible while it
is still small.

## Failure Modes

**Memory exhausted.** An unbounded buffer under a sustained imbalance.

**Total loss in a failure.** The in-memory buffer dies with the process.

**Stalled chain.** Blocking propagates to the origin and stalls everything.

**Growing latency.** The queue grows and the wait time with it — the system "works" and responds too
late to have value.

**Discarding the critical.** With no priority, what matters is lost.

**Pressure not propagated.** A link with an unbounded buffer absorbs everything and dies.

## Common Mistakes

**An in-memory queue with no limit.**

**Not monitoring the depth.** It is the metric that anticipates the problem.

**Blocking in a chain with a user at the end.**

**Not classifying what can be discarded.**

**Increasing the buffer as a fix.** It postpones and aggravates.

## Real-World Example

A vehicle tracking platform received positions from 80 thousand vehicles, every 30 seconds.

The ingestion service put the positions in an in-memory queue, and a processor wrote them to the
database. The queue had no limit.

During a database maintenance that lasted 12 minutes, the processor stopped writing.

The queue grew. In 9 minutes, the process's memory was exhausted and it died — taking with it
**all** the positions in memory, including the ones that had been accepted before the maintenance.

On restart, the service started accepting positions again, the queue started growing again — the
database was still under maintenance — and the process died again. Three times.

About 2 million positions were lost.

The fixes changed the strategy, not the buffer size.

**An explicit limit** of 50 thousand positions in memory.

**Discarding the oldest** when the limit is reached. For tracking, a vehicle's most recent position
is the one that matters; one from 8 minutes ago has little value.

**A durable queue** for what cannot be discarded — the alarm events, which are rare and critical.
They moved to a separate channel, with persistence.

**A depth alert** above 60% of the limit.

During the next maintenance, of 15 minutes, the behavior was: old positions discarded with a
recorded counter, alarms preserved in the durable queue, no process killed, and automatic recovery
at the end of the maintenance.

The decision that made that possible was not technical: it was asking the business **which data can
be lost** — and the answer, that a common position can and an alarm cannot, made it possible to
handle the two differently.

## Related Concepts

- [Queues](/05-system-design/queues.md) — the durable buffer.
- [Rate Limiting](/05-system-design/rate-limiting.md) — the control at the entrance.
- [Retries](/06-distributed-systems/retries.md) — which aggravates the pressure when badly
  configured.
- [Reliability](/12-reliability/index.md) — degradation and load shedding.

## Practical Exercise

Look for in-memory queues in your system — buffers, channels, pending work lists. For each one,
check whether there is a limit.

For the ones with none, compute: how long an imbalance can the process take before exhausting
memory?

## Interview Questions

- Why is an unbounded buffer not backpressure?
- What are the possible answers when capacity runs out?
- Why does pull have natural backpressure and push not?

## Further Reading

- Reactive Streams — the backpressure specification for asynchronous streams.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — load shedding and graceful
  degradation.
