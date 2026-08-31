---
id: canary
title: Canary
sidebar_position: 6
description: Exposing a fraction and comparing — the only strategy that detects the problem instead of waiting for somebody to notice.
doc_type: pattern
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs a canary with comparable metrics, an automatic
  criterion and enough time for significance.
prerequisites: [deployment-strategies]
related: [deployment-strategies, blue-green, feature-flags]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Canary

## Overview

In a canary deployment, the new version receives a small fraction of the traffic. That fraction's metrics
are **compared** with the old version's, and the decision to expand or revert is made from that comparison.

What distinguishes this strategy from the others: it **detects** the problem. Blue-green and rolling
deployment replace the version safely; neither of them says whether the new version is worse.

And the detection can be automatic — which turns rollback from a human decision under pressure into the
consequence of a criterion.

## Problem

A new version can be wrong in ways the tests do not catch: behavior that depends on real data, on real
volume, on combinations only production has.

See [deployment strategies](/14-devops-and-platform/deployment-strategies.md). The most dangerous case is
the change that generates neither errors nor slowness — only a different result.

With no comparison, that kind of problem is discovered by somebody who notices, which can take hours or
days.

## Core Concepts

### Compare cohorts, not against history

The mistake that invalidates the analysis: comparing the new version against yesterday's behavior.

Traffic varies by time of day, day of week, seasonality and events. A metric worse than yesterday's can be
normal variation.

The correct comparison is **simultaneous**: the canary fraction and the control fraction, in the same
period, with equivalent traffic.

```text
correct   canary 5% × control 5%, the same instant
wrong     canary now × the old version last week
```

And the control should not be "all the rest": comparing 5% with 95% introduces scale differences — a warmer
cache, different connection behavior. A control fraction of the same size is the correct design.

### What to compare

```text
technical      latency in percentiles, error rate, resource usage
business       conversion, average value, completion rate
distribution   the shape of the results, counts, response sizes
```

The last two lines are what catch the silent problem. A change that returns fewer results, or different
results, alters neither latency nor error rate — and it alters the distribution.

See [debuggability](/13-observability/debuggability.md). Comparing distributions requires the system to
emit the data that composes them.

### Time and volume: significance

A small fraction for a short time produces few events, and the comparison becomes noise.

```text
5% of the traffic, 1,000 req/s, 10 minutes → 30,000 events per side — sufficient
5% of the traffic, 5 req/s, 10 minutes     → 150 events — insufficient
```

Low-volume systems need a larger fraction or a longer time — and, below a certain volume, canary simply
does not work as a statistical mechanism.

And the time needs to cover the relevant cycles: a memory leak does not appear in 10 minutes; a task that
runs hourly is not exercised in 20.

### Routing: who goes to the canary

```text
random         per request — simple, and the same user alternates between versions
per user       consistent — the same user always on the same version
per segment    internal first, then a region, then general
per instance   one machine runs the new version
```

The per-user choice is generally better: it avoids inconsistent behavior and allows comparing journey
metrics — which require the user to stay on the same version.

And starting with internal users is a cheap practice that catches gross problems before any customer sees
them.

### An automatic criterion, not judgment

A canary watched by a person who decides "it looks fine" is not much better than none.

What makes the technique trustworthy:

```text
metrics defined beforehand
explicit rollback thresholds
a minimum observation window
an automatic decision — promote, wait or revert
```

And the thresholds need to distinguish real degradation from normal variation. A threshold that is too
tight reverts on noise; too loose catches nothing.

The calibration comes from historical data: what is the natural variation of those metrics between two
equivalent fractions running the **same** version? That is the noise floor.

### Gradual expansion

Once the canary is approved, the expansion is not immediate:

```text
5% → 25% → 50% → 100%
```

Each step with a new observation window. Scale-dependent problems — contention, connection exhaustion,
dependency saturation — only appear with volume.

See [horizontal scaling](/11-scalability/horizontal-scaling.md).

### Not every change accommodates a canary

```text
accommodates       behavior, algorithm, performance changes
does not           an incompatible schema migration
                   a change requiring globally consistent state
                   low-volume systems
                   changes that only manifest after days
```

For the ones that do not, blue-green or rolling deployment with attentive observation.

## Mental Model

**A canary is an experiment with automatic rollback.** It requires a control cohort, comparable metrics and
sufficient volume.

## When to Use

