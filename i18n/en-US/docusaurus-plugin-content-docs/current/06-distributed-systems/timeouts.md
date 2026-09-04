---
id: timeouts
title: Timeouts
sidebar_position: 5
description: The only tool for dealing with silence — and the one most often configured with no criterion.
doc_type: concept
level: 4
difficulty: intermediate
status: complete
objective: >
  By the end, the reader calibrates timeouts from the real latency distribution
  and propagates the remaining deadline through a chain.
prerequisites: [latency]
related: [retries, latency, circuit-breakers]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Timeouts

## Overview

A timeout is the decision to stop waiting.

It is the **only** tool available for dealing with the silence of a network call — and since
silence is indistinguishable between slow success, failure and a partition, the timeout does not
resolve the ambiguity. It only decides when to stop waiting.

## Problem

With no timeout, a call can wait indefinitely. The consequences chain together:

The thread or the connection stays occupied. Under volume, the pool is exhausted. New requests
wait for a resource. The service becomes slow for whoever calls it, and the slowness climbs the
chain.

A slow service with no timeout takes down everyone that depends on it. It is the classic cascade,
and the absence of a timeout is the most common cause.

But a badly calibrated timeout has its own problems — and they are less obvious.

**Too short:** it cuts calls that would have succeeded. If the p99 is 800 ms and the timeout is
500 ms, 1% or more of legitimate calls fail by your decision.

**Too long:** it does not protect. A 30-second timeout in a system with an 800 ms p99 only fires
when something is catastrophically wrong — and until then the resource has been occupied.

## Core Concepts

### Calibrate by the distribution, not by a round number

Timeouts tend to be 1, 5 or 30 seconds — numbers chosen for being round.

The correct calibration starts from measurement: **something above the p99, with margin**. If the
p99 is 800 ms, a 2-second timeout cuts what is genuinely abnormal and preserves what is merely
slow.

The criterion: the timeout should fire when something is wrong, not when the system is at its
normal worst case.

And it has to be re-evaluated — the p99 changes with volume and with changes in the system.

### The budget in a chain

In a chain of calls, the timeouts have to be coherent. The principle: **each level has less time
than whoever called it.**

```text
user             3,000 ms
  gateway        2,800 ms
    service A    2,500 ms
      service B  1,500 ms
        database   800 ms
```

The common error is the inverse: an internal service with a 30-second timeout called by a gateway
with 5. The caller gives up at 5 and the service keeps working for another 25 — consuming
resources to produce a response nobody will receive.

At volume, it is capacity spent on discarded work, and that does not appear in the caller's error
metrics.

### Propagate the remaining deadline

The robust solution is for the caller to state **how much time is left**, and for the receiver to
adjust its own limit:

```text
gateway → service A:   "you have 2,500 ms"
service A → service B: "you have 1,800 ms"  (I already spent 700)
```

Some protocols support that natively. In the rest, a header solves it.

Without propagation, all that is left is calibrating by hand — which works until someone changes a
timeout without looking at the whole chain.

### A timeout does not cancel the work

A frequently ignored detail: giving up on waiting **does not interrupt** the processing on the
other side. The server keeps working, keeps consuming resources, and possibly completes the
operation.

That is why a timeout plus a retry with no
[idempotency](/06-distributed-systems/idempotency.md) produces duplication: the first execution
completed, the caller did not know, and retried.

Real cancellation requires the protocol to support it and the server to respect it — both rare.

### Types of timeout

A "timeout" is usually several, and configuring only one leaves gaps:

**Connection.** Establishing the connection. Short: if the destination is reachable, it connects
fast.

**Read or response.** Waiting for the data. It is the one most people configure.

**Total request.** The maximum time, including retries and redirects.

Configuring only the read one leaves the connection one at the library's default, which is
frequently long or infinite.

## Mental Model

**A timeout is the decision that the silence has lasted long enough.** It does not say what
happened — only that you stop waiting.

## When to Use

- Every network call, without exception.
- Every resource acquisition — a pool connection, a lock.
- All background work, so as not to occupy a worker indefinitely.

## When Not to Use

**There is no network call that goes without a timeout.** What varies is the value.

**A uniform timeout for operations of different cost.** A simple query and a report do not deserve
the same limit.

