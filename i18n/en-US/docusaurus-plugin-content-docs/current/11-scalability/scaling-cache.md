---
id: scaling-cache
title: Caching for Scale
sidebar_position: 4
description: Removing work instead of adding capacity — and the failure modes that only appear under load.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader sizes a cache by its hit rate and avoids the collapses that
  only happen at scale.
prerequisites: [scalability]
related: [database-scaling, hotspots, statelessness]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Caching for Scale

## Overview

Caching is the highest-return technique at scale, because it **removes work** instead of adding capacity to
execute it.

The fundamentals — what to cache, invalidation, time to live — are in
[caching](/05-system-design/caching.md). Here what matters is what changes under high load: the failure
modes that only appear at scale, and that turn the cache from a solution into a cause of unavailability.

## Problem

A cache with a 90% hit rate reduces the load on the origin by 90%. One with 99% reduces it by 99% — ten
times more.

That non-linearity has a dangerous side: the origin comes to be sized for the load **with** the cache. When
the cache fails, the load that arrives is ten or a hundred times larger than the origin can take.

The cache stops being an optimization and becomes a critical dependency — without anybody having decided
that.

## Core Concepts

### The hit rate governs everything

```text
hit rate   load on the origin   reduction
    50%           50%              2×
    90%           10%             10×
    95%            5%             20×
    99%            1%            100×
  99.9%          0.1%          1,000×
```

Going from 90% to 99% reduces the load on the origin by a factor of ten — more than any realistic capacity
increase would deliver.

That is why the hit rate is a cache's main metric, and why a drop in it is a first-order alert: it precedes
the origin's saturation.

And the converse: sizing the origin for the load with the cache means **the origin does not survive losing
the cache**. That needs to be a conscious decision, with a plan.

### A stampede is the characteristic failure mode

A popular key expires. A thousand simultaneous requests find the cache empty. All of them go to the origin,
simultaneously, for the same thing.

```text
with no protection   1 expiration → 1,000 identical queries to the origin
with protection      1 expiration → 1 query, 999 wait for the result
```

The defenses, which combine:

**A recomputation lock.** Only the first request recomputes; the others wait or receive the stale value.

**Probabilistic early recomputation.** Near expiry, a fraction of the requests recomputes before it
expires, avoiding the moment when all of them find it empty.

**Expiration with jitter.** Keys created together expire together. Adding random variation to the time to
live desynchronizes them — it is the same logic as [backoff](/06-distributed-systems/backoff.md).

**Serving the stale value while revalidating.** The request receives the expired value; the recomputation
happens in the background.

The last gives the best experience, and it requires serving slightly stale data to be acceptable — which it
usually is.

### Layered caching

```text
local in the process   nanoseconds  — small, per instance, divergent
shared                 ~1 ms        — consistent, one network round trip
edge                   ~10 ms       — geographically distributed
origin                 ~50 ms+      — the source
```

Layers compose: the local one absorbs the hottest, the shared one absorbs the rest, and the origin sees
little.

The care needed is **layered invalidation**: invalidating in the shared cache does not invalidate the local
ones. Local caches need a short time to live, or an invalidation channel.

And a local cache reintroduces divergence between instances — acceptable for data that tolerates a few
seconds of lag, unacceptable for what needs to be consistent. See
[statelessness](/11-scalability/statelessness.md).

### Warming matters during expansion

A new instance comes up with an empty local cache. It makes queries the others do not — at the moment the
system is scaling, that is, under pressure.

See [horizontal scaling](/11-scalability/horizontal-scaling.md). It is a second-order effect that turns
scaling into an additional peak on the origin.

The ways out: warming before entering the rotation, entering gradually while receiving a fraction of the
traffic, or depending only on the shared cache, which is already warm.

### A hot key in the cache

A distributed cache partitions by key. A heavily accessed key saturates the node that holds it — the same
[hotspot](/11-scalability/hotspots.md) problem, one layer up.

That surprises people because the cache exists precisely to absorb the hot key. The way out is replicating
the hot key across nodes, or putting it in a local cache, where the distribution stops mattering.

### Caching what should not be cached

Two mistakes with security and correctness consequences:

**Caching a personalized response with a generic key.** One user's response is served to another. It
happens when the cache key does not include the identity.

**Caching an error.** A transient failure cached for ten minutes turns a one-second error into a
ten-minute one.

The second is common in edge caches, and the fix is simple: a very short time to live for error responses,
or none.

## Mental Model

**A cache removes work; capacity adds means to execute it.** Removing is always cheaper — and it creates a
dependency that needs to be treated as such.

## When to Use

- The same information is read repeatedly.
- The cost of producing the response is high.
- Slightly stale data is acceptable.
- Reads dominate writes.
- The origin is saturated.
- There is an absorbable hot key.

## When Not to Use

**For data that has to be up to the instant.** A balance before debiting.

**With no plan for losing the cache.**

**With no stampede protection** on popular keys.

