---
id: latency
title: Latency
sidebar_position: 4
description: The time between asking and receiving — and why the average hides exactly what matters.
doc_type: concept
level: 4
difficulty: intermediate
status: complete
objective: >
  By the end, the reader reasons about latency in percentiles, understands how it composes
  along a chain, and knows why the tail dominates the experience.
prerequisites: [distributed-fundamentals]
related: [timeouts, network-failure, bottleneck-analysis]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Latency

## Overview

Latency is the time between sending a request and receiving the response.

Two properties make reasoning about it counterintuitive: **it is a distribution, not a number**,
and **in a chain of calls, the tail dominates**.

## Problem

The standard way to report latency is the average, and it is almost always the wrong metric.

A system with a 200 ms average can have 5% of requests above 3 seconds. Those 5% are real users,
and the average never reveals them — because the latency distribution is not symmetric. It has a
long right tail, produced by network retransmission, garbage collection, cold caches, contention
and all the irregularities of a real system.

Reporting an average in a system with a long tail is reporting the number that describes nobody.

## Core Concepts

### Percentiles, always

The 99th percentile means: 99% of requests were faster than this.

```text
p50  = 80 ms      ← half the requests
p95  = 240 ms
p99  = 1,400 ms   ← 1 in 100
p999 = 4,200 ms   ← 1 in 1,000
```

The p50 and the p99 of the same system usually differ by an order of magnitude.

Which percentile to monitor depends on the volume. With a million requests per day, the p999 is a
thousand requests — enough people to generate complaints.

And percentiles **do not add up**. A chain's p99 is not the sum of each link's p99 — you have to
measure end to end.

### The tail dominates in a chain

The most important result in this document, and the least intuitive.

If a user request triggers N parallel calls and needs all of them, the perceived latency is that
of the **slowest** of the N.

```text
1 call with a 1 s p99      → ~1% of requests above 1 s
100 parallel calls         → ~63% of requests have at least one above 1 s
```

With a hundred calls, the probability that none falls in the 99th percentile is
`0.99¹⁰⁰ ≈ 0.37`. That is: **a service's p99 becomes the common case for a page that queries it a
hundred times.**

That is what Jeff Dean called the *tail at scale*, and it is why reducing the tail matters more
than reducing the average in systems with many calls.

### Where latency comes from

| Component | Order of magnitude |
|---|---|
| Memory reference | ~100 ns |
| Round trip within the same zone | ~0.5 ms |
| Random read on a solid-state disk | ~100 µs |
| Round trip between regions, same continent | ~30 ms |
| Intercontinental round trip | ~150 ms |

The last line is physics — the speed of light in fiber gives about 200 km/ms, and the path is
never straight. No code optimization compensates for distance, and that is why
[CDNs](/05-system-design/cdn.md) and multi-region exist.

### Latency under load is not linear

A resource responds stably up to about 70% utilization and degrades rapidly after that, because
queue wait time grows non-linearly as utilization approaches 100%.

The practical consequence: a system that responds well at 60% load can become unusable at 90% —
not because something broke, but because the queue grew.

### Variable latency is worse than high latency

A system that consistently responds in 500 ms is easier to design around than one that responds
between 50 ms and 3 seconds.

Predictable latency lets you calibrate [timeouts](/06-distributed-systems/timeouts.md), size pools
and promise deadlines. Variable latency forces sizing for the worst case, and the worst case is
unknown.

## Mental Model

**Latency is a distribution.** The question is never "how long does it take", it is "how long does
it take for how many".

## When to Use

This document informs:

- Defining performance requirements in percentiles, not in averages.
- Calibrating [timeouts](/06-distributed-systems/timeouts.md) from the real percentile.
- Deciding whether parallelizing calls helps or hurts.
- Evaluating whether a multi-region architecture is necessary.

## When Not to Use

**Optimizing latency that already meets the requirement.** Capacity spent where it does not pay
off.

**Chasing the average.** It is rarely what users perceive.

