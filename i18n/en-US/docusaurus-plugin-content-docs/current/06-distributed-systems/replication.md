---
id: replication
title: Replication
sidebar_position: 13
description: Keeping copies of the same data — for availability, for read scale, and at the cost of divergence.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses replication topology and acknowledgment mode from
  what the business accepts losing and waiting for.
prerequisites: [consistency]
related: [partitioning, leader-election, conflict-resolution]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Replication

## Overview

Replication is keeping copies of the same data on different nodes.

It exists for three distinct reasons — **availability**, **read scale** and **geographic
proximity** — and each one admits different configurations.

The cost is a single and unavoidable one: the copies diverge, and someone has to decide what to do
about it.

## Problem

With one copy, a node failure is loss of data and of service.

With copies, the failure is tolerable — and the question that organizes the whole subject arises:
**when is a write considered done?**

If it is when it reaches the primary node, the response is fast and an immediate failure loses the
write.

If it is when it reaches every replica, nothing is lost and the write pays the latency of the
slowest — and fails if any of them is down.

Between the two extremes there is a spectrum, and the position on it is a business decision
disguised as configuration.

## Core Concepts

### The topologies

**Single leader.** One node accepts writes and propagates them. Simple, with no write conflicts,
and the leader is a write bottleneck and a point of failure — mitigated by
[leader election](/06-distributed-systems/leader-election.md).

**Multiple leaders.** Several nodes accept writes, typically one per region. Local, fast writes,
and **conflicts are inevitable** — the same row changed in two places. See
[conflict resolution](/06-distributed-systems/conflict-resolution.md).

**Leaderless.** Any node accepts writes and reads; consistency comes from requiring quorums. High
availability, and the application deals with concurrent versions.

The vast majority of systems use a single leader, and rightly so: the other two topologies exist
for specific requirements and cost conflicts.

### Synchronous, asynchronous and semi-synchronous

The acknowledgment mode decides what is lost in a failure:

| Mode | Acknowledges when | Loses on failure | Latency |
|---|---|---|---|
| Asynchronous | The leader wrote | Writes not yet propagated | Minimal |
| Semi-synchronous | At least one replica acknowledged | Only if the leader and that replica go down together | One round trip |
| Fully synchronous | All acknowledged | Nothing | That of the slowest replica |

Fully synchronous is rare in practice: a slow or absent replica makes every write slow or
impossible.

**Semi-synchronous is the middle ground used by most serious systems** — and quorum configuration
is its modern form.

### Quorum

The generalization: with N replicas, require W acknowledgments on write and R on read.

If `W + R > N`, read and write overlap on at least one replica, and the read observes the most
recent write.

```text
N = 3, W = 2, R = 2  →  2 + 2 > 3  ✓ consistent
N = 3, W = 1, R = 1  →  1 + 1 < 3  ✗ can read stale data
```

Adjusting W and R moves the system along the spectrum between latency and consistency — which is
exactly the "else" of [PACELC](/06-distributed-systems/pacelc.md).

### Replication lag is the missing metric

The lag between the write on the leader and its appearance on the replica is the most important
metric in replication, and the least monitored.

It is not constant: it grows under write load, during maintenance, and when the replica is doing
something else. A lag of milliseconds in the normal case can become minutes at peak.

With no monitoring, nobody knows how stale a replica's data can be — and the decision to read from
it was made assuming a lag nobody verified.

### Failover is not free

Promoting a replica to leader involves deciding **whom to promote**, ensuring the old leader stops
accepting writes, and dealing with writes it accepted and did not propagate.

The third point is where data is lost, and the second is where
[split brain](/06-distributed-systems/leader-election.md) is born.

## Mental Model

**How much does the business accept losing, and how much does it accept waiting?** The two answers
determine the acknowledgment mode.

## When to Use

- Availability requires tolerating a node failure.
- The read load exceeds one node's capacity.
- Geographically distributed users need local reads.
- There is a disaster recovery requirement in another region.

