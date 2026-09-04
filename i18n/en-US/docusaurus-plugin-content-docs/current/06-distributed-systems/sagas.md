---
id: sagas
title: Sagas
sidebar_position: 36
description: Chained local transactions with compensation — and the real cost of modeling the undo.
doc_type: pattern
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs sagas with correct compensations and recognizes when
  compensation is not possible.
prerequisites: [distributed-transactions]
related: [idempotency, event-driven-systems, distributed-transactions]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Sagas

## Overview

A saga replaces the distributed transaction with a **sequence of local transactions**, each with a
**compensation** that undoes its effect.

If a step fails, the compensations for the previous steps are executed in reverse order.

What you gain: no distributed locks, no blocking coordinator, each step independent. What you pay:
visible intermediate states, and the obligation to model the undo — which is the hard part and the
most underestimated.

## Problem

Without a distributed transaction, a multi-step operation that fails midway leaves partial state.

The saga accepts that the partial state exists and makes it **temporary and handled** — instead of
invisible (2PC) or permanent (nothing).

The difficulty is not in the success flow. It is in answering, for each step, "how do I undo this?" —
and discovering that the answer does not always exist.

## Core Concepts

### Compensation is not rollback

A database rollback erases the effect as if it had never occurred. A compensation is a **new
operation** that produces the opposite effect.

```text
rollback:      the debit never existed
compensation:  there was a debit and there was a refund
```

The difference is visible to the business and to auditing. And it means there is a window in which
the uncompensated effect was visible — others may have observed it and acted on it.

### Not everything is compensable

The check that decides a saga's viability: for each step, is there a compensation?

**Compensable.** Reserve → release. Debit → refund. Record → cancel.

**Not compensable.** An email sent. A message published to an external channel. A call to a
third-party API with no cancellation operation. Printing. A physical shipment.

For non-compensable steps, the technique is **to order the saga so they come last** — after every
compensable step has already succeeded.

The reordering is what decides whether the saga has a point of return: with the non-compensable steps
at the end, every step before the first of them is reversible; with one in the middle, the saga comes to
have a stretch in which neither moving forward nor going back is guaranteed.

### Pivot steps

Some steps, once executed, make cancellation unacceptable to the business. The pivot step divides the
saga:

```text
before the pivot  → compensable, can cancel
the pivot         → the point of no return
after the pivot   → can only move forward; failures require retries, not compensation
```

After the pivot, the saga has to **move forward to completion**, with persistent retries. That
changes the requirement: the subsequent steps have to be
[idempotent](/06-distributed-systems/idempotency.md) and eventually successful.

### Choreography and orchestration

**Choreography.** Each service reacts to events and emits its own. There is no coordinator.

Low coupling and no central point. On the other hand, the flow exists nowhere — it is distributed
across the reactions. Debugging requires reconstructing the sequence from several services' logs.

**Orchestration.** One component drives: it calls step 1, and on receiving the response calls step 2,
and so on.

The flow is explicit, readable and testable. On the other hand, there is a component that knows every
step — concentrated coupling.

Both styles are developed in
[event-driven architecture](/03-design-patterns/event-driven.md), the canonical document on the subject.
What changes in a saga is compensation: it is an order, it has an owner and it has to happen even when
nobody is listening — and that is why the canonical document says to orchestrate flows with order and
compensation.

**This document's caveat:** in a saga of two or three steps with no pivot step, choreography is still
defensible, because there is no compensation order to coordinate. From the moment a pivot exists, the
canonical rule holds — the difficulty of debugging choreography grows faster than the benefit of the
decoupling.

### The saga has to be durable

The saga's state — which step, what has already succeeded — has to survive a restart. If the
orchestrator goes down midway, it has to resume.

That means persisting the state on each transition, and having a process that detects stalled sagas
and resumes them. Without that, a crash leaves the operation in a permanent intermediate state —
exactly what the saga was supposed to avoid.

### Compensation fails too

Compensation is a network call, and it can fail like any other. It needs
[retries](/06-distributed-systems/retries.md) and [idempotency](/06-distributed-systems/idempotency.md).

And it needs a final destination: if the compensation fails repeatedly, something has to alert. See
[dead-letter queues](/06-distributed-systems/dead-letter-queues.md).

## Mental Model

**The saga trades invisibility for explicit reversibility.** The intermediate state stops being
hidden and starts being modeled.

## When to Use

- A multi-step operation across services.
- Eventual consistency acceptable for that operation.
- Every step compensable, or the non-compensable ones can go last.
- Intermediate states can be represented in the domain.

## When Not to Use

**When the intermediate state is unacceptable.** If seeing money debited and not credited is
intolerable, even for seconds.

**When essential steps are not compensable and cannot go last.**

