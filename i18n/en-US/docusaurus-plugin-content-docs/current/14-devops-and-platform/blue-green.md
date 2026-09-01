---
id: blue-green
title: Blue-Green
sidebar_position: 5
description: Two complete environments and an instant switch — simplicity at the cost of duplicated capacity.
doc_type: pattern
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader applies blue-green knowing what the instant switch does not
  resolve and what shared state imposes.
prerequisites: [deployment-strategies]
related: [deployment-strategies, canary, rolling-deployments]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Blue-Green

## Overview

In blue-green, there are two complete environments. One serves the traffic; the other is idle.

The deployment happens on the idle one. Once verified, the traffic is **switched** — all at once. If
something goes wrong, you switch back.

The property that defines it: **instant rollback**. There is no deployment to undo, there is a route to
invert.

## Problem

Reverting a conventional deployment means deploying the previous version — which takes the same time as the
original deployment, under pressure, with the system degraded.

See [deployment strategies](/14-devops-and-platform/deployment-strategies.md). For high-risk changes, or
where the degradation window is expensive, that time is unacceptable.

Blue-green trades capacity for time: by keeping the old environment intact, going back is immediate.

## Core Concepts

### The switch is a routing change

```text
DNS              simple, and propagation takes minutes — bad for rollback
a load balancer  switching the destination set — seconds
a service mesh   switching the route — seconds, with granularity
```

The first option nullifies much of the value: if the rollback depends on DNS propagation, it is not
instant. See [regions](/09-cloud-architecture/regions.md).

The record's time to live needs to be short, or the switch should happen at a layer below.

### The idle environment needs to be warm

An environment that has just come up has a cold cache, unestablished connections and code the runtime has
not yet optimized.

Switching 100% of the traffic to it produces a latency spike and, frequently, an outage — which is read as
"the new version is bad", when the problem is the cold environment.

See [caching for scale](/11-scalability/scaling-cache.md).

What resolves it: warming before the switch — synthetic traffic, or a small fraction of real traffic for a
few minutes.

That last case is, in practice, a short canary. See [canary](/14-devops-and-platform/canary.md).

### Shared state is the real constraint

The two environments share the database, the cache, the queues and the storage. That imposes:

```text
the schema    needs to work with both versions
messages      the old version needs to read what the new one writes
the cache     compatible formats, or versioned keys
sessions      readable by both
```

Without that, the rollback is not safe: the old environment comes back and finds data it does not
understand.

This is the point that most frequently makes blue-green less instant than it promises. The routing switch
is immediate; the state's compatibility is modeling work.

See [schema evolution](/08-integration-architecture/schema-evolution.md).

### In-flight requests

At the moment of the switch, there are requests being processed in the old environment.

```text
an abrupt cut   they fail
draining        the old environment finishes what it started, receiving no new ones
```

Draining is the correct behavior, and it needs a time limit — a long request cannot hold the switch
indefinitely.

And the same holds for asynchronous work: the old environment's queue consumers need to stop consuming,
finish what they picked up, and leave.

### The cost is duplicated capacity

Maintaining two complete environments costs. There are ways to reduce it:

```text
a reduced environment   the idle one with less capacity, expanded before the switch
sharing                 only the application layer duplicated
ephemeral               the new environment created on each deployment, destroyed afterward
```

The third is what programmable infrastructure makes viable, and it is the most economical: nothing sits
idle.

Its cost is the creation time, and the requirement that the infrastructure be completely declared. See
[infrastructure as code](/14-devops-and-platform/infrastructure-as-code.md).

### What it does not do

It is worth being explicit: **blue-green does not detect problems**.

It makes the rollback cheap. Somebody — or something — still needs to notice that the new version is wrong.

For changes whose problem is not obvious, it needs to be combined with verification. See
[canary](/14-devops-and-platform/canary.md).

And there is an associated risk: the ease of reverting can reduce the care in prior verification, with the
logic of "if it goes wrong we will go back". That works for what is quickly detectable, and not for what is
silent.

## Mental Model

**Blue-green trades capacity for reversibility.** The switch is instant; the shared state's compatibility
is what needs to be designed.

## When to Use

- The rollback needs to be instant.
- Infrastructure changes — a runtime version, a base image.
- Where the degradation window is expensive.
- Low-volume systems, where a canary has no significance.
- When the environment can be created on demand.

## When Not to Use

**With no shared state compatibility.**

**With a switch by long-lived DNS.**

**With no warming of the new environment.**

**With no draining** of in-flight requests.

**As a substitute for verification.**

**When duplicating the environment is unviable** by cost or by licensing.

