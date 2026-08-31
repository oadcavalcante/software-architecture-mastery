---
id: scaling-load-balancing
title: Balancing for Scale
sidebar_position: 7
description: Distributing traffic across instances — and why "uniform" is almost never what you want.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses a balancing algorithm by the instances' real
  behavior, not by nominal uniformity.
prerequisites: [horizontal-scaling]
related: [horizontal-scaling, statelessness, hotspots]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Balancing for Scale

## Overview

Balancing distributes requests across instances. The fundamentals — layers, health checking, algorithms —
are in [load balancing](/05-system-design/load-balancing.md).

Here what matters is the scale angle: **distributing uniformly is not the goal**. The goal is that no
instance is saturated while others are idle — and instances are not equivalent in practice.

## Problem

The most common algorithm — round robin — presupposes that all instances are equal and that all requests
cost the same.

Both premises are false:

**Instances differ.** Distinct hardware generations, noisy neighbors, a cold cache on newly created nodes,
garbage collection at different moments.

**Requests differ.** A simple search and a heavy report consume orders of magnitude differently.

The result is a nominally uniform distribution and an uneven real load — with one instance saturated while
the average looks comfortable. It is the same [hotspot](/11-scalability/hotspots.md) pattern, at the
balancing layer.

## Core Concepts

### The algorithms, and what each one presupposes

```text
round robin           equal instances, equal requests
weighted round robin  different instances, equal requests
least connections     requests of varying duration
lowest latency        it measures the real behavior
two random choices    pick two, send to the less loaded one
```

The last deserves emphasis: picking two at random and sending to the less loaded one delivers almost the
result of knowing every load, at a fraction of the cost — and without the herd effect that "always the
least loaded" produces, when several balancers converge on the same instance.

For most cases, **least connections** or **two random choices** beat round robin comfortably.

### Persistent connections break the balancing

The most common problem in modern architectures, and the least expected.

Protocols with a long, multiplexed connection — HTTP/2, gRPC — open the connection once and send everything
over it. A layer 4 balancer distributes **connections**, not requests.

```text
10 clients, 10 connections, 3 instances
  → connection distribution: 4, 3, 3
  → request distribution: whatever the clients send
```

If one client sends ten times more than the others, its instance saturates. And, worse: new instances added
during a peak receive no traffic at all, because no new connections are being opened.

See [gRPC](/08-integration-architecture/grpc.md). The ways out are layer 7 balancing, client-side
balancing, or a [service mesh](/08-integration-architecture/service-mesh.md).

### A shallow health check keeps a sick instance in the rotation

A check that only confirms the process responds does not detect the degraded instance — slow, with a
dependency down, with a full disk.

See [failure detection](/06-distributed-systems/failure-detection.md). Mature balancing considers error
rate and latency, not only presence.

And there is the inverse effect, which is worse: a **too deep** check — one that queries the database —
makes every instance leave the rotation when the database gets slow, turning degradation into total
unavailability.

The balance: the check verifies its own process; the balancing observes latency and errors to decide.

### Shedding load is better than queuing

When every instance is saturated, the balancer has two options:

**Queue.** The requests wait. The latency grows, the clients time out and retry — and the load increases.

**Refuse.** The client receives an immediate error and can react — retry with
[backoff](/06-distributed-systems/backoff.md), degrade, warn the user.

Under saturation, refusing fast preserves the capacity for what can be served. See
[backpressure](/06-distributed-systems/backpressure.md).

A queue limit on the balancer, with refusal above it, is what prevents collapse by queuing.

### Drain before removing

Removing an instance abruptly drops the requests in flight.

Correct draining: stop sending new ones, wait for the in-flight ones to finish, and only then remove.

That needs to work at three moments: deployment, capacity reduction and health check failure. Without it,
every scaling event — which should be routine — loses requests. See
[statelessness](/11-scalability/statelessness.md).

### A new instance needs to enter slowly

A newly created instance has a cold cache, unestablished connections and code the runtime has not yet
optimized.

Sending it the full slice of traffic immediately produces high latency and, frequently, removal from the
rotation by a health check failure — which generates a cycle of instances coming up and going down.

Gradual entry — an increasing fraction of the traffic over a few minutes — resolves it. It is a simple
configuration and frequently absent.

## Mental Model

**The goal is not to distribute equally; it is not to saturate anybody.** Instances and requests are not
equivalent.

## When to Use

- More than one instance serving the same service.
- Requests of varying cost.
- Instances of heterogeneous capacity or performance.
- Auto scaling with instances entering and leaving.
- Protocols with persistent connections.

## When Not to Use

**Round robin when the requests vary a lot in cost.**

**Layer 4 with persistent connections.**

