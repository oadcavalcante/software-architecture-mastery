---
id: architecture-as-decisions
title: Architecture as a Set of Decisions
sidebar_position: 21
description: What an architecture actually is — and why the record of the reasoning is the part that is lost first.
doc_type: foundation
level: 1
difficulty: intermediate
status: complete
objective: >
  By the end, the reader sees an architecture as a set of reassessable decisions
  and knows what must be recorded for them to stay that way.
prerequisites: [architecture-principles]
related: [architecture-evolution, solution-space]
canonical_for: [architecture as decisions, architectural decision]
translated_from_version: 2
last_reviewed: 2026-08-29
---

# Architecture as a Set of Decisions

## Overview

An architecture is not a structure. It is the set of decisions that produced that
structure, plus the reasons each one was made.

The structure is the observable result. The decisions are what makes it possible
to change it deliberately, and they are what gets lost first.

## The Problem

What gets documented about an architecture is almost always the **what**: the
components, the connections, the technologies. The **why** stays in the head of
whoever decided, and leaves when that person leaves.

The cost shows up when context changes. Someone finds a decision that looks wrong
— a separate service that could be a module, a denormalization that complicates
things, a technology nobody would pick today.

Without the recorded reason, two bad options remain. Keep it out of fear, without
knowing whether the reason still holds. Or reverse it blindly, and rediscover the
original reason through an incident.

The point this document makes: **a decision whose context has been lost stops
being a decision and becomes a constraint.** It can only be obeyed or broken,
never reassessed.

## Core Concepts

### A decision has four parts

What needs to survive time:

**Context** — what was true when the decision was made. Constraints, scale, team
size, deadlines, what was known and what was not. It is the most important part
and the most frequently omitted.

**Decision** — what was chosen.

**Alternatives** — what else was considered, and **under which change of context
each one would start to win**. That condition is what makes future reassessment
cheap.

**Consequences** — what the decision closes, what starts to cost, what is
accepted.

The third and the first carry almost all the value. A document that records only
the second and the fourth describes the structure, not the decision.

### Context is the perishable part

Structure is observable — you read the code. Consequences show up in operations.
Alternatives can be reconstructed with effort.

Context cannot. Nobody can reconstruct, two years later, that the company had six
engineers, that the deadline was regulatory, and that the cloud provider did not
yet offer the managed service that exists today.

That is exactly the information that decides whether the decision still holds.

### Decisions are not deleted; they are superseded

When a decision changes, the old record is neither edited nor removed. It is
marked as superseded, with a link to what replaced it.

The reason: the old decision explains why the system has the shape it has today.
The code that exists was written under it. Deleting it makes the present
inexplicable.

### Not every decision deserves a record

The criterion is the one from
[what architecture is](/01-fundamentals/what-is-software-architecture.md): cost of reversal.

Decisions that are cheap to reverse do not need a record — the code is sufficient
documentation. Expensive ones do, because someone will want to reassess them and
will have no way to.

## Why This Matters

**Because it makes the architecture reassessable rather than merely inherited.**
Old systems accumulate decisions nobody understands. The team either lives with
them or breaks them blindly. With a record, each one can be examined against
today's context.

**Because it transfers knowledge without transferring people.** Asking whoever
was there works while that person is still around and remembers — the record is
what works after that.

**Because it separates "this is wrong" from "this no longer holds".** They are
different things with different answers, and without recorded context there is no
way to tell them apart.

**Because it changes what an architecture review discusses.** Without a record,
reviewing is opining about structure. With one, it is examining whether the
premises still hold — which is a conversation with criteria.

## Common Mistakes

**Documenting the what and not the why.** The central mistake. Impeccable
diagrams, zero reasons.

**Recording the decision without the context.** "We chose PostgreSQL" is not a
record. "We chose PostgreSQL because the team has experience with it, the
projected volume fits in one instance, and we needed transactions across
aggregates" is.

**Omitting alternatives, or listing straw men.** Every recorded alternative needs
the condition under which it would win. Without that, it was not a real
alternative and the record simulates rigour.

**Editing old decisions.** It destroys the history and makes the present
inexplicable.

**Recording everything.** A record costs writing and maintenance. Applied to
trivial decisions, the volume makes nobody read any of them.

**Writing the record after deciding, to justify.** Recognizable because the
context described admits exactly one solution. It is useless for reassessing
anything.

## Real-World Example

A team inherits a system in which the catalogue service keeps a local copy of
supplier data, synchronized by events.

The initial reaction is predictable: duplicated data, synchronization complexity,
risk of divergence. The proposal is to query the supplier service directly.

The record existed, and it contained the context:

> *The supplier service is operated by another business unit, with a 99.5% SLA
> and p99 latency above 2 s. The catalogue has a p99 requirement of 300 ms and
> 99.9% availability. Querying synchronously subordinates the catalogue to the
> supplier's SLA, which is an order of magnitude worse.*
>
> *Alternative discarded: synchronous query with cache. It would start to win if
> the supplier service's SLA rose to 99.9% and its p99 fell below 500 ms.*

The team checked. The SLA was still 99.5%; the p99 had got worse.

The decision was kept, and the verification took twenty minutes.

The counterfactual is what matters: without the record, the team would have made
the change — it is the more obvious and the more defensible one in the abstract —
and discovered the original reason through a catalogue outage caused by the
unavailability of another department's service.

## Related Concepts

- [What Architecture Is](/01-fundamentals/what-is-software-architecture.md) — the criterion for
  which decisions deserve a record.
- [Solution Space](/01-fundamentals/solution-space.md) — where the alternatives come from.
- [ADRs](/18-architecture-decisions/what-is-an-adr.md) — the practical record format.
- [Architecture Evolution](/01-fundamentals/architecture-evolution.md) — what happens when the
  context changes.

## Practical Exercise

Find a structural decision in your system whose reason nobody can explain.

Try to reconstruct the context: when it was made, who was on the team, what
constraints existed, which alternatives there were. Use the git log, old tickets,
conversations.

Two questions at the end: how long did it take? And what could you not
reconstruct?

What cannot be reconstructed is exactly what would have needed to be written
down.

## Interview Questions

- What needs to be recorded about an architectural decision?
- Why is context the most important and most omitted part?
- What do you do when you find a decision that looks wrong and whose reason
  nobody knows?

## Further Exploration

- Nygard, Michael. *Documenting Architecture Decisions*, 2011.
- Fowler, Martin. *Who Needs an Architect?* IEEE Software, 2003.
