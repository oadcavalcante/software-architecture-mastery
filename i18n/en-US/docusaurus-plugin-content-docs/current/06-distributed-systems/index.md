---
id: distributed-systems
title: Distributed Systems
sidebar_position: 0
description: Why distributed systems are hard — partial failure, ordering, duplication and the limits of what can be guaranteed.
doc_type: index
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader reasons about partial failure as the normal case, and can
  justify delivery, ordering and consistency guarantees from requirements instead
  of from a tool's reputation.
prerequisites: [system-design]
related: [data-architecture, reliability, integration-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 04 — Distributed Systems

This is the deepest section of the course, and the one that most changes how you design.

## The problem this section addresses

In a single-process system, a function call either executes or does not execute. If the
process dies, it dies whole. That is such a comfortable simplification that we rarely
notice we are using it.

Distributing the system removes that simplification. A network call has three possible
outcomes, not two: success, failure, and **I don't know**. The third is what makes
everything hard. When the timeout fires, you do not know whether the operation happened.
Retrying may duplicate; not retrying may lose.

All the complexity of this section derives from that. Idempotency exists because of it.
Sagas exist because of it. Consensus exists because of it.

The goal here is not to memorize CAP. It is to internalize that **partial failure is the
normal case**, not the exception — and to design assuming that from the start, because
adding fault tolerance later requires redoing the data model.

## What you will find here

**The fundamentals.** Network failure, partial failure, latency, timeouts, retries and
backoff. The physical basis everything else depends on.

**Idempotency.** Treated as a central topic, not as a detail. It is the property that makes
retrying safe, and without it nothing above works.

**The theoretical limits.** CAP and PACELC, presented for what they actually assert — which
is far less than what is usually cited. PACELC gets more space than CAP, because it better
describes the real dilemma: the latency cost you pay for consistency even when there is no
partition.

**Data distribution.** Replication, partitioning, sharding and conflict resolution. Eventual
consistency and strong consistency, with what each one means for whoever writes the
application.

**Coordination.** Leader election, consensus and distributed locks. It includes the question
that precedes all three: can we avoid coordinating?

**Messaging.** At-most-once, at-least-once and exactly-once delivery — and why the third is
an end-to-end property, not a tool feature. Ordering, duplicate messages, poison messages,
dead-letter queues and backpressure.

**Distributed patterns.** Event-driven systems, event sourcing, CQRS, sagas and distributed
transactions.

## Reading order

This section has a mandatory order for the first topics. Read **partial failure**, then
**timeouts and retries**, then **idempotency**. Nothing else makes sense before those three.

After that there are two paths, and you can choose: the data one (replication, partitioning,
consistency) or the messaging one (delivery, ordering, queues). Both converge on sagas and
event sourcing, which depend on both.

Leave **consensus** for last. It is the densest topic and the one least frequently
implemented by hand — in practice you will consume consensus, not write it.

## By the end

You stop asking "is this system consistent?" and start asking "consistent with respect to
what, observed by whom, under what acceptable delay?".

You can look at a flow and point out where the message can arrive twice, where it can arrive
out of order and what happens in each case. You can justify the choice between a saga and a
transaction from the requirement, not from fashion.

And you can argue against distributing, which is the correct decision far more often than the
literature suggests.

## Continues in

[Level 05 — Architecture](/07-data-architecture/index.md), where those properties start
interacting with data, integration, cloud, security and cost.
