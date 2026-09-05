---
id: distributed-event-sourcing
title: Distributed Event Sourcing
sidebar_position: 38
description: Storing events instead of state — and what changes when the log is the source of truth between services.
doc_type: pattern
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates event sourcing by the cost of maintaining the log, not
  by the elegance of the model.
prerequisites: [event-driven-systems]
related: [distributed-cqrs, eventual-consistency, ordering, event-sourcing]
canonical_for: []
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Distributed Event Sourcing

> Prerequisite: [Event Sourcing](/03-design-patterns/event-sourcing.md) establishes what the
> pattern is, why the event schema becomes a permanent commitment and when it does not pay
> off. Here the focus is a single question: **what changes when the log crosses the service
> boundary.**

## Overview

Inside a service, the event log is an implementation detail: what reads it is the very code that
wrote it, and changing an event's structure is a refactoring.

When another service reads that log, it stops being a detail and becomes a **contract**. It is the
same change of nature a table undergoes when a second system starts querying it — and nothing
announces it: the log still looks internal, and it is the first schema change that reveals it was
not.

## Problem

Event sourcing produces, for free, something that looks like a good integration interface: an
ordered, complete sequence of everything that happened. Publishing it is tempting and costs almost no
work.

The cost shows up later. The internal log reflects the service's domain model — including the parts
that exist out of implementation convenience, and that would change in any refactoring. When it is
public, each of those parts becomes a commitment to third parties the service's owner does not
know.

## Core Concepts

### What the canonical document already establishes

Three points come from [event sourcing](/03-design-patterns/event-sourcing.md) and hold here
unchanged: the log is immutable and permanent, which makes the event format a commitment of years;
snapshots are mandatory in practice, because replaying ten years for one query is unviable; and
reading happens over projections, which brings
[distributed CQRS](/06-distributed-systems/distributed-cqrs.md) and
[eventual consistency](/06-distributed-systems/eventual-consistency.md) along with it.

Two caveats that only appear when there is more than one service:

**The snapshot belongs to whoever replays, not to the log.** Each consumer keeps its own, in its own
version of the model. A snapshot published alongside the log is one more format to version — and it
carries the whole internal model, not the part the other side needs.

**Reprocessing is not a local operation.** Rebuilding a projection that lives in another service means
re-reading the log from the beginning while it keeps serving, and the projection has to be pure: if
the replay triggers a side effect — an email, an external call — it triggers it again, now on behalf
of events from years ago. The canonical document covers purity; what changes here is that whoever
reprocesses and whoever suffers the effect may be different teams.

### Distributed adds coupling

When other services consume the log directly, the event schema becomes a public contract between
services.

That is strong coupling in disguise: changing one service's internal event structure affects everyone
who consumes them.

The alternative that preserves autonomy: keeping the event log **internal** to the service and
publishing integration events — a stable, versioned translation of what the rest needs to know.

What the separation buys is concrete: with it, renaming a field, splitting one event in two or fixing
an aggregate's modelling are internal changes, and the translator absorbs them. Without it, each of
those is a negotiation with every consumer — and since they have no reason to migrate on your
schedule, the internal schema freezes in the shape it had when the first consumer appeared.

The sign that the boundary was lost is not an incident: it is a conversation. Someone proposes
changing an event's structure and the answer is "we can't, service X depends on that".

### The cost of storage and privacy

The log only grows. That is manageable in cost, and delicate in privacy — but the common formulation
("the regulation says erase, the log is immutable") is too coarse to decide anything, and it is worth
separating two kinds of data.

The **business fact** generally cannot be erased: where there is a legal retention obligation, the
right to erasure yields to it — that is the case for accounting entries and financial movements. In an
accounts core, erasing the transaction is not merely hard, it is forbidden.

The **identifying personal data** is what has to go. And for it there is a mechanism: per-subject
encryption with key discard, or keeping the identifiable data out of the log, referenced by a
pseudonym. Both work, and both have to be designed from the start — adding them later requires
rewriting the history, which is exactly what the pattern does not allow.

The practical conclusion, then, is narrower: the conflict disqualifies adoption when there is personal
data inside the aggregate, **with no** legal retention basis and **with no** discard mechanism
designed. Outside those three conditions together, it is a cost to plan for, not an impediment.

## Mental Model

**Event sourcing trades simplicity in the present for complete access to the past.** And the past,
once written, does not change format.

## When to Use

- Complete auditing is a regulatory requirement.
- The history of how the state was reached has business value.
- New questions about past data arise frequently.
- Retroactive correction of a calculation is necessary.
- The domain is naturally a sequence of facts — accounting, ledger movements, a clinical record.

## When Not to Use

The conditions for not adopting event sourcing **itself** are in the
[canonical document](/03-design-patterns/event-sourcing.md). What follows is about this document's own
decision: exposing the log.

**Sharing the internal log between services — in any number.** There is no tolerable threshold: the
first external consumer already freezes the schema, because from then on changing the structure takes
coordination. With two or three, the coordination is a meeting; with ten, it is a project; and what
breaks is always the same thing — the change that looked internal.