- Risky behavior changes.
- Where business metrics are comparable.
- Sufficient volume for significance.
- Algorithm or performance changes.
- Before expanding infrastructure changes.

## When Not to Use

**Comparing against history** instead of a simultaneous cohort.

**With insufficient volume.**

**With human judgment** instead of a criterion.

**For changes incompatible** between versions.

**With no business metrics**, when the risk is behavioral.

**With too short a window** for the relevant cycles.

## Alternatives

- **[Blue-green](/14-devops-and-platform/blue-green.md)** — instant rollback, with no detection.
- **[Rolling deployment](/14-devops-and-platform/rolling-deployments.md)** — gradual replacement, with no
  comparison.
- **[Feature flags](/14-devops-and-platform/feature-flags.md)** — they expose gradually with no deployment;
  complementary.
- **Shadow deployment** — the new version processes a copy of the traffic with no response. Zero risk, at
  the cost of doubling the processing.

The last is the right choice when the behavior can be compared without affecting users.

## Trade-offs

| Canary | Blue-green |
|---|---|
| Detects the problem | Does not detect |
| Minimal exposure | 0% or 100% |
| Requires metrics and volume | Always works |
| Complex | Simple |
| Two versions for longer | Only during the switch |

| Routing per user | Per request |
|---|---|
| Consistent | Alternates |
| Journey metrics | Only per request |
| A less random sample | More |

## Failure Modes

**Comparison against history.** Normal variation read as degradation.

**Insufficient volume.** The comparison is noise.

**Business metrics absent.** The silent problem passes.

**A badly calibrated threshold.** It reverts on noise, or never reverts.

**A short window.** Time-dependent problems pass.

**A forgotten canary.** The new version stays at 5% indefinitely.

**An unbalanced control.** Comparing 5% with 95% introduces a scale difference.

## Common Mistakes

**Not using a control cohort.**

**Deciding by human observation.**

**Not comparing business metrics.**

**Not calibrating thresholds with the historical noise.**

**Not expanding gradually.**

**Having no maximum deadline** for the canary to conclude.

## Real-World Example

A flight search platform implemented a canary comparing latency, error rate and CPU usage. For a year, it
never reverted anything — and three behavior incidents passed through it.

The clearest case: a change in the ranking started excluding flights with long layovers because of a
threshold error. Latency, errors and CPU were identical. Conversion fell 8%, and nobody noticed for four
days.

The reformulation:

**Business metrics** added to the comparison: conversion, average number of results per search, price
distribution of the results, rate of searches with no results.

The second would have caught the problem in minutes: the canary returned, on average, 22% fewer results.

**A control cohort** of the same size, routed per user. Before, the comparison was canary against all the
rest.

**Thresholds calibrated** with a prior experiment: two 5% cohorts running the **same** version, for two
weeks, to measure each metric's natural variation. The thresholds were set above that noise.

That step is what most improved the analysis's reliability — before, the thresholds had been chosen by
intuition, and they were loose enough to catch nothing.

**Expansion in steps** — 5%, 25%, 50%, 100% — with a 20-minute window at each. A connection contention
problem appeared at the 50% step, and would not have appeared at 5%.

**A maximum deadline.** A canary that does not conclude in 2 hours is reverted automatically. That was
added after they found two versions in canary for weeks, forgotten.

In the following ten months, the canary automatically reverted nine deployments. Five were business metric
degradations, invisible in the technical ones.

What the team learned: the canary existed and gave a sense of protection, measuring exactly what was not at
risk. Calibrating with historical noise was the step that made the comparison trustworthy, and it is the
most frequently skipped.

## Related Concepts

- [Deployment Strategies](/14-devops-and-platform/deployment-strategies.md).
- [Blue-Green](/14-devops-and-platform/blue-green.md) and
  [Rolling Deployments](/14-devops-and-platform/rolling-deployments.md).
- [Feature Flags](/14-devops-and-platform/feature-flags.md).
- [Debuggability](/13-observability/debuggability.md).

## Practical Exercise

If you use a canary, check which metrics it compares — and whether any of them would change if the system
started returning wrong results with normal latency.

If none would, the canary does not protect against the most dangerous case.

## Interview Questions

- Why compare against a simultaneous cohort and not against history?
- Why are technical metrics not enough?
- How do you calibrate the rollback thresholds?

## Further Reading

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 27.
- Sato, Danilo. *Canary Release*. martinfowler.com, 2014.
