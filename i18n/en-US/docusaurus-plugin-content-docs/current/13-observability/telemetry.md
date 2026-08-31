---
id: telemetry
title: Telemetry
sidebar_position: 6
description: Instrumenting, collecting and paying for it — the cost that grows faster than the system.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs the telemetry stack with controlled cost and with no
  vendor coupling.
prerequisites: [observability]
related: [logs, metrics, distributed-tracing]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Telemetry

## Overview

Telemetry is everything the system emits about itself — [logs](/13-observability/logs.md),
[metrics](/13-observability/metrics.md), [traces](/13-observability/traces.md) — and the infrastructure
that collects, transports, stores and queries that data.

It is treated as a tooling detail and it is an architectural decision, for two reasons:

**The cost is material.** In many systems, telemetry is one of the largest items on the infrastructure
bill, and it grows faster than the traffic.

**The coupling is real.** Instrumentation embedded in the code with a vendor's library makes switching a
rewrite.

## Problem

Telemetry grows by accumulation, with no decision:

Each team instruments what it needs, with the library it knows. The volume increases with the traffic and
with each new metric. The bill arrives at the end of the month, and the reaction is cutting retention —
which is the cut that hurts investigation the most.

And, when somebody proposes switching tools, you discover the instrumentation is spread across hundreds of
files, coupled to a specific API.

## Core Concepts

### Instrumentation and collection are separate layers

The separation that resolves the coupling:

```text
instrumentation   the code emits data in a standard format
collection        an agent or collector receives, processes and sends
destination       where it is stored and queried
```

With standardized instrumentation, switching the destination is configuration in the collector — not a code
change.

The open telemetry standard exists exactly for that, and adopting it is the decision that most preserves
freedom in this area, at close to zero cost at the project's start.

