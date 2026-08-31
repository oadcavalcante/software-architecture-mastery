---
id: async-processing
title: Asynchronous Processing
sidebar_position: 8
description: Taking work off the critical path — the technique that resolves peaks with no proportional capacity.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies what can leave the request path and models the
  intermediate states that creates.
prerequisites: [scalability]
related: [queue-based-scaling, performance-vs-scalability, statelessness]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Asynchronous Processing

## Overview

Asynchronous processing is taking work off the request path: accept, respond, and process afterward.

The scale gain is large and indirect. A request that responds in 40 ms instead of 900 ms occupies resources
for 22 times less time — which, by Little's law, means 22 times more throughput with the same concurrency.
See [performance versus scalability](/11-scalability/performance-vs-scalability.md).

The cost is that the operation stops having an immediate result, and the **intermediate states** come to
exist in the domain.

## Problem

A request that does five things — write the order, reserve stock, charge, send an email, update the
dashboard — takes the time of all five summed, and fails if any one fails.

Under load, it occupies a connection and a thread for that whole time. With limited concurrency, the
throughput collapses.

And of the five, typically only one or two need to happen before responding to the user.

## Core Concepts

### The question that decides

For each step: **does the user need this to have happened in order to receive the response?**

```text
write the order      yes — with no order there is nothing to confirm
reserve stock        maybe — it depends on the business accepting later reservation
charge               generally no — it can be confirmed later
send an email        no
update the dashboard no
index for search     no
generate a report    no
```

The practical rule: if the user does not see the result on the next screen, it can probably be
asynchronous.

And there is an embedded business criterion: making the charge asynchronous means accepting orders that may
fail to charge later. That is a product decision, not a technical one.

### The intermediate states are the expensive part

A synchronous operation has two states: it happened or it did not. An asynchronous one has more:

```text
received → processing → completed
                      → failed → retrying
                               → permanently failed
```

Each one needs to be represented in the model, displayed in the interface, and handled by support.

That is the real cost, and it is underestimated. Teams that make an operation asynchronous without modeling
the states produce the worst possible experience: the user receives "success" and finds out later that it
did not work, with no idea where to look.

### The user needs feedback

Three patterns, from the simplest to the most elaborate:

**Polling by the client.** The response brings an identifier; the client queries the state. Simple, works
anywhere, generates query traffic.

**Notification.** The system announces when it finishes — a message, an email, a notification. Appropriate
for long operations.

**A persistent connection.** The client receives real-time updates. The best experience, and it adds
connection state. See [statelessness](/11-scalability/statelessness.md).

The choice depends on the duration: seconds favor a connection or polling; minutes or hours favor
notification.

### What asynchronous requires

See [messaging integration](/08-integration-architecture/messaging-integration.md) for the complete list.
In summary:

**Idempotency**, because there will be repetition.

**Durability**, because accepted work cannot vanish if the process crashes. Accepting and keeping it in
memory is the most common way to lose work silently.

**Handling of permanent failure**, with a destination for what does not process.

**Lag monitoring**, because the failure stops generating a visible error.

### Asynchronous does not reduce work

A point that is usually forgotten: the work still exists. It only leaves the critical path.

If the arrival rate exceeds the processing capacity in a sustained way, the queue grows indefinitely — and
the asynchronous approach has turned an immediate error into a growing delay, which is worse to diagnose.

Asynchronous resolves a **peak**, not **sustained overload**. The distinction is what separates a correct
use from postponing the problem. See [queue-based scaling](/11-scalability/queue-based-scaling.md).

### The transaction and the publish need to be atomic

Writing to the database and publishing the message as two separate operations creates a window: if the
process crashes between them, the effect never happens.

The **transactional outbox** resolves it — writing the change and the message in the same local
transaction, with a separate process publishing. See
[distributed transactions](/06-distributed-systems/distributed-transactions.md).

It is the pattern that avoids the most common silent loss in asynchronous systems.

## Mental Model

**Asynchronous trades an immediate response for throughput.** The price is the intermediate states, and
they need to be modeled, not discovered.

## When to Use

- The user does not need the result to continue.
- The operation is long or depends on a third party.
- There are peaks the capacity does not keep up with.
- The work can be retried without intervention.
- Several effects derive from one action.
- The operation can fail without invalidating the whole.

## When Not to Use

**When the user needs the result now.**

**Without modeling the intermediate states.**

**With no durability.** Accepting and keeping it in memory loses work.

**With no idempotency.**

**For sustained overload.** The queue grows and the problem comes back worse.

**When the ordering between operations is mandatory** and the queue does not guarantee it.

