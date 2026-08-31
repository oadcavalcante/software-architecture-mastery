---
id: conflict-resolution
title: Conflict Resolution
sidebar_position: 33
description: Two concurrent writes to the same data — and why "last writer wins" discards data in silence.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses a resolution strategy aware of what it discards, and
  recognizes when the model can avoid the conflict.
prerequisites: [eventual-consistency]
related: [replication, clock-and-time, eventual-consistency]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Conflict Resolution

## Overview

When two concurrent writes change the same data on different replicas, the system has to decide
which value prevails.

Most systems' default strategy — **last writer wins** — is simple, is what most people use without
knowing, and **discards data silently**.

## Problem

Conflicts arise whenever more than one place can accept writes for the same data: multi-leader
replication, leaderless replication, applications with offline operation, or any system that keeps
accepting writes during a [partition](/06-distributed-systems/network-failure.md).

The concrete case: two users edit the same record at the same time, on different replicas. Both
writes are accepted. On convergence, one of them disappears.

Nobody is notified. The user whose write was discarded believes it was saved, because the system
responded with success.

## Core Concepts

### Last writer wins, and its problem

The strategy compares timestamps and keeps the most recent.

Two problems, and both are serious.

**Clocks diverge.** The "most recent" according to the machine's clock may not be the most recent in
fact. See [clocks and time](/06-distributed-systems/clock-and-time.md). A machine whose clock is 2
seconds ahead always wins.

**Silent loss.** The discarded write disappears with no record. There is no error, no alert, no way
to recover.

It is suitable when the data is genuinely disposable — telemetry, a cache, a vehicle's current
position. It is unsuitable for business data, and it is the default in several systems.

### The alternatives

**Detect and preserve both.** The system keeps both versions and returns both on read, so that the
application or the user resolves it. It is what systems like Dynamo do with version vectors.

It preserves everything, and transfers the decision to whoever consumes it — which requires an
interface for that.

**Merge by domain rule.** A shopping cart can combine the items from both versions. A counter can
sum the increments. The rule comes from the business.

**Structures that converge on their own.** Data types designed so that concurrent operations always
converge with no coordination — CRDTs. Counters, sets, maps and even collaborative text.

Elegant and limited to what can be expressed as a commutative operation.

**Avoid the conflict.** Ensure each piece of data has a single write point — through
[partitioning](/06-distributed-systems/partitioning.md) or through a single leader.

The last is what most systems should choose, and the least discussed.

### Detecting a conflict requires versioning

Comparing timestamps does not detect a conflict — it detects order, badly.

To know that two writes were **concurrent** — neither knew about the other — you need a version
vector: each replica maintains a counter, and comparing the vectors reveals whether one write
descended from the other or whether they were parallel.

Without that, the system does not distinguish "B replaced A" from "A and B were made at the same
time".

### Operations instead of values

A modeling change that eliminates many conflicts: recording **what was done** instead of **the
result**.

```text
value:      balance = 150     ← two writes conflict
operation:  balance -= 50     ← two operations compose
```

Commutative operations — adding, adding to a set — do not conflict. It is the basis of CRDTs and a
technique applicable without them.

### A conflict may have no automatic resolution

Some conflicts require human judgment: two editors changed the same paragraph in incompatible ways.

In those cases, the correct answer is **to preserve both and present them** — not to choose one. A
system that chooses on its own is discarding information it has no way to evaluate.

## Mental Model

**Every resolution strategy chooses what to lose.** The question is whether you chose, or whether
the default chose for you.

## When to Use

A resolution strategy is necessary whenever there is more than one write point. The choice among
them:

- **Last writer wins** — disposable data, where losing is acceptable.
- **Preserve both** — business data where loss is unacceptable.
- **Merge by rule** — when the domain defines a natural union.
- **CRDT** — when the operations are commutative.
- **Avoid** — whenever possible.

## When Not to Use

