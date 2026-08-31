---
id: graphql
title: GraphQL
sidebar_position: 2
description: The client chooses what it receives — and the cost that freedom transfers to the server.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates GraphQL by the variable-consumption problem it
  solves, and by the operational problems it creates.
prerequisites: [rest]
related: [rest, api-gateways, integration-contracts]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# GraphQL

## Overview

In GraphQL, the client describes **exactly** the fields it wants, and the server returns that — nothing
more, nothing less.

That solves two real problems of fixed-resource APIs: fetching more than you use, and needing several calls
to assemble one screen.

And it transfers a cost the usual comparison omits: the server no longer knows, in advance, the shape and
the weight of the queries it will receive.

## Problem

A REST API returns the whole resource. A mobile client that needs a name and a photo receives the complete
profile — **overfetching**.

And a screen showing an order with items, customer and address makes four calls — **underfetching**,
resolved with multiple network round trips.

The common way out in REST is to create tailor-made endpoints for each screen. It works, and each new
screen is backend work — which turns the backend team into the frontend team's bottleneck.

GraphQL moves that decision to the client.

## Core Concepts

### A typed schema, and a single entry point

The server publishes a graph of types and how to navigate them. The client composes:

```graphql
query {
  order(id: "123") {
    total
    items { name quantity }
    customer { name }
  }
}
```

One request, exactly the fields asked for, with no endpoint specific to that screen.

The schema is the contract, and it is executable — validation happens against it, not against a document.
See [integration contracts](/08-integration-architecture/integration-contracts.md).

### The cascading query problem

The mechanism that resolves each field is a resolver. Resolving a list of N items and, for each one, a
field that queries the database, produces N+1 queries.

In REST, the endpoint knows what it is going to fetch and optimizes. In GraphQL, the resolver does not know
in what context it was called.

The standard solution is to batch the fetches of a single cycle together, with loaders that accumulate ids
and issue one query. That works and it is **not optional**: a GraphQL without batch loaders degrades
non-linearly with list size.

That is the style's main operational cost, and the most underestimated at adoption.

### The query's cost belongs to the client, the bill belongs to the server

A deep or heavily branched query can be arbitrarily expensive. In schemas with cyclic relations, it can be
exponential.

The defenses — none of them optional in an exposed API:

**A depth limit.** Refuse queries above N levels.

**An estimated cost.** Assign a weight to each field and refuse above a ceiling.

**Persisted queries.** Only previously registered queries are accepted. It is the strongest defense, and it
removes the freedom that motivated the adoption — which is the right trade in a public API.

**An execution deadline.**

### Caching is what you lose

In [REST](/08-integration-architecture/rest.md), HTTP caching works: one URL, one `GET`, one result
cacheable by any intermediary.

In GraphQL, everything is a `POST` to a single URL, with a varying body. No intermediary can cache it.

The cache migrates inward: per-field caching on the server, a normalized cache on the client. Both work and
both are complexity HTTP gave away for free.

This is usually the decisive argument when the API is mostly public reads.

### Partial errors

A query can succeed in some fields and fail in others. The response carries data and errors together,
always with `200`.

That is coherent with the model and means error classification moves back into the application — the same
loss described in [REST](/08-integration-architecture/rest.md) when everything returns `200`, except that
here it is inherent to the style.

### Where it pays off most

The clear case: **many different clients consuming the same domain**, with needs that change faster than
the backend can keep up.

Mobile app, web, partner, internal screen — each asking for a different slice of the same entities.

Where there is a single client, controlled by the same team, the freedom does not pay for the operational
cost. A tailor-made endpoint is simpler in every respect.

## Mental Model

**GraphQL trades server predictability for client flexibility.** It is worth it when there are many clients
with divergent needs; it is not worth it when there is one.

## When to Use

- Many clients with different needs over the same domain.
- The frontend team is blocked by endpoint changes.
- Screens compose data from several related entities.
- Bandwidth matters — mobile clients on poor networks.
- The domain is naturally a graph.

## When Not to Use

**With a single client controlled by the same team.** The cost does not pay for itself.

**When HTTP caching is decisive.** Read-heavy public content.

**For operations that are not data queries.** Commands and workflows fit better in
[REST](/08-integration-architecture/rest.md).

