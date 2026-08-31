---
id: request-response
title: Request/Response
sidebar_position: 5
description: The synchronous model and what it couples — the decision that precedes every protocol choice.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes the temporal coupling of the synchronous model and knows
  when an immediate response is a requirement and when it is a habit.
prerequisites: [apis]
related: [queues, background-processing, timeouts]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Request/Response

## Overview

In the request/response model, the caller waits for the response before continuing. It is the
default model of HTTP, of RPC and of a database call.

It is simple, familiar and adequate in most cases. It is also what introduces **temporal
coupling** — and recognizing that is what allows deciding when not to use it.

## Problem

The question usually asked is which protocol to use. The question that precedes it is
another: **does the caller need the result to continue?**

If it does, synchronous is the model. If it does not — and frequently it does not — waiting
means the caller becomes unavailable when the callee is.

The pattern that shows up in systems: confirming an order triggers stock reservation,
charging, notification and tax registration, all synchronous. If the notification service is
down, the order is not confirmed — although notifying is the least important of the four.

That is not a protocol decision. It is a decision about what has to happen before responding
to the user.

## Core Concepts

### Temporal coupling

Two parties coupled in time have to be available **simultaneously**.

The consequence is multiplicative: in a chain of synchronous calls, the availability of the
whole is the product of the individual ones, and the latency is the sum.

```text
4 synchronous calls, each 99.9% available and 100 ms
  → 99.6% availability, 400 ms latency
```

Swapping synchronous for asynchronous does not remove coupling — it trades temporal coupling
for format coupling. See
[queues](/05-system-design/queues.md).

### What has to be synchronous

Three conditions. One is enough:

**The caller needs the result to decide.** Checking a balance before authorizing.

**A user is waiting and the operation defines what they see.** A search.

**The operation has to be transactional with the call.** Reserving stock in the same
commitment as the order.

Outside those, synchronous is a choice by habit.

### The timeout is part of the contract

Every synchronous call needs a timeout. Without one, the caller waits indefinitely and
exhausts resources — and the failure propagates upward.

The timeout has to be **shorter** than the caller's, otherwise it gives up first and the
chain works for nobody. See
[timeouts](/06-distributed-systems/index.md).

And the timeout does not resolve the central ambiguity: when it fires, you do not know
whether the operation happened.

### Partial response and degradation

Not every call in a request has the same weight. A product page that needs price, stock and
reviews can respond without the reviews.

Separating what is essential from what is enrichment allows degrading instead of failing. See
[graceful degradation](/12-reliability/index.md).

## Mental Model

**Ask what happens if the other side is down.** If the answer is "we wait", there is temporal
coupling — and it has to be deliberate.

## When to Use

- The caller needs the result to proceed.
- There is a user waiting and the operation defines the response.
- The operation is transactional with the call.
- The total latency fits within the requirement.
- The number of synchronous hops is small.

## When Not to Use

**When the caller does not use the result.** Notifying, logging, indexing, syncing — none of
that has to block the response.

**When the operation is slow.** An HTTP request that waits thirty seconds consumes a
connection, exhausts the pool and frequently times out at some proxy along the way. See
[background processing](/05-system-design/background-processing.md).

**When the destination is unstable.** Synchronously calling a service less available than you
lowers your availability to its level.

**When the chain gets long.** Each hop multiplies risk and adds latency.

**When the peak is unpredictable.** Synchronous propagates pressure backward; a queue absorbs
it.

## Alternatives

- **[Queue](/05-system-design/queues.md)** — decouples in time, at the cost of duplication and
  ordering.
- **[Background processing](/05-system-design/background-processing.md)** — respond accepted
  and process later.
- **Event** — when several interested parties react. See
  [event-driven architecture](/03-design-patterns/event-driven.md).
- **Request with a deferred response** — return an operation identifier and a path to query
  the result.

## Trade-offs

