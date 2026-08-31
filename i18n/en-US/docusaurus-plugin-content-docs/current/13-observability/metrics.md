---
id: metrics
title: Metrics
sidebar_position: 2
description: Aggregated numbers at a constant cost — and cardinality, which is what makes them expensive.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses the appropriate metric type and controls cardinality
  before it blows up the cost.
prerequisites: [observability]
related: [logs, golden-signals, dashboards]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Metrics

## Overview

Metrics are numbers aggregated over time: how many requests, what latency, how much memory.

The property that distinguishes them from [logs](/13-observability/logs.md): the cost is **constant
relative to the traffic**. A counter recording a million requests takes the same space as one recording
ten.

That makes them the right choice for trends, alerts and dashboards. And it creates their specific trap:
**cardinality**, which turns that constant cost into an explosive one.

## Problem

Metrics are cheap until they are not.

Each distinct combination of labels creates a separate time series. Adding a label with many possible
values multiplies the number of series:

```text
requests{route, method, status}          → 50 × 4 × 6 = 1,200 series
+ a customer_id label (10,000 customers) → 12,000,000 series
```

The second case takes most metrics systems down, or costs a fortune.

And the mistake is easy to make: adding the user's identifier as a label looks useful, and it is exactly
what should not be done.

## Core Concepts

### The types and what each one answers

```text
counter     only grows — requests, errors, bytes
            question: how many, and at what rate
gauge       goes up and down — memory, active connections, queue depth
            question: how much right now
histogram   a distribution — latency, response size
            question: what is the distribution, what are the percentiles
```

The typical mistake is using a gauge for what should be a counter. A gauge sampled every 15 seconds misses
the spikes between samples; a counter misses nothing, because it records everything and the rate is
derived.

And a histogram for latency, never a gauge: an individual request's latency has no aggregate meaning, the
distribution does.

### Percentiles do not sum

A property that causes frequent interpretation errors.

```text
service A: p99 = 100 ms
service B: p99 = 100 ms
A + B in sequence: p99 ≠ 200 ms
```

Percentiles from different sources cannot be summed or averaged. The average of ten instances' p99s **is
not** the service's p99.

That requires the histograms to be aggregated correctly — summing the buckets, not the calculated
percentiles. Systems that store only the percentile calculated per instance do not allow correct
aggregation.

See [latency](/06-distributed-systems/latency.md).

### Cardinality is the cost

The practical rule:

```text
a good label   few values, stable, known
               route, method, status, region, version
a bad label    many values, unbounded, unpredictable
               a user, order, session identifier, the full URL
```

The full URL case is the most insidious: `/orders/4471` as a label creates one series per order. The route
needs to be the pattern — `/orders/{id}` — not the value.

And there is a composition effect: two medium-cardinality labels multiply. A hundred values in one and a
hundred in the other produce ten thousand series.

When the question genuinely requires high cardinality — "which specific customers are suffering?" — the
answer is [logs](/13-observability/logs.md) or [traces](/13-observability/traces.md), not metrics.

### Aggregation loses information, irreversibly

A metric is aggregated at collection time. After that, there is no way to recover the detail.

```text
a metric   "the p99 latency was 2s at 2 p.m." → it does not say which requests
a log      allows finding exactly which ones
```

That defines the division of labor: metrics to know **that** something is wrong and when; logs and traces
to know **what** and **why**.

A system with excellent metrics and no logs detects problems quickly and cannot investigate them.

### Business metrics matter as much as technical ones

Orders per minute, purchases per hour, transaction value.

They detect what technical metrics do not: a technically healthy system that stopped doing what it should —
because an integration broke, a rule went wrong, or a button disappeared from the interface.

And they are the ones that communicate with the business. An alert saying "orders dropped 40% relative to
what is expected for this hour" is actionable and understandable by everybody.

See [golden signals](/13-observability/golden-signals.md) and [SLI](/12-reliability/sli.md).

### Metrics age

A metric created to investigate a specific problem stays after the problem is resolved.

They accumulate, they cost, and they fill dashboards. The periodic review — which metrics have been neither
queried nor alerted on in twelve months — usually allows removing a significant fraction.

## Mental Model

**Metrics say something is wrong; logs and traces say what.** Cardinality is what separates the two.

## When to Use

- Trends over time.
- [Alerting](/13-observability/alerting.md).
- [Dashboards](/13-observability/dashboards.md).
- [SLI](/12-reliability/sli.md).
- Sizing and capacity planning.
- Business metrics.

