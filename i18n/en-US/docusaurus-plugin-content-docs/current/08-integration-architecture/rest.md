---
id: rest
title: REST
sidebar_position: 1
description: The default synchronous integration style — what it actually proposes, and what almost everyone calls REST without it being so.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader designs HTTP APIs that use the protocol's semantics instead
  of tunneling method calls over it.
prerequisites: [integration-architecture]
related: [graphql, grpc, integration-contracts]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# REST

## Overview

REST is an architectural style based on **resources** identified by URL, manipulated through a fixed set
of verbs, with semantics defined by HTTP itself.

Almost no API called REST is REST in the original sense — most are "HTTP with JSON", which is legitimate
and is not the same thing.

The distinction matters less as purity and more for what you lose by ignoring it: caching, idempotency,
uniform error handling and evolution — all of which the protocol already offers, for free, to whoever uses
its semantics.

## Problem

The most common pattern in HTTP APIs is tunneling method calls:

```text
POST /createOrder
POST /getOrderById
POST /cancelOrder
```

That works, and throws away what the protocol gives. Everything is a `POST`, so nothing is cacheable or
safe to retry. Errors become a `200` with a `success: false` field, so no intermediary — proxy, gateway,
client — understands what happened.

The result is an API that has to reimplement, in its own convention, things HTTP already solves.

## Core Concepts

### A resource, not an operation

The central modeling: the URL identifies **things**, and the verb says what you do with them.

```text
GET    /orders/123          fetch
PUT    /orders/123          replace
PATCH  /orders/123          partially change
DELETE /orders/123          remove
POST   /orders              create
```

The guiding question: if this were a document, what would its address be?

Actions that do not fit a noun — cancel, approve, reprocess — usually reveal a hidden resource.
"Cancel order" can be `POST /orders/123/cancellation`: the cancellation is a thing, with a date, a reason
and an author.

That is not word play. A cancellation as a resource has identity, can be queried and audited — which the
`POST /cancelOrder` operation does not.

### Safety and idempotency come from the verb

The most useful property and the most ignored:

```text
GET, HEAD    safe and idempotent   — does not change; can be retried, cached, prefetched
PUT, DELETE  idempotent            — repeating has the same effect
POST         neither               — repeating creates again
PATCH        neither               — depends on what you send
```

That is not decorative convention: proxies, browsers, clients and service meshes **act** on those
guarantees. A `GET` that changes state will be repeated by a prefetch. A `POST` with no idempotency key
will be duplicated by a retry.

See [idempotency](/06-distributed-systems/idempotency.md).

### The status code is part of the contract

```text
200/201/204   success, with or without a body
400           the request is wrong — retrying will not help
401/403       unauthenticated / unauthorized
404           does not exist
409           state conflict
422           valid syntax, invalid semantics
429           too many requests — retry later
5xx           server error — retrying may work
```

The split between 4xx and 5xx is what lets the client decide whether to
[retry](/06-distributed-systems/retries.md). An API that returns a `200` with an error in the body takes
that decision away from the caller, and forces every client to reimplement the classification.

### What almost nobody does: hypermedia

In the original REST, the response carries links to the next possible actions, and the client navigates
them instead of constructing URLs.

The promise is decoupling the client from the address structure and communicating state transitions — a
paid order carries a refund link; a pending one does not.

Adoption is very low, and it is worth being honest about why: most clients are written against a
specification and gain nothing from discovering links at runtime. The cost appears immediately, the
benefit rarely.

Where it pays: long-lived public APIs, with many clients the provider does not control.

### Versioning: prefer not to

See [schema evolution](/08-integration-architecture/schema-evolution.md). Adding a field is free; adding
a resource is free. Most of an HTTP API's evolution fits in a compatible change.

Versioning in the URL is the most common and most visible form — and each live version is code to
maintain.

### Pagination, filtering and sorting are contract

Large collections need pagination, and the choice has a consequence:

**By offset** — simple, and the page changes if records are inserted during navigation.

**By cursor** — stable under insertion, and it does not allow jumping to an arbitrary page.

Whichever it is, it has to be in the contract — including the maximum limit and what happens when you ask
for more.

## Mental Model

**REST is using HTTP's semantics, not going around them.** Every ignored guarantee is one you will
reimplement worse.

## When to Use

- The client needs the response to continue.
- The model is naturally one of resources with a lifecycle.
- Diverse consumers, including browsers.
- HTTP caching has value.
- A public API, where universal tooling matters.
- Operational simplicity weighs more than transport efficiency.

## When Not to Use

**When the consequence is asynchronous.** See
[messaging integration](/08-integration-architecture/messaging-integration.md).