## When Not to Use

**Asynchronous replication when loss is unacceptable.** A financial system with asynchronous
acknowledgment loses transactions confirmed to the customer.

**Multiple leaders with no conflict strategy.** The conflicts will happen, and the default
resolution — last writer wins — discards data silently.

**Reading from a replica in an operation that does not tolerate lag.** See
[consistency](/06-distributed-systems/consistency.md).

**Replication as a substitute for backups.** It propagates the error: an accidental `DELETE` is
replicated in milliseconds. Backups protect against human error; replication does not.

**Without monitoring the lag.** It is operating blind.

## Alternatives

- **Backup and restore** — for durability, not for availability.
- **[Partitioning](/06-distributed-systems/partitioning.md)** — for write scale, which replication
  does not solve.
- **Cache** — for read scale, cheaper than a replica in some cases.
- **A single node with fast recovery** — legitimate when the RTO allows.

## Trade-offs

| More replicas | Fewer |
|---|---|
| More fault tolerance | Less |
| More read capacity | Limited |
| Slower writes with a larger quorum | Faster |
| More divergence to manage | Less |
| Infrastructure cost | Lower |

| Synchronous | Asynchronous |
|---|---|
| Nothing is lost | A loss window |
| Latency of the slowest replica | Local latency |
| A replica being down blocks writes | Does not block |

## Failure Modes

**Loss during failover.** Writes acknowledged by the leader and not propagated.

**Split brain.** Two leaders after a partition.

**Growing lag.** The replica does not keep up and falls further behind.

**Silent conflict.** With multiple leaders, the default resolution discards one of the writes with
no warning.

**A replica used as a backup.** The human error is replicated.

**Reading from a replica in a critical operation.** A decision made on stale data.

## Common Mistakes

**Not monitoring replication lag.**

**Confusing replication with backups.**

**Adopting multiple leaders without understanding conflicts.**

**Not testing the failover.** A failover mechanism never exercised fails when it is needed.

**Configuring a quorum without checking `W + R > N`.**

## Real-World Example

An orders system used asynchronous replication with one replica, for failover.

The failover had never been tested in production.

During a hardware failure of the primary, promoting the replica took 4 minutes — manually, because
the automated process did not exist.

When it came back, it turned out that 1,800 orders confirmed to customers were not on the replica.
They had been written to the primary and not propagated before the failure.

The replication lag, which nobody monitored, was at 90 seconds at the moment of the failure —
because a reporting process ran at that hour and consumed the replica.

Three fixes, in order of effect.

**Semi-synchronous acknowledgment.** The write came to require acknowledgment from at least one
replica before responding to the customer. Measured cost: 6 ms extra per write. The business
accepted immediately when the cost was presented next to the alternative.

**A second replica.** With two, requiring one acknowledgment does not leave the write hostage to a
replica under maintenance.

**Monitoring and an alert for lag** above 5 seconds. The nightly report was moved to a dedicated
replica.

And the failover came to be exercised quarterly, in production, in an agreed window. On the first
run, three configuration problems appeared — all of which would have caused an incident during a
real failure.

## Related Concepts

- [Partitioning](/06-distributed-systems/partitioning.md) — the other way to distribute data.
- [Leader Election](/06-distributed-systems/leader-election.md) — how failover chooses.
- [Conflict Resolution](/06-distributed-systems/conflict-resolution.md) — with multiple leaders.
- [Consistency](/06-distributed-systems/consistency.md) — what the read observes.

## Practical Exercise

Find out three things about your system's replication: the acknowledgment mode, the current lag,
and when the failover was last tested.

If the answer to the third is "never", the recovery mechanism is a hypothesis.

## Interview Questions

- What are the replication topologies and what does each one cost?
- What does the `W + R > N` condition guarantee?
- Why does replication not replace backups?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 5.
- PostgreSQL's replication documentation on synchronous modes.