**With no query cost limit.** In an exposed API, it is a denial of service waiting to happen.

**With no batch loaders.** The N+1 problem is certain.

**As a layer over a database.** Exposing the database schema as a graph turns the internal model into a
public contract.

**For bulk transfer.** See [batch integration](/08-integration-architecture/batch-integration.md).

## Alternatives

- **[REST](/08-integration-architecture/rest.md) with sparse fieldsets** — a parameter that selects fields
  covers much of the overfetching, without changing style.
- **An endpoint per screen** — the "backend for frontend" pattern. Simple and explicit, at the cost of
  coupling backend to screens.
- **[gRPC](/08-integration-architecture/grpc.md)** — when consumption is known and efficiency matters.
- **Persisted queries** — GraphQL without the open query surface.

## Trade-offs

| GraphQL | REST |
|---|---|
| The client chooses the fields | A fixed resource |
| One call composes the screen | Several |
| HTTP caching does not work | It works |
| Unpredictable query cost | Predictable |
| A typed schema by definition | The contract varies |
| N+1 requires loaders | The endpoint optimizes |
| Partial errors | A status code |

## Failure Modes

**N+1 with no loader.** Non-linear degradation.

**An expensive query taking the server down.**

**A deep query in a cyclic schema.** Combinatorial explosion.

**The internal model becoming the contract.** Exposing the database as a graph.

**Unused fields sticking around.** Nobody knows who consumes what.

**Per-field authorization forgotten.** A sensitive field reachable through a graph path nobody reviewed.

The last one deserves attention: in REST, authorization lives in the endpoint. In a graph, the same type
can be reached through several paths, and the check needs to be on the field, not on the route.

## Common Mistakes

**Adopting it as a trend, with a single client.**

**Not implementing batch loaders.**

**Not limiting depth and cost.**

**Generating the schema from the database.**

**Not instrumenting per field.** Without it, there is no way to know what is used or what is expensive.

**Authorization on the query instead of on the field.**

## Real-World Example

An education platform adopted GraphQL to serve a mobile app, the web and a partner area. The reason was
legitimate: three clients, divergent needs, and the backend had become a bottleneck — each new screen was a
week of waiting.

The gain appeared: the frontend team started building screens without asking the backend for anything. The
delivery time for a screen fell from weeks to days.

Four problems in production:

**N+1 on a class list.** The teacher's screen listed 40 classes and, for each one, the student count. With
no batch loader, that was 41 queries per load. Under peak, the database saturated. Fixed with loaders,
which the team considered "an optimization for later".

**An expensive partner query.** A partner wrote a query that walked students → enrollments → classes →
teachers → classes, and returned tens of thousands of nodes. A single request occupied the server for 90
seconds. Fixed with a depth limit and an estimated cost.

**A sensitive field exposed.** The `User` type had `document_id`, protected on the main path. It was
discovered that it was reachable via `class → students → user`, where the check did not exist.
Authorization was moved to the field level.

**Caching lost.** The public course catalog, previously served from a CDN with hours of caching, started
hitting the server on every request. The solution was to keep that specific slice in REST — the catalog
went back to a cacheable `GET`, and the rest stayed in GraphQL.

The point the team underlines: the decision to adopt remains correct for the three authenticated clients.
The mistake was treating it as a global choice and migrating the read-heavy public content too, where REST
was strictly better.

## Related Concepts

- [REST](/08-integration-architecture/rest.md) — the main comparison.
- [gRPC](/08-integration-architecture/grpc.md) — the third synchronous option.
- [API Gateways](/08-integration-architecture/api-gateways.md) — where limits are usually applied.
- [Integration Contracts](/08-integration-architecture/integration-contracts.md).

## Practical Exercise

If you use GraphQL, write the deepest query your schema allows and run it against a test environment with
realistic volume.

The time it takes is what a malicious — or distracted — client can trigger today.

## Interview Questions

- What cost does GraphQL transfer from the client to the server?
- Why is the N+1 problem structural in this style?
- Why does authorization need to live on the field, and not on the operation?

## Further Reading

- Byron, Lee. *GraphQL: A data query language*. Facebook Engineering, 2015.
- GraphQL specification — [spec.graphql.org](https://spec.graphql.org).
- Stemmler, Khalil. *Advanced GraphQL Patterns*, 2022.
