---
id: availability-metrics
title: Availability Metrics
sidebar_position: 1
description: What the numbers mean — and what the percentage hides.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader interprets availability metrics knowing what they do not
  capture.
prerequisites: [reliability]
related: [sli, slo, reliability-basics]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Availability Metrics

## Overview

"99.9% availability" is the standard way of expressing reliability, and it hides more than it reveals.

It does not say whether it was 43 continuous minutes or 43 one-minute interruptions. It does not say
whether it hit all the users or 2%. It does not say whether it was at peak or overnight.

Those distinctions matter more than the number, and that is why aggregate availability needs to come with
other measures.

## Problem

The percentage is attractive because it communicates easily. And it aggregates three distinct dimensions
into a single number:

**Frequency.** How many times it failed.

**Duration.** How long each failure lasted.

**Reach.** How many users were affected.

Two systems with the same percentage can have opposite experiences: one with a long interruption and
another with dozens of short ones. The first is an incident; the second is a product nobody trusts.

## Core Concepts

### The three measures that decompose it

```text
mean time between failures   frequency — how often it fails
mean time to detect          how long until somebody knows
mean time to recover         how long until it is back
```

The sum of the last two is the unavailability's duration. And the decomposition guides the investment:

```text
frequent failure, fast recovery   → invest in root cause
rare failure, slow recovery       → invest in recovery and procedures
slow detection                    → invest in observability
```

Detection time is the most neglected and frequently the largest component: an incident discovered by a
customer, and not by monitoring, has already consumed much of the duration before anybody acts.

### Reducing duration usually returns more than reducing frequency

Counterintuitive and practical.

Eliminating causes of failure has diminishing returns: the easy ones are gone, and the remaining ones are
increasingly rare and increasingly expensive to prevent.

Reducing recovery time has constant returns: it applies to **every** failure, including the ones you did
not anticipate.

```text
a failure every 30 days, 60 min of recovery  → 99.86%
a failure every 30 days, 6 min of recovery   → 99.986%
```

An order of magnitude, with no failure eliminated. Fast rollback, exercised failover, rehearsed procedures
and automatic detection are what produce that.

### The average hides the distribution

A mean time to recover of 15 minutes can be ten incidents of 3 minutes and one of 2 hours.

The 2-hour incident is the one the customer remembers, and the average does not represent it.

The better practice: track the distribution — median, 90th percentile, and the period's worst case. And,
for incidents, the absolute number usually says more than any average, because the sample is small.

### Availability by time and by request differ

```text
by time      the proportion of the period the service was available
by request   the proportion of requests served successfully
```

A 10-minute outage overnight and another 10-minute one at peak count the same in the first, and very
differently in the second.

The per-request measure better reflects the impact on the user, and it is the form used in
[SLI](/12-reliability/sli.md). The per-time measure is more common in contracts, because it is easier to
verify.

Knowing which is being used changes the number's interpretation.

### Partial availability is the common case

The binary model — available or not — does not describe what happens in practice.

The common case is: one feature down, the rest working; slowness that makes use unviable without generating
an error; a subset of users affected.

See [graceful degradation](/12-reliability/graceful-degradation.md). Measuring only total unavailability
hides most of the real impact.

The way out is measuring per journey, with a latency threshold — which turns "it is up" into "it is
usable".

### The number needs context to mean anything

Three pieces of information that need to accompany any percentage:

**The window.** 99.9% per month and per year are very different commitments.

**The measurement point.** Server, edge or client. See [SLI](/12-reliability/sli.md).

**What counts as unavailable.** A total error, slowness, partial degradation.

Without all three, the percentage is neither comparable nor verifiable — and that is how it appears in most
reports.

### The most useful number is not availability

A measure that combines the three dimensions and communicates better to the business:

```text
user-minutes affected = users affected × duration in minutes
```

It distinguishes what the percentage does not: ten minutes affecting 2% of users overnight, and ten minutes
affecting everybody at peak.

And it is directly translatable into impact — the number of people who could not do what they needed, and
for how long.

The cost is that it requires knowing how many users were affected, which is not always simple in partial
degradations. An estimate is usually enough: the order of magnitude already separates the incidents that
matter from the ones that do not.

Teams that adopt that measure stop arguing about whether an incident was serious — the number answers.

## Mental Model

**The percentage aggregates frequency, duration and reach.** To act, you need all three separately.

## When to Use

