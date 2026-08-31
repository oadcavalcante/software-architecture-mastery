---
id: eventual-consistency
title: Eventual Consistency
sidebar_position: 31
description: The replicas converge — and the guarantee does not say when, which is exactly what the application needs to know.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs interfaces and processes that tolerate stale data, and
  negotiates the acceptable delay with the business.
prerequisites: [consistency]
related: [strong-consistency, conflict-resolution, replication]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Eventual Consistency

## Overview

Eventual consistency guarantees that, **in the absence of new writes**, all replicas eventually
converge on the same value.

The two parts the statement does not cover are the ones that matter in practice: it does not say
**when**, and the "absence of new writes" condition never occurs in real systems.

That does not invalidate the guarantee. It means the application has to be designed to observe
stale data — and that is the part usually forgotten.

## Problem

Eventual consistency is frequently adopted as a technical consequence — asynchronous replication,
caching, a read projection — with nobody having decided that the business accepts it.

The result is predictable. The user changes something and does not see it. A report shows a
different number from the screen. Two screens of the same system disagree.

None of those is a code defect. They are the chosen semantics — except nobody chose consciously,
and support finds out through the tickets.

## Core Concepts

### The guarantee is weak on purpose

It does not promise a deadline. A system that converges in 100 ms and one that converges in 6
hours both satisfy "eventual consistency".

That is why the relevant operational metric is not the guarantee — it is the **real convergence
lag**, measured and monitored. See
[replication](/06-distributed-systems/replication.md).

An eventually consistent system with no lag monitoring is a system in which nobody knows how stale
the data can be.

### What the application has to do

Three responsibilities that pass to the application:

**Tolerate stale reads.** The interface cannot assume that what was written appears immediately.

**Handle concurrent writes.** Two replicas can receive conflicting writes. See
[conflict resolution](/06-distributed-systems/conflict-resolution.md).

**Be idempotent.** Convergence frequently involves reapplying operations.

### Session guarantees solve most of the perception

The most valuable practical point in this document: **the user notices their own inconsistency, and
tolerates other people's.**

See [consistency](/06-distributed-systems/consistency.md). Guaranteeing "read your own writes" —
routing the author's reads to the primary for a short period — eliminates the dominant complaint at
a very low cost, without giving up read scaling for everything else.

Teams that adopt eventual consistency and do not implement that guarantee spend far more time
answering tickets than they would have spent implementing it.

### Design the interface for the delay

When the delay is unavoidable, the interface can make it understandable instead of confusing:

**Optimistic update.** Show the expected result immediately, and reconcile when it confirms. It is
what messaging apps do.

**Explicit state.** "Processing", "syncing" — instead of showing the old value as if it were
current.

**Update stamp.** "Data from 3 minutes ago" communicates honestly.

The third is the cheapest and the least used. A user who knows the data is lagging does not report
a defect.

### Convergence needs a mechanism

"Eventually converges" presupposes a mechanism that makes it converge: read repair, background
repair, periodic reconciliation.

Without it, divergent replicas can stay divergent indefinitely — which is not eventual consistency,
it is permanent inconsistency with a nice name.

### The lag is not constant

The most common sizing error is measuring replication lag under normal conditions, seeing 200 ms
and designing the system for that.

The lag has a long tail and it is dominated by predictable events:

**High write load.** The replica does not keep up and the lag grows cumulatively.

**Index or projection rebuild.** It can stop consumption entirely.

**Primary node failover.** The new replica can start behind.

**Maintenance and deployment.** The consumer is down for minutes.

At those moments, the lag does not go from 200 ms to 400 ms — it goes to minutes or hours. Product
decisions about what is acceptable have to be made with the high percentile on the table, not the
median.

## Mental Model

**Eventual consistency is a promise with no deadline.** The deadline is an operational property you
measure, not a guarantee you receive.

## When to Use

- The business tolerates the delay, and that was confirmed explicitly.
- Read scale or availability requires replicas.
- The data is naturally convergent — counters, aggregates, projections.
- Between bounded contexts, where strong consistency would couple them.

## When Not to Use

**Where the data controls a finite resource.** Stock, a seat, a balance. See
[strong consistency](/06-distributed-systems/strong-consistency.md).

