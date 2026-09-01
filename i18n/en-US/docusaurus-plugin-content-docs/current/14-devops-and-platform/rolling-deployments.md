---
id: rolling-deployments
title: Rolling Deployments
sidebar_position: 7
description: Replacing instances gradually — the default strategy, and what it costs in capacity.
doc_type: pattern
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader configures rolling deployment with preserved capacity and a
  stopping criterion.
prerequisites: [deployment-strategies]
related: [deployment-strategies, blue-green, canary]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Rolling Deployments

## Overview

In a rolling deployment, the instances are replaced gradually: some leave, come up with the new version,
enter; that repeats until all of them have been swapped.

It is most orchestrators' default strategy, and the most used — because it requires neither extra capacity
nor comparison infrastructure.

What it delivers: deployment with no downtime. What it does **not** deliver: problem detection, and instant
rollback.

## Problem

Replacing every instance at once causes unavailability. Replacing them one by one takes far too long in
large environments.

Rolling deployment resolves that with one parameter: how many instances are replaced simultaneously.

And it introduces two questions that usually are not decided: **how much capacity is lost during the
process**, and **when to stop if something goes wrong**.

## Core Concepts

### Capacity during the deployment

The most consequential point and the most neglected.

```text
10 instances, a wave of 2, with no extra instances
  → during the deployment, 8 serve
  → if they operated at 80%, now they need 100% → they saturate
```

Two configurations resolve it, and they combine:

**Max unavailable.** How many can be out at the same time. Zero means new ones come up before the old ones
leave.

**Max surge.** How many extra can exist temporarily. It allows bringing the new one up before taking the
old one down, preserving the total capacity.

The safe configuration for services with little headroom: positive surge, zero unavailable. That costs
temporary capacity and does not reduce the serving capacity.

See [capacity planning](/11-scalability/scaling-capacity-planning.md).

### The health check decides the pace

The wave only advances when the new instances are healthy. That makes the check critical:

```text
too shallow   the instance enters the rotation before it is ready
              → errors during the deployment
too deep      it depends on a resource shared by the replicas
              → a slow dependency stalls the whole deployment,
                and takes down the healthy old instances with it
```

See [Kubernetes](/09-cloud-architecture/kubernetes.md) — the distinction between checking that the process
is alive and checking that it can receive traffic. Readiness checks what is particular to the instance;
in a rolling deployment, pointing it at a shared resource is what stalls the wave and removes the old
replicas along with it.

The readiness check needs to consider warming: an instance that came up but still has an empty cache can
respond and not be ready for the full slice of traffic.

### The two versions coexist throughout the process

While the wave advances, requests are served by both versions.

```text
the schema         compatible in both directions
messages           the old version needs to read what the new one writes
sessions and cache compatible formats
the contract       with no incompatible change
```

See [schema evolution](/08-integration-architecture/schema-evolution.md).

That is no different from the other gradual strategies, and here the coexistence lasts longer — the
deployment's total time, which can be tens of minutes in large environments.

### Automatic stopping is what limits the damage

With no stopping criterion, the deployment continues to the end, even if the new instances are failing.

What a mature configuration has:

```text
stop if the health check fails on N consecutive instances
stop if the service's error rate rises beyond a threshold
a total time limit — if it does not conclude, stop and alert
```

The second is what distinguishes: stopping by instance health catches startup failures; stopping by service
metric catches the version that comes up fine and responds wrong.

Even so, that is coarse detection compared to a [canary](/14-devops-and-platform/canary.md).

### The rollback is another rolling deployment

Unlike [blue-green](/14-devops-and-platform/blue-green.md), reverting is not switching a route — it is
replacing the instances again, at the same pace.

```text
a 12-minute deployment → a 12-minute rollback
```

That matters in the recovery time calculation. See [RTO](/12-reliability/rto.md).

Where the rollback needs to be faster, the strategy is another one — or the rolling deployment is combined
with [feature flags](/14-devops-and-platform/feature-flags.md), which revert in seconds.

### The wave size is a simple trade-off

```text
a large wave   fast, more capacity out, more exposure if it is bad
a small wave   slow, capacity preserved, less exposure
```

A common and good practice: **start small and accelerate**. The first wave with one instance, observed for
a few minutes; if everything is fine, larger waves.

That brings the rolling deployment closer to a canary, with no comparison infrastructure.

## Mental Model