| Synchronous | Asynchronous |
|---|---|
| Immediate result | Acknowledgment of acceptance |
| Error visible to the caller | Error handled far away |
| Flow readable end to end | Fragmented |
| Transaction possible | Eventual consistency |
| Availability multiplied | Each side independent |
| Peak propagates backward | Absorbed by the queue |
| No duplication or ordering to handle | Both to handle |

The fourth and seventh lines are what keeps synchronous the correct default in most cases —
asynchronous solves availability and charges in data complexity.

## Failure Modes

**Cascade.** A slow service consumes the connections of whoever calls it, which becomes slow
for whoever calls it.

**Timeout absent or badly calibrated.** Indefinite waiting, or giving up before the useful
time.

**Retry with no idempotency.** The timeout fired, the operation happened, the retry
duplicates.

**Long chain.** Latency summed above the requirement.

**Synchronous call inside a transaction.** The transaction stays open during the wait, holding
locks in the database.

## Common Mistakes

**Making synchronous everything that is easy to call.**

**Not setting a timeout.**

**Calling inside a transaction.** It is the most expensive error in this list: a database lock
held by a network wait.

**Treating every call as equally essential.** It prevents degradation.

**Chaining services.** Each link multiplies the risk.

## Real-World Example

An order confirmation endpoint made four synchronous calls: stock, payment, tax and
notification. All inside the database transaction.

Two problems arose together on a Tuesday.

The tax service became slow — 8 seconds instead of 200 ms. The database transactions stayed
open during the wait, holding locks on the order rows.

Within minutes, the connection pool was exhausted and the whole system stopped. The root cause
was a third-party service, and the effect was total unavailability.

The fix separated the four by real need.

**Stock** stayed synchronous and inside the transaction: if there is no stock, there is no
order.

**Payment** became synchronous outside the transaction: the result is needed to respond to the
user, but it does not need to hold a database lock.

**Tax and notification** became asynchronous, published after the confirmation. Tax issuance
has a legal deadline of hours, not milliseconds — nobody had checked that before.

Besides that, all calls got an explicit timeout, and the payment one got a
[circuit breaker](/12-reliability/index.md).

What changed was not technology. It was asking, for each call, whether the result was needed to
respond — and three of the four were not.

## The timeout budget in a chain

Timeouts in a chain have to be coherent with each other, and they rarely are.

The principle: **each level has less time than whoever called it.** If the user waits at most 3
seconds and the request crosses three services, each one has to fit within what is left.

```text
user             3,000 ms
  gateway        2,800 ms   ← keeps margin for the response
    service A    2,500 ms
      service B  1,500 ms
        database   800 ms
```

The common error is the inverse: an internal service with a 30-second timeout called by a
gateway with 5. The caller gives up at 5 and the service keeps working for another 25 —
consuming a connection, CPU and database to produce a response nobody will receive.

At volume, it is a system spending capacity on discarded work, and that is invisible in the
caller's error metrics.

The practice that solves it is **propagating the remaining deadline** in the call: the caller
states how much time is left, and the receiver adjusts its own limit. Some protocols support
that natively; in the rest, a header solves it.

Without propagation, all that is left is calibrating by hand — which works until someone
changes one timeout without looking at the whole chain.

## Related Concepts

- [APIs](/05-system-design/apis.md) — the call's contract.
- [Queues](/05-system-design/queues.md) — the asynchronous model.
- [Background Processing](/05-system-design/background-processing.md) — long operations.
- [Distributed Systems](/06-distributed-systems/index.md) — timeouts, retries and idempotency.

## Practical Exercise

Pick the most important endpoint in your system and list every external call it makes.

For each one, answer: is the result needed to respond to the user? Is it inside a database
transaction?

The ones that answer "no" and "yes" — in that order — are the ones that will take down the
system when the destination gets slow.

## Interview Questions

- What is temporal coupling and what is its consequence for availability?
- Why is a synchronous call inside a transaction dangerous?
- How do you decide whether a call has to be synchronous?

## Further Reading

- Nygard, Michael. *Release It!* 2nd ed., Pragmatic Bookshelf, 2018 — cascades and stability
  patterns.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
