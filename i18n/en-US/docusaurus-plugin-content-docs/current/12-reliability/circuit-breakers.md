---
id: circuit-breakers
title: Circuit Breakers
sidebar_position: 14
description: Stopping the attempts when the failure is persistent — protecting both sides of the call.
doc_type: pattern
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader applies a circuit breaker with measured thresholds and
  defines the open behavior consciously.
prerequisites: [retry-storms]
related: [retry-storms, bulkheads, graceful-degradation]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Circuit Breakers

## Overview

A circuit breaker monitors the calls to a dependency and, when the failure rate passes a threshold,
**stops trying** — failing immediately for a period.

It protects both sides:

**The caller**, which stops spending resources and time waiting for something that is going to fail.

**The destination**, which stops receiving load it cannot serve and gains room to recover.

The second is the most important and the least cited: it is what breaks the [retry](/12-reliability/retry-storms.md)
cycle that prevents recovery.

## Problem

When a dependency becomes unavailable, each call consumes a connection and a thread of the caller for the
whole timeout.

```text
a 10s timeout, 500 req/s to the service that is down
  → 5,000 simultaneous requests stuck
  → connections exhausted, memory consumed
  → the caller goes down because of a non-essential dependency
```

The failure propagates upward, and an optional service takes the whole system down.

See Little's law in [performance versus scalability](/11-scalability/performance-vs-scalability.md) — high
latency with constant throughput means high concurrency.

## Core Concepts

### The three states

```text
closed     calls pass through; failures are counted
open       calls fail immediately, with no attempt
half-open  after the period, some calls pass through to test
```

The half-open state is the recovery mechanism: instead of going back to normal all at once — which would
generate a spike on the service that just recovered — it lets a fraction through.

If those calls succeed, it closes. If they fail, it opens again with a longer period.

Without half-open, reopening produces a storm against a fragile service, which goes down again — and the
system oscillates.

### The thresholds need to be measured

Libraries' default values rarely serve:

```text
failure threshold  the proportion that triggers opening
minimum volume     calls before evaluating
open period        how long before testing
half-open ratio    the fraction that passes through in the test
```

The **minimum volume** is the most forgotten parameter: without it, two failures in three calls open the
circuit, and low-traffic services oscillate constantly.

And the failure threshold needs to come from the normal error rate. A service that normally errors 2%
should not open at 5%.

### Count slowness, not only errors

A service that responds in 30 seconds with success is as damaging as one that fails — it holds the caller's
resources for the same amount of time.

Circuit breakers that count only errors do not detect that case, which is the most common in practice:
dependencies rarely go down completely; they get slow.

Counting calls above a latency threshold as failures is the adjustment that makes the mechanism work in the
real scenario.

### The open behavior needs to be decided

Opening the circuit is not the solution — it is half of it. The other half is what to do with the request:

```text
fail fast          the caller handles it
a fallback response  a cache, a default value, a simplified version
omit               the feature disappears
enqueue            process later
```

See [graceful degradation](/12-reliability/graceful-degradation.md). A circuit breaker with no fallback
behavior only trades a slow failure for a fast one — which helps the system and does not help the user.

### One circuit per dependency, not per service

If a service exposes ten operations and only one is degraded, opening the circuit for all of them removes
capacity that was working.

The appropriate granularity is per **operation** or per **group of operations with the same failure
profile** — which relates to [bulkheads](/12-reliability/bulkheads.md).

And, in partitioned services, per instance or partition: one degraded partition should not open the circuit
for the others.

### It needs to be observable

A circuit that opens with nobody knowing turns a visible problem into a silent one.

The minimum: a state metric per circuit, a count of openings, and an alert when a circuit stays open beyond
a period.

Without that, the system operates degraded indefinitely — and the degradation is precisely what the circuit
breaker was designed to make acceptable.

### Do not apply it to everything

A circuit breaker on every call adds state, configuration and a new failure mode — opening when it should
not.

It is justified where: the dependency is external or unstable, the timeout is significant, a fallback
behavior exists, and the call is frequent.

For a rare call to a reliable service, a timeout and retries are enough.

## Mental Model

**A circuit breaker converts a slow failure into a fast one, and gives the destination room to recover.**
What to do with the fast failure is a separate decision.

## When to Use

- An external or historically unstable dependency.
- A timeout long enough to hold resources.
- A fallback behavior exists.
- The call is frequent.
- The dependency is not essential, or it has an alternative.

## When Not to Use

**With no defined fallback behavior.** It only changes the failure type.

**With default thresholds**, without measuring the normal error rate.

**With no minimum volume.** Low-traffic services oscillate.

**Counting only errors**, ignoring slowness.

**One circuit per service** when the operations have different profiles.

**On every call.** Complexity with no return.

**With no observability.**

## Alternatives

- **An aggressive timeout** — simpler, and it does not protect the destination.
- **A [bulkhead](/12-reliability/bulkheads.md)** — it limits the damage without stopping the attempts.
- **A retry budget** — it controls the amplification. See [storms](/12-reliability/retry-storms.md).
- **Load shedding at the destination** — the destination protects itself, instead of depending on the
  callers.

