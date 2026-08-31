---
id: retries
title: Retries
sidebar_position: 6
description: Trying again — and why a badly designed retry is the cause, not the cure.
doc_type: concept
level: 4
difficulty: intermediate
status: complete
objective: >
  By the end, the reader decides what is retryable, bounds the attempts, and
  recognizes the amplification that chained retries produce.
prerequisites: [timeouts, idempotency]
related: [backoff, idempotency, retry-storms]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Retries

## Overview

A retry is repeating an operation that failed, in the expectation that the failure is transient.

It works because many failures in distributed systems are in fact temporary — a lost packet, an
instance restarting, a momentary spike.

And it is, with uncomfortable frequency, **the cause of the incident rather than the cure**.

## Problem

A retry looks like a local decision and is a systemic one.

When a service is degraded, all its clients start retrying at the same time. The load on it
**increases** precisely when it can no longer keep up. What was degradation becomes collapse.

Worse in a chain. If each level retries three times:

```text
1 user request
  → 3 attempts at the gateway
    → 9 at service A
      → 27 at service B
        → 81 at the database
```

One request becomes 81. Under degradation, when every request is failing, the load at the bottom
of the chain multiplies by 81.

That is a [retry storm](/12-reliability/index.md), and it is one of the most common failure modes
in distributed systems.

## Core Concepts

### Not every failure is retryable

The first decision, and the one most often gotten wrong: retrying only makes sense for
**transient** failures.

| Failure | Retryable? |
|---|---|
| Timeout, connection refused | Yes — probably transient |
| `503`, `429` | Yes — the service is asking you to try later |
| `500` | Maybe — depends on the cause |
| `400`, `422` — invalid request | **No** — retrying produces the same error |
| `401`, `403` | **No** — permission does not change by retrying |
| `404` | **No**, except under eventual consistency |
| `409` — conflict | **No** without resolving the conflict |

Retrying a permanent failure is guaranteed waste: three attempts produce the same error three
times, with three times the load.

### Retrying requires idempotency

An operation that failed with a timeout may have been executed. Retrying with no
[idempotency](/06-distributed-systems/idempotency.md) duplicates the effect.

That is the rule that admits no exception: **if it is not idempotent, do not retry
automatically.**

Many HTTP clients retry by default only methods considered safe — `GET`, `PUT`, `DELETE` — and
not `POST`. That is a reasonable protection and is frequently circumvented by whoever configures
generic retries without looking.

### Attempt limit and budget

Two ways to limit:

**Count.** Three attempts, then give up. Simple, and under widespread degradation it still
triples the load.

**Budget.** Limiting the proportion of retries over the total number of requests — for example,
at most 10% extra attempts in a window. When many things fail, the retry limits itself.

The budget is the most effective protection against a storm, and the least implemented.

### Retry at one level, not at all of them

The simplest defense against amplification: **choose one level to retry at.**

Typically the one closest to the origin — the client or the gateway — and disable it in the
intermediaries. That preserves resilience and eliminates the multiplicative effect.

When each team configures retries in their own service with no view of the whole, the
multiplication happens by composition, with nobody having decided.

### Retrying is not the answer to overload

If the destination is overloaded, retrying makes it worse. The correct answer is to reduce the
pressure: [backoff](/06-distributed-systems/backoff.md), a circuit breaker, or shedding load.

A service that returns `429` is explicitly asking you to wait — and retrying immediately ignores
the request.

### Retry rate is a leading indicator

The instrumentation that pays off most in this area costs little and rarely exists: counting
retries separately from initial attempts.

A system with well-configured retries hides failures — that is its function. The consequence is
that degradation stays invisible in the success metrics up to the point where the retries can no
longer keep up, and then the drop is abrupt.

The retry rate rises before that. It is the signal that the dependency is getting worse while the
result still looks good.

Three metrics worth having, per destination: the proportion of requests that needed at least one
retry; the distribution of the number of attempts until success; and the proportion that
exhausted the limit.

The second is the most informative. When the distribution shifts from "almost everything on the
first" to "a good part on the second", something is happening that nobody noticed.

## Mental Model

**A retry transfers work from the future to now.** When the system is healthy, that is cheap.
When it is degraded, it is exactly what it cannot take.

## When to Use

- The failure is plausibly transient.
- The operation is idempotent, or it is a read.
- There is an attempt limit and [backoff](/06-distributed-systems/backoff.md).
- The retry level was chosen deliberately.

## When Not to Use

