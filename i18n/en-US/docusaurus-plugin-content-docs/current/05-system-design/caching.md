---
id: caching
title: Caching
sidebar_position: 9
description: Keeping a result so you do not recompute it — and invalidation, which is the real problem.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses a caching strategy from the access pattern and
  the tolerance for stale data, and knows why invalidation decides everything.
prerequisites: [state-management]
related: [cdn, load-balancing, scaling-cache]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Caching

## Overview

A cache keeps the result of an expensive operation to reuse it, trading **memory and
freshness** for **latency and load**.

It is the highest-return optimization in read-intensive systems. And the decision that
matters is not where to put the cache — it is **when the stored data stops being valid**.

## Problem

Caching is easy to add and hard to get right. The pattern that shows up:

Someone adds a cache to a slow query. It works — latency drops, database load drops.

Weeks later, a user complains that they changed a value and the screen still shows the old
one. Someone adds invalidation at that point.

Then another point. Then a third nobody remembered. In the end, the system has cache
invalidation in nine places, three of them inconsistent with each other, and nobody can
list what is cached and for how long.

**The hard part of caching is not storing. It is knowing when to discard.**

## Core Concepts

### The read strategies

| Strategy | How it works | Cost |
|---|---|---|
| **Cache-aside** | The application queries the cache; on a miss, it fetches from the origin and writes | The application controls it; the first read is slow |
| **Read-through** | The cache fetches from the origin itself | Less code; less control |
| **Refresh-ahead** | The cache refreshes before expiry | No first-read penalty; refreshes what nobody will read |

Cache-aside is the most used and the most predictable. The code is explicit about what is
cached.

### The write strategies

**Write-through** — writes to the cache and to the origin, synchronously. Consistent and
slower on writes.

**Write-behind** — writes to the cache and persists later. Fast and with a loss window.

**Write-around** — writes only to the origin, invalidating the cache. Simple, and the next
read pays.

The choice depends on how much you accept losing in a failure. Write-behind in a financial
system is a decision that has to be authorized by the business, not by engineering.

### Invalidation: the three approaches

**Time-based expiry (TTL).** The data is valid for N seconds. Simple, predictable, and it
serves stale data for up to N seconds.

**Explicit invalidation.** Whoever changes the data removes it from the cache. Precise, and
it requires every write path to know about the cache — which is where the errors live.

**Event-based invalidation.** Whoever changes it publishes; the cache reacts. It decouples
the write paths from the cache, at the cost of eventual consistency.

The practical recommendation: **start with a short TTL.** It is the only one with no
forgotten path, and most systems tolerate seconds of stale data. Explicit invalidation only
where the TTL is not enough.

### What decides: the tolerance for stale data

The question that precedes all the others: **how much stale data does the business accept,
for this specific data?**

A product catalog: minutes. An account balance: zero. A view counter: hours.

The answer defines the TTL and determines whether explicit invalidation is necessary.
Without it, the decision becomes preference.

### A cache is not the source of truth

If losing the cache breaks the system, it was not a cache — it was a database with no
durability. See
[state management](/05-system-design/state-management.md).

The test: clear the cache in production. If the system survives, slower, it is a cache. If
it breaks, it was state.

## Mental Model

**A cache is a bet that the data will not change before you use it again.** The TTL is the
size of the bet.

## When to Use

- The operation is expensive and the result is reused.
- The read-to-write ratio is high.
- The business tolerates some delay in the data.
- The origin is the proven bottleneck.

## When Not to Use

**When the read is already cheap.** The cache adds a network hop and a component.

**When the data changes on every read.** A hit rate near zero, at full cost.

**When the business does not tolerate stale data and invalidation would be fragile.** Better
not to have one than to have a cache that occasionally serves the wrong value in a context
that does not accept it.

**As a fix for a bad query.** A missing index solved with a cache hides the problem — and it
comes back when the hit rate drops.

**Without measuring first.** A cache added with no profiling frequently solves what was not
the bottleneck.

## Alternatives

- **Optimize the origin** — index, query, denormalization. Frequently enough and with no new
  component.
- **Read projection** — a model maintained for querying. See
  [CQRS](/03-design-patterns/cqrs.md) at level 2.