Teams that instrument directly with the vendor's library pay for that decision later, when the cost or the
dissatisfaction motivates the switch. See [vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

### The collector is where the decisions happen

A collector between the application and the destination allows:

```text
filtering       discarding what is not used
sampling        including tail-based. See distributed tracing
enriching       adding environment, region, version
transforming    reducing cardinality, removing expensive attributes
redirecting     different destinations per signal type
protecting      removing sensitive data before it leaves
```

The last frequently justifies the collector on its own: a single layer where sensitive data filtering is
guaranteed, instead of depending on each service.

And it decouples availability: if the destination becomes unavailable, the collector buffers temporarily
instead of the application failing or blocking.

### Telemetry cannot take the application down

A rule that looks obvious and is frequently violated:

```text
asynchronous emission   never on the request's critical path
dropping under pressure if the buffer fills, drop instead of blocking
silent failure          destination unavailability does not affect the application
resource limits         the instrumentation does not consume memory without a ceiling
```

There have been incidents caused by the observability system itself: synchronous collection blocking
requests, a buffer growing without limit until memory ran out, an agent consuming the service's CPU.

And there is a consequence: **the dropping needs to be monitored**. A collector dropping silently produces
gaps that look like an absence of events.

### The cost has known levers

In order of return:

```text
a canonical event         reduces log volume by an order of magnitude
sampling by outcome       preserves errors and slowness, discards the rest
cardinality               the cost multiplier for metrics
tiered retention          hot for days, cold for months
removing the unused       metrics and fields nobody queries
compression and aggregation  at the edge, before transporting
```

The first and the second are in [logs](/13-observability/logs.md), and they have the greatest impact.

The fifth deserves discipline: an audit of what is actually queried usually allows removing a large
fraction of what is collected.

### Cost per business unit

As in [cost architecture](/09-cloud-architecture/cost-architecture.md), the absolute number says little.

```text
telemetry cost per request
telemetry cost as a fraction of the infrastructure bill
```

The second ratio is the most revealing. When telemetry passes a reasonable fraction of the infrastructure —
something between 5% and 15% in most cases —, it is worth investigating.

And the trend matters more than the value: telemetry growing faster than the traffic indicates
instrumentation accumulating, not the system growing.

### Do not instrument to fill dashboards

The criterion that avoids accumulation: **which question does this data answer?**

If the answer is "I do not know, it may be useful", it probably will not be — and it will cost every month.

The instrumentation that pays off comes from: questions already asked during incidents,
[golden signals](/13-observability/golden-signals.md), [SLI](/12-reliability/sli.md), and business metrics.

## Mental Model

**Telemetry is infrastructure with a growing cost.** Instrument in a standard format, decide in the
collector, and review what is collected.

## When to Use

- Always — the question is how much and how.
- High priority in distributed systems.
- Before you need it: instrumenting during the incident is not an option.

## When Not to Use

**Instrumentation coupled to the vendor's library.** Switching vendors comes to require touching every
instrumented point in the code, which in practice means never switching.

**Synchronous emission on the critical path.** The collector's latency enters the request's latency, and a
slowdown in the observability system becomes a slowdown in the product.

**With no resource limits** for buffers. When the collector becomes unavailable, the buffer grows until it
consumes the application's memory — and the telemetry takes down what it was supposed to observe.

**Without monitoring dropping.** Telemetry dropped from saturation produces incomplete dashboards that look
complete, and the conclusion drawn from them is wrong with no warning.

**Collecting what nobody queries.** The ingestion and storage cost grows with the volume, and most of what
is collected out of caution is never opened.

**With no sensitive data filtering** before it leaves. Once sent to the vendor, the personal data has left
your perimeter — and frequently the country.

## Alternatives

- **The vendor's managed collector** — less operation, more coupling.
- **Your own storage** — cheaper at high volume, more operation.
- **Different destinations per signal** — metrics in one system, logs in another, choosing the best cost
  for each profile.
- **Continuous profiling** — it complements the three signals for the time inside the process.

## Trade-offs

| An open standard | The vendor's library |
|---|---|
| Switching destination with no code | A rewrite |
| Advanced features may be missing | Complete integration |
| One instrumentation for everything | One per vendor |

| With a collector | Direct to the destination |
|---|---|
| Centralized decisions | Each service decides |
| A component to operate | Fewer parts |
| Decouples availability | The application depends on the destination |

## Failure Modes

**Telemetry taking the application down.** Synchronous collection or an unbounded buffer.

**Cost growing faster than the traffic.**

**Silent dropping.** Gaps indistinguishable from an absence of events.

**Sensitive data at the destination.**

**Coupling preventing the switch.**

**The collector as a single point.** It goes down, and the visibility disappears at the worst moment.

**Retention cut for cost**, removing what is missed.

## Common Mistakes

**Instrumenting with the vendor's library.**

**Emitting synchronously.**

**Not monitoring the telemetry system itself.**

**Not auditing what is queried.**

**Cutting retention as the first cost measure.**

**Having no collector**, letting each service send directly.

## Real-World Example

A commerce platform had its observability bill grow 4 times in one year, while the traffic grew 60%.

It came to represent 28% of the total infrastructure cost.

The first reaction was cutting log retention from 30 to 7 days. That reduced the bill by 15% and created a
problem: three investigations in the following months could not be concluded because the data no longer
existed.

The structured analysis found the distribution:

```text
logs         62% of the bill — line volume
metrics      24% — cardinality
traces       11%
others        3%
```

And the causes:

**Scattered logs.** 22 lines per request, mostly progress.

**Cardinality.** Seven metrics with identifiers as labels, creating millions of series.

**Collection with no filter.** Each service sent directly to the destination, with nothing removing what
was not used.

**No audit.** Nobody knew what was actually queried.

The fixes:

**A canonical event** replacing the scattered logs. Log volume reduced by 90%.

**A collector introduced**, with filtering, tail-based sampling for traces, and removal of
high-cardinality attributes.

**A usage audit.** Of 410 metrics, 240 had been neither queried nor alerted on in twelve months. Removed.

**Retention restored** to 30 days — and extended to 90 in cold storage, which costs a fraction.

**Sensitive data filtering in the collector**, which the audit revealed did not exist: tokens and document
numbers appeared in error logs.

**A cost-per-request metric**, tracked monthly.

Result: the bill fell 78% relative to the peak, with **more** retention and more investigation capability.

What the team learned: the first cut — reducing retention — was the worst possible move. It attacked the
dimension that matters most for investigation and left the three real causes intact.

## Related Concepts

- [Logs](/13-observability/logs.md), [Metrics](/13-observability/metrics.md) and
  [Traces](/13-observability/traces.md) — what is emitted.
- [Distributed Tracing](/13-observability/distributed-tracing.md) — the sampling.
- [Cost Architecture](/09-cloud-architecture/cost-architecture.md).
- [Vendor Lock-In](/09-cloud-architecture/vendor-lock-in.md).

## Practical Exercise

Find out how much telemetry represents of your infrastructure bill, and the trend over the last twelve
months.

Then audit: how many of your metrics were queried or used in an alert in the last year?

## Interview Questions

- Why separate instrumentation from collection?
- Which decisions does the collector allow that the application does not?
- Why is cutting retention the worst first cost measure?

## Further Reading

- OpenTelemetry — the specification and the collector.
- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