**Ignoring the tail because "it's only 1%".** In a chain, that 1% becomes the common case.

**Parallelizing without considering the tail.** Splitting an operation into ten parallel calls
reduces the average latency and worsens the high percentile.

## Alternatives

To reduce perceived latency, when optimizing is not enough:

- **Cache** — avoid the operation. See
  [caching](/05-system-design/caching.md).
- **Proximity** — a CDN, a regional replica.
- **Asynchronous** — respond before completing. See
  [request/response](/05-system-design/request-response.md).
- **Hedged request** — send the same request to two replicas and use the first response. It
  reduces the tail at the cost of duplicated work.
- **Degrade** — serve a partial response instead of waiting for the slow one.

## Trade-offs

| Reduce the tail | Reduce the average |
|---|---|
| Improves the perceived experience | Improves the reported number |
| Hard: requires finding irregularities | More direct |
| Dominates in systems with many calls | Dominates with few |

| Parallelize | Sequential |
|---|---|
| Lower total latency in the typical case | Sum of the times |
| Multiplied exposure to the tail | One exposure |
| More simultaneous load | Distributed |

## Failure Modes

**A requirement in averages.** The system "meets it" and users complain.

**Tail ignored.** The p99 degrades and the average does not move.

**A timeout calibrated by the average.** It cuts the legitimate high-percentile case.

**Parallelization that makes it worse.** Ten parallel calls, each with a 1 s p99, produce a
response above 1 s in about 10% of cases.

**Latency measured on the wrong side.** Measuring at the server hides the network and queue time,
which is what the user feels.

## Common Mistakes

**Reporting and monitoring averages.**

**Not measuring end to end.**

**Assuming percentiles add up.**

**Ignoring variability.** Unstable latency costs more than high and stable latency.

**Measuring only under normal conditions.** The tail appears under load.

## Real-World Example

A search results page queried six services in parallel and waited for all of them.

Each service had an 800 ms p99 and a 90 ms average. The dashboard showed a 110 ms average and the
team considered the performance excellent.

The slowness complaints did not stop.

End-to-end measurement, from the client's side, showed another reality: a 180 ms p50, a 1.2 s p95,
a 2.4 s p99.

The cause is arithmetic. With six parallel calls at an 800 ms p99, the chance that none falls in
the high percentile is `0.99⁶ ≈ 0.94` — that is, **6% of the pages had at least one slow call**,
and the whole page waited for it.

Two fixes.

Three of the six services were enrichment — reviews, recommendations, history. They got their own
200 ms deadline, and the page is rendered without them if they blow it. Degradation instead of
waiting.

And the service with the worst tail got a hedged request: the call goes to two replicas and the
first response wins. The duplicated work costs about 5% more load and cut that service's p99 to
240 ms.

End-to-end result: a 310 ms p95, a 520 ms p99.

The average had never been the problem, and that is why the dashboard never showed anything.

## Related Concepts

- [Timeouts](/06-distributed-systems/timeouts.md) — calibrated from the distribution.
- [Network Failure](/06-distributed-systems/network-failure.md) — the origin of the variability.
- [Bottleneck Analysis](/05-system-design/bottleneck-analysis.md).
- [Observability](/13-observability/index.md) — how to measure.
- [Non-Functional Requirements](/01-fundamentals/non-functional-requirements.md) — where
  the distribution becomes a requirement with a number.

## Practical Exercise

Take the most important operation in your system and obtain the p50, the p95 and the p99, measured
end to end.

If you only have the average, that is the discovery. If the ratio between p99 and p50 is greater
than ten, you have a tail that dominates the experience.

## Interview Questions

- Why is reporting latency as an average problematic?
- Why does the tail dominate in systems with many calls?
- How can parallelizing worsen perceived latency?

## Further Reading

- Dean, Jeff; Barroso, Luiz André. *The Tail at Scale*. CACM, 2013.
- Gregg, Brendan. *Systems Performance*. 2nd ed., 2020.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
