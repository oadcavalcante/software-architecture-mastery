---
id: network-failure
title: Network Failure
sidebar_position: 2
description: The network loses, delays, duplicates and reorders — and none of those failures is distinguishable from the others.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes the network failure modes and why the correct
  diagnosis is frequently impossible from one side.
prerequisites: [distributed-fundamentals]
related: [partial-failure, timeouts, failure-detection]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Network Failure

## Overview

The network is the medium through which distributed systems coordinate, and it is unreliable by
nature — not through an implementation defect.

What makes that hard is not that the network fails. It is that **the failure modes are
indistinguishable from each other** from one side.

## Problem

You send a request and receive no response. The possible explanations:

The request did not arrive. It arrived and the destination went down before processing. It was
processed and the response was lost. It is being processed, slowly. The destination is healthy
and the network between you is partitioned.

**From your side, all five are identical.** You observe the same thing: silence.

That is not a tool limitation — it is a property of the problem. No protocol solves it, because
distinguishing would require information that does not cross the partitioned network.

Everything else at this level is a consequence of that.

## Core Concepts

### The failure modes

**Loss.** Packets dropped by congestion, a full buffer or a transmission error. TCP
retransmits, which solves the loss and increases latency.

**Delay.** The packet arrives, late. Under congestion, latency rises by orders of magnitude —
and a long enough delay is operationally the same as loss.

**Duplication.** Retransmissions can produce double delivery in layers above.

**Reordering.** Packets take different paths and arrive out of order. TCP reorders within a
connection; between connections, there is no guarantee.

**Partition.** A group of nodes becomes isolated from another. Both keep working and each one
believes the other went down.

### Partition is the mode that decides architecture

A partition is the rarest and the most consequential, because during it **both sides keep
operating**.

If both accept writes, the states diverge and someone resolves the conflict later. If only one
accepts, you have to decide which — and the other becomes unavailable.

That is literally the [CAP](/06-distributed-systems/cap.md) dilemma, and it exists because of
partitions.

The common error is treating a partition as a theoretical hypothesis. It happens: a switch
failure, a configuration error, a firmware update, an isolated availability zone, a cut
submarine cable.

### Partial and asymmetric partitions

Not every partition is clean. Two treacherous variants:

**Asymmetric.** The message goes from A to B and does not come back. A thinks B went down; B
receives requests and responds into the void.

**Partial.** A reaches B, B reaches C, and A does not reach C. There are not two groups — there
is an inconsistent topology, in which different nodes have different views of who is alive.

Consensus algorithms handle clean partitions well and partial ones badly, and several public
distributed-system incidents have that cause.

### A slow failure is worse than a total one

A node that went down is detected and removed. A **slow** node keeps answering health checks,
keeps receiving traffic and keeps delivering slowly.

That propagates the slowness to whoever depends on it, and it is the origin of a good part of
cascades. See [circuit breakers](/12-reliability/circuit-breakers.md).

Detecting degradation requires measuring latency, not only availability — and that is why a
binary health check is insufficient.

## Mental Model

**Silence is not information.** It is compatible with success, with failure and with slowness —
and designing assuming any of them produces a defect.

## When to Use

This document does not describe a technique to apply. The decisions it informs:

- Calibrating [timeouts](/06-distributed-systems/timeouts.md) knowing that delay and loss are
  indistinguishable.
- Designing [idempotency](/06-distributed-systems/idempotency.md), because duplication will
  happen.
- Choosing between availability and consistency under a partition.
- Detecting degradation in addition to unavailability.

## When Not to Use

**Assuming the network is reliable inside the data center.** It is more reliable; it is not
reliable. Partitions within a zone happen.

**Treating a partition as an unlikely scenario.** Long-lived systems encounter them.

**Trusting a binary health check.** It does not detect slowness.

**Assuming TCP solves it.** It solves loss and reordering **within a connection**. It does not
solve partitions, does not guarantee delivery to the application, and does not prevent
duplication in layers above.

## Alternatives

There is no alternative to dealing with network failure in a distributed system. There is the
alternative of **not distributing** — see
[modular monolith](/03-design-patterns/modular-monolith.md).

Within the distributed world, what varies is the strategy: tolerate and reconcile, or refuse to
operate during the failure.

## Trade-offs

During a partition, the choice is between continuing to accept writes — with divergence to
resolve — and refusing — with unavailability.

| Accept writes | Refuse |
|---|---|
| The system stays available | Unavailable during the partition |
| The states diverge | The state is always consistent |
| A conflict to resolve | No conflict |
| Suitable for domains that tolerate it | Suitable for domains that do not |

See [CAP](/06-distributed-systems/cap.md) for the full treatment.

## Failure Modes

**Cascade from slowness.** A slow node consumes the connections of whoever calls it.

**Split brain.** Both sides of a partition consider themselves authoritative.

**Duplication from retransmission.** With no idempotency, a duplicated effect.

**False detection.** A slow node is declared dead, removed, and comes back — generating
unnecessary rebalancing and instability.

**Undetected asymmetric partition.** One side removes the other; the other keeps thinking it is
in the group.

## Common Mistakes

**Assuming a timeout means the destination failed.**

**Not handling duplication.**

**A health check that only tests whether the process responds.**

**Ignoring partitions in the design.** They will happen; the question is what the system does.

**Retransmitting aggressively under congestion.** It worsens exactly the condition that caused
the loss. See [backoff](/06-distributed-systems/backoff.md).

## Real-World Example

A database cluster with three nodes — one leader and two replicas — in different availability
zones.

A network maintenance isolated the leader's zone from the other two for 90 seconds.

The two replicas stopped receiving a signal from the leader. After the detection timeout, they
elected a new leader among themselves and started accepting writes.

The original leader remained healthy, reachable by the application running in the same zone, and
kept accepting writes — not knowing it had lost the leadership.

For 90 seconds there were **two leaders**, both accepting writes, each convinced it was the only
one.

At the end of the partition, 1,200 writes had to be reconciled manually. 40 were conflicting —
the same record changed on both sides.

What the team discovered in the analysis: the cluster had protection against that — a majority
requirement to accept writes — and it was disabled, because enabling it made the system
unavailable when one zone went down.

Someone had traded availability for consistency without recording the decision, and without the
business knowing. For a balance system, it was the wrong trade.

The fix was to re-enable the majority requirement and accept 90 seconds of unavailability instead
of balance divergence — this time with the decision recorded in an
[ADR](/18-architecture-decisions/what-is-an-adr.md), and with the business in the conversation.

## Related Concepts

- [Partial Failure](/06-distributed-systems/partial-failure.md) — the consequence for the design.
- [CAP](/06-distributed-systems/cap.md) — the choice under a partition.
- [Failure Detection](/06-distributed-systems/failure-detection.md) — why declaring something
  dead is a heuristic.
- [Timeouts](/06-distributed-systems/timeouts.md) — the only available tool.

## Practical Exercise

For your system: what happens if the network between the application and the database is
partitioned for 60 seconds?

Then the harder version: what if it is **partially** partitioned — the application reaches the
database, the database does not reach the replica?

## Interview Questions

- Why are the network failure modes indistinguishable from one side?
- Why is a slow failure worse than a total one?
- What does TCP solve and what does it not solve?

## Further Reading

- Bailis, Peter; Kingsbury, Kyle. *The Network is Reliable*. ACM Queue, 2014 — the survey of
  real partitions in production.
- Kingsbury, Kyle. *Jepsen* — analyses of systems under partition.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
