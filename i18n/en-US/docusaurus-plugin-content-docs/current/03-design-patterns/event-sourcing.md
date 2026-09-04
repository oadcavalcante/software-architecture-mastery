---
id: event-sourcing
title: Event Sourcing
sidebar_position: 28
description: Persisting the sequence of facts instead of the state — and the cost of versioning events forever.
doc_type: pattern
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes when history is a business requirement and the
  permanent versioning commitment the pattern imposes.
prerequisites: [cqrs]
related: [cqrs, memento, event-driven, distributed-event-sourcing]
canonical_for: [event sourcing]
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Event Sourcing

## Overview

Event sourcing persists the **sequence of events** that led to the current state, rather
than the state. The state becomes derived: a function of the events.

It is [Memento](/03-design-patterns/memento.md) at system scale, and one of the patterns
whose adoption is most asymmetric: cheap to take on, expensive to undo. Getting out is
possible — the Real-World Example recounts a completed exit — but it costs
disproportionately more than getting in.

## Problem

Persisting only the current state discards information.

A balance of R$ 1,200 does not say how it got there. An order marked "cancelled" does not
say when, by whom, or what its state was before. A change overwrites the previous value,
and that value stops existing.

For many domains that is acceptable. For others — accounting, healthcare, regulated
sectors, any system where "why is this value what it is?" has to have an answer — it is
losing data the business requires.

Event sourcing inverts that: the events are the source of truth, and the state is a
projection.

## Core Concepts

### The event is immutable and definitive

Once recorded, an event is never altered or removed. Correcting a mistake requires a
**compensating event** — the same principle as a reversal entry in accounting.

That is what gives complete auditability and what makes the pattern rigid.

### Rebuilding and snapshots

The state is obtained by replaying the events from the beginning. With thousands of events
per aggregate, that gets expensive.

The mitigation is the **snapshot**: record the state every N events and replay only from
there. It is the same hybrid strategy as [Memento](/03-design-patterns/memento.md), and it
is practically mandatory in production.

### Event versioning is permanent

This is the cost that decides, and the least discussed before adoption.

Events recorded three years ago have to remain readable. When an event's structure
changes, the code has to know how to interpret **every previous version**, forever.

There is no migration in the usual sense: rewriting old events destroys the immutability
property that justified the pattern.

The strategies — versioning the type, upcasting on read, keeping a converter per version —
all mean carrying compatibility code indefinitely.

**The question before adopting is not "does this solve my problem?". It is "am I willing
to maintain read compatibility forever?"**

### Projections and eventual consistency

The queryable state comes from projections built from the events — typically
asynchronously, which brings [level 3 CQRS](/03-design-patterns/cqrs.md) and its eventual
consistency.

Projections can be rebuilt from scratch, which is a real advantage: a defect in a
projection is fixed by reprocessing, with no data loss.

## When to Use

- History is a **business requirement**, not a convenience — regulatory auditing,
  accounting, legal traceability.
- You need to answer "what was the state on such-and-such a date?".
- The business needs temporal analysis of how things reached the current state.
- New projections over historical data have value — reprocessing answers questions that
  did not exist when the data was recorded.

## When Not to Use

**When history is not a requirement.** The most common case. An audit log alongside the
state solves most traceability needs for a fraction of the cost.

**In CRUD domains.** The pattern adds complexity proportional to the whole domain, not to
the part that needs history.

**When the team does not have a grip on eventual consistency.** The projection lags the
log by an interval, and that is where the defects show up: the confirmation screen that
shows the state before the action the user has just taken, and the projection that
processes the same event twice because it is not idempotent.

**When there is no willingness for permanent versioning.** It is the criterion that should
eliminate the most candidates and is considered the least.

**As the pattern for the whole system.** Applying it to every aggregate when two need it
is the most expensive mistake. See the example below.

**When data deletion is a requirement.** Data protection legislation that requires erasing
personal information conflicts directly with immutable events, and the solutions —
encryption with key discarding, for instance — are complex and have to be designed from
the start.

## Alternatives

- **An audit table** — records who changed what and when, alongside the state. It solves
  most traceability needs.
- **Temporal row versioning** — tables with validity periods, supported natively by some
  databases.
- **Change data capture** — capturing changes without making them the source of truth.
- **Selective event sourcing** — only in the aggregates that need it.

