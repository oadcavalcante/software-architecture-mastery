---
id: scaling-capacity-planning
title: Capacity Planning for Scale
sidebar_position: 12
description: Knowing when to scale before the incident — with a model, a test and defined headroom.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader builds a capacity model with explicit headroom and a trend
  alert, not only a value one.
prerequisites: [performance-vs-scalability]
related: [performance-vs-scalability, horizontal-scaling, hotspots]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Capacity Planning for Scale

## Overview

Capacity planning answers: **when are we going to need more, and how much?**

The fundamentals are in [capacity planning](/05-system-design/capacity-planning.md). Here what matters is
the scale angle: how to know the limit is close **before** reaching it, and how much headroom to keep.

The difference between a team that scales in advance and one that scales during the incident is a
spreadsheet and an alert.

## Problem

The common pattern is reactive: the system gets slow, somebody investigates, adds capacity.

That works when adding capacity is fast and the bottleneck is capacity. It fails when the change takes
weeks — partitioning a database, increasing a quota, negotiating a limit with a third party.

And it fails silently before that: the degradation happens gradually, and the moment the headroom ran out
generates no event.

## Core Concepts

### The model relates the business to the resource

A capacity model translates a business metric into resource consumption:

```text
1,000 orders/hour consumes
  → 12 req/s on the API
  → 40 queries/s on the database
  → 0.8 GB of storage/day
  → 25% of an application instance
```

With that, the business projection becomes an infrastructure projection, and the question "when do we need
more?" has an answer as a date.

The model does not need to be sophisticated. A spreadsheet with those ratios, reviewed monthly against
reality, resolves it. And it is reviewed because the ratios change: new features alter the consumption per
order.

### The headroom needs to be decided

Operating at 90% utilization is efficient and leaves no margin for variation, failure or growth.

```text
target utilization   what it allows
        50%          losing half the capacity and continuing
        60%          losing one zone of three. See availability zones
        70%          absorbing moderate peaks
        85%          nothing
```

The headroom is decided from three things: how much the load varies, how long it takes to add capacity, and
what needs to be absorbed — the loss of a zone, a seasonal peak.

With no explicit decision, the headroom is whatever was left after nobody reviewed the sizing.

### A trend alert, not only a value one

An alert at 80% utilization warns when it is already too late for changes that take weeks.

The useful alert is about **trend**: "at the current pace, the capacity runs out in N weeks".

```text
a value alert   utilization > 80%       → acts when it is already tight
a trend alert   projection < 8 weeks    → acts with time to act
```

The second is what allows planning instead of reacting. It is rare, and it is cheap to implement on top of
metrics that already exist.

### The load test needs to be realistic

A test that does not reproduce reality produces false confidence. The mistakes that invalidate it:

**A uniform distribution.** Real traffic is uneven — a few customers concentrate volume, some keys are far
more accessed. A uniform test does not find [hotspots](/11-scalability/hotspots.md).

**Small synthetic data.** Queries are fast on a thousand rows and slow on ten million.

**A warm cache.** Testing with a filled cache hides the real load on the origin. See
[caching for scale](/11-scalability/scaling-cache.md).

**No write concurrency.** Read tests do not find contention.

**One operation at a time.** The real system mixes operations that compete with each other.

The test that is worth doing is the one that replicates production's access pattern, with a comparable data
volume.

### Find the saturation point

More useful than "it takes 1,000 req/s" is knowing the curve:

```text
load     p95 latency    throughput
 200        45 ms          200
 500        60 ms          500
 800       110 ms          800
1000       280 ms          990   ← the knee
1200     2,400 ms          850   ← saturated, throughput falling
```

The knee — where the latency starts rising disproportionately — is the real operational limit. Above it,
the system still works and the experience has already degraded.

And the point where throughput **falls** with more load is what load shedding needs to prevent reaching.

### Third-party limits enter the model

The bottleneck may not be yours:

```text
an external API's rate limit
a resource quota in the region
a managed service's connection limit
a partner's contracted capacity
```

Those limits usually have a negotiation lead time in weeks, and they are discovered by being hit.
Inventorying them and including them in the model is cheap and avoids planning's most embarrassing
surprise. See [regions](/09-cloud-architecture/regions.md).

## Mental Model

**Capacity is planned with the time necessary to act.** If the change takes six weeks, the alert needs to
come with eight.

## When to Use

- The growth is predictable.
- Capacity changes take time.
- There are known seasonal events.
- There are third-party limits.
- The infrastructure cost is material.
- Unavailability has a high cost.

## When Not to Use

**An elaborate model for a small and stable system.**

**An unrealistic load test.** It produces false confidence, which is worse than none.

