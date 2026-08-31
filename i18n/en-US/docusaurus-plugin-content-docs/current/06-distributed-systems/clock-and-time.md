---
id: clock-and-time
title: Clocks and Time
sidebar_position: 34
description: Why there is no shared "now" — and why timestamps do not order events.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader avoids depending on the wall clock for ordering and
  correctness, and knows the alternatives.
prerequisites: [distributed-fundamentals]
related: [ordering, conflict-resolution, consensus]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Clocks and Time

## Overview

In a distributed system there is no shared **now**.

Each machine has its own clock, and they diverge. That means comparing timestamps from different
machines does not establish order — and systems that depend on that fail in subtle, hard-to-reproduce
ways.

## Problem

The reflex is to use a timestamp for everything: ordering events, deciding which write prevails,
checking expiry, measuring duration.

Each of those uses has a different problem, and they all come from the same root: one machine's
clock has no reliable relationship with another's.

**Drift.** Quartz clocks deviate — typically a few seconds per day without synchronization.

**Imperfect synchronization.** NTP corrects it, with a precision of tens of milliseconds on a good
network, and far worse under congestion.

**Jumps.** The correction can move the clock backwards. A program that measures duration by
subtracting two instants can get a negative value.

**Suspension.** Virtual machines can be paused and resumed, with the clock jumping.

## Core Concepts

### Two kinds of clock, and using them wrongly is the common error

**Wall clock.** Calendar time. Subject to correction, jumps and going backwards. Suitable for
**recording when something happened**, for display, for long-lived credential expiry.

**Monotonic clock.** A counter that only grows, unrelated to the calendar. Not subject to
correction. Suitable for **measuring duration**, timeouts and intervals.

The classic error: measuring an operation's duration by subtracting two wall clock values. If NTP
corrects in the middle, the result can be negative or absurd.

Every measurement of elapsed time should use the monotonic clock.

### A timestamp does not order events

If event A has a later timestamp than B, and they came from different machines, **you cannot
conclude that A happened later**.

The difference between the clocks can be larger than the real interval between the events. It is
exactly the scenario of
[conflict resolution](/06-distributed-systems/conflict-resolution.md) by last writer wins.

Ordering has to come from somewhere else: a counter on the entity, a sequence number assigned by a
single point, or the
[partition](/06-distributed-systems/ordering.md).

### Logical clocks

When causal order matters and the physical clock does not serve:

**Lamport clock.** One counter per node, incremented on each event and propagated in messages. If A
caused B, A's counter is smaller. The converse does not hold — smaller counters do not imply
causality.

**Version vector.** One counter per node, kept as a vector. It allows distinguishing "A caused B"
from "A and B were concurrent" — which is what
[conflict detection](/06-distributed-systems/conflict-resolution.md) requires.

The vector is more expensive in space and is the one that actually answers the useful question.

### Clocks with bounded uncertainty

Some systems use specialized hardware — GPS and atomic clocks — to bound the uncertainty to a few
milliseconds, and then **wait out** that uncertainty before committing a transaction.

It is Spanner's approach: instead of pretending the clocks agree, quantifying how much they can
diverge and waiting.

It works and it depends on infrastructure most systems do not have.

### Expiry is the dangerous case

Checking whether a credential has expired compares the local clock against a timestamp. If the
clocks diverge:

A server with a lagging clock accepts already-expired credentials. One that is ahead rejects valid
ones.

That is why token protocols usually recommend a tolerance margin — and why an unsynchronized clock
shows up as "an intermittent authentication error that goes away on retry".

## Mental Model

**The wall clock says *when*; the monotonic clock says *how long*.** Using one in place of the other
is the origin of nearly every defect in this area.

## When to Use

**Wall clock** for: recording an event's instant for display or audit; long-term expiry; scheduling
at calendar times.

**Monotonic clock** for: measuring duration; timeouts; the interval between attempts; any comparison
of elapsed time.