## When Not to Use

**With high-cardinality labels.**

**To investigate individual cases.**

**A gauge for what is a counter.**

**An average instead of a percentile**, for latency.

**Aggregating percentiles from different sources.**

**Without reviewing** the ones that stopped being used.

## Alternatives

- **[Logs](/13-observability/logs.md)** — for individual context and high cardinality.
- **[Traces](/13-observability/traces.md)** — for the path and the time breakdown.
- **Aggregatable events** — storing rich events and aggregating at query time, instead of aggregating at
  collection. It costs more storage and preserves the ability to ask new questions.
- **Exemplars** — metrics that carry pointers to representative traces, linking the aggregate to the
  individual.

The last deserves a note: it partially resolves aggregation's information loss, and it is underused.

## Trade-offs

| Metrics | Logs |
|---|---|
| Constant cost | Grows with traffic |
| Fast querying | Slower |
| Only what is instrumented | New questions |
| Limited cardinality | High possible |
| Detects | Explains |

| A counter | A gauge |
|---|---|
| Does not miss spikes | Misses between samples |
| A derived rate | An instantaneous value |

## Failure Modes

**A cardinality explosion.** The metrics system goes down or the cost skyrockets.

**Percentiles aggregated incorrectly.**

**A gauge missing spikes.**

**A metric with no context.** You know it went up, you do not know what.

**Accumulated metrics.** Hundreds nobody queries.

**Delayed collection.** The metric arrives too late to alert on.

**A restart zeroing a counter** with the system not handling it — it produces a negative rate.

## Common Mistakes

**Using an identifier as a label.** A user or order identifier creates one time series per value. It is the
cardinality explosion — the metrics system's cost grows without bound and it stops responding.

**The full URL instead of the route pattern.** `/orders/8231` generates one series per order; `/orders/{id}`
generates one. It is the most common way of exploding cardinality without noticing.

**An average for latency.** Percentiles cannot be reconstructed from averages, so the tail's information is
lost at collection time and does not come back.

**Not instrumenting business metrics.** Orders per minute detects an incident no technical metric catches —
like the flow that started failing silently on the client side.

**Not reviewing obsolete metrics.** Series nobody queries keep being collected and stored, and the cost
grows by accumulation with no benefit.

**Trying to investigate an individual case through a metric.** A metric is an aggregate by construction.
"Why did that customer's request fail" is a question for a log or a trace.

## Real-World Example

A subscriptions platform had its metrics system unavailable for 6 hours, in the middle of an incident.

The cause: a metric added two weeks earlier included the customer's plan identifier as a label. There were
few plans — around twenty. But the field used was the **subscription** identifier, not the plan's, from a
naming error in the code.

With 340,000 active subscriptions, the metric generated 340,000 time series. The system degraded for two
weeks and collapsed during a peak.

The incident being investigated when the metrics went down lasted three more hours for lack of visibility.

The fixes:

**A cardinality limit** per metric, with rejection and an alert on being exceeded. A badly instrumented
metric came to fail on its own, without taking the rest down.

**A label review** across every metric. Three more high-cardinality cases were found — the full URL instead
of the route, in two services, and a session identifier in one.

**An explicit division of labor**, documented: metrics for the aggregate, logs for the individual. The
metric that caused the problem was replaced by a field in the canonical log event.

**Exemplars** linking the latency metrics to representative traces — which resolved the original need that
led somebody to add the identifier as a label.

**A semiannual review** of unqueried metrics. The first removed 40% of them.

What the team learned: the mistake that caused everything was a swapped variable name. What turned it into
a 6-hour incident was the absence of a cardinality limit — a protection the metrics system offered and
nobody had configured.

## Related Concepts

- [Logs](/13-observability/logs.md) — for the individual.
- [Traces](/13-observability/traces.md) — for the path.
- [Golden Signals](/13-observability/golden-signals.md) — what to instrument.
- [Alerting](/13-observability/alerting.md).

## Practical Exercise

List your most-used metrics' labels and count each one's possible distinct values.

Multiply. If the result exceeds a few tens of thousands, you have a cardinality problem forming.

## Interview Questions

- Why can percentiles not be averaged?
- What makes a label good or bad?
- Why do metrics detect and not explain?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 10.
- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.
- OpenTelemetry — the metrics specification.
