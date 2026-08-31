---
id: load-balancing
title: Load Balancing
sidebar_position: 8
description: Distributing requests across instances — and why the choice of algorithm matters less than the health check.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader configures load balancing with an adequate health check
  and recognizes the failure modes the balancer introduces.
prerequisites: [stateless-vs-stateful]
related: [caching, rate-limiting, scalability-basics]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Load Balancing

## Overview

A load balancer distributes requests across several instances of a service.

The discussion usually revolves around the distribution algorithm. In practice, **the
health check matters more** — a perfect algorithm distributing to a sick instance is worse
than a simple algorithm that excludes it.

## Problem

A single instance is a capacity limit and a single point of failure. Several instances solve
both, and create a new question: which one serves each request?

The naive answer — distribute evenly — hides three problems.

**Instances are not equal.** One that just started has a cold cache and responds more
slowly. One with a heavy request in flight has less available capacity.

**Instances fail partially.** One that answers the health check but cannot reach the
database is worse than one that is down — it absorbs traffic and fails.

**Distribution interacts with state.** If there is local state, distributing evenly breaks
the behavior.

## Core Concepts

### The algorithms and when they matter

| Algorithm | How it distributes | Suitable when |
|---|---|---|
| Round-robin | In rotation | Homogeneous requests, equal instances |
| Least connections | To whoever has fewest active | Requests of variable duration |
| Lowest latency | To whoever responds fastest | Heterogeneous instances |
| Consistent hashing | Same key, same instance | There is state or a local cache per key |
| Random with two choices | Draw two, use the less busy | Good balance at little cost |

For homogeneous requests, round-robin and least connections produce practically identical
results. The choice only starts to matter when request duration varies a lot — then least
connections keeps one instance from accumulating long requests.

**Consistent hashing** is the conceptual exception: it exists to preserve locality, not to
balance. It is what enables a local cache per key and stateful partitioned systems.

### The health check is the decision that matters

A balancer needs to know which instances can receive traffic. How it knows is what decides
whether it helps or hinders.

**Shallow check** — is the process responding? It detects a dead process and does not detect
an instance that lost the database.

**Deep check** — are the dependencies reachable? It detects more and creates a risk: if the
database goes down, all instances fail at the same time and the balancer takes them all out
of service, turning degradation into total unavailability.

The practice that solves it: **two separate checks.** A shallow one for the balancer — "can I
receive traffic?" — and a deep one for alerts — "am I healthy?".

And the balancer needs a floor: if all of them fail, it is better to send traffic to all of
them than to none.

### Instances entering and leaving

A new instance should not receive full load immediately: cold cache, unwarmed pools, code not
yet optimized by the virtual machine. A gradual ramp-up keeps it from receiving traffic and
failing.

An instance leaving needs to finish what it started. Graceful shutdown — stop accepting new
requests, finish the in-flight ones, and only then terminate — is what avoids errors on every
deployment.

### The balancer is a component

It has capacity, a failure mode and needs to be redundant. A single balancer has merely moved
the single point of failure.

## Mental Model

**The balancer answers two questions: who can receive, and who receives now.** The first is
the health check and it matters more.

## When to Use

- There is more than one instance of the same service.
- You need to scale horizontally.
- The failure of one instance cannot take down the service.
- Deployment with no downtime is a requirement.

## When Not to Use

**With one instance.** The balancer adds a hop and distributes nothing.

**As a solution for slowness.** Distributing load makes nothing faster; if all instances are
slow for the same reason, adding more does not solve it.

**With session affinity as the default.** It is a workaround for local state. See
[stateless vs. stateful](/05-system-design/stateless-vs-stateful.md).

**With no health check configured.** It is the worst of both worlds: traffic sent to dead
instances.

## Alternatives

- **DNS with multiple records** — coarse distribution, no health checking, with client
  caching getting in the way.
- **Client-side service discovery** — the client picks the instance. Common in a
  [service mesh](/08-integration-architecture/index.md).
- **Queue** — when the work can be asynchronous, the queue distributes on its own and absorbs
  peaks.

## Trade-offs

| With a balancer | Single instance |
|---|---|
| Horizontal scaling | Limited by one machine |
| Instance failure tolerated | Single point |
| Deployment with no downtime | A downtime window |
| One more network hop | Direct |
| One more component to operate | None |
| Requires statelessness | Local state is possible |