**Trusting the library's default.** Several HTTP clients have an infinite timeout by default —
which means not configuring it is choosing to wait forever.

**A timeout as the only mechanism.** It avoids the wait; it does not avoid overloading the
destination. See [circuit breakers](/12-reliability/circuit-breakers).

## Alternatives

A timeout has no alternative; it has complements:

- **[Circuit breaker](/12-reliability/circuit-breakers.md)** — stop calling a destination that is failing,
  instead of waiting and giving up repeatedly.
- **Propagated deadline** — the robust form.
- **Hedged request** — send to two replicas and use the first response.
- **Degradation** — respond without the data that did not arrive.

## Trade-offs

| Short timeout | Long timeout |
|---|---|
| Frees resources fast | Resource occupied |
| Fails fast and visibly | Slow to detect |
| Cuts legitimate tail calls | Tolerates the tail |
| More retries | Fewer |
| Protects the caller | Protects the success rate |

The calibration is a choice between the caller's availability and the calls' success rate — and it
depends on which costs more in the concrete case.

## Failure Modes

**No timeout.** Indefinite waiting, exhausted pool, cascade.

**A timeout longer than the caller's.** Discarded work.

**A timeout shorter than the p99.** Failures induced by configuration.

**Only the read one configured.** The connection one stays at the default.

**A timeout plus a retry with no idempotency.** Duplication.

**A timeout that is not re-evaluated.** Calibrated for a volume that changed.

## Common Mistakes

**Choosing a round number.** Thirty seconds comes from no measurement; it comes from being a
comfortable number. The deadline has to come from the call's real latency distribution.

**Not measuring the p99 before calibrating.** A deadline below the normal tail turns calls that
would have succeeded into errors, and the system starts failing on its own under load it would
otherwise handle.

**Not propagating the deadline.** If the client has already given up, all downstream work is waste
— and it is waste precisely during an overload, when capacity is scarce.

**Assuming the timeout cancels the work on the other side.** It ends the wait, not the execution.
The server keeps processing and can complete the effect the client considers failed.

**Configuring only one type.** Connection, read and total deadline fail for different reasons. A
generous total deadline with no connection deadline leaves the call stuck trying to reach a
machine that no longer exists.

## Real-World Example

A credit lookup service was unavailable for 40 minutes, and the cause was not the service.

The external credit bureau had a degradation: the p99 went from 400 ms to 25 seconds. It did not
go down — it got slow.

The service's HTTP client had no read timeout configured. The library used infinite by default.

The requests kept waiting. The 50-connection pool was exhausted in about two minutes. From then
on, every request to the service — including the ones that did not query the bureau — waited for
a free connection.

A degraded external service completely took down an internal service that depended on it in only
30% of its operations.

The fixes, in order of effect:

**A 3-second timeout**, calibrated from the measured 400 ms p99 with generous margin. That alone
would have contained the incident: the bureau calls would fail, and the other 70% of requests
would keep working.

**A circuit breaker.** After a high failure rate, it stops calling the bureau for a period and
fails immediately — without even spending the 3 seconds.

**A separate pool** for bureau calls. Even if it is exhausted, the pool for the other operations
remains.

**Degradation.** The lookup came to return a partial response, marking the bureau's data as
unavailable, instead of failing entirely.

The last one changed the conversation with the business: a lookup without the bureau's data still
has value for the operator to decide, and nobody had asked that before.

## Related Concepts

- [Latency](/06-distributed-systems/latency.md) — the distribution that calibrates the timeout.
- [Retries](/06-distributed-systems/retries.md) — what comes after giving up.
- [Idempotency](/06-distributed-systems/idempotency.md) — what makes retrying safe.
- [Circuit Breakers](/12-reliability/circuit-breakers) — the complement.

## Practical Exercise

List your system's external calls and, for each one, check: is there a timeout configured? What is
the value? How does it compare with the measured p99?

Then check your HTTP library's defaults. Several have an infinite timeout, and not configuring it
is choosing to wait forever.

## Interview Questions

- How do you calibrate a timeout?
- Why do timeouts have to decrease along a chain?
- Why does a timeout not cancel the work on the other side?

## Further Reading

- Nygard, Michael. *Release It!* 2nd ed., 2018 — the chapter on stability patterns.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