**Where an irreversible decision depends on the value.** Authorizing, approving, releasing.

**Without confirming with the business.** It is a product decision, not an engineering one.

**Without monitoring the lag.** Operating blind.

**With no convergence mechanism.** Permanent divergence.

**Without handling conflicts.** The default resolution — last writer wins — discards data silently.

## Alternatives

- **[Strong consistency](/06-distributed-systems/strong-consistency.md)** — where the cost pays off.
- **Session guarantees** — the middle ground that solves the perception.
- **Causal consistency** — preserves the order between related operations.
- **Reading from the primary for critical operations** — strong where it matters, eventual for the
  rest.

## Trade-offs

| Eventual | Strong |
|---|---|
| Fast writes and reads | Coordination latency |
| Available under a partition | Unavailable |
| Read scaling | Limited |
| The application deals with stale data | Simple model |
| Conflicts to resolve | No conflicts |
| The interface has to communicate the delay | Direct |

## Failure Modes

**Permanent divergence.** With no convergence mechanism.

**A conflict resolved by silent discard.** Last writer wins, and the lost write was the important
one.

**A decision on stale data.** Approving with an outdated balance.

**Lag growing with no alert.** The replica falls further and further behind.

**A lying interface.** It shows the old value as if it were current.

## Common Mistakes

**Adopting it with no business decision.** Whoever accepts the inconsistency window is whoever
answers for its consequence. Engineering states the cost of closing it; it does not decide alone
that it is tolerable.

**Not implementing session guarantees.** Without read-your-own-writes, the user saves a change,
reloads the page and sees the old value — which is indistinguishable from a defect, and is the most
common bug report in eventually consistent systems.

**Not monitoring the lag.** The replication window is a number that varies with load. Without
measuring it, nobody knows whether it is milliseconds or minutes today, and the assumption used in
the design is never verified.

**Accepting the default conflict resolution without understanding it.** The default is usually last
writer wins, which discards data silently — and the decision of which write to lose ends up being
made by a machine's clock.

**Not communicating the delay in the interface.** "Processing" is honest and cheap; showing stale
data as if it were definitive transfers to the user an uncertainty they have no way to resolve.

## Real-World Example

A corporate internal social network moved its feed to read from replicas, with a typical 2-second
lag.

Three complaints appeared, and only one was actually eventual consistency.

**"I posted and it doesn't show."** Classic eventual consistency. Resolved with "read your own
writes": after posting, that user's reads go to the primary for 30 seconds. The complaint
disappeared.

**"The like counter goes backwards."** Reads alternating between replicas with different lags.
Resolved with monotonic reads — the user is pinned to one replica for the session.

**"A comment appears before the post."** It was not replication lag — it was
[ordering](/06-distributed-systems/ordering.md). Comment and post went to different partitions.
Resolved by the partition key.

The third is instructive because it was diagnosed twice as eventual consistency before someone
noticed the replica was up to date and the problem was something else.

And the decision the team recorded as the most important came before all of that: the conversation
with the business about the acceptable delay. The answer — "a few seconds for other people's
content, zero for your own" — is exactly the session guarantee policy, and it came from product,
not from engineering.

## Related Concepts

- [Consistency](/06-distributed-systems/consistency.md) — the full spectrum.
- [Strong Consistency](/06-distributed-systems/strong-consistency.md) — the other end.
- [Conflict Resolution](/06-distributed-systems/conflict-resolution.md) — what convergence requires.
- [Replication](/06-distributed-systems/replication.md) — where the lag comes from.

## Practical Exercise

List the screens in your system that read from a replica or a projection. For each one, answer: how
much delay does the business accept, and does the interface communicate it?

Then check whether "read your own writes" exists. It is the highest-return fix in this section.

## Interview Questions

- What does the eventual consistency guarantee not say?
- Why do session guarantees solve most of the complaints?
- What is necessary for convergence to actually happen?

## Further Reading

- Vogels, Werner. *Eventually Consistent*. ACM Queue, 2008.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Bailis, Peter; Ghodsi, Ali. *Eventual Consistency Today*. ACM Queue, 2013.