**Last writer wins for business data.** Silent discard.

**Automatic resolution when the judgment is human.** Choosing on your own produces loss nobody can
reverse.

**Multiple leaders with no defined strategy.** The default will decide.

**Comparing timestamps across machines.** It is not reliable.

**A CRDT when the operation is not commutative.** The structure does not apply.

## Alternatives

- **A single leader per piece of data** — eliminates the conflict. See
  [replication](/06-distributed-systems/replication.md).
- **Partitioning by key** — each key written in only one place.
- **A transaction with a lock** — serializes the concurrent writes.
- **Reservation with a deadline** — whoever reserved writes; the others wait.

## Trade-offs

| Last writer wins | Preserve both | CRDT |
|---|---|---|
| Trivial | Requires a resolution interface | Requires specific modeling |
| Discards silently | Nothing is lost | Nothing is lost |
| No extra state | Versions kept | Convergence metadata |
| Depends on the clock | Does not | Does not |
| Any data | Any data | Only commutative operations |

## Failure Modes

**Silent loss.** The discarded write is never reported.

**A clock that is ahead always winning.** An unsynchronized machine dominates.

**Versions accumulating.** Preserving both with no resolution interface makes the number of versions
grow.

**A merge that produces an invalid state.** Combining two carts can exceed the item limit.

**A conflict not detected.** Without a version vector, the system does not know there was
concurrency.

## Common Mistakes

**Accepting the default without knowing what it is.**

**Adopting multiple leaders with no strategy.**

**Not recording when a conflict occurs.** With no metric, nobody knows the frequency.

**Assuming conflicts are rare without measuring.**

**Not considering avoiding the conflict.** It is the most robust solution.

## Real-World Example

A field sales app worked offline: the salesperson recorded orders with no connection and synchronized
later.

The server used last writer wins, comparing the device's timestamp.

Two problems.

**Device clocks.** Some devices had the wrong time — one was 3 hours ahead. Every synchronization
from it overwrote changes made by other salespeople afterwards, because the timestamp "won".

**Lost items.** Two salespeople on the same account added items to the same order offline. On
synchronizing, the second synchronization replaced the whole order — the first one's items
disappeared.

Neither generated an error. The salespeople found out through the customer's complaint.

The redesign changed the model, not just the strategy.

**Operations instead of state.** The device came to send "added item X", "removed item Y" — instead of
the complete order. Additions from different salespeople compose naturally.

**Version vectors** to detect real concurrency, instead of comparing timestamps.

**Domain resolution** for the remaining cases: a quantity change to the same item by two salespeople
generates an explicit conflict, presented to the supervisor to decide.

**A conflict metric.** Counting came into existence. It turned out that real conflicts were rare —
about 0.3% of synchronizations — and that the previous loss came mostly from the clock problem, not
from genuine concurrency.

That last number is what the team recorded as the most revealing: they had been losing data far more
often than real concurrency justified, and the cause was the strategy, not the scenario.

## Related Concepts

- [Eventual Consistency](/06-distributed-systems/eventual-consistency.md) — where conflicts arise.
- [Replication](/06-distributed-systems/replication.md) — multi-leader and leaderless.
- [Clocks and Time](/06-distributed-systems/clock-and-time.md) — why a timestamp does not decide.
- [Ordering](/06-distributed-systems/ordering.md).

## Practical Exercise

If your system has more than one write point for the same data, find out which resolution strategy is
configured.

Then ask: is there a metric for how many conflicts happen? If there is not, you do not know how much
is being discarded.

## Interview Questions

- Why is "last writer wins" problematic?
- How do you detect that two writes were concurrent?
- What makes an operation suitable for a CRDT?

## Further Reading

- DeCandia, Giuseppe et al. *Dynamo: Amazon's Highly Available Key-value Store*. SOSP, 2007.
- Shapiro, Marc et al. *Conflict-Free Replicated Data Types*, 2011.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 5.