**An authoritative local cache.**

**A cache key with no identity** on a personalized response.

**Caching writes.** A cache resolves reads; writes require something else.

**When the hit rate is low.** A cache with a 30% hit rate adds latency and complexity for little gain.

## Alternatives

- **A materialized view** — precomputing in the database, with no extra layer.
- **A read replica** — it distributes without introducing invalidation. See
  [replication for scale](/11-scalability/scaling-replication.md).
- **Optimizing the query** — if it becomes cheap, the cache stops being necessary.
- **An edge cache** — for public content, it resolves latency and load at once.

## Trade-offs

| With a cache | Without |
|---|---|
| Reduced load on the origin | Full |
| The data can be stale | Always current |
| Invalidation to manage | None |
| An additional dependency | Fewer components |
| The cache's failure is critical | Irrelevant |

| Local | Shared |
|---|---|
| Nanoseconds | ~1 ms |
| Divergent between instances | Consistent |
| Cold at startup | Always warm |
| No network cost | One round trip |

## Failure Modes

**A stampede.** A popular key's expiration takes the origin down.

**Losing the cache.** The origin receives the full load and goes down.

**The hit rate falling with no alert.**

**A personalized response served to another user.**

**An error cached.**

**A divergent local cache.**

**A hot key saturating one cache node.**

**Silent eviction.** The memory fills and the cache discards what was important. See
[key-value](/07-data-architecture/key-value-databases.md).

## Common Mistakes

**Not monitoring the hit rate.** A cache with a 20% hit rate adds latency and complexity without relieving
the origin — and with no metric, nobody knows that is the case.

**Not protecting against a stampede.** When a popular key expires, all the simultaneous requests go to the
origin at once. It is how a cache that was working becomes the cause of the outage.

**Expiration with no jitter.** Entries created together expire together, and the load on the origin becomes
periodic spikes. Adding randomness to the deadline spreads that out.

**Having no plan for losing the cache.** If the origin cannot take the load with no cache, the cache
stopped being an optimization and became a critical dependency — and losing it takes everything down.

**A key with no identity on a personalized response.** Caching by URL a response that depends on the user
delivers one person's data to another. It is a leak created by an optimization.

**Not monitoring the eviction rate.** High eviction means insufficient memory for the working set, and the
cache comes to work against itself — writing what it will discard before reusing.

## Real-World Example

A news platform used a shared cache with a 97% hit rate. The database was sized for 3% of the read load.

Three incidents over a year, all related to the cache:

**Total loss.** A maintenance operation restarted the cache cluster. 100% of the load went to the database,
which saturated in seconds and was unavailable for 25 minutes — until the cache warmed back up. There was
no plan for that scenario.

**A stampede.** A heavily accessed article had its cache expiring every 60 seconds. At each expiration,
around 4,000 simultaneous requests went to the database for the same query. That generated regular latency
spikes nobody had connected to the expiration.

**Synchronized expiration.** The keys for one section of the portal were created together, at publication,
with the same time to live. All of them expired in the same second, producing a load pulse at each
interval.

The fixes:

**Serving the stale value while revalidating**, for all editorial content. An expiration stopped meaning
absence: the old value is served and the recomputation happens behind it.

**A recomputation lock** for the hottest keys, guaranteeing a single query per expiration.

**20% jitter on the time to live**, desynchronizing the expirations.

**A local cache** of 5 seconds on the application instances, absorbing the top of the distribution — which
reduced the load on the shared cache by 60% and resolved the hot key that was saturating one node.

**Load shedding** on the database: above a connection threshold, requests for non-essential content come to
receive a degraded response instead of queuing.

**A cache-loss exercise**, quarterly, in a controlled window. The first confirmed that the database still
went down; after the load shedding and the local cache, the third exercise passed with partial degradation
and no unavailability.

The 97% hit rate was seen as excellent and it hid a critical dependency. The database had never been sized
to operate with no cache, and nobody had decided that — it was a consequence of the cache having been added
later.

## Related Concepts

- [Caching](/05-system-design/caching.md) — the fundamentals.
- [Hotspots](/11-scalability/hotspots.md) — the hot key in the cache.
- [Database Scaling](/11-scalability/database-scaling.md) — rung 3.
- [Backoff](/06-distributed-systems/backoff.md) — the jitter.

## Practical Exercise

Find out your cache's hit rate and calculate the load the origin would receive if it vanished right now.

Compare with the origin's capacity. If it cannot take it, you have a critical dependency that is probably
not documented as one.

## Interview Questions

- Why does going from a 90% to a 99% hit rate matter so much?
- What is a stampede and what are the defenses?
- Why do new instances with a cold cache make the moment of scaling worse?

## Further Reading

- Nishtala, Rajesh et al. *Scaling Memcache at Facebook*. NSDI, 2013.
- Vattani, Andrea et al. *Optimal Probabilistic Cache Stampede Prevention*. VLDB, 2015.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