**Permanent failure.** An invalid request, denied permission, a conflict.

**A non-idempotent operation.** Guaranteed duplication under a timeout.

**At every level of the chain.** Multiplicative amplification.

**With no backoff.** Retrying immediately concentrates the load at the worst moment.

**With no limit.** Infinite retries occupy resources indefinitely and never fail visibly — which
prevents the alert.

**When the destination asked you to wait.** `Retry-After` is an instruction, not a suggestion.

## Alternatives

- **Fail fast and propagate** — let the caller decide.
- **[Circuit breaker](/12-reliability/index.md)** — stop trying when the failure rate indicates a
  persistent problem.
- **Queue** — instead of retrying now, enqueue for later. See
  [queues](/05-system-design/queues.md).
- **Degrade** — respond without the data.
- **Hedged request** — send to two replicas simultaneously, instead of retrying after a failure.

## Trade-offs

| With retries | Without |
|---|---|
| Transient failure invisible to the user | Visible |
| Higher success rate | Lower |
| Extra load under degradation | Constant load |
| Higher latency on failure | Fast failure |
| Risk of duplication | No risk |
| Risk of amplification | No risk |

## Failure Modes

**Retry storm.** Everyone retries at the same time and takes the destination down.

**Chained amplification.** Multiplication per level.

**Duplication.** With no idempotency.

**Retrying a permanent failure.** Waste.

**Infinite retries.** It never fails visibly; the alert never fires.

**A synchronous retry holding a resource.** Three attempts with a 3-second timeout occupy the
connection for 9 seconds.

## Common Mistakes

**Configuring generic retries without distinguishing the failure type.** Retrying a validation
error will never work and only consumes capacity; retrying a momentary unavailability almost
always does. Treating both the same wastes in the first case and delays giving up in the second.

**Retrying a `POST` with no idempotency key.** The first attempt may have had an effect and only
lost the response. With no key, the retry creates a second order — and the duplication is born
precisely from the mechanism that existed to provide reliability.

**Enabling it in every service without looking at the chain.** Three layers with three attempts
each produce twenty-seven calls to the service at the end. Retrying becomes load amplification
on exactly the one that was already overloaded.

**Not implementing backoff.** Retrying immediately and at a fixed interval synchronizes every
client into the same window, and the recovering service receives a wave the instant it comes
back. Growing waits with randomness disperse that.

**Ignoring `Retry-After`.** It is the server saying when it will be ready. Discarding that
information and using your own policy means insisting against someone who already asked you to
wait.

## Real-World Example

A payments platform had a 25-minute outage that started with a 40-second degradation.

The authorization service became slow — it did not go down. Responses went from 200 ms to 4
seconds.

The gateway had three attempts configured, with no backoff. The orders service, which called the
gateway, also had three. The mobile app retried twice.

One user attempt produced up to 18 calls to the authorization service.

When latency rose, everyone started retrying simultaneously. The load on the authorization
service multiplied. It went from slow to unreachable.

And then the effect fed back: more failures, more retries, more load.

The 40 seconds of initial degradation became 25 minutes of unavailability, and the recovery only
happened when the team disabled retries manually.

The fixes:

**Retries at a single level** — the gateway. The orders service and the app stopped retrying.

**Exponential backoff with jitter**, instead of immediate retries.

**A retry budget**: at most 10% extra attempts over the total in a window. Under widespread
failure, retrying practically switches itself off.

**A circuit breaker** at the gateway: a high failure rate interrupts the calls for a period,
instead of continuing to try.

During a similar degradation six months later, the effect was 90 seconds of elevated error rate
and no unavailability.

The original degradation was never the problem. The response to it was.

## Related Concepts

- [Timeouts](/06-distributed-systems/timeouts.md) — what precedes the retry.
- [Backoff](/06-distributed-systems/backoff.md) — how to space the attempts.
- [Idempotency](/06-distributed-systems/idempotency.md) — the prerequisite.
- [Retry Storms](/12-reliability/index.md) — the failure mode in detail.

## Practical Exercise

Map the chain of a request in your system and add up the retries configured at each level.
Multiply.

If the number is greater than five, you have amplification — and it only appears when something
is already degraded.

## Interview Questions

- Which failures are retryable and which are not?
- Why can a retry be the cause of the incident?
- What is a retry budget and why is it more effective than a count limit?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — the chapter on handling
  overload.
- Nygard, Michael. *Release It!* 2nd ed., 2018.
