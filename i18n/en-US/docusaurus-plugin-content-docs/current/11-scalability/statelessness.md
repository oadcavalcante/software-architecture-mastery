---
id: statelessness
title: Statelessness
sidebar_position: 3
description: Horizontal scaling's prerequisite — and the places where state hides.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies state hidden in the process and chooses where to
  externalize it.
prerequisites: [horizontal-scaling]
related: [horizontal-scaling, scaling-load-balancing, scaling-cache]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Statelessness

## Overview

A stateless component keeps nothing between requests that is necessary to serve the next one. Any instance
can serve any request, and losing an instance loses nothing.

The fundamentals are in [stateless and stateful](/05-system-design/stateless-vs-stateful.md). Here what
matters is the scale angle: **it is horizontal scaling's prerequisite**, and the state is usually hidden in
places nobody lists.

## Problem

The claim "our application is stateless" is made frequently and verified rarely.

The test is simple and merciless: **turn off an instance in the middle of traffic and see what breaks**. If
any user loses a cart, has to log in again, or sees an error they would not otherwise see, there is state.

The places where it hides are few and always the same — and each one limits the scale in a different way.

## Core Concepts

### Where the state hides

```text
a session in memory        the classic — cart, login, multi-step form
an authoritative local cache  when the value exists nowhere else
a file on disk             a temporary upload, a generated report, a log
a persistent connection    WebSocket, event stream, a long-lived connection
a scheduler in memory      a task set for an hour from now
a counter or accumulator   a statistic kept in the process
work in progress           long processing started in a request
```

The last three are the least remembered. A scheduler in memory vanishes with the instance — and the task
never executes, with no error at all.

### Session affinity is the patch

Configuring the load balancer to always send the same user to the same instance solves the symptom and
keeps the problem.

What it costs:

**Uneven distribution.** The traffic follows the sessions, not the load. New instances receive little,
because they have no established sessions.

**Loss on failure.** The instance goes down and its sessions vanish.

**Deployment with impact.** Restarting an instance drops its users.

**Ineffective scaling.** Adding capacity does not relieve the already loaded instances.

It is acceptable as a temporary measure, with a deadline. As a permanent solution, it is the reason
horizontal scaling does not work.

### Where to externalize

```text
sessions           a key-value store with expiration
files              object storage
work in progress   a queue, with persisted state
scheduling         an external scheduler or a queue with a delay
cache              a shared cache, or a non-authoritative local one
counters           a store with an atomic operation
```

The point about local cache deserves a note: a local cache is **legitimate and desirable**, as long as it
is only a copy — the value needs to exist at the source, and losing the cache may degrade performance,
never correctness. See [caching for scale](/11-scalability/scaling-cache.md).

### Persistent connections are state by nature

A long-lived connection — WebSocket, event stream, real-time notification — lives on a specific instance.
That is state, and the connection cannot be externalized.

What gets externalized is the **routing**: a record of which instance holds which connection, and a channel
to deliver messages to that instance.

That changes the design: the connection layer comes to be separate from the logic layer, and each one
scales differently. Treating them together limits both.

### Graceful shutdown completes the property

Being stateless is not enough if the instance dies in the middle of a request.

The necessary behavior: stop accepting new requests, leave the load balancing, finish the ones in flight,
and only then terminate.

Without that, every scaling event — which should be routine — loses requests. See
[cloud compute](/09-cloud-architecture/cloud-compute.md).

### The cost is real

Externalizing state adds a network round trip on each access.

```text
a session in memory      ~0.001 ms
a session in a remote cache  ~1 ms
```

A thousand times slower in relative terms, and irrelevant in absolute terms for most applications — a
request that takes 50 ms does not change because of 1 ms.

Where it matters: very hot paths, with multiple accesses per request. The way out is a
**non-authoritative** local cache of what was read from the external store, with a short lifetime.

## Mental Model

**Stateless means that losing the instance loses no information.** If it loses something, there is state —
regardless of what the documentation says.

## When to Use

- Horizontal scaling is necessary or likely.
- Deployment with no interruption is a requirement.
- The instances are ephemeral — containers, interruptible capacity.
- Instance failure tolerance matters.
- Automatic elasticity is used.

## When Not to Use

**Intrinsically stateful components** — databases, caches, coordination systems. They have their own
strategies.

**Session affinity as a permanent solution.**

**Externalizing a local cache that is only a copy.** That is a legitimate optimization.

**When the additional latency matters** on the critical path — there the answer is a non-authoritative
local cache, not keeping the state.

**A single application, on one machine, with no plan to scale.** The cost does not pay off.

