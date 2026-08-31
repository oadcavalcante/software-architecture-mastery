---
id: sli
title: SLI
sidebar_position: 10
description: The indicator that measures what the user feels — and why most measure the wrong thing.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses indicators that reflect the user's experience and
  measures them at the right point.
prerequisites: [reliability]
related: [slo, sla, availability-metrics]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# SLI

## Overview

An SLI — service level indicator — is a quantitative measure of an aspect of the service that **matters to
the user**.

The definition looks obvious and is frequently violated: most systems measure what is easy to measure —
CPU, memory, server error rate — and not what the user experiences.

A good SLI has a characteristic shape: **the proportion of good events over valid events**.

## Problem

A dashboard shows CPU at 40%, memory at 55%, error rate at 0.3%. All green.

And the users cannot complete a purchase, because a dependency in the payment flow is returning slowness
the server counts as success.

Resource metrics describe the infrastructure's health. They do not describe the experience — and it is the
experience that defines whether the service is working.

## Core Concepts

### The shape: good events over valid events

```text
SLI = good events / valid events
```

Expressing it that way forces three explicit decisions:

**What an event is.** A request, a login attempt, an order processed.

**What is good.** Responded in under 300 ms with a success code.

**What is valid.** Requests the service should serve — excluding, for example, client errors that are not
the system's fault.

The third decision is the most delicate and the most consequential. Excluding client errors is reasonable;
excluding "requests during scheduled maintenance" can become a way for the indicator never to look bad.

### The four categories that cover almost everything

```text
availability  the proportion of requests served successfully
latency       the proportion of requests served within the limit
quality       the proportion served with no degradation — a complete response
freshness     the proportion of data within the acceptable lag
```

For most services, availability and latency are enough. Freshness matters in systems with replication or
asynchronous processing; quality, where there is graceful degradation.

Note that **latency is expressed as a proportion**, not as a percentile. "99% of requests below 300 ms" is
an SLI; "p99 latency of 300 ms" is the same information in a form that does not compose well with an error
budget. See [SLO](/12-reliability/slo.md).

### Measure where the user is

The measurement point changes the number:

```text
at the server        does not see DNS, the network, the balancer, a request that never arrived
at the balancer      better — it sees what came in
at the client        sees everything, including connectivity failures
external probing     sees the service as an outside user does
```

The difference between the server's number and the client's is usually large, and that difference is the
map of what is broken outside your perimeter. See
[availability](/06-distributed-systems/availability.md).

The practice that works: the main SLI at the point closest to the user you can instrument, with the
server's as diagnosis.

### One SLI per journey, not per endpoint

Measuring each endpoint produces dozens of indicators nobody tracks.

What works is measuring the **critical journeys** — what the user is trying to do:

```text
search for a product   availability and latency
add to cart
complete the purchase  the most critical
check an order
```

Three to five journeys cover most of the value. And they communicate: "purchase completion is at 99.2%"
means something to the business; "the checkout endpoint is at 99.2%" means less.

### Not every event is worth the same

A system that serves a thousand listing requests and one payment has an SLI dominated by the listing. A
failure in every payment barely moves the number.

Two ways out:

**Separate SLIs by criticality.** The payment journey has its own.

**Weighting by importance.** Less common, and harder to communicate.

The first is preferable: it keeps each indicator readable.

### What is not an SLI

It is worth being explicit, because the confusion is common:

**A resource metric.** CPU, memory, disk. They are diagnosis, not a service indicator.

**An absolute count.** "150 errors per hour" does not say whether that is a lot — it depends on the volume.

**An average.** It hides the tail. A service with a 100 ms average can have 5% of users waiting 4 seconds.

**Process uptime.** The process can be up and not serving.

## Mental Model

**An SLI measures what the user feels, in the form of a proportion.** If it does not move when the user
suffers, it is not an SLI.

## When to Use

- Before defining any SLO.
- For the product's critical journeys.
- Where the user's experience needs to be tracked.
- When there is a contractual commitment to sustain.
- To guide reliability investment decisions.

## When Not to Use

**Resource metrics as an SLI.**

**One SLI per endpoint.** Dozens of indicators nobody looks at.

**An average.**

**Measured only at the server**, when measuring closer to the user is possible.

