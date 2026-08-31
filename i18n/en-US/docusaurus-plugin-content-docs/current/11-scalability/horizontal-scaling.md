---
id: horizontal-scaling
title: Horizontal Scaling
sidebar_position: 2
description: More machines — what it requires of the system and why the gain is never linear.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader knows horizontal scaling's prerequisites and measures the
  point at which adding nodes stops paying off.
prerequisites: [vertical-scaling]
related: [vertical-scaling, statelessness, hotspots]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Horizontal Scaling

## Overview

Scaling horizontally is adding machines instead of growing one.

The promise is attractive: no physical ceiling, built-in failure tolerance, capacity proportional to the
investment.

The reality has two caveats that decide the design. First: it requires the system to be **able** to run on
several machines — which is a property of the design, not a configuration. Second: the gain is **never
linear**, and there is a point beyond which adding nodes makes the result worse.

## Problem

Vertical scaling has a ceiling — of size, of cost, of availability. See
[vertical scaling](/11-scalability/vertical-scaling.md).

When it is reached, distributing is the way out. And distributing changes the system's nature: what was a
function call becomes a network call, what was a transaction becomes coordination, what was state in memory
needs to leave.

Adopting horizontal scaling without preparing the system produces the worst of both worlds: distribution's
complexity with no capacity gain.

## Core Concepts

### The prerequisites

Before adding the second machine, three properties need to exist:

**No state in the process.** A session in memory, a local cache treated as authoritative, a file on disk —
any of them prevents a request from going to any node. See
[statelessness](/11-scalability/statelessness.md).

**Idempotency where there is repetition.** Load balancers and clients retry. See
[idempotency](/06-distributed-systems/idempotency.md).

**Discovery and balancing.** How traffic finds the nodes, and how a node that dies leaves the rotation.

Without all three, adding machines creates inconsistent behavior instead of capacity.

### The gain is not linear

What is observed by measuring real systems:

```text
nodes   capacity    efficiency
  1        1.0×         100%
  2        1.9×          95%
  4        3.6×          90%
  8        6.5×          81%
 16       10.0×          63%
 32       11.0×          34%   ← past the saturation point
```

Two forces cause the degradation:

**Contention.** Shared resources — the database, the cache, the queue — are contended by more clients.

**Coherence.** Keeping the nodes in agreement costs communication, and that cost grows faster than the
number of nodes.

The second is what produces the point at which **more nodes deliver less**. It exists in every system, and
knowing it — by measuring — avoids spending on capacity that does not deliver.

### The serial fraction is the real ceiling

See [performance versus scalability](/11-scalability/performance-vs-scalability.md). Everything that does
not parallelize limits the gain, regardless of the number of nodes.

In a distributed architecture, the serial fraction is usually:

```text
the database          centralized writes
a distributed lock    coordination
a single sequence     identifier generation
a hot partition       see hotspots
a central service     authorization, configuration
```

Above a certain number of nodes, **removing the serial fraction returns more than adding nodes**. That
inversion is this section's most useful practical insight.

### Scaling is not only multiplying the application

The structural mistake: multiplying the application layer and leaving everything else the same.

```text
1 application node  → 20 database connections
10 nodes            → 200 connections
50 nodes            → 1000 connections  ← the database cannot take it
```

The application layer scaled; the database became the bottleneck, and the pressure on it grew
proportionally.

Scaling horizontally requires looking at **the whole chain**: connections, cache, queue, external services,
third-party limits. Each one has its own limit, and the first one reached defines the whole's ceiling.

A connection pooler — which multiplexes many application connections into few database ones — is the
control that resolves the most common case.

### Elasticity has a startup cost

Adding nodes automatically looks like it solves peaks, and the timing matters: detection, provisioning,
startup and health checking add up to minutes.

See [cloud compute](/09-cloud-architecture/cloud-compute.md). Many peaks last less than that.

And there is a second-order effect: new nodes arrive with a cold cache, which temporarily increases the
load on the layers behind — exactly when they are already under pressure.

### Nodes are not identical in practice

The premise that all nodes are equivalent breaks for concrete reasons:

**Heterogeneous hardware.** The provider delivers different processor generations.

**Noisy neighbors.** An instance shared with somebody else's load.

**A cold cache.** Newly added nodes respond worse.

**Uneven distribution.** Persistent connections pin clients to nodes. See
[balancing for scale](/11-scalability/scaling-load-balancing.md).

That is why balancing sensitive to latency and real load beats distributing uniformly.

## Mental Model

**Horizontal removes the size ceiling and adds the coordination ceiling.** The second is lower than
expected, and it needs to be measured.

## When to Use

- The single machine's limit has been reached or is close.
- Availability requires more than one machine.
- The load varies a lot and elasticity has value.
- The component is naturally stateless.
- The large instance's cost is already disproportionate.

## When Not to Use

**Before exhausting the vertical.** See [vertical scaling](/11-scalability/vertical-scaling.md).

**Without removing state from the process.**

**Without looking at the whole chain.** The application scales and the database goes down.

