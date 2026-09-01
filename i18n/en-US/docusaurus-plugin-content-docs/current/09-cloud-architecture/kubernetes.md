---
id: kubernetes
title: Kubernetes
sidebar_position: 5
description: Declarative container orchestration — what it solves and the question that precedes adoption.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates Kubernetes by the concrete problem they have
  today, and knows the operational cost the adoption brings.
prerequisites: [containers]
related: [containers, serverless, managed-services]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Kubernetes

## Overview

Kubernetes orchestrates containers across a set of machines: it decides where each one runs, restarts what
dies, replaces nodes that vanish, distributes traffic and conducts deployments.

The model is **declarative**: you describe the desired state, and a reconciliation loop works continuously
to make reality correspond.

It is a powerful technology and an expensive one in knowledge. The question that precedes adoption is not
"is it good?", but **"what concrete problem do I have today that it solves?"**.

## Problem

With dozens of containerized services and several machines, questions appear that somebody needs to answer
continuously:

On which machine does each container run? What happens when one dies? And when the whole machine vanishes?
How do you deploy a new version without taking the service down? How do other services find this one? How
do you distribute load?

Answering that with scripts works up to a point and gradually becomes a worse homemade orchestrator.

## Core Concepts

### Reconciliation is what explains everything

The mechanism is not "execute this command". It is "this is the desired state".

```text
declared: 3 replicas of this service
reality:  2 replicas (one died)
action:   create 1
```

That loop runs continuously, for everything. That is why the system recovers by itself from node failures,
and why manual changes are undone — the reconciler sees them as drift.

Understanding that changes the mental model: you do not operate the system, you declare what you want and
the system pursues it.

### The abstractions that matter

```text
pod          the smallest unit — one or more containers sharing a network
deployment   manages pod replicas and conducts gradual updates
service      a stable address for a set of pods
ingress      the entry point for external traffic
configmap    configuration
secret       a secret — encrypted at rest only if configured
namespace    logical separation
```

The point about secrets deserves emphasis: they are encoded, not encrypted, by default. Treating them as
secure without configuring encryption at rest is a common mistake.

### Requests and limits decide stability

Each container declares how much it asks for and how much it may consume.

**A request** is what the scheduler reserves when choosing the node. Underestimating leads to overcrowded
nodes; overestimating wastes.

**A limit** is the ceiling. Exceeding memory kills the container; exceeding CPU throttles it.

With no requests, the scheduler decides blindly and the distribution gets bad. With no limits, one
container consumes the node. It is the configuration that most affects stability and the most neglected.

### There are three health checks, with distinct roles

```text
liveness   is it stuck? if it fails, restart
readiness  can it receive traffic now? if it fails, leave the load balancing
startup    is it still starting? it suspends the other two
```

The classic mistake is pointing the liveness check at a check that depends on other services: the database
gets slow, the check fails, the pod is restarted — and restarting does not fix the database, it only makes
things worse. See [failure detection](/06-distributed-systems/failure-detection.md).

The rule: liveness checks only its own process; readiness checks whether **this
instance** can serve — initialization done, warm-up complete, connection pool
established.

The part the short rule hides: readiness must **not** depend on a resource shared by
all replicas. If all ten query the same database, one blip takes all ten out of
rotation at once, and the service is left with no destination at all — partial
degradation became a total outage. See
[graceful degradation](/12-reliability/graceful-degradation.md).

### The cost is knowledge, not a license

Being specific:

**Conceptual surface.** Dozens of resource types, and the mental model of reconciliation.

**Networking.** It is the hardest part to diagnose. A network policy or name resolution problem requires
understanding several layers.

**Upgrades.** The version cycle is fast, and falling behind is not an option for security.

**Layered diagnosis.** Application, container, pod, node, network, control plane. Every incident starts by
finding out which layer it is in.

**The ecosystem.** The adoption almost always brings along traffic ingress, certificates, metrics, logs,
policy, secrets — each with its own curve.

Small teams usually underestimate this because the initial installation is easy. It is the sustained
operation that costs.

### Managed removes half of it

A managed Kubernetes removes the control plane's operation — which is the hardest and most critical part.

What remains yours: nodes, networking, policy, scaling, application upgrades, and the whole ecosystem.

The practical recommendation: if you are going to adopt it, adopt managed. Operating your own control plane
requires a dedicated team, and almost no organization needs that.

### When it is not justified

With few services, a small team and predictable load, a simpler container platform delivers almost the same
thing at a fraction of the required knowledge.

The point at which it starts to pay off: many services, many teams, a need to standardize deployment and
resources, or requirements only it meets.

## Mental Model

**Kubernetes is a loop that pursues the state you declared.** It solves orchestration at scale, and charges
in knowledge continuously.

## When to Use

- Many containerized services, across several machines.
- Several teams needing standardized deployment.
- Automatic scaling by metric.
- Automatic recovery from node failure.
- Portability between providers has concrete value.
- Somebody to operate it already exists, or the investment is planned.

## When Not to Use

**With few services.** Simpler platforms solve it.