**Excluding events until the number looks good.** The definition of "valid" needs to be defensible.

**With no defined limit.** "Good latency" is not measurable; "under 300 ms" is.

## Alternatives

- **Synthetic monitoring** — probes that exercise the journey periodically. It covers the absence of
  traffic and detects before the user does.
- **Client-side measurement** — the most faithful, and it requires instrumentation and sampling.
- **Resource metrics** — for diagnosis, not as an indicator.

Synthetic and real complement each other: the synthetic covers low-volume hours, where the real one has too
few events to be trustworthy.

## Trade-offs

| Measured at the client | At the server |
|---|---|
| Sees the real experience | Only what arrived |
| Requires instrumentation | Already exists |
| Sampling and privacy | No concern |

| Few SLIs | Many |
|---|---|
| Tracked | Ignored |
| Can hide a local problem | Broad coverage |
| Communicate to the business | Only to engineering |

## Failure Modes

**A green indicator with the user suffering.** It measured resources, not experience.

**High volume diluting a critical failure.**

**The definition of valid excluding the inconvenient.**

**Measurement only at the server.** Network failures invisible.

**Too few events.** At low volume, the proportion oscillates and means nothing.

**A limit chosen with no basis.** A latency limit defined by intuition does not reflect what the user
tolerates.

## Common Mistakes

**Using resource metrics.** CPU and memory do not say whether the user managed to complete what they came
to do. The indicator needs to measure the experience, not the consumption.

**Measuring per endpoint.** All the endpoints healthy and registration impossible to complete is a
perfectly possible result. What matters is the journey.

**Using an average.** It hides the tail, which is where the users who had a problem are. A percentile is
the minimum; a distribution is better.

**Not defining the latency limit with behavioral data.** The cutoff needs to come from where the user gives
up or the conversion drops, not from a round number chosen in a meeting.

**Excluding events to improve the number.** Discarding the maintenance window and the "client's" errors
produces an indicator that looks good while the experience gets worse.

**Not measuring journeys, only components.** Each service at 99.9% in a chain of five delivers 99.5% to the
user — and it is the user's number that matters.

## Real-World Example

An insurance platform tracked availability by the application server's error rate: 99.95%.

Users complained about not being able to buy policies, and the number did not change.

The investigation found three reasons why the indicator did not see the problem:

**Measured at the server.** Requests that failed before arriving — a timeout at the balancer, a name
resolution failure — did not enter the count. They were around 2% of the total at peak hours.

**Dilution by volume.** Buying a policy was 0.4% of the requests. A failure in half the purchases moved the
global indicator by 0.2%.

**Slowness counted as success.** Requests that took 30 seconds and returned success were counted as good.
The user gave up beforehand.

The reformulation:

**Four SLIs per journey:** get a quote, buy a policy, view a policy, file a claim. Each one with
availability and latency.

**A latency limit defined with data**, not by intuition: the abandonment analysis showed that above 4
seconds the drop-off rate doubled. The limit became 4 seconds — not a round number chosen in a meeting.

**Measurement at the balancer**, with synthetic probing every minute to cover the low-volume hours.

**Client-side measurement** for the purchase journey, the most critical, capturing what happens before the
request leaves the browser.

The result: the purchase SLI, measured correctly, was **97.3%** — not 99.95%.

The recorded conclusion: the old number was not false. It measured exactly what it said it measured — the
server's error rate. It simply had no relation to the question that mattered, and nobody had noticed
because the question was never written down.

## Related Concepts

- [SLO](/12-reliability/slo.md) — the target on top of the indicator.
- [SLA](/12-reliability/sla.md) — the contractual commitment.
- [Availability Metrics](/12-reliability/availability-metrics.md).
- [Observability](/13-observability/index.md).

## Practical Exercise

Choose your product's most critical journey and write its SLI in the form "good events over valid events",
with the limit explicit.

Then ask: does that number change when the user suffers? If it does not, you measured something else.

## Interview Questions

- Why does the "good over valid" shape force good decisions?
- Why does the measurement point change the number?
- Why should latency be expressed as a proportion, and not as a percentile?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 4.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018 — chapters 2 and 3.
- Google. *SRE Fundamentals: SLIs, SLAs and SLOs*.
