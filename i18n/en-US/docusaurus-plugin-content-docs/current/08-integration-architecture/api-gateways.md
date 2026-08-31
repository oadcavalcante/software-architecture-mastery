---
id: api-gateways
title: API Gateways
sidebar_position: 9
description: One entry point for many APIs — what it really solves and how it becomes a bottleneck.
doc_type: pattern
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader knows what belongs in the gateway and what should never
  get into it.
prerequisites: [rest]
related: [service-mesh, rest, graphql]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# API Gateways

## Overview

An API gateway is a single entry point that sits in front of several services and concentrates what is
common to every call: authentication, rate limiting, routing, logging.

It solves a concrete problem — keeping each service from reimplementing the same edge concerns — and
creates an equally concrete risk: becoming the place where business logic accumulates until nobody can
change it.

The question that organizes everything: **is this an edge concern or a domain concern?**

## Problem

With several exposed services, each one needs authentication, rate limiting, cross-origin handling, logging
and metrics.

Implementing that in each service multiplies code and, worse, multiplies divergent versions: one service
validates the token one way, another another way, and a security fix has to be applied in twelve places.

The gateway centralizes it. And, in centralizing, it becomes the critical path of everything.

## Core Concepts

### What belongs in the gateway

Concerns that hold for every request, regardless of the domain:

```text
authentication      validate the token, reject the invalid one
routing             which service serves this path
rate limiting       per client, per route
TLS                 termination and certificates
logging and metrics uniform, in the same format
translation         REST at the edge, gRPC inside
compression         and content negotiation
```

They all have in common that they do not depend on a business rule.

### What does not belong

**Domain authorization.** The gateway can verify that the token is valid; it should not know that "a
manager can approve up to $2,000". That rule belongs to the domain, changes with the business, and in the
gateway it sits far from whoever understands it.

**Payload transformation with a rule.** Converting a format is fine; deciding what to send based on a
business condition is not.

**Orchestration across several services.** A gateway that calls three services and combines responses has
become an application. If that is necessary, it is a composition service — which may even sit behind the
gateway, but not *be* the gateway.

**State.** A cache is acceptable; business session state is not.

That is the boundary, and it is violated bit by bit: each exception looks small.

### Backend for frontend

A variation: instead of one generic gateway, one per client type.

```text
mobile app  → mobile BFF  → services
web         → web BFF     → services
partners    → public BFF  → services
```

Each one aggregates and formats for that client's needs, and is maintained by the team that builds that
client.

That solves the organizational bottleneck: the frontend team stops waiting on the platform team to change a
format.

The cost is duplication among the BFFs, and it is frequently acceptable — the alternative is a generic
gateway that serves everybody badly.

### It is a single point of failure by construction

All traffic passes through it. That demands the same care as any critical component: several instances,
stateless, health checking, and capacity sized for the aggregate peak.

And it demands attention to a specific failure mode: **one wrong configuration takes everything down**. A
badly written routing rule does not affect one service — it affects all of them.

That is why the gateway's configuration deserves the same process as code: review, versioning, a test
environment and gradual rollout.

### It does not solve service-to-service communication

A common confusion. The gateway handles the traffic that **enters** the mesh. Communication among internal
services goes another way.

Routing internal calls through the gateway adds a network hop, creates a dependency on an edge component
for internal operation and concentrates load that did not need to pass through there.

For the internal problem, see [service mesh](/08-integration-architecture/service-mesh.md).

### When it is not worth it yet

With two or three services and one client, a gateway is infrastructure to operate with no corresponding
problem. The load balancer you already have does routing, and authentication in a shared library covers the
rest.

The gateway pays for itself when the number of exposed services and clients grows to the point where the
duplication hurts.

## Mental Model

**The gateway handles edge concerns, not domain concerns.** Each business rule that gets into it is one
that leaves where it should be.

## When to Use

- Several externally exposed services.
- Uniform authentication and rate limiting.
- Diverse clients with different formatting needs.
- Translation between protocols — REST outside, gRPC inside.
- A single point for edge observability.
- A public API with partners and quotas.

## When Not to Use

**With few services and one client.**

**For traffic between internal services.**

**As an orchestration layer.**