**When the operation fits in a local transaction.** If the data is in the same database, the
transaction solves it.

**For trivial two-step operations.** The transactional outbox may be sufficient. See
[distributed transactions](/06-distributed-systems/distributed-transactions.md).

**With no persistence on each transition, and no process that detects stalled sagas.** A saga that does
not survive a restart leaves the limbo permanent and invisible: nobody knows which ones were left midway,
and the multi-step operation it authorized has already half happened.

**With no idempotency.** Retries will duplicate effects.

## Alternatives

- **[Distributed transaction](/06-distributed-systems/distributed-transactions.md)** — when atomicity
  is non-negotiable and the conditions allow.
- **Transactional outbox** — for the simple database + event case.
- **Bringing the data together** — a local transaction if the boundary allows.
- **Batch reconciliation** — for rare divergences, correcting later can be cheaper than compensating
  inline.

## Trade-offs

| Saga | 2PC |
|---|---|
| No distributed locks | Locks resources |
| Each step independent | Combined availability |
| Visible intermediate states | Invisible |
| Compensation to model | Automatic rollback |
| Scales | Scales badly |

| Choreography | Orchestration |
|---|---|
| No central component | The component knows the flow |
| Implicit flow | Explicit and testable |
| Hard to debug | Traceable |
| Distributed coupling | Concentrated |

## Failure Modes

**Stalled saga.** A step fails and the compensation does not fire; the operation is in limbo.

**Compensation failing.** With no retries or no final destination.

**Non-idempotent compensation.** Executed twice, it refunds double.

**An effect observed before the compensation.** Someone acted on state that was undone.

**A non-compensable step in the middle.** The saga cannot go back.

**State lost on restart.** With no persistence.

## Common Mistakes

**Not checking each step's compensability before designing.**

**Not reordering to put the non-compensable one last.**

**Choreography for long flows.**

**Compensation with no idempotency.**

**Not modeling the intermediate states in the domain.** They leak into the interface anyway.

**Having no monitoring of stalled sagas.**

## Real-World Example

A travel platform implemented a saga for package booking: flight, hotel and car, each with a
different external supplier.

The first version was choreographed, with events between three services.

Two problems appeared in production.

**Debugging.** When a booking ended up incomplete, finding out where it stopped required correlating
logs from three services. A typical incident took 40 minutes just to understand the state.

**An email in the middle.** The confirmation step sent an email to the customer after the hotel. When
the car failed, the customer had already received "booking confirmed" and then received the
cancellation. The complaint was constant.

The redesign.

**Orchestration.** One service came to drive, with the state persisted on each transition. The
diagnosis time dropped to minutes — the saga's state is a query.

**Reordering.** The email was moved to after every bookable step. An explicit pivot step came into
existence: the payment confirmation. Before it, everything is cancellable; after it, the saga moves
forward to completion, retrying the remaining steps indefinitely.

**Compensation with a deadline.** It turned out that the hotel supplier only accepted cancellation
without a penalty within 30 minutes. That became a requirement of the stretch **before the pivot**: if
the saga does not reach payment in 25 minutes, it compensates preemptively, while compensating is still
free.

After the pivot the rule does not apply — and cannot apply, because there the saga only moves forward.
For the case where the hotel's window expired with the payment already confirmed, the decision was to
move the booking to after the pivot: it stopped being a step to compensate and became a step to retry
until it succeeds. The sagas that pivoted before that change paid the penalty, booked as a known cost
instead of a surprise in the reconciliation.

That last point is what the team records as the main lesson: **the compensation had a validity
window**, and nobody had asked. There were sagas that compensated hours later and generated a penalty
— a cost that showed up in the monthly financial reconciliation with nobody connecting it to the
saga.

## Related Concepts

- [Distributed Transactions](/06-distributed-systems/distributed-transactions.md) — the alternative.
- [Idempotency](/06-distributed-systems/idempotency.md) — a requirement.
- [Event-Driven Architecture](/03-design-patterns/event-driven.md) — the canonical document on
  choreography and orchestration.
- [Event-Driven Systems](/06-distributed-systems/event-driven-systems.md) — the cost of tracing a flow
  nobody coordinates.
- [Dead-Letter Queues](/06-distributed-systems/dead-letter-queues.md) — for compensation that fails.

## Practical Exercise

Take a multi-step operation in your system. For each step, write the compensation.

When you reach a step with no possible compensation, you have found the constraint that determines
the saga's order.

## Interview Questions

- What is the difference between compensation and rollback?
- What is a pivot step and how does it change the failure strategy?
- When does choreography stop being adequate?

## Further Reading

- Garcia-Molina, Hector; Salem, Kenneth. *Sagas*. SIGMOD, 1987.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — chapter 4.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021 — chapter 6.
