---
id: stateless-vs-stateful
title: Stateless vs. Stateful
sidebar_position: 7
description: The property that decides what scales trivially — and why state does not disappear, it only moves.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader evaluates whether a component is genuinely stateless and knows
  where the state went when it seems to have vanished.
prerequisites: [state-management]
related: [load-balancing, scalability-basics, statelessness]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Stateless vs. Stateful

## Overview

A **stateless** component keeps nothing between requests: any instance can serve any
request, and the result is the same.

A **stateful** component remembers. Which instance serves it starts to matter.

The distinction decides nearly everything about scaling, deployment and failure
recovery.

## Problem

"Make the service stateless" is the most repeated advice in system design, and it is
frequently understood as if state could be eliminated.

It cannot. **State does not disappear — it moves.**

Making an application service stateless means pushing the state to the database, to the
distributed cache or to the client. That is a good decision, and it concentrates the
difficulty somewhere else rather than making it vanish.

The useful question is not "how do I eliminate state?". It is **"where do I concentrate
the state, and how much of the system can go without it?"**.

## Core Concepts

### What changes between the two

| | Stateless | Stateful |
|---|---|---|
| Horizontal scaling | Add an instance and you are done | Requires partitioning or replication |
| Load balancing | Any instance will do | Affinity or routing by key |
| Restarting | No loss | Loss or recovery |
| Deployment | Replace instances freely | Coordination, state migration |
| Instance failure | The request is redirected | The state has to be replicated |
| Recovery | Start another | Restore or re-elect |

The first line is the reason for all the rest: a stateless component scales by adding
copies, and that is the cheapest operation there is in systems.

### Stateless does not mean memoryless

A stateless component can have a local cache, counters and open connections. The
criterion is not "keeps nothing" — it is **"nothing it keeps affects the correctness of
the next request"**.

A local cache that, if lost, only makes the request slower does not break statelessness.
An attempt counter that decides whether an operation is allowed does.

### The disguises of state

State usually hides where nobody looks:

**Session affinity in the load balancer.** If the system requires the user to come back
to the same instance, it has state — even if nobody declared it.

**A file on local disk.** In containers and functions, it vanishes.

**In-memory scheduling.** A process that triggers tasks every minute duplicates the work
when there are two instances, or loses it when the only one goes down.

**Long-lived connections.** A WebSocket is state: the client is tied to that instance.

**Memory-based idempotency.** Keeping already-processed identifiers locally fails with
multiple instances.

### State has to live somewhere prepared for it

Components designed for state — databases, distributed caches, queues — solve
replication, recovery and consistency as their main function.

An application service improvising that solves it badly. It is the reason to concentrate
state in them rather than spreading it.

## Mental Model

**If I kill this instance mid-operation and the next request goes to another one, does
something break?** If so, there is state — and it needs to be recognized.

## When to Use

Stateless is preferable when:

- The component needs to scale horizontally.
- The load is variable and instances come and go.
- Deployment needs to be frequent and uncoordinated.
- An instance failure cannot cause loss.

Stateful is necessary when:

- The data has to persist — a database.
- The latency of accessing the state is critical and the network does not fit.
- The protocol requires a continuous connection — streaming, WebSocket, games.
- There is coordination that requires a leader — see
  [leader election](/06-distributed-systems/leader-election.md).

## When Not to Use

**Chasing statelessness where state is essential.** A database is stateful by nature;
trying to make it stateless makes no sense.

**Pushing everything to the client.** A token that carries too much travels on every
request and cannot be revoked.

**Pushing everything to the database.** A service that queries the database on every
trivial operation trades local state for latency and load.

**Treating it as binary.** Real components have gradations — the question is how much of
the system can be stateless, not whether all of it can.

## Alternatives

- **Shared external state** — a distributed cache or a database.
- **State in the client** — a token, for the session.
- **Partitioning by key** — keep the state local, routing each key always to the same
  instance. It is the model of stateful systems that scale.