**A health check that queries dependencies.**

**Unlimited queuing under saturation.**

**Removing an instance without draining.**

**Session affinity as a permanent solution.** See [statelessness](/11-scalability/statelessness.md).

## Alternatives

- **Client-side balancing** — the client knows the instances and decides. It eliminates a hop and resolves
  the persistent connection problem.
- **A [service mesh](/08-integration-architecture/service-mesh.md)** — per-request balancing, with a
  central policy.
- **Queues** — for asynchronous work, the queue distributes better than any balancer. See
  [queue-based scaling](/11-scalability/queue-based-scaling.md).
- **Routing by partition** — when the state is partitioned, the routing follows the key, not the load.

## Trade-offs

| Round robin | Least connections |
|---|---|
| Trivial | Needs state |
| Ignores duration | Considers it |
| Predictable | Adaptive |

| Layer 4 | Layer 7 |
|---|---|
| Fast, cheap | More processing |
| Distributes connections | Distributes requests |
| No visibility | Routes by content |

## Failure Modes

**Uneven distribution from persistent connections.**

**A new instance with no traffic.** There are no new connections.

**A degraded instance in the rotation.** A shallow check.

**All of them out of the rotation.** A deep check with a slow dependency.

**Collapse by queuing.**

**Requests lost on removal.** With no draining.

**A come-up-and-go-down cycle.** A saturated new instance leaves on a health check failure.

## Common Mistakes

**Using round robin by default.** It presupposes requests of similar cost. When some are far more
expensive, an equal distribution of requests produces an unequal distribution of load.

**Layer 4 with HTTP/2 or gRPC.** Those protocols multiplex over long-lived connections, so balancing per
connection pins each client to one instance and the new ones receive no traffic.

**A health check querying the database.** A database slowdown fails every instance at the same time, and
the balancer removes the whole service — converting degradation into a total outage.

**Not limiting the queue.** Accepting everything under overload increases everybody's latency until nobody
is served in time. Refusing the excess fast preserves what still fits.

**Not draining.** Removing the instance without waiting for in-flight requests to finish turns every
deployment into a handful of errors for real users.

**Not configuring gradual entry.** The newly started instance receives full load with a cold cache and
unestablished connections, and it responds badly precisely while it warms up.

## Real-World Example

A services platform migrated the communication between internal services to gRPC, with the existing layer 4
balancer.

The performance improved — less serialization, persistent connections — and the distribution broke.

The symptoms, over weeks:

**Persistent uneven load.** Three instances of ten with CPU above 80%, seven below 20%. The connection
distribution was uniform; the request distribution was not.

**Idle new instances.** In an expansion from 10 to 20 instances during a peak, the ten new ones got
practically no traffic — no new connection was being opened, because the clients already had theirs.

That meant scaling during the peak did nothing, and the team only discovered it by comparing the request
distribution with the number of instances.

**An instability cycle.** Two instances entered and left the rotation repeatedly. The health check queried
the database; when the database got slow, several failed at the same time, the traffic concentrated on the
remaining ones, which got slower — and left too.

The fixes:

**Client-side balancing**, with instance resolution and per-request distribution. The distribution came to
follow the real load, and new instances started receiving traffic immediately.

**Two random choices** as the algorithm, beating round robin on the variation in request cost.

**A shallow health check** — only its own process — with the balancing observing latency and error rate to
reduce a degraded instance's weight, instead of removing it.

**Gradual entry** for new instances, with an increasing fraction over 3 minutes.

**Draining** of 30 seconds before removal.

Result: the difference between the most and the least loaded instance fell from 4 times to 1.3 times, and
expanding during peaks came to have an effect.

The team's reading: the migration to gRPC had been assessed on performance and on the contract, and the
balancing behavior was not on the list. It is the protocol's most significant operational change, and it
appears in no performance comparison.

## Related Concepts

- [Horizontal Scaling](/11-scalability/horizontal-scaling.md) — what it enables.
- [Statelessness](/11-scalability/statelessness.md) — the affinity.
- [Load Balancing](/05-system-design/load-balancing.md) — the fundamentals.
- [Service Mesh](/08-integration-architecture/service-mesh.md).

## Practical Exercise

Compare the CPU utilization across the instances of your most loaded service, at the same instant.

If the ratio between the highest and the lowest exceeds 2, the balancing is not distributing load — it is
distributing something else.

## Interview Questions

- Why is distributing uniformly not the goal?
- Why do persistent connections break layer 4 balancing?
- Why can a deep health check cause total unavailability?

## Further Reading

- Mitzenmacher, Michael. *The Power of Two Choices in Randomized Load Balancing*, 2001.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapters 19 and 20.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.