**With domain authorization inside.**

**With no high availability.** A real single point of failure.

**As the place to "fix it quickly".** That is how it accumulates what it should not.

## Alternatives

- **A load balancer with routing** — covers the basics with no new component.
- **A shared library** — authentication and logging in each service, with no extra hop. It requires
  updating all of them on every change.
- **A [service mesh](/08-integration-architecture/service-mesh.md)** — for internal traffic.
- **A BFF** — instead of a generic gateway.

## Trade-offs

| With a gateway | Without |
|---|---|
| Centralized concerns | Duplicated per service |
| One place to change policy | Many |
| An additional network hop | Direct |
| A single point of failure | Isolated failures |
| Central configuration to govern | Autonomy per service |

| A generic gateway | A BFF per client |
|---|---|
| One component | Several |
| Serves everybody moderately | Each one well |
| The platform team is a bottleneck | Each team owns theirs |
| No duplication | Accepted duplication |

## Failure Modes

**A wrong configuration taking everything down.**

**Accumulated business logic.** Nobody knows what it does.

**A throughput bottleneck.** Undersized for the aggregate peak.

**Additional latency.** One more hop on every call.

**The platform team becoming an organizational bottleneck.** Every API change depends on them.

**Internal traffic passing through it.** Unnecessary coupling and load.

**Inconsistent authorization.** Part in the gateway, part in the service, and nobody knows the whole.

## Common Mistakes

**Putting a business rule in it.**

**Routing internal traffic.**

**Adopting it too early.**

**Configuration with neither review nor versioning.**

**Not sizing for the aggregate peak.**

**Letting the gateway be the only place with authorization.** See [security](/10-security/index.md) —
defense in depth requires the service to check too.

## Real-World Example

An insurance company introduced a gateway in front of nine exposed services.

The first two years were positive: uniform authentication, rate limiting per broker, consistent edge
metrics. The duplication that existed before disappeared.

Then, four problems:

**Rule accumulation.** Requests to "fix it quickly in the gateway" kept being accepted: a discount applied
by broker type, a transformation that hid fields according to the profile, a routing rule that depended on
the policy's value. In three years, the gateway had 4,000 lines of configuration with logic, and nobody
could say what happened to a request without executing it.

**Configuration taking production down.** A badly written routing rule — published directly, with no test —
left **all** nine services unreachable for 22 minutes. There was neither a test environment for the
configuration nor a gradual rollout.

**An organizational bottleneck.** The gateway was maintained by the platform team. Any contract change
required getting into their queue. A field change took three weeks, two of which were waiting.

**Split authorization.** Part of the rules were in the gateway, part in the services. An audit found an
endpoint where the check existed only in the gateway — and that was reachable internally without passing
through it.

The fixes, over a year:

**Business rules returned to the services.** The gateway's configuration fell from 4,000 to 600 lines. The
discount rule went back to the policy service, where the business team can read it.

**Configuration as code**, with review, a test environment and gradual rollout. Direct publishing stopped
being possible.

**BFFs per client** — broker, policyholder and partner — each maintained by the respective client's team.
The three-week bottleneck disappeared.

**Authorization in depth.** The gateway still checks, and each service checks too. The redundancy was
accepted consciously.

What the team records: the gateway was never a mistake. The mistake was not having a written rule about
what may get into it — and, with no rule, each individual exception was reasonable.

## Related Concepts

- [Service Mesh](/08-integration-architecture/service-mesh.md) — internal traffic.
- [REST](/08-integration-architecture/rest.md) and [GraphQL](/08-integration-architecture/graphql.md) —
  what it exposes.
- [Integration Contracts](/08-integration-architecture/integration-contracts.md).

## Practical Exercise

Open your gateway's configuration and look for any condition that depends on a business value — a profile,
an amount, a customer type.

Each one of those is a domain rule living at the edge, far from whoever understands it.

## Interview Questions

- What belongs in the gateway and what should never get into it?
- Why is routing internal traffic through it problematic?
- What problem does a BFF solve that a generic gateway does not?

## Further Reading

- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — chapter 8.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021.
- Calçado, Phil. *The Back-end for Front-end Pattern*, 2015.
