---
id: services
title: Services
sidebar_position: 3
description: Components with their own process — what changes when the call crosses the network.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes what a service adds over a module and decides
  granularity from reasons, not from size.
prerequisites: [components]
related: [apis, service-boundaries, microservices]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Services

## Overview

A service is a component with its own process, accessed over the network, with an
independent deployment cycle.

The difference between a service and a module is not conceptual — it is
**physical**, and it is what determines all the additional cost.

## Problem

The word "service" is used for very different things: a class called
`OrderService`, a separate process, an entire system belonging to another area.

The confusion matters because the cost of each differs by orders of magnitude.

Calling a method on `OrderService` in the same process costs nanoseconds and cannot
fail due to the network. Calling a remote service costs milliseconds, can time out,
can fail partially, and requires serialization, authentication, retries and
correlated observability.

This document deals with the second case. The first is a
[domain service](/04-domain-driven-design/domain-service.md) or an
[application service](/04-domain-driven-design/application-service.md).

## Core Concepts

### What a service adds

Over a module, a service brings:

**Its own deployment cycle.** It is the main benefit and what justifies most
separations.

**Resource isolation.** Separate memory, CPU and connections. One service does not
take down another through exhaustion.

**Independent scaling.** Instances per service, according to each one's load.

And it charges:

**Latency.** Every call is a network round trip.

**Partial failure.** The third possible outcome of a call: I don't know. See
[distributed systems](/06-distributed-systems/index.md).

**A public contract.** Versioned, with compatibility to maintain.

**Operations.** Pipeline, alerts, on-call, distributed tracing.

### Granularity comes from a reason, not from size

"Micro" is not a criterion. A service should be as large as the business boundary it
serves.

The reasons that justify separating are the same as in
[component design](/02-software-design/component-design.md): an independent
lifecycle, a distinct quality requirement, an organizational boundary, or external
consumption.

Without one of them, the service adds cost and buys nothing.

### Services call services — and that is the problem

A chain of synchronous calls between services multiplies the probability of failure
and adds up the latencies.

```text
5 services in a chain, each with 99.9% availability
  → chain availability ≈ 99.5%
  → from 43 minutes of unavailability per month to 3.6 hours
```

And each one adds its latency to the total. The chain is as slow as the sum, and as
available as the product.

That is the strongest argument against excessive granularity, and what makes
asynchronous communication attractive when the response is not needed immediately.

### A service owns its data

The rule that admits no exception: no service accesses another's database.

Sharing a database produces all the coupling of a monolith, with all the cost of
distribution, and with no contract. It is the worst possible combination, and it is
common.

## Mental Model

**A service is a module that earned the right to be deployed on its own.** That right
is earned for a specific reason, not granted by code organization.

## When to Use

- An independent deployment cycle is necessary.
- A scale, memory or failure requirement distinct from the rest.
- Different teams need release autonomy.
- External consumers need the capability isolated.
- The boundary has already proven stable as a module.

## When Not to Use

**By size or by code organization.** Modules solve that.

**Before the boundary has proven itself.** Moving a boundary between modules is
refactoring; between services, it is a data migration.

**When both sides are always deployed together.** The separation is not exercised,
and the cost is paid in full.

**When the unavailability of one makes the other useless.** There is no real failure
isolation — there are two points of failure where there was one.

**When the team cannot operate one more.** Each service adds on-call, alerts and
diagnosis time.

## Alternatives

- **A module in the same process** — the answer in most cases.
- **[Modular monolith](/03-design-patterns/modular-monolith.md)** — logical isolation
  with no network cost.
- **Published library** — its own release cycle without a separate process.
- **A separate process with no API** — a queue consumer, for example, which isolates
  resources without creating a synchronous contract.

## Trade-offs

| Service | Module |
|---|---|
| Independent deployment | Joint |
| Isolated scale and failure | Shared |
| Call with latency and failure | Function call |
| Versioned public contract | Refactorable |
| Local transaction impossible between them | Possible |
| One more item in operations | None |

## Failure Modes

**Distributed monolith.** Services always deployed together, with a synchronous
chain.

**Shared database.** Coupling with no contract.

**Long chain.** Latency added, availability multiplied.

**Service with no owner.** Nobody answers for the lifecycle.

**Contract broken with no notice.** A change that takes down consumers the team did
not know about.

## Common Mistakes

**Calling a class a service.** The distinction is physical.

**Deciding granularity by size.**

**Sharing a database.**

**Chaining synchronous calls.** Each link multiplies the risk.

**Not measuring whether the separation is exercised.**

## Real-World Example

An insurance system had seven services. A quote crossed five of them in a synchronous
chain: portal → quote → registry → risk → price table.

Average latency: 1.8 seconds. The requirement was 800 ms.

The analysis showed that each service responded in about 200 ms — none was slow. The
time was the sum of network, serialization and waiting.

And availability: five services at 99.9% produced 99.5% at the edge, against the
99.9% contracted with brokers.

The fix had two parts.

`Registry` and `Risk` were consolidated — they were always called together, always
deployed together, and history showed 90% joint changes.

And the price table lookup became a local copy in `Quote`, updated by event. The table
changed twice a month; querying it on every quote was a network round trip for
practically static data.

Result: chain from five to three, latency to 620 ms, availability to 99.7% — and the
rest came from retries with a [circuit
breaker](/12-reliability/circuit-breakers.md).

No service became faster. It was the architecture of the call that changed.

## Discovery and addressing

A service that calls another needs to know where it is. The answer changes as
instances come and go.

**A fixed address in configuration.** It works when the instances are stable, and
breaks with autoscaling.

**DNS.** The name resolves to the active instances. Simple and subject to client
caching — a removed instance keeps receiving traffic until the cache expires.

**Service registry.** Instances register when they start and remove themselves when
they leave. The client queries it. It solves the caching problem, and adds a stateful
component that has to be reliable.

**Platform.** Kubernetes and equivalents do this natively: a stable name that routes
to the healthy instances. It is the path of least friction when the platform already
exists.

What decides between them is how much the instances change. In an environment with a
fixed number of machines, configuration is enough and is the most predictable option.
With autoscaling, the address changes several times a day and only the last two work.

It is worth noting that discovery answers **where**, not **whether it is healthy**.
The two questions are distinct, and answering the first without the second sends
traffic to instances that started and are not ready yet.

## Related Concepts

- [Components](/05-system-design/components.md) — the general concept.
- [APIs](/05-system-design/apis.md) — the contract between services.
- [Service Boundaries](/05-system-design/service-boundaries.md) — where to separate.
- [Microservices](/03-design-patterns/microservices.md) — the style.

## Practical Exercise

If your system has services, measure for the most important flow: how many services
does it cross in a synchronous chain?

Multiply the individual availabilities and add up the latencies. Compare with the
requirement.

## Interview Questions

- What does a service add over a module, and what does it charge?
- Why is a chain of five services less available than each one of them?
- What does it mean for two services to share a database?

## Further Reading

- Newman, Sam. *Building Microservices*. 2nd ed., O'Reilly, 2021.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018.
