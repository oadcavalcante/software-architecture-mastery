---
id: bulkheads
title: Bulkheads
sidebar_position: 15
description: Compartmentalizing resources so that one part's failure does not sink the ship.
doc_type: pattern
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader isolates resources per dependency and per customer class,
  with sized limits.
prerequisites: [reliability]
related: [circuit-breakers, graceful-degradation, retry-storms]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Bulkheads

## Overview

The name comes from shipbuilding: a hull divided into watertight compartments does not sink when one of
them is breached.

Applied to software, it is **isolating resources** — connections, threads, memory — so that the exhaustion
caused by one part does not reach the others.

It is the protection that works when the others fail: even with no circuit breaker, no adequate timeout and
no degradation, a bulkhead limits the damage to the compartment.

## Problem

Shared resources propagate failure by construction.

```text
a single pool of 200 connections
  a slow dependency consumes 200
  → every request waits, including the ones that do not use it
  → the whole service stops because of one dependency
```

See [circuit breakers](/12-reliability/circuit-breakers.md) for the arithmetic. The bulkhead's point is
that it resolves the same problem by another route — and without depending on correct threshold
configuration.

The same holds between customers: one customer sending abnormal volume consumes everybody else's capacity.

## Core Concepts

### The isolation dimensions

They are two independent choices, and confusing them is the most common reading error here. The
first is **along which axis** to compartmentalize:

```text
per dependency   one compartment per service called
per customer     one per tenant, so that one does not affect the others
per criticality  the payment path separate from the browsing path, reads from writes
```

The second is **with which mechanism**, and here there is indeed a scale of strength:

```text
separate pool      configuration; isolates connections and threads, not memory or CPU
separate process   isolates memory and CPU, not disk or network
separate machine   isolates what no wrong configuration nullifies
```

The two axes combine: you can separate per customer with pools, or per dependency with
machines. Isolating per customer is not stronger than isolating per dependency — they are
different questions. What grows in strength is the right-hand column, and it costs in the same
order.

The choice depends on what is being protected and on the acceptable cost.

### Sizing the compartment

Too small a pool becomes an artificial bottleneck; too large a one isolates nothing.

The starting point comes from Little's law:

```text
simultaneous requests = throughput × latency
  100 req/s × 0.15 s = 15 connections needed
  → a pool of 25 gives margin without allowing monopolization
```

See [performance versus scalability](/11-scalability/performance-vs-scalability.md).

And the sum of the compartments can exceed the total available, deliberately — so-called overcommitment,
betting that not all of them saturate at the same time. That improves utilization and reduces the
guarantee; the decision needs to be conscious.

### Isolation per customer is what sustains multi-tenancy

On a platform serving several customers, one's behavior affects the others by default.

```text
with no isolation   a customer with a defective loop consumes all the capacity
with a quota        they exhaust their own quota; the others do not feel it
```

The quota can be on requests, on connections, on queue workers or on processing capacity.

And the highest-volume customers can receive a dedicated compartment — which also resolves
[hotspots](/11-scalability/hotspots.md).

### Queues need compartments too

A single queue processes in arrival order. A customer publishing millions of messages delays everybody
else.

Separate queues per customer or per priority, with reserved consumption capacity, resolve it. See
[queue-based scaling](/11-scalability/queue-based-scaling.md).

The common mistake is creating the queues and leaving all the consumers free to take from any of them —
which reproduces the problem, because the full queue dominates the consumption.

### The bulkhead needs to reject, not enqueue

When the compartment fills, the request needs to be **refused quickly**.

If it enters a waiting queue for the resource, the isolation is lost: the queue grows, memory is consumed,
and the damage crosses over again.

Rejecting preserves the compartment and returns control to the caller, which can degrade or retry with
[backoff](/06-distributed-systems/backoff.md). See [backpressure](/06-distributed-systems/backpressure.md).

### The isolation has to be real

Compartments that share something further down do not isolate:

```text
separate pools, the same process      → memory and CPU shared
separate processes, the same machine  → disk and network shared
separate machines, the same zone      → power and network shared
```

See [redundancy](/12-reliability/redundancy.md) — it is the same correlation problem.

That does not mean partial isolation is useless. It means it protects against a specific set of failures,
and you need to know which.

## Mental Model

**Sizing a compartment is deciding in advance how much you accept losing.** The number chosen
for the pool is not a technical setting: it is the answer to the question "how many requests to
this dependency do I accept failing so that the others survive?". Whoever sizes by intuition is
answering that question without knowing they asked it.

## When to Use

- Multiple dependencies with different failure profiles.
- A platform serving several customers.
- Critical operations coexisting with non-critical ones.
- Limited and contended resources.
- External calls in the same process as the main logic.

## When Not to Use

**When the dependency is single and the service does not survive without it.**
Compartmentalizing assumes there is something to save on the other side of the wall. A service
that only queries a database and has no degraded response has nothing: if the pool is
exhausted, the protected compartment serves nothing useful. What that case calls for is a
concurrency limit and a fast error response, not isolation.

**When rejecting costs more than waiting.** A bulkhead refuses in order to preserve the
compartment, and that presupposes a caller that knows what to do with the refusal. In an
overnight batch or an asynchronous ingestion with no deadline, the queue is the right answer and
the refusal merely transfers the work to a retry.