- **Recompute** — when deriving is cheaper than keeping.

## Trade-offs

| Stateless | Stateful |
|---|---|
| Scales by adding instances | Scales by partitioning |
| No loss on failure | Requires replication |
| Trivial deployment | Coordinated |
| Latency of accessing external state | Local access |
| Load on shared storage | Distributed |
| Simple to operate | Difficult |

The fourth and fifth lines are the real cost of statelessness, and what keeps you from
taking it to the extreme: every piece of state pushed outside becomes a network call and
load on a shared component.

## Failure Modes

**Statelessness assumed and false.** The system works with one instance and breaks with
two.

**Affinity hiding the problem.** It works until one instance goes down.

**Duplicated scheduler.** Two instances triggering the same task.

**Local idempotency.** Duplication when the retry lands on another instance.

**External state becoming a bottleneck.** The whole system stateless, and the database
saturated.

## Common Mistakes

**Thinking state disappeared.** It moved.

**Not looking for the disguises.** Affinity, local disk, scheduling and long
connections.

**Testing with one instance.** The defect only appears with two.

**Pushing state to the client without thinking about revocation.**

**Ignoring the load statelessness creates on shared storage.**

## Real-World Example

An import service processed files uploaded by customers. Declared stateless, with four
instances behind a load balancer.

Three defects showed up in production, all of the same kind.

**Chunked upload.** The client sent the file in chunks; the service assembled it on local
disk. With four instances, the chunks landed on different machines and the assembly
failed. It worked in staging, which had one instance.

**Per-customer rate limit.** Counted in memory. Each instance counted separately, and the
effective limit was four times the configured one.

**Reprocessing schedule.** An in-memory loop fired every five minutes. All four instances
fired, and each file was reprocessed four times.

None of the three was documented as state. All of them were.

The fixes: chunked upload moved to object storage, with assembly triggered by an event on
receiving the last chunk. The rate limit moved to the distributed cache. And the schedule
left the service for an external scheduler, which fires once and delivers to a queue.

After that the service became genuinely stateless — and the verification was concrete:
kill one instance mid-processing and confirm that another continues.

## Stateful systems that scale

Statelessness is not the only way to scale. Stateful systems scale by
**partitioning**, and the mechanism is worth understanding — databases, distributed
caches and streaming platforms all use it.

The idea: each instance owns a subset of the keys. A routing function decides which
instance serves each key, and the state for that key always lives in the same place.

```text
hash(key) → instance
  user 8891 → instance 2
  user 1204 → instance 5
```

That preserves locality — the state is where it is used — and allows adding capacity by
adding instances.

The cost shows up in three places. **Operations that cross partitions** become expensive:
combining data from two keys on different instances requires coordination.
**Rebalancing** when adding or removing an instance moves state, and it is the most
delicate moment in operations. And **imbalance** happens if one key is far more active
than the others — the [hotspot](/11-scalability/index.md).

Consistent hashing reduces the cost of rebalancing: adding an instance moves only a
fraction of the keys, not all of them.

The practical conclusion: **statelessness is cheaper, partitioning is more powerful.**
Use the first wherever it fits and the second where state is essential.

## Related Concepts

- [State Management](/05-system-design/state-management.md) — the types and where each
  one lives.
- [Load Balancing](/05-system-design/load-balancing.md) — where affinity shows up.
- [Scalability](/11-scalability/index.md) — the practical consequence.
- [Background Processing](/05-system-design/background-processing.md) — the scheduler
  case.

## Practical Exercise

Pick a service you consider stateless and run the concrete test: start two instances and
kill one mid-operation.

Then look for the five disguises — affinity, local disk, in-memory scheduling, long
connections, local idempotency. One of them is usually there.

## Interview Questions

- What does it mean for a component to be stateless?
- Where does the state go when a service becomes stateless?
- Name three places where state hides without being declared.

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Burns, Brendan. *Designing Distributed Systems*. O'Reilly, 2018.
