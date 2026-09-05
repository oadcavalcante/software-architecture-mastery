---
id: retry-storms
title: Retry Storms
sidebar_position: 16
description: When the defense amplifies the problem — and why recovery is the hardest part.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader sizes retries with a budget and avoids the amplification
  that prevents recovery.
prerequisites: [reliability]
related: [circuit-breakers, bulkheads, graceful-degradation]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Retry Storms

## Overview

Retrying is the most basic defense against transient failure. See
[retries](/06-distributed-systems/retries.md).

Under generalized failure, it becomes the problem: every client retries at the same time, the load on the
degraded destination multiplies, and the system cannot recover — even after the original cause has passed.

That last point is what makes the phenomenon dangerous: **the system gets stuck in a bad state that
sustains itself**, and getting out of it requires intervention.

## Problem

A service gets slow. The clients time out and retry three times.

```text
normal load           1,000 req/s
the service degrades, 3 attempts each
load on it            3,000 req/s   ← at the moment it can least take it
```

With call chains, the multiplication compounds:

```text
A → B → C, each with 3 attempts
1 request at A → 3 at B → 9 at C
```

Nine calls to the deepest service for one user request. A mild degradation in C becomes total overload.

## Core Concepts

### Retry at one level, not at all of them

The rule that avoids compound multiplication.

Each layer that retries multiplies by its factor. In a chain of four services with three attempts each, one
request can generate 81 calls to the deepest one.

The decision needs to be explicit: **which layer retries?** Typically the one closest to the user, or the
one that has the context to decide whether it is worth it.

And the others need **not** to retry — which requires somebody to check, because client libraries
frequently retry by default with nobody having configured it.

See [service mesh](/08-integration-architecture/service-mesh.md) — the case where the mesh retries and the
application does too.

### A retry budget

Limiting the number of attempts per request does not prevent the storm — a thousand clients with three
attempts each still generate three thousand calls.

The control that works is limiting the **proportion**:

```text
budget: retries ≤ 10% of the initial requests
  → under generalized failure, the extra load is limited to 10%
  → the destination receives 1,100 req/s instead of 3,000
```

When the budget runs out, new retries are refused immediately. That preserves the ability to retry for
isolated failures — which is the legitimate case — and prevents the amplification when the failure is
generalized.

It is this section's most effective control, and the least implemented.

### Jitter is not optional

With no random variation, clients that failed together retry together:

```text
with no jitter   a mass failure → all retry at 1s, 2s, 4s → three synchronized spikes
with jitter      the attempts spread out over time
```

See [backoff](/06-distributed-systems/backoff.md). Growing waits with no jitter are worse than no wait at
all, because they create the illusion of protection while maintaining the synchronization.

### Do not retry what is not retryable

Retrying an invalid request spends capacity and cannot succeed.

```text
retryable       a timeout, a server error, unavailability, too many requests
not retryable   a malformed request, unauthorized, not found, a conflict
```

The too-many-requests case deserves a note: it is retryable, and the destination frequently reports how
long to wait. Ignoring that information and retrying immediately is what turns rate limiting into a storm.

### Metastable recovery

The phenomenon that makes all of this serious.

A system enters a state in which the retry load itself sustains the degradation — even after the original
cause has disappeared.

```text
1. original cause: the database is slow for 30 seconds
2. clients retry, the load triples
3. the database stays saturated by the retry load
4. the original cause passed; the bad state persists
5. with no intervention, it does not exit on its own
```

Getting out requires **reducing the load**: rejecting requests, turning off clients, draining queues.
Adding capacity frequently does not resolve it, because the retry load grows to fill it.

Recognizing that pattern during an incident is what avoids hours spent trying to scale.

### A queue is a silent amplifier

When the retry happens in a queue, the amplification is not visible as load — it is visible as growing
depth.

A message that fails and returns to the queue is processed again, fails again, and consumes capacity
indefinitely. See [poison messages](/06-distributed-systems/poison-messages.md) and
[dead-letter queues](/06-distributed-systems/dead-letter-queues.md).

An attempt limit with a final destination is not a detail — it is what keeps one message from consuming the
whole queue's capacity.

## Mental Model

**Retrying helps against isolated failure and amplifies generalized failure.** The control is not the
number of attempts — it is their proportion.

## When to Use

Retrying is appropriate when:

- The failure is plausibly transient.
- The operation is [idempotent](/06-distributed-systems/idempotency.md).
- There is a defined budget.
- There is a wait with jitter.
- Only one layer retries.

## When Not to Use

**In several layers.**

**With no budget.**

**With no jitter.**

**For permanent errors.**

**With no idempotency.**

**As a response to overload.** If the destination is saturated, retrying makes it worse. See
[circuit breaker](/12-reliability/circuit-breakers.md).

## Alternatives