The last deserves a note: protection at the destination is more reliable than protection distributed among
callers, because it does not depend on all of them configuring it correctly.

## Trade-offs

| With a circuit breaker | Without |
|---|---|
| Fails fast | Waits for the timeout |
| Resources preserved | Consumed |
| The destination gains room | It receives load |
| State and configuration | None |
| It can open improperly | It always tries |

| A low threshold | High |
|---|---|
| Protects early | Tolerates more |
| Opens on noise | Slow to react |

## Failure Modes

**Improper opening.** A low threshold or a missing minimum volume.

**Oscillation.** It opens and closes repeatedly.

**Permanently open.** Nobody noticed, and the feature disappeared.

**No fallback.** A fast failure instead of a slow one, and nothing more.

**Coarse granularity.** One degraded operation takes ten down.

**Slowness not counted.** The most common case does not trigger the circuit.

**A circuit per caller instance.** Each instance learns separately, and the protection takes a while — in
services with many instances, the destination receives load from all the ones that have not opened yet.

## Common Mistakes

**Using default thresholds.** The library's example values know neither your normal error rate nor your
call volume. Applied without calibration, they open too early or never.

**Not defining a minimum volume.** With three calls, one failure is a 33% error rate. Without requiring a
minimum volume in the window, the circuit opens on statistical noise.

**Not counting slowness as failure.** The dependency that responds in 30 seconds exhausts threads and takes
the caller down with no error at all — which is precisely the case the breaker was supposed to cover.

**Not defining the open behavior.** Opening the circuit without deciding what to respond only trades
slowness for an error. The value is in the alternative: a cache, a default value or declared degradation.

**Not alerting on an open circuit.** It protects the system and hides the problem. With no alert, the
dependency stays broken for days while everything looks healthy.

**Applying it indiscriminately.** On a dependency with no alternative response, opening the circuit only
brings the failure forward. It serves where degradation is possible.

## Real-World Example

A hotel booking platform called an external reviews service on every results page. The timeout was 15
seconds.

During a degradation of the external service — which started responding in 14 seconds, with no error — the
whole platform became unavailable in 6 minutes.

The cause: 400 requests per second, each stuck for 14 seconds, generated around 5,600 simultaneous
requests. The connections and threads were exhausted, and the application stopped serving **any** request —
including the ones that did not need reviews.

An optional service took the platform down.

The fixes:

**An 800 ms timeout** for reviews, derived from the normal 120 ms latency with generous margin.

**A circuit breaker** with a 30% failure threshold, a minimum volume of 20 calls, a 30-second open period
and a test with 10% of the traffic in half-open.

**Slowness counted as failure.** Calls above **400 ms** count toward the threshold. The number sits below
the timeout on purpose: at the timeout boundary the call already becomes an error by itself, and the rule
would add nothing. Between 400 and 800 ms the call responds successfully and still counts — which is the
case only this rule catches.

**A fallback behavior.** An open circuit means displaying the page without reviews, with the block omitted.
See [graceful degradation](/12-reliability/graceful-degradation.md).

**A bulkhead.** A separate connection pool for external calls, limited to 80 simultaneous — 400 req/s ×
120 ms require 48 in normal operation, and the headroom follows the sizing in
[bulkheads](/12-reliability/bulkheads.md) — so that, even
with no circuit breaker, the exhaustion does not reach the main pool. See
[bulkheads](/12-reliability/bulkheads.md).

**An alert** when a circuit stays open for more than 5 minutes.

Two months later, the same external service degraded again. The circuit opened in 12 seconds, the pages
came to be served without reviews, and no user reported a problem. The incident was recorded as
degradation, not as unavailability.

The recorded conclusion: the adjustment that mattered most was the timeout — 15 seconds was what let the
queue grow. Counting slowness came after, and it is what catches degradation that answers inside the
timeout without ever failing. The circuit
breaker's first version, installed months earlier, counted only errors — and it would have stayed closed
during the original incident, because the service responded successfully, very slowly.

## Related Concepts

- [Retry Storms](/12-reliability/retry-storms.md) — what it breaks.
- [Bulkheads](/12-reliability/bulkheads.md) — the complementary protection.
- [Graceful Degradation](/12-reliability/graceful-degradation.md) — the open behavior.
- [Timeouts](/06-distributed-systems/timeouts.md).

## Practical Exercise

List your critical path's external calls with each one's timeout.

Multiply the timeout by the request rate. That is the number of simultaneous requests stuck if the
dependency gets slow — and compare it with your application's concurrency limit.

## Interview Questions

- Why is the half-open state necessary?
- Why does counting only errors not detect the most common case?
- Why does a circuit breaker with no fallback behavior help so little?

## Further Reading

- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018 — the original formulation.
- Fowler, Martin. *CircuitBreaker*, 2014.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 22.
