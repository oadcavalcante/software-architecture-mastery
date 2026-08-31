---
id: consensus
title: Consensus
sidebar_position: 17
description: Making several nodes agree — the hardest problem in the field, and the one you should consume instead of implement.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader understands what consensus guarantees, what it costs, and why
  implementing it is almost always the wrong decision.
prerequisites: [leader-election]
related: [leader-election, distributed-locks, cap]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Consensus

## Overview

Consensus is making a group of nodes agree on a value, in such a way that the decision is unique,
final and survives failures.

It is the most studied problem in distributed systems, and the easiest to implement wrongly. This
document's practical recommendation is direct: **consume consensus, do not implement it.**

## Problem

Several decisions have to be unique: who the leader is, what the next sequence number is, whether a
transaction was committed, what the cluster's current configuration is.

If two nodes arrive at different answers, the system becomes incoherent in an unrecoverable way.

What makes it hard is not agreeing when everything works — it is agreeing **despite** nodes that go
down, messages that are lost and slow nodes that look dead.

And there is an uncomfortable theoretical result: the FLP theorem shows that, in an asynchronous
system where a node can fail, **no algorithm guarantees consensus in finite time**. Not because the
algorithms are bad — it is impossible.

## Core Concepts

### What the FLP result means in practice

It does not say consensus is unviable. It says no algorithm can simultaneously guarantee correctness
and termination in a perfectly asynchronous system.

Practical algorithms work around it using **time**: timeouts to suspect failure. That sacrifices the
theoretical guarantee of termination — under pathological conditions, the election may not conclude
— in exchange for working in practice.

What they never sacrifice is **safety**: even if they do not decide, they never decide wrongly. Two
conflicting decisions are impossible.

That is the correct hierarchy: safety always, progress when the network cooperates.

### A majority is the mechanism

All practical algorithms rest on the same idea: **a decision requires the majority's agreement.**

Since there are no two disjoint majorities, there cannot be two conflicting decisions.

The operational consequence: with N nodes, the system tolerates `(N-1)/2` failures.

```text
3 nodes → tolerates 1 failure
5 nodes → tolerates 2
7 nodes → tolerates 3
```

Even numbers do not help: 4 nodes tolerate 1 failure, the same as 3, with more coordination cost.
That is why consensus clusters have an odd number of nodes.

### The cost

Each decision requires at least one round trip with the majority. That means:

**Latency.** A coordinated write costs the latency to the majority — which in a multi-region
configuration is the geographic distance.

**Limited throughput.** Every decision goes through the leader and the majority. Consensus does not
scale horizontally: adding nodes **worsens** the latency, because the majority gets larger.

**Unavailability under a partition.** The minority side decides nothing. See
[CAP](/06-distributed-systems/cap.md).

That is why consensus is used for the **control plane** — who the leader is, what the configuration
is — and rarely for the data plane, where the volume is high.

### The algorithms

**Paxos.** The original, correct and notoriously hard to understand and implement.

**Raft.** Designed to be understandable, with the same guarantee. It is what most modern systems
use.

**Zab.** ZooKeeper's, similar in spirit.

The difference between them is one of understandability and operational detail, not of guarantee.

### Where you already use consensus

Most systems use consensus without anyone implementing it:

Distributed databases, to elect a partition leader. Coordination systems, to maintain configuration.
Container orchestrators, for cluster state. Streaming platforms, for partition metadata.

The practical decision is almost never "implement consensus". It is "use a system that already
implements it" — and choosing which.

## Mental Model

**Consensus trades availability and latency for certainty.** You pay coordination to never have two
answers.

## When to Use

- The decision has to be unique and final.
- Two divergent answers would be unrecoverable.
- The volume of decisions is low — the control plane, not the data plane.
- The minority side's unavailability is acceptable.

## When Not to Use

**For a high-volume data plane.** The per-operation coordination latency makes it unviable.

**When the operation is commutative.** If order does not matter, there is nothing to coordinate.