- To track a trend over time.
- As the basis for an [SLO](/12-reliability/slo.md) and an [SLA](/12-reliability/sla.md).
- To compare components and prioritize investment.
- In communication with the business.

## When Not to Use

**The percentage alone.**

**A recovery average** with no distribution.

**Availability by time** when the impact on the user matters.

**A binary model** in systems that degrade partially.

**Without declaring the window, the measurement point and the definition.**

**Comparing numbers from different sources.** Distinct definitions produce incomparable numbers.

## Alternatives

- **[SLI](/12-reliability/sli.md) per journey** — it measures the experience, not uptime.
- **A count of user-minutes affected** — it combines reach and duration into a measure the business
  understands.
- **A count of incidents by severity** — more readable than an average on small samples.
- **A duration distribution** — instead of an average.

The second deserves emphasis: user-minutes affected captures the three dimensions and is directly
translatable into impact.

## Trade-offs

| By time | By request |
|---|---|
| Simple to verify | Reflects the impact |
| Ignores volume | Weights by usage |
| Common in contracts | Common in SLOs |

| An average | A distribution |
|---|---|
| One number | Several |
| Hides the worst case | Reveals it |
| Easy to communicate | Requires context |

## Failure Modes

**A number with no context.** Incomparable.

**An average hiding the worst incident.**

**Measurement at the server.** It does not see what never arrived.

**Partial degradation not counted.**

**Slow detection inflating the duration** with nobody tracking that component.

**Scheduled maintenance excluded** with no limit, emptying the number.

## Common Mistakes

**Using only the percentage.** 99.9% per month can be one 43-minute outage or forty-three one-minute
outages — very different impacts with the same number.

**Not separating detection from recovery.** They are distinct problems with distinct solutions: one is
attacked with monitoring, the other with automation. The total time does not say which to invest in.

**Investing in frequency when duration is the problem.** Reducing the number of incidents and reducing each
one's duration require different work. Without separating the metrics, the investment goes to the wrong
side.

**Not measuring partial degradation.** Binary availability counts as a success the system that responds in
30 seconds — which, for the user, is down.

**Comparing numbers from different definitions.** "Available" measured at the edge, at the balancer or by
the end user gives distinct results. Comparing without equalizing the definition means nothing.

**Not tracking the worst case.** The average across customers hides the customer who had six hours down —
and that is the one who cancels the contract.

## Real-World Example

A logistics platform reported 99.92% monthly availability and received constant complaints about
instability.

The decomposition explained the contradiction:

```text
incidents in the month      14
average duration            2.5 minutes
total duration              35 minutes
mean time to detect         1.8 minutes
mean time to recover        0.7 minutes
```

The number was excellent and the experience was bad: fourteen interruptions per month, almost one every two
days.

And the analysis by time of day showed concentration: eleven of the fourteen happened between 8 and 10 a.m.
— the customers' heaviest usage hours.

Two changes in the measurement:

**Availability by request**, instead of by time. The number fell to 99.4% — because the interruptions
happened when there was traffic.

**User-minutes affected** as the main metric, communicated to the business. It made visible what the
percentage hid.

And the investigation into the cause of the fourteen interruptions found a single root: the deployment
process restarted instances with no graceful shutdown, and the deployments happened in the morning.

Two fixes resolved thirteen of the fourteen:

**Graceful shutdown**, with the instance leaving the load balancing before terminating.

**Deployment outside peak hours**, and later gradual deployment with no downtime.

The recorded conclusion: they had invested months trying to reduce the incidents' duration — which was
already 2.5 minutes. The problem was the **frequency**, and the decomposition took an afternoon to reveal
it.

## Related Concepts

- [SLI](/12-reliability/sli.md) — the form that measures experience.
- [SLO](/12-reliability/slo.md) — the target.
- [Availability](/06-distributed-systems/availability.md) — the composition.
- [Reliability Fundamentals](/12-reliability/reliability-basics.md).

## Practical Exercise

Take last quarter's incidents and separate, for each one: time to detect, time to recover, and the fraction
of users affected.

The sum of the columns says where to invest — and the detection column is usually the largest.

## Interview Questions

- What does the availability percentage hide?
- Why does reducing duration usually return more than reducing frequency?
- What is the difference between availability by time and by request?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapters 3 and 4.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018 — recovery time as an indicator.
- Allspaw, John. *MTTR is more important than MTBF*, 2010.
