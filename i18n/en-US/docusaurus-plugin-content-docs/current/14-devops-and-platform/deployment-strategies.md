---
id: deployment-strategies
title: Deployment Strategies
sidebar_position: 4
description: How the new version replaces the old one — and the criterion for choosing among the options.
doc_type: tradeoff
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses the deployment strategy from the change's risk and
  the cost of reverting.
prerequisites: [ci-cd]
related: [blue-green, canary, rolling-deployments]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Deployment Strategies

## Overview

The question the strategies answer: **how does the new version replace the old one without taking the
service down, and what happens if it is wrong?**

The three main ones:

```text
rolling      gradually replaces the instances
blue-green   two complete environments, an instant switch
canary       a small fraction of the traffic, with comparison and a decision
```

They are not matters of taste. Each one has a cost and protects against different things, and the choice
comes from the change's risk.

## Problem

Deployment is the moment of greatest risk in a stable system's life. A high fraction of incidents is caused
by a recent change.

That does not mean deploying less — the opposite, see
[continuous integration](/14-devops-and-platform/ci-cd.md). It means that **how** you deploy matters.

With no strategy, the deployment is an abrupt switch: the new version replaces the old one, and if it is
wrong, every user feels it, until somebody notices and reverts.

## Core Concepts

### What each strategy protects

```text
rolling      protects against unavailability during the switch
             does not protect against a bad version — it goes to everybody, gradually
blue-green   protects against unavailability and allows instant rollback
             does not detect the problem — somebody needs to notice
canary       detects the problem automatically and limits the exposure
             more complex, requires comparable metrics
```

See [rolling deployments](/14-devops-and-platform/rolling-deployments.md),
[blue-green](/14-devops-and-platform/blue-green.md) and [canary](/14-devops-and-platform/canary.md).

The central distinction: **rolling and blue-green are replacement mechanisms; canary is a verification
mechanism.** They combine — a successful canary deployment usually ends with a rolling deployment of the
rest.

### Compatibility between versions is the prerequisite

During any gradual deployment, the two versions coexist. That imposes:

```text
the database schema   compatible in both directions
the message format    the old version needs to read what the new one writes
the API contract      with no incompatible change
shared state          sessions, caches — readable by both
```

See [schema evolution](/08-integration-architecture/schema-evolution.md).

Without that, the only possible strategy is stopping everything and switching — which is what you want to
avoid.

The pattern that resolves it: **expand, migrate, contract**. Add the new while keeping the old; migrate;
remove the old in a later deployment. Three deployments instead of one, and none of them incompatible.

### The exposure window is what you optimize

```text
an abrupt switch   100% of users, immediately
rolling            a growing fraction, over minutes
blue-green         0% or 100%, with instant rollback
canary             1% to 5%, for a defined time, before expanding
```

The smaller the exposed fraction and the faster the detection, the smaller the damage from a bad version.

Canary minimizes both. It costs comparison infrastructure and requires enough volume for the fraction to be
statistically significant.

### Reverting needs to be easier than fixing

The operational principle that guides everything: under pressure, reverting is always the right first
decision. Investigate afterward, with the system stable.

That requires the rollback to be:

```text
fast         minutes, not the duration of a complete deployment
automatic    or one command, with no long procedure
safe         with no data loss, with no incompatible state
tested       exercised, not presumed
```

The third is the one that usually fails: reverting the code is easy; reverting a database migration that
has already run is not. That is why compatible migrations are a prerequisite.

See [resilience](/12-reliability/resilience.md) — reversibility is worth more than being right.

### The choice comes from the risk

```text
a low-risk change, good coverage        rolling
a change needing instant rollback       blue-green
a behavior change, high risk            canary
an infrastructure or version change     blue-green
an algorithm change with a measurable effect  canary with comparison
```

And there is a common and good combination: **canary to verify, rolling to complete**. The initial fraction
validates; the rest goes gradually.

### Deploying is not releasing

See [feature flags](/14-devops-and-platform/feature-flags.md). With flags, the code can go to production
disabled, and the release becomes a separate decision, reversible in seconds.

That changes the calculation: the deployment becomes low risk — the new code does nothing — and the risk
concentrates in the release, which is controllable independently.

Teams that combine the two techniques deploy frequently and release carefully.

## Mental Model