## Failure Modes

**Health check too shallow.** Traffic to an instance that does not work.

**Deep check taking everything down.** A dependency goes down, all instances fail, the
balancer takes them all out of service.

**New instance receiving full load.** It fails right after starting.

**No graceful shutdown.** Errors on every deployment.

**Non-redundant balancer.** The single point moved.

**Affinity unbalancing.** Older instances overloaded.

## Common Mistakes

**Discussing the algorithm before the health check.** The choice between round-robin and
least connections changes little; sending traffic to a sick instance changes everything. The
order of the conversation is inverted in most teams.

**A single check, serving both the balancer and the alerts.** They are different questions:
the balancer asks "can I send traffic now?" and the alert asks "is something wrong?".
Unifying them produces either overly aggressive removal or late alerts.

**Not configuring ramp-up or graceful shutdown.** The new instance receives full load before
warming up its cache and connections, and the one leaving drops in-flight requests. Both show
up as client errors throughout every deployment.

**Using affinity instead of removing local state.** Affinity solves the symptom and preserves
the cause: the instance remains irreplaceable, which reappears as lost sessions on every
failure and as unbalanced load.

**Forgetting that the balancer has a capacity limit.** It is a component with connection and
bandwidth limits like any other — and it is the point every bit of traffic passes through, so
saturating it takes down the whole set it was supposed to protect.

## Real-World Example

A system with twelve instances suffered a total 40-minute outage caused by its own health
check.

The health endpoint queried the database. When the database had a 30-second degradation, the
twelve instances failed simultaneously. The balancer removed them all and started returning
errors for all traffic.

The database recovered in 30 seconds. The system did not — the instances had to pass three
consecutive successful checks to come back, and the mass return generated a wave of
reconnections that took the database down again.

The cycle repeated for 40 minutes.

Three fixes.

The balancer's check became shallow — it only confirms the process responds. The deep one
still exists, but it feeds alerts, not routing decisions.

A floor was configured: if fewer than 50% of instances pass, the balancer keeps them all in
service. Degrading while serving is better than not serving.

And the return became staggered, with ramp-up, so as not to generate a wave.

What caused the incident was not the database — it was 30 seconds of degradation. It was the
health check turning partial degradation into total unavailability.

## Layer 4 and layer 7

Balancers operate at two levels, and the choice changes what is possible.

**Layer 4** routes by address and port, without opening the content. Fast, cheap, works for
any protocol — and knows nothing about the request.

**Layer 7** understands the protocol. It can route by path, by header, by method; it can
rewrite, compress, terminate TLS and retry a failed request.

| | Layer 4 | Layer 7 |
|---|---|---|
| Routes by | Address and port | Request content |
| Cost | Minimal | Processing per request |
| Terminates TLS | No | Yes |
| Retries a request | No | Yes |
| Protocol | Any | The one it understands |

The ability to **retry** is the most consequential difference. A layer 7 balancer that
receives an error from one instance can try another before returning a failure to the client —
which turns a faulty instance into extra latency instead of a visible error.

That is only safe for idempotent requests. Retrying a `POST` that was already processed
duplicates the effect, and most balancers retry only methods considered safe by default —
which needs to be checked, not assumed.

In practice, HTTP systems use layer 7 at the edge and frequently layer 4 further in, where
the cost per request matters more than the intelligence.

## Related Concepts

- [Stateless vs. Stateful](/05-system-design/stateless-vs-stateful.md) — a prerequisite for
  distributing freely.
- [Rate Limiting](/05-system-design/rate-limiting.md) — another function frequently at the
  same point.
- [Reliability](/12-reliability/index.md) — health checks and degradation.
- [Scalability](/11-scalability/index.md).

## Practical Exercise

Check your system's health endpoint: does it query external dependencies?

If so, simulate one of them being unavailable and observe what the balancer does. If it
removes all instances, you have the same incident waiting.

## Interview Questions

- Why does the health check matter more than the algorithm?
- What is the risk of a deep health check?
- What is consistent hashing and when is it necessary?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — the chapter on load
  balancing and health checking.
- Nygard, Michael. *Release It!* 2nd ed., 2018.
