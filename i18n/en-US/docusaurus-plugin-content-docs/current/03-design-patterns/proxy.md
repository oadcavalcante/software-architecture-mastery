---
id: proxy
title: Proxy
sidebar_position: 12
description: A stand-in that controls access to the real object — and the four variants with different costs.
doc_type: pattern
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distinguishes the Proxy variants and recognizes when the
  pattern's transparency hides too much cost.
prerequisites: [decorator]
related: [decorator, adapter, facade]
canonical_for: [proxy]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Proxy

## Overview

Proxy provides a stand-in that controls access to another object, implementing the
same interface.

What distinguishes Proxy from [Decorator](/03-design-patterns/decorator.md) —
structurally identical — is intent: Decorator adds behaviour the client wants; Proxy
controls access, and the client frequently does not know it exists.

That transparency is the pattern's strength and its risk.

## Problem

Direct access to the real object is undesirable for some reason: it is expensive to
create, it is on another machine, it requires a permission check, or its lifecycle
needs managing.

The client should not have to deal with that. The proxy takes it on, keeping the same
interface.

## Core Concepts

### The four variants

The GoF distinguishes four, with quite different cost profiles.

**Virtual** — defers creating the real object until first use. Used for expensive
objects: a high-resolution image, an aggregate with many relations.

**Remote** — locally represents an object in another process or machine. It is what
makes a network call look like a method call — and it is the most dangerous variant,
for the reason below.

**Protection** — checks permission before delegating.

**Smart** — adds management: reference counting, on-demand loading of fields, access
logging.

### Transparency hides cost

The remote proxy is the canonical example of the problem, and it is one of the most
important lessons in distributed systems.

A call that looks local may be a network request with latency, timeouts and the
possibility of partial failure. The code does not distinguish, and the developer
reasons as if it were local — calling in a loop, without failure handling, without
considering latency.

It is the origin of the *fallacies of distributed computing*: the network is
reliable, latency is zero, bandwidth is infinite. A remote proxy actively invites
believing them.

See [distributed systems](/06-distributed-systems/index.md).

### The virtual proxy and the N+1 problem

The virtual proxy in object-relational mappers produces the most common performance
defect in business applications: a loop over a hundred orders, accessing
`order.getCustomer()`, fires a hundred queries — because each access to the proxy
loads on demand.

The code looks like it is walking a list in memory. It is making a hundred round
trips to the database.

## When to Use

- **Virtual:** the object is demonstrably expensive and frequently not used.
- **Protection:** the access control is uniform and can be applied at the boundary.
- **Smart:** it is necessary to instrument or manage access in a cross-cutting way.
- **Remote:** when the framework already offers it and the team understands the
  costs.

## When Not to Use

**A remote proxy without the cost being explicit.** This document's strong
recommendation: in new code, prefer the remote call to **look** remote. A client that
returns an asynchronous result or a type representing the possibility of failure
communicates what is happening.

**A virtual proxy on a hot path.** That is where N+1 is born.

**Protection that should be explicit.** Authorization hidden in a proxy is hard to
audit. When someone asks "who can do this?", the answer has to be visible.

**When the real object is cheap.** The indirection costs more than the creation.

**When the smart variant accumulates responsibility.** A proxy that logs, measures,
caches and validates has become a badly named stack of decorators.

## Alternatives

- **Explicit loading** — `repository.findWithCustomer(id)` rather than a virtual
  proxy. More verbose and free of surprises.
- **[Decorator](/03-design-patterns/decorator.md)** — when the behaviour is the
  client's choice.
- **An explicit asynchronous client** — for remote calls.
- **A permission check at the entry point** — visible and auditable.

## Trade-offs

| Proxy | Direct access |
|---|---|
| Client does not change | Client deals with the cost |
| Cross-cutting control in one place | Replicated |
| Real cost invisible | Cost explicit |
| Indirect debugging | Direct |
| Invites wrong reasoning | No such trap |

The third row is the decisive one and it cuts both ways: invisibility is convenience
when the cost is irrelevant, and a trap when it is not.

## Failure Modes

**N+1 from on-demand loading.** The most expensive and most common failure mode.

**A remote call treated as local.** Loops over remote proxies, with no failure
handling and no consideration of latency.

**A proxy that changes the semantics.** Returns null or throws where the real object
would not.

**Broken identity.** Comparisons and type checks fail because the visible object is
the proxy.

**Lazy initialization out of context.** The proxy tries to load when the session or
transaction has already closed.

## Common Mistakes

**Confusing it with Decorator.** Different intent.

**Using a virtual proxy without understanding N+1.** Loading on demand inside a loop
turns one query into one per element, and the cost only shows with volume — in
development, with ten records, the pattern seems to work.

**Hiding a remote call behind a local interface.** The caller sees neither latency nor
the possibility of failure, and writes the code as if it were memory: no timeout, no
retry, inside a loop. It is the first fallacy of distributed computing packaged in a
pattern.

**Putting authorization in a proxy without making it auditable.** The decision to
allow or deny sits at a point that does not record who asked for what, and the
question "who accessed this?" comes to have no answer.

## Where it appears in practice

**Object-relational mappers.** Relations loaded on demand are virtual proxies. It is
the most widespread use and the one that causes the most performance problems.

**Remote calls in older frameworks.** RMI, CORBA and some RPC clients generate proxies
that make the network look local. The modern trend is the opposite — clients that
return asynchronous types.

**Dependency injection containers.** Many wrap objects in proxies to apply
transactions, security and caching — which is the smart variant, frequently invisible
to whoever writes the code.

**Service meshes.** The *sidecar* is a network proxy: it intercepts traffic to apply
policy, telemetry and retries. See
[service mesh](/08-integration-architecture/index.md).

The last is the case where transparency works well, and it is worth understanding why:
the proxy operates at the network layer, where the developer **already knows** they are
making a remote call. The problematic illusion does not exist.

## Real-World Example

An order listing screen became ten times slower after a change that looked harmless:
adding the customer's name to the listing.

The code walked the orders and accessed `order.getCustomer().getName()`. With a
virtual proxy, each access fired a query. Fifty orders per page became fifty-one
queries.

The immediate fix was loading explicitly in the original query.

The structural fix came later and is the interesting part: the team started using
explicit projections for listing screens — a type containing exactly the fields the
screen shows, obtained in one query.

That eliminated the entire category of defect, because there is no proxy to fire. The
cost became visible in the query, which is where it belongs.

## Related Concepts

- [Decorator](/03-design-patterns/decorator.md) — same structure, different intent.
- [Adapter](/03-design-patterns/adapter.md) — changes the interface.
- [Facade](/03-design-patterns/facade.md) — simplifies a subsystem.
- [Distributed Systems](/06-distributed-systems/index.md) — why remote transparency is
  dangerous.

## Practical Exercise

If your system uses an object-relational mapper, pick the slowest screen and count how
many queries it fires.

If the number grows with the quantity of items displayed, you have found an N+1 caused
by a virtual proxy.

## Interview Questions

- What are Proxy's variants and what does each one solve?
- Why is making a remote call look local problematic?
- How does the virtual proxy cause the N+1 problem?

## Further Exploration

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
- Deutsch, Peter; Gosling, James. *The Fallacies of Distributed Computing*,
  1994–1997.