**Without monitoring lag.** The failure becomes silence.

## Alternatives

- **Optimizing the synchronous version** — if the operation becomes fast, it does not need to leave the
  path.
- **Parallelizing inside the request** — five independent calls in parallel cost the time of the slowest,
  not the sum.
- **An aggressive timeout with degradation** — responding without the optional result.
- **A [queue](/11-scalability/queue-based-scaling.md)** — the most robust form of asynchronous processing.

The second deserves consideration: many slow requests are sequences of independent calls, and
parallelizing them resolves it without introducing intermediate state.

## Trade-offs

| Asynchronous | Synchronous |
|---|---|
| A fast response | The total time |
| Absorbs a peak | Propagates it |
| Intermediate states | Two states |
| A silent failure is possible | An immediate error |
| Idempotency mandatory | Frequently dispensable |
| Debugging requires tracing | A call stack |

## Failure Modes

**Work lost.** Accepted and not persisted.

**A queue growing indefinitely.** Sustained overload.

**A user with no feedback.** Accepted, and nobody says what happened.

**A duplicated effect.** With no idempotency.

**A silent failure.** The consumer stopped and nothing generates an error.

**A lost publish.** With no transactional outbox.

**Broken ordering.** The consumer assumed a sequence.

## Common Mistakes

**Not modeling the states in the domain.** Making something asynchronous creates intermediate states — in
processing, failed, retrying — that are business concepts. Leaving them implicit pushes the ambiguity onto
support.

**Accepting without persisting.** Responding "received" before writing durably is promising what you cannot
deliver: a restart discards work the user considers accepted.

**Not giving the user feedback.** With no state query and no notification, the person does not know whether
the processing finished and resubmits — which multiplies the load precisely when it is high.

**Using asynchronous processing for sustained overload.** The queue absorbs a peak, not a permanent
capacity deficit. If the input rate exceeds the output rate on average, the queue grows indefinitely and
the delay becomes unavailability under another name.

**Not monitoring processing lag.** The system keeps responding "accepted" while the queue grows. Without
measuring the time between accepting and completing, the degradation is invisible until the customer
complains.

**Publishing outside the transaction.** Writing and publishing as independent operations produces an event
with no fact or a fact with no event, depending on which one fails.

## Real-World Example

An invoicing platform had the issuance operation taking between 3 and 12 seconds, because it called the tax
authority's service synchronously.

With concurrency limited to 200 simultaneous requests and an average latency of 7 seconds, the maximum
throughput was around 28 issuances per second. The month-end peak asked for 120.

The result was predictable: a waiting queue at the load balancer, timeouts, and users resubmitting — which
made everything worse.

The migration to asynchronous:

**Accept and respond.** The issuance came to write the request and respond in 45 ms with an identifier. The
acceptance layer's throughput came to be limited only by the write.

**A transactional outbox.** The request and the processing message written in the same transaction. Without
it, process crashes lost issuances — which was already happening, and was diagnosed as "a tax authority
error".

**States in the domain.** `received`, `processing`, `authorized`, `rejected`, `temporary_failure`. Each one
displayed in the interface, with a clear meaning for the user and for support.

**Notification** on completion, plus polling by the client while the screen is open.

**Idempotency** by request key, preventing duplicate issuance when the user resubmitted.

Result: the month-end peak came to be absorbed, with processing lag of up to 8 minutes at the most intense
moments — accepted by the business, because issuance has a legal deadline in hours.

Two problems appeared later:

**Sustained overload.** During a 6-hour outage of the tax authority's service, the queue accumulated 400,000
issuances. When the service came back, consuming them took 9 hours — and during that period the new
issuances went behind the old ones. Prioritization by deadline was added.

**Confused users.** The first version displayed only "processing", with no estimate. The volume of support
tickets tripled. Adding a forecast and an attempt history resolved it.

The point the team underlines: modeling the states consumed more time than the technical change — five
screens, two reports and training for support. It had been estimated as a detail.

## Related Concepts

- [Queue-Based Scaling](/11-scalability/queue-based-scaling.md).
- [Messaging Integration](/08-integration-architecture/messaging-integration.md).
- [Idempotency](/06-distributed-systems/idempotency.md).
- [Background Processing](/05-system-design/background-processing.md).

## Practical Exercise

Take the slowest request in your system and list what it does, step by step.

For each step, ask: does the user need this to see the response? Sum the time of the ones that are not
needed — that is what you can take off the critical path.

## Interview Questions

- How does asynchronous processing increase throughput without adding capacity?
- Why are the intermediate states the real cost?
- Why does asynchronous processing not resolve sustained overload?

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.
