---
id: rate-limiting
title: Rate Limiting
sidebar_position: 13
description: Limiting the pace of requests — capacity protection before it is commercial policy.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses the algorithm and the limiting dimension from what
  they are protecting, and communicates the limit in an actionable way.
prerequisites: [load-balancing]
related: [queues, load-balancing, security]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Rate Limiting

## Overview

Rate limiting restricts how many requests a client can make in an interval.

Before being commercial policy — plans with different quotas — it is **capacity
protection**: with no limit, one client alone can consume the whole resource and take the
service down for everyone else.

## Problem

A system has finite capacity. With no pace control, three things take it down.

**A misbehaving client.** A buggy loop making a thousand requests per second. It is rarely
malice; it is almost always a bug.

**Cascading retries.** A slow service makes clients retry, which increases the load, which
makes it slower. See
[retry storms](/12-reliability/index.md).

**Uneven usage.** One large client consumes what was sized for everyone.

With no limit, the system discovers saturation by going down — and it goes down for everyone,
not just for whoever caused it.

## Core Concepts

### The algorithms

| Algorithm | How it works | Characteristic |
|---|---|---|
| **Fixed window** | N requests per clock minute | Simple; allows a burst at the boundary between windows |
| **Sliding window** | N in the last 60 seconds | Precise; more expensive to compute |
| **Token bucket** | Tokens refilled at a constant rate; each request spends one | Allows a burst up to the bucket size |
| **Leaky bucket** | Requests leave at a constant rate | Smooths; queues instead of rejecting |

**Token bucket** is the most used, and the reason is that it allows a controlled burst —
which corresponds to real usage, in which clients make several requests together and then go
quiet. Limiting rigidly per second rejects legitimate behavior.

The fixed window has a well-known defect: with a limit of 100 per minute, a client can make
100 in the last second of one window and 100 in the first of the next — 200 in two seconds.

### The dimension matters more than the algorithm

Limiting **by what** decides whether the protection works:

**Per authenticated client.** The common case. Fair and it requires authentication.

**Per IP address.** It works for unauthenticated traffic, and it punishes users behind the
same IP — companies, mobile carriers.

**Per endpoint.** A search costs more than a simple read; uniform limits protect badly.

**Per estimated cost.** Instead of counting requests, counting units of work. It is what
mature APIs do, and it is what best corresponds to real capacity.

Limiting per request when the cost varies by orders of magnitude protects little: a thousand
cheap requests pass and ten expensive ones take it down.

### Communicating the limit is part of the contract

Rejecting with no information forces the client to guess. The minimum:

```text
429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735689600
```

`Retry-After` is what keeps the rejected client from retrying immediately and making things
worse. Without it, rate limiting can increase the load instead of reducing it.

### Limiting is not the only answer

Rejecting is a choice. The alternatives:

**Queue.** Accept and process later, when the work is asynchronous. See
[queues](/05-system-design/queues.md).

**Degrade.** Serve a cheaper version of the response.

**Prioritize.** Reject low-priority traffic and keep the critical one. It is what allows a
saturated system to keep serving what matters.

## Mental Model

**Rate limiting is the decision of who fails when not everyone fits.** Without it, the answer
is "everyone".

## When to Use

- A public API or one exposed to clients you do not control.
- An expensive resource that needs protection.
- There are commercial plans with quotas.
- Protection against abuse and enumeration.
- Consuming an external service that has its own limit — limiting on your side avoids being
  blocked.

## When Not to Use

**Between trusted internal services, with no need.** It adds a point of failure and a
configuration to get wrong. There, [backpressure](/06-distributed-systems/index.md) and a
circuit breaker solve it better.

**As a substitute for capacity.** If the limit has to be so low that it makes legitimate use
unviable, the problem is sizing.

**Without communicating.** An opaque rejection makes the client retry.

**Uniformly, when the cost varies a lot.** It protects badly.

**As the only defense against abuse.** An attacker distributes the origin.

## Alternatives

- **Queue** — when the work is asynchronous.
- **Prioritization and load shedding** — reject the least important first.
- **Quotas over a long period** — monthly instead of per second, when what matters is total
  consumption.
- **[Backpressure](/06-distributed-systems/index.md)** — the mechanism between internal
  components.

## Trade-offs

| With a limit | With no limit |
|---|---|
| One client does not take down the rest | It does |
| Predictable capacity | Discovered at saturation |
| A legitimate client can be rejected | Never rejected, until the system goes down |
| Shared state to maintain | None |
| One more configuration to calibrate | None |

## Failure Modes

**Shared limit badly implemented.** Counting in local memory with several instances produces
an effective limit equal to N times the configured one.

**Rejection with no `Retry-After`.** The client retries immediately.

**Limit too low.** Legitimate use blocked; support becomes the bottleneck.

**Per-IP limit punishing sharing.** A whole company blocked because of one user.

**The limiter becomes the bottleneck.** The component that counts requests saturates before
the service does.

## Common Mistakes

**Counting in local memory.** See
[stateless vs. stateful](/05-system-design/stateless-vs-stateful.md).

**Not returning `Retry-After`.**

**A uniform limit for endpoints of very different cost.**

**Not monitoring how many rejections are happening.** Without that, nobody knows whether the
limit is protecting or getting in the way.

**Applying it before authentication and then forgetting to apply it per client.**

## Real-World Example

A credit lookup API had a limit of 100 requests per minute per client, in a fixed window,
counted in memory.

Three problems.

**The limit was not 100.** With six instances, each one counted separately. The effective
limit was 600, and the sizing had been done for 100 per client.

**A burst at the window boundary.** A client discovered it could make 100 at second 59 and 100
at second 61. Two hundred in two seconds, and the credit bureau service behind it — which had
its own limit — blocked the whole company's account for excess.

**Uniform cost.** A simple lookup and a lookup with full history counted the same, but the
second cost 40 times more at the bureau. A client making 100 full lookups per minute exhausted
the monthly quota in days.

The fixes.

The counting moved to the distributed cache, and the algorithm changed to a token bucket —
which allows a burst up to the bucket size and then enforces the average rate, without the
fixed window's defect.

The limit started counting **cost units**, not requests: a simple lookup costs 1, a full
lookup costs 40. The client has a budget per minute and spends it according to what it asks
for.

And the responses started carrying `Retry-After` and the quota headers, with documentation
explaining the cost of each operation.

What solved the commercial problem was the third change: clients started seeing the cost of
what they asked for, and full-lookup usage dropped 60% without anyone being blocked — because
they started asking for the full one only when they needed it.

## Related Concepts

- [Load Balancing](/05-system-design/load-balancing.md) — frequently at the same point.
- [Queues](/05-system-design/queues.md) — queue instead of rejecting.
- [Reliability](/12-reliability/index.md) — retry storms and load shedding.
- [Security](/10-security/index.md) — protection against abuse.

## Practical Exercise

Check your system's rate limiting: is the counting shared between instances? Does the response
carry `Retry-After`? Is the cost of the endpoints comparable?

Then look at the rejection metric. If it does not exist, you do not know whether the limit is
protecting anyone or blocking legitimate clients.

## Interview Questions

- What is the fixed window's defect and how does a token bucket avoid it?
- Why limit by cost instead of by request?
- Why does `Retry-After` matter?

## Further Reading

- Nygard, Michael. *Release It!* 2nd ed., 2018.
- RFC 6585 — Additional HTTP Status Codes, which defines the 429.
