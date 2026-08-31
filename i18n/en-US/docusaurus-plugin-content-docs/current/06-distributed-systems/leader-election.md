---
id: leader-election
title: Leader Election
sidebar_position: 16
description: Choosing who coordinates — and why electing is easy and preventing two leaders is hard.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader understands why leader election requires consensus and
  recognizes the mechanisms that prevent split brain.
prerequisites: [replication]
related: [consensus, distributed-locks, failure-detection]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Leader Election

## Overview

Leader election is the process by which a group of nodes chooses one to coordinate — accept writes,
distribute work, make decisions that have to be unique.

Choosing is easy. The hard part is **guaranteeing there are not two**, and that difficulty is why
leader election requires [consensus](/06-distributed-systems/consensus.md).

## Problem

Having a leader simplifies enormously: with a single node deciding, there is no write conflict and no
ordering to resolve. That is why [replication](/06-distributed-systems/replication.md) with a single
leader is the most common arrangement.

The problem appears when the leader fails.

The other nodes have to detect the failure and elect a replacement. But
[detecting failure is a heuristic](/06-distributed-systems/failure-detection.md): "not responding" can
mean down, slow, or on the other side of a partition.

If the nodes elect a new leader and the old one **did not go down** — it was merely unreachable —
there are two leaders, both accepting writes, both convinced they are the only one.

That is **split brain**, and it is the failure mode the election has to prevent.

## Core Concepts

### A majority is what prevents two leaders

The fundamental mechanism: **a node only becomes leader with a majority vote.**

Since there cannot be two disjoint majorities in the same group, there cannot be two leaders elected
simultaneously.

```text
5 nodes, partitioned into 3 and 2
  → the group of 3 has a majority: elects a leader
  → the group of 2 does not: stays leaderless, unavailable for writes
```

The minority side **has to stop accepting writes**. If it continues, the mechanism is worth nothing.

That is what makes the election a CP choice: under a partition, the minority side becomes
unavailable. See [CAP](/06-distributed-systems/cap.md).

### The old leader has to know it lost

Here is the subtle part. The isolated node may not realize it lost the leadership — it receives no
notice, because it is partitioned.

Two defenses:

**A lease with a deadline.** The leadership is valid for a limited time and has to be renewed with
the majority. Without renewing, the leader **resigns on its own**. That bounds the two-leader window
to the lease duration.

**Fencing.** Each leadership receives an increasing number. The protected resources — database,
storage — reject operations with a number lower than the last one seen.

```text
leader 1 (epoch 5) is isolated
leader 2 (epoch 6) is elected and writes
leader 1 comes back and tries to write with epoch 5
  → the resource rejects it: it has already seen epoch 6
```

Fencing is the defense that works even when the detection fails, because it does not depend on the
old leader realizing anything. It is the most reliable mechanism, and the most frequently omitted.

### Detection and stability

The detection time defines a trade-off:

**Short.** Fast failover, and the risk of an unnecessary election from a momentary slowdown — which
causes instability, with the leadership changing repeatedly.

**Long.** Stable, and more unavailability when the leader actually goes down.

Mature systems usually use detection on the order of seconds, with a similar lease duration.

### Not everything needs a leader

Before electing, it is worth asking whether the coordination is necessary.

Commutative operations — which can happen in any order without changing the result — do not need a
leader. See
[conflict resolution](/06-distributed-systems/conflict-resolution.md) and structures that converge
without coordination.

A leader is the simplest solution to reason about and the most expensive in availability.

### Do not implement it from scratch

Correct election is notoriously hard to implement. The available implementations — based on Raft,
Paxos or coordination services — were tested against partition scenarios a homegrown implementation
will not have.

See [consensus](/06-distributed-systems/consensus.md).

## Mental Model

**Election is not choosing a leader; it is guaranteeing there are not two.** The whole mechanism
serves that second part.

## When to Use

- An operation has to happen in exactly one place — scheduling, a migration, compaction.
- Single-leader replication needs automatic failover.
- There is a resource that does not admit concurrent access across nodes.

## When Not to Use