**With nobody to operate it.** The installation is easy; the operation is not.

**For a single application.**

**As a synonym for modernization.**

**Self-managed, with no dedicated team.** Use managed.

**To solve an architecture problem.** It does not fix wrong service boundaries — it only distributes them
better.

## Alternatives

- **Managed container platforms** — they run containers without exposing the orchestration model. They
  cover most cases with far less knowledge.
- **[Serverless](/09-cloud-architecture/serverless.md)** — with neither capacity nor orchestration.
- **Machines with auto scaling** — for a few stable services.
- **Platform as a service** — see [PaaS](/09-cloud-architecture/paas.md).

## Trade-offs

| Kubernetes | A simple platform |
|---|---|
| Fine control | Opinionated |
| Portable between providers | Coupled |
| A broad ecosystem | Limited |
| High knowledge | Low |
| Layered diagnosis | Direct |
| Scales to hundreds of services | Dozens |

| Managed | Self-managed |
|---|---|
| The provider's control plane | Yours |
| Less critical operation | All of it |
| The service's cost | The team's cost |
| Versions on the provider's terms | Your choice |

## Failure Modes

**No requests or limits.** Bad scheduling and saturated nodes.

**Liveness checking a dependency.** Cascading restarts during another service's degradation.

**A secret treated as encrypted** when it is not.

**Disruption with no defined budget.** A node maintenance removes every replica at the same time.

**Scaling with no ceiling.** Cost explodes with a defect.

**Networking that is hard to diagnose.** Policy or name resolution.

**An outdated version.** A postponed upgrade accumulates risk and difficulty.

**Pod autoscaling fighting node autoscaling.** Inconsistent configurations produce oscillation.

## Common Mistakes

**Adopting it with no concrete problem.** It solves packaging and the scale of many services. For three
services with stable load, it charges the whole complexity and delivers nothing a machine with a process
manager would not deliver.

**Not defining requests and limits.** With no request, the scheduler does not know where it fits and stacks
workloads on the same node; with no limit, a memory leak takes the neighbors down with it.

**Liveness dependent on other services.** If the liveness probe queries the database, a database slowdown
restarts every pod at the same time — the probe converts a dependency's degradation into a total outage.

**Self-managing the control plane.** Maintaining etcd, certificates and upgrades is a dedicated team's job.
Providers do it for a cost that is almost always less than one person.

**Not configuring a disruption budget.** Without it, a node maintenance can simultaneously remove every
replica of a service — the cluster obeys because nobody said how many need to stay.

**Not planning upgrades from the start.** Versions go out of support at a fast pace, and the API changes
between them. A cluster that goes two years without upgrading accumulates incompatible changes that have to
be made all at once.

## Real-World Example

A company with 40 engineers and 9 services adopted self-managed Kubernetes, with the justification of
"preparing to scale" and avoiding provider dependency.

Eighteen months later, the balance:

**Two full-time engineers** operating the platform — 5% of engineering capacity, for 9 services.

**Eleven incidents** caused by the platform itself: networking, an expired certificate, a failed upgrade, a
full node disk.

**A version upgrade postponed** for fourteen months, accumulating three versions of delay. The upgrade,
when finally done, took six weeks.

**Requests and limits absent** in 7 of the 9 services. A memory leak in one of them took down two nodes.

**Liveness checking the database** in four services. In a database slowdown, every pod of those services
entered a restart cycle — turning degradation into complete unavailability.

The reassessment led to two decisions:

**Migration to managed Kubernetes.** The two engineers went back mostly to the product; one remains
partially allocated. Platform incidents fell to two the following year, both from application
configuration.

**Configuration fixes** — requests, limits, corrected health checks, disruption budgets — which resolved
most of the remaining incidents.

And an observation the team recorded honestly: with 9 services, a simpler container platform would have
served, and the discussion was never had. The choice was Kubernetes against virtual machines, with no
consideration of the middle ground.

The argument of avoiding provider dependency, which motivated the self-management, did not hold up: the
portability was never exercised, and the cost of operating it was greater than that of any hypothetical
migration. See [vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

## Related Concepts

- [Containers](/09-cloud-architecture/containers.md) — what it orchestrates.
- [Serverless](/09-cloud-architecture/serverless.md) — the alternative with no orchestration.
- [Managed Services](/09-cloud-architecture/managed-services.md).
- [Service Mesh](/08-integration-architecture/service-mesh.md).

## Practical Exercise

If you use Kubernetes, check how many of your services have requests, limits and health checks correctly
configured.

Then look at the liveness checks: does any of them query a database or another service? Each one of those
turns somebody else's slowness into your own restart.

## Interview Questions

- What does declarative reconciliation explain about the system's behavior?
- Why should liveness not check dependencies?
- What is the difference between a request and a limit, and what does each one affect?

## Further Reading

- Burns, Brendan et al. *Kubernetes: Up and Running*. 3rd ed. O'Reilly, 2022.
- Burns, Brendan. *Designing Distributed Systems*. O'Reilly, 2018.
- The official Kubernetes documentation — concepts and best practices.