**The strategy decides how many users see the wrong version, and for how long.** The rest is consequence.

## When to Use

- **Rolling:** routine changes, with good test coverage.
- **Blue-green:** when the rollback needs to be instant, or the change is infrastructural.
- **Canary:** risky behavior changes, where there are comparable metrics.
- **Combined:** canary to verify, rolling to complete.

## When Not to Use

**Any gradual strategy with no compatibility between versions.**

**Canary with insufficient volume** for significance.

**Blue-green with no capacity for the duplicated environment.**

**With no tested rollback.**

**With no monitoring during the deployment.** Gradual with no observation is just slow.

## Alternatives

- **Deployment with downtime** — legitimate for systems that tolerate a window, and far simpler.
- **[Feature flags](/14-devops-and-platform/feature-flags.md)** — they separate deploying from releasing,
  reducing the risk of both.
- **Shadow deployment** — the new version receives a copy of the traffic with no response to the user. It
  verifies behavior at zero risk, at the cost of doubling the load.

The last is underused for algorithm and performance changes.

## Trade-offs

| Rolling | Blue-green | Canary |
|---|---|---|
| No extra capacity | Doubles the environment | Little extra |
| Gradual rollback | Instant | Instant |
| Does not detect | Does not detect | Detects |
| Simple | Simple | Complex |
| Two versions coexist | Coexist during the switch | Coexist |

## Failure Modes

**Incompatible versions coexisting.**

**Impossible rollback.** The migration has already been applied.

**Late detection.** The bad version has already gone to everybody.

**Insufficient capacity during the switch.** Rolling with instances out reduces capacity.

**Incompatible shared state.** A session written by the new version, read by the old one.

**Deployment with no observation.** Gradual, and nobody watching.

**A rollback that does not revert.** The code went back, the migrated data did not.

## Common Mistakes

**Not making migrations compatible.**

**Choosing the strategy out of habit**, not by risk.

**Not testing the rollback.**

**Canary with no automatic criterion** for promotion or rollback.

**Not monitoring during the deployment.**

**Blue-green without verifying the new environment** before switching.

## Real-World Example

A booking platform used rolling deployment for everything, with manual rollback.

An incident exposed the limits: a change in the availability calculation had an error that only appeared
with real data from certain hotels — around 4% of searches returned the wrong result, with no error and no
slowness.

The rolling deployment took the version to every instance in 12 minutes. The problem was detected 6 hours
later, by a partner. In that period, thousands of searches returned incorrect availability, and some became
bookings that had to be cancelled.

No technical metric changed: normal latency, no errors, normal traffic.

The changes:

**Canary for behavior changes**, with 2% of the traffic for 30 minutes and automatic comparison of business
metrics — conversion rate, result distribution, average value.

The **result distribution** comparison is what would have caught the problem: the new version returned
significantly fewer options for a subset of searches.

**Rolling kept** for low-risk changes, which are the majority.

**Blue-green for infrastructure changes** — a runtime version, a base library migration.

**Automated rollback**, triggered by the canary's comparison, with a measured time of 90 seconds.

**Compatible migrations** made mandatory, verified in review.

**A risk classification** when opening the change, defining the strategy — with the author declaring
whether it alters observable behavior.

In the following twelve months, the canary automatically reverted seven deployments. Three would have been
silent behavior incidents like the original.

The point the team underlines: rolling deployment was never wrong — it protects against unavailability, and
it did that well. It simply does not protect against what happened, and nobody had made that distinction.

## Related Concepts

- [Blue-Green](/14-devops-and-platform/blue-green.md), [Canary](/14-devops-and-platform/canary.md),
  [Rolling Deployments](/14-devops-and-platform/rolling-deployments.md).
- [Feature Flags](/14-devops-and-platform/feature-flags.md) — separating deploying from releasing.
- [Continuous Integration](/14-devops-and-platform/ci-cd.md).
- [Schema Evolution](/08-integration-architecture/schema-evolution.md).

## Practical Exercise

Time a real rollback in your system, from the command to the confirmation that the old version is serving.

That number is the lower bound on the duration of any incident caused by a deployment.

## Interview Questions

- What does each strategy protect, and what does it not protect?
- Why is compatibility between versions a prerequisite?
- Why should reverting be easier than fixing?

## Further Reading

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 27.