**When the operation is commutative.** It needs no coordination.

**When it can be idempotent and executed by everyone.** See
[idempotency](/06-distributed-systems/idempotency.md): if executing N times is harmless, the election
is unnecessary.

**With no fencing, to protect an external resource.** The election guarantees one leader in the
group; it does not prevent a former leader from writing to a resource that does not participate in
the consensus.

**Implementing it from scratch.**

**When the minority side's unavailability is unacceptable.** There the answer is a leaderless
architecture, with the corresponding complications.

## Alternatives

- **Leaderless, with quorums** — replication with no central coordination.
- **Commutative operations** — avoids the need.
- **A distributed lock with a deadline** — for one-off coordination, not continuous. See
  [distributed locks](/06-distributed-systems/distributed-locks.md).
- **Partitioning** — instead of one leader for everything, one per partition, which distributes the
  load and the risk.

## Trade-offs

| With a leader | Leaderless |
|---|---|
| No write conflicts | Conflicts to resolve |
| Natural ordering | Ordering to establish |
| Simple reasoning | Complex |
| Write bottleneck | Distributed |
| Unavailable during an election | Always available |
| A point of failure, mitigated by failover | No single point |

## Failure Modes

**Split brain.** Two leaders writing.

**Leadership instability.** Repeated changes from aggressive detection.

**A former leader writing to an external resource.** With no fencing.

**An election that does not conclude.** With no majority available, the group stays leaderless.

**A detection false positive.** A healthy but slow leader is replaced unnecessarily.

## Common Mistakes

**Not using fencing when protecting an external resource.**

**Implementing your own election.**

**Detection that is too aggressive.**

**Allowing the minority side to accept writes.** It nullifies the whole protection.

**Assuming the old leader realizes it lost.**

## Real-World Example

A batch processing system used leader election to guarantee that only one instance executed the
nightly closing routine.

The implementation was homegrown: a row in a table with a timestamp. Whoever managed to update it
first was leader for 5 minutes.

It worked for two years. Then a long garbage collection pause on one instance produced the classic
scenario.

Instance A obtained the leadership and started the closing. Midway, it suffered a 7-minute pause. The
lease expired. Instance B took over and started the closing from scratch.

Instance A came back from the pause **without knowing** it had lost the leadership — from its point
of view, nothing had happened — and kept writing from where it left off.

Two instances wrote accounting entries for the same closing. The reconciliation took three days.

The fix had two parts.

**Fencing.** Each leadership came to receive an increasing number, recorded along with each entry.
The entries table rejects a write with a number lower than the last accepted. Instance A, on coming
back, was rejected on its first write.

**A tested coordination service** instead of the homegrown implementation, with a lease renewed by
heartbeat and an explicit leadership check before each block of writes.

What makes this case instructive is that the problem was not the election — it worked, and B was
correctly elected. The problem was **A not knowing it had lost**, and no mechanism preventing it from
writing.

Fencing is the only defense that works in that scenario, because it does not depend on the former
leader realizing anything.

## Related Concepts

- [Consensus](/06-distributed-systems/consensus.md) — the mechanism that underpins the election.
- [Distributed Locks](/06-distributed-systems/distributed-locks.md) — the same problem at a smaller
  scale.
- [Failure Detection](/06-distributed-systems/failure-detection.md) — why it is a heuristic.
- [Network Failure](/06-distributed-systems/network-failure.md) — split brain.

## Practical Exercise

If your system has an operation that "only one instance can execute", find out how that is
guaranteed.

Then ask the question from the case above: if the elected instance suffers a long pause and comes
back, what prevents it from continuing to write?

## Interview Questions

- Why does leader election require a majority?
- What is fencing and why is it necessary even with a lease?
- Why does the minority side of a partition have to stop accepting writes?

## Further Reading

- Kleppmann, Martin. *How to do distributed locking*, 2016 — the argument about fencing.
- Ongaro, Diego; Ousterhout, John. *In Search of an Understandable Consensus Algorithm (Raft)*, 2014.
- Burrows, Mike. *The Chubby Lock Service*. OSDI, 2006.
