---
id: distributed-transactions
title: Distributed Transactions
sidebar_position: 35
description: Atomic commit across services — what 2PC promises, what it blocks, and why it is rarely the answer.
doc_type: pattern
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes the real cost of two-phase commit and knows which
  alternatives solve the same problem without it.
prerequisites: [distributed-fundamentals, partial-failure]
related: [sagas, consensus, idempotency]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Distributed Transactions

## Overview

A distributed transaction tries to extend a database's atomicity to multiple participants: either
all commit, or none does.

The classic mechanism is **two-phase commit** (2PC). It works, and the price is high enough that
most modern systems choose something else.

This document exists so that the choice is informed, not reflexive.

## Problem

A business operation frequently touches more than one store: debiting one account and crediting
another, reserving stock and recording an order, creating a user and provisioning a resource.

In a local transaction, the database guarantees atomicity. Across services or databases, there is no
such guarantee — each participant commits or fails independently.

The result with no coordination is partial state: money debited and not credited, an order recorded
with no stock reserved.

## Core Concepts

### How 2PC works

A **coordinator** runs the protocol:

```text
Phase 1 — prepare
  coordinator → each participant: "can you commit?"
  participant: persists the intent, locks the resources, answers yes/no

Phase 2 — decide
  if everyone said yes → "commit"
  if any said no       → "abort"
```

The guarantee comes from phase 1: on answering "yes", the participant commits to being able to
commit later, even if it restarts. It holds the locks until phase 2.

### The blocking problem

Between answering "yes" and receiving the decision, the participant is **prepared** — with resources
locked and no authority to decide on its own.

If the coordinator fails in that interval, the participant is stuck waiting for the decision. It
cannot commit (it does not know whether everyone agreed) nor abort (committing may have been
decided).

The wait is not necessarily infinite: the XA specification provides for a **heuristic decision** —
after some time in doubt, the resource manager can break the wait and decide on its own, releasing
the locks. The price is that participants may decide differently, and the transaction ends in a mixed
outcome: part committed, part rolled back. It is atomicity being traded for availability, without the
application taking part in the choice — and the record of it usually goes to a log nobody reads.

That is **2PC's blocking**, and it is the main reason to avoid it: the coordinator's unavailability
propagates to every participant, locking resources other operations need.

In practice, that shows up as a database locked with pending transactions requiring manual
intervention.

### The coordinator is a single point

Making the coordinator fault-tolerant requires [consensus](/06-distributed-systems/consensus.md) —
which adds latency and complexity to a protocol that is already expensive.

Systems that do that correctly exist. Most implementations use a simple coordinator, with the risk of
blocking.

### The cost of latency and coupling

2PC requires two round trips to every participant, with persistence in each phase.

Beyond that, it **couples availability**: the transaction only succeeds if every participant is
available simultaneously. With five participants at 99.9% each, the combined availability drops to
99.5%.

See [partial failure](/06-distributed-systems/partial-failure.md). Each participant added reduces the
probability of success.

### Where 2PC is still reasonable

It is not always wrong:

- Few participants, on the same local network.
- Short transactions, with short-lived locks.
- A highly available coordinator.
- Low volume.
- A mature transaction manager handling the edge cases.

Outside those conditions, the cost dominates.

## Mental Model

**2PC trades availability for atomicity, and the trade gets worse with each participant added.**

## When to Use

- Few participants, close together, with short transactions.
- Strict atomicity required and compensation unacceptable.
- Mature transaction infrastructure already available.
- Volume low enough that blocking is manageable.

## When Not to Use

**Between services from different teams.** It couples lifecycle and availability — it contradicts the
reason for separating the services.

**With many participants.** The combined availability collapses.

**With long transactions.** Long-lived locks kill throughput.

**Across regions.** The latency multiplies.

**With no fault-tolerant coordinator.** The blocking will happen.

**When compensation is acceptable.** See [sagas](/06-distributed-systems/sagas.md) — it solves the
same problem without locking.

**When the problem is modeling.** If the operation has to be atomic, perhaps the data should be in
the same place. Frequently the boundary between services was drawn in the wrong place.

The last is the most valuable observation: the need for a distributed transaction is frequently a
symptom of a mistaken decomposition.

## Alternatives

- **[Sagas](/06-distributed-systems/sagas.md)** — a sequence of local transactions with compensation.
- **Transactional outbox** — writes the change and the event in the same local transaction, and
  publishes later. It solves the most common case without 2PC.
- **[Idempotency](/06-distributed-systems/idempotency.md) with retries** — instead of atomicity,
  guaranteeing that repetition converges.