## Alternatives

- **[Canary](/14-devops-and-platform/canary.md)** — it detects, exposes less, requires volume.
- **[Rolling deployment](/14-devops-and-platform/rolling-deployments.md)** — no extra capacity, gradual
  rollback.
- **[Feature flags](/14-devops-and-platform/feature-flags.md)** — instant rollback with no duplicated
  environment, for behavior changes.
- **Blue-green with a canary on the switch** — switching gradually instead of all at once, combining the
  two.

The last wins where there is volume for the canary to be statistically significant and
the cost of the duplicated environment is already paid. Below that, it adds process
without adding information.

## Trade-offs

| Blue-green | Rolling |
|---|---|
| Instant rollback | Gradual |
| Duplicated capacity | No extra |
| Switch all at once | Gradual replacement |
| The new environment verifiable beforehand | Verification in production |

| A permanent environment | Ephemeral |
|---|---|
| Ready immediately | Creation time |
| A continuous cost | Only during the deployment |
| It can diverge | Always from the code |

## Failure Modes

**A cold environment receiving 100%.** A latency spike read as a bad version.

**An unsafe rollback.** The state changed incompatibly.

**DNS propagation.** The rollback takes minutes.

**Requests lost on the switch.** With no draining.

**The idle environment diverging.** Configuration applied only to the active one.

**Duplicated queue consumers.** Both environments consuming at the same time.

**Unforeseen cost.** Capacity duplicated permanently.

## Common Mistakes

**Not warming the new environment.** Receiving one hundred percent of the traffic with a cold cache and
unestablished connections produces a latency spike at exactly the moment of the switch.

**Not verifying the state's compatibility.** The two environments share the database. If the new version
requires a schema the old one does not understand, the rollback — which was the pattern's point — stops
being possible.

**Switching by DNS.** The resolution cache keeps clients on the old environment for tens of minutes, and
the rollback suffers the same delay precisely when the urgency is greatest.

**Not draining.** Cutting the traffic without waiting for in-flight requests to finish turns each switch
into a handful of errors for real users.

**Letting the idle environment diverge.** The stopped environment's configuration, certificates and quotas
silently fall behind, and the switch reveals that at the worst moment.

**Not turning off the old environment's asynchronous consumers.** Both environments keep processing the
same queue, with different versions of the code — and the effect depends on which one picked up the
message.

## Real-World Example

A financial management platform adopted blue-green to reduce the risk of monthly deployments, which were
two-hour events with a maintenance window.

The first months were good: the window disappeared, and the deployment came to take minutes.

Three problems appeared:

**A latency spike on the switch.** Every switch produced two to three minutes of elevated latency. It was
diagnosed as "normal warming" for months, until somebody measured: the new environment came up with an
empty cache and an unestablished connection pool. The solution was sending 5% of the traffic for ten
minutes before the complete switch — which, in practice, introduced a canary.

**An unsafe rollback.** In one deployment, the new version wrote a new field into session records. On
reverting, the old environment did not understand the format and dropped every logged-in user's session.
Mandatory state compatibility verification came to exist in review.

**Duplicated consumers.** Both environments had active queue consumers. After a deployment, both consumed —
and for 40 minutes, messages were processed by different versions, with inconsistent results. The switch
came to turn off the old environment's consumers before anything else.

And a cost change: the permanent idle environment cost the same as the active one. They migrated to an
ephemeral environment, created by infrastructure as code on each deployment and destroyed after a 24-hour
rollback window.

That reduced the cost by around 40% and had a positive side effect: the new environment came to always be
built from scratch from the code, eliminating the divergence that accumulated in the permanent environment.

The later assessment points out: the queue consumer problem was the most serious and the least expected.
Blue-green is presented as a traffic switch, and asynchronous traffic does not go through routing.

## Related Concepts

- [Deployment Strategies](/14-devops-and-platform/deployment-strategies.md).
- [Canary](/14-devops-and-platform/canary.md) — the detection that is missing.
- [Infrastructure as Code](/14-devops-and-platform/infrastructure-as-code.md) — the ephemeral environment.
- [Schema Evolution](/08-integration-architecture/schema-evolution.md).

## Practical Exercise

If you use blue-green, check what happens to the queue consumers during the switch — and whether a rollback
would be safe given what the new version wrote.

Both questions usually have no documented answer.

## Interview Questions

- Why does the new environment need to be warmed?
- Why is shared state the rollback's real constraint?
- What does blue-green not do?

## Further Reading

- Fowler, Martin. *BlueGreenDeployment*, 2010.
- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