**Logical clock** for: ordering events causally; detecting concurrency.

## When Not to Use

**A timestamp to order events from different machines.**

**The wall clock to measure duration.**

**A timestamp to resolve a conflict.** See
[conflict resolution](/06-distributed-systems/conflict-resolution.md).

**Assuming the clocks are synchronized.** Check — drift happens, and frequently with no alert.

**Short expiry with no margin.** A 30-second credential with clocks diverging by 100 ms is fragile.

## Alternatives

- **Sequence counter** — assigned by a single point, it orders without depending on a clock.
- **Entity version** — solves ordering and staleness detection.
- **Version vector** — for causality and concurrency.
- **Hybrid clock** — combines a physical and a logical component, capturing causality and keeping a
  relationship with real time.

## Trade-offs

| Physical timestamp | Logical clock |
|---|---|
| Readable and comparable to the calendar | No external meaning |
| Unreliable across machines | Reliable for causality |
| No additional state | A counter or vector to propagate |
| Trivial | Requires propagation in messages |

## Failure Modes

**Negative duration.** The clock corrected during the measurement.

**Inverted order.** Events ordered by timestamp appear out of order.

**A conflict resolved by the machine whose clock is ahead.**

**A credential rejected by an unsynchronized clock.** It appears as an intermittent error.

**Duplicated or skipped scheduling.** A task scheduled for a time executes twice or not at all,
during a clock correction.

**Unmonitored drift.** Nobody knows a machine is off.

## Common Mistakes

**Measuring duration with the wall clock.**

**Ordering by timestamp across machines.**

**Not monitoring drift.** It is a simple metric and rarely collected.

**Expiry with no tolerance margin.**

**Assuming NTP solves it.** It reduces the divergence; it does not eliminate it.

## Real-World Example

An auction system recorded bids with the timestamp of the server that received them, and determined
the winner by the most recent bid.

Four servers behind a load balancer, all with NTP.

A contractual dispute exposed the problem: two bids arrived 40 ms apart in real time, on different
servers. The server that received the **first** had a clock 120 ms ahead.

By timestamp, the first bid appeared to be later. It won the auction.

An audit of the network logs showed the real order, and the result had to be reversed — with legal
consequences.

The investigation revealed that the drift among the four servers varied between 15 and 180 ms over
the course of a day, and nobody monitored it.

The fixes.

**A central sequence counter.** Every bid goes through a single component that assigns a sequential
number. The order comes from it, not from a clock.

**Timestamps kept for display and audit**, explicitly marked as approximate.

**Drift monitoring** with an alert above 50 ms.

**Duration measurement** migrated to the monotonic clock across the system — a code audit found
eleven places subtracting wall clock values.

The detail the team highlights: the system worked for three years, and the ordering had been wrong
in a fraction of the auctions that whole time. It only surfaced when someone contested — and the
absence of a central counter was known to nobody, because "use the server's time" seemed too obvious
to question.

## Related Concepts

- [Ordering](/06-distributed-systems/ordering.md) — where clocks do not serve.
- [Conflict Resolution](/06-distributed-systems/conflict-resolution.md) — the same problem.
- [Timeouts](/06-distributed-systems/timeouts.md) — which need the monotonic clock.
- [Consensus](/06-distributed-systems/consensus.md) — which establishes order without depending on a
  clock.

## Practical Exercise

Look through your code for places that subtract two time values to measure duration. Check whether
they use the monotonic clock.

Then check the drift among your system's machines. If there is no metric, that is the discovery.

## Interview Questions

- What is the difference between the wall clock and the monotonic clock, and when do you use each?
- Why does a timestamp not order events from different machines?
- What does a version vector answer that a timestamp does not?

## Further Reading

- Lamport, Leslie. *Time, Clocks, and the Ordering of Events in a Distributed System*. CACM, 1978.
- Corbett, James et al. *Spanner: Google's Globally-Distributed Database*. OSDI, 2012 — the bounded
  uncertainty approach.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 8.
