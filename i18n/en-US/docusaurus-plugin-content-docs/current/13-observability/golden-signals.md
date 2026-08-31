---
id: golden-signals
title: Golden Signals
sidebar_position: 10
description: Four measures that cover most problems — and where to start when you do not know what to instrument.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader instruments the four signals per service and knows what each
  one reveals.
prerequisites: [observability]
related: [metrics, alerting, dashboards]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Golden Signals

## Overview

When you do not know what to instrument, four measures cover most of a service's problems:

```text
latency      how long it takes
traffic      how much demand there is
errors       what proportion fails
saturation   how close to the limit it is
```

They are not exhaustive. They are the starting point that avoids the common pattern — instrumenting dozens
of specific metrics and not having the basic ones when the incident arrives.

## Problem

Typical instrumentation grows by accumulation: somebody adds a metric to investigate a problem, it stays,
and the dashboard fills up.

The result is a large set of specific measures, with gaps in the fundamental ones. During an incident, the
questions are always the same — is it slow? how much traffic? how many errors? what is at its limit? — and
frequently there is no direct answer.

The four signals exist to guarantee those questions have an answer, in every service, always.

## Core Concepts

### Latency: separate success from failure

Measuring latency by aggregating successes and errors produces misleading numbers in both directions.

```text
fast errors        pull the average down — the service looks better than it is
timeout errors     pull it up — they hide that the successes are fine
```

The correct practice: latency of successful requests and of requests with errors, separately.

And always in **percentiles**, never as an average. The average of a service with 99% at 50 ms and 1% at 10
seconds is 149 ms — a number that describes nobody's experience. See
[latency](/06-distributed-systems/latency.md).

### Traffic: the denominator for everything

Requests per second, messages processed per minute, transactions per hour — the unit depends on the
service.

It matters for three reasons:

**It contextualizes the other signals.** A hundred errors per minute means different things with a thousand
or with a million requests.

**It detects anomalies by absence.** A sudden drop in traffic is frequently the first sign that something
broke before your service.

**It feeds the sizing.** See [capacity planning](/11-scalability/scaling-capacity-planning.md).

The second is underestimated: monitoring a traffic drop detects problems no error signal detects, because
the requests simply do not arrive.

### Errors: the explicit and the implicit ones

```text
explicit   an error code returned
implicit   a response with a success code and wrong content
           or latency so high that the client gave up
```

The implicit ones cause the most damage and show up the least. See
[reliability fundamentals](/12-reliability/reliability-basics.md).

Detecting them requires semantic verification: validating invariants, comparing against an alternative
source, counting responses above the latency limit as failures.

And the classification matters: client errors and server errors need to be counted separately. A spike in
client errors can indicate an integrator's behavior change; a spike in server errors is your problem.

### Saturation: the hardest and the most predictive

Saturation measures how close to its limit the most constrained resource is.

The difficulty is identifying **which** resource:

```text
CPU            easy to measure, rarely the limit
memory         more common, especially with garbage collection
connections    the most frequent limit and the least monitored
threads        an exhausted pool
a queue        growing depth
disk           operations per second, not only space
external quota a third party's limit
```

The third line deserves emphasis: connections saturate before CPU in most systems. See
[database scaling](/11-scalability/database-scaling.md).

And saturation is the **predictive** signal: latency and errors indicate the problem is already happening;
saturation indicates it is going to happen.

### Four signals, per service

The application mistake: measuring the four only at the edge.

Each service in the chain needs its own. Without that, you know the request is slow and not where it spends
the time — see [distributed tracing](/13-observability/distributed-tracing.md).

And each external dependency too: latency, traffic, errors and saturation of the calls you make outward. It
is where most problems originate, and it is what usually goes uninstrumented.

### Variations by component type

The four signals were formulated for services that serve requests. For other components, the translation:

```text
a queue        depth, age of the oldest message, input and output rates
processing     items per second, lag relative to the source, failure rate
storage        operations, latency, space, error rate
a batch        duration, fraction of the window consumed, records processed
```

The **age of the oldest message** is the latency equivalent for queues, and it is their most useful
measure. See [queue-based scaling](/11-scalability/queue-based-scaling.md).

## Mental Model

**Four questions, always the same, in every service.** They do not cover everything, and they cover enough
to start investigating.

## When to Use

- As every service's minimum instrumentation.
- As a starting point when you do not know what to measure.
- As the basis for [alerting](/13-observability/alerting.md).
- On every external dependency.
- When reviewing existing instrumentation, to find gaps.