**Counting on elasticity for short peaks.**

**Without knowing the saturation point.**

**When the serial fraction dominates.** Adding nodes will not help.

## Alternatives

- **[Vertical scaling](/11-scalability/vertical-scaling.md)** — with no coordination.
- **[Caching](/11-scalability/scaling-cache.md)** — it reduces the load instead of increasing the capacity.
- **[A queue](/11-scalability/queue-based-scaling.md)** — it absorbs a peak with no proportional capacity.
- **Removing the serial fraction** — when the coordination ceiling has been reached.
- **Partitioning** — instead of replicating everything, dividing the work. See
  [partitioning for scale](/11-scalability/scaling-partitioning.md).

## Trade-offs

| Horizontal | Vertical |
|---|---|
| No physical ceiling | The machine's ceiling |
| Failure tolerance | A single point |
| No downtime to grow | A restart |
| Coordination in everything | None |
| Distributed diagnosis | Simple |
| Diminishing gain | Proportional up to the ceiling |

## Failure Modes

**State in the process.** Inconsistent behavior between nodes.

**Connections exhausted at the database.**

**The saturation point exceeded.** More nodes, less throughput.

**A cold cache during expansion.** The peak gets worse at the moment of scaling.

**Uneven distribution.** Some nodes saturated, others idle.

**The serial fraction dominating.** Capacity added with no effect.

**A thundering herd.** Every node does the same thing at the same time — synchronized cache expiration,
simultaneous reconnection.

## Common Mistakes

**Scaling without removing state.** A session or a file on the instance makes each new replica serve only
whoever lands on it, and losing one instance takes down the users pinned to it.

**Not sizing the whole chain.** Multiplying the application layer without looking at the database only
moves the bottleneck — and concentrates more pressure on the component that was already the limit.

**Not measuring the saturation point.** Without knowing at what load one instance saturates, there is no
way to calculate how many are needed, and scaling becomes trial and error in production.

**Assuming a linear gain.** Coordination, contention and shared resources make each additional instance
return less than the previous one. Doubling the number rarely doubles the capacity.

**Not using a connection pooler.** Each instance opens its own set of connections, and the database reaches
its limit well before the application reaches its own.

**Not considering that the vertical would solve it.** Swapping for a bigger machine is an afternoon's work
and requires neither removing state, nor coordinating replicas, nor operating balancing. For many systems,
it solves it for years.

## Real-World Example

A content platform scaled the application layer from 6 to 60 instances to support a launch.

The capacity did not increase proportionally. With 60 instances, the throughput was around 2.3 times that
of 6 — and the latency was worse than with 20.

The investigation found four limits, each reached at a different point of the expansion:

**Database connections.** Each instance held 20 connections. With 60, that was 1,200, while the database
supported 500. The additional instances spent their time waiting for a connection. Solved with a connection
pooler: 60 instances came to use 150 real connections.

**A session in memory.** Discovered during the incident: the load balancer used session affinity because
the application kept the cart in memory. That made the distribution follow the session pattern, not the
load — and the new instances received little traffic because they had no established sessions.

**A cold cache.** The new instances came up with no local cache and made queries the old ones did not,
increasing the load on the database at the moment of greatest pressure.

**A third party's limit.** The recommendation service, external, had a limit of 300 requests per second per
client. With 60 instances, the limit was reached and the requests started failing — which generated
retries, which consumed more of the limit.

The fixes, and each one's effect:

**The connection pooler** — the most impactful on its own.

**Sessions externalized** to shared storage, removing the affinity. The distribution came to follow the
load.

**Cache warming** at startup, with the node entering the rotation only afterward.

**A shared cache** for the recommendation service's responses, reducing external calls by 85%.

After the fixes, 40 instances delivered 6.2 times the capacity of 6 — and the measurement showed that above
45 the gain became marginal.

That number became the auto scaling's configured ceiling, with an alert when it is reached.

The expansion to 60 instances was done during the incident, in the hope that capacity would resolve it. It
cost money, made the latency worse, and the diagnosis only started after somebody asked why it was not
working.

## Related Concepts

- [Vertical Scaling](/11-scalability/vertical-scaling.md) — the alternative.
- [Statelessness](/11-scalability/statelessness.md) — the prerequisite.
- [Hotspots](/11-scalability/hotspots.md) — why uneven distribution nullifies the gain.
- [Database Scaling](/11-scalability/database-scaling.md) — the chain's limit.

## Practical Exercise

Measure your system's capacity with N and with 2N instances, under the same synthetic load.

If the capacity does not grow close to 2×, you have found a limit in the chain — and it is more interesting
than the number of instances.

## Interview Questions

- What are horizontal scaling's three prerequisites?
- Why is the gain not linear, and what produces the saturation point?
- Why can scaling the application take the database down?

## Further Reading

- Gunther, Neil. *Guerrilla Capacity Planning*. Springer, 2007 — the universal scalability law.
- Amdahl, Gene. *Validity of the Single Processor Approach*, 1967.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