**When idempotency solves it.** Executing twice with no additional effect removes the need for a
single-execution guarantee.

**When availability under a partition is a requirement.** Consensus is CP by construction.

**Implementing it yourself.** It is this document's strongest recommendation.

## Alternatives

- **An off-the-shelf coordination service** — ZooKeeper, etcd, Consul. Consensus as a service.
- **A database with transactions** — for many cases, a transaction in a single database gives the
  necessary guarantee with no consensus cluster.
- **Commutative operations** — avoiding the need. See
  [conflict resolution](/06-distributed-systems/conflict-resolution.md).
- **Idempotency** — allowing multiple execution instead of guaranteeing a single one.
- **A lock with a deadline and fencing** — weaker and sufficient for one-off coordination. See
  [distributed locks](/06-distributed-systems/distributed-locks.md).

## Trade-offs

| With consensus | Without |
|---|---|
| A unique decision guaranteed | Divergence possible |
| Safety under any failure | Depends on luck |
| Coordination latency per decision | Local latency |
| Unavailable with no majority | Available |
| Limited throughput | Scales |
| High operational complexity | Low |

## Failure Modes

**Loss of quorum.** Enough failures that there is no majority: the cluster stops deciding. A cluster
of 3 with 2 nodes down does nothing.

**An even cluster.** No gain in tolerance and more latency.

**Consensus nodes in the same zone.** A zone failure takes down the majority — it nullifies the
purpose.

**Consensus on the critical data path.** Unacceptable latency discovered in production.

**A homegrown implementation with a subtle defect.** It works in the tests and violates safety under
a specific partition.

## Common Mistakes

**Implementing it from scratch.**

**Using an even number of nodes.**

**Putting every node in the same availability zone.**

**Using consensus where a database transaction would suffice.**

**Adding nodes expecting more performance.** More nodes mean a larger majority and more latency.

## Real-World Example

A team needed to guarantee that only one instance executed a financial reconciliation routine. The
initial proposal was to build their own consensus cluster, with three nodes, implementing Raft.

The estimate was two months. The review changed the path with two questions.

**"Is the routine idempotent?"** It was not, and it could be. It posted adjustment entries; adding a
key per reconciliation period and checking before posting made multiple execution harmless.

**"If it executes twice, what actually happens?"** With idempotency, nothing. Without it, duplicated
entries.

With the routine idempotent, the single-execution guarantee stopped being necessary. All that
remained was avoiding the waste of executing twice — which a simple lock with a deadline in the
database solves, with no cluster at all.

The implementation took three days.

Two years later, there was an occasion when two instances executed simultaneously because of a lock
failure. The result was duplicated work and zero inconsistency — exactly what idempotency guarantees.

What the team learned: consensus would have solved the problem, and the problem did not need
consensus. The question that saved two months was "what happens if it executes twice?", and it comes
before any discussion of an algorithm.

## Related Concepts

- [Leader Election](/06-distributed-systems/leader-election.md) — the most common application.
- [Distributed Locks](/06-distributed-systems/distributed-locks.md) — the weaker alternative.
- [CAP](/06-distributed-systems/cap.md) — why consensus is CP.
- [Idempotency](/06-distributed-systems/idempotency.md) — what frequently removes the need for
  consensus.

## Practical Exercise

If your system has an operation that "can only happen once", answer: what happens if it happens
twice?

If the answer is "nothing serious", you do not need consensus — you need idempotency, which is far
cheaper.

## Interview Questions

- What does the FLP result assert, and how do practical algorithms work around it?
- Why do consensus clusters have an odd number of nodes?
- Why does adding nodes to a consensus cluster not increase throughput?

## Further Reading

- Ongaro, Diego; Ousterhout, John. *In Search of an Understandable Consensus Algorithm (Raft)*, 2014.
- Fischer, Michael; Lynch, Nancy; Paterson, Michael. *Impossibility of Distributed Consensus with One
  Faulty Process*. JACM, 1985.
- Lamport, Leslie. *Paxos Made Simple*, 2001.
