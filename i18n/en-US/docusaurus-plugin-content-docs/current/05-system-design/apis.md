---
id: apis
title: APIs
sidebar_position: 4
description: The contract between parts — the most expensive decision to reverse in a system.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader designs APIs with evolution in mind and recognizes what makes
  a contract expensive to change.
prerequisites: [services]
related: [request-response, pagination, integration-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# APIs

## Overview

An API is the contract between whoever offers a capability and whoever consumes it.

It is the part of the system that is most expensive to change, because there is code on
the other side that you do not control — and frequently do not even know about.

## Problem

APIs are designed looking inward: the structure reflects the data model of whoever
exposes it, the names come from the tables, the fields are the ones that exist.

That works on day one and charges later.

When the internal model changes — and it does — the API changes with it, because it was
never separated from it. Every internal refactoring becomes a contract change.

And when a new requirement arrives, the API does not accommodate it: it expresses the
storage structure, not the operations the consumer needs.

**An API is a product decision, not a projection of the database.**

## Core Concepts

### The API is not the internal model

The rule that avoids most of the problems: the type that crosses the boundary belongs to
the API, not the domain entity.

That costs mapping and buys independence: the internal model can be restructured without
touching consumers.

See [anti-corruption
layer](/04-domain-driven-design/anti-corruption-layer.md) — the same principle, on the
consumer's side.

### Evolution is the central decision

Every API changes. What you design is **how** it changes.

| Change | Compatible? |
|---|---|
| Add an optional field to the response | Yes, if consumers tolerate unknown ones |
| Add a required field to the request | No |
| Remove a field | No |
| Rename a field | No |
| Widen an enum | No, if consumers validate strictly |
| Narrow validation | No |
| Make a field optional | Yes |

The first and fifth lines depend on the consumer's behavior — which means
**compatibility is a property of the pair**, not of the API alone.

That is why the documentation has to say explicitly: *consumers must ignore unknown
fields and tolerate unforeseen enum values.* Without that, adding anything becomes a
breaking change.

### Versioning is the last resort, not the first

Versioning an API is expensive: two implementations to maintain, consumer migrations to
coordinate, a deprecation deadline to negotiate.

The sequence that works: design for extension, add compatibly for as long as possible,
and version only when the change is genuinely incompatible.

Teams that version on every change end up with six live versions and nobody migrating.

### Resource granularity

An API that is too fine forces the consumer to make several calls for one operation —
which multiplies latency, especially on mobile networks.

An API that is too coarse returns more than any consumer needs, and every change affects
everyone.

The criterion: **model the consumer's operations, not the producer's entities.** If all
consumers make the same three calls in sequence, that is one operation.

### Errors are part of the contract

What the API returns on failure is as much a contract as the happy path: which codes,
with what body, which are retryable, which are permanent.

An API that returns the same generic error for everything forces every consumer to guess
whether to retry — and the wrong answer produces a retry storm or silent loss.

## Mental Model

**Design the API as if you could not change it — and then design how it will change.**

## When to Use

- Whenever a capability crosses a team, process or organization boundary.
- When the consumer should not know the internal model.
- When there is more than one consumer with different needs.

## When Not to Use

**Inside a module.** A function call is simpler, faster and refactorable.

**As a mirror of the database.** An API generated from the schema is not a contract; it
is coupling with HTTP in the middle.

**Before knowing the consumer.** An API designed with no real consumer guesses the
operations and gets them wrong.

**Versioning preemptively.** `v1` on an API with one internal consumer adds ceremony
with no benefit.

## Alternatives

- **Function call** — inside the process.
- **Event** — when the consumer reacts to a fact and needs no response. See
  [event-driven architecture](/03-design-patterns/event-driven.md).
- **File or batch** — when the volume is large and the tolerated latency is high.
- **Direct query against a projection** — for high-volume reads within the same
  organization.

## Trade-offs

| Its own contract | Mirror of the internal model |
|---|---|
| Internal model refactorable | Refactoring breaks consumers |
| Consumer's vocabulary | Producer's |
| Mapping to maintain | None |
| More initial work | Faster to start |

| Coarse API | Fine API |
|---|---|
| Fewer calls per operation | More network round trips |
| Returns more than needed | Consumer asks for what it needs |
| A change affects everyone | Affects whoever uses that resource |

## Failure Modes

**Contract broken with no notice.** An unknown consumer stops working.

**Internal model leaking.** Refactoring becomes a contract change.

**Generic error.** The consumer does not know whether to retry.

**N+1 on the consumer's side.** An API too fine for the real use case.

**Accumulated versions.** Six live, none deprecated.

## Common Mistakes

**Generating the API from the data model.**

**Not documenting the compatibility policy.** It is part of the contract.

**Treating errors as a detail.**

**Versioning by reflex.**

**Not knowing who consumes it.** Without that, no change can be evaluated.

## Real-World Example

An internal catalog API returned the `Product` entity serialized — 42 fields, including
internal identifiers, control fields and the price history.

Three consequences over two years.

A refactoring that renamed two internal fields broke four consumers simultaneously.
Nobody knew they existed.

The mobile app downloaded 42 fields to display three, on poor connections.

And one consumer came to depend on an internal control field — `recordVersion` — to
implement caching. That field ceased to exist in a migration, and the consumer's cache
stopped invalidating.

The redesign created a type belonging to the API, with the fields consumers actually used
— identified by traffic analysis, not by supposition.

There were 11 fields. The other 31 had never been read by anyone.

The documentation started declaring the policy: unknown fields must be ignored,
unforeseen enum values must be tolerated, and deprecating any field carries a 90-day
notice.

Over the following two years, seven fields were added without breaking anything, and the
internal model was restructured twice without any consumer knowing.

## How to know who consumes it

No API change can be evaluated without knowing who depends on it. In systems with
internal consumers, that information frequently does not exist.

Four ways to obtain it, in order of reliability:

**Mandatory registration.** Consumers register to obtain a credential. It gives the exact
list and requires a process.

**Identification in the request.** A header with the client's name, recorded in the logs.
It gives the real list of who actually calls, including whoever never registered.

**Traffic analysis.** Origin by network. It works without the consumer's cooperation and
misidentifies when there is a proxy in the path.

**Asking.** It works in small organizations and fails silently in the rest — whoever does
not know they consume it does not answer.

The second balances cost and reliability best, and it enables a specific practice:
**measuring usage per field**. Instrumenting which response fields are actually read
reveals that most of a large API is usually ignored — and every unread field is coupling
that can be removed.

Without that information, every contract change is a bet, and the only safe policy becomes
never changing anything.

## Related Concepts

- [Services](/05-system-design/services.md) — who exposes it.
- [Request/Response](/05-system-design/request-response.md) — the mechanics.
- [Pagination](/05-system-design/pagination.md) — the case every listing API faces.
- [Integration](/08-integration-architecture/index.md) — styles and schema evolution.

## Practical Exercise

Pick an API in your system and answer: who are the consumers? How would you know if one
broke?

Then check which response fields are actually read — by traffic analysis, if possible.
The difference between what the API returns and what anyone uses is unnecessary coupling.

## Interview Questions

- Why should the API not mirror the internal model?
- Which changes are compatible, and what does that depend on?
- Why is error behavior part of the contract?

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Newman, Sam. *Building Microservices*. 2nd ed., 2021 — contract evolution.
- Documentation on *Semantic Versioning* and API compatibility practices.