**When the consumer needs a slice, not the stream.** If the other service wants "the current balance"
or "this customer's orders", giving it the log is handing over the problem of deriving state along
with the data. What it needs is a query or a projection maintained by the owner — not to reimplement
the reduction of the events, with a chance of diverging from the original.

**When there is no way to version what you publish.** Publishing with no explicit version in the event
means the first change of shape breaks someone silently, and the discovery comes through support.

## Alternatives

The alternatives to *using event sourcing as a way to persist* are in the
[canonical document](/03-design-patterns/event-sourcing.md). These are the alternatives to **exposing
the log**:

- **An internal log plus integration events** — the standard answer. A stable, versioned translation
  of what the rest needs to know, maintained by whoever owns the domain.
- **Publishing through a transactional outbox** — write the integration event in the same transaction
  as the fact, and a separate process publishes it. See
  [distributed transactions](/06-distributed-systems/distributed-transactions.md).
- **A projection maintained by the owner, exposed as a query** — when the consumer wants state, not
  the sequence that produced the state.
- **Change capture on the output, not on the log** — publishing what changed in the public projection,
  keeping the domain log out of reach.

The first deserves emphasis because it is the one that preserves both things: the service keeps the
freedom to refactor the internal side, and the consumer gets a contract someone has committed to
maintaining.

## Trade-offs

| Event sourcing | Current state |
|---|---|
| Complete history | Only the present |
| New projections over the past | Only what was anticipated |
| Native auditing | A separate table |
| Permanent schema | Normal migration |
| Snapshots necessary | Direct query |
| Erasure difficult | Simple |
| Long curve | Familiar |

## Failure Modes

**A frozen schema.** Changing an event requires a converter for every version.

**Slow replay.** With no snapshot, or with an outdated one.

**A side effect during reprocessing.** Emails resent.

**A divergent projection.** A defect in the projection produces wrong reads until it is rebuilt.

**The log as a contract between services.** An internal change breaks third parties.

**A privacy conflict.** An erasure request with no mechanism.

**Unbounded growth.** Cost and replay time.

## Common Mistakes

**Not separating internal events from integration events.** It is this document's own mistake. The
decision looks like economy — one format instead of two, no translator to maintain —, and the
consequence arrives months later, in the form of a refactoring that cannot be done. For the consumer,
it looks worse still: the event changes shape with no warning, because on the other side nobody knew
that was a contract.

**Confusing it with "publishing events".** Publishing events is not event sourcing; event sourcing is
deriving the state from them.

The last confusion is frequent and leads teams to believe they already do event sourcing when they do
[event-based communication](/06-distributed-systems/event-driven-systems.md).

## Real-World Example

A fintech adopted event sourcing for the accounts core — an appropriate decision, given the regulatory
auditing requirement and the domain's nature.

What worked: reconstructing any account's balance on any past date became a trivial query, and a
regulator requirement that would have cost months of work was met in days.

Four problems appeared over three years.

**Schema.** The transfer event gained fields over time. At the fifth version, the replay code had five
branches. It was solved with chained converters — each version converts to the next, and the replay
only knows the latest. The cost was rewriting the entire replay layer.

**Reprocessing with effects.** A notification projection triggered an alert to the customer. A
corrective reprocessing sent 400 thousand duplicated notifications overnight. The projections were
separated from effects, and the effects got idempotency control with a window.

**Erasure.** A personal data deletion request arrived and there was no mechanism. The solution was
per-subject encryption: personal data in the log stored encrypted with a per-customer key, and the
erasure discards the key. Implementing it retroactively required rewriting the log — the riskiest
operation the team has ever done.

**Undue extension.** Another team adopted event sourcing for the product catalog, for architectural
consistency. Two years later, the module was migrated back to CRUD: the history was never consulted,
and the maintenance cost was full.

What the team records: the original decision was correct and remains so; the error was treating it as
the system's default instead of a choice for a specific domain.

## Related Concepts

- [Distributed CQRS](/06-distributed-systems/distributed-cqrs.md) — which comes with it.
- [Event-Driven Systems](/06-distributed-systems/event-driven-systems.md) — not the same thing.
- [Eventual Consistency](/06-distributed-systems/eventual-consistency.md) — between write and
  projection.
- [Ordering](/06-distributed-systems/ordering.md) — the log depends on it.

## Practical Exercise

If you are considering event sourcing, answer three questions first: who will query the history and
how often; how an event will be versioned in year three; and what happens when a personal data
erasure request arrives.

If any of them has no answer, an audit table probably solves the real requirement.

## Interview Questions

- Why is the event schema permanent, and what does that require?
- Why do projections have to be pure?
- What is the difference between event sourcing and publishing events?

## Further Reading

- Young, Greg. *Versioning in an Event Sourced System*, 2017.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013 — appendix A.
- Fowler, Martin. *Event Sourcing*, 2005.
