---
id: partial-failure
title: Partial Failure
sidebar_position: 3
description: Part of the system works, part does not — the structural difference between local and distributed.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs assuming any subset of components can be down,
  and recognizes the intermediate states that creates.
prerequisites: [network-failure]
related: [idempotency, sagas, circuit-breakers]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Partial Failure

## Overview

Partial failure is the situation in which part of the system works and part does not.

It is **the** difference between local and distributed systems. In a single process, failure is
total: if it dies, it dies whole, and the in-memory state goes with it — consistently.
Distributed, one component goes down while the others continue, and the system ends up in a
state nobody designed.

## Problem

The concrete case: a business operation involves three steps in different components.

```text
1. reserve stock       ✓ success
2. charge the card     ✓ success
3. issue the invoice   ✗ the service is down
```

The system is neither working nor stopped. It is in a state where the customer was charged,
the stock was reserved, and there is no tax document.

That state appears in no diagram. It is not a programming error — it is the inevitable
consequence of the operation crossing boundaries that fail independently.

**Designing distributed systems is, to a large extent, deciding what to do in those states.**

## Core Concepts

### The number of states explodes

With N steps that can fail independently, the intermediate states grow exponentially.

Three steps produce eight combinations of success and failure. Five produce 32. Each one needs
an answer — even if the answer is "we accept it and fix it manually".

That is the strongest argument against excessive granularity: **each additional boundary
multiplies the states to consider.**

### The three possible answers

**Compensate.** Undo what has already been done. Refund the charge, release the stock. It is
what [sagas](/06-distributed-systems/sagas.md) formalize, and it requires each step to have an
inverse — which does not always exist. A sent email cannot be unsent.

**Resume.** Persist the progress and continue later. It requires durable intermediate state and
[idempotent](/06-distributed-systems/idempotency.md) steps.

**Accept and reconcile.** Leave it inconsistent and fix it through a separate process that
compares the sides and resolves. It is the usual answer when compensating is impossible.

The choice is a business one, not a technical one: which inconsistency is tolerable, for how
long, and who resolves it.

### The state has to be durable

A multi-step operation with progress in memory loses everything if the process dies midway. The
state has to be persisted at each step, or there is no way to resume or reconcile.

It is what turns "a function that calls three services" into a persisted state machine. See
[State](/03-design-patterns/state.md).

### Partial failure does not require microservices

It does not depend on the architecture. A monolith that calls an external payment service and
an email service already has partial failure — at two boundaries.

What microservices do is multiply the number of boundaries.

### Silent partial failure is the worst

The cases discussed so far involve something failing visibly. The hardest mode is the component
that keeps responding and responds wrongly.

**Degraded but alive.** A node with a full disk accepts connections, answers the health check
and fails on every real write.

**Slow without failing.** It responds in 30 seconds instead of 30 milliseconds. No error is
recorded, and the slowness propagates to the callers until their connections are exhausted.

**Correct but stale.** A replica that stopped replicating keeps serving reads — of old data,
with no sign that anything is wrong.

None of those appears in an error count. Detecting them requires checking behavior, not
availability: the health check has to exercise the real path, and the monitoring has to observe
latency and lag, not only success and failure.

## Mental Model

**For each step: if it fails here, what state does the system end up in, and who resolves it?**

If the answer is "I don't know", that is a state that will happen and nobody will know how to
handle.

## When to Use

It is not an optional technique. The decisions it informs:

- Choosing between compensation, resumption and reconciliation, per operation.
- Deciding where to persist the progress.
- Defining what is tolerable to leave inconsistent and for how long.
- Sizing the operational effort — reconciliation requires someone to follow it.

## When Not to Use

**Assuming the steps always complete.** It is the premise that produces the orphan state.

**Compensating when there is no real inverse.** A refund is another operation with its own
failures.

**Reconciling with no alert.** A silent process hides the frequency of the problem.

**Multiplying boundaries with no need.**

## Alternatives

- **Local transaction** — when the steps fit in the same database, partial failure disappears.
  It is the strongest reason to keep things together.
- **Reduce the number of steps** — merging two services eliminates one boundary and half the
  states.
- **Make steps optional** — if the email can fail with no consequence, it leaves the critical
  path and becomes an event.

## Trade-offs

| Compensate | Resume | Reconcile |
|---|---|---|
| Returns to the initial state | Reaches the final state | Fixes later |
| Requires an inverse per step | Requires idempotency and durable state | Requires a separate process |
| Fast | May take a while | Asynchronous |
| The inverse can fail | The resumption can fail | Backlog can accumulate |
| Visible to the user | Transparent | Invisible until the alert |

## Failure Modes

**Orphan state.** Charged with no order, reserved with no charge.

**A compensation that fails.** The refund does not go through, and now there are two things
wrong.

**Reconciliation that does not run.** The process stops and nobody notices. See
[background processing](/05-system-design/background-processing.md).

**Non-idempotent resumption.** It re-executes a step that had already completed.

**Progress in memory.** The process dies and there is no way to know where it stopped.

## Common Mistakes

**Treating each call in isolation.** The state of the whole is what matters.

**Not persisting the progress.**

**Assuming compensation always works.**

**Not measuring the frequency of inconsistency.**

**Having no owner for the reconciliation.** A divergence report nobody reads is the same as not
having one.

## Real-World Example

A course enrollment system executed four steps: reserve a seat, charge, grant access to the
platform, send a welcome message.

There was no progress persistence — it was a function calling four services in sequence.

Over a year, three orphan states appeared frequently.

**Charged with no access.** The platform service failed after the charge. The student paid and
could not get in. Discovered by support, fixed by hand.

**Seat reserved with no charge.** The charge failed and the seat stayed locked. Courses appeared
sold out with phantom seats.

**Access with no charge.** The operator's manual retry re-executed from the beginning. The
grant-access step — already completed — ran again, harmlessly. In three cases, however, the
operator resumed after a charge failure and access was granted with no payment.

The redesign turned the operation into a persisted state machine.

Each step records the result before advancing. Resumption continues from the last completed
step, and all of them are idempotent — reserving the same seat twice is harmless, charging with
the same key returns the original result.

Sending the welcome message left the critical path and became an event: it can fail without
leaving the enrollment inconsistent.

And daily reconciliation was added, comparing enrollments, charges and access grants, with an
alert above five divergences.

On its first run, it found 47 divergences accumulated over months. Nobody knew they existed,
because only the ones that generated a complaint were discovered.

## Related Concepts

- [Network Failure](/06-distributed-systems/network-failure.md) — the origin.
- [Idempotency](/06-distributed-systems/idempotency.md) — what makes resumption safe.
- [Sagas](/06-distributed-systems/sagas.md) — the formalization of compensation.
- [Distributed Transactions](/06-distributed-systems/distributed-transactions.md) — the
  alternative and its cost.

## Practical Exercise

Pick an operation that crosses more than one boundary. List the steps and, for each one, write
down what state the system ends up in if it fails.

Then answer, for each state: does anyone detect it? How is it resolved?

The states with no answer are the ones already happening with nobody knowing.

## Interview Questions

- Why is partial failure the structural difference between local and distributed?
- What are the three possible answers, and how do you choose?
- Why is persisting the progress necessary?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!* 2nd ed., 2018.
- Garcia-Molina, Hector; Salem, Kenneth. *Sagas*. SIGMOD, 1987.