## When Not to Use

**As complete instrumentation.** They are the floor, not the ceiling.

**Only at the edge.**

**Latency aggregating success and error.**

**Latency as an average.**

**Saturation measured only by CPU.**

**Without adapting** to the component type.

## Alternatives

- **The USE method** — utilization, saturation and errors, per resource. Infrastructure-oriented, it
  complements the golden signals, which are service-oriented.
- **The RED method** — rate, errors and duration. Essentially the golden signals without saturation.
- **[SLI](/12-reliability/sli.md)** — it measures the user's experience; the golden signals measure the
  service. They are complementary, not substitutes.

The last distinction matters: a bad SLI with good golden signals indicates the problem is outside the
service — the network, the client, an uninstrumented dependency.

## Trade-offs

| Four signals | Specific metrics |
|---|---|
| Uniform coverage | Depth at one point |
| Comparable across services | Their own context |
| Do not explain the cause | May explain it |
| Cheap and standardizable | A cost per metric |

## Failure Modes

**Latency as an average.** It hides the tail.

**Implicit errors not counted.**

**Saturation of the wrong resource.** Low CPU with connections exhausted.

**A traffic drop not monitored.**

**Signals only at the edge.** They do not localize the problem.

**External dependencies with no instrumentation.**

## Common Mistakes

**Not separating success and error latency.** Errors usually respond fast, so a rise in the failure rate
*improves* the aggregate latency — and the dashboard improves while the system gets worse.

**Using an average.** It hides the tail, which is where the affected users are. A system with a 200 ms
average can have 5% above 3 seconds.

**Measuring CPU as saturation.** Saturation is the most constrained resource, which is frequently the
connection pool, threads or queue depth. CPU is usually low when the system already accepts no more work.

**Not instrumenting outbound calls.** With no four signals on the dependencies, the service appears slow
with no visible cause, and the investigation starts in the wrong place.

**Not adapting for queues and batch processing.** There the equivalent signals are the age of the oldest
message, the completion rate and the depth — applying request latency measures nothing.

**Not alerting on a traffic drop.** Collapsing traffic is a symptom of a failure ahead of the system, and
no error metric reports it: everything looks healthy because nobody is arriving.

## Real-World Example

A payments platform had 340 metrics instrumented and a dashboard with 60 graphs.

During a latency incident, the team took 50 minutes to localize the origin — despite all the
instrumentation.

The review found the problem: the 340 metrics were specific, accumulated over years, and the basic ones
were incomplete.

```text
latency       aggregated, as an average, only at the edge
traffic       measured, with no drop alert
errors        only the explicit ones, with no client/server split
saturation    only CPU and memory
dependencies  no outbound instrumentation
```

The reformulation:

**Four signals on each of the 14 services**, standardized: latency at the 50th, 95th and 99th percentiles,
separated by outcome; traffic; errors by class; saturation of each one's limiting resource.

**Saturation identified per service.** The analysis showed that in nine of the fourteen the limit was the
connection pool, not CPU — and none had that metric.

**Outbound instrumentation** for the 23 external dependencies. That revealed that an anti-fraud provider
responded in 2.8 seconds at the 95th percentile, against the 400 ms contracted. The problem had existed for
months.

**A traffic drop alert**, which in the first month detected two broken integrations before any customer
reported them.

**Queue latency** replaced by the age of the oldest message.

In the next incident, of a similar profile, the localization took 4 minutes.

And the 340 old metrics were audited: 190 had not been queried in twelve months and were removed, reducing
the telemetry cost by around a third.

The team's reading: they had far more instrumentation than they needed, and they were missing the four
measures that answer any incident's first questions.

## Related Concepts

- [Metrics](/13-observability/metrics.md) — how to implement them.
- [Alerting](/13-observability/alerting.md) — what to do with them.
- [Dashboards](/13-observability/dashboards.md).
- [SLI](/12-reliability/sli.md) — the measure of experience.

## Practical Exercise

Choose a service in your system and check whether the four signals exist — with latency in percentiles,
separated by outcome, and saturation of the resource that actually limits it.

The most common gap is the last: most measure CPU, and the limit is something else.

## Interview Questions

- Why should latency separate success from error?
- Why is saturation the predictive signal?
- Why monitor a traffic drop?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 6.
- Gregg, Brendan. *The USE Method*, 2012.
- Wilkie, Tom. *The RED Method*, 2018.
