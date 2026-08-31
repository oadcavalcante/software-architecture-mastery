---
id: cdn
title: CDN
sidebar_position: 10
description: Cache at the edge, close to the user — and what decides whether it serves your content.
doc_type: concept
level: 3
difficulty: beginner
status: complete
objective: >
  By the end, the reader decides what to put behind a CDN and configures invalidation
  without depending on manual purging.
prerequisites: [caching]
related: [caching, load-balancing, cloud-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# CDN

## Overview

A CDN is a network of geographically distributed servers that keep copies of your content
close to whoever consumes it.

The gain is physical and has no alternative: **light takes time to cross the planet**. A
server in São Paulo responding to a user in Lisbon pays about 100 ms just in round trip,
regardless of how fast the server is.

## Problem

Two different problems, which the CDN solves together.

**Distance.** Network latency is dominated by physical distance. No code optimization reduces
that.

**Load.** Every asset served by the origin consumes its bandwidth, connections and CPU — to
deliver identical bytes thousands of times.

Serving from a nearby point solves both: the response travels less and the origin is not even
queried.

## Core Concepts

### What goes behind a CDN

The criterion is **how many users receive exactly the same response**.

| Content | Fits a CDN? |
|---|---|
| Images, CSS, JavaScript, fonts | Yes, it is the ideal case |
| Video and downloads | Yes, it is where the bandwidth saving is largest |
| Public pages identical for everyone | Yes |
| A public, immutable API response | Yes, with the right header |
| A page personalized per user | No, except with specific techniques |
| A response that depends on authentication | No, and caching it leaks data |

The last line is the CDN's most serious failure mode: caching an authenticated response makes
one user receive another's content. It happens, and the cause is usually a badly configured
cache header.

### The header is the contract

The CDN obeys what the origin sends. The ones that decide:

**`Cache-Control: max-age`** — how long the client can keep it.

**`s-maxage`** — how long the CDN can keep it. It lets the CDN keep it for a long time and the
browser for a short one.

**`private`** — forbids the CDN from keeping it. It is what protects an authenticated
response.

**`stale-while-revalidate`** — the CDN can serve the stale version while fetching the new one.
It eliminates the expiry penalty for the user.

The last is the most useful mechanism and the least used: it gives reasonable freshness without
anyone paying the revalidation latency.

### Invalidation: version instead of purging

Purging a CDN cache is slow, is rate-limited and frequently costs money.

The technique that avoids purging is to **version the URL**: instead of invalidating
`/app.css`, publish `/app.a3f9c2.css`. The name changes when the content changes, and the old
URL simply stops being referenced.

It is what site generators do by default, and it is why you can safely configure a one-year
cache.

Purging is left for the exceptional case: content published by mistake, an urgent correction.

### A CDN is not only a cache

Modern CDNs also terminate TLS at the edge, compress, protect against volumetric attacks, and
allow running logic at the edge.

Terminating TLS close to the user reduces the cost of the handshake, which is several network
round trips — frequently a larger gain than the caching itself.

## Mental Model

**If a thousand users receive the same response, it should be served from the edge.** If each
one receives a different one, it should not.

## When to Use

- Static content: assets, images, media, downloads.
- Geographically distributed users.
- The origin's bandwidth is a cost or a bottleneck.
- Public pages identical for everyone.
- Protection against volumetric attacks is necessary.

## When Not to Use

**For personalized responses.** Each user receives something different; a hit rate near zero.

**For authenticated content, with no `private`.** Risk of leaking between users.

**When all users are close to the origin.** An internal system with users in one city gains
nothing in distance — it may gain in bandwidth.

**For write APIs.** There is nothing to cache, and the CDN adds a hop.

**When invalidation would be constant purging.** If the content changes every minute and cannot
be versioned, the CDN gets in the way.

## Alternatives

- **Browser cache** — HTTP headers, with no component at all. It is the cheapest cache and the
  first to configure.
- **[Cache](/05-system-design/caching.md) in the application** — for shared dynamic data.
- **Read replica per region** — when the content is dynamic but regionalized.

## Trade-offs

| With a CDN | Serving from the origin |
|---|---|
| Edge latency | Distance latency |
| Origin offloaded | Every request arrives |
| Cheap egress bandwidth | Expensive at the origin |
| One more component and vendor | Fewer pieces |
| Invalidation with a delay | Immediate |
| Risk of serving the wrong content | No such risk |

## Failure Modes

**Authenticated response cached.** One user receives another's data. The most serious mode.

**Missing cache header.** The CDN applies a default nobody chose.

**A purge that does not propagate.** Stale content served in some regions.

**Caching an error.** A 500 error cached for hours.

**Origin exposed.** The CDN is bypassed by going directly to the origin's IP, nullifying the
protection.

## Common Mistakes

**Not using `private` on an authenticated response.**

**Depending on purging instead of versioning URLs.**

**Not configuring `stale-while-revalidate`.**

**Caching errors.** Configure it not to cache error responses, or with a minimal deadline.

**Forgetting to block direct access to the origin.**

## Real-World Example

A news portal put a CDN in front of everything, with a uniform 5-minute `max-age`.

Three consequences.

**The good one:** the origin's bandwidth dropped 94% and the latency for readers outside the
state dropped from 380 ms to 40 ms.

**The bad one:** the logged-in area — profile, comments, preferences — also went through the
CDN. A reader reported seeing another person's name in the header. The authenticated response
had been cached because there was no `private`.

It was resolved in minutes and the incident required notifying users.

**The instructive one:** corrected articles took 5 minutes to update, and for correcting a
factual error that was unacceptable. The team started purging manually on every correction,
which was slow and frequently forgotten.

The final configuration separated three profiles.

Assets with versioned URLs: a one-year `max-age`, immutable.

Public content: a 60-second `s-maxage` with a 300-second `stale-while-revalidate` — the CDN
serves the previous version while fetching the new one, so the user never waits, and the update
arrives in about a minute with no purging.

The authenticated area: `Cache-Control: private, no-store`, and a rule in the CDN that refuses
to cache any response with an authentication header — defense in depth, in case somebody
forgets the header again.

## Protecting the origin

A CDN only offloads the origin if nobody can bypass it. If the origin's address is directly
reachable, three things stop being true: the bandwidth saving, the protection against volume,
and the policies applied at the edge.

Three mechanisms, in order of strength:

**Shared secret.** The origin only accepts requests carrying a header only the CDN knows.
Simple, and it depends on rotating the secret.

**Address allowlist.** The origin only accepts connections from the CDN's ranges, published by
the provider. Stronger, and it requires tracking changes to the ranges.

**Private tunnel.** The origin has no public address; the CDN connects over a dedicated
channel. The strongest of all, and the most laborious to establish.

The second is the most common and the most frequently out of date — the ranges change and the
list is not reviewed, which causes an outage that is hard to diagnose.

It is also worth considering the inverse: **what needs to bypass the CDN**. Health checks,
deployment tooling and some administrative flows usually need direct access, and that exception
has to be explicit rather than accidental.

## Related Concepts

- [Caching](/05-system-design/caching.md) — the general concept.
- [Load Balancing](/05-system-design/load-balancing.md) — distribution at the origin.
- [Cloud](/09-cloud-architecture/index.md) — regions and networking.
- [Security](/10-security/index.md) — the risk of leaking through a cache.

## Practical Exercise

Check the cache headers of your system's responses — especially the authenticated ones.

Any response that depends on who is logged in and does not have `private` or `no-store` is a
leak waiting for a CDN or a proxy along the way.

## Interview Questions

- What decides whether content fits a CDN?
- Why is versioning a URL preferable to purging?
- What is the most serious CDN configuration risk?

## Further Reading

- Grigorik, Ilya. *High Performance Browser Networking*. O'Reilly, 2013.
- RFC 9111 — HTTP Caching.
