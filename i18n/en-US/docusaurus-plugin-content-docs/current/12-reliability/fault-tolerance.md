---
id: fault-tolerance
title: Fault Tolerance
sidebar_position: 3
description: Staying correct despite component failure — detect, isolate, recover.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs tolerance's three stages and recognizes what needs
  to be detected before it can be tolerated.
prerequisites: [reliability-basics]
related: [redundancy, resilience, circuit-breakers]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Fault Tolerance

## Overview

Fault tolerance is the ability to keep delivering **correct** service despite component failure.

It decomposes into three stages, and each one is a point where the tolerance can fail:

```text
detect    notice that something failed
isolate   keep the failure from propagating
recover   return to the correct state
```

The first is the most neglected. You do not tolerate what you do not notice — and silent failures are the
category that causes the most prolonged damage.

## Problem

A system with no tolerance has reliability equal to the product of its parts' reliability: the more
components, the worse.

```text
10 components at 99.9% each, with no tolerance → 99.0%
```

Adding functionality means adding components, which means worsening the reliability — unless the system
tolerates their failure.

That makes tolerance not an optimization, but what allows the system to grow without degrading.

## Core Concepts

### Detecting is the stage that decides

An undetected failure cannot be tolerated. And the forms of detection have different reach:

```text
health check           detects a crash; detects neither slowness nor a wrong response
timeout                detects a crash and slowness
semantic verification  detects a wrong response — comparing, validating invariants
reconciliation         detects accumulated divergence
```

The third and the fourth rarely exist, and they are the only ones that detect the most damaging category:
the component that responds, fast, with the wrong data. See
[reliability fundamentals](/12-reliability/reliability-basics.md).

See also [failure detection](/06-distributed-systems/failure-detection.md).

### Isolating prevents propagation

Once the failure is detected, the goal is that it does not reach the rest:

```text
a bulkhead          resources separated per dependency
a circuit breaker   stops calling what is failing
a timeout           limits the exposure time
load shedding       rejects instead of accumulating
```

See [bulkheads](/12-reliability/bulkheads.md) and [circuit breakers](/12-reliability/circuit-breakers.md).

With no isolation, a localized failure consumes shared resources and the whole system stops — the most
common failure mode in architectures with many dependencies.

### Recovering needs to be automatic where possible

```text
restart      the simplest and frequently sufficient
replace      recreate the instance instead of fixing it
failover     switch to the standby copy
reprocess    redo the lost work
reconcile    correct divergence
```

The second deserves emphasis: in programmable infrastructure, replacing is more reliable than fixing. An
instance recreated from code is in a known state; a fixed one is in a state nobody described.

### A silent failure is the worse category

A component that fails loudly gets handled. One that fails silently operates degraded indefinitely.

The characteristic cases:

```text
a stopped queue consumer      nothing generates an error; the effect simply does not happen
a replica that stopped replicating  it serves reads of frozen data
a scheduled task that does not run  the absence generates no event
a cache serving invalid data  fast and wrong responses
a disabled check              the protection vanished
```

The common pattern: **the absence of something generates no signal**. Detecting it requires monitoring what
should happen, not only what happens — consumer lag, a task's last run, replica lag.

### Tolerating has a cost, and it does not always pay off

Each mechanism adds complexity, and complexity adds failure modes of its own.

The criterion: the cost of tolerating should be less than the expected cost of the failure.

```text
critical component, frequent failure   → tolerate
critical component, rare failure       → fast recovery may be enough
non-critical component                 → degrade. See graceful degradation
```

The second line is the most poorly resolved in practice: elaborate tolerance is built for rare scenarios,
when reducing the recovery time would have a greater return. See
[availability metrics](/12-reliability/availability-metrics.md).

### Tolerance masks the problem

A side effect that needs to be managed: a system that tolerates well hides the real frequency of failures.

A dependency that fails 5% of the time, with retries and a circuit breaker, produces a good experience —
and the underlying degradation stays invisible until it gets bad enough to beat the protection.

That is why instrumenting the mechanisms themselves matters: retry counts, circuit openings, degradation
activations. Without it, the worsening only appears in the outage. See
[retry storms](/12-reliability/retry-storms.md).

### Tolerating requires deciding what "correct" means under failure

A point that precedes the three stages: to tolerate, you need to know which state is acceptable when the
ideal component is not available.

```text
data from 5 minutes ago  acceptable for a catalog, unacceptable for a balance
a partial response       acceptable for search, unacceptable for a statement
a queued operation       acceptable for a notification, unacceptable for an authorization
a refusal                acceptable when the alternative is a wrong result
```

