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
related: [distributed-cqrs, eventual-consistency, ordering]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Distributed Event Sourcing

## Overview

In event sourcing, the store does not keep the current state — it keeps the **sequence of events**
that produced that state. The state is derived by replaying the events.

In a distributed context, that means the event log becomes the shared source of truth, and other
services build their own views from it.

The pattern gives complete auditing, the ability to reconstruct any past state and the freedom to
create new views retroactively. It also makes the event schema permanent — and it is that permanence
most teams underestimate.

## Problem

A current-state store answers "how it is" and discards "how it got here".

That is adequate in most cases and insufficient in some: regulatory auditing, behavior analysis,
retroactive correction of calculation defects, and the need to answer questions that did not exist
when the data was written.

Event sourcing solves that by keeping everything. And it introduces problems a state store does not
have.

## Core Concepts

### The log is immutable and permanent

Events are neither changed nor deleted. An error is corrected by a compensating event, not by
editing.

The consequence that dominates everything else: **the format of an event written in 2020 has to be
readable in 2030**. There is no schema migration in the usual sense.

Every change has to be additive, and the replay code has to handle every version ever written. After
a few years, that means code with branches per event version.

Teams that adopt event sourcing without planning versioning discover, in the second year, that they
cannot change an event without writing a converter.

### Snapshots are mandatory in practice

Replaying ten years of events to answer one query is unviable. Periodic snapshots store the state at
a point, and the replay starts from there.

The snapshot is derived — it can be discarded and recomputed. And it reintroduces part of the problem
event sourcing avoided: a snapshot written in one version of the model may not be compatible with the
next.

The practice that works: versioning the snapshots and discarding them on a model change, regenerating
from the log.

### Projections and the CQRS that comes with it

Querying by replaying events does not scale. Reading happens over **projections** — materialized views
built from the log.

That makes [CQRS](/06-distributed-systems/distributed-cqrs.md) practically mandatory, and brings
[eventual consistency](/06-distributed-systems/eventual-consistency.md) between write and read.

Event sourcing's specific gain here: a new projection can be built retroactively, over the entire
history. It is the capability that justifies the pattern in many cases.

### Distributed adds coupling

When other services consume the log directly, the event schema becomes a public contract between
services.

That is strong coupling in disguise: changing one service's internal event structure affects everyone
who consumes them.

The alternative that preserves autonomy: keeping the event log **internal** to the service and
publishing integration events — a stable, versioned translation of what the rest needs to know.

That separation between internal events and integration events is the decision that most distinguishes
sustainable implementations from those that get stuck.

### Reprocessing is the superpower and the trap

Rebuilding a projection from scratch fixes projection defects retroactively — which is genuinely
powerful.

The trap: if the replay has a side effect — sending an email, calling an API — the reprocessing
triggers it all again.

Projections have to be pure. Side effects belong somewhere else, with idempotency control.

### The cost of storage and privacy

The log only grows. That is manageable in cost, and problematic in privacy: data protection
regulations require erasing personal data, and the log is immutable.

The solutions — per-subject encryption with key discard, or separating personal data out of the log —
have to be designed from the start. Adding them later is very expensive.

This point disqualifies the adoption of event sourcing in several systems that handle personal data,
and it is rarely raised in adoption discussions.

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

**As an architectural default.** It is specialized, not general.

**When only the current state matters.** The vast majority of cases.

**With no event versioning strategy.** It gets stuck within two years.

**With personal data and no erasure plan.** A regulatory conflict.

**With no prior experience on the team.** The curve is long and the errors are expensive to reverse.

**In CRUD.** Customer registration, catalog, configuration — the log adds nothing and the cost is
full.

**Sharing the internal log between services.** Severe coupling.

## Alternatives

- **An audit table** — it solves most of the history requirement at a fraction of the cost.
- **Temporal versioning** — keeping record versions with validity periods.
- **Database change log** — capturing changes without changing the application's model.
- **Event sourcing only in selected aggregates** — the most common design among successful
  implementations.

The first deserves emphasis: when the requirement is "I want to know who changed what and when", an
audit table delivers that with none of the costs.

## Trade-offs

| Event sourcing | Current state |
|---|---|
| Complete history | Only the present |
| Retroactive projections | Impossible |
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

**Adopting it as a general default.**

**Not separating internal events from integration events.**

**Not planning versioning from the first event.**

**A projection with side effects.**

**Ignoring the erasure requirement.**

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