- **Bringing the data together** — if atomicity is essential, putting it in the same store.
- **Eventual consistency with reconciliation** — accepting temporary divergence and correcting it.

The transactional outbox deserves emphasis: the most common "I need 2PC" scenario is "update the
database and publish an event", and it solves that with a local transaction plus a publishing
process.

## Trade-offs

| 2PC | Saga | Outbox |
|---|---|---|
| Strict atomicity | Eventual consistency | Eventual |
| Short, unmodelled inconsistency window | Explicit intermediate states | Explicit |
| Locks resources | No locks | No locks |
| Blocks if the coordinator goes down | No critical coordinator | No coordinator |
| Combined availability | Each step independent | Local |
| No compensation logic | Compensation to write | No compensation |
| Scales badly | Scales | Scales |

## Failure Modes

**Pending transaction.** The coordinator goes down between the phases; the participants lock.

**Mixed heuristic outcome.** The coordinator decides to abort, and a participant that had already
broken out of the doubt on its own had already committed. The transaction ends partially applied, and
reconciling it is manual work.

**Heuristic recovery.** An operator manually resolves a pending item, possibly inconsistently with
the other participants.

**Contention.** Long-lived locks serialize unrelated operations.

**Cascading unavailability.** One slow participant locks all the others.

## Common Mistakes

**Using 2PC out of an atomicity reflex.** The question that goes unasked is whether the business
accepts compensation — and it almost always does, because it already compensates outside the
software: refund, cancellation, adjustment.

**Not considering that the service boundary is wrong.** Needing atomicity between two services is
usually a symptom that that data belongs to the same owner. 2PC treats the symptom and freezes the
wrong boundary.

**A coordinator with no high availability.** It becomes a single point of failure for every
participant at once — and its failure does not bring the system down, which would be visible: it
locks resources, which is harder to diagnose.

**Not measuring the lock duration.** It is what happened in the Real-World Example: an external query
inside the prepared phase held locks for tens of seconds, and operations for the same customer piled
up behind it.

**Ignoring the transactional outbox** for the "database + event" case — which is most of the cases
where anyone considers 2PC.

## Real-World Example

A logistics platform had an operation that created the shipment, reserved the vehicle's capacity and
debited the customer's credit — three services, three databases.

The implementation used 2PC with a transaction manager.

It worked for two years, with recurring incidents:

**Long locks.** The credit service queried an external system inside the prepared phase. When that
system got slow, the lock on the customer's record lasted tens of seconds, and other operations for
the same customer queued up.

**Manual pending items.** About twice a month, the coordinator restarted during a transaction and
left participants locked. There was a documented manual procedure.

**Combined unavailability.** Any one of the three services being unavailable took down the whole
operation, even when that service's step was not urgent.

The migration to a saga changed the model.

**A sequence with compensation.** Create shipment → reserve capacity → debit credit. Each step is a
local transaction. A failure at any point triggers the compensations for the previous steps.

**Explicit intermediate states.** The shipment came to have an "awaiting confirmation" state visible
in the interface — under 2PC the intermediate state existed just the same, it simply had no name and
no declared duration, and that is why nobody handled it.

**Idempotency at every step.** See [idempotency](/06-distributed-systems/idempotency.md).

What changed operationally: the manual pending items disappeared, and so did the contention. The
operation came to succeed even with the credit service temporarily slow — the debit happens with a
delay.

What got worse: the "awaiting confirmation" state had to be handled in five screens and two reports,
and compensating the debit required a new business rule — what to do if the credit was already
consumed.

The team considers the trade clearly positive, and records that the work of modeling the
compensations was larger than the initial estimate, by a wide margin.

## Related Concepts

- [Sagas](/06-distributed-systems/sagas.md) — the main alternative.
- [Partial Failure](/06-distributed-systems/partial-failure.md) — the underlying problem.
- [Consensus](/06-distributed-systems/consensus.md) — what a reliable coordinator requires.
- [Idempotency](/06-distributed-systems/idempotency.md) — what the alternative requires.

## Practical Exercise

Find an operation in your system that touches more than one store. Ask: what happens today if it
fails midway?

If the answer is "we don't know", that is the real state — neither 2PC nor a saga, just untreated
partial state.

## Interview Questions

- What happens if the 2PC coordinator fails between the phases?
- Why does availability get worse with each participant?
- What problem does the transactional outbox solve?

## Further Reading

- Gray, Jim; Reuter, Andreas. *Transaction Processing: Concepts and Techniques*. Morgan Kaufmann,
  1992.
- Bernstein, Philip; Newcomer, Eric. *Principles of Transaction Processing*. Morgan Kaufmann, 2009.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — chapter 4.
