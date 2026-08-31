---
id: state-management
title: State Management
sidebar_position: 6
description: Where state lives and who owns it — the decision that determines how easy it will be to scale.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies a system's types of state and decides where each
  one should live.
prerequisites: [components]
related: [stateless-vs-stateful, caching, data-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# State Management

## Overview

State is everything the system remembers between one operation and another.

Deciding **where** each type of state lives is one of the most consequential decisions in
system design — it determines what can scale, what can fail without loss, and what needs
coordination.

## Problem

State tends to spread without anyone deciding.

A variable in memory holds the attempt counter. A session field holds the cart. A local
file holds the last processing run. A table holds the order.

Each one was reasonable in isolation. Together they produce a system in which restarting
a process loses information, adding an instance breaks the behavior, and nobody can list
what is lost in a failure.

The question that organizes it: **for each thing the system remembers, what happens if
the process dies right now?**

## Core Concepts

### The types of state

Not all state has the same requirement. Confusing them is the origin of most of the
problems.

| Type | Example | Loss acceptable? | Where it lives |
|---|---|---|---|
| **Persistent business state** | Order, customer, balance | Never | Database |
| **Session** | Cart, authentication | Depends on the product | Shared storage or token |
| **Cache** | Query result | Always | Memory or distributed cache |
| **In-flight** | An item in a queue being handled | Must be reprocessable | Queue with acknowledgment |
| **Ephemeral request state** | Variables of one call | Yes, along with the request | Local memory |

Cache is the only one whose loss is always acceptable — because it is derivable. If
losing the cache hurts, it was not a cache: it was state with the wrong name.

### Local state is what prevents scaling

An instance that keeps state in memory between requests creates three problems.

Requests from the same user have to come back to the same instance — which requires
session affinity in the load balancer and unbalances the load.

Restarting loses it. Every deployment becomes a loss of state.

And adding an instance does not distribute load evenly, because the state is already
somewhere else.

See [stateless versus stateful](/05-system-design/stateless-vs-stateful.md).

### Concentrate the state, keep the rest without it

The practical recommendation: **few stateful components, many stateless ones.**

The stateful ones — database, distributed cache, queue — are the hard ones to operate:
replication, recovery, consistency. Concentrating them means having a few hard places,
instead of difficulty spread everywhere.

Everything else handles requests without remembering anything, and scales by adding
instances.

### Session is the decision that raises the most doubt

Three options, with distinct trade-offs:

**On the server, in local memory.** Simple and prevents horizontal scaling.

**On the server, in shared storage.** It scales and adds a network call per request, plus
one more component to operate.

**On the client, in a signed token.** No state on the server, scales perfectly. And the
token cannot be revoked before it expires, and grows with what it carries.

The third is the most used in modern systems, and revocation is the problem it does not
solve — mitigated by a short expiry plus a revocation list for exceptional cases.

## Mental Model

**For each thing the system remembers: if this process dies right now, what is lost and
is that acceptable?**

The answer classifies the state and determines where it should live.

## When to Use

Local in-memory state is justified when:

- It is derivable and the loss is acceptable — a cache.
- It lives within one request.
- There is a single instance and there will continue to be.

## When Not to Use

**Business state in memory.** Lost on any restart.

**Session in local memory with multiple instances.** Requires affinity and breaks on
deployment.

**In-flight state with no acknowledgment.** An item taken off the queue and lost midway is
not reprocessed.

**Cache treated as the source of truth.** If losing the cache breaks the system, it was
not a cache.

**A local file in an environment with ephemeral instances.** Containers and functions lose
the disk.

## Alternatives

- **Database** — for state that cannot be lost.
- **Distributed cache** — for shared, disposable state.
- **Signed token** — for a session with no server-side state.
- **Queue with acknowledgment** — for in-flight state.
- **Do not keep it** — the most underestimated alternative: recomputing can be cheaper
  than managing.

## Trade-offs

| Local state | External state |
|---|---|
| Access in nanoseconds | Network call |
| No additional component | One more to operate |
| Prevents horizontal scaling | Scales freely |
| Lost on restart | Survives |
| No consistency to manage | Consistency between replicas |

## Failure Modes

**Loss on restart.** Deployment becomes an incident.

**Divergence between instances.** Each with its own version of the state.

**Session affinity unbalancing the load.** One instance overloaded and others idle.

**Cache becoming the source of truth.** Discovered when the cache is cleared.

**Orphan state.** Sessions that never expire, occupying memory.

## Common Mistakes

**Not classifying the state.** Without the types, all state gets the same treatment.

**Keeping business state outside the database.**

**Using session affinity as a solution.** It is a workaround, not a decision.

**Not setting an expiry.** All session and cache state needs a deadline.

**Putting too much state in the token.** It travels on every request.

## Real-World Example

A checkout system kept the cart in memory, with session affinity in the load balancer.

It worked with two instances. With eight, three problems appeared.

The load became uneven: older instances accumulated active sessions and the new ones sat
idle.

Every deployment dropped in-progress carts — and the team started deploying only
overnight, which reduced the delivery frequency.

And a Black Friday peak took down two instances on memory, taking with them the carts that
were on them.

The reclassification separated three things that had been mixed together.

**Identity and authentication** became a signed token with a 15-minute validity — no
server-side state.

**The cart** moved to the distributed cache with a 7-day expiry, because it is state the
business accepts eventually losing, but not on every deployment.

**Display preferences** — filter, sort order — moved to the client. They did not need the
server.

Session affinity was removed, the load balanced out, and deployments stopped losing carts.

The instructive part: none of this required new technology. The distributed cache already
existed in the system, used for something else. What was missing was having classified the
state.

## Comparing the session options

The decision of where to keep the session appears in almost every system, and the three
options have quite distinct profiles.

| | Local memory | Shared storage | Token on the client |
|---|---|---|---|
| Read latency | Nanoseconds | Network call | Local verification |
| Horizontal scaling | Requires affinity | Free | Free |
| Survives a restart | No | Yes | Yes |
| Revocation | Immediate | Immediate | Only on expiry |
| Size | No practical limit | No practical limit | Travels on every request |
| Additional component | None | One | None |

The revocation line usually decides. Systems with an immediate-blocking requirement —
financial, healthcare, any context with a regulatory consequence — cannot depend on expiry
alone.

The combination most mature systems adopt solves that: a short token for access, with
revocable state on the server for renewal. The frequent path is stateless; the rare one
queries.

One trap with tokens: they travel on **every** request, including asset requests if the
client does not separate them. A 4 KB token on a page with 60 requests is 240 KB of headers
per load.

## Related Concepts

- [Stateless vs. Stateful](/05-system-design/stateless-vs-stateful.md) — the consequence
  for scaling.
- [Caching](/05-system-design/caching.md) — the disposable state.
- [Load Balancing](/05-system-design/load-balancing.md) — where affinity shows up.
- [Data Architecture](/07-data-architecture/index.md) — the persistent state.

## Practical Exercise

List everything your system remembers between requests.

For each item, answer: if the process dies right now, what is lost? Is that acceptable?
Where does it live today?

The items whose loss is not acceptable and that live in local memory are the ones that will
cause the next deployment incident.

## Interview Questions

- What are the types of state and what distinguishes them?
- Why does local state prevent horizontal scaling?
- What are the options for sessions and what does each one cost?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!* 2nd ed., 2018.