Without that decision, each tolerance mechanism adopts an implicit behavior — and implicit behaviors
compose badly. One service serves stale data, the next combines it with current data, and the result is
inconsistent with nothing having visibly failed.

The decision belongs to the domain, not to the infrastructure. See
[graceful degradation](/12-reliability/graceful-degradation.md).

## Mental Model

**Tolerance is detecting, isolating and recovering.** The weakest link is usually the first.

## When to Use

- Components whose failure would take the system down.
- External or historically unstable dependencies.
- Systems with many components, where the composition degrades.
- Where the failure is frequent enough for the cost to pay off.
- Where manual recovery time is unacceptable.

## When Not to Use

**With no detection.** You do not tolerate what you do not notice.

**For rare failures** where fast recovery would be enough.

**Without instrumenting the mechanisms.**

**When the mechanism is more fragile than the component** it protects.

**Masking a problem** that should be fixed at the source.

**On non-critical components**, where degrading is simpler.

## Alternatives

- **Fast recovery** — instead of tolerating, shortening the time to resume.
- **[Graceful degradation](/12-reliability/graceful-degradation.md)** — operating without the component.
- **Simplifying** — fewer components fail less.
- **Replacing the unstable dependency** — treating the cause instead of the symptom.

## Trade-offs

| With tolerance | Without |
|---|---|
| The failure is absorbed | It propagates |
| Additional complexity | Fewer parts |
| Failure modes of its own | Fewer |
| The problem can stay hidden | Visible |
| A permanent cost | None |

| Deep detection | Shallow |
|---|---|
| Finds silent failures | Only crashes |
| A verification cost | Low |
| A false positive risk | Lower |

## Failure Modes

**An undetected failure.** It operates degraded indefinitely.

**No isolation.** One dependency takes everything down.

**The tolerance mechanism failing.** The circuit breaker opens improperly; the failover does not work.

**A masked problem.** The degradation grows invisibly.

**A recovery that does not recover.** Restarting does not resolve the cause and the cycle repeats.

**Excessive complexity.** More failure modes than the ones you wanted to tolerate.

## Common Mistakes

**Investing in isolation with no detection.**

**A health check that only tests whether the process responds.**

**Not monitoring absence** — a stopped consumer, a task that did not run.

**Not instrumenting the tolerance mechanisms.**

**Tolerating instead of fixing the cause.**

**Not exercising it.** See [chaos engineering](/12-reliability/chaos-engineering.md).

## Real-World Example

A billing platform had well-built tolerance in the application layer: circuit breakers, retries with a
budget, degradation for non-essential services.

One problem went eleven months undetected.

The consumer that processed payment confirmations from one of the gateways failed on around 2% of the
messages, because of a response format it did not know how to interpret. The message went to the
dead-letter queue, which nobody monitored.

The effect: 2% of the payments confirmed by the gateway were never marked as paid. Customers received
charges for invoices already paid.

No alert fired in eleven months. The system was available, fast and correct in 98% of the cases — and the
tolerance worked exactly as designed: it isolated the failure and moved on.

The detection came from the support team, on noticing a pattern in the complaints.

The fixes attacked the missing stage:

**Dead-letter queue monitoring**, with an alert on any message. See
[dead-letter queues](/06-distributed-systems/dead-letter-queues.md).

**Daily reconciliation** between payments confirmed by the gateway and invoices marked as paid, with an
alert on divergence. That was the fix that would have detected the problem in one day.

**Absence monitoring**: an alert if the number of confirmations processed falls outside the expected range.

**Instrumentation of the mechanisms**: counts of circuit openings, retries and discarded messages, with a
dashboard and a trend alert.

The later assessment points out: they had invested heavily in isolating and recovering, and almost nothing
in detecting. The failure was isolated perfectly — and it stayed isolated, silent, for eleven months.

## Related Concepts

- [Redundancy](/12-reliability/redundancy.md) — the most common mechanism.
- [Resilience](/12-reliability/resilience.md) — the broader property.
- [Bulkheads](/12-reliability/bulkheads.md) and [Circuit Breakers](/12-reliability/circuit-breakers.md) —
  the isolation.
- [Failure Detection](/06-distributed-systems/failure-detection.md).

## Practical Exercise

List your system's tolerance mechanisms and, for each one, answer: is there a metric of how many times it
was activated?

Where there is not, the mechanism may be masking a growing degradation.

## Interview Questions

- What are tolerance's three stages, and which is usually the weakest?
- Why is a silent failure the most damaging category?
- Why can successful tolerance hide a problem?

## Further Reading

- Avizienis, Algirdas et al. *Basic Concepts and Taxonomy of Dependable and Secure Computing*. IEEE TDSC,
  2004.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