**Rolling trades time for preserved capacity.** It does not detect and does not revert quickly — it
protects against unavailability during the switch.

## When to Use

- Routine, low-risk changes.
- Where there is no capacity to duplicate the environment.
- Stateless services, with many instances.
- As the final stage after an approved [canary](/14-devops-and-platform/canary.md).

## When Not to Use

**Without configuring surge**, on services with little headroom.

**With a readiness check pointed at a shared resource.**

**With no stopping criterion.**

**For changes requiring instant rollback.**

**With no compatibility between versions.**

**On stateful services** that do not tolerate instances being recreated.

## Alternatives

- **[Blue-green](/14-devops-and-platform/blue-green.md)** — instant rollback, duplicated capacity.
- **[Canary](/14-devops-and-platform/canary.md)** — automatic detection.
- **[Feature flags](/14-devops-and-platform/feature-flags.md)** — rollback in seconds, with no deployment
  involved.
- **Rolling with the first instance observed** — the cheap middle ground between rolling and canary.

## Trade-offs

| Rolling | Blue-green |
|---|---|
| No permanent extra capacity | Duplicated |
| Rollback takes the same time | Instant |
| Prolonged coexistence | Only during the switch |
| Simple configuration | An environment to manage |

| A large wave | A small wave |
|---|---|
| Fast | Slow |
| More capacity out | Preserved |
| More exposure | Less |

## Failure Modes

**Insufficient capacity during the deployment.** The remaining instances saturate.

**An instance entering the rotation before it is ready.**

**A stalled deployment.** The health check depending on a slow service.

**A bad version going to all of them.** With no stopping criterion.

**A slow rollback.**

**Incompatible state** between the coexisting versions.

**A partial deployment.** It stopped halfway, and half the instances have each version — with no plan to
resolve it.

## Common Mistakes

**Not configuring max surge.**

**A readiness check querying a resource shared by the replicas.**

**Not defining a stopping criterion.**

**Too large a wave** on services with little headroom.

**Not considering the rollback time** in the recovery plan.

**Not deciding what to do with a deployment stopped halfway.**

## Real-World Example

A messaging platform deployed in waves of 25% of the instances, with max unavailable of 25% and no surge.

The system operated at 70% utilization at normal times.

During the deployments — which happened twice a day — the capacity fell to 75%, and the remaining instances
went to 93%. The latency rose visibly for around eight minutes, twice a day.

That was known and treated as unavoidable: "it is the cost of deploying".

Three changes resolved it:

**Max surge of 25%, zero unavailable.** The new instances come up before the old ones leave. The total
capacity never falls below 100%. The cost is temporary capacity during the deployment — a few minutes of
extra instances.

The latency spike disappeared.

**A readiness check with warming.** The new instances entered the rotation immediately, with an empty
cache. They came to wait for the cache's initial fill before declaring themselves ready.

**A stopping criterion.** Before, the deployment continued to the end regardless. It came to stop if the
service's error rate rose 50% relative to the baseline, or if three consecutive instances failed the check.

In the first month, the automatic stop fired twice — both times for versions with a configuration defect
that would have gone to every instance.

And a fourth discovery during the work:

**A deployment stopped halfway** had no procedure. The first time the criterion fired, half the instances
were on one version and half on the other, and nobody knew whether to revert or continue. Automatic
rollback on stopping came to exist.

What the team records: the latency spike twice a day was treated as an unavoidable cost of deploying
frequently. It was a two-parameter configuration nobody had reviewed since the service was created.

## Related Concepts

- [Deployment Strategies](/14-devops-and-platform/deployment-strategies.md).
- [Blue-Green](/14-devops-and-platform/blue-green.md) and [Canary](/14-devops-and-platform/canary.md).
- [Kubernetes](/09-cloud-architecture/kubernetes.md) — health checks.
- [Capacity Planning](/11-scalability/scaling-capacity-planning.md).

## Practical Exercise

Check your most critical service's max unavailable and max surge configuration.

Then calculate the capacity available during the deployment and compare it with the traffic peak. The
calculation usually explains latency spikes nobody had connected to deployments.

## Interview Questions

- Why does max surge matter more than the wave size?
- Why does readiness pointed at a shared resource take down the whole service?
- Why does a rolling rollback take the same time as the deployment?

## Further Reading

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Burns, Brendan et al. *Kubernetes: Up and Running*. 3rd ed. O'Reilly, 2022.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