**When the client needs highly variable fields.** See
[GraphQL](/08-integration-architecture/graphql.md).

**Very high frequency internal communication.** See [gRPC](/08-integration-architecture/grpc.md) — the
serialization and connection cost weighs.

**Bidirectional or long-lived flows.**

**Transferring large volumes in batches.** See
[batch integration](/08-integration-architecture/batch-integration.md).

**When the operation is not about a resource.** Forcing a noun onto computations and complex searches
produces tortured modeling — there an operation endpoint is more honest.

## Alternatives

- **[GraphQL](/08-integration-architecture/graphql.md)** — when consumption is variable.
- **[gRPC](/08-integration-architecture/grpc.md)** — internal, high frequency, strong contract.
- **[Messaging](/08-integration-architecture/messaging-integration.md)** — asynchronous.
- **[Webhooks](/08-integration-architecture/webhooks.md)** — to notify instead of being polled.

## Trade-offs

| REST | gRPC |
|---|---|
| Universal tooling | Needs support |
| Human-readable | Binary |
| HTTP caching | Not native |
| Frequently loose contract | Strong by definition |
| More bytes | Compact |

| REST | GraphQL |
|---|---|
| Fixed response per resource | The client chooses |
| Simple caching | Difficult |
| Several calls to compose | One |
| Predictable cost | A query can be expensive |

## Failure Modes

**Everything via `POST`.** Nothing is cacheable or safe to retry.

**A `200` with an error in the body.** The client does not know whether to retry.

**A `GET` with a side effect.** A prefetch triggers the action.

**No idempotency key on creation.** A retry duplicates.

**A collection with no pagination.** One query returns everything and takes both sides down.

**A sequence of calls in a loop.** The client makes N requests to assemble one screen — the problem that
motivates [GraphQL](/08-integration-architecture/graphql.md).

## Common Mistakes

**Modeling operations instead of resources.**

**Not using the status codes.**

**Not offering an idempotency key on `POST`.**

**Versioning by reflex.**

**Pagination outside the contract.**

**Exposing the internal database model as a resource.** The resource is part of the public contract; the
internal model has to be able to change.

## Real-World Example

A logistics operator exposed an HTTP API with 40 endpoints, all `POST`, all returning a `200` with
`{success: bool, error: string}`.

Four consequences, all discovered separately:

**Retries duplicating shipments.** The mobile client retried on network failures. Since everything was a
`POST` with no idempotency key, each retry created a new shipment. About 300 duplicated shipments per
month, handled manually by support.

**No caching.** The shipment status lookup was the most called endpoint — 40% of the traffic — and could
not be cached because it was a `POST`. The database absorbed everything.

**Error classification in the application.** Each of the eleven clients had its own logic to decide
whether the text in the `error` field was retryable. Three were wrong, and retried indefinitely on
permanent errors.

**A useless gateway.** The gateway could not apply rate limits per operation type, nor cache, nor report
error rates — because everything was a `POST` with a `200`.

The migration was done in parallel, with the old API kept for fourteen months.

**Lookups became `GET`** with a 30-second cache. Database traffic dropped 60%.

**Real status codes.** The clients deleted their own classification and came to use 4xx versus 5xx.

**An idempotency key** required on creation. The duplicates went to zero.

**Resources instead of operations.** `POST /shipments/{id}/cancellation` replaced `POST /cancelShipment`.
The cancellation became queryable, which solved an old audit demand nobody had connected to it.

What was recorded afterwards: none of the four fixes was about stylistic purity. Each one removed code
that existed only to compensate for a protocol guarantee that was being wasted.

## Related Concepts

- [GraphQL](/08-integration-architecture/graphql.md) and [gRPC](/08-integration-architecture/grpc.md) —
  the synchronous alternatives.
- [Integration Contracts](/08-integration-architecture/integration-contracts.md).
- [Idempotency](/06-distributed-systems/idempotency.md).
- [API Gateways](/08-integration-architecture/api-gateways.md).

## Practical Exercise

Take your team's API and count how many endpoints are `POST`. For each one, ask: does this change state?

The ones that do not should be `GET` — and each one is caching and safe retries you are leaving on the
table.

## Interview Questions

- Why does the distinction between 4xx and 5xx matter to the client?
- What do you lose by doing everything via `POST`?
- How do you model "cancel order" as a resource, and what do you gain from it?

## Further Reading

- Fielding, Roy. *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral
  dissertation, 2000.
- Richardson, Leonard; Amundsen, Mike. *RESTful Web APIs*. O'Reilly, 2013.
- Allamaraju, Subbu. *RESTful Web Services Cookbook*. O'Reilly, 2010.
