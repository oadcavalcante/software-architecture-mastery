---
id: backoff
title: Backoff
sidebar_position: 7
description: Spacing out the attempts — and why without jitter, backoff synchronizes the clients.
doc_type: concept
level: 4
difficulty: intermediate
status: complete
objective: >
  By the end, the reader applies exponential backoff with jitter and understands
  why the jitter is the essential part, not a detail.
prerequisites: [retries]
related: [retries, rate-limiting, retry-storms]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Backoff

## Overview

Backoff is increasing the interval between successive attempts.

It exists because an immediate [retry](/06-distributed-systems/retries.md) concentrates load
exactly when the destination cannot take it. And the part most often omitted — the **jitter** — is
what actually makes the mechanism work.

## Problem

A service is unavailable for 30 seconds. A thousand clients fail.

With no backoff, the thousand retry immediately. And again. And again. The service, which was
recovering, receives continuous load and cannot.

With fixed backoff — wait 1 second — the thousand wait a second and try **all at the same time**.
The load did not decrease; it became pulses.

With exponential backoff and no jitter — 1 s, 2 s, 4 s, 8 s — the same thing: the clients that
failed together stay synchronized, and the pulses become more spaced out and equally
concentrated.

**Synchronization is the problem, and only jitter solves it.**

## Core Concepts

### Exponential plus jitter

The usual formula:

```text
wait = min(cap, base × 2^attempt)
wait = random(0, wait)          ← the jitter
```

The first line gives the growth. The second spreads the clients across the window,
desynchronizing them.

Without the second line, a thousand clients that failed at the same instant come back at the same
instant. With it, they spread out — and the destination receives gradual load instead of a pulse.

That form — drawing from the whole interval — is known as *full jitter*, and experiments published
by AWS showed it reduces both contention and total completion time compared with variants that
draw from only part of the interval.

### The cap matters

With no limit, the wait grows indefinitely: the tenth attempt would wait more than 17 minutes with
a 1-second base.

A cap — typically tens of seconds — keeps the retry useful. The growth exists to relieve the
destination, not to give up through arithmetic exhaustion.

### Backoff does not replace an attempt limit

They are different mechanisms. Backoff controls **when** to try; the limit controls **how many
times**.

Backoff with infinite attempts occupies resources indefinitely and never fails visibly — which
prevents the alert.

### `Retry-After` takes precedence

When the destination states how long to wait, that instruction beats the local calculation. It
knows more about its own state than the client can infer.

Ignoring `Retry-After` and using your own backoff is wasting information the server provided on
purpose.

### Backoff in a queue is different

In a [queue](/05-system-design/queues.md), backoff is usually implemented as a redelivery delay:
the message becomes visible again after N seconds.

The effect is the same and the mechanism is not the client's — it is the queue's. Configuring
retries in the consumer **on top of** the queue's mechanism produces two layers of repetition that
multiply.

### The jitter variants

"Add jitter" admits different formulations, with distinct behaviors:

```text
full jitter          wait = random(0, current_cap)
partial jitter       wait = current_cap/2 + random(0, current_cap/2)
decorrelated         wait = min(cap, random(base, previous_wait * 3))
```

**Full jitter** is the one that disperses the load most and gives the best aggregate result in
most measurements. The cost is that an individual attempt can happen almost immediately, which
looks wrong to whoever reads the code.

**Partial jitter** guarantees a floor on the wait. It is more intuitive and disperses less.

**Decorrelated** grows based on the previous wait, not on the attempt number. It disperses well
and is less predictable to reason about.

When in doubt, full jitter. The objection "but it might try again in 10 ms" is exactly the
behavior that avoids the synchronized pulse.

The base deserves the same attention as the cap and gets less. A very short base wastes attempts
before the transient failure has had time to pass; too long a base spends the caller's budget on
the first wait. The reasonable starting point is the operation's typical latency, not a round
value chosen out of habit.

## Mental Model

**Backoff spreads the attempts over time; jitter spreads them across clients.** Both are
necessary, and the second is the forgotten one.

## When to Use

- Whenever there are automatic retries.
- When reconnecting to a service that went down.
- When consuming a rate-limited API.
- In any situation where many clients can fail simultaneously.

## When Not to Use

**With no retries.** Backoff only makes sense accompanying repetition.

**When the destination stated the deadline.** Use what it said.

**For a permanent failure.** Waiting does not change an invalid request.

**When the operation has a short deadline.** If the user waits 3 seconds, a backoff that reaches 8
has already exceeded the budget — the attempt happens after the caller has given up.

**Backoff with no jitter.** It is worse than not having it, because it gives the impression of
protection while preserving the synchronization.

## Alternatives

- **[Circuit breaker](/12-reliability/circuit-breakers.md)** — stop trying instead of spacing out. More
  effective when the failure is persistent.
- **Queue with delay** — let the messaging mechanism handle it.
- **Retry budget** — limit the proportion instead of the interval.
- **Fail fast** — when the caller's deadline does not accommodate waiting.

## Trade-offs

| Long backoff | Short backoff |
|---|---|
| Relieves the destination | Pressures it |
| Slower recovery | Faster if transient |
| Occupies the caller's resources longer | Frees them earlier |

| With jitter | Without |
|---|---|
| Desynchronized clients | Synchronized pulses |
| Gradual load on the destination | Periodic spikes |
| Unpredictable completion time per client | Predictable and worse in aggregate |

## Failure Modes

**Synchronization from missing jitter.** Pulses that prevent recovery.

**No cap.** The wait grows until the retry becomes useless.

**Backoff beyond the caller's deadline.** An attempt that happens after nobody is waiting.

**Two layers of retries.** Client and queue retrying, multiplying.

**Backoff ignoring `Retry-After`.**

## Common Mistakes

**Omitting the jitter.** It is the dominant error, and the easiest to fix.

**Backoff with no attempt limit.**

**Not considering the caller's time budget.**

**Reimplementing it instead of using the HTTP client's or the resilience library's.**

## Real-World Example

A system with 3,000 worker instances consumed a rate-limited internal API.

When the limit was reached, the API returned `429`. The workers had exponential backoff configured
— with no jitter.

The observed behavior was characteristic: the API alternated between 100% utilization and
practically zero, in cycles of a few seconds.

The cause: the workers failed roughly together, waited the same interval, and came back together.
On each cycle, the pulse blew through the limit again, and everyone backed off again.

The API's average utilization was about 35% of capacity, and even so the workers took hours to
finish processing — because most of the time they were waiting in sync.

The fix was one line: draw the wait from the interval `[0, computed]` instead of using the computed
value.

The result: the API's utilization stabilized around 85%, with no pulses, and the total processing
time dropped from hours to minutes.

No capacity was added. What changed was the clients no longer all trying at the same instant.

## Related Concepts

- [Retries](/06-distributed-systems/retries.md) — the mechanism backoff regulates.
- [Rate Limiting](/05-system-design/rate-limiting.md) — the server's side.
- [Circuit Breakers](/12-reliability/circuit-breakers) — the alternative when the failure persists.
- [Retry Storms](/12-reliability/index.md).

## Practical Exercise

Check your system's retry configuration: is there backoff? Does it have jitter?

If it has backoff with no jitter, you have synchronized clients — and that only appears as a
problem when many fail at the same time.

## Interview Questions

- Why is backoff with no jitter insufficient?
- Why does backoff need a cap?
- When should `Retry-After` prevail over the local calculation?

## Further Reading

- Brooker, Marc. *Exponential Backoff and Jitter*. AWS Architecture Blog, 2015 — the experiments
  that compared the variants.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