- **A [circuit breaker](/12-reliability/circuit-breakers.md)** — stopping the attempts when the failure is
  persistent. It complements retries.
- **[Graceful degradation](/12-reliability/graceful-degradation.md)** — responding without the dependency.
- **A delayed queue** — letting the infrastructure handle the repetition, with control.
- **Failing fast** — when the caller's time budget does not accommodate a wait.

## Trade-offs

| With retries | Without |
|---|---|
| Absorbs transient failure | Propagates it |
| Amplifies generalized failure | Does not amplify |
| Higher latency in the bad case | An immediate failure |
| Requires idempotency | Does not |

| With a budget | Without |
|---|---|
| Limited amplification | Free multiplication |
| Some retries refused | All attempted |
| Recovery possible | A metastable state |

## Failure Modes

**Compound amplification.** A chain with retries at each level.

**A metastable state.** The retry load sustains the degradation.

**Synchronized spikes.** With no jitter.

**Retrying a permanent error.** Capacity spent with no chance of success.

**A queue growing from reprocessing.**

**Duplicated effect.** With no idempotency.

**Retrying against a rate limit.** It ignores the reported wait and makes things worse.

## Common Mistakes

**Not checking whether intermediate layers retry.** An HTTP client, a service mesh and a load balancer
usually retry by default. Added to the application's attempts, they multiply the load with nobody having
configured that explicitly.

**Not defining a budget.** With no ceiling on the proportion of retries over total calls, they grow
precisely when the error rate rises — which is when the system can least take it.

**Growing waits with no jitter.** Every client that failed together waits the same time and comes back
together. The wave repeats at increasingly long intervals and the service never stabilizes.

**Retrying everything indiscriminately.** A validation error and a refusal from overload do not improve
with insistence; retrying them consumes capacity and delays the recovery.

**Not limiting attempts in a queue.** A message that comes back indefinitely occupies consumers with work
that will never complete, and the queue of useful work stops behind it.

**Scaling capacity** during a metastable state. When the load is dominated by retries, more capacity serves
more retries and feeds the cycle. The source has to be cut before the throughput is increased.

## Real-World Example

A mobility platform had a 3-hour outage that started with a 40-second degradation.

The sequence:

**The origin.** A slow query left the drivers database with elevated latency for 40 seconds.

**Amplification.** The app retried 3 times. The gateway retried 2 times. The intermediate service retried 3
times. The load on the database went from 800 to around 14,000 requests per second.

**Metastability.** The original degradation passed in 40 seconds. The retry load kept the database
saturated for hours.

**Ineffective scaling.** The team doubled the application instances. That made things **worse** — more
instances meant more clients retrying against the same database.

**The exit.** After 3 hours, the team turned off the app's traffic for 5 minutes. With no load, the
database recovered in seconds. The traffic was turned back on gradually.

The investigation found that nobody knew there were three layers retrying — each configuration had been
made by a different team, at a different moment, all reasonable in isolation.

The fixes:

**Retries in one layer only.** Only the mobile client retries, with growing waits and jitter. The gateway
and the intermediate services stopped retrying — verified by an automated test that fails if a client
library retries by default.

**A 10% budget** per service, with immediate refusal above that.

**A circuit breaker** on the drivers database access, with
[graceful degradation](/12-reliability/graceful-degradation.md): with no service, the app shows drivers
from the cache with a staleness notice.

**Load shedding** at the gateway: above a limit, requests are refused with a suggested wait, instead of
queuing.

**A documented recovery procedure**, including the step that resolved it — reducing the load to zero and
turning it back on gradually. It was counterintuitive at the time, and it is what works in a metastable
state.

In the following eighteen months, three similar degradations recovered on their own in under two minutes.

The recorded conclusion: the decision that most prolonged the incident was doubling the capacity. It was
the natural reaction, and it fed exactly the mechanism that was sustaining the degradation.

## Related Concepts

- [Retries](/06-distributed-systems/retries.md) — the fundamentals.
- [Backoff](/06-distributed-systems/backoff.md) — the jitter.
- [Circuit Breakers](/12-reliability/circuit-breakers.md) — stopping the attempts.
- [Bulkheads](/12-reliability/bulkheads.md) — containing the propagation.

## Practical Exercise

Trace a request through your system and count how many layers retry — including client libraries, the
gateway and the service mesh.

Multiply the factors. That is the number of calls one request can generate at the deepest service during a
degradation.

## Interview Questions

- Why does a proportion budget work better than an attempt limit?
- What is a metastable state and why does scaling not resolve it?
- Why are growing waits with no jitter worse than no wait?

## Further Reading

- Bronson, Nathan et al. *Metastable Failures in Distributed Systems*. HotOS, 2021.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.
- Brooker, Marc. *Timeouts, Retries, and Backoff with Jitter*. Amazon Builders' Library,
  2019.