## Alternatives

- **State on the client**, signed — the server keeps nothing. Beware of size and of what is exposed. See
  [JWT](/10-security/jwt.md).
- **A local cache with invalidation** — performance with no authority.
- **A separate connection layer** — for persistent connections.
- **State in a queue** — for work in progress.

## Trade-offs

| Stateless | With state in the process |
|---|---|
| Any instance serves | Affinity necessary |
| Losing an instance loses nothing | It loses |
| Horizontal scaling works | Limited |
| External access latency | Local memory |
| Additional storage to operate | None |

| State on the client | On the server |
|---|---|
| Nothing to store | Storage to operate |
| Limited size | Unlimited |
| Visible to the client | Opaque |
| Difficult revocation | Immediate |

## Failure Modes

**A session lost when an instance goes down.**

**Uneven distribution from affinity.**

**A scheduled task that never executes.** The scheduler was in memory.

**A temporary file unreachable.** Another instance served the next request.

**A divergent local cache.** Two instances with different values, and neither is the source.

**Requests lost during deployment.** With no graceful shutdown.

**A counter reset to zero.** A statistic kept in the process.

## Common Mistakes

**Claiming it is stateless without testing.** The test is direct: kill an instance in the middle of use and
see whether anybody loses something. There is almost always a local state nobody remembered.

**Using session affinity permanently.** It masks the problem and preserves it: the instance stays
irreplaceable, the load stays unbalanced and losing one replica drops the sessions pinned to it.

**Storing an upload on a local disk.** The file exists only on that instance; the next request lands on
another and does not find it, and the next deployment deletes it.

**Scheduling in memory.** It vanishes on restart and executes once per instance. Both effects appear when
the system grows — exactly when nobody is looking at the scheduler.

**Treating the local cache as authoritative.** Instances diverge, and the user sees different responses on
each reload with nothing wrong in the source data.

**Not implementing graceful shutdown.** Without draining connections, every scale-down and every deployment
discards in-flight requests — which appear as intermittent errors with no apparent cause.

## Real-World Example

An education platform had an application declared stateless, running on eight instances with auto scaling.

A resilience test — turning off an instance during real traffic — revealed five kinds of state:

**A session in memory.** That instance's users were logged out. Session affinity was enabled on the load
balancer, and nobody on the current team knew why.

**A video upload on disk.** Uploads in progress were written locally before going to the definitive
storage. The partial files vanished, and the teachers had to re-upload.

**A live class connection.** That instance's persistent connections dropped, and students were disconnected
in the middle of class.

**Scheduling in memory.** Class reminders were scheduled with a timer in the process. That instance's
reminders were never sent — no error, no alert. It was discovered that this happened on every deployment,
for two years.

**A participant counter.** Kept in memory, per instance. The displayed number depended on which instance
served — and nobody had noticed because the divergence was small.

The fixes:

**Sessions in a shared cache**, with expiration. The affinity was removed from the load balancer, and the
load distribution improved immediately — the new instances started receiving traffic.

**Uploads directly to object storage**, with a signed URL. The local disk stopped being used.

**A separate connection layer** for the live classes, with a record of which node holds which connection
and automatic reconnection on the client. The class logic came to scale independently of the connections.

**Scheduling in a delayed queue**, persisted. That was the most relevant finding: two years of reminders
lost on every deployment, with no alert in existence.

**A counter in a store with an atomic operation.**

**Graceful shutdown**, with the node leaving the load balancing before terminating.

The test of turning off an instance took twenty minutes and found five problems, two of them in production
for years. It had never been done because "the application is stateless".

## Related Concepts

- [Horizontal Scaling](/11-scalability/horizontal-scaling.md) — what it enables.
- [Stateless and Stateful](/05-system-design/stateless-vs-stateful.md) — the fundamentals.
- [Balancing for Scale](/11-scalability/scaling-load-balancing.md) — the affinity.
- [Caching for Scale](/11-scalability/scaling-cache.md).

## Practical Exercise

Turn off a production instance in the middle of traffic, in a controlled window, and observe what breaks.

If nothing breaks, your application is stateless. If something breaks, you have found the state the
documentation does not mention.

## Interview Questions

- What is the test that verifies statelessness?
- Why does session affinity nullify much of horizontal scaling's gain?
- Why is a local cache legitimate and an authoritative local cache not?

## Further Reading

- Wiggins, Adam. *The Twelve-Factor App*, 2011 — processes and state.
- Fielding, Roy. *Architectural Styles*, 2000 — the statelessness constraint.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