## Trade-offs

| Event sourcing | Persisted state |
|---|---|
| Complete, auditable history | Only the current state |
| State at any point in the past | Not recoverable |
| New projections over the past | Only what was anticipated |
| Permanent event versioning | Ordinary schema migration |
| Eventual consistency in queries | Transactional |
| Data deletion difficult | Trivial |
| High, permanent complexity | Low |

## Failure Modes

**Event with no versioning.** With no version marker on the event, the right converter
comes to be chosen by inference from the structure — the presence or absence of a field.
That works until two versions coincide in shape, and then there is no way to tell them
apart without rewriting the history.

**Slow rebuild.** Without snapshots, loading an aggregate with tens of thousands of events
takes seconds.

**Event with too much data.** Storing the whole state in each event nullifies the saving
and worsens the versioning.

**Event with too little data.** Information is missing to rebuild, and it cannot be added
retroactively.

**Projection with no automated rebuild.** A defect freezes the system.

**Conflict with mandatory deletion.** Discovered late, it is expensive.

## Common Mistakes

**Adopting it with no history requirement.**

**Applying it to the whole system.**

**Not planning versioning.**

**Confusing it with
[event-driven architecture](/03-design-patterns/event-driven.md).** One is about
persistence; the other about communication. They can exist separately.

**Not thinking about personal data deletion from the start.**

## Where it appears in practice

**Accounting systems.** The general ledger is event sourcing by definition, and has been
for centuries — immutable entries, derived balance, correction by reversal.

**Version control.** The commit graph is immutable and grows only by appending, and any
state of the tree is reachable by walking it — that is the resemblance. Note that it stops
there: Git stores complete **snapshots** of the tree at each commit and derives the *diff*,
which is the inverse of event sourcing. The deltas exist only as compression inside the
packfile.

**Financial trading systems.** Orders and executions as events, with a regulatory
requirement for reconstruction.

**Databases.** In PostgreSQL, Oracle and SQL Server, the write-ahead log is event sourcing
used internally: recovery after a crash derives the state from it. Not every database works
that way — SQLite in its default mode uses a rollback journal, from which the state is not
derived — and it is not always the same log: in MySQL, recovery comes from InnoDB's redo
log and replication comes from the binlog, which is a different one, logical and
separate.

Accounting is the most useful example, because it shows the pattern working for centuries
in a domain where history is the reason for being. Where history is incidental, the same
structure becomes dead weight.

## Real-World Example

An insurer adopted event sourcing across the whole platform, motivated by a real
regulatory requirement: claims need a complete decision trail.

Three years later, the balance.

Where it worked: claims. The trail is a requirement, audits are frequent, and the ability
to answer "what was the state of this assessment on such-and-such a date" has already
averted two legal disputes.

Where it did not: broker registration, product tables, commission configuration. None has
a history requirement beyond an audit table. All three accumulated events, versions and
compatibility converters — the structure of `BrokerUpdated` changed four times, and the
code carries four readers.

Migrating those three modules back to persisted state took two quarters, because the old
events had to be replayed to produce the final state and then discarded — which required
legal authorization.

The cost of reverting was greater than that of never having adopted it. That is the
characteristic that makes this decision different from the others: **event sourcing is
expensive to abandon**, and so the scoping decision needs far more care than the adoption
one.

## Related Concepts

- [CQRS](/03-design-patterns/cqrs.md) — almost always accompanies it.
- [Memento](/03-design-patterns/memento.md) — the same idea in memory.
- [Event-Driven Architecture](/03-design-patterns/event-driven.md) — communication, not
  persistence.
- [Sagas](/06-distributed-systems/sagas).

## Practical Exercise

List your system's aggregates and, for each, answer: has anyone ever asked "how did this
reach this state?" or "what was the value on such-and-such a date?"

If the answer is no, event sourcing does not apply there. If it is yes for one or two,
consider applying it only to those.

## Interview Questions

- What permanent cost does event sourcing impose?
- How do you correct an event recorded in error?
- What is the difference between event sourcing and event-driven architecture?

## Further Exploration

- Young, Greg. *Versioning in an Event Sourced System*, 2017 — the central problem.
- Fowler, Martin. *Event Sourcing*, 2005.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