**An absolute-value alert only.**

**Planning without reviewing the model.** The ratios change with the product.

**Sizing by the average.** See [cloud compute](/09-cloud-architecture/cloud-compute.md).

**Ignoring third-party limits.**

## Alternatives

- **Automatic elasticity** — for predictable variation, with the caveats about provisioning time.
- **Load shedding** — protecting the essential when the capacity runs out. See
  [backpressure](/06-distributed-systems/backpressure.md).
- **Graceful degradation** — operating with less instead of stopping.
- **Scheduled scaling** — for known peaks, better than any reaction.

## Trade-offs

| High headroom | Low headroom |
|---|---|
| Absorbs peaks and failures | No margin |
| Higher cost | Lower |
| Less urgency | Scaling during the incident |

| A realistic load test | A simplified one |
|---|---|
| Finds what production finds | False confidence |
| Expensive to build | Fast |
| Requires comparable data | Synthetic |

## Failure Modes

**A limit reached with no warning.**

**A test passing and production failing.** An unrealistic test.

**Headroom consumed silently.** A new feature increased the consumption per order.

**A third party's quota reached.** Weeks to resolve.

**Scaling during the incident.** A cold cache makes the moment worse.

**An outdated model.** The ratios changed and nobody reviewed them.

**The saturation point exceeded.** Throughput falls with more load.

## Common Mistakes

**Having no model.** With no declared relationship between a business unit and the resource consumed, there
is no way to project anything: capacity becomes a reaction to the previous incident.

**Not deciding the headroom.** How much idle capacity to keep is a cost-against-risk decision. Without
deciding it, it is defined by accident — and it is usually too large on expensive services and too small on
critical ones.

**Alerting on value only.** A fixed threshold warns when it is already close to the limit. The trend warns
days earlier, which is the time needed to get a quota or optimize.

**Testing with small synthetic data.** Queries that scan a table pass the test with ten thousand rows and
fail with ten million. The test's volume needs to be on the order of production's.

**Testing with a uniform distribution.** Real load is concentrated: few customers, few keys, few hours. A
uniform test does not find the hotspot that will saturate first.

**Not inventorying third-party limits.** A provider quota, an API rate limit and a database connection
ceiling are usually reached before your own infrastructure's limit — and they are not elastic.

## Real-World Example

A ticketing platform knew its peaks: sales openings for large events, scheduled weeks in advance.

Even so, three of the last five openings had had degradation.

The planning work was structured this way:

**A capacity model.** A spreadsheet relating tickets per minute to each component's consumption. Built from
measurements of the previous openings.

It revealed something nobody knew: the database consumption per ticket had **grown 40%** in eight months,
because of two new features. The sizing was still based on the old ratio.

**A realistic load test.** Reproducing the opening pattern — 200,000 people trying to buy in the first 3
minutes, with the real distribution of events and sections.

The previous test used a uniform distribution across events, and so it had never found the hotspot: one
event concentrates practically all the traffic in an opening.

**A saturation curve.** Measured, not estimated. The knee was at 4,200 tickets per minute; the throughput
started falling at 5,100. The operational target was set at 3,000, with load shedding above 4,000.

**Third-party limits inventoried.** The payment gateway had a contracted limit of 800 transactions per
second. The projected peak asked for 1,100. The renegotiation took five weeks — and it would have been
discovered during the opening if the inventory had not existed.

**A trend alert.** A weekly projection of when each component reaches 70%, with an alert eight weeks in
advance.

**Scheduled scaling** for the openings, with capacity provisioned 20 minutes beforehand.

The three following openings happened with no degradation.

The recorded lesson: the most important finding was the growth in consumption per ticket. It had happened
gradually, over eight months, with no alert firing — because no metric looked at the ratio between business
and resource.

## Related Concepts

- [Performance versus Scalability](/11-scalability/performance-vs-scalability.md).
- [Hotspots](/11-scalability/hotspots.md) — what a uniform test does not find.
- [Capacity Planning](/05-system-design/capacity-planning.md) — the fundamentals.
- [Backpressure](/06-distributed-systems/backpressure.md) — the shedding.

## Practical Exercise

Write down the ratio between a business metric and a resource in your system — orders per database query,
users per instance.

Compare with the same ratio six months ago. If it grew, your headroom is being consumed with nobody having
added load.

## Interview Questions

- Why is a trend alert more useful than a value alert?
- What mistakes make a load test useless?
- What does the knee of the saturation curve represent?

## Further Reading

- Gunther, Neil. *Guerrilla Capacity Planning*. Springer, 2007.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 18.
- Gregg, Brendan. *Systems Performance*. 2nd ed. Addison-Wesley, 2020.