**When the concurrency is already limited above.** A queue consumer with fixed parallelism, a
function with reserved concurrency, a server with a sized worker pool: the ceiling already
exists, and a second ceiling inside it only adds a number to maintain.

**When the resource that saturates is below the compartment.** Separate pools in the same
process do not protect against memory exhaustion, and quotas per customer do not protect against
a saturated shared database. It is not that partial isolation is useless — it protects against a
set of failures —, it is that it does not protect against **this** one, and adopting it thinking
it does is worse than not having it.

## Alternatives

- **A [circuit breaker](/12-reliability/circuit-breakers.md)** — it stops calling instead of isolating.
  Complementary.
- **An aggressive timeout** — it reduces the resource hold time.
- **Rate limiting** — it controls at the entrance. See
  [rate limiting](/05-system-design/rate-limiting.md).
- **Separate processes or instances** — stronger isolation, higher cost.

## Trade-offs

| With a bulkhead | A shared resource |
|---|---|
| The failure is contained | It propagates |
| Lower utilization | Higher |
| Sizing per compartment | One number |
| Rejection possible with margin elsewhere | It uses everything until it runs out |

| Isolation per process | Per pool |
|---|---|
| Protects memory and CPU | Only the pool's resource |
| An operations cost | Configuration |
| Inter-process communication | A local call |

## Failure Modes

**Too small a compartment.** It rejects with capacity to spare elsewhere.

**A waiting queue for the resource.** The isolation is lost.

**Apparent isolation.** They share memory or CPU underneath.

**Badly calibrated overcommitment.** All of them saturate together and the total blows up.

**Too many compartments.** Nobody sizes them, all of them are wrong.

**Free consumers across queues.** The full queue dominates the consumption.

## Common Mistakes

**Not separating external calls from the main pool.** A slow third-party dependency consumes every shared
thread, and features that do not depend on it stop along with it.

**Sizing by intuition.** The compartment's size needs to come from the expected throughput and the call's
latency. Guessed, it either wastes capacity or strangles the flow it was supposed to protect.

**Enqueuing instead of rejecting.** An unlimited queue in front of the compartment undoes the isolation:
the wait grows and the caller stalls just the same, only later.

**Not isolating per customer** on multi-tenant platforms. With no compartment per tenant, one customer with
anomalous usage consumes everybody's capacity — the noisy neighbor problem.

**Assuming isolation where there is a shared resource.** Separate thread compartments that use the same
database connection pool isolate nothing: the real bottleneck stays common.

**Not monitoring utilization per compartment.** Without measuring how much of each compartment is in use,
you do not know which one is strangling the flow and which one is idle.

## Real-World Example

A financial management platform served 900 corporate customers on shared infrastructure.

Two recurring incidents had the same root:

**A customer with a defective integration.** One company with a loop in its integration fired 40,000
requests per minute. The application's connection pool was exhausted, and the other 899 companies were left
without service.

**A heavy report.** One large customer generated reports that occupied queue workers for hours. The others'
reports sat in the queue behind them.

The fixes, in three layers — plus a fourth, adopted after the three were in production:

**A pool per dependency.** External calls — credit bureaus, payment gateways — came to have separate pools,
sized by Little's law with 60% margin. One's exhaustion stopped reaching the main one.

**A quota per customer.** Each company received a limit on simultaneous requests, proportional to the
contracted plan. Above that, immediate refusal with a suggested wait. The company with the loop came to
exhaust only its own quota.

**Queues by priority and by size.** Reports went to a separate queue, with dedicated workers. Large
customers got their own queue, so they would not dominate the shared one.

**Isolation per instance**, six months later, for the twelve largest customers, who together
represented 45% of the volume. Dedicated infrastructure, sized separately. It was the only
measure that required a budget of its own, and it was only justified after the three previous
layers showed where the concentration was.

Two problems appeared during the implementation:

**Badly sized compartments.** The first version of the external pools was defined by intuition — 10
connections — and became a bottleneck: requests were refused with the system idle. Measuring the real
throughput and latency corrected it.

**Free consumers across queues.** The separate queues were created, and the workers could consume from any
of them. The reports queue, always full, dominated — reproducing the original problem with more parts. The
fix was dedicating workers to each queue, with a guaranteed minimum ratio.

In the following twelve months, four customers had defective integrations. None affected the others.

In retrospect: isolation per customer had the greatest impact, and it was the most obvious — the platform
served 900 companies on a single pool from day one, and nobody had questioned it.

## Related Concepts

- [Circuit Breakers](/12-reliability/circuit-breakers.md) — the complementary protection.
- [Retry Storms](/12-reliability/retry-storms.md).
- [Backpressure](/06-distributed-systems/backpressure.md) — the rejection.
- [Hotspots](/11-scalability/hotspots.md) — disproportionate customers.

## Practical Exercise

Check whether your system's external calls use the same connection pool as the main logic.

If they do, calculate how many requests get stuck if the slowest dependency stops responding — and compare
with the pool's size.

## Interview Questions

- Why does a bulkhead need to reject instead of enqueue?
- How does Little's law size a compartment?
- Why do separate pools in the same process isolate only partially?

## Further Reading

- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 21
  ("Handling Overload") for quota per customer and criticality, chapter 22 ("Addressing
  Cascading Failures") for resource exhaustion and containment of propagation.
- Fowler, Susan. *Production-Ready Microservices*. O'Reilly, 2016.