- **[CDN](/05-system-design/cdn.md)** — cache at the edge, for public content.
- **Client-side cache** — HTTP headers make the browser store it; it is the cheapest cache
  there is and the least used deliberately.

## Trade-offs

| With a cache | Without a cache |
|---|---|
| Lower latency | Always the origin's |
| Lower load on the origin | Every read arrives |
| Data can be stale | Always current |
| Invalidation to manage | Nothing to manage |
| One more component | Fewer pieces |
| Behavior varies with hit or miss | Predictable |

The last line is underestimated: a system with a cache has two performance profiles, and the
worse of them — a cold cache — is the one that shows up right after a restart or a peak.

## Failure Modes

**Stale cache served beyond what is acceptable.** Invalidation forgotten on one path.

**Cache flush.** The cache expires or is cleared, and all the load goes to the origin at
once. A peak the origin cannot take.

**Stampede.** Many requests for the same expired key, all recomputing at the same time.
Mitigated by a lock or by early refresh.

**Cache becoming the source of truth.** Discovered when it is cleared.

**Low hit rate.** All the cost, little benefit, and nobody measures it.

**Inconsistency between instances.** A local cache in several instances, each with its own
version.

## Common Mistakes

**Not measuring the hit rate.** It is the metric that tells you whether the cache is
serving.

**Not setting a TTL.** A cache with no deadline is a leak.

**Explicit invalidation as the first option.** A short TTL solves more and errs less.

**A local cache with multiple instances.** Guaranteed divergence.

**Not thinking about the cold cache.** Performance after a restart is what the user sees at
the worst moment.

## Real-World Example

A course platform added a cache to the catalog query — the slowest in the system, 900 ms.

With a one-hour TTL, latency dropped to 12 ms and database load dropped 70%.

Two problems appeared in the following months.

**The first:** instructors changed a course's description and the change took up to an hour
to appear. A recurring support complaint.

The initial fix was explicit invalidation on save. It worked until someone discovered there
were three change paths — the instructor panel, bulk import and administrative correction —
and only the first invalidated.

**The second:** during a deployment, all instances started with a cold cache
simultaneously. The catalog requests all went to the database at the same time, and it
saturated for four minutes.

The final fixes.

The TTL dropped to 60 seconds — the conversation with the business revealed that a minute
was perfectly acceptable, and nobody had asked before choosing an hour. That alone resolved
the complaint with no invalidation at all.

Explicit invalidation was kept only where it mattered, but moved to an event published by
the domain — so the three paths started invalidating without needing to know about the
cache.

And a stampede lock was added: on an expiry, only one request recomputes; the others wait
for the result.

What solved the main problem was not a mechanism. It was asking the business what delay was
acceptable — a question the original decision had skipped.

## Where the cache can live

A cache is not one place. Each layer has a different cost and reach, and the cheapest is the
one least used deliberately.

**In the browser.** HTTP headers make the client store it. Zero infrastructure cost, and the
request does not even leave the machine. It is the first to configure and the most forgotten.

**In the [CDN](/05-system-design/cdn.md).** Close to the user, shared among everyone. Only
for content identical for many.

**In the gateway.** Before reaching the application. Useful for public API responses.

**In the application, locally.** Nanoseconds of access, and each instance has its own —
guaranteed divergence with multiple instances.

**Distributed.** Shared between instances, with a network call. It is where most application
caches live.

**In the database.** The database's own page cache, which already exists and is well sized.
Frequently the problem attributed to a lack of caching is the database not having enough
memory to keep the index hot.

The order of evaluation should be top down — the cheapest answer first. The actual order is
usually to start with the distributed cache, which is the most visible.

## Related Concepts

- [State Management](/05-system-design/state-management.md) — cache as disposable state.
- [CDN](/05-system-design/cdn.md) — cache at the edge.
- [Scalability](/11-scalability/index.md) — caching as a scaling strategy.
- [CQRS](/03-design-patterns/cqrs.md) — projection as an alternative.

## Practical Exercise

List what is cached in your system. For each item: what is the TTL? What is the hit rate?
How much stale data does the business accept?

If you cannot answer the third question for some item, its TTL was chosen with no criterion.

## Interview Questions

- What is the hard problem in caching, and why?
- When is a TTL preferable to explicit invalidation?
- What is a stampede and how do you mitigate it?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!* 2nd ed., 2018 — caching and stability.
